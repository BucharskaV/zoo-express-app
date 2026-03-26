const db = require('../db/db');

function getAllPaginated(page, size) {
    return new Promise((resolve, reject) => {
        const start = (page - 1) * size + 1;
        const end = page * size;

        db.all(`SELECT Id, Name, Breed
                FROM (
                         SELECT Id, Name, Breed, ROW_NUMBER() OVER (ORDER BY Id) AS row_num
                         FROM Animal
                     ) AS numbered
                WHERE row_num BETWEEN ? AND ?;`, [start, end], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getCount(){
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) AS recordCount FROM Animal`,
            (err, row) => {
                if (err) reject(err);
                else resolve(row.recordCount);
            }
        );
    });
}

function getAllPaginatedByZookeeper(id, page, size) {
    return new Promise((resolve, reject) => {
        const start = (page - 1) * size + 1;
        const end = page * size;

        db.all(`SELECT Id, Name, Breed
                FROM (
                         SELECT Id, Name, Breed, ROW_NUMBER() OVER (ORDER BY Id) AS row_num
                         FROM Animal
                         WHERE Zookeeper_Id=?
                     ) AS numbered
                WHERE row_num BETWEEN ? AND ?;`, [id, start, end], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getCountByZookeeper(id){
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) AS recordCount FROM Animal WHERE Zookeeper_Id=?`, [id],
            (err, row) => {
                if (err) reject(err);
                else resolve(row.recordCount);
            }
        );
    });
}

function getAll(){
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT Id, Name, Breed FROM Animal`,
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

function getById(id) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT Id, Name, Breed, Zookeeper_Id 
                FROM Animal WHERE Id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

function getDetailsById(id){
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT a.Id AS AnimalId, a.Name AS AnimalName, a.Breed AS AnimalBreed, a.Zookeeper_Id AS ZookeeperId, 
            f.Id AS FoodId, f.Name AS FoodName, f.Calories AS FoodCalories,
            pm.Quantity AS FoodQuantity
             FROM Animal a
                LEFT JOIN Permitted_meal pm ON pm.Animal_Id = a.Id
                LEFT JOIN Food f ON f.Id = pm.Food_Id
             WHERE a.Id = ?;`,
            [id],
            (err, rows) => {
                if (err) return reject(err);
                if (!rows || rows.length === 0) return resolve(null);

                const animal = {
                    Id: rows[0].AnimalId,
                    Name: rows[0].AnimalName,
                    Breed: rows[0].AnimalBreed,
                    Zookeeper: {
                        Id: rows[0].ZookeeperId
                    },
                    Foods: []
                };

                const foods = {};

                rows.forEach(row => {
                    if (row.FoodId && !foods[row.FoodId]) {
                        foods[row.FoodId] = {
                            Id: row.FoodId,
                            Name: row.FoodName,
                            Calories: row.FoodCalories,
                            Quantity: row.FoodQuantity
                        };
                        animal.Foods.push(foods[row.FoodId]);
                    }
                });

                resolve(animal);
            }
        );

    });
}

function add(name, breed, zookeeper_id){
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO Animal (Name, Breed, Zookeeper_Id) VALUES (?, ?, ?)`, [name, breed, Number(zookeeper_id)], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

function update(id, name, breed, zookeeper_id){
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE Animal SET Name=?, Breed=?, Zookeeper_Id=? WHERE Id=?`, [name, breed, Number(zookeeper_id), id], function (err) {
                if (err) reject(err);
                else resolve(id);
            }
        );
    });
}

function deleteById(id) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM Animal WHERE Id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

module.exports = {getAllPaginated, getCount, getAllPaginatedByZookeeper, getCountByZookeeper, getAll, getById, getDetailsById, add, update, deleteById};