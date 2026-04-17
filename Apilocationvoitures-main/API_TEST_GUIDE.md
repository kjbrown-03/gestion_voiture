# Guide de Test API - LocAutoCM

## Base URL

`http://localhost:5000/api`

## Sommaire

1. Authentification
2. Voitures et disponibilite
3. Reservations et locations
4. Avis et commentaires
5. Notifications
6. Factures
7. Admin
8. Comptes de test
9. Notes Render gratuit

---

## 1. Authentification

### 1.1 Inscription

**Endpoint:** `POST /api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+237690000001",
  "password": "password123",
  "role": "renter"
}
```

Champs:
- `name` requis
- `email` requis et unique
- `phone` requis
- `password` requis
- `role` optionnel: `renter`, `owner`, `admin`

### 1.2 Connexion

**Endpoint:** `POST /api/auth/login`

```json
{
  "email": "admin@gmail.com",
  "password": "admin"
}
```

Reponse importante:
- retourne `token`
- utiliser ensuite `Authorization: Bearer {token}`

### 1.3 Profil connecte

**Endpoint:** `GET /api/users/profile`

Auth requise.

### 1.4 Mot de passe oublie - envoyer code

**Endpoint:** `POST /api/auth/forgot-password/send-code`

```json
{
  "email": "john@example.com"
}
```

### 1.5 Mot de passe oublie - verifier code

**Endpoint:** `POST /api/auth/forgot-password/verify-code`

```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

### 1.6 Mot de passe oublie - changer mot de passe

**Endpoint:** `POST /api/auth/forgot-password/change-password`

```json
{
  "resetToken": "votre-reset-token",
  "newPassword": "nouveau-mot-de-passe"
}
```

### 1.7 Google

Le bouton Google a ete ajoute dans l'interface `Connexion` et `Inscription`, mais aucun endpoint OAuth Google n'est encore implemente dans l'API actuelle.

---

## 2. Voitures et disponibilite

### 2.1 Lister toutes les voitures

**Endpoint:** `GET /api/cars`

Public.

Notes:
- la reponse inclut `available`
- la reponse inclut aussi `unavailablePeriods`
- `available` indique surtout la disponibilite actuelle
- les dates deja prises servent a griser le calendrier dans la page detail

### 2.2 Voir une voiture

**Endpoint:** `GET /api/cars/:id`

Exemple:
- `GET /api/cars/1`

### 2.3 Voir la disponibilite d'une voiture

**Endpoint:** `GET /api/cars/:id/availability`

Exemple:
- `GET /api/cars/1/availability`

Exemple de reponse:

```json
{
  "carId": "1",
  "available": true,
  "unavailablePeriods": [
    {
      "from": "2026-04-20",
      "to": "2026-04-25"
    },
    {
      "from": "2026-05-02",
      "to": "2026-05-04"
    }
  ]
}
```

Important:
- ces periodes sont les dates a griser dans le calendrier
- une reservation en conflit sur ces dates doit etre refusee

### 2.4 Ajouter une voiture

**Endpoint:** `POST /api/cars`

Auth requise: `owner` ou `admin`

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
    "https://example.com/1.jpg",
    "https://example.com/2.jpg"
  ]
}
```

### 2.5 Mettre a jour les images d'une voiture

**Endpoint:** `PUT /api/cars/:id/images`

Auth requise.

```json
{
  "images": [
    "https://example.com/1.jpg",
    "https://example.com/2.jpg"
  ]
}
```

### 2.6 Voir les avis d'une voiture

**Endpoint:** `GET /api/cars/:id/reviews`

Public.

### 2.7 Voir les commentaires d'une voiture

**Endpoint:** `GET /api/cars/:id/comments`

Public.

### 2.8 Ajouter un commentaire sur une voiture

**Endpoint:** `POST /api/cars/:id/comments`

Auth requise.

```json
{
  "comment": "Vehicule propre et tres pratique."
}
```

---

## 3. Reservations et locations

### 3.1 Voir mon historique

**Endpoint:** `GET /api/reservations/mon-historique`

Auth requise.

Comportement:
- `renter`: ses reservations
- `owner`: reservations de ses vehicules
- `admin`: toutes les reservations

### 3.2 Creer une reservation ou location

**Endpoint:** `POST /api/reservations`

Auth requise: `renter` ou `admin`

```json
{
  "car_id": 1,
  "start_date": "2026-04-20",
  "end_date": "2026-04-25",
  "total_price": 183750,
  "type": "rental",
  "with_driver": true
}
```

Champs:
- `car_id` requis
- `start_date` requis
- `end_date` requis
- `total_price` requis
- `type` requis: `reservation` ou `rental`
- `with_driver` requis cote front, bool: `true` ou `false`

