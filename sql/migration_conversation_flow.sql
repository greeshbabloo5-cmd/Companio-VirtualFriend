USE companio_db;

CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

ALTER TABLE chat_history
ADD COLUMN conversation_id INT NULL AFTER id;

INSERT INTO conversations(user_id, title)
SELECT DISTINCT user_id, 'Imported Chat'
FROM chat_history
WHERE conversation_id IS NULL;

CREATE TEMPORARY TABLE migrated_conversations AS
SELECT user_id, MIN(id) AS conversation_id
FROM conversations
GROUP BY user_id;

UPDATE chat_history
JOIN migrated_conversations
ON migrated_conversations.user_id = chat_history.user_id
SET chat_history.conversation_id = migrated_conversations.conversation_id
WHERE chat_history.conversation_id IS NULL;

DELETE FROM chat_history
WHERE conversation_id IS NULL;

ALTER TABLE chat_history
MODIFY conversation_id INT NOT NULL;

ALTER TABLE chat_history
ADD CONSTRAINT fk_chat_history_conversation
FOREIGN KEY(conversation_id)
REFERENCES conversations(id)
ON DELETE CASCADE;
