import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Check, X, Loader2 } from 'lucide-react';

/**
 * Editor crop interaktif — dipakai untuk foto profil (1:1) dan banner (16:9).
 *
 * MODEL GEOMETRI (satu sumber kebenaran):
 *   - `frame`  : kotak crop di layar, rasio tetap, dipusatkan di viewport.
 *   - `scale`  : piksel layar per piksel gambar = baseScale * zoom.
 *   - `offset` : pergeseran gambar dari posisi tengah, dalam piksel layar.
 *
 * Posisi gambar di layar relatif terhadap frame:
 *   left = frame.w/2 - (naturalW*scale)/2 + offset.x
 *   top  = frame.h/2 - (naturalH*scale)/2 + offset.y
 *
 * Agar frame selalu tertutup penuh, offset dibatasi:
 *   |offset.x| <= max(0, (naturalW*scale - frame.w)/2)
 *   |offset.y| <= max(0, (naturalH*scale - frame.h)/2)
 *
 * Semua perhitungan memakai satu ref geometri (`geoRef`) yang selalu berisi
 * nilai render terakhir, supaya handler drag/zoom tidak pernah memakai angka
 * basi dari closure.
 */

export type CropAspect = 'avatar' | 'cover';

interface CropModalProps {
  /** File yang dipilih user. */
  file: File;
  kind: CropAspect;
  /** Simpan hasil crop (data URL siap dikirim ke server). */
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
  /** Dipanggil saat crop & encode sedang berjalan. */
  busy?: boolean;
}

interface Size {
  w: number;
  h: number;
}

interface Geo {
  frame: Size;
  natural: Size;
  baseScale: number;
  zoom: number;
  scale: number;
  offset: { x: number; y: number };
}

const TARGET_WIDTH: Record<CropAspect, number> = {
  avatar: 640,
  cover: 1920,
};

const ASPECT: Record<CropAspect, number> = {
  avatar: 1,
  cover: 16 / 9,
};