Regles importantes:
- le vehicule peut etre loue avec ou sans chauffeur
- l'API refuse une reservation si les dates chevauchent une periode deja prise
- en cas de conflit, l'API renvoie une erreur `409`

### 3.3 Modifier le statut d'une reservation

**Endpoint:** `PUT /api/reservations/:id/status`

Auth requise: `owner` ou `admin`

```json
{
  "status": "accepted"
}
```

Valeurs possibles:
- `pending`
- `accepted`
- `rejected`
- `completed`
- `cancelled`

---

## 4. Avis et commentaires

### 4.1 Soumettre un avis

**Endpoint:** `POST /api/reviews`

Auth requise.

```json
{
  "reservation_id": 1,
  "rating": 5,
  "comment": "Excellente voiture, tres propre et confortable."
}
```

Conditions:
- la reservation doit appartenir a l'utilisateur connecte
- le statut doit etre `completed`
- un seul avis par reservation

### 4.2 Voir mes avis

**Endpoint:** `GET /api/reviews/my-reviews`

Auth requise.

---

## 5. Notifications

### 5.1 Voir mes notifications actives

**Endpoint:** `GET /api/notifications`

Auth requise.

Important:
- par defaut, seules les notifications non lues sont retournees
- quand une notification est traitee et marquee comme lue, elle disparait de la liste active

### 5.2 Voir toutes mes notifications, y compris lues

**Endpoint:** `GET /api/notifications?includeRead=true`

Auth requise.

### 5.3 Marquer une notification comme lue

**Endpoint:** `PUT /api/notifications/:id/read`

Auth requise.

Pas de body requis.

---

## 6. Factures

### 6.1 Voir mes factures

**Endpoint:** `GET /api/invoices`

Auth requise.

---

## 7. Admin

### 7.1 Vue globale admin

**Endpoint:** `GET /api/admin/overview`

Auth requise: `admin`

---

## 8. Comptes de test

### Admin

```json
{
  "email": "admin@gmail.com",
  "password": "admin"
}
```

### Owner 1

```json
{
  "email": "jean@owner.com",
  "password": "123456"
}
```

### Owner 2

```json
{
  "email": "marie@owner.com",
  "password": "123456"
}
```

### Renter

```json
{
  "email": "paul@renter.com",
  "password": "123456"
}
```

---

## 9. Workflow conseille pour tester la disponibilite

### Etape 1

Se connecter comme renter:

`POST /api/auth/login`

### Etape 2

Verifier la disponibilite de la voiture:

`GET /api/cars/1/availability`

### Etape 3

Creer une premiere location:

```json
POST /api/reservations
{
  "car_id": 1,
  "start_date": "2026-04-20",
  "end_date": "2026-04-25",
  "total_price": 183750,
  "type": "rental",
  "with_driver": false
}
```

### Etape 4

Reverifier:

`GET /api/cars/1/availability`

Les dates `2026-04-20` a `2026-04-25` doivent maintenant apparaitre dans `unavailablePeriods`.

### Etape 5

Tenter une reservation en conflit:

```json
POST /api/reservations
{
  "car_id": 1,
  "start_date": "2026-04-22",
  "end_date": "2026-04-24",
  "total_price": 110250,
  "type": "reservation",
  "with_driver": true
}
```

Resultat attendu:
- erreur `409`
- message indiquant que le vehicule n'est pas disponible sur les dates selectionnees

### Etape 6

Verifier les notifications owner:

`GET /api/notifications`

### Etape 7

Marquer une notification comme lue:

`PUT /api/notifications/:id/read`

Resultat attendu:
- elle disparait de la liste active

---

## 10. Notes Render gratuit

Pour deployer gratuitement sur Render, il te faut au minimum:
- un repo GitHub avec le projet
- un service web Render pour le backend Node
- un site statique Render pour le frontend Vite, ou un second service web si tu sers tout ensemble
- une base de donnees externe accessible depuis Render
- les variables d'environnement du backend

Variables minimales cote backend:
- `PORT`
- `JWT_SECRET`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`

Attention:
- le service web gratuit Render se met en veille apres inactivite
- les services web gratuits ne supportent pas l'envoi SMTP sortant sur les ports `25`, `465` et `587`
- pour ce projet, l'email Gmail via `nodemailer` risque donc d'etre bloque en gratuit si tu l'envoies directement depuis Render
- il vaut mieux utiliser un fournisseur email HTTP API compatible Render, ou desactiver temporairement l'envoi d'emails en production gratuite

Sources officielles Render:
- https://render.com/docs/free
- https://render.com/docs/web-services
