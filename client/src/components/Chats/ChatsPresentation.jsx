import style from "./Chats.module.scss";
import ChatBlock from "./UI/ChatBlock";
import TextareaBlock from "./UI/TextareaBlock";

export default function ChatsPresentation({
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

      <ChatBlock currentUser={currentUser} chatRef={chatRef} messages={messages} deleteMessage={deleteMessage} />
      <TextareaBlock sendMessage={sendMessage} textareaRef={textareaRef} addEmoji={addEmoji} emojiPack={emojiPack} emojiRef={emojiRef}
      />
    </div>
  );
}
