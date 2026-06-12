-- ============================================================
--  GovInfo Search — Database Schema
--  Engine: MySQL 8.0+
--  Charset: utf8mb4 (supports all Unicode characters)
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS User (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_email (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Notification (
  id             INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  title          VARCHAR(512)   NOT NULL,
  description    TEXT           NOT NULL,
  department     VARCHAR(180)   NOT NULL,
  source_url     VARCHAR(1024)  NOT NULL,
  pdf_text       LONGTEXT,
  published_date DATE           NOT NULL,
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- FULLTEXT index for ranked keyword search across title, description, pdf_text
  FULLTEXT KEY ft_search (title, description, pdf_text)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
