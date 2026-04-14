/**
 * API SERVER - LOCAUTOCM
 * Technologies: Node.js, Express.js, MySQL, JSON Web Tokens (JWT)
 * Membres du groupe: JB, Keira, Kim, Grace
 */

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
const SECRET_KEY = "SUPER_SECRET_LOCAUTO_KEY";

// Configuration Base de Données MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'k@ldjob20065',
    database: 'locautocm_db'
};

// Middleware de vérification du Token
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "Token requis." });

    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY); // Format: "Bearer TOKEN"
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token ou Session Invalide" });
    }
};

/* =================================================================
 * 1. UTILISATEURS & AUTHENTIFICATION
 * ================================================================= */

// [1] REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, hashedPassword, role || 'renter']
        );
        res.status(201).json({ message: "Utilisateur créé avec succès", userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [2] LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ message: "Connexion réussie", token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [3] PROFIL UTILISATEUR
app.get('/api/users/profile', authMiddleware, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT id, name, email, phone, role FROM users WHERE id = ?', [req.user.id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/* =================================================================
 * 2. VÉHICULES (CARS)
 * ================================================================= */

// [4] OBTENIR TOUTES LES VOITURES
app.get('/api/cars', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM cars WHERE available = true');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [5] OBTENIR UNE VOITURE PAR ID
app.get('/api/cars/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM cars WHERE id = ?', [req.params.id]);
        if(rows.length === 0) return res.status(404).json({ message: "Véhicule introuvable" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [6] AJOUTER UNE VOITURE (Propriétaire uniquement)
app.post('/api/cars', authMiddleware, async (req, res) => {
    if (req.user.role !== 'owner' && req.user.role !== 'admin') return res.status(403).json({ message: "Accès refusé" });
    
    try {
        const { make, model, year, pricePerDay, location, category, seats, transmission } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'INSERT INTO cars (owner_id, make, model, year, pricePerDay, location, category, seats, transmission) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, make, model, year, pricePerDay, location, category, seats, transmission]
        );
        res.status(201).json({ message: "Véhicule ajouté", carId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [7] MODIFIER UNE VOITURE
app.put('/api/cars/:id', authMiddleware, async (req, res) => {
    try {
        const { pricePerDay, available } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE cars SET pricePerDay = ?, available = ? WHERE id = ? AND owner_id = ?', 
            [pricePerDay, available, req.params.id, req.user.id]);
        res.json({ message: "Véhicule mis à jour" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [8] SUPPRIMER UNE VOITURE
app.delete('/api/cars/:id', authMiddleware, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM cars WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Véhicule supprimé" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/* =================================================================
 * 3. RÉSERVATIONS / CONTRATS
 * ================================================================= */

// [9] CRÉER UNE RÉSERVATION (Contrat de location partiel)
app.post('/api/reservations', authMiddleware, async (req, res) => {
    try {
        const { car_id, start_date, end_date, total_price } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        // Bloquer la voiture temporairement
        await connection.execute('UPDATE cars SET available = false WHERE id = ?', [car_id]);
        
        const [result] = await connection.execute(
            'INSERT INTO reservations (car_id, renter_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?)',
            [car_id, req.user.id, start_date, end_date, total_price]
        );
        res.status(201).json({ message: "Demande de réservation envoyée", reservationId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [10] MES RÉSERVATIONS (Historique)
app.get('/api/reservations/mon-historique', authMiddleware, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        let query = 'SELECT * FROM reservations WHERE renter_id = ?';
        if (req.user.role === 'owner') {
            query = `SELECT r.* FROM reservations r JOIN cars c ON r.car_id = c.id WHERE c.owner_id = ?`;
        }
        const [rows] = await connection.execute(query, [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [11] CHANGER LE STATUT D'UNE RÉSERVATION
app.put('/api/reservations/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body; // 'accepted', 'rejected', 'cancelled'
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id]);
        
        // Si annulé ou rejeté, rendre la voiture disponible
        if (status === 'rejected' || status === 'cancelled') {
            await connection.execute('UPDATE cars SET available = true WHERE id = (SELECT car_id FROM reservations WHERE id = ?)', [req.params.id]);
        }
        
        res.json({ message: `Réservation mise à jour au statut: ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/* =================================================================
 * 4. AVIS & NOTATIONS
 * ================================================================= */

// [12] AJOUTER UN AVIS DE FIN DE LOCATION
app.post('/api/reviews', authMiddleware, async (req, res) => {
    try {
        const { reservation_id, rating, comment } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO reviews (reservation_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
            [reservation_id, req.user.id, rating, comment]
        );
        // On pourrait ajouter logiquement une mise a jour de la moyenne du car.rating ici
        res.status(201).json({ message: "Avis soumis avec succès !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lancement du Serveur
app.listen(PORT, () => {
    console.log(`[+] Serveur LocAutoCM démarré sur http://localhost:${PORT}`);
    console.log(`[i] Base de données configurée sur mysql://root:@localhost/locautocm_db`);
});
