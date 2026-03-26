import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig, firebasePaths } from "./firebase-config.js";

const byId = (id) => document.getElementById(id);
const config = {
  guestName: "Guest",
  trip: "Luxury Ride",
  mode: "executive",
  chauffeurName: "Ayo",
  vehicleName: "Chevrolet Suburban",
  welcomeNote: "Your STYL luxury experience is ready.",
  bookingUrl: "https://stylblackcar.com/",
  vipFormUrl: "https://stylblackcar.com/contact/",
  youtubeLoungeUrl: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&rel=0",
  newsUrl: "https://www.youtube.com/embed/A1A_1AgbSkQ",
  sportsUrl: "https://www.youtube.com/embed/videoseries?list=PLFgquLnL59alGJcdc0BEZJb2p7IgkL0Oe",
  musicModes: {
    executive: { title: "Executive Mode", description: "Smooth jazz, neo-soul, and refined lounge vibes for executive rides.", embedUrl: "https://www.youtube.com/embed/videoseries?list=PL8F6B0753B2CCA128" },
    vibe: { title: "Vibe Mode", description: "Afrobeats, R&B, and chill global sounds for everyday luxury rides.", embedUrl: "https://www.youtube.com/embed/videoseries?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI" },
    party: { title: "Party Mode", description: "Hip hop, afrobeats hits, and high-energy mixes for nightlife and group rides.", embedUrl: "https://www.youtube.com/embed/videoseries?list=PLFgquLnL59amEA53azfP6qWD5F3eVQfmx" }
  },
  weatherFallback: { temp: "--", icon: "☀️", text: "Weather unavailable" }
};

const viewNames = ["home","youtube","news","sports","music","vip","book"];
const views = Object.fromEntries(viewNames.map(name => [name, byId(name+"View")]));
let currentView = "home";
let currentMusicMode = "executive";

