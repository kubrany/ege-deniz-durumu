// Ege Kıyıları Deniz Durumu - Adım 1: 4 kıyı noktası, durumlar, son veriyle açılma
// Veri kaynağı: Open-Meteo Marine API + Forecast API (https://open-meteo.com)

const NOKTALAR = [
  { ad: "Ayvalık", lat: 39.31, lon: 26.64 },
  { ad: "Foça", lat: 38.65, lon: 26.65 },
  { ad: "Çeşme", lat: 38.32, lon: 26.2 },
  { ad: "Alaçatı", lat: 38.25, lon: 26.33 },
];

const ANAHTAR = "ege-son-veri";
const alan = document.getElementById("veri-alani");
const zaman = document.getElementById("son-guncelleme");

function yukleniyor() {
  alan.innerHTML = `<p role="status">⏳ Veriler yükleniyor…</p>`;
}

function sayi(v, birim, basamak = 1) {
  return v === null || v === undefined ? "veri yok" : `${Number(v).toFixed(basamak)} ${birim}`;
}

function ciz(veri, eski) {
  const uyari = eski
    ? `<p role="alert" style="color:#b00020"><strong>⚠ Canlı veriye ulaşılamadı.</strong> Son başarılı veri gösteriliyor.</p>`
    : "";
  const kartlar = veri.noktalar
    .map(
      (n) => `
      <article class="kart">
        <h3>${n.ad}</h3>
        <p><strong>Dalga yüksekliği:</strong> ${sayi(n.dalga, "m", 2)}</p>
        <p><strong>Dalga yönü:</strong> ${sayi(n.yon, "°", 0)}</p>
        <p><strong>Dalga periyodu:</strong> ${sayi(n.periyot, "s", 1)}</p>
        <p><strong>Rüzgâr:</strong> ${sayi(n.ruzgar, "kn", 0)}, ${sayi(n.ruzgarYon, "°", 0)}</p>
      </article>`
    )
    .join("");
  alan.innerHTML =
    uyari +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">${kartlar}</div>
     <p>Kaynak: <a href="https://open-meteo.com/en/docs/marine-weather-api">Open-Meteo Marine API</a></p>`;
  zaman.innerText =
    new Date(veri.veriZamani).toLocaleString("tr-TR") + (eski ? " (son başarılı veri)" : "");
}

async function verileriCek() {
  const lat = NOKTALAR.map((n) => n.lat).join(",");
  const lon = NOKTALAR.map((n) => n.lon).join(",");
  const [marine, ruzgar] = await Promise.all([
    fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period`
    ).then((r) => {
      if (!r.ok) throw new Error("Marine API " + r.status);
      return r.json();
    }),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kn`
    ).then((r) => {
      if (!r.ok) throw new Error("Forecast API " + r.status);
      return r.json();
    }),
  ]);
  const m = Array.isArray(marine) ? marine : [marine];
  const w = Array.isArray(ruzgar) ? ruzgar : [ruzgar];
  return {
    veriZamani: new Date(m[0].current.time + "Z").toISOString(),
    noktalar: NOKTALAR.map((n, i) => ({
      ad: n.ad,
      dalga: m[i].current.wave_height,
      yon: m[i].current.wave_direction,
      periyot: m[i].current.wave_period,
      ruzgar: w[i].current.wind_speed_10m,
      ruzgarYon: w[i].current.wind_direction_10m,
    })),
  };
}

async function baslat() {
  yukleniyor();
  try {
    const veri = await verileriCek();
    try {
      localStorage.setItem(ANAHTAR, JSON.stringify(veri));
    } catch (e) {}
    ciz(veri, false);
  } catch (hata) {
    console.error("Veri çekme hatası:", hata);
    let eskiVeri = null;
    try {
      eskiVeri = JSON.parse(localStorage.getItem(ANAHTAR));
    } catch (e) {}
    if (eskiVeri) {
      ciz(eskiVeri, true);
    } else {
      alan.innerHTML = `<p role="alert" style="color:#b00020">⚠ Veri yüklenemedi ve kayıtlı eski veri yok. Lütfen daha sonra tekrar deneyin.</p>`;
    }
  }
}

baslat();
