const db = require('../db/db');

function getAllPaginated(page, size) {
    return new Promise((resolve, reject) => {
        const start = (page - 1) * size + 1;
        const end = page * size;

        db.all(`SELECT Id, FirstName, LastName, Department
                FROM (
                         SELECT Id, FirstName, LastName, Department, ROW_NUMBER() OVER (ORDER BY Id) AS row_num
                         FROM Zookeeper
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
            `SELECT COUNT(*) AS recordCount FROM Zookeeper`,
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
            `SELECT Id, FirstName, LastName, Department FROM Zookeeper`,
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
            `SELECT * FROM Zookeeper WHERE Id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

function getDetailsById(id) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT z.Id AS ZookeeperId, z.FirstName, z.LastName, z.Department,
                 a.Id AS AnimalId, a.Name AS AnimalName, a.Breed AS AnimalBreed, 
                 f.Id AS FoodId, f.Name AS FoodName, f.Calories AS FoodCalories,
                 pm.Quantity AS FoodQuantity
             FROM Zookeeper z
                      LEFT JOIN Animal a ON a.Zookeeper_Id = z.Id
                      LEFT JOIN Permitted_meal pm ON pm.Animal_Id = a.Id
                      LEFT JOIN Food f ON f.Id = pm.Food_Id
             WHERE z.Id = ?;`, [id], (err, rows) => {
                if (err) return reject(err);

                const zookeeper = {
                    Id: rows[0].ZookeeperId,
                    FirstName: rows[0].FirstName,
                    LastName: rows[0].LastName,
                    Department: rows[0].Department,
                    Animals: []
                };

                const animals = {};

                rows.forEach(row => {
                    if (row.AnimalId) {
                        if (!animals[row.AnimalId]) {
                            animals[row.AnimalId] = {
                                Id: row.AnimalId,
                                Name: row.AnimalName,
                                Breed: row.AnimalBreed
                            };
                            zookeeper.Animals.push(animals[row.AnimalId]);
                        }

                    }
                })

                resolve(zookeeper);
            }
        );
    });
}

function add(firstName, lastName, department){
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO Zookeeper (FirstName, LastName, Department) VALUES (?, ?, ?)`, [firstName, lastName, department], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

function update(id, firstName, lastName, department){
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE Zookeeper SET FirstName=?, LastName=?, Department=? WHERE Id=?`, [firstName, lastName, department, id], function (err) {
                if (err) reject(err);
                else resolve(id);
            }
        );
    });
}

function deleteById(id) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM Zookeeper WHERE Id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

module.exports = {getAllPaginated, getCount, getAll, getById, getDetailsById, add, update, deleteById};