const connectionDB = require("./dbController");
const fs = require("fs");

const Rooms = new Map();

module.exports = {
  socketHandler: (socket, io) => {
    console.log("New connection on socket!");

    socket.on("connectToSocket", ({ UserLogin, UserName }) => {
      if (!UserLogin || !UserName) return;
      socket.UserLogin = UserLogin;
      console.log(`Client with login ${UserLogin} has been connected to Socket!`);
      socket.broadcast.emit("connectToSocket", UserName);
    });

    // WebSocket - Чат
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
    // WebSocket - Чат

    // WebRTC - Конференция
    socket.on("OFFER", (offer) => {
      // console.log('offer');
      const { friendLogin, initiatorLogin } = JSON.parse(offer);

      const selectQuery = `SELECT * FROM rooms WHERE (Part1='${friendLogin}' AND Part2='${initiatorLogin}') OR (Part1='${initiatorLogin}' AND Part2='${friendLogin}')`;
      connectionDB.query(selectQuery, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          if (!result.length) {
            console.error("Комнаты нет. Должна была быть создана при подключении...");
          } else {
            const { RoomId } = result[0];
            console.log(`Ваша комната №${RoomId}`);
            console.log(`OFFER. Пользователь ${initiatorLogin} присоединился к комнате №${RoomId} и ждет собеседника!`);
            offer = JSON.parse(offer);
            offer.RoomId = RoomId;
            offer = JSON.stringify(offer);
            socket.broadcast.to(RoomId).emit("OFFER", offer);

            Rooms.set(socket, { ...Rooms.get(socket), inCall: true });
          }
        }
      });
    });

    socket.on("ANSWER", (answer) => {
      // console.log("ОТВЕТ", answer);
      const RoomId = Rooms.get(socket).RoomId;
      console.log(`ANSWER. Беседа в комнате №${RoomId} началась успешно!`);

      const setDateQuery = `UPDATE rooms SET DateLastCall = '${new Date()}' WHERE rooms.RoomId = '${RoomId}'`;
      connectionDB.query(setDateQuery, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Дата беседы актуализирована!");
        }
      });

      socket.join(RoomId);
      Rooms.set(socket, { ...Rooms.get(socket), inCall: true });
      socket.broadcast.to(RoomId).emit("ANSWER", answer);
    });

    socket.on("ICE_CANDIDATE", (candidate) => {
      const RoomId = Rooms.get(socket)?.RoomId;
      console.log(`ICE_CANDIDATE. Room № ${RoomId}`);
      socket.broadcast.to(RoomId).emit("ICE_CANDIDATE", candidate);
    });

    socket.on("JOIN_ROOM", ({ initiatorLogin, friendLogin }) => {
      // console.log("JOIN_ROOM");

      const selectQuery = `SELECT * FROM rooms WHERE (Part1='${friendLogin}' AND Part2='${initiatorLogin}') OR (Part1='${initiatorLogin}' AND Part2='${friendLogin}')`;
      connectionDB.query(selectQuery, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          if (!result.length) {
            console.log("Комнаты пока нет. Создаем...");
            const createQuery = `INSERT INTO rooms (RoomId, Part1, Part2, DateCreat, DateLastCall) VALUES (NULL, '${initiatorLogin}', '${friendLogin}', '${new Date()}', null)`;
            connectionDB.query(createQuery, (err, result) => {
              if (err) {
                console.log(err);
              } else {
                const RoomId = result.insertId;
                console.log(`Комната №${RoomId} создана успешно!`);
                console.log(`JOIN_ROOM. Пользователь ${initiatorLogin} присоединился к комнате №${RoomId}!`);
                socket.join(RoomId);
                Rooms.set(socket, { RoomId, UserLogin: initiatorLogin, inCall: false });

                const roomInfo = Array.from(Rooms).map((room) => {
                  const info = room[1];
                  if (info.RoomId == RoomId) return info;
                });
                socket.emit("JOIN_ROOM", roomInfo);
              }
            });
          } else {
            const { RoomId } = result[0];
            console.log(`JOIN_ROOM. Пользователь ${initiatorLogin} присоединился к комнате №${RoomId}!`);
            socket.join(RoomId);
            Rooms.set(socket, { RoomId, UserLogin: initiatorLogin, inCall: false });

            const roomInfo = Array.from(Rooms).map((room) => {
              const info = room[1];
              if (info.RoomId == RoomId) return info;
            });
            socket.emit("JOIN_ROOM", roomInfo);
          }
        }
      });
    });

    socket.on("LEAVE_CALL", () => {
      const RoomId = Rooms.get(socket)?.RoomId;
      Rooms.set(socket, { ...Rooms.get(socket), inCall: false });
      socket.broadcast.to(RoomId).emit("LEAVE_CALL", Rooms.get(socket));
    });

    socket.on("LEAVE_ROOM", ({ UserLogin }) => {
      const RoomId = Rooms.get(socket).RoomId;
      console.log(`LEAVE_ROOM. Пользователь ${UserLogin} отключился от комнаты №${RoomId}`);
      socket.leave(RoomId);
      Rooms.delete(socket);
      // socket.broadcast.to(RoomId).emit("LEAVE_ROOM", UserLogin);
      socket.broadcast.to(RoomId).emit("LEAVE_CALL", Rooms.get(socket));
    });
    // WebRTC - Конференция

    // Отключение
    socket.on("disconnect", () => {
      const RoomId = Rooms.get(socket)?.RoomId;
      if (RoomId) socket.leave(RoomId);
      Rooms.delete(socket);
      console.log(`Client with login ${socket.UserLogin} has been disconnected from Socket!`);
    });
  },
};
