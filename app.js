// Ege Kıyıları Deniz Durumu - Adım 2: KPI, güvenli aralık, durum, filtre, sıralanabilir tablo
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

let VERI = null;
let siralama = { anahtar: "ad", yon: 1 };

// Küçük stil eklemesi (style.css'e dokunmadan)
const stil = document.createElement("style");
stil.textContent = `
  .kpi-satir{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:16px 0}
  .kpi{border:2px solid #004080;border-radius:8px;padding:12px;background:#fff}
  .kpi small{display:block;color:#333}
  .kpi strong{font-size:1.4rem;color:#004080}
  .kontrol{display:flex;flex-wrap:wrap;gap:16px;align-items:end;margin:12px 0;padding:12px;border:1px solid #999;border-radius:8px}
  .kontrol label{display:flex;flex-direction:column;font-weight:bold;gap:4px}
  .kontrol input,.kontrol select{padding:6px;font-size:1rem}
  table{border-collapse:collapse;width:100%}
  th,td{border:1px solid #999;padding:8px;text-align:left}
  th button{background:none;border:0;font:inherit;font-weight:bold;cursor:pointer;padding:4px}
  :focus-visible{outline:3px solid #ff8c00;outline-offset:2px}
  .durum{font-weight:bold;white-space:nowrap}
`;
document.head.appendChild(stil);

function yukleniyor() {
  alan.innerHTML = `<p role="status">⏳ Veriler yükleniyor…</p>`;
}

function sayi(v, birim, basamak = 1) {
  return v === null || v === undefined ? "veri yok" : `${Number(v).toFixed(basamak)} ${birim}`;
}

function durumHesapla(n, maxD, maxR) {
  if (n.dalga == null || n.ruzgar == null) return { kod: "yok", ikon: "❔", metin: "Veri yok" };
  if (n.dalga <= maxD && n.ruzgar <= maxR) return { kod: "uygun", ikon: "✅", metin: "Uygun" };
  if (n.dalga <= maxD * 1.25 && n.ruzgar <= maxR * 1.25)
    return { kod: "sinirda", ikon: "⚠️", metin: "Sınırda" };
  return { kod: "degil", ikon: "⛔", metin: "Uygun değil" };
}

