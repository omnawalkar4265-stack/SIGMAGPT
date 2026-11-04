import { createContext } from 'react';

export const MyContext = createContext({
  prompt: '',
  setPrompt: () => {},
  messages: [],
  setMessages: () => {},
  conversations: [],
  activeConversationId: '',
  startNewChat: () => {},
  selectConversation: () => {},
  clearAllChats: () => {},
  loading: false,
  setLoading: () => {},
  error: '',
  setError: () => {},
  storageError: ''
});