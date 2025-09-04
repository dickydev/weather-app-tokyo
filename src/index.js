const API_KEY = document.querySelector('meta[name="API_KEY"]').content;
const BASE_URL = document.querySelector('meta[name="BASE_URL"]').content;
let UNITS = "metric";
const LANG = "id";

// EXPERIMEN

// Konfigurasi Util DOM
const $ = (s) => document.querySelector(s);
const statusEl = $("#status");
const errorEl = $("#error");
const resultEl = $("#result");
const form = $("#search-form");
const inputCity = $("#city-input");
const unitSel = $("#unit-select");
const btn = $("#btn-submit");

const show = (elemen) => (elemen.hidden = false);
const hide = (elemen) => (elemen.hidden = true);
const setText = (id, text) => (document.getElementById(id).textContent = text);

const degToCompass = (deg = 0) => {
  const dir = [
    "U",
    "U-Timur",
    "Timur",
    "S-Timur",
    "Selatan",
    "S-Barat",
    "Barat",
    "U-Barat",
  ];
  return dir[Math.round((deg % 360) / 45) % 8];
};

const fmtUnit = (units, t) =>
  t == null ? "-" : units === "imperial" ? `${t}°F` : `${t}°C`;

const toLocalTime = (unix, tz) => {
  try {
    return new Date((unix + (tz ?? 0)) * 1000).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "-";
  }
};

/* ============================================================================ */

async function fetchData(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 1200);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (res.status === 401) throw new Error("API Key tidak valid (401)");
    if (res.status === 404) throw new Error("Kota tidak ditemukan (404)");
    if (res.status === 429)
      throw new Error("Rate limit (429). Coba lagi nanti");

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(to);
  }
}

async function getWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=${UNITS}&lang=${LANG}`;
  return fetchData(url);
}

function renderWeather(data) {
  const icon = data.weather?.[0]?.icon
    ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    : "";

  $("#wx-icon").src = icon;
  $("#wx-icon").alt = data.weather?.[0]?.description ?? "ikon cuaca";

  setText("city-name", `${data.name}`);
  const country = data.sys?.country ?? "";
  setText("country-line", country === "ID" ? "Indonesia" : country || "-");

  const temp = data.main?.temp ?? "-";
  $("#temp-now").textContent =
    UNITS === "imperial" ? `${Math.round(temp)}°F` : `${Math.round(temp)}°C`;
  setText("desc-line", data.weather?.[0]?.description ?? "-");

  const feels = data.main?.feels_like;
  const tmin = data.main?.temp_min;
  const tmax = data.main?.temp_max;
  const windSpeed = data.wind?.speed;
  const windDeg = data.wind?.deg ?? 0;
  const hum = data.main?.humidity;
  const press = data.main?.pressure;
  const tz = data.timezone ?? 0;

  setText("feels", fmtUnit(UNITS, feels));
  setText("range", `${fmtUnit(UNITS, tmin)} - ${fmtUnit(UNITS, tmax)}`);
  setText(
    "wind",
    `${windSpeed ?? "-"} ${
      UNITS === "imperial" ? "mph" : "m/s"
    } (${degToCompass(windDeg)})`
  );
  setText("humid", `${hum ?? "-"}%`);
  setText("press", `${press ?? "-"} hPa`);
  setText(
    "sun",
    `Terbit ${toLocalTime(data.sys?.sunrise, tz)} 
    - 
    Terbenam ${toLocalTime(data.sys?.sunset, tz)}`
  );
  show(resultEl);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hide(errorEl);
  show(statusEl);
  btn.disabled = true;
  try {
    const city = inputCity.value.trim();
    UNITS = unitSel.value;
    if (!city) throw new Error("Mohon isi nama kota nya....");
    const data = await getWeather(city);
    console.log(data);
    renderWeather(data);
  } catch (err) {
    errorEl.textContent = `${err.message}`;
    show(errorEl);
  } finally {
    hide(statusEl);
    btn.disabled = false;
  }
});

inputCity.focus();
