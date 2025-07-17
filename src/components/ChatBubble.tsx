import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, Key } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useCafeContext } from '../hooks/useCafeContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBubbleProps {
  // No props needed - we'll get API key from Supabase and context from hook
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [genAI, setGenAI] = useState<GoogleGenAI | null>(null);
  const [userApiKey, setUserApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize AI with API key from environment or user input
  useEffect(() => {
    // In production, you'd get this from Supabase secrets
    // For development, we'll allow user input
    const tryInitializeAI = (key: string) => {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        setGenAI(ai);
        setShowApiKeyInput(false);
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
        setShowApiKeyInput(true);
      }
    };

    // Check if we have an API key in environment (Supabase secret)
    // For now, show the API key input - in production this would be automatic
    if (!genAI) {
      setShowApiKeyInput(true);
    }
  }, [genAI]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApiKeySubmit = () => {
    if (userApiKey.trim()) {
      try {
        const ai = new GoogleGenAI({ apiKey: userApiKey.trim() });
        setGenAI(ai);
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !genAI) return;

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
      
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage.text}` }]
          }
        ],
        config: {
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || "I'm sorry, I'm having trouble responding right now. Please try again!",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
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

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && genAI) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: `Hello! Welcome to ${cafeInfo.name}! 🐱☕ I'm here to help you with our menu, introduce you to our adorable cats, answer questions about adoption, or share our café hours. What would you like to know?`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, genAI, cafeInfo.name, messages.length]);

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

      {/* API Key Input (if needed) */}
      {showApiKeyInput && (
        <div className="p-4 bg-accent/50 border-b border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="h-4 w-4 text-primary" />
            <p className="text-sm text-foreground/80">API key required to start chatting</p>
          </div>
          <p className="text-xs text-foreground/60 mb-3">
            💡 <strong>For café owners:</strong> In production, store your Gemini API key securely in Supabase secrets to avoid showing this prompt to customers.
          </p>
          <div className="flex space-x-2">
            <input
              type="password"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              placeholder="Your Gemini API key..."
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleApiKeySubmit}
              className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

      {/* Input */}
      {genAI && (
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
      )}
    </div>
  );
};

export default ChatBubble;