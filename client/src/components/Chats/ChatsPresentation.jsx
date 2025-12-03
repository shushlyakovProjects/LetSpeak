import style from "./Chats.module.scss";
import ChatBlock from "./UI/ChatBlock";
import TextareaBlock from "./UI/TextareaBlock";

export default function ChatsPresentation({ ...props }) {
  return (
    <div className={style["wrapper-chat"]}>
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
        // General
        urlServer={props.urlServer}
        // Voice
        recordingVoiceMessage={props.recordingVoiceMessage}
        buttonVoiceMessageRef={props.buttonVoiceMessageRef}
        isRecordingVoiceMessage={props.isRecordingVoiceMessage}
        sendRecordingVoiceMessage={props.sendRecordingVoiceMessage}
        voiceTimerValue={props.voiceTimerValue}
        // Select Message
        setSelectedMessage={props.setSelectedMessage}
        selectedMessage={props.selectedMessage}
        // Image
        setIsLoadImage={props.setIsLoadImage}
        isLoadImage={props.isLoadImage}
        setFileFromBuffer={props.setFileFromBuffer}
        inputFileRef={props.inputFileRef}
        // Message
        whoIsTyping={props.whoIsTyping}
        sendIsTyping={props.sendIsTyping}
        chatRef={props.chatRef}
        sendMessage={props.sendMessage}
        textareaRef={props.textareaRef}
        // Emoje
        addEmoji={props.addEmoji}
        emojiPack={props.emojiPack}
        emojiRef={props.emojiRef}
      />
    </div>
  );
}
