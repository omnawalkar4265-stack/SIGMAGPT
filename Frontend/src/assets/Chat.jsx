import "./Chat.css";
import { useContext } from "react";
import { MyContext } from "./MyContext.jsx";


function Chat() {
    const { messages } = useContext(MyContext);

    return (
        <div className="chat">
            <div className="messages" aria-live="polite">
                {messages.map((message, index) => (
                    <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                        {message.content}
                    </div>
                ))}
            </div>
        </div>
    
    );
}

export default Chat; 