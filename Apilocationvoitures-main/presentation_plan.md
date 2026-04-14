# Répartition des Tests API (Postman) pour la Soutenance

Voici la liste exacte des routes que chaque membre doit présenter et tester devant le jury via Postman. La répartition est faite sur les 12 endpoints obligatoires.

---

### M. JB (Chef de Projet) 
**Thème : Authentification et Découverte**
1. `POST /api/auth/register` : Démonstration de l'inscription d'un nouvel utilisateur (exemple : un locataire).
2. `POST /api/auth/login` : Vérification du Login et récupération du **Token JWT** dans la réponse de postman.
3. `GET /api/cars` : Affichage de la liste de toutes les voitures disponibles au Cameroun.

---

### Mme Keira (Développeuse Frontend & UI)
**Thème : Gestion côté Propriétaire**
4. `POST /api/cars` : Ajout d'un nouveau véhicule (avec utilisation du Token de propriétaire).
5. `GET /api/cars/:id` : Récupération des informations d'un seul véhicule avec son identifiant.
6. `PUT /api/cars/:id` : Modification du prix journalier du véhicule ajouté.

---

### Mme Kim (Développeuse Backend & BDD)
**Thème : Gestion côté Locataire et Réservation**
7. `POST /api/reservations` : Création d'une demande de location pour un véhicule précis.
8. `GET /api/users/profile` : Affichage des données du profil de l'utilisateur avec le Token.
9. `GET /api/reservations/mon-historique` : Liste des réservations passées par ce locataire.

---

### Mme Grace (Ingénieure QA)
**Thème : Finalisation, Annulation et Avis**
10. `PUT /api/reservations/:id/status` : Changement du statut de la réservation (ex: "accepter" ou "annuler").
11. `DELETE /api/cars/:id` : Suppression d'un véhicule du parc automobile (testé avec un rôle admin ou propriétaire).
12. `POST /api/reviews` : Ajout d'une évaluation et d'une note sur 5 étoiles à la fin de la location.
