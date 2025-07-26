import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface ChatSession {
  id: string;
  session_id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  message: string;
  is_user: boolean;
  created_at: string;
  metadata: any; // Using any for JSON data
}

export const useChatSession = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [chatSessionData, setChatSessionData] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Generate a unique session ID for anonymous users
   * Uses a combination of timestamp, random number, and browser fingerprint
   */
  const generateSessionId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const browserFingerprint = getBrowserFingerprint();
    return `anon_${timestamp}_${randomPart}_${browserFingerprint}`;
  };

  /**
   * Create a simple browser fingerprint for session identification
   * This helps identify returning users without cookies
   */
  const getBrowserFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  };

  /**
   * Get or create a chat session for the current user/browser
   */
  const initializeSession = async (): Promise<string> => {
    try {
      // First, try to get session from localStorage
      let storedSessionId = localStorage.getItem('cafe_chat_session_id');
      
      if (!storedSessionId) {
        // Generate new session ID if none exists
        storedSessionId = generateSessionId();
        localStorage.setItem('cafe_chat_session_id', storedSessionId);
      }

      // Check if this session exists in database
      const { data: existingSession, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', storedSessionId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        throw fetchError;
      }

      let sessionData: ChatSession;

      if (existingSession) {
        // Session exists, use it
        sessionData = existingSession;
        console.log('📱 Found existing session:', storedSessionId);
      } else {
        // Create new session in database
        const { data: newSession, error: createError } = await supabase
          .from('chat_sessions')
          .insert({
            session_id: storedSessionId
            // user_id will be null by default for anonymous sessions
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating session:', createError);
          throw createError;
        }

        sessionData = newSession;
        console.log('🆕 Created new session:', storedSessionId);
      }

      setChatSessionData(sessionData);
      setSessionId(storedSessionId);
      return storedSessionId;

    } catch (error) {
      console.error('Session initialization error:', error);
      // Fallback: generate session ID but don't save to DB
      const fallbackId = generateSessionId();
      setSessionId(fallbackId);
      localStorage.setItem('cafe_chat_session_id', fallbackId);
      return fallbackId;
    }
  };

  /**
   * Save a message to the database
   */
  const saveMessage = async (message: string, isUser: boolean, aiResponse?: string): Promise<void> => {
    if (!chatSessionData) {
      console.warn('No session data available, cannot save message');
      return;
    }

    try {
      // If this is a user message and we have an AI response, save both
      if (isUser && aiResponse) {
        // Save user message
        await supabase
          .from('chat_messages')
          .insert({
            session_id: chatSessionData.id,
            message: message,
            is_user: true,
            metadata: { timestamp: new Date().toISOString() }
          });

        // Save AI response
        await supabase
          .from('chat_messages')
          .insert({
            session_id: chatSessionData.id,
            message: aiResponse,
            is_user: false,
            metadata: { timestamp: new Date().toISOString() }
          });

        console.log('💾 Saved message pair to database');
      } else {
        // Save individual message
        await supabase
          .from('chat_messages')
          .insert({
            session_id: chatSessionData.id,
            message: message,
            is_user: isUser,
            metadata: { timestamp: new Date().toISOString() }
          });

        console.log('💾 Saved individual message to database');
      }

      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatSessionData.id);

    } catch (error) {
      console.error('Error saving message:', error);
      // Don't throw - let the chat continue even if saving fails
    }
  };

  /**
   * Load chat history for the current session
   */
  const loadChatHistory = async (): Promise<ChatMessage[]> => {
    if (!chatSessionData) {
      return [];
    }

    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', chatSessionData.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat history:', error);
        return [];
      }

      console.log(`📚 Loaded ${messages?.length || 0} messages from history`);
      return messages || [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  };

  /**
   * Clear current session (for testing or user request)
   */
  const clearSession = (): void => {
    localStorage.removeItem('cafe_chat_session_id');
    setChatSessionData(null);
    setSessionId('');
    console.log('🗑️ Session cleared');
  };

  // Initialize session on hook mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await initializeSession();
      setIsLoading(false);
    };
    
    init();
  }, []);

  return {
    sessionId,
    chatSessionData,
    isLoading,
    saveMessage,
    loadChatHistory,
    clearSession,
    initializeSession
  };
};