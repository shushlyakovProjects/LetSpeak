import style from "./Chats.module.scss";
import ChatBlock from "./UI/ChatBlock";
import TextareaBlock from "./UI/TextareaBlock";

export default function ChatsPresentation({ ...props }) {
  return (
    <div className={style["wrapper"]}>
      <header className={style["header_main"]}>
        <h2>Общий чат</h2>
        <nav>
          <p>{props.currentUser.UserLogin}</p>
          <button onClick={props.logout}>Сменить аккаунт</button>
        </nav>
      </header>

      <ChatBlock
        urlServer={props.urlServer}
        setSelectedMessage={props.setSelectedMessage}
        messageMenuRef={props.messageMenuRef}
        currentUser={props.currentUser}
        chatRef={props.chatRef}
        messages={props.messages}
        deleteMessage={props.deleteMessage}
      />
      <TextareaBlock
        // af
        recordingVoiceMessage={props.recordingVoiceMessage}
        buttonVoiceMessageRef={props.buttonVoiceMessageRef}
        isRecordingVoiceMessage={props.isRecordingVoiceMessage}
        sendRecordingVoiceMessage={props.sendRecordingVoiceMessage}
        voiceTimerValue={props.voiceTimerValue}
        // sdf
        urlServer={props.urlServer}
        setSelectedMessage={props.setSelectedMessage}
        selectedMessage={props.selectedMessage}
        setFileFromBuffer={props.setFileFromBuffer}
        setIsLoadImage={props.setIsLoadImage}
        isLoadImage={props.isLoadImage}
        inputFileRef={props.inputFileRef}
        whoIsTyping={props.whoIsTyping}
        sendIsTyping={props.sendIsTyping}
        chatRef={props.chatRef}
        sendMessage={props.sendMessage}
        textareaRef={props.textareaRef}
        addEmoji={props.addEmoji}
        emojiPack={props.emojiPack}
        emojiRef={props.emojiRef}
      />
    </div>
  );
}