function setActiveTab(id) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  const tab = byId(id);
  if (tab) tab.classList.add("active");
}
function showView(name, title, tabId, subtitle = "Everything opens inside the dashboard.") {
  Object.values(views).forEach(v => v && v.classList.remove("active"));
  if (views[name]) views[name].classList.add("active");
  currentView = name;
  if (byId("panelTitle")) byId("panelTitle").textContent = title;
  if (byId("panelSubtitle")) byId("panelSubtitle").textContent = subtitle;
  if (tabId && tabId !== "vipBtn") setActiveTab(tabId);
}
function setMusicMode(key) {
  currentMusicMode = config.musicModes[key] ? key : "executive";
  const mode = config.musicModes[currentMusicMode];
  if (byId("musicModeTitle")) byId("musicModeTitle").textContent = mode.title;
  if (byId("musicModeCopy")) byId("musicModeCopy").textContent = mode.description;
  if (byId("musicFrame")) byId("musicFrame").src = mode.embedUrl;
  document.querySelectorAll(".music-mode-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.musicMode === currentMusicMode));
}
function updateGreetingHighlight() {
  const el = byId("greetingHighlight");
  if (!el) return;
  const hour = new Date().getHours();
  let prefix = "Good evening";
  if (hour < 12) prefix = "Good morning";
  else if (hour < 18) prefix = "Good afternoon";
  const guest = config.guestName || "Guest";
  el.textContent = `${prefix} ${guest}`;
  el.classList.remove("entrance");
  void el.offsetWidth;
  el.classList.add("entrance");
}
function updateLuxuryScroll() {
  const el = byId("luxuryScrollText");
  if (!el) return;
  const hour = new Date().getHours();
  let prefix = "Good evening";
  if (hour < 12) prefix = "Good morning";
  else if (hour < 18) prefix = "Good afternoon";
  const guest = config.guestName || "Guest";
  const chauffeur = config.chauffeurName || "Ayo";
  const segments = [
    `${prefix} ${guest}`,
    `Your STYL luxury experience is ready`,
    `${chauffeur} is your chauffeur today`,
    `Enjoy the ride in comfort and style`,
    `Join our VIP to receive exclusive discount offers`
  ];
  el.textContent = " • " + segments.join(" • ") + " • " + segments.join(" • ") + " • ";
}
function updateClock() {
  const now = new Date();
  if (byId("clockTime")) byId("clockTime").textContent = now.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
  if (byId("clockDate")) byId("clockDate").textContent = now.toLocaleDateString([], {weekday:"long", month:"long", day:"numeric"});
  let greeting = "Good evening";
  const hour = now.getHours();
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  if (byId("greetingText")) byId("greetingText").textContent = greeting;
  if (byId("greetingSub")) byId("greetingSub").textContent = config.welcomeNote;
  updateGreetingHighlight();
  updateLuxuryScroll();
}
function weatherCodeToText(code) {
  const map = {0:["Clear skies","☀️"],1:["Mostly clear","🌤️"],2:["Partly cloudy","⛅"],3:["Overcast","☁️"],45:["Foggy","🌫️"],48:["Foggy","🌫️"],51:["Light drizzle","🌦️"],53:["Drizzle","🌦️"],55:["Heavy drizzle","🌧️"],61:["Light rain","🌧️"],63:["Rain","🌧️"],65:["Heavy rain","🌧️"],71:["Light snow","🌨️"],73:["Snow","🌨️"],75:["Heavy snow","❄️"],80:["Rain showers","🌦️"],81:["Rain showers","🌦️"],82:["Heavy showers","⛈️"],95:["Thunderstorm","⛈️"]};
  return map[code] || ["Weather unavailable","☀️"];
}
function setWeatherDisplay(temp, icon, text) {
  if (byId("weatherTemp")) byId("weatherTemp").textContent = temp;
  if (byId("weatherIcon")) byId("weatherIcon").textContent = icon;
  if (byId("weatherText")) byId("weatherText").textContent = text;
}
async function fetchWeatherForPosition(lat, lon, locationName = "") {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`;
  const response = await fetch(url, { cache:"no-store" });
  const data = await response.json();
  const current = data.current || {};
  const [textBase, icon] = weatherCodeToText(current.weather_code);
  const tempText = current.temperature_2m == null ? "--" : `${Math.round(current.temperature_2m)}°F`;
  setWeatherDisplay(tempText, icon, locationName ? `${textBase} · ${locationName}` : textBase);
}
async function requestBrowserWeather() {
  try {
    if ("geolocation" in navigator) {
      const geo = await new Promise(resolve => navigator.geolocation.getCurrentPosition(
        pos => resolve({ok:true, lat:pos.coords.latitude, lon:pos.coords.longitude}),
        () => resolve({ok:false}),
        {enableHighAccuracy:false, timeout:10000, maximumAge:1800000}
      ));
      if (geo.ok) { await fetchWeatherForPosition(geo.lat, geo.lon); return; }
    }
    const geoResponse = await fetch("https://ipapi.co/json/", { cache:"no-store" });
    const geoData = await geoResponse.json();
    await fetchWeatherForPosition(geoData.latitude, geoData.longitude, geoData.city || "Dallas");
  } catch {
    setWeatherDisplay(config.weatherFallback.temp, config.weatherFallback.icon, config.weatherFallback.text);
  }
}
function applyProfile(data = {}) {
  Object.assign(config, data || {});
  if (byId("chauffeurName")) byId("chauffeurName").textContent = config.chauffeurName || "Ayo";
  if (byId("vehicleName")) byId("vehicleName").textContent = config.vehicleName || "Chevrolet Suburban";
  if (byId("driverCard")) byId("driverCard").textContent = config.chauffeurName || "Ayo";
  if (byId("vehicleCard")) byId("vehicleCard").textContent = config.vehicleName || "Chevrolet Suburban";
  if (byId("wifiName")) byId("wifiName").textContent = "STYL-Guest";
  if (byId("wifiPassword")) byId("wifiPassword").textContent = "RideInSTYL";
  if (byId("wifiCardName")) byId("wifiCardName").textContent = "STYL-Guest";
  if (byId("wifiCardPass")) byId("wifiCardPass").textContent = "RideInSTYL";
  if (byId("youtubeFrame")) byId("youtubeFrame").src = config.youtubeLoungeUrl;
  if (byId("newsFrame")) byId("newsFrame").src = config.newsUrl;
  if (byId("sportsFrame")) byId("sportsFrame").src = config.sportsUrl;
  if (byId("bookFrame")) byId("bookFrame").src = config.bookingUrl;
  if (byId("vipFrame")) byId("vipFrame").src = config.vipFormUrl;
  if (byId("splitPrimaryFrame")) byId("splitPrimaryFrame").src = config.newsUrl;
  if (byId("splitSecondaryFrame")) byId("splitSecondaryFrame").src = config.musicModes.executive.embedUrl;
  setMusicMode((config.mode || "executive").toLowerCase());
  updateClock();
}
function initFirebaseSync() {
  if (!firebaseConfig || !firebaseConfig.projectId) { applyProfile({}); return; }
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const liveDoc = doc(db, firebasePaths.collection, firebasePaths.doc);
  onSnapshot(liveDoc, (snap) => applyProfile(snap.exists() ? snap.data() : {}), () => applyProfile({}));
}
function initTabs() {
  const tabs = [
    ["homeBtn","home","STYL Home"],
    ["youtubeBtn","youtube","YouTube Lounge"],
    ["newsBtn","news","Watch News"],
    ["sportsBtn","sports","Watch Sports"],
    ["musicBtn","music","Play Music"],
    ["bookBtn","book","Book Next Ride"]
  ];
  tabs.forEach(([id, view, title]) => {
    const btn = byId(id);
    if (btn) btn.addEventListener("click", () => showView(view, title, id));
  });
  const vipBtn = byId("vipBtn");
  if (vipBtn) vipBtn.addEventListener("click", () => showView("vip", "Join Our VIP", "vipBtn", "Guests can register for exclusive discount offers."));
  const splitToggleBtn = byId("splitToggleBtn");
  if (splitToggleBtn) splitToggleBtn.addEventListener("click", () => byId("splitPanel")?.classList.remove("hidden"));
  const closeSplitBtn = byId("closeSplitBtn");
  if (closeSplitBtn) closeSplitBtn.addEventListener("click", () => byId("splitPanel")?.classList.add("hidden"));
  document.querySelectorAll(".music-mode-btn").forEach(btn => btn.addEventListener("click", () => setMusicMode(btn.dataset.musicMode)));
}
function initSwipe() {
  const panel = byId("panelBody");
  if (!panel) return;
  let startX = 0, startY = 0;
  panel.addEventListener("touchstart", (e) => { startX = e.changedTouches[0].clientX; startY = e.changedTouches[0].clientY; }, {passive:true});
  panel.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      const idx = viewNames.indexOf(currentView);
      const next = dx < 0 ? (idx + 1) % viewNames.length : (idx - 1 + viewNames.length) % viewNames.length;
      const map = {home:["STYL Home","homeBtn"],youtube:["YouTube Lounge","youtubeBtn"],news:["Watch News","newsBtn"],sports:["Watch Sports","sportsBtn"],music:["Play Music","musicBtn"],vip:["Join Our VIP","vipBtn"],book:["Book Next Ride","bookBtn"]};
      showView(viewNames[next], map[viewNames[next]][0], map[viewNames[next]][1]);
    }
  }, {passive:true});
}
window.addEventListener("load", () => {
  initTabs();
  initSwipe();
  requestBrowserWeather();
  updateClock();
  setInterval(updateClock, 30000);
  setInterval(requestBrowserWeather, 1800000);
  showView("home", "STYL Home", "homeBtn");
  initFirebaseSync();
  const splash = byId("welcomeSplash");
  if (splash) {
    setTimeout(() => splash.classList.add("hide"), 1800);
    setTimeout(() => splash.classList.add("force-hide"), 2200);
    setTimeout(() => splash.style.display = "none", 2600);
  }
});
