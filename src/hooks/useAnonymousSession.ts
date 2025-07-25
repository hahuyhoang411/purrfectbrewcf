import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatSession {
  id: string;
  created_at: string;
  user_agent?: string;
}

export const useAnonymousSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Check if we have an existing session in localStorage
      const existingSessionId = localStorage.getItem('anonymous_session_id');
      
      if (existingSessionId) {
        // Verify the session still exists in the database
        const { data: session } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('id', existingSessionId)
          .maybeSingle();

        if (session) {
          setSessionId(existingSessionId);
          setLoading(false);
          return;
        } else {
          // Session doesn't exist, remove from localStorage
          localStorage.removeItem('anonymous_session_id');
        }
      }

      // Create a new session
      await createNewSession();
    } catch (error) {
      console.error('Error initializing session:', error);
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_agent: navigator.userAgent,
        })
        .select('id')
        .single();

      if (error) throw error;

      const newSessionId = data.id;
      setSessionId(newSessionId);
      localStorage.setItem('anonymous_session_id', newSessionId);
      setLoading(false);
    } catch (error) {
      console.error('Error creating session:', error);
      setLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('anonymous_session_id');
    setSessionId(null);
  };

  return {
    sessionId,
    loading,
    createNewSession,
    clearSession
  };
};