function guncelle() {
  const maxD = parseFloat(document.getElementById("max-dalga").value) || 0;
  const maxR = parseFloat(document.getElementById("max-ruzgar").value) || 0;
  const filtre = document.getElementById("filtre-durum").value;

  const tum = VERI.noktalar.map((n) => ({ ...n, d: durumHesapla(n, maxD, maxR) }));

  // KPI'lar
  const dalgali = tum.filter((n) => n.dalga != null);
  const ruzgarli = tum.filter((n) => n.ruzgar != null);
  const enSakin = dalgali.length ? dalgali.reduce((a, b) => (a.dalga <= b.dalga ? a : b)) : null;
  const enRuzgarli = ruzgarli.length ? ruzgarli.reduce((a, b) => (a.ruzgar >= b.ruzgar ? a : b)) : null;
  const uygunSayi = tum.filter((n) => n.d.kod === "uygun").length;

  // Filtre ve sıralama
  let satirlar = filtre === "hepsi" ? tum.slice() : tum.filter((n) => n.d.kod === filtre);
  const k = siralama.anahtar;
  satirlar.sort((a, b) => {
    if (k === "ad") return a.ad.localeCompare(b.ad, "tr") * siralama.yon;
    if (k === "durum") return a.d.metin.localeCompare(b.d.metin, "tr") * siralama.yon;
    const x = a[k], y = b[k];
    if (x == null) return 1;
    if (y == null) return -1;
    return (x - y) * siralama.yon;
  });

  const baslik = (anahtar, ad) => {
    const aktif = siralama.anahtar === anahtar;
    const aria = aktif ? (siralama.yon === 1 ? "ascending" : "descending") : "none";
    const ok = aktif ? (siralama.yon === 1 ? " ▲" : " ▼") : "";
    return `<th scope="col" aria-sort="${aria}"><button type="button" data-sirala="${anahtar}">${ad}${ok}</button></th>`;
  };

  const ozet = enSakin
    ? `Şu an ${uygunSayi} / ${tum.length} noktada koşullar seçtiğiniz aralığa uygun; en sakin deniz ${enSakin.ad} (${enSakin.dalga.toFixed(2)} m).`
    : "Dalga verisi alınamadı.";

  document.getElementById("sonuc").innerHTML = `
    <div class="kpi-satir">
      <div class="kpi"><small>Uygun nokta sayısı</small><strong>${uygunSayi} / ${tum.length}</strong></div>
      <div class="kpi"><small>En sakin deniz</small><strong>${enSakin ? enSakin.ad + " · " + enSakin.dalga.toFixed(2) + " m" : "veri yok"}</strong></div>
      <div class="kpi"><small>En güçlü rüzgâr</small><strong>${enRuzgarli ? enRuzgarli.ad + " · " + Math.round(enRuzgarli.ruzgar) + " kn" : "veri yok"}</strong></div>
    </div>
    <p role="status">${ozet}</p>
    ${
      satirlar.length === 0
        ? `<p role="status">🔍 Bu filtreyle eşleşen kıyı noktası yok. Filtreyi "Hepsi" yapmayı deneyin.</p>`
        : `<table>
      <caption>Kıyı noktaları detay tablosu (başlıklara basarak sıralayın)</caption>
      <thead><tr>
        ${baslik("ad", "Nokta")}${baslik("dalga", "Dalga (m)")}${baslik("periyot", "Periyot (s)")}${baslik("yon", "Dalga yönü (°)")}${baslik("ruzgar", "Rüzgâr (kn)")}${baslik("durum", "Durum")}
      </tr></thead>
      <tbody>
      ${satirlar
        .map(
          (n) => `<tr>
        <th scope="row">${n.ad}</th>
        <td>${sayi(n.dalga, "", 2)}</td><td>${sayi(n.periyot, "", 1)}</td><td>${sayi(n.yon, "", 0)}</td><td>${sayi(n.ruzgar, "", 0)}</td>
        <td class="durum">${n.d.ikon} ${n.d.metin}</td></tr>`
        )
        .join("")}
      </tbody></table>`
    }`;
  document.getElementById("sonuc").insertAdjacentHTML("beforeend", takvimHtml(tum, maxD, maxR));
}

// 7 günlük uygun pencere takvimi: her gün 09:00-18:00 arası uygun saat sayısı
function takvimHtml(tum, maxD, maxR) {
  const ilk = tum.find((n) => n.saatlik && n.saatlik.zaman);
  if (!ilk) return `<p role="status">Saatlik tahmin verisi yok; takvim gösterilemiyor.</p>`;
  const tarihler = [...new Set(ilk.saatlik.zaman.map((t) => t.slice(0, 10)))].slice(0, 7);
  let en = null;
  const satirlar = tum.map((n) => {
    const hucreler = tarihler.map((t) => {
      let top = 0, ok = 0;
      if (n.saatlik) {
        n.saatlik.zaman.forEach((z, i) => {
          if (z.slice(0, 10) !== t) return;
          const s = parseInt(z.slice(11, 13), 10);
          if (s < 9 || s > 17) return;
          const d = n.saatlik.dalga[i], r = n.saatlik.ruzgar[i];
          if (d == null || r == null) return;
          top++;
          if (d <= maxD && r <= maxR) ok++;
        });
      }
      if (top === 0) return `<td>❔ Veri yok</td>`;
      if (!en || ok > en.ok) en = { ok, top, ad: n.ad, gun: t };
      const oran = ok / top;
      const durum = oran >= 0.75 ? "✅ Uygun" : oran >= 0.4 ? "⚠️ Kısmen" : "⛔ Uygun değil";
      return `<td class="durum">${durum}<br><small>${ok}/${top} saat</small></td>`;
    });
    return `<tr><th scope="row">${n.ad}</th>${hucreler.join("")}</tr>`;
  });
  const gunAd = (t) =>
    new Date(t + "T12:00:00").toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "numeric" });
  const ozet = en && en.ok > 0
    ? `En uygun gün: ${gunAd(en.gun)}, ${en.ad} (09:00-18:00 arasında ${en.ok}/${en.top} saat güvenli aralıkta).`
    : `Seçilen güvenli aralıkta önümüzdeki 7 günde uygun saat bulunamadı.`;
  return `<h2>7 günlük uygun pencere takvimi</h2>
    <p role="status">${ozet}</p>
    <div style="overflow-x:auto"><table>
      <caption>Ders saatlerinde (09:00-18:00) güvenli aralıkta kalan saat sayısı</caption>
      <thead><tr><th scope="col">Nokta</th>${tarihler.map((t) => `<th scope="col">${gunAd(t)}</th>`).join("")}</tr></thead>
      <tbody>${satirlar.join("")}</tbody></table></div>`;
}

