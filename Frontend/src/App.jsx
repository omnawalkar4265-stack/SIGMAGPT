import './App.css';
import { useEffect, useState } from 'react';
import ChatWindow from './assets/ChatWindow';
import Sidebar from './assets/Sidebar';
import { MyContext } from './assets/MyContext';

const CHAT_STORAGE_KEY = 'sigmagpt-conversations';

function createConversation() {
  return {
    id: crypto.randomUUID(),
    title: 'New chat',
    messages: [],
    updatedAt: Date.now()
  };
}

function loadChatState() {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) {
      const conversation = createConversation();
      return {
        conversations: [conversation],
        activeConversationId: conversation.id,
        storageError: ''
      };
    }

    const parsed = JSON.parse(stored);
    if (
      !Array.isArray(parsed.conversations) ||
      !parsed.conversations.every((conversation) =>
        conversation &&
        typeof conversation.id === 'string' &&
        typeof conversation.title === 'string' &&
        Array.isArray(conversation.messages) &&
        conversation.messages.every((message) =>
          message &&
          ['user', 'assistant'].includes(message.role) &&
          typeof message.content === 'string'
        )
      )
    ) {
      throw new Error('Saved chat data has an invalid format.');
    }

    const conversations = parsed.conversations;
    const activeConversation =
      conversations.find((conversation) => conversation.id === parsed.activeConversationId) ??
      conversations[conversations.length - 1] ??
      createConversation();

    if (!conversations.length) conversations.push(activeConversation);

    return {
      conversations,
      activeConversationId: activeConversation.id,
      storageError: ''
    };
  } catch (loadError) {
    console.error('Unable to load saved chats:', loadError);
    const conversation = createConversation();
    return {
      conversations: [conversation],
      activeConversationId: conversation.id,
      storageError: 'Saved chats could not be loaded from this browser.'
    };
  }
}

function App() {
  const [initialChatState] = useState(loadChatState);
  const [prompt, setPrompt] = useState('');
  const [conversations, setConversations] = useState(initialChatState.conversations);
  const [activeConversationId, setActiveConversationId] = useState(
    initialChatState.activeConversationId
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState(initialChatState.storageError);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  );
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    try {
      localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify({ conversations, activeConversationId })
      );
      setStorageError('');
    } catch (saveError) {
      console.error('Unable to save chats:', saveError);
      setStorageError('Chats could not be saved in this browser.');
    }
  }, [conversations, activeConversationId]);

  const setMessages = (update) => {
    setConversations((currentConversations) => {
      const current = currentConversations.find(
        (conversation) => conversation.id === activeConversationId
      );
      const nextMessages =
        typeof update === 'function' ? update(current?.messages ?? []) : update;
      const firstUserMessage = nextMessages.find((message) => message.role === 'user');
      const title = firstUserMessage
        ? firstUserMessage.content.slice(0, 40) || 'New chat'
        : current?.title ?? 'New chat';
      const updatedConversation = {
        ...(current ?? {
          id: activeConversationId,
          title: 'New chat',
          messages: [],
          updatedAt: Date.now()
        }),
        id: activeConversationId,
        title,
        messages: nextMessages,
        updatedAt: Date.now()
      };

      return current
        ? currentConversations.map((conversation) =>
            conversation.id === activeConversationId ? updatedConversation : conversation
          )
        : [...currentConversations, updatedConversation];
    });
  };

  const startNewChat = () => {
    setPrompt('');
    setError('');

    if (messages.length === 0) return;

    const conversation = createConversation();
    setConversations((current) => [...current, conversation]);
    setActiveConversationId(conversation.id);
  };

  const selectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    setPrompt('');
    setError('');
  };

  const clearAllChats = () => {
    const conversation = createConversation();
    setConversations([conversation]);
    setActiveConversationId(conversation.id);
    setPrompt('');
    setError('');
  };

  return (
    <MyContext.Provider
      value={{
        prompt,
        setPrompt,
        messages,
        setMessages,
        conversations,
        activeConversationId,
        startNewChat,
        selectConversation,
        clearAllChats,
        loading,
        setLoading,
        error,
        setError,
        storageError
      }}
    >
      <div className="App">
        <Sidebar />
        <ChatWindow />
      </div>
    </MyContext.Provider>
  );
}

export default App;