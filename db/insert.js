const db = require('./db.js');
const bcrypt = require('bcrypt');

function insertData(callback) {
    db.serialize( () => {
        const users = [
            { id: 1, username: 'johnsmith', password: 'johnsmith123$', role: 'Zookeeper' },
            { id: 2, username: 'annabrown', password: 'annabrown123$', role: 'Zookeeper' },
            { id: 3, username: 'linatodorenko', password: 'linatodorenko123$', role: 'Zookeeper' },
            { id: 4, username: 'barbarayork', password: 'barbarayork123$', role: 'Zookeeper' },
            { id: 5, username: 'michaelstone', password: 'michaelstone123$', role: 'Zookeeper' },
            { id: 6, username: 'emilyclark', password: 'emilyclark123$', role: 'Zookeeper' },
            { id: 7, username: 'davidwilson', password: 'davidwilson123$', role: 'Zookeeper' },
            { id: 8, username: 'sarahmiller', password: 'sarahmiller123$', role: 'Zookeeper' },
            { id: 9, username: 'peterjohnson', password: 'peterjohnson123$', role: 'Zookeeper' },
            { id: 11, username: 'user1', password: 'user123$', role: 'User' }
        ];
        users.forEach(u => {
            const hash = bcrypt.hashSync(u.password, 5);
            db.run(
                `INSERT INTO User (Id, Username, Password, Role) VALUES (?, ?, ?, ?)`,
                [u.id, u.username, hash, u.role]
            );
        });

        const zookeepers = [
            [1, 'John', 'Smith', 'A', 1],
            [2, 'Anna', 'Brown', 'B', 2],
            [3, 'Lina', 'Todorenko', 'B', 3],
            [4, 'Barbara', 'York', 'C', 4],
            [5, 'Michael', 'Stone', 'A', 5],
            [6, 'Emily', 'Clark', 'A', 6],
            [7, 'David', 'Wilson', 'C', 7],
            [8, 'Sarah', 'Miller', 'B', 8],
            [9, 'Peter', 'Johnson', 'C', 9],
            [10, 'Olivia', 'Davis', 'A', null]
        ];
        zookeepers.forEach(z => {
            db.run(
                `INSERT INTO Zookeeper (Id, FirstName, LastName, Department, User_Id) VALUES (?, ?, ?, ?, ?)`,
                z
            );
        });

        const animals = [
            [1, 'Leo', 'Lion', 1],
            [2, 'Lolo', 'Panda', 2],
            [3, 'Jastin', 'Horse', 3],
            [4, 'Fimi', 'Llama', 4],
            [5, 'Rocky', 'Tiger', 5],
            [6, 'Milo', 'Giraffe', 6],
            [7, 'Zara', 'Zebra', 7],
            [8, 'Koko', 'Monkey', 8],
            [9, 'Rango', 'Camel', 9],
            [10, 'Nina', 'Elephant', 10]
        ];
        animals.forEach(a => {
            db.run(
                `INSERT INTO Animal (Id, Name, Breed, Zookeeper_Id) VALUES (?, ?, ?, ?)`,
                a
            );
        });

        const foods = [
            [1, 'Meat', 250],
            [2, 'Grass', 80],
            [3, 'Bamboo', 90],
            [4, 'Fruits', 120],
            [5, 'Fish', 200],
            [6, 'Grains', 160],
            [7, 'Nuts', 300],
            [8, 'Vegetables', 70],
            [9, 'Honey', 350],
            [10, 'Leaves', 60]
        ];
        foods.forEach(f => {
            db.run(
                `INSERT INTO Food (Id, Name, Calories) VALUES (?, ?, ?)`,
                f
            );
        });

        const meals = [
            [1, 1, '5kg'],
            [2, 3, '2kg'],
            [3, 2, '10kg'],
            [4, 4, '3kg'],
            [5, 1, '6kg'],
            [6, 8, '12kg'],
            [7, 10, '4kg'],
            [8, 4, '1kg'],
            [9, 6, '8kg'],
            [10, 7, '3kg']
        ];
        meals.forEach(m => {
            db.run(
                `INSERT INTO Permitted_meal (Animal_Id, Food_Id, Quantity) VALUES (?, ?, ?)`,
                m
            );
        });

        console.log("Added");
        callback();
    });
}

module.exports = insertData;