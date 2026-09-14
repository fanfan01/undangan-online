let data = null;
let tamu = "Tamu Undangan";

const $ = (id) => document.getElementById(id);

function getGuestCode() {
  return new URLSearchParams(window.location.search).get("to") || "";
}

function formatRupiahCopy(text) {
  return text.replace(/\s+/g, " ").trim();
}

async function loadData() {
  const [invRes, tamuRes] = await Promise.all([
    fetch("data/undangan.json"),
    fetch("data/tamu.json")
  ]);
  data = await invRes.json();
  const daftarTamu = await tamuRes.json();

  const kode = getGuestCode().toUpperCase();
  const found = daftarTamu.find(x => x.kode.toUpperCase() === kode);
  if (found) tamu = found.nama;

  render();
}

function render() {
  const p = data.pasangan;
  const a = data.acara;

  const names = `${p.pria.nama.split(",")[0]} & ${p.wanita.nama.split(",")[0]}`;
  $("coverNames").textContent = names;
  $("heroNames").textContent = names;
  $("footerNames").textContent = names;
  $("heroDate").textContent = a.tanggalTeks;

  $("guestGreeting").innerHTML = `Kepada Yth.<br><strong>${escapeHtml(tamu)}</strong>`;

  $("groomName").textContent = p.pria.nama;
  $("groomParents").textContent = p.pria.orangTua;
  $("brideName").textContent = p.wanita.nama;
  $("brideParents").textContent = p.wanita.orangTua;

  $("groomPhoto").style.backgroundImage = `url("${p.pria.foto}")`;
  $("bridePhoto").style.backgroundImage = `url("${p.wanita.foto}")`;

  $("akadDate").textContent = a.tanggalTeks;
  $("receptionDate").textContent = a.tanggalTeks;
  $("akadTime").textContent = a.akad.jam;
  $("akadPlace").textContent = a.akad.tempat;
  $("receptionTime").textContent = a.resepsi.jam;
  $("receptionPlace").textContent = a.resepsi.tempat;
  $("mapsButton").href = a.maps;

  $("gallery").innerHTML = data.galeri.map(src => `<img src="${src}" alt="Galeri ${names}">`).join("");

  $("storyList").innerHTML = data.cerita.map(item => `
    <div class="story-item">
      <div class="story-year">${escapeHtml(item.tahun)}</div>
      <div><h3>${escapeHtml(item.judul)}</h3><p>${escapeHtml(item.isi)}</p></div>
    </div>`).join("");

  $("bankList").innerHTML = data.rekening.map((r, i) => `
    <div class="bank-card">
      <strong>${escapeHtml(r.bank)}</strong>
      <div class="account">${escapeHtml(r.nomor)}</div>
      <small>a.n. ${escapeHtml(r.atasNama)}</small>
      <button class="copy-btn" data-copy="${escapeHtml(r.nomor)}">Salin Nomor Rekening</button>
    </div>`).join("");

  const message = encodeURIComponent(
    `Halo, saya ${tamu}. Saya ingin mengonfirmasi kehadiran pada pernikahan ${names}.`
  );
  $("rsvpButton").href = `https://wa.me/${data.whatsapp}?text=${message}`;

  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(btn.dataset.copy);
      const old = btn.textContent;
      btn.textContent = "Tersalin ✓";
      setTimeout(() => btn.textContent = old, 1500);
    });
  });

  startCountdown(a.tanggalISO);
}

function startCountdown(dateString) {
  const target = new Date(dateString).getTime();
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      ["days","hours","minutes","seconds"].forEach(id => $(id).textContent = "00");
      return;
    }
    $("days").textContent = String(Math.floor(diff / 86400000)).padStart(2, "0");
    $("hours").textContent = String(Math.floor(diff / 3600000) % 24).padStart(2, "0");
    $("minutes").textContent = String(Math.floor(diff / 60000) % 60).padStart(2, "0");
    $("seconds").textContent = String(Math.floor(diff / 1000) % 60).padStart(2, "0");
  };
  tick();
  setInterval(tick, 1000);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

$("openInvitation").addEventListener("click", () => {
  $("opening").classList.add("close");
  $("mainContent").classList.remove("hidden");
  document.body.classList.add("opened");
  window.scrollTo({top: 0, behavior: "smooth"});
});

loadData().catch(err => {
  console.error(err);
  $("guestGreeting").innerHTML = "Data undangan gagal dimuat.<br><strong>Jalankan melalui GitHub Pages / web server.</strong>";
});
