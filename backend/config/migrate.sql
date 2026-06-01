USE employee_management;

-- 1. Add admin_id column (ignore error if already exists)
ALTER TABLE users ADD COLUMN admin_id VARCHAR(20) UNIQUE DEFAULT NULL;
ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) DEFAULT 0;

-- 2. Ensure login_history table exists
CREATE TABLE IF NOT EXISTS login_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  user_name   VARCHAR(100) NOT NULL,
  user_email  VARCHAR(150) NOT NULL,
  user_role   ENUM('admin','user') NOT NULL,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  login_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Audit log table
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

-- 4. Remove old example admin
DELETE FROM users WHERE email = 'admin@example.com';

-- 5. Upsert the default admin account (password: Admin@123)
INSERT INTO users (name, email, password, role, admin_id, must_change_password)
VALUES (
  'System Admin',
  'admin@workflow.com',
  '$2a$12$BYYUL1CIpbWfSRWESYB4g.3Qb2H5Qb8A.IuhKyW49Ydw9K5G4VT4q',
  'admin',
  'ADMIN001',
  0
)
ON DUPLICATE KEY UPDATE
  name                 = 'System Admin',
  password             = '$2a$12$BYYUL1CIpbWfSRWESYB4g.3Qb2H5Qb8A.IuhKyW49Ydw9K5G4VT4q',
  role                 = 'admin',
  admin_id             = 'ADMIN001',
  must_change_password = 0;

-- Verify
SELECT id, name, email, role, admin_id, must_change_password FROM users;
SHOW TABLES;
