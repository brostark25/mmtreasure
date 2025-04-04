CREATE DATABASE IF NOT EXISTS b03collection;

USE b03collection;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(255) NOT NULL UNIQUE,
  currency VARCHAR(10) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  active tinyint(1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agid VARCHAR(255) NOT NULL UNIQUE,
  agentname VARCHAR(255) NOT NULL,
  telephone INT(15) NOT NULL,
  agentreferral VARCHAR(255) NOT NULL,
  score INT(3) NOT NULL,
  badge VARCHAR(255) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL,
  dbalance DECIMAL(15,2) NOT NULL,
  arole VARCHAR(255) NOT NULL,
  active tinyint(1) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

