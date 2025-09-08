-- MySQL schema for partner_portal
CREATE DATABASE IF NOT EXISTS partner_portal;
USE partner_portal;

CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile VARCHAR(200),
    role ENUM('admin', 'super_admin') NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )


CREATE TABLE IF NOT EXISTS partner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(100) NOT NULL,
    website VARCHAR(200) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    affiliate_handle VARCHAR(100) NOT NULL,
    additional_info TEXT,
    password VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    isRegistered BOOLEAN DEFAULT false,
    profileImage TEXT,
    mobilePhone VARCHAR(30) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'partner',
    refernceLink VARCHAR(8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE IF NOT EXISTS store (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    store_name VARCHAR(150) NOT NULL,
    platform ENUM('shopify', 'bigcommerce', 'custom', 'woocommerce', 'other') NOT NULL,
    earning DECIMAL(10,2) DEFAULT 0.00,     -- Store se kitna commission aa rha hai
    total_value DECIMAL(10,2) DEFAULT 0.00, -- Store ki total kimat (like 500 dollar)
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_store_partner FOREIGN KEY (partner_id) 
        REFERENCES partner(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS partner_playbook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS partner_referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  store_name VARCHAR(150) NOT NULL,
  website VARCHAR(200),
  platform ENUM('shopify', 'bigcommerce', 'custom', 'woocommerce', 'other') NOT NULL,
  referral_code VARCHAR(8) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_partner_referral FOREIGN KEY (referral_code)
    REFERENCES partner(refernceLink)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
