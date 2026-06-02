-- ============================================================
-- Employee Management System — Full Database Setup
-- Run this on your cloud MySQL (Aiven / Railway / PlanetScale)
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(150) NOT NULL UNIQUE,
  password             VARCHAR(255) NOT NULL,
  role                 ENUM('admin', 'user') DEFAULT 'user',
  admin_id             VARCHAR(20) UNIQUE DEFAULT NULL,
  must_change_password TINYINT(1) DEFAULT 0,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  phone       VARCHAR(20),
  department  VARCHAR(100),
  position    VARCHAR(100),
  salary      DECIMAL(10, 2),
  hire_date   DATE,
  status      ENUM('active', 'inactive') DEFAULT 'active',
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Login history table
CREATE TABLE IF NOT EXISTS login_history (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  user_name  VARCHAR(100) NOT NULL,
  user_email VARCHAR(150) NOT NULL,
  user_role  ENUM('admin','user') NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  login_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  admin_id    INT NOT NULL,
  admin_name  VARCHAR(100) NOT NULL,
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   INT,
  details     TEXT,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default admin account
-- Admin ID : ADMIN001
-- Email    : admin@workflow.com
-- Password : Admin@123
INSERT INTO users (name, email, password, role, admin_id, must_change_password)
VALUES (
  'System Admin',
  'admin@workflow.com',
  '$2a$12$BYYUL1CIpbWfSRWESYB4g.3Qb2H5Qb8A.IuhKyW49Ydw9K5G4VT4q',
  'admin',
  'ADMIN001',
  0
)
ON DUPLICATE KEY UPDATE id = id;
