-- Clean up redundant session_id field
-- First, let's check if the session_id field in chat_sessions is actually being used
SELECT DISTINCT session_id FROM chat_sessions LIMIT 5;