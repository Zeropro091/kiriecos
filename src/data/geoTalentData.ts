import masterGeoCreators from './masterGeoCreators.json';
// Integrated Creator Geo Data for KIRI Project Ecosystem Map
export type CreatorGeoData = {
  name: string;
  domicile: string;
  social: string | null;
  niche: string | null;
  followers: string | number | null;
  portfolio: string | number | null;
  profilePic: string | null;
  whatsapp: string | null;
};

export type CityGeoData = {
  name: string;
  creators: CreatorGeoData[];
};

export type ProvinceGeoData = {
  id: string; // Identifier matching GeoJSON map properties: 'Propinsi'
  name: string;
  cities: CityGeoData[];
  coordinates: [number, number]; // [lng, lat]
};

const baseSampleCreators = [
  {
    "Nama Lengkap": "Derini",
    "Domisili (Kota dan Provinsi)": "Sumedang Jawa Barat ",
    "Username Instagram atau TikTok": "Tiktok Derini.space",
    "Niche atau Kategori Utama": "Lifestyle",
    "Jumlah Followers per Platform": 10100.0,
    "Kontak WhatsApp": "0857****527",
    "Link Portofolio": null,
    "Upload Foto Profil": "https://drive.google.com/open?id=1AhVjZ4Xdf3wHAJrZE2YaAPhu35Zmmm6c"
  },
  {
    "Nama Lengkap": "Siti Maemunah",
    "Domisili (Kota dan Provinsi)": "Palu",
    "Username Instagram atau TikTok": "Sitimae02 / Hanummm10 ",
    "Niche atau Kategori Utama": "Travel",
    "Jumlah Followers per Platform": "710/2990",
    "Kontak WhatsApp": "0896****122",
    "Link Portofolio": null,
    "Upload Foto Profil": "https://drive.google.com/open?id=1_Ka2_GQNAyUSuHUdlW9gPGSTIDW5YF86"
  },
  {
    "Nama Lengkap": "Neni Nurlaela",
    "Domisili (Kota dan Provinsi)": "Subang Jawa barat",
    "Username Instagram atau TikTok": "Neninurlaela_penuhkasih/keylanatasya47",
    "Niche atau Kategori Utama": "Lainnya",
    "Jumlah Followers per Platform": "Tiktok 1134, ig 904",
    "Kontak WhatsApp": "0812****004",
    "Link Portofolio": null,
    "Upload Foto Profil": "https://drive.google.com/open?id=1Ihr43dxixDzkhnrVLxxk-4W-_Z68UALJ"
  },
  {
    "Nama Lengkap": "Alya Putri Kuswandi",
    "Domisili (Kota dan Provinsi)": "Bandung ",
    "Username Instagram atau TikTok": "Alyaaptr28_",
    "Niche atau Kategori Utama": "Fashion & Beauty",
    "Jumlah Followers per Platform": 11700.0,
    "Kontak WhatsApp": "0882****419",
    "Link Portofolio": "https://www.instagram.com/alyaaptr28_",
    "Upload Foto Profil": "https://drive.google.com/open?id=1PM73fLvUojhBeDreTqTpv4PxIbM5pH8l"
  },
  {
    "Nama Lengkap": "Ratu Asti",
    "Domisili (Kota dan Provinsi)": "Garut jawa barat",
    "Username Instagram atau TikTok": "Queenpranata",
    "Niche atau Kategori Utama": "Kuliner",
    "Jumlah Followers per Platform": 2080.0,
    "Kontak WhatsApp": "0852****226",
    "Link Portofolio": null,
    "Upload Foto Profil": "https://drive.google.com/open?id=1apPW-qsd5lB8Ue8BD7Zvd3pkZSnUh0Bj"
  },
  {
    "Nama Lengkap": "Ara Tiara",
    "Domisili (Kota dan Provinsi)": "Bandung Jawa Barat",
    "Username Instagram atau TikTok": "@araaa_sun / @araaasun_",
    "Niche atau Kategori Utama": "Lifestyle",
    "Jumlah Followers per Platform": "IG : 25000 / TT : 4200",
    "Kontak WhatsApp": "0881****050",
    "Link Portofolio": null,
    "Upload Foto Profil": null
  },
  {
    "Nama Lengkap": "Fikri Maulana",
    "Domisili (Kota dan Provinsi)": "Tuban Jawa Timur",
    "Username Instagram atau TikTok": "@fikrimaulana",
    "Niche atau Kategori Utama": "Visual Art & Video",
    "Jumlah Followers per Platform": 8500.0,
    "Kontak WhatsApp": "0812****432",
    "Link Portofolio": "https://instagram.com",
    "Upload Foto Profil": null
  },
  {
    "Nama Lengkap": "Ni Putu Saraswati",
    "Domisili (Kota dan Provinsi)": "Denpasar Bali",
    "Username Instagram atau TikTok": "@saraswati_bali",
    "Niche atau Kategori Utama": "Heritage & Culture",
    "Jumlah Followers per Platform": 34000.0,
    "Kontak WhatsApp": "0819****456",
    "Link Portofolio": "https://kiri.id",
    "Upload Foto Profil": null
  },
  {
    "Nama Lengkap": "Raka Dewantara",
    "Domisili (Kota dan Provinsi)": "Ubud Bali",
    "Username Instagram atau TikTok": "@rakadewantara",
    "Niche atau Kategori Utama": "Visual Art & Video",
    "Jumlah Followers per Platform": 58000.0,
    "Kontak WhatsApp": "0812****890",
    "Link Portofolio": "https://kiri.id/raka",
    "Upload Foto Profil": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  {
    "Nama Lengkap": "Ricca Anggraeni",
    "Domisili (Kota dan Provinsi)": "Bekasi Jawa Barat",
    "Username Instagram atau TikTok": "anggraeniricca",
    "Niche atau Kategori Utama": "Lifestyle",
    "Jumlah Followers per Platform": 12530.0,
    "Kontak WhatsApp": "0857****900",
    "Link Portofolio": "https://www.instagram.com/reel/DaVTMTHBuXY/",
    "Upload Foto Profil": "https://drive.google.com/open?id=19EAHRloKblcdKl8MJ6-r3sBRmMFxtu0j"
  },
  {
    "Nama Lengkap": "Mia Arkania",
    "Domisili (Kota dan Provinsi)": "Depok",
    "Username Instagram atau TikTok": "mia_arkania",
    "Niche atau Kategori Utama": "Kuliner",
    "Jumlah Followers per Platform": "TikTok: 2366, IG: 3235",
    "Kontak WhatsApp": "0852****072",
    "Link Portofolio": "https://mywebmia.my.canva.site/eats-escapes",
    "Upload Foto Profil": null
  },
  {
    "Nama Lengkap": "Satria Wiguna",
    "Domisili (Kota dan Provinsi)": "Canggu Bali",
    "Username Instagram atau TikTok": "@satria_motion",
    "Niche atau Kategori Utama": "Visual Art & Video",
    "Jumlah Followers per Platform": 18200.0,
    "Kontak WhatsApp": "0878****109",
    "Link Portofolio": "https://behance.net",
    "Upload Foto Profil": null
  },
  {
    "Nama Lengkap": "Bintang Pamungkas",
    "Domisili (Kota dan Provinsi)": "DKI Jakarta",
    "Username Instagram atau TikTok": "@bintang_visual",
    "Niche atau Kategori Utama": "Brand & Advertising",
    "Jumlah Followers per Platform": 42000.0,
    "Kontak WhatsApp": "0811****543",
    "Link Portofolio": null,
    "Upload Foto Profil": null
  },
  {
    "Nama Lengkap": "Dimas Prasetyo",
    "Domisili (Kota dan Provinsi)": "Jember Jawa Timur",
    "Username Instagram atau TikTok": "@dimas_cinematic",
    "Niche atau Kategori Utama": "Visual Art & Video",
    "Jumlah Followers per Platform": 9400.0,
    "Kontak WhatsApp": "0856****678",
    "Link Portofolio": null,
    "Upload Foto Profil": null
  },
  {
    "Nama Lengkap": "Gita Larasati",
    "Domisili (Kota dan Provinsi)": "Pamulang Tangerang Selatan Banten",
    "Username Instagram atau TikTok": "@gitalaras_",
    "Niche atau Kategori Utama": "Lifestyle",
    "Jumlah Followers per Platform": 14200.0,
    "Kontak WhatsApp": "0899****678",
    "Link Portofolio": null,
    "Upload Foto Profil": null
  }
];

const rawCreators = [...baseSampleCreators, ...masterGeoCreators];

// S14: numbers are masked at the source (see scripts/maskGeoPhoneSource.mjs);
// this guard only masks anything raw that slips through from older bundles.
export const maskWhatsApp = (val: string | number | null | undefined): string | null => {
  if (!val) return null;
  const raw = String(val);
  if (raw.includes('****')) return raw;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8) return '0****' + digits.slice(-3);
  return digits.slice(0, 4) + '****' + digits.slice(-3);
};

