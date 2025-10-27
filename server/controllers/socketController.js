const connectionDB = require("./dbController");

module.exports = {
  socketHandler: (socket, io) => {
    console.log("New socket client!");

    socket.on("getGeneralChat", () => {
      const selectQuery = "SELECT * FROM messages";
      connectionDB.query(selectQuery, (err, result) => {
        if (err) {
          io.emit("loadGeneralMessage", null);
        } else {
          result.forEach((message) => {
            io.emit("loadGeneralMessage", message);
          });
        }
      });
    });

    socket.on("addGeneralMessage", (data) => {
      const { MessageSender, MessageContent, MessageDate } = data;
      console.log(data);

      const SQL_QUERY = `INSERT INTO messages (MessageId, MessageSender, MessageContent, MessageDate) 
      VALUE (null, '${MessageSender}','${MessageContent}','${MessageDate}')`;
      connectionDB.query(SQL_QUERY, (err, result) => {
        if (err) {
          console.log("Ошибка базы данных при добавлении нового сообщения в общий чаты");
        } else {
          const insertedId = result.insertId;
          io.emit("loadGeneralMessage", { MessageId: insertedId, MessageSender, MessageContent, MessageDate });
        }
      });
    });
  },
};
