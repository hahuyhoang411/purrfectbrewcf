import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBubbleProps {
  apiKey?: string;
  cafeInfo?: CafeInfo;
}

interface CafeInfo {
  name: string;
  address: string;
  hours: Record<string, string>;
  menu: Array<{
    category: string;
    items: Array<{
      name: string;
      description: string;
      price: string;
    }>;
  }>;
  cats: Array<{
    name: string;
    breed: string;
    personality: string;
    funFact: string;
    adoptable: boolean;
  }>;
  rules: string[];
  promotions?: string[];
}

const DEFAULT_CAFE_INFO: CafeInfo = {
  name: "Purrfect Brew",
  address: "123 Cat Street, Coffee City, CC 12345",
  hours: {
    "Monday - Friday": "7:00 AM - 8:00 PM",
    "Saturday": "8:00 AM - 9:00 PM",
    "Sunday": "8:00 AM - 7:00 PM"
  },
  menu: [
    {
      category: "Coffee & Espresso",
      items: [
        { name: "Purrfect Espresso", description: "Rich, smooth espresso shot", price: "$3.50" },
        { name: "Whiskers Cappuccino", description: "Creamy cappuccino with cat latte art", price: "$4.75" },
        { name: "Tabby Latte", description: "Smooth latte with your choice of milk", price: "$5.25" },
        { name: "Calico Cold Brew", description: "Smooth cold brew served over ice", price: "$4.50" },
        { name: "Maine Coon Mocha", description: "Rich chocolate and espresso blend", price: "$5.75" },
        { name: "Siamese Macchiato", description: "Espresso marked with steamed milk foam", price: "$4.95" }
      ]
    },
    {
      category: "Specialty Drinks",
      items: [
        { name: "Catnip Chai Latte", description: "Spiced chai with steamed milk and honey", price: "$5.50" },
        { name: "Persian Hot Chocolate", description: "Rich cocoa with whipped cream", price: "$4.75" },
        { name: "Bengal Matcha Latte", description: "Premium matcha with steamed milk", price: "$5.95" },
        { name: "Ragdoll Turmeric Latte", description: "Golden turmeric with warming spices", price: "$5.25" }
      ]
    },
    {
      category: "Fresh Pastries",
      items: [
        { name: "Paw Print Croissant", description: "Buttery croissant with almond filling", price: "$4.25" },
        { name: "Kitty Cat Scone", description: "Blueberry scone with clotted cream", price: "$3.95" },
        { name: "Tuna Melt Sandwich", description: "Grilled sandwich with premium tuna", price: "$8.50" },
        { name: "Salmon Bagel", description: "Everything bagel with cream cheese and salmon", price: "$9.75" }
      ]
    },
    {
      category: "Sweet Treats",
      items: [
        { name: "Whisker Cookies", description: "Cat-shaped sugar cookies (pack of 3)", price: "$4.50" },
        { name: "Purrfect Cheesecake", description: "Creamy cheesecake with berry compote", price: "$6.75" },
        { name: "Tabby Tiramisu", description: "Classic tiramisu with coffee essence", price: "$7.25" }
      ]
    }
  ],
  cats: [
    {
      name: "Luna",
      breed: "Grey Tabby",
      personality: "Playful and curious",
      funFact: "Loves to play with feather toys and purrs when you read to her",
      adoptable: true
    },
    {
      name: "Mochi",
      breed: "Orange Tabby", 
      personality: "Laid-back and affectionate",
      funFact: "Resident greeter who welcomes every customer with head bumps",
      adoptable: false
    },
    {
      name: "Shadow",
      breed: "Black Shorthair",
      personality: "Mysterious and gentle", 
      funFact: "Appears wherever there's a sunny spot and loves afternoon naps",
      adoptable: true
    },
    {
      name: "Biscuit",
      breed: "Calico",
      personality: "Energetic and social",
      funFact: "Loves to 'help' customers work on their laptops by walking across keyboards",
      adoptable: true
    },
    {
      name: "Sage",
      breed: "Russian Blue",
      personality: "Wise and calm",
      funFact: "Senior cat who gives the best cuddles and supervises the younger cats",
      adoptable: true
    },
    {
      name: "Pepper",
      breed: "Tuxedo",
      personality: "Dignified and playful",
      funFact: "Wears his black and white coat like a formal tuxedo and sits like a proper gentleman",
      adoptable: true
    }
  ],
  rules: [
    "Please let cats approach you first - no grabbing or chasing",
    "Don't feed the cats human food (they have special diets!)",
    "Wash hands before and after interacting with cats",
    "Children under 12 must be supervised by adults",
    "Please keep voices low to maintain a relaxing atmosphere",
    "No flash photography - it startles our feline friends",
    "If a cat is sleeping, please don't disturb them"
  ],
  promotions: [
    "Happy Hour: 20% off all drinks Monday-Friday 3-5 PM",
    "Cat Adoption Special: Free coffee for a month when you adopt one of our cats",
    "Student Discount: 15% off with valid student ID"
  ]
};

