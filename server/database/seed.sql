-- Seed Data for Sharadha Stores Bulk Order & Corporate Gift Portal
USE sharadha_portal;

-- 1. Seed Categories
INSERT INTO categories (name, description) VALUES
('Traditional Sweets', 'Classic heritage sweets made with pure ghee and organic ingredients like Mysurpa, Laddu, and Halwa.'),
('Savory Snacks', 'Crispy and crunchy snacks perfect for tea-time and events, including Murukku, Pakoda, and Chips.'),
('Pickles & Thokku', 'Traditional home-style pickles made from hand-picked mangoes, lemons, and garlic.'),
('Podis & Masala Powders', 'Aromatic spice powders and rice mixes ground using traditional recipes.');

-- 2. Seed Products
-- Traditional Sweets (Category ID: 1)
INSERT INTO products (name, description, price, discount, stock, image_url, availability, category_id) VALUES
('Ghee Mysurpa', 'Meltingly soft traditional sweet made with chickpea flour, sugar, and rich melted cow ghee.', 520.00, 5.00, 100, '/images/mysurpa.jpg', TRUE, 1),
('Special Motichoor Laddu', 'Fine boondi pearls fried in ghee, sweetened, and shaped into delicious golden laddus.', 480.00, 0.00, 150, '/images/laddu.jpg', TRUE, 1),
('Traditional Tirunelveli Halwa', 'Soft, jelly-like wheat halwa cooked slow with ghee and sugar, highlighting sweet Tamil heritage.', 450.00, 10.00, 80, '/images/halwa.jpg', TRUE, 1),
('Stuffed Dry Fruit Pedha', 'Rich milk solids sweet stuffed with chopped almonds, pistachios, and saffron.', 600.00, 0.00, 50, '/images/pedha.jpg', TRUE, 1);

-- Savory Snacks (Category ID: 2)
INSERT INTO products (name, description, price, discount, stock, image_url, availability, category_id) VALUES
('Kai Murukku', 'Traditional handmade twisted rice flour snack, extra crunchy and fried to perfection.', 280.00, 0.00, 200, '/images/kai_murukku.jpg', TRUE, 2),
('Special Ribbon Pakoda', 'Thin ribbon-shaped crispy snack flavored with garlic, cumin, and red chili powder.', 240.00, 5.00, 120, '/images/ribbon_pakoda.jpg', TRUE, 2),
('Hot Butter Mixture', 'Tasty mix of sev, boondi, roasted peanuts, cashews, and traditional spices with butter infusion.', 260.00, 0.00, 180, '/images/mixture.jpg', TRUE, 2),
('Kerala Nendran Banana Chips', 'Crisply sliced raw banana chips fried in fresh pure cold-pressed coconut oil.', 320.00, 0.00, 150, '/images/banana_chips.jpg', TRUE, 2);

-- Pickles & Thokku (Category ID: 3)
INSERT INTO products (name, description, price, discount, stock, image_url, availability, category_id) VALUES
('Spicy Avakkai Mango Pickle', 'Traditional Andhra style mango pickle cured in mustard powder, oil, and spices.', 180.00, 0.00, 90, '/images/mango_pickle.jpg', TRUE, 3),
('Grandma Style Garlic Pickle', 'Peeled garlic cloves marinated and cooked in spicy oil tamarind mixture.', 195.00, 0.00, 70, '/images/garlic_pickle.jpg', TRUE, 3);

-- Podis & Masala Powders (Category ID: 4)
INSERT INTO products (name, description, price, discount, stock, image_url, availability, category_id) VALUES
('Idli Milagai Podi (Gunpowder)', 'Traditional roasted lentil and dry chili blend to accompany idlis and dosas.', 160.00, 0.00, 110, '/images/gunpowder.jpg', TRUE, 4);

-- 3. Seed Corporate Gift Packages
-- Products list is stored as a descriptive text/JSON for reference in package cards.
INSERT INTO gift_packages (name, description, price, image_url, products_included) VALUES
('Silver Package', 'A perfect starter gift package for festival greetings and return gifts containing essential traditional snacks and sweets.', 350.00, '/images/package_silver.jpg', 'Ghee Mysurpa (250g), Kai Murukku (200g), Hot Butter Mixture (200g)'),
('Gold Package', 'An elegant gifting combo pack ideal for weddings and corporate employee appreciation.', 750.00, '/images/package_gold.jpg', 'Ghee Mysurpa (250g), Motichoor Laddu (250g), Kai Murukku (250g), Special Ribbon Pakoda (200g), Gunpowder (100g)'),
('Premium Package', 'Premium selection of top-shelf traditional sweets and savories with beautiful eco-friendly packaging.', 1250.00, '/images/package_premium.jpg', 'Ghee Mysurpa (500g), Stuffed Dry Fruit Pedha (250g), Kerala Banana Chips (250g), Kai Murukku (250g), Garlic Pickle (200g), Avakkai Pickle (200g)'),
('Luxury Package', 'Our finest premium collection including dry fruit sweets, multiple crunchy snacks, and traditional side-dishes in a luxury wooden gift box.', 2200.00, '/images/package_luxury.jpg', 'Ghee Mysurpa (500g), Stuffed Dry Fruit Pedha (500g), Tirunelveli Halwa (250g), Kai Murukku (250g), Hot Butter Mixture (250g), Kerala Banana Chips (250g), Avakkai Pickle (200g), Gunpowder (200g)');

-- 4. Seed Admin Users
-- Username: admin, Password: admin123 (Bcrypt hash below)
INSERT INTO admins (username, email, password_hash) VALUES
('admin', 'admin@sharadha.com', '$2a$10$4w.7a9yGlwHl9xqLMyfwVOiNODzzfP8ufgRg5FwJlsCrm/JlpAPDa');

INSERT INTO customers (name, company_name, phone, email, password_hash) VALUES
('Demo Customer', 'Demo Corp', '9876543210', 'customer@gmail.com', '$2a$10$4w.7a9yGlwHl9xqLMyfwVOiNODzzfP8ufgRg5FwJlsCrm/JlpAPDa');
