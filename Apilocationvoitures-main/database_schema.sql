-- Création de la base de données
CREATE DATABASE IF NOT EXISTS locautocm_db;
USE locautocm_db;

-- 1. Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('renter', 'owner', 'admin') DEFAULT 'renter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des véhicules
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    pricePerDay DECIMAL(10, 2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    seats INT NOT NULL,
    transmission ENUM('Automatique', 'Manuelle') NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    rating FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Table des images de voitures
CREATE TABLE IF NOT EXISTS car_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    image_url TEXT NOT NULL,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- 4. Table des réservations (contrats de location)
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    renter_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Table des avis (notations propriétaires et véhicules)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertion de données de test (optionnel)
INSERT INTO users (name, email, phone, password, role) VALUES 
('JB Admin', 'admin@locautocm.com', '+237600000000', '$2b$10$XxxHashExempleXxx', 'admin'),
('Proprio Test', 'proprio@locautocm.com', '+237611111111', '$2b$10$XxxHashExempleXxx', 'owner'),
('Locataire Test', 'locataire@locautocm.com', '+237622222222', '$2b$10$XxxHashExempleXxx', 'renter');
