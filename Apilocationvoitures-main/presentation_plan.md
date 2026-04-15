# Presentation Postman - LocAutoCM

## Membres du groupe

- JB : chef du groupe
- Keira
- Kim
- Grace

## Objectif de la presentation

Pendant la presentation, nous montrons seulement les routes API a tester dans Postman.

## Repartition des passages

### JB - Chef du groupe

JB presente :

- l'introduction rapide du projet
- l'ordre global des tests
- les routes d'authentification
- la conclusion finale

Routes a presenter :

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/profile`

## Ce que JB doit dire

- presenter brievement LocAutoCM
- expliquer qu'on va tester l'API avec Postman
- montrer l'inscription
- montrer la connexion
- montrer la recuperation du profil apres connexion avec le token

### Keira

Keira presente :

- les routes des voitures
- les tests de consultation des vehicules

Routes a presenter :

- `GET /api/cars`
- `GET /api/cars/:id`
- `POST /api/cars`

## Ce que Keira doit dire

- montrer la liste des voitures
- montrer les details d'une voiture
- montrer l'ajout d'une voiture par un proprietaire

### Kim

Kim presente :

- les routes de reservation et location
- la logique des statuts

Routes a presenter :

- `POST /api/reservations`
- `GET /api/reservations/mon-historique`
- `PUT /api/reservations/:id/status`

## Ce que Kim doit dire

- montrer une demande de location ou reservation
- montrer l'historique
- montrer l'acceptation ou le refus par le proprietaire
- preciser que la facture est generee apres acceptation

### Grace

Grace presente :

- les notifications
- les factures
- le mot de passe oublie
- l'administration

Routes a presenter :

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `GET /api/invoices`
- `POST /api/auth/forgot-password/send-code`
- `POST /api/auth/forgot-password/verify-code`
- `POST /api/auth/forgot-password/change-password`
- `GET /api/admin/overview`

## Ce que Grace doit dire

- montrer les notifications
- montrer les factures disponibles
- montrer le flux mot de passe oublie
- montrer que l'admin peut voir les statistiques generales

## Ordre conseille dans Postman

### 1. Authentification

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/profile`

### 2. Voitures

- `GET /api/cars`
- `GET /api/cars/:id`
- `POST /api/cars`

### 3. Reservations

- `POST /api/reservations`
- `GET /api/reservations/mon-historique`
- `PUT /api/reservations/:id/status`

### 4. Notifications et factures

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `GET /api/invoices`

### 5. Mot de passe oublie

- `POST /api/auth/forgot-password/send-code`
- `POST /api/auth/forgot-password/verify-code`
- `POST /api/auth/forgot-password/change-password`

### 6. Administration

- `GET /api/admin/overview`

## Tokens a utiliser dans Postman

Apres connexion avec :

- admin
- proprietaire
- locataire

il faut copier le token JWT dans :

`Authorization: Bearer VOTRE_TOKEN`

## Comptes utiles pour les tests

- Admin : `admin@gmail.com`
- Proprietaire : `jean@owner.com`
- Proprietaire : `marie@owner.com`
- Locataire : `paul@renter.com`

## Note importante

- les routes protegees ont besoin du token
- la facture apparait apres acceptation
- les notifications dependent de l'utilisateur connecte
- le mot de passe oublie envoie un code par email

## Petite introduction conseillee par JB

"Bonjour, nous allons presenter notre projet LocAutoCM a travers les routes API testées dans Postman. Chaque membre va presenter un groupe de routes selon son role dans le projet."

## Petite conclusion conseillee par JB

"A travers ces tests Postman, nous montrons que notre API gere correctement l'authentification, les voitures, les reservations, les notifications, les factures et l'administration."
