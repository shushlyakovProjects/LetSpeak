import style from "./Chats.module.scss";
import ChatBlock from "./UI/ChatBlock";
import TextareaBlock from "./UI/TextareaBlock";

export default function ChatsPresentation({
  urlServer,
  logout,
  sendMessage,
  messages,
  currentUser,
  chatRef,
  deleteMessage,
  textareaRef,
  addEmoji,
  emojiPack,
  emojiRef,
  sendIsTyping,
  whoIsTyping,

  inputFileRef,
  isLoadImage,
  setIsLoadImage,
  setFileFromBuffer,
  messageMenuRef,
  selectedMessage,
  setSelectedMessage,
  
  recordingVoiceMessage,
  buttonVoiceMessageRef,
  isRecordingVoiceMessage,
  sendRecordingVoiceMessage,
}) {
  return (
    <div className={style["wrapper"]}>
      <header className={style["header_main"]}>
        <h2>Общий чат</h2>
        <nav>
          <p>{currentUser.UserLogin}</p>
          <button onClick={logout}>Сменить аккаунт</button>
        </nav>
      </header>

      <ChatBlock
        urlServer={urlServer}
        setSelectedMessage={setSelectedMessage}
        messageMenuRef={messageMenuRef}
        currentUser={currentUser}
        chatRef={chatRef}
        messages={messages}
        deleteMessage={deleteMessage}
      />
      <TextareaBlock
        recordingVoiceMessage={recordingVoiceMessage}
        buttonVoiceMessageRef={buttonVoiceMessageRef}
        isRecordingVoiceMessage={isRecordingVoiceMessage}
        sendRecordingVoiceMessage={sendRecordingVoiceMessage}

        urlServer={urlServer}
        setSelectedMessage={setSelectedMessage}
        selectedMessage={selectedMessage}
        setFileFromBuffer={setFileFromBuffer}
        setIsLoadImage={setIsLoadImage}
        isLoadImage={isLoadImage}
        inputFileRef={inputFileRef}
        whoIsTyping={whoIsTyping}
        sendIsTyping={sendIsTyping}
        chatRef={chatRef}
        sendMessage={sendMessage}
        textareaRef={textareaRef}
        addEmoji={addEmoji}
        emojiPack={emojiPack}
        emojiRef={emojiRef}
      />
    </div>
  );
}
