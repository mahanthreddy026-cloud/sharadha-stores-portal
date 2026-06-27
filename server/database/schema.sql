-- Sharadha Stores Bulk Order & Corporate Gift Portal Database Schema
-- Target: MySQL

CREATE DATABASE IF NOT EXISTS sharadha_portal;
USE sharadha_portal;

-- 1. Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Customers table (For viewing customer records and history)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(100) NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(5, 2) DEFAULT 0.00,
    stock INT DEFAULT 0,
    image_url VARCHAR(255) NULL,
    availability BOOLEAN DEFAULT TRUE,
    category_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Corporate Gift Packages table
CREATE TABLE IF NOT EXISTS gift_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Silver, Gold, Premium, Luxury
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255) NULL,
    products_included TEXT NOT NULL, -- JSON string or comma-separated names
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bulk Orders / Enquiries table
CREATE TABLE IF NOT EXISTS bulk_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL UNIQUE, -- Generated unique enquiry reference e.g., SRD-2026-XXXXX
    customer_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(100) NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- Wedding, Corporate Gift, Office Event, Return Gift, Birthday, Festival, etc.
    event_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    category_id INT NULL, -- Primary product category of interest
    package_id INT NULL,  -- Selected Corporate Package (if any)
    quantity INT NOT NULL,
    budget DECIMAL(12, 2) NOT NULL,
    message TEXT NULL,
    preferred_contact VARCHAR(20) DEFAULT 'Email', -- Email, Phone, WhatsApp
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Quotation Sent, Approved, Payment Pending, Processing, Packing, Dispatched, Delivered, Rejected
    assigned_employee VARCHAR(100) NULL,
    quote_grand_total DECIMAL(12, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (package_id) REFERENCES gift_packages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bulk Order Items (Link products & quantities to a bulk order)
CREATE TABLE IF NOT EXISTS bulk_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bulk_order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Quotations table
CREATE TABLE IF NOT EXISTS quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bulk_order_id INT NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    tax_rate DECIMAL(5, 2) DEFAULT 18.00, -- GST
    delivery_charge DECIMAL(10, 2) DEFAULT 0.00,
    grand_total DECIMAL(12, 2) NOT NULL,
    generated_pdf_path VARCHAR(255) NULL,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Sent, Accepted, Rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bulk_order_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- UPI, Bank Transfer, Card, Net Banking
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed, Failed
    transaction_id VARCHAR(100) NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Dispatch table
CREATE TABLE IF NOT EXISTS dispatch (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bulk_order_id INT NOT NULL,
    delivery_partner VARCHAR(100) NULL,
    tracking_number VARCHAR(100) NULL,
    status VARCHAR(50) DEFAULT 'Processing', -- Processing, Packing, Dispatched, Delivered
    estimated_delivery DATE NULL,
    dispatched_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bulk_order_id INT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'Info', -- Info, Quote, Payment, Dispatch, Alert
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Status History (Tracking workflow transitions)
CREATE TABLE IF NOT EXISTS status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bulk_order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT NULL,
    updated_by VARCHAR(100) DEFAULT 'System',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- Indexes ---
CREATE INDEX idx_bulk_orders_request_id ON bulk_orders(request_id);
CREATE INDEX idx_bulk_orders_status ON bulk_orders(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_bulk_order_items_order ON bulk_order_items(bulk_order_id);
CREATE INDEX idx_status_history_order ON status_history(bulk_order_id);
