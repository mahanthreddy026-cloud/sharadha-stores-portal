const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_TYPE = process.env.DB_TYPE || 'sqlite'; // 'mysql' or 'sqlite'

let pool = null;
let sqliteDb = null;

async function getMysqlConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sharadha_portal',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

function getSqliteConnection() {
  if (!sqliteDb) {
    const dbPath = path.join(__dirname, '../database/sharadha.db');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    sqliteDb = new sqlite3.Database(dbPath);
  }
  return sqliteDb;
}

function runSqlite(sql, params = []) {
  const db = getSqliteConnection();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ insertId: this.lastID, affectedRows: this.changes });
    });
  });
}

function allSqlite(sql, params = []) {
  const db = getSqliteConnection();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getSqlite(sql, params = []) {
  const db = getSqliteConnection();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Unified query function
async function query(sql, params = []) {
  if (DB_TYPE === 'mysql') {
    const connectionPool = await getMysqlConnection();
    // Use execute for parameterized queries
    const [rows] = await connectionPool.execute(sql, params);
    return rows;
  } else {
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    if (isSelect) {
      return await allSqlite(sql, params);
    } else {
      const res = await runSqlite(sql, params);
      return res;
    }
  }
}

// Database schema initialization
async function initializeDatabase() {
  if (DB_TYPE === 'sqlite') {
    const schema = `
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company_name TEXT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NULL,
        price REAL NOT NULL,
        discount REAL DEFAULT 0.0,
        stock INTEGER DEFAULT 0,
        image_url TEXT NULL,
        availability INTEGER DEFAULT 1,
        category_id INTEGER NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
      
      CREATE TABLE IF NOT EXISTS gift_packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT NULL,
        products_included TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS bulk_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        company_name TEXT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_date TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        category_id INTEGER NULL,
        package_id INTEGER NULL,
        quantity INTEGER NOT NULL,
        budget REAL NOT NULL,
        message TEXT NULL,
        preferred_contact TEXT DEFAULT 'Email',
        status TEXT DEFAULT 'Pending',
        assigned_employee TEXT NULL,
        quote_grand_total REAL NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (package_id) REFERENCES gift_packages(id) ON DELETE SET NULL
      );
      
      CREATE TABLE IF NOT EXISTS bulk_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bulk_order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bulk_order_id INTEGER NOT NULL,
        discount REAL DEFAULT 0.0,
        tax_rate REAL DEFAULT 18.0,
        delivery_charge REAL DEFAULT 0.0,
        grand_total REAL NOT NULL,
        generated_pdf_path TEXT NULL,
        status TEXT DEFAULT 'Draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bulk_order_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        transaction_id TEXT NULL,
        paid_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS dispatch (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bulk_order_id INTEGER NOT NULL,
        delivery_partner TEXT NULL,
        tracking_number TEXT NULL,
        status TEXT DEFAULT 'Processing',
        estimated_delivery TEXT NULL,
        dispatched_at DATETIME NULL,
        delivered_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bulk_order_id INTEGER NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'Info',
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bulk_order_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        notes TEXT NULL,
        updated_by TEXT DEFAULT 'System',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(id) ON DELETE CASCADE
      );
    `;
    
    const statements = schema.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await runSqlite(stmt);
    }
    
    // Seed admins if empty
    const checkAdmin = await getSqlite("SELECT COUNT(*) as count FROM admins");
    if (checkAdmin.count === 0) {
      // Insert categories
      await runSqlite(`INSERT INTO categories (id, name, description) VALUES 
        (1, 'Traditional Sweets', 'Classic heritage sweets made with pure ghee and organic ingredients.'),
        (2, 'Savory Snacks', 'Crispy and crunchy snacks perfect for tea-time and events.'),
        (3, 'Pickles & Thokku', 'Traditional home-style pickles made from hand-picked mangoes and lemons.'),
        (4, 'Podis & Masala Powders', 'Aromatic spice powders and rice mixes ground using traditional recipes.')`);

      // Insert products
      await runSqlite(`INSERT INTO products (name, description, price, discount, stock, image_url, availability, category_id) VALUES
        ('Ghee Mysurpa', 'Meltingly soft traditional sweet made with chickpea flour and cow ghee.', 520.00, 5.00, 100, '', 1, 1),
        ('Special Motichoor Laddu', 'Fine boondi pearls fried in ghee, sweetened, and shaped into laddus.', 480.00, 0.00, 150, '', 1, 1),
        ('Traditional Tirunelveli Halwa', 'Soft, jelly-like wheat halwa cooked slow with ghee and sugar.', 450.00, 10.00, 80, '', 1, 1),
        ('Kai Murukku', 'Traditional handmade twisted rice flour snack, extra crunchy.', 280.00, 0.00, 200, '', 1, 2),
        ('Special Ribbon Pakoda', 'Thin ribbon-shaped crispy snack flavored with garlic and chili.', 240.00, 5.00, 120, '', 1, 2),
        ('Kerala Banana Chips', 'Crisply sliced raw banana chips fried in fresh coconut oil.', 320.00, 0.00, 150, '', 1, 2)`);

      // Insert gift packages
      await runSqlite(`INSERT INTO gift_packages (name, description, price, image_url, products_included) VALUES
        ('Silver Package', 'A perfect starter gift package containing essential traditional snacks and sweets.', 350.00, '', 'Ghee Mysurpa (250g), Kai Murukku (200g), Hot Butter Mixture (200g)'),
        ('Gold Package', 'An elegant gifting combo pack ideal for weddings and corporate employee appreciation.', 750.00, '', 'Ghee Mysurpa (250g), Motichoor Laddu (250g), Kai Murukku (250g), Special Ribbon Pakoda (200g)'),
        ('Premium Package', 'Premium selection of top-shelf traditional sweets and savories in eco-friendly boxes.', 1250.00, '', 'Ghee Mysurpa (500g), Stuffed Dry Fruit Pedha (250g), Kerala Banana Chips (250g), Kai Murukku (250g)'),
        ('Luxury Package', 'Our finest premium collection including dry fruit sweets, multiple crunchy snacks in a luxury wooden gift box.', 2200.00, '', 'Ghee Mysurpa (500g), Stuffed Dry Fruit Pedha (500g), Tirunelveli Halwa (250g), Kai Murukku (250g)')`);

      // Insert admin user (admin / admin123)
      await runSqlite(`INSERT INTO admins (username, email, password_hash) VALUES 
        ('admin', 'admin@sharadha.com', '$2a$10$4w.7a9yGlwHl9xqLMyfwVOiNODzzfP8ufgRg5FwJlsCrm/JlpAPDa')`);
      
      // Insert customer user (customer@gmail.com / customer123)
      await runSqlite(`INSERT INTO customers (name, company_name, phone, email, password_hash) VALUES 
        ('Demo Customer', 'Demo Corp', '9876543210', 'customer@gmail.com', '$2a$10$4w.7a9yGlwHl9xqLMyfwVOiNODzzfP8ufgRg5FwJlsCrm/JlpAPDa')`);
      
      console.log('SQLite database initialized and seeded successfully.');
    }
  } else {
    console.log('MySQL mode active.');
  }
}

module.exports = {
  query,
  initializeDatabase,
  DB_TYPE
};