function ciz(veri, eski) {
  VERI = veri;
  const uyari = eski
    ? `<p role="alert" style="color:#b00020"><strong>⚠ Canlı veriye ulaşılamadı.</strong> Son başarılı veri gösteriliyor.</p>`
    : "";
  alan.innerHTML =
    uyari +
    `<form class="kontrol" onsubmit="return false" aria-label="Güvenli aralık ve filtre">
      <label>Güvenli en yüksek dalga (m)
        <input id="max-dalga" type="number" min="0" step="0.1" value="1.0"></label>
      <label>Güvenli en yüksek rüzgâr (kn)
        <input id="max-ruzgar" type="number" min="0" step="1" value="18"></label>
      <label>Duruma göre filtre
        <select id="filtre-durum">
          <option value="hepsi">Hepsi</option>
          <option value="uygun">✅ Uygun</option>
          <option value="sinirda">⚠️ Sınırda</option>
          <option value="degil">⛔ Uygun değil</option>
        </select></label>
    </form>
    <div id="sonuc"></div>
    <p>Kaynak: <a href="https://open-meteo.com/en/docs/marine-weather-api">Open-Meteo Marine API</a> ·
       <a href="https://open-meteo.com/en/docs">Forecast API</a></p>
    <p><small>Bilgilendirme amaçlıdır; yelken/sörf kararı için resmî kaynaklara da bakın.</small></p>`;

  document.getElementById("max-dalga").addEventListener("input", guncelle);
  document.getElementById("max-ruzgar").addEventListener("input", guncelle);
  document.getElementById("filtre-durum").addEventListener("change", guncelle);
  document.getElementById("sonuc").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-sirala]");
    if (!b) return;
    const a = b.dataset.sirala;
    siralama = { anahtar: a, yon: siralama.anahtar === a ? -siralama.yon : 1 };
    guncelle();
    const yeni = document.querySelector(`button[data-sirala="${a}"]`);
    if (yeni) yeni.focus();
  });

  zaman.innerText =
    new Date(veri.veriZamani).toLocaleString("tr-TR") + (eski ? " (son başarılı veri)" : "");
  guncelle();
}

async function verileriCek() {
  const lat = NOKTALAR.map((n) => n.lat).join(",");
  const lon = NOKTALAR.map((n) => n.lon).join(",");
  const [marine, ruzgar] = await Promise.all([
    fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period&hourly=wave_height&forecast_days=7&timezone=Europe%2FIstanbul`
    ).then((r) => {
      if (!r.ok) throw new Error("Marine API " + r.status);
      return r.json();
    }),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&hourly=wind_speed_10m&forecast_days=7&timezone=Europe%2FIstanbul&wind_speed_unit=kn`
    ).then((r) => {
      if (!r.ok) throw new Error("Forecast API " + r.status);
      return r.json();
    }),
  ]);
  const m = Array.isArray(marine) ? marine : [marine];
  const w = Array.isArray(ruzgar) ? ruzgar : [ruzgar];
  return {
    veriZamani: new Date(Date.parse(m[0].current.time + "Z") - (m[0].utc_offset_seconds || 0) * 1000).toISOString(),
    noktalar: NOKTALAR.map((n, i) => ({
      ad: n.ad,
      dalga: m[i].current.wave_height,
      yon: m[i].current.wave_direction,
      periyot: m[i].current.wave_period,
      ruzgar: w[i].current.wind_speed_10m,
      ruzgarYon: w[i].current.wind_direction_10m,
      saatlik: {
        zaman: m[i].hourly.time,
        dalga: m[i].hourly.wave_height,
        ruzgar: w[i].hourly.wind_speed_10m,
      },
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
