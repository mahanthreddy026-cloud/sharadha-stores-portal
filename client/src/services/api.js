import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- MOCK DATABASE BACKEND CODE FOR STANDALONE PRODUCTION RUNS ON VERCEL ---
const USE_MOCK = window.location.hostname !== 'localhost';

if (USE_MOCK) {
  // Initialize mock localStorage database if not set
  if (!localStorage.getItem('mock_db_init')) {
    localStorage.setItem('mock_db_init', 'true');
    
    // Seed admin credentials
    localStorage.setItem('mock_admins', JSON.stringify([
      { id: 1, username: 'admin', email: 'admin@sharadha.com', password: 'admin123' }
    ]));
    
    // Seed customer credentials with correct phone 1111111111
    localStorage.setItem('mock_customers', JSON.stringify([
      { id: 1, name: 'Demo Customer', company_name: 'Demo Corp', phone: '1111111111', email: 'customer@gmail.com', password: 'customer123' }
    ]));
    
    // Seed categories
    localStorage.setItem('mock_categories', JSON.stringify([
      { id: 1, name: 'Traditional Sweets', description: 'Classic heritage sweets made with pure ghee and organic ingredients.' },
      { id: 2, name: 'Savory Snacks', description: 'Crispy and crunchy snacks perfect for tea-time and events.' },
      { id: 3, name: 'Pickles & Thokku', description: 'Traditional home-style pickles made from hand-picked mangoes.' },
      { id: 4, name: 'Podis & Masala Powders', description: 'Aromatic spice powders and rice mixes ground using traditional recipes.' }
    ]));
    
    // Seed products with correct image URLs
    localStorage.setItem('mock_products', JSON.stringify([
      { id: 1, name: 'Ghee Mysurpa', price: 520, discount: 5, stock: 100, category_id: 1, image_url: '/images/mysurpa.jpg', availability: 1, description: 'Meltingly soft traditional sweet made with chickpea flour and cow ghee.' },
      { id: 2, name: 'Special Motichoor Laddu', price: 480, discount: 0, stock: 150, category_id: 1, image_url: '/images/laddu.jpg', availability: 1, description: 'Fine boondi pearls fried in ghee, sweetened, and shaped.' },
      { id: 3, name: 'Traditional Tirunelveli Halwa', price: 450, discount: 10, stock: 80, category_id: 1, image_url: '/images/halwa.jpg', availability: 1, description: 'Soft wheat halwa cooked slow with ghee and sugar.' },
      { id: 4, name: 'Kai Murukku', price: 280, discount: 0, stock: 200, category_id: 2, image_url: '/images/kai_murukku.jpg', availability: 1, description: 'Traditional handmade twisted rice flour snack.' },
      { id: 5, name: 'Special Ribbon Pakoda', price: 240, discount: 5, stock: 120, category_id: 2, image_url: '/images/ribbon_pakoda.jpg', availability: 1, description: 'Thin ribbon-shaped crispy snack flavored with garlic.' },
      { id: 6, name: 'Kerala Banana Chips', price: 320, discount: 0, stock: 150, category_id: 2, image_url: '/images/banana_chips.jpg', availability: 1, description: 'Banana chips fried in fresh coconut oil.' }
    ]));
    
    // Seed packages
    localStorage.setItem('mock_packages', JSON.stringify([
      { id: 1, name: 'Silver Package', price: 350, products_included: 'Ghee Mysurpa (250g), Kai Murukku (200g)' },
      { id: 2, name: 'Gold Package', price: 750, products_included: 'Ghee Mysurpa (250g), Motichoor Laddu (250g), Kai Murukku (250g)' },
      { id: 3, name: 'Premium Package', price: 1250, products_included: 'Ghee Mysurpa (500g), Dry Fruit Pedha (250g), Kai Murukku (250g)' },
      { id: 4, name: 'Luxury Package', price: 2200, products_included: 'Ghee Mysurpa (500g), Dry Fruit Pedha (500g), Halwa (250g)' }
    ]));
    
    localStorage.setItem('mock_orders', JSON.stringify([]));
    localStorage.setItem('mock_order_items', JSON.stringify([]));
    localStorage.setItem('mock_quotes', JSON.stringify([]));
    localStorage.setItem('mock_payments', JSON.stringify([]));
    localStorage.setItem('mock_dispatch', JSON.stringify([]));
    localStorage.setItem('mock_history', JSON.stringify([]));
  }
}

