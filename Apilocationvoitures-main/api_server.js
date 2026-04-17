import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = Number(process.env.PORT || 5000);
const SECRET_KEY = process.env.JWT_SECRET || 'SUPER_SECRET_LOCAUTO_KEY';
const DRIVER_FEE_PER_DAY = Number(process.env.DRIVER_FEE_PER_DAY || 10000);

const defaultImages = [
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1000", // Toyota RAV4
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000", // Generic car
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000", // Sports car
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg/800px-2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg", // Hyundai Tucson
  "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=1000", // Peugeot
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000", // Mercedes
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000", // Luxury car
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1000"  // SUV
];

const seededCars = [
  {
    ownerEmail: 'admin@gmail.com',
    make: 'Toyota',
    model: 'RAV4',
    year: 2023,
    pricePerDay: 35000,
    location: 'Douala',
    category: 'SUV',
    seats: 5,
    transmission: 'Automatique',
    images: [defaultImages[0], defaultImages[6], defaultImages[1]]
  },
  {
    ownerEmail: 'admin@gmail.com',
    make: 'Hyundai',
    model: 'Tucson',
    year: 2022,
    pricePerDay: 32000,
    location: 'Yaoundé',
    category: 'SUV',
    seats: 5,
    transmission: 'Automatique',
    images: [defaultImages[3], defaultImages[5], defaultImages[7]]
  },
  {
    ownerEmail: 'jean@owner.com',
    make: 'Peugeot',
    model: '208',
    year: 2021,
    pricePerDay: 22000,
    location: 'Kribi',
    category: 'Citadine',
    seats: 5,
    transmission: 'Manuelle',
    images: [defaultImages[4], defaultImages[2], defaultImages[0]]
  },
  {
    ownerEmail: 'marie@owner.com',
    make: 'Mercedes',
    model: 'GLC',
    year: 2024,
    pricePerDay: 65000,
    location: 'Douala',
    category: 'SUV',
    seats: 5,
    transmission: 'Automatique',
    images: [defaultImages[2], defaultImages[1], defaultImages[3]]
  },
  {
    ownerEmail: 'jean@owner.com',
    make: 'Toyota',
    model: 'Hilux',
    year: 2022,
    pricePerDay: 42000,
    location: 'Garoua',
    category: '4x4',
    seats: 5,
    transmission: 'Manuelle',
    images: [defaultImages[7], defaultImages[0], defaultImages[5]]
  },
  {
    ownerEmail: 'marie@owner.com',
    make: 'Renault',
    model: 'Master',
    year: 2021,
    pricePerDay: 47000,
    location: 'Bafoussam',
    category: 'Utilitaire',
    seats: 3,
    transmission: 'Manuelle',
    images: [defaultImages[5], defaultImages[6], defaultImages[2]]
  },
  {
    ownerEmail: 'admin@gmail.com',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    pricePerDay: 30000,
    location: 'Yaoundé',
    category: 'Berline',
    seats: 5,
    transmission: 'Automatique',
    images: [defaultImages[1], defaultImages[4], defaultImages[6]]
  }
];

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'k@ldjob20065',
  database: process.env.DB_NAME || 'locautocm_db'
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10
});

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: "Token requis." });
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(401).json({ message: "Token ou session invalide." });
  }
};

const sendMail = async ({ to, subject, text, html }) => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error("Configuration Gmail manquante. Ajoutez GMAIL_USER et GMAIL_APP_PASSWORD dans .env.");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });

  await transporter.sendMail({
    from: `"LocAutoCM" <${gmailUser}>`,
    to,
    subject,
    text,
    html
  });
};

const mapReservation = (row) => ({
  id: String(row.id),
  carId: String(row.car_id),
  renterId: String(row.renter_id),
  startDate: row.start_date,
  endDate: row.end_date,
  totalPrice: Number(row.total_price),
  status: row.status,
  type: row.type,
  withDriver: Boolean(row.with_driver),
  createdAt: row.created_at,
  invoiceId: row.invoice_id ? String(row.invoice_id) : null,
  invoiceNumber: row.invoice_number || null,
  carName: row.car_name || null,
  ownerName: row.owner_name || null,
  renterName: row.renter_name || null
});

const createInvoicePayload = (reservation, extra = {}) => {
  const amountNet = Number(reservation.total_price) / 1.05;
  const serviceFee = Number(reservation.total_price) - amountNet;
  return {
    invoiceId: reservation.invoice_id ? String(reservation.invoice_id) : null,
    invoiceNumber: reservation.invoice_number,
    reservationId: String(reservation.id),
    type: reservation.type,
    status: reservation.status,
    issuedAt: reservation.created_at,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    amountNet: Number(amountNet.toFixed(2)),
    serviceFee: Number(serviceFee.toFixed(2)),
    total: Number(Number(reservation.total_price).toFixed(2)),
    carName: reservation.car_name,
    ownerName: reservation.owner_name,
    renterName: reservation.renter_name,
    ...extra
  };
};

