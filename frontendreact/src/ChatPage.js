import io from 'socket.io-client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import { Header } from './Header';
import Chatbox from './Chatbox';
import Footer from './Footer';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

function ChatPage({ user }) {
  const [socket, setSocket] = useState(null);
  const [chatbox, setChatbox] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const [myuser, setmyuser] = useState(user);
  const [message, setMessages] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isDisabled, setDisable] = useState(false);
  const [sendDisable, setSendDisable] = useState(true);
  const navigate = useNavigate();



  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    //used for sending userid
    socketInstance.on('connect', () => {
      socketInstance.emit('init', user._id);
    });
    
    socketInstance.on('partnerfound', (roomid) => {
      setSendDisable(false);
      setDisable(false);
      //sends info of current user to partner
      socketInstance.emit('partnerinfo', user);
      setToastMsg('Bravo! Partner Found, now you can chat!!');
    });
    socketInstance.on('Finding', (data) => {
      setDisable(true);
      setmyuser(user);
      setToastMsg('Finding the user! You will be notified as soon as user joins');
    })
//adds partner msg in chatbox
    socketInstance.on('mymessage', (data) => {
      if (data.sender !== socketInstance.id) {
        setChatbox((prev) => [...prev, { sender: 'them', text: data.msg }]);

      }
    });

    socketInstance.on('partnerleft', () => {
      setChatbox([]);
      setMessages("");
      setSendDisable(true);
      setmyuser(user);
      setToastMsg('OOPS! Partner Left');
    });

    socketInstance.on('logout', () => {
      socketInstance.emit('leave');
      setChatbox([]);
      setMessages("");

      setSendDisable(true);
      navigate('/');
    });
    socketInstance.on('partnerTyping', () => {
      setIsPartnerTyping(true);
    });

    socketInstance.on('partnerStopTyping', () => {
      setIsPartnerTyping(false);
    });
    // adds voice data in chatbox
    socketInstance.on('voice', (audioData) => {
      const audioBlob = new Blob([audioData], { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);

      setChatbox((prev) => [
        ...prev,
        { sender: 'them', audio: audioUrl }
      ]);
    });
    //adds file data in chatbox
    socketInstance.on('file', ({ name, type, buffer }) => {
      const blob = new Blob([new Uint8Array(buffer)], { type });
      const url = URL.createObjectURL(blob);

      setChatbox(prev => [...prev, { sender: 'them', file: { url, name, type } }]);
    });
    // updates partner info in current user data
    socketInstance.on('partnerinfo', (usr) => {
      setmyuser(usr);
    })


    // Clean up the socket connection when the component unmounts
    return () => {
      socketInstance.disconnect();
    };
  }, [navigate, user]);




  return (

    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `url("/Assets/back.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >


      <div
        id="chatSection"
        className="bg-white rounded shadow d-flex flex-column"
        style={{ width: '400px', height: '80vh' }}
      >
        <Header
          isDisabled={isDisabled}
          isPartnerTyping={isPartnerTyping}
          sendDisable={sendDisable}
          setSendDisable={setSendDisable}
          setChatbox={setChatbox}
          setMessages={setMessages}
          setDisable={setDisable}
          socket={socket}
          toastMsg={toastMsg}
          setToastMsg={setToastMsg}
          user={myuser}
          apnadata={user}
        ></Header>

        <Chatbox chatbox={chatbox}></Chatbox>
        <Footer
          message={message}
          sendDisable={sendDisable}
          socket={socket}
          setChatbox={setChatbox}
          setMessages={setMessages}
        > </Footer>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}

      </div>
    </div>



  );
}

export default ChatPage;
