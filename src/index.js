// Module System
import promptSync from 'prompt-sync';
const prompt = promptSync({ sigint: true });

// Konfigurasi dotenv
import dotenv from 'dotenv';
dotenv.config();

let API_KEY = process.env.API_KEY;
console.log(API_KEY);

const UNITS = 'metric';