const renderInvoiceHtml = (invoice) => `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Facture ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; background:#f5f7fb; color:#1f2937; padding:24px; }
        .card { max-width:720px; margin:0 auto; background:#fff; border:1px solid #dbe3f0; border-radius:18px; padding:32px; }
        .head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:24px; }
        .badge { display:inline-block; padding:6px 10px; border-radius:999px; background:#dbeafe; color:#1d4ed8; font-size:12px; font-weight:700; }
        .row { display:flex; justify-content:space-between; gap:16px; padding:10px 0; border-bottom:1px solid #eef2f7; }
        .total { font-size:20px; font-weight:700; color:#1d4ed8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="head">
          <div>
            <h1 style="margin:0 0 8px;">Facture</h1>
            <div class="badge">${invoice.type === 'rental' ? 'Location' : 'Reservation'}</div>
          </div>
          <div style="text-align:right;">
            <div><strong>${invoice.invoiceNumber}</strong></div>
            <div>${new Date(invoice.issuedAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
        <div class="row"><span>Locataire</span><strong>${invoice.renterName}</strong></div>
        <div class="row"><span>Proprietaire</span><strong>${invoice.ownerName}</strong></div>
        <div class="row"><span>Vehicule</span><strong>${invoice.carName}</strong></div>
        <div class="row"><span>Periode</span><strong>Du ${new Date(invoice.startDate).toLocaleDateString('fr-FR')} au ${new Date(invoice.endDate).toLocaleDateString('fr-FR')}</strong></div>
        <div class="row"><span>Montant location</span><strong>${invoice.amountNet.toLocaleString('fr-FR')} FCFA</strong></div>
        <div class="row"><span>Frais service</span><strong>${invoice.serviceFee.toLocaleString('fr-FR')} FCFA</strong></div>
        <div class="row" style="border-bottom:none; padding-top:18px;">
          <span class="total">Total</span>
          <span class="total">${invoice.total.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>
    </body>
  </html>
`;

const createNotification = async (userId, title, message, type = 'info') => {
  const [[existing]] = await pool.execute(
    `SELECT id
     FROM notifications
     WHERE user_id = ? AND title = ? AND message = ? AND type = ? AND is_read = FALSE
     LIMIT 1`,
    [userId, title, message, type]
  );

  if (existing) {
    return existing.id;
  }

  await pool.execute(
    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
    [userId, title, message, type]
  );
};

const normalizeRating = (rating) => {
  const numericRating = Number(rating || 0);
  return numericRating > 0 ? Number(numericRating.toFixed(1)) : 4.0;
};

const calculateReservationDays = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
};

const toIsoDate = (value) => new Date(value).toISOString().split('T')[0];

const isTodayWithinPeriod = (from, to) => {
  const today = toIsoDate(new Date());
  return from <= today && today <= to;
};

const getUnavailablePeriodsByCarIds = async (carIds = []) => {
  if (!Array.isArray(carIds) || carIds.length === 0) {
    return new Map();
  }

  const placeholders = carIds.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `SELECT car_id, start_date, end_date
     FROM reservations
     WHERE car_id IN (${placeholders})
       AND status IN ('pending', 'accepted')
       AND end_date >= CURDATE()
     ORDER BY start_date ASC`,
    carIds
  );

  const periodsByCar = new Map();
  for (const row of rows) {
    const periods = periodsByCar.get(row.car_id) || [];
    periods.push({
      from: toIsoDate(row.start_date),
      to: toIsoDate(row.end_date)
    });
    periodsByCar.set(row.car_id, periods);
  }

  return periodsByCar;
};

const hasReservationConflict = async (carId, startDate, endDate) => {
  const [[conflict]] = await pool.execute(
    `SELECT id
     FROM reservations
     WHERE car_id = ?
       AND status IN ('pending', 'accepted')
       AND start_date <= ?
       AND end_date >= ?
     LIMIT 1`,
    [carId, endDate, startDate]
  );

  return Boolean(conflict);
};

