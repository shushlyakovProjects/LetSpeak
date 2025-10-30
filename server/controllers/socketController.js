const connectionDB = require("./dbController");

module.exports = {
  socketHandler: (socket, io) => {
    console.log('New socket client!');
    

    socket.on("connectToSocket", (login) => {
      socket.UserLogin = login;
      console.log(`Client with login ${login} has been connected to Socket!`);
    });

    socket.on("getGeneralChat", () => {
      const selectQuery = "SELECT * FROM messages";
      connectionDB.query(selectQuery, (err, result) => {
        if (err) {
          socket.emit("loadGeneralMessage", null);
        } else {
          result.forEach((message) => {
            socket.emit("loadGeneralMessage", message);
          });
        }
      });
    });

    socket.on("deleteGeneralMessage", (MessageDeleted) => {
      const { MessageId, MessageSenderLogin } = MessageDeleted;
      console.log(MessageDeleted);

      const SQL_QUERY = `DELETE FROM messages WHERE MessageId = '${MessageId}' AND MessageSenderLogin = '${MessageSenderLogin}'`;

      connectionDB.query(SQL_QUERY, (err, result) => {
        if (err) {
          console.log("Ошибка базы данных при удалении сообщения в общием чате");
        } else {
          console.log(`Сообщение ${MessageSenderLogin} ID:${MessageId} было удалено!`);
          io.emit("deleteGeneralMessage", MessageId);
        }
      });
    });

    socket.on("addGeneralMessage", (data) => {
      const { MessageSenderLogin, MessageSenderName, MessageContent, MessageDate } = data;
      // console.log(data);

      const SQL_QUERY = `INSERT INTO messages (MessageId, MessageSenderLogin, MessageSenderName, MessageContent, MessageDate) 
      VALUE (null, '${MessageSenderLogin}', '${MessageSenderName}','${MessageContent}','${MessageDate}')`;
      connectionDB.query(SQL_QUERY, (err, result) => {
        if (err) {
          console.log("Ошибка базы данных при добавлении нового сообщения в общий чаты");
        } else {
          const insertedId = result.insertId;
          io.emit("loadGeneralMessage", {
            MessageId: insertedId,
            MessageSenderLogin,
            MessageSenderName,
            MessageContent,
            MessageDate,
          });
        }
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client with ${socket.UserLogin} has been disconnected.`);
    });
  },
};
