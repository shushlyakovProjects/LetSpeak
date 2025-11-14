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
  sendVoiceMessage,
  inputFileRef,
  isLoadImage,
  setIsLoadImage,
  setFileFromBuffer,
  messageMenuRef,
  selectedMessage,
  setSelectedMessage,
}) {
  return (
    <div className={style["wrapper"]}>
      <header>
        <h2>Общий чат</h2>
        <nav>
          <p>{currentUser.UserLogin}</p>
          <button onClick={logout}>Сменить аккаунт</button>
        </nav>
      </header>

      <ChatBlock urlServer={urlServer} setSelectedMessage={setSelectedMessage} messageMenuRef={messageMenuRef}  currentUser={currentUser} chatRef={chatRef} messages={messages} deleteMessage={deleteMessage} />
      <TextareaBlock urlServer={urlServer} setSelectedMessage={setSelectedMessage} selectedMessage={selectedMessage} setFileFromBuffer={setFileFromBuffer} setIsLoadImage={setIsLoadImage} isLoadImage={isLoadImage} inputFileRef={inputFileRef} sendVoiceMessage={sendVoiceMessage} whoIsTyping={whoIsTyping} sendIsTyping={sendIsTyping} chatRef={chatRef} sendMessage={sendMessage} textareaRef={textareaRef} addEmoji={addEmoji} emojiPack={emojiPack} emojiRef={emojiRef}
      />
    </div>
  );
}
