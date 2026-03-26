const db = require('../db/db');

function getAllPaginated(page, size) {
    return new Promise((resolve, reject) => {
        const start = (page - 1) * size + 1;
        const end = page * size;

        db.all(`SELECT Id, Name, Calories
                FROM (
                         SELECT Id, Name, Calories, ROW_NUMBER() OVER (ORDER BY Id) AS row_num
                         FROM Food
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
            `SELECT COUNT(*) AS recordCount FROM Food`,
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
            `SELECT Id, Name, Calories FROM Food`,
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
            `SELECT * FROM Food WHERE Id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

function getDetailsById(id){
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT f.Id AS FoodId, f.Name AS FoodName, f.Calories AS FoodCalories,
            a.Id AS AnimalId, a.Name AS AnimalName, a.Breed AS AnimalBreed, a.Zookeeper_Id AS ZookeeperId, 
            pm.Quantity AS FoodQuantity
             FROM Food f
                      LEFT JOIN Permitted_meal pm ON pm.Food_Id = f.Id
                      LEFT JOIN Animal a ON a.Id = pm.Animal_Id
             WHERE f.Id = ?;`,
            [id],
            (err, rows) => {
                if (err) return reject(err);
                if (!rows || rows.length === 0) return resolve(null);

                const food = {
                    Id: rows[0].FoodId,
                    Name: rows[0].FoodName,
                    Calories: rows[0].FoodCalories,
                    Animals: []
                };

                const animals = {};

                rows.forEach(row =>{
                    if (row.AnimalId && !animals[row.AnimalId]) {
                        animals[row.AnimalId] = {
                            Name: row.AnimalName,
                            Breed: row.AnimalBreed,
                            Zookeeper: row.ZookeeperId,
                            Quantity: row.FoodQuantity
                        };
                        food.Animals.push(animals[row.AnimalId]);
                    }
                });

                resolve(food);
            }
        );

    });
}

function add(name, calories){
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO Food (Name, Calories) VALUES (?, ?)`, [name, calories], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

function update(id, name, calories){
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE Food SET Name=?, Calories=? WHERE Id=?`, [name, calories, id], function (err) {
                if (err) reject(err);
                else resolve(id);
            }
        );
    });
}

function deleteById(id) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM Food WHERE Id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

module.exports = {getAllPaginated, getCount, getAll, getById, getDetailsById, add, update, deleteById};