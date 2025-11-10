const connectionDB = require("./dbController");
const fs = require("fs");

module.exports = {
  socketHandler: (socket, io) => {
    console.log("New socket client!");

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
      const { MessageId, MessageSenderLogin, MessageImage } = MessageDeleted;

      const SQL_QUERY = `DELETE FROM messages WHERE MessageId = '${MessageId}' AND MessageSenderLogin = '${MessageSenderLogin}'`;
      // УДАЛИТЬ ИЗОБРАЖЕНИЕ С ПАПКИ
      connectionDB.query(SQL_QUERY, (err, result) => {
        if (err) {
          console.log("Ошибка базы данных при удалении сообщения в общием чате");
        } else {
          if (MessageImage) {
            try {
              const imagePath = `./uploads/${MessageImage}`;
              fs.unlinkSync(imagePath);
            } catch (error) {
              console.log(error);
            }
          }

          console.log(`Сообщение ${MessageSenderLogin} ID:${MessageId} было удалено!`);
          io.emit("deleteGeneralMessage", MessageId);
        }
      });
    });

    socket.on("addGeneralMessage", (data) => {
      const { MessageSenderLogin, MessageSenderName, MessageContent, MessageImage, MessageDate } = data;

      console.log("Новое сообщение");

      let blobImage = null;
      let fileName = "";

      if (MessageImage) {
        blobImage = MessageImage;
        fileName = `received_${MessageSenderLogin}_${Date.now()}.png`;
        const savePath = `./uploads/${fileName}`;

        fs.promises
          .writeFile(savePath, blobImage)
          .then((result) => {
            console.log("Загружен новый файл!");
          })
          .catch((error) => {
            console.log("Ошибка при загрузке файла!");
          });
      }

      const SQL_QUERY = `INSERT INTO messages (MessageId, MessageSenderLogin, MessageSenderName, MessageContent, MessageImage, MessageDate) 
      VALUE (null, '${MessageSenderLogin}', '${MessageSenderName}','${MessageContent}', '${fileName}','${MessageDate}')`;

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
            MessageImage: fileName,
            MessageDate,
          });
        }
      });
    });

    // socket.on("addGeneralFile", ({blob, sender}) => {
    //   // const { MessageSenderLogin, MessageSenderName, MessageContent, MessageDate } = data;

    //   const fileName = `received_${sender}_${Date.now()}.png`;
    //   const savePath = `./uploads/${fileName}`;

    //   const SQL_QUERY = `INSERT INTO messages (MessageId, MessageSenderLogin, MessageSenderName, MessageContent, MessageImage, MessageDate)
    //   VALUE (null, '${MessageSenderLogin}', '${MessageSenderName}','${MessageContent}', '${}','${MessageDate}')`;

    //   connectionDB.query(selectQuery, (err, result) => {
    //     if (err) {
    //       socket.emit("loadGeneralMessage", null);
    //     } else {
    //       result.forEach((message) => {
    //         socket.emit("loadGeneralMessage", message);
    //       });
    //     }
    //   });

    //   // // Сохраняем файл на диске
    //   // await fs.promises.writeFile(savePath, data);
    //   // console.log(`File saved at ${savePath}`);
    // });

    socket.on("whoIsTyping", (UserName) => {
      socket.broadcast.emit("whoIsTyping", UserName);
    });

    socket.on("disconnect", () => {
      console.log(`Client with ${socket.UserLogin} has been disconnected.`);
    });
  },
};
