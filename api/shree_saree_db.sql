-- ============================================
-- SHREE SAREES - COMPLETE DATABASE SCHEMA
-- Database: shree_sarees_db
-- ============================================

CREATE DATABASE IF NOT EXISTS shree_sarees_db;
USE shree_sarees_db;

-- ============================================
-- 1. GODOWNS
-- ============================================
CREATE TABLE godowns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    total_racks INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: 4 Godowns
INSERT INTO godowns (name, location, city, total_racks) VALUES
('Godown 1', 'Bhiwandi Warehouse, Plot No. XX', 'Bhiwandi', 300),
('Godown 2', 'Location 2 Address', 'Mumbai', 50),
('Godown 3', 'Location 3 Address', 'Surat', 40),
('Godown 4', 'Location 4 Address', 'Ahmedabad', 30);

-- ============================================
-- 2. RACKS
-- ============================================
CREATE TABLE racks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    godown_id INT NOT NULL,
    rack_number VARCHAR(20) NOT NULL,  -- e.g. R001, R002
    description VARCHAR(200),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (godown_id) REFERENCES godowns(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rack (godown_id, rack_number)
);

-- ============================================
-- 3. SHELVES (A to F under each rack)
-- ============================================
CREATE TABLE shelves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rack_id INT NOT NULL,
    shelf_label ENUM('A','B','C','D','E','F') NOT NULL,
    description VARCHAR(200),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_shelf (rack_id, shelf_label)
);

-- ============================================
-- 4. CATEGORIES
-- ============================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    additional_description TEXT,
    meta_title VARCHAR(160),
    meta_description VARCHAR(320),
    image VARCHAR(255),
    parent_id INT DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================
-- 5. BRANDS
-- ============================================
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    meta_title VARCHAR(160),
    meta_description VARCHAR(320),
    logo VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. PRODUCTS
-- ============================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) NOT NULL UNIQUE,  -- e.g. 01BP, 01ABP58
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE,
    category_id INT,
    brand_id INT,
    fabric VARCHAR(100),          -- Cotton, Silk, etc.
    occasion VARCHAR(100),        -- Daily, Festive, etc.
    description TEXT,
    additional_description TEXT,
    meta_title VARCHAR(160),
    meta_description VARCHAR(320),
    price_per_saree DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- ============================================
-- 7. PRODUCT BUNDLES (Set size per product)
-- ============================================
CREATE TABLE product_bundles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    sarees_per_bundle INT NOT NULL,   -- e.g. 3, 6, 8
    bundle_price DECIMAL(10,2) GENERATED ALWAYS AS (
        -- calculated dynamically via trigger/backend
        0.00
    ) VIRTUAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Note: bundle_price = price_per_saree * sarees_per_bundle
-- This will be calculated in backend logic, not stored as generated column
-- Alter to store it properly:
ALTER TABLE product_bundles DROP COLUMN bundle_price;
ALTER TABLE product_bundles ADD COLUMN bundle_price DECIMAL(10,2) DEFAULT 0.00;

-- ============================================
-- 8. PRODUCT IMAGES
-- ============================================
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,   -- stored path on server
    alt_text VARCHAR(200),
    is_primary TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================
-- 9. STOCK INWARD
-- ============================================
CREATE TABLE stock_inward (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    godown_id INT NOT NULL,
    rack_id INT NOT NULL,
    shelf_id INT NOT NULL,
    bundles_received INT NOT NULL,       -- number of bundles inward
    sarees_per_bundle INT NOT NULL,      -- snapshot of set size at time of inward
    total_sarees INT NOT NULL,           -- bundles_received * sarees_per_bundle
    inward_date DATE NOT NULL,
    invoice_number VARCHAR(100),
    supplier_name VARCHAR(200),
    remarks TEXT,
    created_by INT,                      -- admin user id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (godown_id) REFERENCES godowns(id),
    FOREIGN KEY (rack_id) REFERENCES racks(id),
    FOREIGN KEY (shelf_id) REFERENCES shelves(id)
);

