-- Create chat_sessions table for tracking anonymous and logged-in user conversations
CREATE TABLE public.chat_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE, -- Browser fingerprint or cookie-based ID
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous, filled when user signs up
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for storing individual messages
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    message TEXT NOT NULL, -- The actual message content (user or AI)
    is_user BOOLEAN NOT NULL, -- true = user message, false = AI response
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}' -- For future features: sentiment, topics, etc.
);

-- Enable Row Level Security
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_sessions
-- Allow anonymous users to access their own sessions by session_id
CREATE POLICY "Users can access their own chat sessions"
ON public.chat_sessions
FOR ALL
USING (
    -- Allow if it's their session_id OR they're the authenticated user who owns it
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
    OR auth.uid() = user_id
);

-- Create RLS policies for chat_messages
-- Allow access to messages if user owns the session
CREATE POLICY "Users can access messages from their sessions"
ON public.chat_messages
FOR ALL
USING (
    session_id IN (
        SELECT id FROM public.chat_sessions 
        WHERE session_id = current_setting('request.headers', true)::json->>'x-session-id'
        OR auth.uid() = user_id
    )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_chat_sessions_session_id ON public.chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);