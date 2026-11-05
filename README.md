# Ege Kıyıları Deniz Durumu ve Karar Panosu

Ayvalık ve Çeşme'de çalışan kurgusal bir yelken/sörf okulunun eğitmeni için hazırlanmış, canlı veriyle çalışan karar destek panosu. Eğitmen güvenli dalga ve rüzgâr aralığını kendisi belirler; pano 4 kıyı noktası için önümüzdeki 7 günün ders saatlerindeki (09:00–18:00) uygun pencerelerini gösterir.

> Bu proje öğrenci ödevidir ve kurgusal bir müşteri için hazırlanmıştır; gerçek bir kurumun resmî aracı değildir.

**Canlı ürün:** https://ege-deniz-durumu.vercel.app
**Depo:** https://github.com/kubrany/ege-deniz-durumu

## Özellikler

- 3 KPI kartı: uygun nokta sayısı, en sakin deniz, en güçlü rüzgâr
- Eğitmenin belirlediği güvenli aralığa göre durum (✅ Uygun / ⚠️ Sınırda / ⛔ Uygun değil: ikon + metin)
- 7 günlük "uygun pencere" takvimi (4 nokta × 7 gün)
- Ana grafik: 4 noktanın dalga yüksekliği karşılaştırması
- Small multiples: 4 noktanın rüzgâr hızı, aynı ölçekte
- Rüzgâr gülü (nokta seçilebilir)
- Filtre ve sıralanabilir detay tablosu
- Her grafikte tek cümlelik özet ve "Veriyi tablo olarak gör" seçeneği
- Yükleniyor, boş sonuç ve hata durumları; API kapalıyken son başarılı veriyle açılma

## Mimari

```
Open-Meteo Marine API ─┐
                       ├─► Tarayıcı (app.js) ─► Chart.js grafikleri + tablolar
Open-Meteo Forecast API┘          │
                                  └─► localStorage (son başarılı veri, çevrimdışı yedek)

Dağıtım: GitHub (main) ─► Vercel
```

Veri, tarayıcıdan doğrudan Open-Meteo API'lerine yapılan çağrıyla alınır. API anahtarı gerektirmez, istemci kodunda gizli bilgi yoktur. 4 nokta tek istekte (virgülle ayrılmış koordinatlar) çekilir; böylece istek sayısı düşük tutulur.

## Veri kaynağı ve lisansı

- [Open-Meteo Marine Weather API](https://open-meteo.com/en/docs/marine-weather-api): dalga yüksekliği, periyodu ve yönü
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs): rüzgâr hızı ve yönü
- Lisans: Open-Meteo verisi CC BY 4.0'dır; ticari olmayan kullanım için ücretsizdir. Kaynak olarak ekranda bağlantı verilmiştir.

## Kurulum

Derleme adımı yoktur. Depoyu indirip `index.html` dosyasını tarayıcıda açmak yeterlidir (veya `npx serve`).

## Bilgilendirme notu

Bu pano bilgilendirme amaçlıdır; yelken/sörf kararları için resmî meteoroloji kaynaklarına da bakılmalıdır.

## CV cümlesi

Open-Meteo deniz ve rüzgâr tahmininden 4 kıyı noktası için 7 günlük karar takvimi üreten, erişilebilir bir panoyu JavaScript ve Chart.js ile geliştirip Vercel'de yayına aldım.

## Yapay zekâ kullanım beyanı

- **Kullanılan araç:** Claude (Anthropic)
- **Ne için kullandım:** Ödev kartını anlamak ve işi adım adım planlamak; `app.js` kodunun geliştirilmesi (Open-Meteo'dan veri çekme, güvenli aralığa göre durum hesabı, 7 günlük takvim, Chart.js grafikleri ve rüzgâr gülü); README taslağı.
- **Benim yaptıklarım:** Claude'un ürettiği kodu GitHub'a yükledim ve her sürümü canlı sitede test ettim. Vercel ayarını (Deployment Protection) kapatarak sitenin herkese açılmasını sağladım. Ekran görüntüleriyle hataları ve eksikleri bildirdim.