const ensureColumnExists = async (tableName, columnName, definition) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbConfig.database, tableName, columnName]
  );

  if (rows[0].count === 0) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const bootstrapDatabase = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('renter','owner','admin') DEFAULT 'renter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    pricePerDay DECIMAL(10,2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    seats INT NOT NULL,
    transmission ENUM('Automatique','Manuelle') NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    rating FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS car_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    image_url TEXT NOT NULL,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    renter_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending','accepted','rejected','cancelled','completed') DEFAULT 'pending',
    type ENUM('rental','reservation') DEFAULT 'reservation',
    with_driver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info','reservation','rental','invoice','security') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    issued_to_user_id INT NOT NULL,
    issued_by_user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    type ENUM('rental','reservation') DEFAULT 'reservation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by_user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS password_reset_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(150) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await ensureColumnExists('reservations', 'type', `ENUM('rental','reservation') DEFAULT 'reservation'`);
  await ensureColumnExists('reservations', 'with_driver', `BOOLEAN DEFAULT FALSE`);
  await ensureColumnExists('notifications', 'is_read', `BOOLEAN DEFAULT FALSE`);
  await pool.query(`
    DELETE n1
    FROM notifications n1
    INNER JOIN notifications n2
      ON n1.user_id = n2.user_id
     AND n1.title = n2.title
     AND n1.message = n2.message
     AND n1.type = n2.type
     AND n1.is_read = n2.is_read
     AND n1.id < n2.id
  `);
  
  // Fix location names to match frontend (add accents)
  await pool.execute("UPDATE cars SET location = 'Yaoundé' WHERE location = 'Yaounde'");
  
  // Fix Tucson images - delete old and re-insert with correct URLs
  const [[tucsonCar]] = await pool.execute(
    "SELECT id FROM cars WHERE make = 'Hyundai' AND model = 'Tucson' LIMIT 1"
  );
  
  if (tucsonCar) {
    // Delete existing images for Tucson
    await pool.execute('DELETE FROM car_images WHERE car_id = ?', [tucsonCar.id]);
    
    // Insert new images
    const tucsonImages = [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg/800px-2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Hyundai_Tucson_NX4_IMG_3872.jpg/800px-Hyundai_Tucson_NX4_IMG_3872.jpg",
      defaultImages[7]
    ];
    for (const imageUrl of tucsonImages) {
      await pool.execute('INSERT INTO car_images (car_id, image_url) VALUES (?, ?)', [tucsonCar.id, imageUrl]);
    }
  }
  
  await pool.execute('UPDATE cars SET rating = 4.0 WHERE rating IS NULL OR rating <= 0');
  await pool.execute('UPDATE cars SET pricePerDay = pricePerDay * 1000 WHERE pricePerDay > 0 AND pricePerDay < 1000');

  const adminPasswordHash = await bcrypt.hash('admin', 10);
  const ownerPasswordHash = await bcrypt.hash('123456', 10);
  const renterPasswordHash = await bcrypt.hash('123456', 10);

  await pool.execute(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES (?, ?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name), role = 'admin'`,
    ['Administrateur principal', 'admin@gmail.com', '+237690000000', adminPasswordHash]
  );

  await pool.execute(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES (?, ?, ?, ?, 'owner')
     ON DUPLICATE KEY UPDATE name = VALUES(name), role = 'owner'`,
    ['Jean Proprio', 'jean@owner.com', '+237691111111', ownerPasswordHash]
  );

  await pool.execute(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES (?, ?, ?, ?, 'owner')
     ON DUPLICATE KEY UPDATE name = VALUES(name), role = 'owner'`,
    ['Marie Proprio', 'marie@owner.com', '+237692222222', ownerPasswordHash]
  );

  await pool.execute(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES (?, ?, ?, ?, 'renter')
     ON DUPLICATE KEY UPDATE name = VALUES(name), role = 'renter'`,
    ['Paul Locataire', 'paul@renter.com', '+237693333333', renterPasswordHash]
  );

  for (const car of seededCars) {
    const [[owner]] = await pool.execute('SELECT id FROM users WHERE email = ?', [car.ownerEmail]);
    if (!owner) continue;

    const [existingCars] = await pool.execute(
      'SELECT id FROM cars WHERE owner_id = ? AND make = ? AND model = ?',
      [owner.id, car.make, car.model]
    );

    let carId = existingCars[0]?.id;

    if (!carId) {
      const [result] = await pool.execute(
        `INSERT INTO cars (owner_id, make, model, year, pricePerDay, location, category, seats, transmission, available, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 4.8)`,
        [owner.id, car.make, car.model, car.year, car.pricePerDay, car.location, car.category, car.seats, car.transmission]
      );
      carId = result.insertId;
    }

    const [imageRows] = await pool.execute('SELECT COUNT(*) AS count FROM car_images WHERE car_id = ?', [carId]);
    if (imageRows[0].count === 0) {
      for (const image of car.images) {
        await pool.execute('INSERT INTO car_images (car_id, image_url) VALUES (?, ?)', [carId, image]);
      }
    }
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const reservationDays = calculateReservationDays(start_date, end_date);
    const baseAmount = reservationDays * Number(car.pricePerDay);
    const driverFee = Boolean(with_driver) ? reservationDays * DRIVER_FEE_PER_DAY : 0;
    const expectedTotalPrice = Number(((baseAmount + driverFee) * 1.05).toFixed(2));

    if (Number(total_price) !== expectedTotalPrice) {
      return res.status(400).json({
        message: `Prix invalide. Total attendu: ${expectedTotalPrice} FCFA.`,
        pricing: {
          days: reservationDays,
          baseAmount,
          driverFee,
          serviceFee: Number(((baseAmount + driverFee) * 0.05).toFixed(2)),
          total: expectedTotalPrice
        }
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, role || 'renter']
    );

    const user = {
      id: String(result.insertId),
      name,
      email,
      phone,
      role: role || 'renter'
    };
    const token = jwt.sign({ id: result.insertId, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.status(201).json({ message: "Utilisateur créé avec succès", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/forgot-password/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.execute('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Aucun compte trouvé pour cet email." });
    }

    const user = rows[0];
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.execute('UPDATE password_reset_codes SET used_at = NOW() WHERE email = ? AND used_at IS NULL', [email]);
    await pool.execute(
      'INSERT INTO password_reset_codes (user_id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, email, codeHash, expiresAt]
    );

    await sendMail({
      to: email,
      subject: 'Code de verification LocAutoCM',
      text: `Bonjour ${user.name}, votre code de verification est ${code}. Il expire dans 10 minutes.`,
      html: `<p>Bonjour <strong>${user.name}</strong>,</p><p>Votre code de verification est :</p><h2 style="letter-spacing:4px;">${code}</h2><p>Ce code expire dans 10 minutes.</p>`
    });

    await createNotification(user.id, 'Code de réinitialisation envoyé', 'Un code de vérification a été envoyé à votre adresse email.', 'security');
    res.json({ message: "Code envoyé par email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/forgot-password/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    const [rows] = await pool.execute(
      `SELECT * FROM password_reset_codes
       WHERE email = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Le code est invalide ou expiré." });
    }

    const reset = rows[0];
    const isMatch = await bcrypt.compare(code, reset.code_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Le code est incorrect." });
    }

    const resetToken = jwt.sign(
      { email, resetId: reset.id, type: 'password-reset' },
      SECRET_KEY,
      { expiresIn: '15m' }
    );

    res.json({ message: "Code vérifié.", resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/forgot-password/change-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const decoded = jwt.verify(resetToken, SECRET_KEY);

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ message: "Jeton invalide." });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM password_reset_codes WHERE id = ? AND email = ? AND used_at IS NULL AND expires_at > NOW()',
      [decoded.resetId, decoded.email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "La demande de réinitialisation a expiré." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, decoded.email]);
    await pool.execute('UPDATE password_reset_codes SET used_at = NOW() WHERE id = ?', [decoded.resetId]);

    const [[user]] = await pool.execute('SELECT id FROM users WHERE email = ?', [decoded.email]);
    if (user) {
      await createNotification(user.id, 'Mot de passe modifié', 'Votre mot de passe a été changé avec succès.', 'security');
    }

    res.json({ message: "Mot de passe modifié avec succès." });
  } catch {
    res.status(400).json({ message: "Impossible de changer le mot de passe. Le lien ou le code n'est plus valide." });
  }
});

app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const [[user]] = await pool.execute(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/cars', async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, u.name AS owner_name, u.email AS owner_email
      FROM cars c
      JOIN users u ON u.id = c.owner_id
      ORDER BY c.created_at DESC
    `);

    const [images] = await pool.execute('SELECT car_id, image_url FROM car_images ORDER BY id ASC');
    const imagesByCar = new Map();
    for (const image of images) {
      if (!image.image_url || !String(image.image_url).trim()) continue;
      const list = imagesByCar.get(image.car_id) || [];
      list.push(image.image_url);
      imagesByCar.set(image.car_id, list);
    }

    const unavailablePeriodsByCar = await getUnavailablePeriodsByCarIds(rows.map((car) => car.id));

    res.json(rows.map((car, index) => ({
      id: String(car.id),
      make: car.make,
      model: car.model,
      year: car.year,
      pricePerDay: Number(car.pricePerDay),
      location: car.location,
      images: imagesByCar.get(car.id) || [defaultImages[index % defaultImages.length]],
      rating: normalizeRating(car.rating),
      ownerId: String(car.owner_id),
      ownerName: car.owner_name,
      ownerEmail: car.owner_email,
      available: !(unavailablePeriodsByCar.get(car.id) || []).some((period) => isTodayWithinPeriod(period.from, period.to)),
      unavailablePeriods: unavailablePeriodsByCar.get(car.id) || [],
      category: car.category,
      seats: car.seats,
      transmission: car.transmission
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, u.name AS owner_name, u.email AS owner_email
      FROM cars c
      JOIN users u ON u.id = c.owner_id
      WHERE c.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Véhicule introuvable." });
    }

    const car = rows[0];
    const [imgRows] = await pool.execute('SELECT image_url FROM car_images WHERE car_id = ? ORDER BY id ASC', [car.id]);
    const validImages = imgRows.map((item) => item.image_url).filter((image) => image && String(image).trim());
    const unavailablePeriodsByCar = await getUnavailablePeriodsByCarIds([car.id]);
    const unavailablePeriods = unavailablePeriodsByCar.get(car.id) || [];

    res.json({
      id: String(car.id),
      make: car.make,
      model: car.model,
      year: car.year,
      pricePerDay: Number(car.pricePerDay),
      location: car.location,
      images: validImages.length > 0 ? validImages : [defaultImages[(Number(car.id) - 1) % defaultImages.length]],
      rating: normalizeRating(car.rating),
      ownerId: String(car.owner_id),
      ownerName: car.owner_name,
      ownerEmail: car.owner_email,
      available: !unavailablePeriods.some((period) => isTodayWithinPeriod(period.from, period.to)),
      unavailablePeriods,
      category: car.category,
      seats: car.seats,
      transmission: car.transmission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/cars/:id/availability', async (req, res) => {
  try {
    const [[car]] = await pool.execute('SELECT id FROM cars WHERE id = ?', [req.params.id]);

    if (!car) {
      return res.status(404).json({ message: "Véhicule introuvable." });
    }

    const unavailablePeriodsByCar = await getUnavailablePeriodsByCarIds([car.id]);
    const unavailablePeriods = unavailablePeriodsByCar.get(car.id) || [];

    res.json({
      carId: String(car.id),
      available: !unavailablePeriods.some((period) => isTodayWithinPeriod(period.from, period.to)),
      unavailablePeriods
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cars', authMiddleware, async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès refusé." });
  }

  try {
    const {
      make,
      model,
      year,
      pricePerDay,
      location,
      category,
      seats,
      transmission,
      images = []
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO cars (owner_id, make, model, year, pricePerDay, location, category, seats, transmission, available, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 5)`,
      [req.user.id, make, model, year, pricePerDay, location, category, seats, transmission]
    );

    const safeImages = Array.isArray(images) && images.length > 0 ? images.slice(0, 8) : [defaultImages[0], defaultImages[1], defaultImages[2]];
    for (const image of safeImages) {
      if (image?.trim()) {
        await pool.execute('INSERT INTO car_images (car_id, image_url) VALUES (?, ?)', [result.insertId, image.trim()]);
      }
    }

    await createNotification(req.user.id, 'Véhicule ajouté', `${make} ${model} a été ajouté à votre flotte.`, 'info');

    const [[car]] = await pool.execute(`
      SELECT c.*, u.name AS owner_name, u.email AS owner_email
      FROM cars c JOIN users u ON u.id = c.owner_id WHERE c.id = ?
    `, [result.insertId]);
    const [carImages] = await pool.execute('SELECT image_url FROM car_images WHERE car_id = ? ORDER BY id ASC', [result.insertId]);
    const validCarImages = carImages.map((item) => item.image_url).filter((image) => image && String(image).trim());

    res.status(201).json({
      id: String(car.id),
      make: car.make,
      model: car.model,
      year: car.year,
      pricePerDay: Number(car.pricePerDay),
      location: car.location,
      images: validCarImages.length > 0 ? validCarImages : [defaultImages[0]],
      rating: normalizeRating(car.rating),
      ownerId: String(car.owner_id),
      ownerName: car.owner_name,
      ownerEmail: car.owner_email,
      available: Boolean(car.available),
      category: car.category,
      seats: car.seats,
      transmission: car.transmission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/cars/:id/images', authMiddleware, async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès refusé." });
  }
  try {
    const { images = [] } = req.body;
    const carId = req.params.id;
    
    // Check ownership
    const [[car]] = await pool.execute('SELECT owner_id FROM cars WHERE id = ?', [carId]);
    if (!car) return res.status(404).json({ message: "Voiture introuvable." });
    if (String(car.owner_id) !== String(req.user.id) && req.user.role !== 'admin') {
       return res.status(403).json({ message: "Vous n'êtes pas propriétaire de ce véhicule." });
    }
    
    await pool.execute('DELETE FROM car_images WHERE car_id = ?', [carId]);
    const safeImages = Array.isArray(images) && images.length > 0 ? images.slice(0, 8) : [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg/800px-2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg"
    ];
    for (const image of safeImages) {
      if (image?.trim()) {
        await pool.execute('INSERT INTO car_images (car_id, image_url) VALUES (?, ?)', [carId, image.trim()]);
      }
    }
    res.json({ message: "Images mises à jour avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/reservations/mon-historique', authMiddleware, async (req, res) => {
  try {
    let query = `
      SELECT r.*, i.id AS invoice_id, i.invoice_number,
             CONCAT(c.make, ' ', c.model) AS car_name,
             owner.name AS owner_name,
             renter.name AS renter_name
      FROM reservations r
      JOIN cars c ON c.id = r.car_id
      JOIN users owner ON owner.id = c.owner_id
      JOIN users renter ON renter.id = r.renter_id
      LEFT JOIN invoices i ON i.reservation_id = r.id
      WHERE r.renter_id = ?
      ORDER BY r.created_at DESC
    `;

    if (req.user.role === 'owner') {
      query = `
        SELECT r.*, i.id AS invoice_id, i.invoice_number,
               CONCAT(c.make, ' ', c.model) AS car_name,
               owner.name AS owner_name,
               renter.name AS renter_name
        FROM reservations r
        JOIN cars c ON c.id = r.car_id
        JOIN users owner ON owner.id = c.owner_id
        JOIN users renter ON renter.id = r.renter_id
        LEFT JOIN invoices i ON i.reservation_id = r.id
        WHERE c.owner_id = ?
        ORDER BY r.created_at DESC
      `;
    }

    if (req.user.role === 'admin') {
      query = `
        SELECT r.*, i.id AS invoice_id, i.invoice_number,
               CONCAT(c.make, ' ', c.model) AS car_name,
               owner.name AS owner_name,
               renter.name AS renter_name
        FROM reservations r
        JOIN cars c ON c.id = r.car_id
        JOIN users owner ON owner.id = c.owner_id
        JOIN users renter ON renter.id = r.renter_id
        LEFT JOIN invoices i ON i.reservation_id = r.id
        ORDER BY r.created_at DESC
      `;
      const [rows] = await pool.execute(query);
      return res.json(rows.map(mapReservation));
    }

    const [rows] = await pool.execute(query, [req.user.id]);
    res.json(rows.map(mapReservation));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/reservations', authMiddleware, async (req, res) => {
  try {
    const { car_id, start_date, end_date, total_price, type = 'reservation', with_driver = false } = req.body;

    if (!['renter', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Seul un locataire peut effectuer cette action." });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Les dates de début et de fin sont requises." });
    }

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: "La date de début doit être antérieure ou égale à la date de fin." });
    }

    const [[car]] = await pool.execute(`
      SELECT c.*, owner.name AS owner_name, owner.email AS owner_email
      FROM cars c
      JOIN users owner ON owner.id = c.owner_id
      WHERE c.id = ?
    `, [car_id]);

    if (!car) {
      return res.status(404).json({ message: "Véhicule introuvable." });
    }

    if (await hasReservationConflict(car_id, start_date, end_date)) {
      return res.status(409).json({ message: "Ce véhicule n'est pas disponible sur les dates sélectionnées." });
    }

    const [result] = await pool.execute(
      `INSERT INTO reservations (car_id, renter_id, start_date, end_date, total_price, status, type, with_driver)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [car_id, req.user.id, start_date, end_date, total_price, type, Boolean(with_driver)]
    );

    const reservationId = result.insertId;

    const [[renter]] = await pool.execute('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
    const driverLabel = with_driver ? 'avec chauffeur' : 'sans chauffeur';
    const actionLabel = type === 'rental' ? 'location' : 'réservation';

    await createNotification(
      car.owner_id,
      `Nouvelle ${actionLabel}`,
      `${renter.name} a effectué une ${actionLabel} ${driverLabel} pour ${car.make} ${car.model}.`,
      type === 'rental' ? 'rental' : 'reservation'
    );
    await createNotification(
      renter.id,
      `Demande de ${actionLabel} envoyee`,
      `Votre demande ${driverLabel} pour ${car.make} ${car.model} a ete envoyee au proprietaire.`,
      'reservation'
    );

    const reservationRow = {
      id: reservationId,
      car_id,
      renter_id: renter.id,
      start_date,
      end_date,
      total_price,
      status: 'pending',
      type,
      with_driver: Boolean(with_driver),
      created_at: new Date(),
      invoice_id: null,
      invoice_number: null,
      car_name: `${car.make} ${car.model}`,
      owner_name: car.owner_name,
      renter_name: renter.name
    };

    res.status(201).json({
      message: `${type === 'rental' ? 'Location' : 'Réservation'} enregistrée.`,
      reservation: mapReservation(reservationRow)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/reservations/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const [[reservation]] = await pool.execute(`
      SELECT r.*, c.owner_id, CONCAT(c.make, ' ', c.model) AS car_name, renter.name AS renter_name, renter.id AS renter_db_id, renter.email AS renter_email, owner.name AS owner_name
      FROM reservations r
      JOIN cars c ON c.id = r.car_id
      JOIN users renter ON renter.id = r.renter_id
      JOIN users owner ON owner.id = c.owner_id
      WHERE r.id = ?
    `, [req.params.id]);

    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    if (req.user.role === 'owner' && Number(reservation.owner_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    if (reservation.status === status) {
      return res.json({ message: `Statut déjà défini sur ${status}` });
    }

    await pool.execute('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id]);

    let invoice = null;
    if (status === 'accepted') {
      const [invoiceRows] = await pool.execute(
        'SELECT id, invoice_number FROM invoices WHERE reservation_id = ? LIMIT 1',
        [req.params.id]
      );

      let invoiceId = invoiceRows[0]?.id || null;
      let invoiceNumber = invoiceRows[0]?.invoice_number || null;

      if (!invoiceId) {
        invoiceNumber = `FAC-${new Date().getFullYear()}-${String(req.params.id).padStart(5, '0')}`;
        const [invoiceResult] = await pool.execute(
          `INSERT INTO invoices (reservation_id, invoice_number, issued_to_user_id, issued_by_user_id, total_amount, type)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [req.params.id, invoiceNumber, reservation.renter_id, reservation.owner_id, reservation.total_price, reservation.type]
        );
        invoiceId = invoiceResult.insertId;
      }

      invoice = createInvoicePayload({
        id: reservation.id,
        car_id: reservation.car_id,
        renter_id: reservation.renter_id,
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        total_price: reservation.total_price,
        status,
        type: reservation.type,
        created_at: reservation.created_at,
        invoice_id: invoiceId,
        invoice_number: invoiceNumber,
        car_name: reservation.car_name,
        owner_name: reservation.owner_name,
        renter_name: reservation.renter_name
      }, { renterEmail: reservation.renter_email });

      await sendMail({
        to: reservation.renter_email,
        subject: `Facture ${invoice.invoiceNumber}`,
        text: `Bonjour ${reservation.renter_name}, votre facture ${invoice.invoiceNumber} pour ${reservation.car_name} est maintenant disponible.`,
        html: renderInvoiceHtml(invoice)
      });

      await createNotification(
        reservation.renter_db_id,
        'Facture disponible',
        `Votre facture ${invoice.invoiceNumber} a ete envoyee par email.`,
        'invoice'
      );
    }

    await createNotification(
      reservation.renter_db_id,
      'Mise à jour de votre demande',
      `Votre demande pour ${reservation.car_name} est maintenant "${status}".`,
      'reservation'
    );

    res.json({ message: `Statut mis à jour: ${status}`, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/invoices', authMiddleware, async (req, res) => {
  try {
    let query = `
      SELECT i.id AS invoice_id, i.invoice_number, i.total_amount, i.type, i.created_at,
             r.id, r.car_id, r.renter_id, r.start_date, r.end_date, r.total_price, r.status, r.type AS reservation_type, r.created_at AS reservation_created_at,
             CONCAT(c.make, ' ', c.model) AS car_name, owner.name AS owner_name, renter.name AS renter_name
      FROM invoices i
      JOIN reservations r ON r.id = i.reservation_id
      JOIN cars c ON c.id = r.car_id
      JOIN users owner ON owner.id = c.owner_id
      JOIN users renter ON renter.id = r.renter_id
      WHERE i.issued_to_user_id = ?
      ORDER BY i.created_at DESC
    `;

    if (req.user.role === 'owner') {
      query = `
        SELECT i.id AS invoice_id, i.invoice_number, i.total_amount, i.type, i.created_at,
               r.id, r.car_id, r.renter_id, r.start_date, r.end_date, r.total_price, r.status, r.type AS reservation_type, r.created_at AS reservation_created_at,
               CONCAT(c.make, ' ', c.model) AS car_name, owner.name AS owner_name, renter.name AS renter_name
        FROM invoices i
        JOIN reservations r ON r.id = i.reservation_id
        JOIN cars c ON c.id = r.car_id
        JOIN users owner ON owner.id = c.owner_id
        JOIN users renter ON renter.id = r.renter_id
        WHERE c.owner_id = ?
        ORDER BY i.created_at DESC
      `;
    }

    if (req.user.role === 'admin') {
      query = `
        SELECT i.id AS invoice_id, i.invoice_number, i.total_amount, i.type, i.created_at,
               r.id, r.car_id, r.renter_id, r.start_date, r.end_date, r.total_price, r.status, r.type AS reservation_type, r.created_at AS reservation_created_at,
               CONCAT(c.make, ' ', c.model) AS car_name, owner.name AS owner_name, renter.name AS renter_name
        FROM invoices i
        JOIN reservations r ON r.id = i.reservation_id
        JOIN cars c ON c.id = r.car_id
        JOIN users owner ON owner.id = c.owner_id
        JOIN users renter ON renter.id = r.renter_id
        ORDER BY i.created_at DESC
      `;
      const [rows] = await pool.execute(query);
      return res.json(rows.map((row) => createInvoicePayload({
        id: row.id,
        car_id: row.car_id,
        renter_id: row.renter_id,
        start_date: row.start_date,
        end_date: row.end_date,
        total_price: row.total_price,
        status: row.status,
        type: row.reservation_type,
        created_at: row.reservation_created_at,
        invoice_id: row.invoice_id,
        invoice_number: row.invoice_number,
        car_name: row.car_name,
        owner_name: row.owner_name,
        renter_name: row.renter_name
      })));
    }

    const [rows] = await pool.execute(query, [req.user.id]);
    res.json(rows.map((row) => createInvoicePayload({
      id: row.id,
      car_id: row.car_id,
      renter_id: row.renter_id,
      start_date: row.start_date,
      end_date: row.end_date,
      total_price: row.total_price,
      status: row.status,
      type: row.reservation_type,
      created_at: row.reservation_created_at,
      invoice_id: row.invoice_id,
      invoice_number: row.invoice_number,
      car_name: row.car_name,
      owner_name: row.owner_name,
      renter_name: row.renter_name
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const includeRead = String(req.query.includeRead || 'false').toLowerCase() === 'true';
    const [rows] = await pool.execute(
      `SELECT id, title, message, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
         AND (? = TRUE OR is_read = FALSE)
       ORDER BY created_at DESC`,
      [req.user.id, includeRead]
    );

    res.json(rows.map((item) => ({
      id: String(item.id),
      title: item.title,
      message: item.message,
      type: item.type,
      isRead: Boolean(item.is_read),
      createdAt: item.created_at
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: "Notification marquée comme lue." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/overview', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé." });
  }

  try {
    const [[usersCount]] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    const [[carsCount]] = await pool.execute('SELECT COUNT(*) AS total FROM cars');
    const [[reservationsCount]] = await pool.execute(`SELECT COUNT(*) AS total FROM reservations WHERE status IN ('pending', 'accepted')`);
    const [[revenue]] = await pool.execute('SELECT COALESCE(SUM(total_amount), 0) AS total FROM invoices');
    const [users] = await pool.execute('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    const [cars] = await pool.execute(`
      SELECT c.id, c.make, c.model, c.location, c.available, c.pricePerDay, u.name AS owner_name
      FROM cars c JOIN users u ON u.id = c.owner_id
      ORDER BY c.created_at DESC
    `);
    const [reservations] = await pool.execute(`
      SELECT r.id, r.type, r.status, r.start_date, r.end_date, r.total_price,
             CONCAT(c.make, ' ', c.model) AS car_name,
             owner.name AS owner_name,
             renter.name AS renter_name
      FROM reservations r
      JOIN cars c ON c.id = r.car_id
      JOIN users owner ON owner.id = c.owner_id
      JOIN users renter ON renter.id = r.renter_id
      ORDER BY r.created_at DESC
      LIMIT 20
    `);

    res.json({
      stats: {
        users: usersCount.total,
        cars: carsCount.total,
        activeReservations: reservationsCount.total,
        revenue: Number(revenue.total)
      },
      users: users.map((item) => ({ ...item, id: String(item.id) })),
      cars: cars.map((item) => ({ ...item, id: String(item.id), pricePerDay: Number(item.pricePerDay), available: Boolean(item.available) })),
      reservations: reservations.map((item) => ({ ...item, id: String(item.id), total_price: Number(item.total_price) }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a review for a completed rental
app.post('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const { reservation_id, rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "La note doit être entre 1 et 5." });
    }

    // Verify the user is the renter of this reservation
    const [[reservation]] = await pool.execute(
      'SELECT * FROM reservations WHERE id = ? AND renter_id = ?',
      [reservation_id, req.user.id]
    );

    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable ou vous n'êtes pas autorisé à noter cette réservation." });
    }

    // Only allow reviews for completed rentals
    if (reservation.status !== 'completed') {
      return res.status(400).json({ message: "Vous ne pouvez noter que les locations terminées." });
    }

    // Check if user already reviewed this reservation
    const [[existingReview]] = await pool.execute(
      'SELECT id FROM reviews WHERE reservation_id = ? AND reviewer_id = ?',
      [reservation_id, req.user.id]
    );

    if (existingReview) {
      return res.status(409).json({ message: "Vous avez déjà noté cette location." });
    }

    // Get reviewer name
    const [[reviewer]] = await pool.execute(
      'SELECT name FROM users WHERE id = ?',
      [req.user.id]
    );

    // Insert the review
    await pool.execute(
      'INSERT INTO reviews (reservation_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [reservation_id, req.user.id, rating, comment || null]
    );

    // Update car's average rating
    const [[avgRating]] = await pool.execute(
      'SELECT AVG(rating) AS avg_rating FROM reviews WHERE reservation_id IN (SELECT id FROM reservations WHERE car_id = ?)',
      [reservation.car_id]
    );

    if (avgRating.avg_rating) {
      await pool.execute(
        'UPDATE cars SET rating = ? WHERE id = ?',
        [parseFloat(avgRating.avg_rating), reservation.car_id]
      );
    }

    // Notify car owner with detailed information
    const [[carInfo]] = await pool.execute(
      `SELECT c.owner_id, CONCAT(c.make, ' ', c.model) AS car_name 
       FROM cars c WHERE c.id = ?`,
      [reservation.car_id]
    );
    
    if (carInfo) {
      await createNotification(
        carInfo.owner_id,
        `Nouvel avis ${'⭐'.repeat(rating)} pour ${carInfo.car_name}`,
        `${reviewer?.name || 'Un locataire'} a laissé un avis de ${rating}/5 avec le commentaire: "${comment || 'Sans commentaire'}".`,
        'info'
      );
    }

    res.status(201).json({ message: "Avis soumis avec succès.", rating, comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews for a specific car
app.get('/api/cars/:id/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.execute(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS reviewer_name
       FROM reviews r
       JOIN reservations res ON res.id = r.reservation_id
       JOIN users u ON u.id = r.reviewer_id
       WHERE res.car_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json(reviews.map(review => ({
      id: String(review.id),
      rating: review.rating,
      comment: review.comment,
      reviewerName: review.reviewer_name,
      createdAt: review.created_at
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for the authenticated user (as reviewer)
app.get('/api/reviews/my-reviews', authMiddleware, async (req, res) => {
  try {
    const [reviews] = await pool.execute(
      `SELECT r.id, r.rating, r.comment, r.created_at, 
              CONCAT(c.make, ' ', c.model) AS car_name,
              res.id AS reservation_id
       FROM reviews r
       JOIN reservations res ON res.id = r.reservation_id
       JOIN cars c ON c.id = res.car_id
       WHERE r.reviewer_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json(reviews.map(review => ({
      id: String(review.id),
      rating: review.rating,
      comment: review.comment,
      carName: review.car_name,
      reservationId: String(review.reservation_id),
      createdAt: review.created_at
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all comments for a specific car
app.get('/api/cars/:id/comments', async (req, res) => {
  try {
    const [comments] = await pool.execute(
      `SELECT c.id, c.comment, c.created_at, u.name AS user_name, u.role AS user_role
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.car_id = ?
       ORDER BY c.created_at DESC`,
      [req.params.id]
    );

    res.json(comments.map(c => ({
      id: String(c.id),
      comment: c.comment,
      userName: c.user_name,
      userRole: c.user_role,
      createdAt: c.created_at
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a comment for a car
app.post('/api/cars/:id/comments', authMiddleware, async (req, res) => {
  try {
    const carId = req.params.id;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: "Le commentaire ne peut pas être vide." });
    }

    // Verify car
    const [[carInfo]] = await pool.execute(
      `SELECT c.owner_id, CONCAT(c.make, ' ', c.model) AS car_name 
       FROM cars c WHERE c.id = ?`,
      [carId]
    );

    if (!carInfo) {
      return res.status(404).json({ message: "Véhicule introuvable." });
    }

    // Insert comment
    const [result] = await pool.execute(
      'INSERT INTO comments (car_id, user_id, comment) VALUES (?, ?, ?)',
      [carId, userId, comment.trim()]
    );

    // Get user details for response
    const [[user]] = await pool.execute('SELECT name, role FROM users WHERE id = ?', [userId]);

    // Notify car owner
    if (String(carInfo.owner_id) !== String(userId)) {
      await createNotification(
        carInfo.owner_id,
        `Nouveau commentaire sur ${carInfo.car_name}`,
        `${user.name} a laissé un commentaire sur votre voiture : "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        'info'
      );
    }

    res.status(201).json({
      id: String(result.insertId),
      comment: comment.trim(),
      userName: user.name,
      userRole: user.role,
      createdAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

bootstrapDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[+] Serveur LocAutoCM démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erreur de démarrage du serveur:", error);
    process.exit(1);
  });
