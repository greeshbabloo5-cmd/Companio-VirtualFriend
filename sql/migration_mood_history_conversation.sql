USE companio_db;

ALTER TABLE mood_history
ADD COLUMN conversation_id INT NULL AFTER user_id;

DELETE FROM mood_history
WHERE conversation_id IS NULL;

ALTER TABLE mood_history
MODIFY message TEXT NOT NULL;

ALTER TABLE mood_history
MODIFY conversation_id INT NOT NULL;

ALTER TABLE mood_history
ADD CONSTRAINT fk_mood_history_conversation
FOREIGN KEY(conversation_id)
REFERENCES conversations(id)
ON DELETE CASCADE;
