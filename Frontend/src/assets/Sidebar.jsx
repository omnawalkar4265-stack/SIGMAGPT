import "./Sidebar.css";
import { useContext } from "react";
import logo from "./blacklogo.png";
import { MyContext } from "./MyContext.jsx";

function Sidebar() {
    const {
        conversations,
        activeConversationId,
        startNewChat,
        selectConversation,
        clearAllChats,
        loading,
        storageError
    } = useContext(MyContext);
    const history = conversations
        .filter((conversation) => conversation.messages.length > 0)
        .sort((first, second) => second.updatedAt - first.updatedAt);

    return (

        <div className="sidebar">

       
           {/* logo and new chat button */}
           <div className="logo-header">
            <div className="logo">
                <img src={logo} alt="Logo" />
                <span>SigmaGPT</span>
            </div>

            <button className="new-chat-button" type="button" aria-label="New chat" title="New chat" onClick={startNewChat}>
                <i className="fa-solid fa-pen-to-square"></i>
            </button>

           </div>

           <button className="new-chat-option" type="button" onClick={startNewChat}>
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                <span>New chat</span>
           </button>
           {storageError && <p className="storage-error" role="alert">{storageError}</p>}

           {/* chat history */}
           <div className="history">
            <ul>
                {history.map((conversation) => (
                    <li key={conversation.id}>
                        <button
                            className={`history-item${conversation.id === activeConversationId ? ' active' : ''}`}
                            type="button"
                            onClick={() => selectConversation(conversation.id)}
                            title={conversation.title}
                        >
                            {conversation.title}
                        </button>
                    </li>
                ))}
            </ul>
           </div>
           <button
                className="clear-history-button"
                type="button"
                onClick={() => {
                    if (window.confirm('Clear all chat history? This cannot be undone.')) {
                        clearAllChats();
                    }
                }}
                disabled={!history.length || loading}
           >
                <i className="fa-solid fa-trash" aria-hidden="true"></i>
                <span>Clear all chats</span>
           </button>
            
           

           {/* sign */}
           <div className="sign">
            <p>By OM</p>
            <div className="heart">❤️</div>
           </div>
        </div>
    );
}

export default Sidebar;