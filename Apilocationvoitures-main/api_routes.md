# Spécification de l'API REST - LocAutoCM

> Stack imposée : **NodeJS + Express + MySQL**
> Authentification : **Token (JWT - JSON Web Token)**

Voici la liste des 12 endpoints (routes) API obligatoires que le backend implémente pour faire fonctionner la plateforme LocAutoCM.

---

## 1. Authentification & Utilisateurs (Users)

| Méthode | Route | Description | Accès |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Créer un nouveau compte utilisateur (Locataire ou Propriétaire). | Public |
| **POST** | `/api/auth/login` | Authentifier un utilisateur et retourner un Token JWT. | Public |
| **GET** | `/api/users/profile` | Récupérer les informations du profil de l'utilisateur connecté. | Protégé (Token) |

---

## 2. Gestion des Véhicules (Cars)

| Méthode | Route | Description | Accès |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/cars` | Récupérer la liste de tous les véhicules (avec filtres : ville, dates). | Public |
| **GET** | `/api/cars/:id` | Récupérer les détails d'un véhicule spécifique par son ID. | Public |
| **POST** | `/api/cars` | Ajouter un nouveau véhicule (réservé aux Propriétaires). | Protégé (Propriétaire) |
| **PUT** | `/api/cars/:id` | Mettre à jour les informations d'un véhicule (prix, disponibilité). | Protégé (Propriétaire) |
| **DELETE** | `/api/cars/:id` | Supprimer un véhicule du système. | Protégé (Propriétaire/Admin) |

---

## 3. Réservations et Contrats (Reservations)

| Méthode | Route | Description | Accès |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/reservations` | Créer une nouvelle demande de réservation (génère un contrat). | Protégé (Locataire) |
| **GET** | `/api/reservations/mon-historique` | Liste des réservations de l'utilisateur (Locataire ou Propriétaire). | Protégé (Token) |
| **PUT** | `/api/reservations/:id/status` | Accepter, Refuser ou Annuler une réservation. | Protégé (Propriétaire/Locataire) |

---

## 4. Avis et Notations (Reviews)

| Méthode | Route | Description | Accès |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/reviews` | Ajouter un avis et une note (1 à 5) à la fin d'une location. | Protégé (Locataire) |

---

## Concept Clé : Middleware d'Authentification (Express)
Le backend utilisera un middleware sur les routes protégées pour vérifier le Token.
```javascript
// Exemple conceptuel de middleware
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "Un token est requis pour l'authentification" });
    
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ message: "Token Invalide" });
    }
    return next();
};
```
