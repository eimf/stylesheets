export async function seedDatabase(db) {
    const stylistsCount = await db.get(
        "SELECT COUNT(*) as count FROM stylists"
    );

    if (stylistsCount.count === 0) {
        // Seed stylists
        await db.run(
            `INSERT INTO stylists (username, password, email, phone, name, last_name, specialization)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                "cheke", // username
                "1234", // password
                "lzdzel@gmail.com", // email
                "410-375-5262", // phone
                "Ezequiel", // name
                "Lopez", // last_name
                "IT", // specialization
            ]
        );
    }
}