const createSystemPrompt = (cafeInfo: CafeInfo): string => {
  const menuText = cafeInfo.menu.map(category => 
    `${category.category}:\n${category.items.map(item => 
      `- ${item.name}: ${item.description} (${item.price})`
    ).join('\n')}`
  ).join('\n\n');

  const catsText = cafeInfo.cats.map(cat => 
    `${cat.name} (${cat.breed}): ${cat.personality}. ${cat.funFact} ${cat.adoptable ? '- Available for adoption!' : '- Permanent resident'}`
  ).join('\n');

  const hoursText = Object.entries(cafeInfo.hours).map(([day, hours]) => 
    `${day}: ${hours}`
  ).join('\n');

  return `You are the friendly AI assistant for ${cafeInfo.name}, a cozy cat café. You have a warm, welcoming personality like a knowledgeable barista who adores cats. Your responses should be helpful, playful, and always cat-themed when appropriate.

IMPORTANT BEHAVIORAL RULES:
- Only respond based on the café information provided below
- If asked about topics outside this context (weather, politics, general AI questions, etc.), politely redirect back to café topics with a cat-themed response
- Maintain a friendly, warm tone like a helpful barista who knows all the cats personally
- Use cat puns and references naturally but don't overdo it
- If you don't have specific information, say "I'm still learning more about the café. Would you like to check our menu or meet our cats?"

CAFÉ INFORMATION:

📍 Location & Hours:
${cafeInfo.name}
${cafeInfo.address}
${hoursText}
*Last orders 30 minutes before closing

🍽️ Our Menu:
${menuText}

We offer dairy-free milk alternatives (oat, almond, soy) and gluten-free pastries.

🐱 Our Cats:
${catsText}

📋 House Rules:
${cafeInfo.rules.map(rule => `- ${rule}`).join('\n')}

💰 Current Promotions:
${cafeInfo.promotions?.map(promo => `- ${promo}`).join('\n') || 'No current promotions'}

📞 Contact Info:
- Adoptions: adoptions@purrfectbrew.com
- Phone: (555) 123-PURR

Remember: Be helpful about our café, menu, cats, and services. For anything else, gently redirect with cat-themed humor back to café topics!`;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  apiKey, 
  cafeInfo = DEFAULT_CAFE_INFO 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [genAI, setGenAI] = useState<GoogleGenAI | null>(null);
  const [userApiKey, setUserApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (apiKey && !genAI) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        setGenAI(ai);
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
      }
    }
  }, [apiKey, genAI]);

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
      const systemPrompt = createSystemPrompt(cafeInfo);
      
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
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 z-50 animate-bounce"
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
      {!genAI && (
        <div className="p-4 bg-accent/50 border-b border-border">
          <p className="text-sm text-foreground/80 mb-2">Enter your Gemini API key to start chatting:</p>
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
              Set
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