import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig, firebasePaths } from "./firebase-config.js";

const byId = (id) => document.getElementById(id);
let db = null;
let liveDoc = null;

const presets = {
  abcNews: {
    newsUrl: "https://www.youtube.com/embed/lHxuE0Qf7sg?autoplay=1&rel=0"
  },
  sportsFeed: {
    sportsUrl: "https://www.youtube.com/embed/videoseries?list=PLFgquLnL59alGJcdc0BEZJb2p7IgkL0Oe"
  },
  executiveMusic: {
    mode: "executive"
  }
};

function setStatus(text) {
  if (byId("liveStatus")) byId("liveStatus").textContent = text;
}
function buildProfile() {
  return {
    guestName: byId("guestName")?.value.trim() || "Guest",
    trip: byId("trip")?.value.trim() || "Luxury Ride",
    mode: byId("mode")?.value || "executive",
    chauffeurName: byId("chauffeurName")?.value.trim() || "Ayo",
    vehicleName: byId("vehicleName")?.value.trim() || "Chevrolet Suburban",
    welcomeNote: byId("welcomeNote")?.value.trim() || "Your STYL luxury experience is ready.",
    newsUrl: byId("newsUrl")?.value.trim() || "https://www.youtube.com/embed/lHxuE0Qf7sg?autoplay=1&rel=0",
    sportsUrl: byId("sportsUrl")?.value.trim() || "https://www.youtube.com/embed/videoseries?list=PLFgquLnL59alGJcdc0BEZJb2p7IgkL0Oe",
    vipFormUrl: byId("vipFormUrl")?.value.trim() || "https://stylblackcar.com/contact/",
    bookingUrl: byId("bookingUrl")?.value.trim() || "https://stylblackcar.com/",
    updatedAt: new Date().toISOString()
  };
}
function renderPreview() {
  const p = buildProfile();
  if (byId("previewGreeting")) byId("previewGreeting").textContent = `Good afternoon ${p.guestName}`;
  if (byId("jsonOutput")) byId("jsonOutput").textContent = JSON.stringify(p, null, 2);
  return p;
}
async function savePayload(payload) {
  if (!db || !liveDoc) {
    setStatus("Firebase not configured");
    return;
  }
  await setDoc(liveDoc, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
}
async function saveLiveProfile() {
  const payload = renderPreview();
  await savePayload(payload);
  setStatus("Live profile saved");
}
async function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) return;

  if (preset.newsUrl && byId("newsUrl")) byId("newsUrl").value = preset.newsUrl;
  if (preset.sportsUrl && byId("sportsUrl")) byId("sportsUrl").value = preset.sportsUrl;
  if (preset.mode && byId("mode")) byId("mode").value = preset.mode;

  const payload = renderPreview();
  await savePayload(payload);
  setStatus("Preset applied live");
}
async function loadLiveProfile() {
  if (!firebaseConfig || !firebaseConfig.projectId) {
    setStatus("Fill in firebase-config.js first");
    return;
  }
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  liveDoc = doc(db, firebasePaths.collection, firebasePaths.doc);
  onSnapshot(liveDoc, (snap) => {
    const data = snap.exists() ? snap.data() : {};
    if (data.guestName && byId("guestName")) byId("guestName").value = data.guestName;
    if (data.trip && byId("trip")) byId("trip").value = data.trip;
    if (data.mode && byId("mode")) byId("mode").value = data.mode;
    if (data.chauffeurName && byId("chauffeurName")) byId("chauffeurName").value = data.chauffeurName;
    if (data.vehicleName && byId("vehicleName")) byId("vehicleName").value = data.vehicleName;
    if (data.welcomeNote && byId("welcomeNote")) byId("welcomeNote").value = data.welcomeNote;
    if (data.newsUrl && byId("newsUrl")) byId("newsUrl").value = data.newsUrl;
    if (data.sportsUrl && byId("sportsUrl")) byId("sportsUrl").value = data.sportsUrl;
    if (data.vipFormUrl && byId("vipFormUrl")) byId("vipFormUrl").value = data.vipFormUrl;
    if (data.bookingUrl && byId("bookingUrl")) byId("bookingUrl").value = data.bookingUrl;
    renderPreview();
    setStatus("Connected to live sync");
  }, () => setStatus("Live sync error"));
}
window.addEventListener("load", async () => {
  ["guestName","trip","mode","chauffeurName","vehicleName","welcomeNote","newsUrl","sportsUrl","vipFormUrl","bookingUrl"].forEach(id => {
    const el = byId(id);
    if (el) {
      el.addEventListener("input", renderPreview);
      el.addEventListener("change", renderPreview);
    }
  });
  const saveBtn = byId("saveLiveBtn");
  if (saveBtn) saveBtn.addEventListener("click", saveLiveProfile);
  const copyNewsBtn = byId("copyNewsBtn");
  if (copyNewsBtn) copyNewsBtn.addEventListener("click", () => navigator.clipboard.writeText(byId("newsUrl")?.value || ""));
  const copySportsBtn = byId("copySportsBtn");
  if (copySportsBtn) copySportsBtn.addEventListener("click", () => navigator.clipboard.writeText(byId("sportsUrl")?.value || ""));
  const presetAbcBtn = byId("presetAbcBtn");
  if (presetAbcBtn) presetAbcBtn.addEventListener("click", () => applyPreset("abcNews"));
  const presetSportsBtn = byId("presetSportsBtn");
  if (presetSportsBtn) presetSportsBtn.addEventListener("click", () => applyPreset("sportsFeed"));
  const presetMusicBtn = byId("presetMusicBtn");
  if (presetMusicBtn) presetMusicBtn.addEventListener("click", () => applyPreset("executiveMusic"));
  renderPreview();
  await loadLiveProfile();
});
