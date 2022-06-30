const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db.sqlite", (error) => {
  if (error) {
    console.error(error.message);
    throw error;
  }
  console.log("ansluten");

  //   SQL-statement för tabell rooms, innehåller id & name.
  const roomStatement = `
  CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT)`;

  const messageStatement = `
  CREATE TABLE message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT,
    room TEXT,
    user TEXT,
    date TEXT)`;

  // RUM:
  db.run(roomStatement, (error) => {
    // Om tabellen redan finns så kommer det här felmeddelandet att köras:
    if (error) {
      console.error(error.message);
    } else {
      // Lägga till flera rum genom detta SQL-statementet
      const roomInsert = `INSERT INTO rooms (name) VALUES (?)`;

      // Prövar att lägga till ett rum här:
      db.run(roomInsert, ["room 1"]);
      db.run(roomInsert, ["room 2"]);
    }
  });
  // MEDDELANDEN:
  db.run(messageStatement, (error) => {
    // Om tabellen redan finns så kommer det här felmeddelandet att köras:
    if (error) {
      console.error(error.message);
    } else {
      // Lägga till meddelanden med detta SQL-statementet
      const messageInsert = `INSERT INTO message (value, room, user, date) VALUES (?, ?, ?, ?)`;
      // Prövar att lägga till ett rum här:
      db.run(messageInsert, ["Welcome!", "default", "botronic", "2022-06-30 23:59:59"]);
    }
  });
});
module.exports = db;
