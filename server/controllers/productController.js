const db = require('../config/db');

// --- Product Controllers ---

async function getProducts(req, res) {
  try {
    const { category, search } = req.query;
    let queryStr = `
      SELECT p.*, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('p.category_id = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' ORDER BY p.id DESC';
    const products = await db.query(queryStr, params);
    
    return res.status(200).json(products);
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({ message: 'Error retrieving products.' });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const products = await db.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.status(200).json(products[0]);
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    return res.status(500).json({ message: 'Error retrieving product.' });
  }
}

async function createProduct(req, res) {
  try {
    const { name, description, price, discount, stock, image_url, availability, category_id } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and Price are required.' });
    }

    const avail = availability === undefined ? 1 : (availability ? 1 : 0);
    const disc = discount === undefined ? 0.00 : discount;
    const stk = stock === undefined ? 0 : stock;
    const catId = category_id || null;

    const result = await db.query(
      `INSERT INTO products (name, description, price, discount, stock, image_url, availability, category_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, disc, stk, image_url || '', avail, catId]
    );

    return res.status(201).json({
      message: 'Product created successfully.',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({ message: 'Error creating product.' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, discount, stock, image_url, availability, category_id } = req.body;
    
    const existing = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const avail = availability === undefined ? 1 : (availability ? 1 : 0);
    const catId = category_id || null;

    await db.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, discount = ?, stock = ?, image_url = ?, availability = ?, category_id = ? 
       WHERE id = ?`,
      [name, description, price, discount, stock, image_url, avail, catId, id]
    );

    return res.status(200).json({ message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({ message: 'Error updating product.' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({ message: 'Error deleting product.' });
  }
}

// --- Category Controllers ---

async function getCategories(req, res) {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY id ASC');
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({ message: 'Error retrieving categories.' });
  }
}

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    // Check if category name is already taken
    const existing = await db.query('SELECT * FROM categories WHERE name = ?', [name]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'Category name already exists.' });
    }

    const result = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || '']
    );

    return res.status(201).json({
      message: 'Category created successfully.',
      categoryId: result.insertId
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    return res.status(500).json({ message: 'Error creating category.' });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    await db.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );

    return res.status(200).json({ message: 'Category updated successfully.' });
  } catch (error) {
    console.error('Update Category Error:', error);
    return res.status(500).json({ message: 'Error updating category.' });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Nullify category references on products first (SQLite might require it if not supported, but schema cascade does it)
    await db.query('UPDATE products SET category_id = NULL WHERE category_id = ?', [id]);
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    
    return res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return res.status(500).json({ message: 'Error deleting category.' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
