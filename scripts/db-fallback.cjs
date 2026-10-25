#!/usr/bin/env node
/**
 * db-fallback.cjs — logical dump/restore untuk DB KIRI (Neon).
 * Dijalankan di dalam image kiri (punya modul `pg`).
 *
 *   node db-fallback.cjs dump    /backup/db.json.gz
 *   node db-fallback.cjs restore /backup/db.json.gz
 *   node db-fallback.cjs verify  /backup/db.json.gz
 *
 * Dump = JSON per tabel (bukan pg_dump). Restore = TRUNCATE lalu INSERT di
 * dalam satu transaksi, dengan session_replication_role=replica supaya FK
 * tidak menghalangi urutan tabel.
 */
const fs = require('fs');
const zlib = require('zlib');
const { Client } = require('pg');

const [, , cmd, file] = process.argv;

function conn() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL kosong');
  const ssl = /neon\.tech|sslmode=require/.test(url) ? { rejectUnauthorized: false } : false;
  return new Client({ connectionString: url, ssl });
}

async function tables(c) {
  const r = await c.query(
    `select table_name from information_schema.tables
     where table_schema='public' and table_type='BASE TABLE' order by table_name`
  );
  return r.rows.map((x) => x.table_name);
}

async function columns(c, t) {
  const r = await c.query(
    `select column_name, data_type from information_schema.columns
     where table_schema='public' and table_name=$1 order by ordinal_position`,
    [t]
  );
  return r.rows;
}

async function dump(out) {
  const c = conn();
  await c.connect();
  const data = { meta: { createdAt: new Date().toISOString(), db: 'kiri', version: 1 }, tables: {}, sequences: {} };
  for (const t of await tables(c)) {
    const rows = (await c.query(`select * from "${t}"`)).rows;
    data.tables[t] = { columns: await columns(c, t), rows };
    process.stdout.write(`  ${t}: ${rows.length} baris\n`);
  }
  const seq = await c.query(
    `select sequencename, last_value, coalesce(increment_by,1) as inc from pg_sequences where schemaname='public'`
  );
  seq.rows.forEach((s) => (data.sequences[s.sequencename] = s.last_value));

  const raw = JSON.stringify(data);
  fs.writeFileSync(out, zlib.gzipSync(Buffer.from(raw, 'utf8'), { level: 9 }));
  await c.end();
  return { bytesRaw: raw.length, bytesGz: fs.statSync(out).size, tables: Object.keys(data.tables).length };
}

/** Urutan aman insert: induk (yang direferensikan) lebih dulu. */
async function insertOrder(c, tableNames) {
  const r = await c.query(
    `select tc.table_name as child, ccu.table_name as parent
       from information_schema.table_constraints tc
       join information_schema.constraint_column_usage ccu
         on ccu.constraint_name = tc.constraint_name
        and ccu.table_schema = tc.table_schema
      where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'`
  );
  const deps = new Map(tableNames.map((t) => [t, new Set()]));
  for (const { child, parent } of r.rows) {
    if (child !== parent && deps.has(child) && deps.has(parent)) deps.get(child).add(parent);
  }
  const order = [];
  const done = new Set();
  while (order.length < tableNames.length) {
    const ready = [...deps.keys()].filter((t) => !done.has(t) && [...deps.get(t)].every((p) => done.has(p)));
    if (!ready.length) { // siklus FK — sisanya taruh apa adanya, insert bisa gagal lalu rollback
      tableNames.filter((t) => !done.has(t)).forEach((t) => { order.push(t); done.add(t); });
      break;
    }
    ready.forEach((t) => { order.push(t); done.add(t); });
  }
  return order;
}

async function restore(inFile) {
  const data = JSON.parse(zlib.gunzipSync(fs.readFileSync(inFile)).toString('utf8'));
  const names = Object.keys(data.tables);
  const c = conn();
  await c.connect();
  await c.query('begin');
  try {
    // Satu TRUNCATE untuk semua tabel sekaligus: FK antar-tabel tidak jadi masalah,
    // dan tidak butuh superuser (session_replication_role ditolak Neon).
    await c.query(`truncate table ${names.map((t) => `"${t}"`).join(', ')} cascade`);
    for (const t of await insertOrder(c, names)) {
      const rows = data.tables[t].rows;
      if (!rows.length) continue;
      const cols = Object.keys(rows[0]);
      const colList = cols.map((x) => `"${x}"`).join(',');
      const chunk = 500;
      for (let i = 0; i < rows.length; i += chunk) {
        const part = rows.slice(i, i + chunk);
        const vals = [];
        const holders = part.map((row, ri) => {
          const ph = cols.map((col, ci) => {
            vals.push(row[col]);
            return `$${ri * cols.length + ci + 1}`;
          });
          return `(${ph.join(',')})`;
        });
        await c.query(`insert into "${t}" (${colList}) values ${holders.join(',')}`, vals);
      }
      process.stdout.write(`  ${t}: ${rows.length} baris dipulihkan\n`);
    }
    for (const [name, last] of Object.entries(data.sequences || {})) {
      if (last == null) continue;
      await c.query(`select setval('"${name}"', $1, true)`, [last]).catch(() => {});
    }
    await c.query('commit');
  } catch (e) {
    await c.query('rollback');
    throw e;
  }
  await c.end();
  return { restoredTables: Object.keys(data.tables).length };
}

async function verify(inFile) {
  const data = JSON.parse(zlib.gunzipSync(fs.readFileSync(inFile)).toString('utf8'));
  const c = conn();
  await c.connect();
  const report = [];
  let ok = true;
  for (const [t, v] of Object.entries(data.tables)) {
    const r = await c.query(`select count(*)::int n from "${t}"`).catch(() => ({ rows: [{ n: -1 }] }));
    const match = r.rows[0].n === v.rows.length;
    if (!match) ok = false;
    report.push({ table: t, backup: v.rows.length, live: r.rows[0].n, match });
  }
  await c.end();
  return { ok, report };
}

(async () => {
  if (!cmd || !file) {
    console.error('pakai: node db-fallback.cjs <dump|restore|verify> <file>');
    process.exit(2);
  }
  const out = cmd === 'dump' ? await dump(file) : cmd === 'restore' ? await restore(file) : await verify(file);
  console.log(JSON.stringify(out));
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
