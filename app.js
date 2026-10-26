// Open-Meteo API Entegrasyon Taslağı
const latitude = 39.3131; // Ayvalık
const longitude = 26.6967;

async function denizVerisiniCek() {
    try {
        const response = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=wave_height,wave_direction,wave_period`);
        const data = await response.json();
        
        document.getElementById('son-guncelleme').innerText = new Date().toLocaleString('tr-TR');
        document.getElementById('veri-alani').innerHTML = `
            <h3>Güncel Deniz Durumu (Ayvalık)</h3>
            <p><strong>Dalga Yüksekliği:</strong> ${data.current.wave_height} m</p>
            <p><strong>Dalga Yönü:</strong> ${data.current.wave_direction}°</p>
            <p><strong>Dalga Periyodu:</strong> ${data.current.wave_period} s</p>
        `;
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        document.getElementById('veri-alani').innerHTML = `<p style="color: red;">Veri yüklenemedi!</p>`;
    }
}

denizVerisiniCek();
