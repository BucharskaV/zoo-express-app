const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')

db.run("PRAGMA foreign_keys = ON");

module.exports = db;