-- ============================================
-- 10. STOCK LEDGER (Running stock per location)
-- ============================================
CREATE TABLE stock_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    godown_id INT NOT NULL,
    rack_id INT NOT NULL,
    shelf_id INT NOT NULL,
    bundles_available INT DEFAULT 0,
    sarees_available INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (godown_id) REFERENCES godowns(id),
    FOREIGN KEY (rack_id) REFERENCES racks(id),
    FOREIGN KEY (shelf_id) REFERENCES shelves(id),
    UNIQUE KEY unique_stock (product_id, godown_id, rack_id, shelf_id)
);

-- ============================================
-- 11. USERS (Admin + Broker + Shop Owner)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','broker','shop_owner') NOT NULL DEFAULT 'shop_owner',
    is_active TINYINT(1) DEFAULT 1,
    token_expiry_hours INT DEFAULT NULL,  -- NULL = no expiry, 24 = shop owners
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: Default Admin
INSERT INTO users (name, email, phone, password_hash, role, token_expiry_hours)
VALUES ('Admin', 'admin@shreesarees.com', '9999999999',
        '$2b$10$hashedpassword', 'admin', NULL);

-- ============================================
-- 12. BROKERS
-- ============================================
CREATE TABLE brokers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    broker_code VARCHAR(50) UNIQUE,
    commission_percent DECIMAL(5,2) DEFAULT 0.00,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 13. SHOPS
-- ============================================
CREATE TABLE shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,          -- shop owner login
    broker_id INT,                         -- which broker manages this shop
    shop_name VARCHAR(200) NOT NULL,
    owner_name VARCHAR(150),
    gst_number VARCHAR(20),
    phone VARCHAR(15),
    email VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    credit_days INT DEFAULT 60,           -- payment due in 60 days
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE SET NULL
);

-- ============================================
-- 14. ORDERS
-- ============================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,  -- e.g. SS-2026-00001
    user_id INT NOT NULL,                       -- who placed the order
    shop_id INT,                                -- which shop
    broker_id INT,                              -- which broker
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_bundles INT DEFAULT 0,
    total_sarees INT DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    payment_due_date DATE,                      -- order_date + 60 days
    payment_status ENUM('pending','partial','paid','overdue') DEFAULT 'pending',
    order_status ENUM('placed','confirmed','processing',
                      'shipped','delivered','cancelled') DEFAULT 'placed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL,
    FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE SET NULL
);

-- ============================================
-- 15. ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    bundles_ordered INT NOT NULL,
    sarees_per_bundle INT NOT NULL,       -- snapshot at time of order
    total_sarees INT NOT NULL,            -- bundles * sarees_per_bundle
    price_per_saree DECIMAL(10,2) NOT NULL,
    bundle_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,    -- bundles_ordered * bundle_price
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================
-- 16. SHIPMENTS
-- ============================================
CREATE TABLE shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    courier_name VARCHAR(150),
    tracking_number VARCHAR(100),
    dispatch_date DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    shipped_from_godown INT,
    shipment_status ENUM('preparing','dispatched',
                         'in_transit','delivered','returned') DEFAULT 'preparing',
    notes TEXT,
    email_sent TINYINT(1) DEFAULT 0,      -- track if email was sent
    email_sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (shipped_from_godown) REFERENCES godowns(id)
);

-- ============================================
-- 17. PAYMENT TRACKING (60-day credit)
-- ============================================
CREATE TABLE payment_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    shop_id INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0.00,
    balance_due DECIMAL(12,2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_mode ENUM('cash','cheque','neft','rtgs','upi') DEFAULT 'neft',
    reference_number VARCHAR(100),
    status ENUM('pending','partial','paid','overdue') DEFAULT 'pending',
    reminder_sent TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- ============================================
-- 18. TALLY EXPORT LOG (Tally Prime Ready)
-- ============================================
CREATE TABLE tally_export_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    export_type ENUM('order','payment','stock_inward','broker_commission') NOT NULL,
    reference_id INT NOT NULL,        -- order_id or payment_id
    tally_voucher_type VARCHAR(100),  -- Sales, Receipt, Purchase
    export_status ENUM('pending','exported','failed') DEFAULT 'pending',
    exported_at TIMESTAMP NULL,
    tally_response TEXT,
    xml_payload LONGTEXT,             -- Tally Prime XML stored for retry
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
