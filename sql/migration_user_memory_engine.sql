USE companio_db;

ALTER TABLE user_memory
MODIFY memory_key VARCHAR(100) NOT NULL;

ALTER TABLE user_memory
MODIFY memory_value TEXT NOT NULL;

ALTER TABLE user_memory
ADD COLUMN confidence FLOAT NOT NULL DEFAULT 1.0 AFTER memory_value;

ALTER TABLE user_memory
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER confidence;

DELETE duplicate_memory
FROM user_memory duplicate_memory
JOIN user_memory kept_memory
ON duplicate_memory.user_id = kept_memory.user_id
AND duplicate_memory.memory_key = kept_memory.memory_key
AND duplicate_memory.id > kept_memory.id;

ALTER TABLE user_memory
ADD CONSTRAINT unique_user_memory UNIQUE (user_id, memory_key);
