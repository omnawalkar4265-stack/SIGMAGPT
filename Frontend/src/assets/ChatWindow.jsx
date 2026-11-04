import './ChatWindow.css';
import { useContext, useEffect, useRef } from 'react';
import Chat from './Chat.jsx';
import { MyContext } from './MyContext.jsx';

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    setMessages,
    loading,
    setLoading,
    error,
    setError
  } = useContext(MyContext);
  const promptInputRef = useRef(null);

  useEffect(() => {
    const handlePageKeyDown = (event) => {
      if (
        loading ||
        event.defaultPrevented ||
        event.isComposing ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.key.length !== 1
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"], button, a, [role="button"]')
      ) {
        return;
      }

      event.preventDefault();
      promptInputRef.current?.focus();
      setPrompt((currentPrompt) => currentPrompt + event.key);
    };

    window.addEventListener('keydown', handlePageKeyDown);
    return () => window.removeEventListener('keydown', handlePageKeyDown);
  }, [loading, setPrompt]);

  const getReply = async (event) => {
    event.preventDefault();
    const message = prompt.trim();
    if (!message || loading) return;

    setLoading(true);
    setError('');
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', content: message }
    ]);
    setPrompt('');

    try {
      const response = await fetch(
        `http://localhost:8080/api/ask?message=${encodeURIComponent(message)}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to get a response.');
      }
      if (typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('The server returned an empty response.');
      }
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: data.answer }
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to connect to the chat server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatWindow"> 
      <div className="nav-bar">
        <span>
          SigmaGpt <i className="fa-solid fa-chevron-down"></i>
        </span>
        <div className="user-avatar">
          <i className="fa-solid fa-user"></i>
        </div>
      </div>

      <Chat />
      {loading && (
        <div className="loading" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <span className="loading-label">Generating response</span>
        </div>
      )}

      <div className="input-bar">
        <form className="prompt-box" onSubmit={getReply}>
          <input
            ref={promptInputRef}
            type="text"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask Anything"
            aria-label="Ask anything"
            disabled={loading}
          />
          <button className="icon" type="submit" aria-label="Send message" disabled={loading || !prompt.trim()}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
        {error && <p className="request-error" role="alert">{error}</p>}
        <div className="info">
          <p>SigmaGpt can make mistakes. Check important info.</p>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;