import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ========================== ADMIN TABLE ==========================
pool.query(`
  CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile VARCHAR(200),
    role ENUM('admin', 'super_admin') NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;
`, (err) => {
  if (err) console.error('Failed to create admin table:', err.message);
  else console.log('Admin table is ready.');
});

// ========================== PARTNER TABLE ==========================
pool.query(`
  CREATE TABLE IF NOT EXISTS partner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization VARCHAR(150),
    email VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(100) NOT NULL,
    website VARCHAR(200) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    additional_info TEXT,
    password VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    isRegistered BOOLEAN DEFAULT false,
    profileImage TEXT,
    mobilePhone VARCHAR(30) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'partner',
    refernceLink VARCHAR(8) UNIQUE, -- unique directly here
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;
`, (err) => {
  if (err) console.error('Failed to create partner table:', err.message);
  else console.log('Partner table is ready.');
});

// ========================== STORE TABLE ==========================
pool.query(`
  CREATE TABLE IF NOT EXISTS store (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    store_name VARCHAR(150) NOT NULL,
    store_owner VARCHAR(150),
    platform ENUM('shopify', 'bigcommerce', 'custom', 'woocommerce', 'other') NOT NULL,
    earning DECIMAL(10,2) DEFAULT 0.00,
    total_value DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'inactive') DEFAULT 'active',
    inactive_reason TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_store_partner FOREIGN KEY (partner_id) 
      REFERENCES partner(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;
`, (err) => {
  if (err) console.error('Failed to create store table:', err.message);
  else console.log('Store table is ready.');
});

// ========================== OTP TABLE ==========================
pool.query(`
  CREATE TABLE IF NOT EXISTS otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    reset_token VARCHAR(255) NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;
`, (err) => {
  if (err) console.error('Failed to create otp table:', err.message);
  else console.log('OTP table is ready.');
});

// ========================== STORE PAYMENT TABLE ==========================
pool.query(`
  CREATE TABLE IF NOT EXISTS store_payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    store_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('paid', 'pending', 'failed') DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payment_partner FOREIGN KEY (partner_id) 
      REFERENCES partner(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_store FOREIGN KEY (store_id) 
      REFERENCES store(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;
`, (err) => {
  if (err) console.error('Failed to create store_payment table:', err.message);
  else console.log('Store_payment table is ready.');
});

// ========================== PARTNER PLAYBOOK TABLE ==========================
pool.query(`
  CREATE TABLE IF NOT EXISTS partner_playbook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;
`, (err) => {
  if (err) console.error('Failed to create partner_playbook table:', err.message);
  else console.log('Partner_playbook table is ready.');
});

// ========================== PARTNER REFERRALS TABLE ==========================
pool.query(`
  CREATE TABLE IF NOT EXISTS partner_referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    store_name VARCHAR(150) NOT NULL,
    website VARCHAR(200),
    phone VARCHAR(30) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    platform ENUM('shopify', 'bigcommerce', 'custom', 'woocommerce', 'other') DEFAULT 'bigcommerce',
    status ENUM('New', 'Failed', 'hold', 'confirmed') DEFAULT 'New',
    referral_code VARCHAR(8) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_partner_referral FOREIGN KEY (referral_code)
      REFERENCES partner(refernceLink)
      ON DELETE SET NULL
      ON UPDATE CASCADE
  ) ENGINE=InnoDB;
`, (err) => {
  if (err) console.error('Failed to create partner_referrals table:', err.message);
  else console.log('Partner_referrals table is ready.');
});

export default pool;
