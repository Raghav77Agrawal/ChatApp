import { useEffect, useRef } from "react";
import './index.css';
export default function Chatbox(props){
    const chatEndRef = useRef();
     const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [props.chatbox]);
    return (<>
    <div
          id="chatBox"
          className="flex-grow-1 overflow-auto p-2"
          style={{ backgroundColor: '#f0f0f0' }}
        >
          {props.chatbox.map((msg, index) => (
            <div
              key={index}
              className={`my-1 d-flex ${msg.sender === 'you' ? 'justify-content-end' : 'justify-content-start'
                }`}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  backgroundColor: msg.text?(msg.sender === 'you' ? '#dcf8c6' : '#fff'):'#fff',
                  color: 'black',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
                  wordBreak: 'break-word',
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                {/* Triangle pointer (optional) */}
                <span
                  style={{
                    content: '""',
                    position: 'absolute',
                    bottom: '0',
                    [msg.sender === 'you' ? 'right' : 'left']: '-6px',
                    width: '0',
                    height: '0',
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft:
                      msg.sender === 'you'
                        ? '6px solid #dcf8c6'
                        : 'none',
                    borderRight:
                      msg.sender !== 'you'
                        ? '6px solid #fff'
                        : 'none',
                  }}
                ></span>

                {/* Message Content */}
                {msg.text && <div>{msg.text}</div>}

                {msg.audio && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: msg.text ? '6px' : '0',
                    }}
                  >

                    <audio
                      controls
                      src={msg.audio}
                      style={{
                        height: '30px',
                        width: '160px',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
                {msg.file && (
                  <div>
                    {msg.file.type.startsWith('image') && (
                      <img
                        src={msg.file.url}
                        alt={msg.file.name || "User sent image"}
                        style={{ maxWidth: '150px', borderRadius: '8px' }}
                      />
                    )}

                    {msg.file.type.startsWith('video') && (
                      <video
                        src={msg.file.url}
                        controls
                        style={{ maxWidth: '150px', borderRadius: '8px' }}
                      />
                    )}

                    {msg.file.type === 'application/pdf' && (
                      <div className="card my-1" style={{ maxWidth: '200px' }}>
                        <div className="card-body p-2">
                          <h6 className="card-title text-truncate" title={msg.file.name}>
                            📄 {msg.file.name}
                          </h6>
                          <div className="d-flex justify-content-between mt-2">
                            <a
                              href={msg.file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary"
                            >
                              View
                            </a>
                            <a
                              href={msg.file.url}
                              download={msg.file.name}
                              className="btn btn-sm btn-secondary"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    )}


                    {!msg.file.type.startsWith('image') &&
                      !msg.file.type.startsWith('video') &&
                      msg.file.type !== 'application/pdf' && (
                        <a href={msg.file.url} download={msg.file.name}>
                          📁 {msg.file.name}
                        </a>
                      )}
                  </div>
                )}

              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
    
    </>)
}