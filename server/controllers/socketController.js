const connectionDB = require("./dbController");
const fs = require("fs");
let = ConferenceParticipants = [];

module.exports = {
  socketHandler: (socket, io) => {
    console.log("New connection on socket!");
    // io.ConferenceParticipants = [];

    socket.on("connectToSocket", ({ UserLogin, UserName }) => {
      if (!UserLogin || !UserName) return;
      socket.UserLogin = UserLogin;
      console.log(`Client with login ${UserLogin} has been connected to Socket!`);
      socket.broadcast.emit("connectToSocket", UserName);
    });

    socket.on("getGeneralChat", () => {
      const selectQuery = "SELECT * FROM messages";
      connectionDB.query(selectQuery, (err, result) => {
        if (err) {
          socket.emit("loadGeneralChat", null);
        } else {
          result.forEach((message) => {
            socket.emit("loadGeneralChat", message);
          });
        }
      });
    });

    socket.on("deleteGeneralMessage", (MessageDeleted) => {
      const { MessageId, MessageSenderLogin, MessageImage, MessageVoiceContent } = MessageDeleted;
      const SQL_QUERY = `DELETE FROM messages WHERE MessageId = '${MessageId}' AND MessageSenderLogin = '${MessageSenderLogin}'`;
      connectionDB.query(SQL_QUERY, (err, result) => {
        if (err) {
          console.log("Ошибка базы данных при удалении сообщения в общием чате");
        } else {
          if (MessageImage) {
            try {
              const imagePath = `./uploads/images/${MessageImage}`;
              fs.unlinkSync(imagePath);
            } catch (error) {
              console.log(error);
            }
          }
          if (MessageVoiceContent) {
            try {
              const voicePath = `./uploads/voices/${MessageVoiceContent}`;
              fs.unlinkSync(voicePath);
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
      const {
        MessageSenderLogin,
        MessageSenderName,
        MessageContent,
        MessageImage,
        MessageDate,
        MessageAnswerOn,
        MessageVoiceContent,
      } = data;

      console.log("Новое сообщение");

      let blobVoice = null;
      let fileNameVoice = "";

      if (MessageVoiceContent) {
        blobVoice = MessageVoiceContent;
        fileNameVoice = `received_${MessageSenderLogin}_${Date.now()}.webm`;
        const savePath = `./uploads/voices/${fileNameVoice}`;

        fs.promises
          .writeFile(savePath, blobVoice)
          .then((result) => {
            console.log("Загружена новая голосовая запись!");
          })
          .catch((error) => {
            console.log("Ошибка при загрузке файла!");
          });
      }

      let blobImage = null;
      let fileNameImage = "";

      if (MessageImage) {
        blobImage = MessageImage;
        fileNameImage = `received_${MessageSenderLogin}_${Date.now()}.png`;
        const savePath = `./uploads/images/${fileNameImage}`;

        fs.promises
          .writeFile(savePath, blobImage)
          .then((result) => {
            console.log("Загружено новое изображение!");
          })
          .catch((error) => {
            console.log("Ошибка при загрузке файла!");
          });
      }

      const SQL_QUERY = `INSERT INTO messages (MessageId, MessageSenderLogin, MessageSenderName, MessageContent, MessageImage, MessageVoiceContent, MessageDate, MessageAnswerOn) 
      VALUE (null, '${MessageSenderLogin}', '${MessageSenderName}','${MessageContent}', '${fileNameImage}', '${fileNameVoice}','${MessageDate}', '${MessageAnswerOn}')`;

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
            MessageImage: fileNameImage,
            MessageVoiceContent: fileNameVoice,
            MessageDate,
            MessageAnswerOn,
          });
        }
      });
    });

    socket.on("whoIsTyping", (UserName) => {
      socket.broadcast.emit("whoIsTyping", UserName);
    });

    socket.on("showParticipantConference", () => {
      socket.emit("showParticipantConference", ConferenceParticipants);
    });

    socket.on("addParticipantConference", (user) => {
      ConferenceParticipants.push(user);
      io.emit("addParticipantConference", ConferenceParticipants);
    });

    socket.on("leaveParticipantConference", (user) => {
      ConferenceParticipants = ConferenceParticipants.filter((curuser) => curuser.UserLogin != user.UserLogin);
      io.emit("leaveParticipantConference", ConferenceParticipants);
    });

    socket.on("streamConference", (data) => {
      console.log(data);
      socket.broadcast.emit("streamConference", data); // Рассылаем полученный звук остальным подключённым пользователям
    });

    socket.on("disconnect", () => {
      ConferenceParticipants = ConferenceParticipants.filter((curuser) => curuser.UserLogin != socket.UserLogin);
      io.emit("leaveParticipantConference", ConferenceParticipants);
      console.log(`Client with ${socket.UserLogin} has been disconnected.`);
    });
  },
};
