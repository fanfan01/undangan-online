const BASE_PATH = "/undangan-online/";
let data = null;
let guestName = "Tamu Undangan";
let countdownTimer = null;

const $ = (id) => document.getElementById(id);

function getGuestCode() {
  const params = new URLSearchParams(location.search);
  const parts = location.pathname.split("/").filter(Boolean);
  const index = parts.findIndex(part => part.toLowerCase() === "to");
  if (index >= 0 && parts[index + 1]) return decodeURIComponent(parts[index + 1]);
  return params.get("to") || "";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value ?? "";
}

function setImage(id, src, alt) {
  const element = $(id);
  if (!element) return;
  element.src = src || "";
  element.alt = alt || "";
  element.onerror = () => {
    element.style.visibility = "hidden";
    console.warn("Gambar tidak ditemukan:", src);
  };
}

async function loadData() {
  try {
    const [invitationResponse, guestsResponse] = await Promise.all([
      fetch(`${BASE_PATH}data/undangan.json`),
      fetch(`${BASE_PATH}data/tamu.json`)
    ]);
    if (!invitationResponse.ok) throw new Error("undangan.json tidak ditemukan");
    if (!guestsResponse.ok) throw new Error("tamu.json tidak ditemukan");

    data = await invitationResponse.json();
    const guests = await guestsResponse.json();
    const code = getGuestCode().trim().toUpperCase();
    const guest = guests.find(item => String(item.kode).trim().toUpperCase() === code);
    if (guest) guestName = guest.nama;

    renderInvitation();
    $("loadingScreen")?.classList.add("done");
  } catch (error) {
    console.error(error);
    const screen = $("loadingScreen");
    if (screen) screen.innerHTML = `<p>Undangan gagal dimuat.</p><small>${escapeHTML(error.message)}</small>`;
  }
}

function renderInvitation() {
  const couple = data.pasangan;
  const event = data.acara;
  const groom = couple.pria;
  const bride = couple.wanita;
  const shortNames = `${groom.nama.split(",")[0]} & ${bride.nama.split(",")[0]}`;

  document.title = `Undangan Pernikahan | ${shortNames}`;
  setText("coverNames", shortNames);
  setText("heroNames", shortNames);
  setText("footerNames", shortNames);
  setText("navNames", `${groom.nama.split(",")[0][0]} & ${bride.nama.split(",")[0][0]}`);
  setText("footerMonogram", `${groom.nama.split(",")[0][0]} & ${bride.nama.split(",")[0][0]}`);
  setText("coverDate", event.tanggalTeks);
  setText("heroDate", event.tanggalTeks);
  setText("guestName", guestName);

  setText("groomName", groom.nama);
  setText("groomParents", groom.orangTua);
  setText("brideName", bride.nama);
  setText("brideParents", bride.orangTua);
  setImage("heroPhoto", couple.fotoUtama || groom.foto, `Foto ${shortNames}`);
  setImage("groomPhoto", groom.foto, groom.nama);
  setImage("bridePhoto", bride.foto, bride.nama);

  const groomSocial = $("groomSocial");
  const brideSocial = $("brideSocial");
  if (groomSocial) { groomSocial.href = groom.instagram || "#"; groomSocial.hidden = !groom.instagram; }
  if (brideSocial) { brideSocial.href = bride.instagram || "#"; brideSocial.hidden = !bride.instagram; }

  setText("akadDate", event.tanggalTeks);
  setText("receptionDate", event.tanggalTeks);
  setText("akadTime", event.akad.jam);
  setText("akadPlace", event.akad.tempat);
  setText("receptionTime", event.resepsi.jam);
  setText("receptionPlace", event.resepsi.tempat);
  $("akadMaps").href = event.akad.maps || event.maps || "#";
  $("receptionMaps").href = event.resepsi.maps || event.maps || "#";

  $("storyList").innerHTML = (data.cerita || []).map(item => `
    <article class="story-item">
      <div class="story-year">${escapeHTML(item.tahun)}</div>
      <h3>${escapeHTML(item.judul)}</h3>
      <p>${escapeHTML(item.isi)}</p>
    </article>`).join("");

  $("gallery").innerHTML = (data.galeri || []).map((src, index) => `
    <img src="${escapeHTML(src)}" alt="Momen ${index + 1} ${escapeHTML(shortNames)}" loading="lazy"
      onerror="this.style.display='none'">`).join("");

  $("bankList").innerHTML = (data.rekening || []).map((account, index) => `
    <article class="bank-card">
      <strong>${escapeHTML(account.bank)}</strong>
      <div class="account">${escapeHTML(account.nomor)}</div>
      <small>a.n. ${escapeHTML(account.atasNama)}</small>
      <button class="copy-btn" type="button" data-index="${index}">Salin Nomor Rekening</button>
    </article>`).join("");

  document.querySelectorAll(".copy-btn").forEach(button => {
    button.addEventListener("click", () => copyAccount(button));
  });

  const message = encodeURIComponent(
    `Assalamu'alaikum, saya ${guestName}. Saya ingin mengonfirmasi kehadiran pada pernikahan ${shortNames}.`
  );
  $("rsvpButton").href = `https://wa.me/${String(data.whatsapp).replace(/\D/g, "")}?text=${message}`;

  startCountdown(event.tanggalISO);
}

async function copyAccount(button) {
  const account = data.rekening[Number(button.dataset.index)];
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(String(account.nomor));
    button.textContent = "Tersalin ✓";
  } catch {
    const input = document.createElement("textarea");
    input.value = account.nomor;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
    button.textContent = "Tersalin ✓";
  }
  setTimeout(() => button.textContent = original, 1600);
}

function startCountdown(dateString) {
  if (countdownTimer) clearInterval(countdownTimer);
  // Gunakan format ISO dengan zona waktu, contoh: 2026-12-20T08:00:00+07:00
  const target = new Date(dateString).getTime();
  if (Number.isNaN(target)) {
    console.warn("Format tanggalISO tidak valid:", dateString);
    return;
  }
  const tick = () => {
    let remaining = target - Date.now();
    if (remaining <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach(id => setText(id, "00"));
      clearInterval(countdownTimer);
      return;
    }
    const days = Math.floor(remaining / 86400000);
    remaining %= 86400000;
    const hours = Math.floor(remaining / 3600000);
    remaining %= 3600000;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    setText("days", String(days).padStart(2, "0"));
    setText("hours", String(hours).padStart(2, "0"));
    setText("minutes", String(minutes).padStart(2, "0"));
    setText("seconds", String(seconds).padStart(2, "0"));
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

$("openInvitation").addEventListener("click", () => {
  $("opening").classList.add("close");
  $("mainContent").classList.add("visible");
  $("mainContent").setAttribute("aria-hidden", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

loadData();