export const parseFollowers = (val: string | number | null): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const str = val.toString().toLowerCase();

  let max = 0;
  const regex = /([\d.,]+)\s*(k|rb|ribu|m|jt|juta)?/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    let numStr = match[1];
    const multiplierStr = match[2];

    let multiplier = 1;
    if (multiplierStr) {
      if (['k', 'rb', 'ribu'].includes(multiplierStr)) multiplier = 1000;
      if (['m', 'jt', 'juta'].includes(multiplierStr)) multiplier = 1000000;
    }

    if (multiplier === 1 && numStr.includes('.')) {
      if (/\.\d{3}/.test(numStr)) {
        numStr = numStr.replace(/\./g, '');
      }
    }
    numStr = numStr.replace(/,/g, '.');

    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      const calculated = num * multiplier;
      if (calculated > max) max = calculated;
    }
  }
  return max;
};

export const geoNiches = [
  'Semua Niche',
  'Visual Art & Video',
  'Lifestyle',
  'Kuliner',
  'Travel',
  'Fashion & Beauty',
  'Heritage & Culture',
  'Brand & Advertising',
  'Lainnya'
];

const getProvinceAndCity = (domicile: string) => {
  const d = domicile.toLowerCase();
  if (d.includes('bali') || d.includes('denpasar') || d.includes('ubud') || d.includes('canggu')) {
    return { prov: 'BALI', city: d.includes('ubud') ? 'Ubud (Gianyar)' : d.includes('canggu') ? 'Canggu (Badung)' : 'Kota Denpasar' };
  }
  if (d.includes('palu') || d.includes('sulawesi')) return { prov: 'SULAWESI TENGAH', city: 'Kota Palu' };
  if (d.includes('pamulang') || d.includes('banten') || d.includes('tangerang')) return { prov: 'PROBANTEN', city: 'Tangerang Selatan / Pamulang' };
  if (d.includes('jember')) return { prov: 'JAWA TIMUR', city: 'Kabupaten Jember' };
  if (d.includes('tuban')) return { prov: 'JAWA TIMUR', city: 'Kabupaten Tuban' };
  if (d.includes('surabaya') || d.includes('malang')) return { prov: 'JAWA TIMUR', city: 'Surabaya / Malang' };
  if (d.includes('jakarta')) return { prov: 'DKI JAKARTA', city: 'DKI Jakarta Hub' };
  if (d.includes('sumedang')) return { prov: 'JAWA BARAT', city: 'Kabupaten Sumedang' };
  if (d.includes('subang')) return { prov: 'JAWA BARAT', city: 'Kabupaten Subang' };
  if (d.includes('garut')) return { prov: 'JAWA BARAT', city: 'Kabupaten Garut' };
  if (d.includes('bekasi')) return { prov: 'JAWA BARAT', city: 'Kota Bekasi' };
  if (d.includes('ciamis')) return { prov: 'JAWA BARAT', city: 'Kabupaten Ciamis' };
  if (d.includes('bogor')) return { prov: 'JAWA BARAT', city: 'Kabupaten Bogor' };
  if (d.includes('cimahi')) return { prov: 'JAWA BARAT', city: 'Kota Cimahi' };
  if (d.includes('depok')) return { prov: 'JAWA BARAT', city: 'Kota Depok' };
  if (d.includes('bandung')) return { prov: 'JAWA BARAT', city: 'Kota Bandung' };

  return { prov: 'JAWA BARAT', city: domicile };
};

