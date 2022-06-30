const db = require("../database");


function getMessagesFromRoom(roomName) {
  const sql = "SELECT * FROM message WHERE room = ?";

  return new Promise((resolve, reject) => {
    db.all(sql, roomName, (error, rows) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve(rows);
    });
  });
}


function addMessage(message, room, user, date) {
  const sql =
    "INSERT INTO message (value, room, user, date) VALUES (?, ?, ?, ?)";

  return new Promise((resolve, reject) => {
    db.run(sql, [message, room, user, date], (err) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }
      console.log(message, room, user, date);
      resolve();
    });
  });
}

function deleteMessages(room) {
  const sql = "DELETE FROM message WHERE room = ?";
  return new Promise((resolve, reject) => {
    db.get(sql, room, (error) => {
      if (error) {
        console.error(error.message);
        reject(error);
      }
      resolve();
    });
  });
}

module.exports = {
  addMessage,
  getMessagesFromRoom,
  deleteMessages
};
