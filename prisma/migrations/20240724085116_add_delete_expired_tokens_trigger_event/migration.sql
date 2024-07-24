-- Add your table creation SQL or other Prisma-generated SQL here
-- Create a scheduled event to delete expired refresh tokens where expires_refresh_token + 5 hours < NOW() every 3 hours
CREATE EVENT delete_expired_tokens_event
ON SCHEDULE EVERY 3 HOUR
DO
  DELETE FROM refresh_tokens WHERE DATE_ADD(expires_refresh_token, INTERVAL 5 HOUR) < NOW();
