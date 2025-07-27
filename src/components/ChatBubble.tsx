import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot } from 'lucide-react';
import { useCafeContext } from '../hooks/useCafeContext';
import { useChatSession } from '../hooks/useChatSession';
import { supabase } from '../integrations/supabase/client';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBubbleProps {
  // No props needed - we'll get context from hook and API key from edge function
}

/**
 * Creates a dynamic system prompt using live café data
 * This ensures the chatbot always has current information
 */
const createSystemPrompt = (contextString: string, cafeName: string): string => {
  return `You are the friendly AI assistant for ${cafeName}, a cozy cat café. You have a warm, welcoming personality like a knowledgeable barista who adores cats. Your responses should be helpful, playful, and always cat-themed when appropriate.

IMPORTANT BEHAVIORAL RULES:
- Only respond based on the café information provided below
- If asked about topics outside this context (weather, politics, general AI questions, etc.), politely redirect back to café topics with a cat-themed response
- Maintain a friendly, warm tone like a helpful barista who knows all the cats personally
- Use cat puns and references naturally but don't overdo it
- If you don't have specific information, say "I'm still learning more about the café. Would you like to check our menu or meet our cats?"

CAFÉ INFORMATION:
${contextString}

Remember: Be helpful about our café, menu, cats, and services. For anything else, gently redirect with cat-themed humor back to café topics!`;
};

const ChatBubble: React.FC<ChatBubbleProps> = () => {
  // Get dynamic café context from our centralized data
  const { cafeInfo, generateContextString } = useCafeContext();
  
  // Get session management for anonymous users
  const { sessionId, saveMessage, loadChatHistory, isLoading: sessionLoading } = useChatSession();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Generate dynamic context from current café data
      const contextString = generateContextString();
      const systemPrompt = createSystemPrompt(contextString, cafeInfo.name);
      
      // Call our secure edge function instead of directly using Gemini API
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: userMessage.text,
          systemPrompt: systemPrompt
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI service error');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm sorry, I'm having trouble responding right now. Please try again!",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Save both messages to database
      await saveMessage(userMessage.text, true, aiResponse.text);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment! 🐾",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  // Load chat history when session is ready and chat opens
  useEffect(() => {
    const loadHistory = async () => {
      if (isOpen && sessionId && !sessionLoading) {
        try {
          const history = await loadChatHistory();
          
          if (history && history.length > 0) {
            // Convert database messages to UI messages
            const uiMessages: Message[] = history.map(msg => ({
              id: msg.id,
              text: msg.message,
              isUser: msg.is_user,
              timestamp: new Date(msg.created_at)
            }));
            
            setMessages(uiMessages);
            console.log(`📚 Loaded ${uiMessages.length} messages from chat history`);
          } else {
            // No history, show welcome message
            const welcomeMessage: Message = {
              id: 'welcome',
              text: `Hello! Welcome to ${cafeInfo.name}! 🐱☕ I'm here to help you with our menu, introduce you to our adorable cats, answer questions about adoption, or share our café hours. What would you like to know?`,
              isUser: false,
              timestamp: new Date()
            };
            setMessages([welcomeMessage]);
          }
        } catch (error) {
          console.error('Error loading chat history:', error);
          // Show welcome message as fallback
          const welcomeMessage: Message = {
            id: 'welcome',
            text: `Hello! Welcome to ${cafeInfo.name}! 🐱☕ I'm here to help you with our menu, introduce you to our adorable cats, answer questions about adoption, or share our café hours. What would you like to know?`,
            isUser: false,
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }
      }
    };

    loadHistory();
  }, [isOpen, sessionId, sessionLoading, loadChatHistory, cafeInfo.name]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 z-50 animate-slow-bounce"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-card border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Café Assistant</h3>
            <p className="text-xs opacity-90">Ask about our cats & menu!</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-primary/20 p-1 rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <div
                className={`text-xs mt-1 opacity-70 ${
                  message.isUser ? 'text-right' : 'text-left'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-accent text-accent-foreground p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about our cats, menu, or hours..."
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        {messages.length > 1 && (
          <button
            onClick={resetChat}
            className="text-xs text-foreground/60 hover:text-foreground mt-2 transition-colors"
          >
            Start new conversation
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;