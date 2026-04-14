import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password', // They might have meant literally this
    database: 'locautocm_db'
};

async function seed() {
    console.log('Connecting to database...');
    // We will attempt with k@ldjob20065 first, if it fails we try password
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
    } catch (e) {
        if (e.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('Access denied with "password", trying "k@ldjob20065"...');
            dbConfig.password = 'k@ldjob20065';
            connection = await mysql.createConnection(dbConfig);
        } else {
            throw e;
        }
    }

    console.log('Connected! Seeding initial data...');

    const passwordHash = await bcrypt.hash('123456', 10);

    // Create Users (Owners and Renters)
    const users = [
        ['Jean Dupont', 'jean@owner.com', '+33600000001', passwordHash, 'owner'],
        ['Marie Curie', 'marie@owner.com', '+33600000002', passwordHash, 'owner'],
        ['Paul Renard', 'paul@renter.com', '+33600000003', passwordHash, 'renter'],
        ['Sophie Martin', 'sophie@renter.com', '+33600000004', passwordHash, 'renter']
    ];

    for (const [name, email, phone, pwd, role] of users) {
        await connection.execute(
            'INSERT IGNORE INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, pwd, role]
        );
    }

    // Get Owner IDs
    const [ownerRows] = await connection.execute('SELECT id FROM users WHERE role = "owner"');
    const ownerId1 = ownerRows[0]?.id;
    const ownerId2 = ownerRows[1]?.id;

    if (!ownerId1) {
        console.error('No owners found, skipping car insertion.');
        process.exit(1);
    }

    // Create Cars
    const cars = [
        [ownerId1, 'Toyota', 'Corolla', 2021, 50.00, 'Yaoundé', 'Berline', 5, 'Automatique'],
        [ownerId1, 'Honda', 'Civic', 2022, 55.00, 'Douala', 'Berline', 5, 'Automatique'],
        [ownerId2, 'Ford', 'Focus', 2020, 45.00, 'Bafoussam', 'Compacte', 5, 'Manuelle'],
        [ownerId2, 'Mercedes', 'GLC', 2023, 120.00, 'Yaoundé', 'SUV', 5, 'Automatique'],
        [ownerId1, 'Hyundai', 'Tucson', 2021, 80.00, 'Douala', 'SUV', 5, 'Automatique'],
        [ownerId2, 'Peugeot', '208', 2019, 40.00, 'Kribi', 'Citadine', 5, 'Manuelle'],
    ];

    let insertedCount = 0;
    for (const car of cars) {
        const [rows] = await connection.execute('SELECT id FROM cars WHERE make = ? AND model = ? AND owner_id = ?', [car[1], car[2], car[0]]);
        if (rows.length === 0) {
            await connection.execute(
                'INSERT INTO cars (owner_id, make, model, year, pricePerDay, location, category, seats, transmission) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                car
            );
            insertedCount++;
        }
    }

    console.log(`Seeding complete! Added users and ${insertedCount} cars. Test accounts:`);
    console.log('Owners: jean@owner.com, marie@owner.com (password: 123456)');
    console.log('Renters: paul@renter.com, sophie@renter.com (password: 123456)');
    await connection.end();
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