const LABEL: Record<CropAspect, { title: string; hint: string }> = {
  avatar: {
    title: 'Atur Foto Profil',
    hint: 'Geser gambar untuk memilih bagian yang pas di frame persegi.',
  },
  cover: {
    title: 'Atur Banner',
    hint: 'Geser gambar untuk memilih bagian yang pas di frame 16:9.',
  },
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function clampOffsetTo(o: { x: number; y: number }, frame: Size, scale: number, natural: Size) {
  const limitX = Math.max(0, (natural.w * scale - frame.w) / 2);
  const limitY = Math.max(0, (natural.h * scale - frame.h) / 2);
  return {
    x: Math.min(limitX, Math.max(-limitX, o.x)),
    y: Math.min(limitY, Math.max(-limitY, o.y)),
  };
}

export const CropModal: React.FC<CropModalProps> = ({
  file,
  kind,
  onConfirm,
  onCancel,
  busy = false,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Size>({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [encoding, setEncoding] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);

  const aspect = ASPECT[kind];

  // ---- Geometri turunan (satu tempat) ------------------------------------
  const frame: Size = (() => {
    if (!viewport.w || !viewport.h) return { w: 0, h: 0 };
    const w = Math.min(viewport.w, viewport.h * aspect);
    return { w, h: w / aspect };
  })();

  const natural: Size = image
    ? { w: image.naturalWidth, h: image.naturalHeight }
    : { w: 0, h: 0 };

  const baseScale = natural.w && frame.w ? Math.max(frame.w / natural.w, frame.h / natural.h) : 1;
  const scale = baseScale * zoom;

  // Ref yang selalu berisi nilai render terakhir.
  const geoRef = useRef<Geo>({ frame, natural, baseScale, zoom, scale, offset });
  geoRef.current = { frame, natural, baseScale, zoom, scale, offset };

  /** Terapkan zoom baru + clamp offset terhadap geometri yang baru. */
  const commitZoom = useCallback((nextZoom: number, baseOffset?: { x: number; y: number }) => {
    const g = geoRef.current;
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    const nextScale = g.baseScale * z;
    const nextOffset = clampOffsetTo(baseOffset ?? g.offset, g.frame, nextScale, g.natural);
    setZoom(z);
    setOffset(nextOffset);
    // Sinkronkan ref segera agar drag berikutnya tidak memakai nilai lama.
    geoRef.current = { ...g, zoom: z, scale: nextScale, offset: nextOffset };
  }, []);

  // ---- Muat file menjadi <img> -------------------------------------------
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    setImage(null);
    setLoadError(null);
    img.onload = () => setImage(img);
    img.onerror = () => setLoadError('Gambar tidak bisa dibaca. Coba format JPG, PNG, atau WEBP.');
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ---- Ukur viewport ------------------------------------------------------
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const next = { w: el.clientWidth, h: el.clientHeight };
      setViewport((prev) => (prev.w === next.w && prev.h === next.h ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset posisi saat gambar baru dimuat.
  useEffect(() => {
    if (!image) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [image]);

  // Kalau frame berubah ukuran (resize jendela), offset lama bisa keluar batas.
  useEffect(() => {
    const g = geoRef.current;
    if (!g.natural.w || !g.frame.w) return;
    setOffset((prev) => clampOffsetTo(prev, g.frame, g.scale, g.natural));
  }, [frame.w, frame.h]);

  // ---- Drag ---------------------------------------------------------------
  const updateDrag = useCallback((clientX: number, clientY: number) => {
    const drag = dragRef.current;
    if (!drag) return;
    const g = geoRef.current;
    const raw = {
      x: drag.originX + (clientX - drag.startX),
      y: drag.originY + (clientY - drag.startY),
    };
    const next = clampOffsetTo(raw, g.frame, g.scale, g.natural);
    g.offset = next; // agar pointermove berikutnya memakai nilai terkini
    setOffset(next);
  }, []);

  // Fallback: tangkap pointer di window selama drag (WebView / pointer keluar).
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => updateDrag(e.clientX, e.clientY);
    const up = () => {
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, updateDrag]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!image || e.button === 1 || e.button === 2) return;
    if (pinchRef.current) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Opsional — listener window tetap menangani drag.
    }
    const g = geoRef.current;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: g.offset.x,
      originY: g.offset.y,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    updateDrag(e.clientX, e.clientY);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  // ---- Zoom dengan scroll / pinch ----------------------------------------
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!image) return;
    e.preventDefault();
    commitZoom(geoRef.current.zoom * (e.deltaY < 0 ? 1.08 : 0.92));
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 2) return;
    const [a, b] = [e.touches[0], e.touches[1]];
    pinchRef.current = {
      distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
      zoom: geoRef.current.zoom,
    };
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const pinch = pinchRef.current;
    if (!pinch || e.touches.length !== 2 || !pinch.distance) return;
    const [a, b] = [e.touches[0], e.touches[1]];
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    commitZoom(pinch.zoom * (distance / pinch.distance));
  };

  const onTouchEnd = () => {
    pinchRef.current = null;
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // ---- Export -------------------------------------------------------------
  const handleConfirm = () => {
    const g = geoRef.current;
    if (!image || !g.frame.w) return;
    setEncoding(true);
    // setTimeout (bukan requestAnimationFrame) supaya spinner sempat tampil
    // dan tetap jalan walau tab sedang tidak aktif.
    window.setTimeout(() => {
      try {
        const targetW = TARGET_WIDTH[kind];
        const targetH = Math.round(targetW / aspect);

        // Frame dalam ruang piksel gambar asli.
        const cropW = Math.min(g.natural.w, g.frame.w / g.scale);
        const cropH = Math.min(g.natural.h, g.frame.h / g.scale);

        // Titik tengah frame, dalam koordinat gambar.
        const centerX = g.natural.w / 2 - g.offset.x / g.scale;
        const centerY = g.natural.h / 2 - g.offset.y / g.scale;

        const cropX = Math.min(Math.max(0, centerX - cropW / 2), g.natural.w - cropW);
        const cropY = Math.min(Math.max(0, centerY - cropH / 2), g.natural.h - cropH);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas tidak tersedia.');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

        onConfirm(canvas.toDataURL('image/webp', 0.88));
      } catch (err) {
        // Tanpa ini tombol bisa berhenti di "Memproses…" tanpa penjelasan.
        console.error('[CropModal] gagal memproses gambar', err);
      } finally {
        setEncoding(false);
      }
    }, 0);
  };

  const disabled = !image || busy || encoding;
  const zoomPercent = Math.round(zoom * 100);

  // Posisi gambar relatif ke frame (container berukuran frame).
  const imgLeft = frame.w / 2 - (natural.w * scale) / 2 + offset.x;
  const imgTop = frame.h / 2 - (natural.h * scale) / 2 + offset.y;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={LABEL[kind].title}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
      tabIndex={-1}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-kiri-dark-900 border border-kiri-dark-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-kiri-dark-700">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">{LABEL[kind].title}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{LABEL[kind].hint}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy || encoding}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport */}
        <div className="p-4 sm:p-5">
          <div
            ref={viewportRef}
            className="relative w-full bg-black/60 rounded-xl overflow-hidden select-none touch-none"
            style={{ aspectRatio: `${aspect}`, maxHeight: '52vh' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {loadError ? (
              <div className="absolute inset-0 flex items-center justify-center text-center px-6 text-xs text-red-300">
                {loadError}
              </div>
            ) : !image ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Stage berukuran frame: semua koordinat gambar relatif ke sini */}
                <div className="relative" style={{ width: frame.w, height: frame.h }}>
                  <img
                    src={image.src}
                    alt="Pratinjau"
                    draggable={false}
                    data-crop-image
                    className={`max-w-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{
                      position: 'absolute',
                      width: natural.w * scale,
                      height: natural.h * scale,
                      left: imgLeft,
                      top: imgTop,
                    }}
                  />

                  {/* Garis bantu + handle sudut */}
                  <div
                    data-crop-frame
                    className="pointer-events-none absolute left-0 top-0 border border-white/90"
                    style={{ width: frame.w, height: frame.h }}
                  >
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-white/20" />
                      ))}
                    </div>
                    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos) => (
                      <span
                        key={pos}
                        className={`absolute ${pos} w-3 h-3 -m-1.5 border-2 border-white`}
                        style={{ borderRightWidth: 0, borderBottomWidth: 0 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Kontrol zoom */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => commitZoom(geoRef.current.zoom - 0.15)}
              disabled={disabled || zoom <= MIN_ZOOM}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40"
              aria-label="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min={MIN_ZOOM * 100}
              max={MAX_ZOOM * 100}
              step={5}
              value={zoomPercent}
              onChange={(e) => commitZoom(Number(e.target.value) / 100)}
              disabled={disabled}
              className="flex-1 accent-emerald-500"
              aria-label="Zoom"
            />

            <button
              type="button"
              onClick={() => commitZoom(geoRef.current.zoom + 0.15)}
              disabled={disabled || zoom >= MAX_ZOOM}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40"
              aria-label="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <span className="w-12 text-right text-[11px] font-mono text-gray-400">{zoomPercent}%</span>

            <button
              type="button"
              onClick={reset}
              disabled={disabled}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40"
              aria-label="Reset posisi"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
            <Move className="w-3 h-3" />
            <span>Taruh kursor di gambar lalu geser · scroll atau pinch untuk zoom</span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-end gap-2 px-5 py-4 border-t border-kiri-dark-700 bg-kiri-dark-900">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy || encoding}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/10 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={disabled}
            className="px-5 py-2 rounded-xl bg-kiri-gold-500 text-kiri-dark-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
          >
            {busy || encoding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{busy || encoding ? 'Memproses…' : 'Gunakan Foto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
