import { useEffect, useRef, useState } from "react";
import Toast from "./Toast";
export function Header(props) {
    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const [showPartnerInfo, setShowPartnerInfo] = useState(false);
    const fileInputRef = useRef();
    const attachmentRef = useRef();
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                attachmentRef.current &&
                !attachmentRef.current.contains(event.target)
            ) {
                setShowAttachmentOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);





    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;


        //  Checks file size
        if (file.size > 1 * 1024 * 1024) { // example: > 1 MB
            props.setToastMsg("File too large. Please upload files smaller than 1MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            props.socket.emit('file', {
                name: file.name,
                type: file.type,
                buffer: arrayBuffer,
            });

            const blob = new Blob([arrayBuffer], { type: file.type });
            const url = URL.createObjectURL(blob);

            props.setChatbox(prev => [...prev, { sender: 'you', file: { url, name: file.name, type: file.type } }]);
        };

        reader.readAsArrayBuffer(file);
    };


    const handleFileSelect = (accept) => {
        fileInputRef.current.accept = accept;
        fileInputRef.current.click();
    };
    const checkRandom = () => {
        props.setDisable(true);
        props.socket.emit('leave');
        props.socket.emit('findPartner');
        props.setSendDisable(true);
        props.setMessages("");
        props.setChatbox([]);
    };

    const logout = async () => {
        props.socket.emit('leave');
        props.socket.emit('logout', props.apnadata);
        props.setChatbox([]);
        props.setMessages("");
        props.setSendDisable(true);
        props.setDisable(false);
        window.location.reload();
    };

    return (
        <>
            <div className="p-2 border-bottom">
                <div className="d-flex flex-wrap align-items-center justify-content-between">
                    <div>
                        <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
                            {props.apnadata._id === props.user._id ? "You" : props.user.name}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#666" }}>
                            {props.isPartnerTyping ? "Typing…" : "Online"}
                        </div>
                    </div>

                    <div style={{ position: "relative", display: "inline-block" }}>

                        {!props.isDisabled && (
                            <div
                                onMouseEnter={() => setShowPartnerInfo(true)}
                                onMouseLeave={() => setShowPartnerInfo(false)}
                                style={{ position: "relative", display: "inline-block" }}

                            >

                                <button
                                    className="btn btn-light btn-sm mx-1"
                                    disabled={props.isDisabled}
                                >
                                    <i className="fa-solid fa-circle-info"></i>
                                </button>


                                {showPartnerInfo && (
                                    <div
                                        className="card shadow"
                                        style={{
                                            position: 'absolute',
                                            top: '50px',
                                            right: '10px',
                                            zIndex: 1000,
                                            width: '220px'
                                        }}
                                    >
                                        <div className="card-header text-center p-2">
                                            <strong>{props.user._id === props.apnadata._id ? "Your Details" : "Partner Details"}</strong>
                                        </div>
                                        <div className="card-body p-2">
                                            <p className="mb-1"><strong>Name:</strong> {props.user.name}</p>
                                            <p className="mb-1"><strong>Age:</strong> {props.user.age}</p>
                                            <p className="mb-1"><strong>Gender:</strong> {props.user.gender}</p>
                                            <p className="mb-0"><strong>Interests:</strong> {props.user.interests}</p>
                                        </div>

                                    </div>
                                )}
                            </div>



                        )}
                        <button
                            className="btn btn-primary btn-sm mx-1"
                            disabled={props.isDisabled}
                            onClick={checkRandom}
                        >
                           Find Partner
                        </button>

                        <button
                            className="btn btn-light mx-1"
                            onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                            disabled={props.sendDisable}
                        >
                            <i className="fa-solid fa-paperclip"></i>
                        </button>

                        <button
                            className="btn btn-outline-danger btn-sm mx-1"
                            onClick={logout}
                        >
                            <i className="fa-solid fa-door-open"></i>
                        </button>


                        {showAttachmentOptions && (
                            <div
                                ref={attachmentRef}
                                className="bg-white shadow rounded"
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 4px)",
                                    right: 0,
                                    zIndex: 1000,
                                    minWidth: "150px"
                                }}
                            >
                                <button onClick={() => {
                                    handleFileSelect("image/*");
                                    setShowAttachmentOptions(false);
                                }
                                } className="dropdown-item">
                                    📷 Image
                                </button>
                                <button onClick={() => {
                                    handleFileSelect("video/*");
                                    setShowAttachmentOptions(false);
                                }} className="dropdown-item">
                                    🎥 Video
                                </button>
                                <button onClick={() => {
                                    handleFileSelect("application/pdf");
                                    setShowAttachmentOptions(false);
                                }} className="dropdown-item">
                                    📄 PDF
                                </button>
                                <button onClick={() => {
                                    handleFileSelect("*/*");
                                    setShowAttachmentOptions(false);
                                }} className="dropdown-item">
                                    📁 File
                                </button>
                            </div>
                        )}



                    </div>

                    {props.toastMsg && <Toast message={props.toastMsg} onClose={() => props.setToastMsg("")} />}
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

        </>
    )
}