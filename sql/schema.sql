CREATE DATABASE IF NOT EXISTS companio_db;

USE companio_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
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

CREATE TABLE chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('user','assistant') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE user_memory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    memory_key VARCHAR(100) NOT NULL,
    memory_value TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_memory (user_id, memory_key),
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE mood_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    conversation_id INT NOT NULL,
    message TEXT NOT NULL,
    emotion VARCHAR(50),
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE wellness_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity VARCHAR(100),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
