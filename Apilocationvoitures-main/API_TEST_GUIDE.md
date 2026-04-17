# 📋 Guide de Test API - LocAutoCM

## 🔐 Comment utiliser ce guide avec Postman

1. Importer le fichier `Postman_Collection.json` dans Postman
2. Le token sera automatiquement sauvegardé après le login
3. Chaque requête indique le body raw nécessaire

---

## 📚 TABLE DES MATIÈRES

1. [Authentification](#1-authentification)
2. [Voitures](#2-voitures)
3. [Réservations](#3-réservations)
4. [Notation/Avis](#4-notationavis)
5. [Factures](#5-factures)
6. [Notifications](#6-notifications)
7. [Admin](#7-admin)
8. [Comptes de Test](#8-comptes-de-test)

---

## 1. AUTHENTIFICATION

### 1.1 Register (Inscription)
**Endpoint:** `POST /api/auth/register`

**Body Raw (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+237690000001",
  "password": "password123",
  "role": "renter"
}
```

**Paramètres:**
- `name` (string, requis): Nom complet
- `email` (string, requis): Email unique
- `phone` (string, requis): Numéro de téléphone
- `password` (string, requis): Mot de passe (min 6 caractères)
- `role` (string, optionnel): "renter", "owner", ou "admin" (par défaut: "renter")

---

### 1.2 Login (Connexion)
**Endpoint:** `POST /api/auth/login`

**Body Raw (JSON):**
```json
{
  "email": "admin@gmail.com",
  "password": "admin"
}
```

**Paramètres:**
- `email` (string, requis): Email du compte
- `password` (string, requis): Mot de passe

**Réponse importante:** Retourne un `token` JWT à utiliser dans les requêtes authentifiées

**Header pour les requêtes suivantes:**
```
Authorization: Bearer {votre_token}
```

---

### 1.3 Forgot Password - Send Code
**Endpoint:** `POST /api/auth/forgot-password/send-code`

**Body Raw (JSON):**
```json
{
  "email": "john@example.com"
}
```

**Paramètres:**
- `email` (string, requis): Email du compte

---

### 1.4 Forgot Password - Verify Code
**Endpoint:** `POST /api/auth/forgot-password/verify-code`

**Body Raw (JSON):**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Paramètres:**
- `email` (string, requis): Email du compte
- `code` (string, requis): Code à 6 chiffres reçu par email

**Réponse:** Retourne un `resetToken`

---

### 1.5 Forgot Password - Change Password
**Endpoint:** `POST /api/auth/forgot-password/change-password`

**Body Raw (JSON):**
```json
{
  "resetToken": "votre-reset-token-ici",
  "newPassword": "nouveau_mot_de_passe123"
}
```

**Paramètres:**
- `resetToken` (string, requis): Token obtenu après vérification du code
- `newPassword` (string, requis): Nouveau mot de passe

---

### 1.6 Get Profile
**Endpoint:** `GET /api/users/profile`

**Authentification:** Requise (Bearer Token)

**Body:** Aucun (GET request)

---

## 2. VOITURES

### 2.1 Get All Cars (Lister toutes les voitures)
**Endpoint:** `GET /api/cars`

**Authentification:** Non requise

**Body:** Aucun (GET request)

---

### 2.2 Get Car by ID
**Endpoint:** `GET /api/cars/1`

**Authentification:** Non requise

**Body:** Aucun (GET request)

**Note:** Remplacer `1` par l'ID de la voiture souhaitée

---

### 2.3 Create Car (Ajouter une voiture)
**Endpoint:** `POST /api/cars`

**Authentification:** Requise (owner ou admin uniquement)

**Body Raw (JSON):**
```json
{
  "make": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "pricePerDay": 25000,
  "location": "Douala",
  "category": "Berline",
  "seats": 5,
  "transmission": "Automatique",
  "images": [
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf"
  ]
}
```

**Paramètres:**
- `make` (string, requis): Marque (ex: Toyota, Peugeot)
- `model` (string, requis): Modèle (ex: Corolla, 208)
- `year` (number, requis): Année de fabrication
- `pricePerDay` (number, requis): Prix par jour en FCFA
- `location` (string, requis): Ville (ex: Douala, Yaounde)
- `category` (string, requis): Catégorie (SUV, Berline, Citadine, 4x4, Utilitaire)
- `seats` (number, requis): Nombre de places
- `transmission` (string, requis): "Automatique" ou "Manuelle"
- `images` (array, optionnel): URLs des images (max 8)

---

### 2.4 Get Car Reviews (Voir les avis d'une voiture)
**Endpoint:** `GET /api/cars/1/reviews`

**Authentification:** Non requise

**Body:** Aucun (GET request)

**Réponse:** Liste des avis avec note, commentaire, nom du locataire

---

## 3. RÉSERVATIONS

### 3.1 Get My Reservations (Historique)
**Endpoint:** `GET /api/reservations/mon-historique`

**Authentification:** Requise

**Body:** Aucun (GET request)

**Note:** 
- Renter: voit ses propres réservations
- Owner: voit les réservations de ses voitures
- Admin: voit toutes les réservations

---

### 3.2 Create Reservation (Créer une réservation)
**Endpoint:** `POST /api/reservations`

**Authentification:** Requise (renter uniquement)

**Body Raw (JSON):**
```json
{
  "car_id": 1,
  "start_date": "2026-04-20",
  "end_date": "2026-04-25",
  "total_price": 175000,
  "type": "reservation"
}
```

**Paramètres:**
- `car_id` (number, requis): ID de la voiture
- `start_date` (string, requis): Date de début (format: YYYY-MM-DD)
- `end_date` (string, requis): Date de fin (format: YYYY-MM-DD)
- `total_price` (number, requis): Prix total (pricePerDay × nombre de jours)
- `type` (string, requis): "reservation" ou "rental"

**Calcul du prix:**
```
total_price = pricePerDay × nombre_de_jours
Exemple: 35000 × 5 jours = 175000 FCFA
```

---

### 3.3 Update Reservation Status (Modifier le statut)
**Endpoint:** `PUT /api/reservations/1/status`

**Authentification:** Requise (owner uniquement)

**Body Raw (JSON):**
```json
{
  "status": "accepted"
}
```

**Paramètres:**
- `status` (string, requis): L'un des suivants:
  - `"pending"`: En attente
  - `"accepted"`: Acceptée
  - `"rejected"`: Refusée
  - `"completed"`: Terminée
  - `"cancelled"`: Annulée

**Note:** Remplacer `1` par l'ID de la réservation

---

## 4. NOTATION/AVIS

### 4.1 Submit Review (Soumettre un avis) ⭐
**Endpoint:** `POST /api/reviews`

**Authentification:** Requise (renter uniquement)

**Body Raw (JSON):**
```json
{
  "reservation_id": 1,
  "rating": 5,
  "comment": "Excellente voiture, très propre et confortable!"
}
```

**Paramètres:**
- `reservation_id` (number, requis): ID de la réservation
- `rating` (number, requis): Note de 1 à 5 étoiles
- `comment` (string, optionnel): Commentaire détaillé

**⚠️ CONDITIONS IMPORTANTES:**
1. La réservation doit appartenir à l'utilisateur connecté
2. Le statut de la réservation doit être `"completed"`
3. L'utilisateur ne peut noter qu'**UNE SEULE FOIS** par réservation
4. Seul un locataire (renter) peut laisser un avis

**Workflow pour tester:**
1. Créer une réservation (statut: pending)
2. Owner accepte la réservation (statut: accepted)
3. Owner complète la réservation (statut: completed)
4. Renter peut maintenant laisser un avis

---

### 4.2 Get My Reviews (Mes avis)
**Endpoint:** `GET /api/reviews/my-reviews`

**Authentification:** Requise

**Body:** Aucun (GET request)

**Réponse:** Liste de tous les avis donnés par l'utilisateur

---

## 5. FACTURES

### 5.1 Get My Invoices
**Endpoint:** `GET /api/invoices`

**Authentification:** Requise

**Body:** Aucun (GET request)

**Note:** 
- Renter: voit ses propres factures
- Owner: voit les factures de ses voitures
- Admin: voit toutes les factures

---

## 6. NOTIFICATIONS

### 6.1 Get My Notifications
**Endpoint:** `GET /api/notifications`

**Authentification:** Requise

**Body:** Aucun (GET request)

---

### 6.2 Mark Notification as Read
**Endpoint:** `PUT /api/notifications/1/read`

**Authentification:** Requise

**Body:** Aucun (PUT request sans body)

**Note:** Remplacer `1` par l'ID de la notification

---

## 7. ADMIN

### 7.1 Get Admin Overview
**Endpoint:** `GET /api/admin/overview`

**Authentification:** Requise (admin uniquement)

**Body:** Aucun (GET request)

**Réponse:** Statistiques complètes:
- Nombre d'utilisateurs
- Nombre de voitures
- Réservations actives
- Revenus totaux
- Liste des utilisateurs, voitures et réservations

---

## 8. COMPTES DE TEST

### Comptes disponibles après le démarrage du serveur:

#### 📌 Admin
```json
{
  "email": "admin@gmail.com",
  "password": "admin"
}
```
**Permissions:** Accès complet, gestion de tout le système

---

#### 📌 Owner 1 (Jean Proprio)
```json
{
  "email": "jean@owner.com",
  "password": "123456"
}
```
**Permissions:** Gérer ses voitures et ses réservations

---

#### 📌 Owner 2 (Marie Proprio)
```json
{
  "email": "marie@owner.com",
  "password": "123456"
}
```
**Permissions:** Gérer ses voitures et ses réservations

---

#### 📌 Renter (Paul Locataire)
```json
{
  "email": "paul@renter.com",
  "password": "123456"
}
```
**Permissions:** Réserver des voitures et laisser des avis

---

## 🔄 SCÉNARIO COMPLET DE TEST

### Tester le système de notation étape par étape:

#### Étape 1: Se connecter comme Renter
```
POST /api/auth/login
Body:
{
  "email": "paul@renter.com",
  "password": "123456"
}
```
→ Copier le token reçu

#### Étape 2: Créer une réservation
```
POST /api/reservations
Header: Authorization: Bearer {token}
Body:
{
  "car_id": 1,
  "start_date": "2026-04-20",
  "end_date": "2026-04-25",
  "total_price": 175000,
  "type": "rental"
}
```
→ Noter l'ID de la réservation (ex: 1)

#### Étape 3: Se connecter comme Owner
```
POST /api/auth/login
Body:
{
  "email": "jean@owner.com",
  "password": "123456"
}
```
→ Copier le nouveau token

#### Étape 4: Accepter la réservation
```
PUT /api/reservations/1/status
Header: Authorization: Bearer {token}
Body:
{
  "status": "accepted"
}
```

#### Étape 5: Compléter la réservation
```
PUT /api/reservations/1/status
Header: Authorization: Bearer {token}
Body:
{
  "status": "completed"
}
```

#### Étape 6: Se reconnecter comme Renter
```
POST /api/auth/login
Body:
{
  "email": "paul@renter.com",
  "password": "123456"
}
```
→ Copier le token

#### Étape 7: Soumettre un avis ⭐
```
POST /api/reviews
Header: Authorization: Bearer {token}
Body:
{
  "reservation_id": 1,
  "rating": 5,
  "comment": "Très satisfait! Voiture propre et confortable."
}
```

#### Étape 8: Voir les avis de la voiture
```
GET /api/cars/1/reviews
```
→ L'avis apparaît avec la note et le commentaire

---

## ❌ CODES D'ERREUR COURANTS

| Code | Signification | Solution |
|------|---------------|----------|
| 400 | Requête invalide | Vérifier le format des données |
| 401 | Token invalide | Se reconnecter pour obtenir un nouveau token |
| 403 | Accès refusé | Vérifier les permissions (role) |
| 404 | Ressource introuvable | Vérifier l'ID dans l'URL |
| 409 | Conflit (déjà noté) | Cette réservation a déjà été notée |
| 500 | Erreur serveur | Vérifier les logs du serveur |

---

## 💡 ASTUCES POSTMAN

1. **Variables d'environnement:**
   - Créer une variable `base_url` = `http://localhost:5000/api`
   - Créer une variable `token` qui sera mise à jour automatiquement

2. **Auto-save du token:**
   - La collection inclut un script qui sauvegarde automatiquement le token après le login

3. **Headers automatiques:**
   - Les requêtes authentifiées utilisent déjà `{{token}}` dans le header Authorization

4. **Test rapide:**
   - Utiliser le folder "📋 TEST SCENARIOS" pour un workflow complet pré-configuré

---

## 🚀 DÉMARRAGE RAPIDE

1. **Lancer le serveur:**
```bash
node api_server.js
```

2. **Importer la collection Postman:**
   - Ouvrir Postman
   - Click sur Import
   - Sélectionner `Postman_Collection.json`

3. **Tester le login:**
   - Exécuter la requête "Login"
   - Le token est sauvegardé automatiquement

4. **Commencer à tester:**
   - Suivre les scénarios ou tester chaque endpoint individuellement

---

## 📞 SUPPORT

Pour toute question ou problème:
- Vérifier que le serveur est lancé sur `http://localhost:5000`
- Vérifier que la base de données MySQL est configurée dans `.env`
- Consulter les logs du serveur pour les erreurs détaillées
