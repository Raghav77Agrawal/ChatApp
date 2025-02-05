import io from 'socket.io-client';
import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
const SOCKET_URL = 'http://localhost:5000';
function ChatPage(){
    const [socket,setSocket] = useState(null);
    const [chatbox,setChatbox] = useState([]);
    const [message,setMessages] = useState("");
    const [isDisabled, setdisable] = useState(false);
    const [sendisable, setdis] = useState(true);
    const navigate = useNavigate();
    
    useEffect((socket) => {
        // Establish socket connection when component mounts
         // Redirect if not authenticated
      
        const socketInstance = io(SOCKET_URL);
        setSocket(socketInstance);
    
        // Listen for incoming messages
        socketInstance.on('partnerfound', (roomid)=>{
          setdis(false);
          setdisable(false);
          
          alert('Bravo! Partner Found , now you can chat!!')
        })
        socketInstance.on('mymessage', (data)=>{
          console.log(data);
          if(data.sender!==socket.id){
              setChatbox((prev) => [...prev, `<strong>Partner:</strong> ${data.msg}`]);
          }
         })
         socketInstance.on('partnerleft', (message)=>{
          setChatbox([]);
          setMessages("");
          setdis(true);
          alert('OOPS! Partner Left');
         })
         socketInstance.on('logout',()=>{
          socket.emit('leave');
          setChatbox([]);
          setMessages("");
          setdis(true);
          navigate('/');
         })
    
        // Clean up the socket connection when component unmounts
        return () => {
          socketInstance.disconnect();
        };
      }, [navigate]);
    function checkrandom(){
setdisable(true);
socket.emit('leave');
socket.emit('findPartner');
setMessages("");
setChatbox([]);
    }
   async function logout(){
      socket.emit('leave');
      await fetch("http://localhost:5000/m/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials:"include"
      });
      setChatbox([]);
      setMessages("");
      setdis(true);
      setdisable(false);
      window.location.reload();
    }
    function send(){
      if (message.trim() !== "") {
        const msgval = message;
        setChatbox((prev) => [...prev, `<strong>You:</strong> ${message}`]);
        setMessages(""); // Clear input after sending
        socket.emit('message', msgval);
      }
    }
    return<>
    <div id="chatSection" className = 'container mt-3 mx-3'>
        <button  type="submit" id="findPartner" className="btn btn-primary mb-3" disabled = {isDisabled} onClick={checkrandom}>Find a Random Partner</button>

    <button type="submit" id="leaveApp" className="btn btn-danger mb-3" onClick={logout}>Leave Application</button>
        <div id="chatBox" value = {chatbox}></div>
        <input type="text" id="message" placeholder="Type a message..." value = {message} disabled = {sendisable}/>
        <button id="send" className = 'btn btn-primary' onClick={send} disabled = {sendisable} >Send</button>
    </div>
    </>
}
export  default ChatPage;