export const getFilteredGeoMapData = (nicheFilter: string, minFollowers: number): Record<string, ProvinceGeoData> => {
  const map: Record<string, ProvinceGeoData> = {
    'BALI': {
      id: 'BALI',
      name: 'Bali (HQ Hub)',
      cities: [],
      coordinates: [115.1889, -8.4095]
    },
    'JAWA BARAT': {
      id: 'JAWA BARAT',
      name: 'Jawa Barat',
      cities: [],
      coordinates: [107.6098, -6.9147]
    },
    'DKI JAKARTA': {
      id: 'DKI JAKARTA',
      name: 'DKI Jakarta',
      cities: [],
      coordinates: [106.8229, -6.1944]
    },
    'PROBANTEN': {
      id: 'PROBANTEN',
      name: 'Banten',
      cities: [],
      coordinates: [106.1090, -6.4058]
    },
    'JAWA TIMUR': {
      id: 'JAWA TIMUR',
      name: 'Jawa Timur',
      cities: [],
      coordinates: [112.7320, -7.7956]
    },
    'SULAWESI TENGAH': {
      id: 'SULAWESI TENGAH',
      name: 'Sulawesi Tengah',
      cities: [],
      coordinates: [120.1619, -0.8917]
    }
  };

  rawCreators.forEach((creator) => {
    if (nicheFilter && nicheFilter !== 'Semua Niche' && creator['Niche atau Kategori Utama'] !== nicheFilter) {
      return;
    }
    if (minFollowers > 0) {
      const followers = parseFollowers(creator['Jumlah Followers per Platform']);
      if (followers < minFollowers) return;
    }

    const { prov, city } = getProvinceAndCity(creator['Domisili (Kota dan Provinsi)']);
    const province = map[prov];
    if (province) {
      let cityObj = province.cities.find((c) => c.name === city);
      if (!cityObj) {
        cityObj = { name: city, creators: [] };
        province.cities.push(cityObj);
      }
      cityObj.creators.push({
        name: creator['Nama Lengkap'].trim(),
        domicile: creator['Domisili (Kota dan Provinsi)'].trim(),
        social: creator['Username Instagram atau TikTok']?.trim() || null,
        niche: creator['Niche atau Kategori Utama']?.trim() || null,
        followers: creator['Jumlah Followers per Platform'] || null,
        portfolio: creator['Link Portofolio'] || null,
        profilePic: creator['Upload Foto Profil'] || null,
        whatsapp: maskWhatsApp(creator['Kontak WhatsApp'])
      });
    }
  });

  const filteredMap: Record<string, ProvinceGeoData> = {};
  for (const [key, value] of Object.entries(map)) {
    if (value.cities.length > 0) {
      filteredMap[key] = value;
    }
  }
  return filteredMap;
};