// Interceptor to inject JWT credentials or short-circuit mock requests
api.interceptors.request.use(
  (config) => {
    if (USE_MOCK) {
      // In production (Vercel), immediately cancel the HTTP request and pass query parameters
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      source.cancel({ isMock: true, config });
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to run the client-side mock backend database
function runMockHandler(config) {
  let url = config.url.split('?')[0];
  if (url.startsWith('/api')) {
    url = url.substring(4);
  }
  if (!url.startsWith('/')) {
    url = '/' + url;
  }

  const method = config.method.toUpperCase();
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : null;
  
  const getDB = (key) => JSON.parse(localStorage.getItem(`mock_${key}`)) || [];
  const saveDB = (key, val) => localStorage.setItem(`mock_${key}`, JSON.stringify(val));

  let responseData = null;
  let responseStatus = 200;

  try {
    // --- Admin login ---
    if (url === '/login' && method === 'POST') {
      const admins = getDB('admins');
      const matched = admins.find(a => a.username === data.username || a.email === data.username);
      if (matched && matched.password === data.password) {
        responseData = {
          token: 'mock_admin_jwt_token_payload',
          admin: { id: matched.id, username: matched.username, email: matched.email }
        };
      } else {
        responseStatus = 401;
        responseData = { message: 'Invalid username or password.' };
      }
    }
    
    // --- Forgot password ---
    else if (url === '/forgot-password' && method === 'POST') {
      responseData = { message: 'Password recovery email dispatched. Please check your inbox.' };
    }

    // --- Customer registration ---
    else if (url === '/customer/register' && method === 'POST') {
      const customers = getDB('customers');
      const exists = customers.find(c => c.email === data.email);
      if (exists) {
        responseStatus = 400;
        responseData = { message: 'A customer account with this email already exists.' };
      } else {
        const nextId = customers.length + 1;
        const newCust = {
          id: nextId,
          name: data.name,
          company_name: data.company_name,
          phone: data.phone,
          email: data.email,
          password: data.password
        };
        customers.push(newCust);
        saveDB('customers', customers);
        responseData = { message: 'Account registered successfully. Please sign in.', customerId: nextId };
      }
    }

    // --- Customer login ---
    else if (url === '/customer/login' && method === 'POST') {
      const customers = getDB('customers');
      const matched = customers.find(c => c.email === data.email && c.password === data.password);
      if (matched) {
        responseData = {
          token: 'mock_customer_jwt_token_payload',
          customer: { id: matched.id, name: matched.name, email: matched.email, phone: matched.phone, company_name: matched.company_name }
        };
      } else {
        responseStatus = 401;
        responseData = { message: 'Invalid email or password.' };
      }
    }

    // --- Fetch categories ---
    else if (url === '/categories' && method === 'GET') {
      responseData = getDB('categories');
    }

    // --- Fetch products ---
    else if (url === '/products' && method === 'GET') {
      const prods = getDB('products');
      const cats = getDB('categories');
      responseData = prods.map(p => {
        const c = cats.find(cat => cat.id === p.category_id);
        return { ...p, category_name: c ? c.name : 'Unassigned' };
      });
    }

    // --- Add/Edit/Delete products ---
    else if (url === '/products' && method === 'POST') {
      const prods = getDB('products');
      const nextId = prods.length > 0 ? Math.max(...prods.map(p=>p.id)) + 1 : 1;
      const newProd = { id: nextId, ...data };
      prods.push(newProd);
      saveDB('products', prods);
      responseData = { message: 'Product created', productId: nextId };
    }
    else if (url.startsWith('/products/') && method === 'PUT') {
      const id = parseInt(url.split('/')[2], 10);
      const prods = getDB('products');
      const idx = prods.findIndex(p => p.id === id);
      if (idx !== -1) {
        prods[idx] = { ...prods[idx], ...data };
        saveDB('products', prods);
        responseData = { message: 'Product updated' };
      } else {
        responseStatus = 404;
        responseData = { message: 'Product not found' };
      }
    }
    else if (url.startsWith('/products/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[2], 10);
      const prods = getDB('products');
      const filtered = prods.filter(p => p.id !== id);
      saveDB('products', filtered);
      responseData = { message: 'Product deleted' };
    }

    // --- Add/Edit/Delete categories ---
    else if (url === '/categories' && method === 'POST') {
      const cats = getDB('categories');
      const nextId = cats.length > 0 ? Math.max(...cats.map(c=>c.id)) + 1 : 1;
      cats.push({ id: nextId, ...data });
      saveDB('categories', cats);
      responseData = { message: 'Category created', categoryId: nextId };
    }
    else if (url.startsWith('/categories/') && method === 'PUT') {
      const id = parseInt(url.split('/')[2], 10);
      const cats = getDB('categories');
      const idx = cats.findIndex(c => c.id === id);
      if (idx !== -1) {
        cats[idx] = { ...cats[idx], ...data };
        saveDB('categories', cats);
        responseData = { message: 'Category updated' };
      }
    }
    else if (url.startsWith('/categories/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[2], 10);
      const cats = getDB('categories');
      saveDB('categories', cats.filter(c => c.id !== id));
      responseData = { message: 'Category deleted' };
    }

    // --- Customer list of orders ---
    else if (url === '/customer/orders' && method === 'GET') {
      const customerSession = JSON.parse(localStorage.getItem('customer'));
      const email = customerSession ? customerSession.email : 'customer@gmail.com';
      const orders = getDB('orders');
      responseData = orders.filter(o => o.email === email).sort((a,b) => b.id - a.id);
    }

    // --- Admin list of orders ---
    else if (url === '/orders' && method === 'GET') {
      const orders = getDB('orders');
      const { status, search } = config.params || {};
      let filtered = [...orders];
      if (status) filtered = filtered.filter(o => o.status === status);
      if (search) {
        const sw = search.toLowerCase();
        filtered = filtered.filter(o => 
          o.customer_name.toLowerCase().includes(sw) || 
          o.request_id.toLowerCase().includes(sw)
        );
      }
      responseData = {
        orders: filtered.sort((a,b) => b.id - a.id),
        pagination: { total: filtered.length, page: 1, limit: 100, pages: 1 }
      };
    }

    // --- Create order ---
    else if (url === '/orders' && method === 'POST') {
      const orders = getDB('orders');
      const nextId = orders.length > 0 ? Math.max(...orders.map(o=>o.id)) + 1 : 1;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const reqId = `SRD-${dateStr}-${1000 + Math.floor(Math.random() * 9000)}`;
      
      const newOrder = {
        id: nextId,
        request_id: reqId,
        status: 'Pending',
        created_at: new Date().toISOString(),
        quote_grand_total: null,
        assigned_employee: null,
        ...data
      };
      orders.push(newOrder);
      saveDB('orders', orders);

      // Save items
      if (data.items && data.items.length > 0) {
        const orderItems = getDB('order_items');
        data.items.forEach(item => {
          orderItems.push({
            bulk_order_id: nextId,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          });
        });
        saveDB('order_items', orderItems);
      }

      // Save history
      const history = getDB('history');
      history.push({
        id: history.length + 1,
        bulk_order_id: nextId,
        status: 'Pending',
        notes: 'Bulk order enquiry registered.',
        created_at: new Date().toISOString()
      });
      saveDB('history', history);

      responseData = { message: 'Order created', id: nextId, request_id: reqId };
    }

    // --- Inspect order details ---
    else if (url.startsWith('/orders/') && method === 'GET') {
      const param = url.split('/')[2];
      const orders = getDB('orders');
      let order = null;
      if (isNaN(param)) {
        order = orders.find(o => o.request_id === param);
      } else {
        order = orders.find(o => o.id === parseInt(param, 10));
      }

      if (order) {
        const oId = order.id;
        const items = getDB('order_items').filter(item => item.bulk_order_id === oId);
        const prods = getDB('products');
        const mappedItems = items.map(it => {
          const p = prods.find(pr => pr.id === it.product_id);
          return { ...it, name: p ? p.name : 'Delicacy' };
        });

        const history = getDB('history').filter(h => h.bulk_order_id === oId).sort((a,b) => b.id - a.id);
        const quotes = getDB('quotes').filter(q => q.bulk_order_id === oId);
        const payments = getDB('payments').filter(p => p.bulk_order_id === oId);
        const dispatch = getDB('dispatch').filter(d => d.bulk_order_id === oId);

        responseData = {
          order,
          items: mappedItems,
          history,
          quote: quotes[quotes.length - 1] || null,
          payments,
          dispatch: dispatch[dispatch.length - 1] || null
        };
      } else {
        responseStatus = 404;
        responseData = { message: 'Order not found' };
      }
    }

    // --- Admin build quotation ---
    else if (url.startsWith('/orders/') && url.endsWith('/quote') && method === 'POST') {
      const id = parseInt(url.split('/')[2], 10);
      const orders = getDB('orders');
      const oIdx = orders.findIndex(o => o.id === id);
      if (oIdx !== -1) {
        const subtotal = data.items.reduce((sum, it) => sum + (it.quantity * it.unit_price), 0);
        const tax = (subtotal - data.discount) * (data.tax_rate / 100);
        const total = subtotal - data.discount + tax + data.delivery_charge;

        // Save quote
        const quotes = getDB('quotes');
        const qId = quotes.length + 1;
        const newQuote = {
          id: qId,
          bulk_order_id: id,
          discount: data.discount,
          tax_rate: data.tax_rate,
          delivery_charge: data.delivery_charge,
          grand_total: total,
          generated_pdf_path: `/uploads/quotes/Quote-${orders[oIdx].request_id}.pdf`,
          status: 'Sent'
        };
        quotes.push(newQuote);
        saveDB('quotes', quotes);

        // Update order status
        orders[oIdx].status = 'Quotation Sent';
        orders[oIdx].quote_grand_total = total;
        saveDB('orders', orders);

        // Save items updates
        const orderItems = getDB('order_items').filter(it => it.bulk_order_id !== id);
        data.items.forEach(it => {
          orderItems.push({ bulk_order_id: id, product_id: it.product_id, quantity: it.quantity, unit_price: it.unit_price });
        });
        saveDB('order_items', orderItems);

        // Save history
        const history = getDB('history');
        history.push({
          id: history.length + 1,
          bulk_order_id: id,
          status: 'Quotation Sent',
          notes: `Quotation of Rs. ${total.toFixed(2)} generated and emailed to client.`,
          created_at: new Date().toISOString()
        });
        saveDB('history', history);

        responseData = {
          message: 'Quote generated',
          pdfUrl: `/uploads/quotes/Quote-${orders[oIdx].request_id}.pdf`,
          quote: newQuote
        };
      }
    }

    // --- Admin update timeline status ---
    else if (url.startsWith('/orders/') && url.endsWith('/status') && method === 'PUT') {
      const id = parseInt(url.split('/')[2], 10);
      const orders = getDB('orders');
      const oIdx = orders.findIndex(o => o.id === id);
      if (oIdx !== -1) {
        if (data.status) orders[oIdx].status = data.status;
        if (data.assigned_employee) orders[oIdx].assigned_employee = data.assigned_employee;
        saveDB('orders', orders);

        // Save history
        const history = getDB('history');
        history.push({
          id: history.length + 1,
          bulk_order_id: id,
          status: data.status || orders[oIdx].status,
          notes: data.notes || `Order status updated to ${data.status || orders[oIdx].status}`,
          created_at: new Date().toISOString()
        });
        saveDB('history', history);

        responseData = { message: 'Status updated' };
      }
    }

    // --- Admin update dispatch tracking ---
    else if (url.startsWith('/orders/') && url.endsWith('/dispatch') && method === 'PUT') {
      const id = parseInt(url.split('/')[2], 10);
      const dispatchList = getDB('dispatch');
      const idx = dispatchList.findIndex(d => d.bulk_order_id === id);
      const newDisp = {
        bulk_order_id: id,
        delivery_partner: data.delivery_partner,
        tracking_number: data.tracking_number,
        status: data.status || 'Dispatched',
        estimated_delivery: data.estimated_delivery
      };

      if (idx !== -1) {
        dispatchList[idx] = { ...dispatchList[idx], ...newDisp };
      } else {
        dispatchList.push(newDisp);
      }
      saveDB('dispatch', dispatchList);

      // Update order status if dispatched
      const orders = getDB('orders');
      const oIdx = orders.findIndex(o => o.id === id);
      if (oIdx !== -1) {
        orders[oIdx].status = data.status || 'Dispatched';
        saveDB('orders', orders);

        // Save history
        const history = getDB('history');
        history.push({
          id: history.length + 1,
          bulk_order_id: id,
          status: data.status || 'Dispatched',
          notes: `Dispatch shipping log updated. Courier: ${data.delivery_partner || 'N/A'}. tracking ID: ${data.tracking_number || 'N/A'}`,
          created_at: new Date().toISOString()
        });
        saveDB('history', history);
      }
      responseData = { message: 'Dispatch updated' };
    }

    // --- Client logs payment ---
    else if (url.startsWith('/orders/') && url.endsWith('/payment') && method === 'POST') {
      const id = parseInt(url.split('/')[2], 10);
      const payments = getDB('payments');
      const pId = payments.length + 1;
      payments.push({
        id: pId,
        bulk_order_id: id,
        amount: data.amount,
        payment_method: data.payment_method,
        transaction_id: data.transaction_id,
        status: data.status || 'Completed',
        created_at: new Date().toISOString()
      });
      saveDB('payments', payments);

      if (data.status === 'Completed') {
        const orders = getDB('orders');
        const oIdx = orders.findIndex(o => o.id === id);
        if (oIdx !== -1) {
          orders[oIdx].status = 'Processing';
          saveDB('orders', orders);

          const history = getDB('history');
          history.push({
            id: history.length + 1,
            bulk_order_id: id,
            status: 'Processing',
            notes: `Deposit of Rs. ${data.amount} logged. Preparing traditional treats...`,
            created_at: new Date().toISOString()
          });
          saveDB('history', history);

          // Auto create dispatch job
          const dispatchList = getDB('dispatch');
          dispatchList.push({ bulk_order_id: id, status: 'Processing' });
          saveDB('dispatch', dispatchList);
        }
      }
      responseData = { message: 'Payment recorded' };
    }

    // --- Admin Dashboard Stats ---
    else if (url === '/dashboard' && method === 'GET') {
      const orders = getDB('orders');
      let pending = 0, approved = 0, completed = 0, revenue = 0;
      orders.forEach(o => {
        if (o.status === 'Pending' || o.status === 'Quotation Sent') pending++;
        else if (o.status === 'Delivered') { completed++; revenue += parseFloat(o.quote_grand_total || o.budget || 0); }
        else if (o.status !== 'Rejected') approved++;
      });
      
      responseData = {
        counters: { total: orders.length, pending, approved, rejected: orders.filter(o=>o.status==='Rejected').length, completed, revenue },
        charts: {
          monthly: [{ month: new Date().toISOString().substring(0, 7), orders: orders.length, revenue }],
          status: [{ name: 'Pending', value: pending }, { name: 'Active', value: approved }, { name: 'Completed', value: completed }]
        },
        latestOrders: orders.slice(0, 5)
      };
    }

    // --- Admin Reports Stats ---
    else if (url === '/reports' && method === 'GET') {
      const orders = getDB('orders');
      const prods = getDB('products');
      const custs = getDB('customers');
      responseData = {
        orders,
        topProducts: prods.slice(0, 3).map(p => ({ name: p.name, price: p.price, total_quantity: 250, total_revenue: 130000 })),
        customers: custs.map(c => ({ name: c.name, email: c.email, phone: c.phone, company_name: c.company_name, total_orders: 1, total_spend: 50000 }))
      };
    }

    // Catch delete order
    else if (url.startsWith('/orders/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[2], 10);
      const orders = getDB('orders');
      saveDB('orders', orders.filter(o => o.id !== id));
      responseData = { message: 'Order deleted' };
    }

    // --- Catch undefined routes ---
    else {
      responseStatus = 404;
      responseData = { message: 'Mock API path not matched.' };
    }

  } catch (err) {
    console.error('Mock DB Exception:', err);
    responseStatus = 500;
    responseData = { message: 'Mock database handler crashed.' };
  }

  // Return simulated Axios Response structure
  return {
    data: responseData,
    status: responseStatus,
    statusText: responseStatus >= 200 && responseStatus < 300 ? 'OK' : 'Error',
    headers: {},
    config
  };
}

// Intercept all canceled mock requests and recover them with simulated local database responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If the request was cancelled by our mock system, recover the details and return the mock database response
    if (axios.isCancel(error) && error.message && error.message.isMock) {
      const { config } = error.message;
      const res = runMockHandler(config);
      if (res.status >= 200 && res.status < 300) {
        return Promise.resolve(res);
      } else {
        return Promise.reject({
          response: res,
          message: res.data?.message || 'Error occurred in mock handler'
        });
      }
    }

    // Fallback in case of standard network errors
    const config = error.config;
    if (USE_MOCK && config) {
      console.log('Fallback: network request failed, routing to mock DB for', config.url);
      const res = runMockHandler(config);
      if (res.status >= 200 && res.status < 300) {
        return Promise.resolve(res);
      } else {
        return Promise.reject({
          response: res,
          message: res.data?.message || 'Error occurred in fallback mock handler'
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
