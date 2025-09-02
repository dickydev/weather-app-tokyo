// Module System
import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

// Konfigurasi dotenv
import dotenv from "dotenv";
dotenv.config();

const UNITS = "metric";
const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function getWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${UNITS}`;
  return fetchData(url);
}

