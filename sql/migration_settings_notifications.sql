USE companio_db;

ALTER TABLE settings
ADD COLUMN daily_motivation TINYINT(1) DEFAULT 1 AFTER enable_notifications,
ADD COLUMN mood_reminder TINYINT(1) DEFAULT 0 AFTER daily_motivation,
ADD COLUMN wellness_tips TINYINT(1) DEFAULT 1 AFTER mood_reminder;
