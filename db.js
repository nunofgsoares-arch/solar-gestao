const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data.db");

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS equipas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS obras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    cliente TEXT,
    kwp REAL,
    equipa_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS registos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    obra_id INTEGER,
    horas REAL,
    data TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT,
    p256dh TEXT,
    auth TEXT
  )`);

});

module.exports = db;