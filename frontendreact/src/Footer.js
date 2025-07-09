import { useEffect, useRef, useState } from "react";
import EmojiPicker from 'emoji-picker-react';

export default function Footer(props){
  const typingTimeoutRef = useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const emojiPickerRef = useRef();
const emojiButtonRef = useRef();
const [isRecording, setIsRecording] = useState(false);
const [mediaRecorder, setMediaRecorder] = useState(null);
const streamRef = useRef(null);
const chunksRef = useRef([]);


    useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target) &&
      emojiButtonRef.current &&
      !emojiButtonRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);
const startRecording = async () => {
  if (isRecording) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    chunksRef.current = []; // reset chunks

    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop =  () => {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log("Audio URL:", audioUrl);

      // Send to partner
      props.socket.emit('voice', audioBlob);

      // Show in own chat
      props.setChatbox((prev) => [
        ...prev,
        { sender: 'you', audio: audioUrl }
      ]);
    };

    recorder.start();
    setIsRecording(true);
  } catch (err) {
    console.error('Error accessing mic', err);
  }
};

const stopRecording = () => {
  if (!isRecording || !mediaRecorder) return;

  mediaRecorder.stop();
  streamRef.current?.getTracks().forEach((track) => track.stop());
  setIsRecording(false);
};



 

  const send = () => {
    if (props.message.trim() !== "") {
      props.setChatbox((prev) => [...prev, { sender: 'you', text: props.message }]);
      props.setMessages(""); // Clear input after sending
      props.socket.emit('message', props.message);
    }
  };
const handletyping = (e) =>{
  props.setMessages(e.target.value)
  props.socket.emit('typing');

  clearTimeout(typingTimeoutRef.current);

  typingTimeoutRef.current = setTimeout(() => {
    props.socket.emit('stopTyping');
  }, 1000);
}
    return (
        <div className="p-2 border-top d-flex position-relative">
  {!isRecording ? (
  <button
    className="btn btn-light mx-1"
    onClick={startRecording}
    disabled={props.sendDisable}

  >
    <i class="fa-solid fa-microphone-slash"></i>
  </button>
) : (
  <button
    className="btn btn-light mx-1"
    onClick={stopRecording}
  >
   <i class="fa-solid fa-microphone"></i>
  </button>
)}
<div style={{ position: 'relative', flexGrow: 1 }}>
  <textarea
    rows={1}
    id="message"
    placeholder="Type a message..."
    onChange={handletyping}
    value={props.message}
    disabled={props.sendDisable}
    className="form-control"
    style={{
      resize: 'none',
      overflow: 'hidden',
      paddingRight: '40px', // leave space for emoji button
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    }}
  />

  {/* Emoji button inside input */}
  <button
    ref={emojiButtonRef}
    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
    disabled={props.sendDisable}
    style={{
      position: 'absolute',
      right: '10px',
      bottom: '50%',
      transform: 'translateY(50%)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '18px',
      color: '#555',
    }}
  >
    <i class="fa-solid fa-face-smile" ></i>
  </button>

  {/* Emoji picker */}
  {showEmojiPicker && (
    <div
      ref={emojiPickerRef}
      style={{
        position: 'absolute',
        bottom: '40px',
        right: '0',
        zIndex: 1000,
      }}
    >
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          props.setMessages((prev) => prev + emojiData.emoji);
        }}
      />
    </div>
  )}
</div>

  

  <button
    className="btn btn-light mx-1"
    onClick={send}
    disabled={props.sendDisable}
  >
   <i class="fa-solid fa-paper-plane"></i>
  </button>
  

  
</div>
    )
}