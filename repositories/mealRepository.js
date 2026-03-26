const db = require('../db/db');

function getAllPaginated(page, size) {
    return new Promise((resolve, reject) => {
        const start = (page - 1) * size + 1;
        const end = page * size;

        db.all(`SELECT Animal_Id, Food_Id, Quantity
                FROM (
                         SELECT Animal_Id, Food_Id, Quantity, ROW_NUMBER() OVER (ORDER BY Animal_Id) AS row_num
                         FROM Permitted_meal
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
            `SELECT COUNT(*) AS recordCount FROM Permitted_meal`,
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

        db.all(`SELECT Animal_Id, Food_Id, Quantity
                FROM (
                         SELECT pm.Animal_Id, pm.Food_Id, pm.Quantity, ROW_NUMBER() OVER (ORDER BY Animal_Id) AS row_num
                         FROM Permitted_meal pm
                         LEFT JOIN Animal a ON pm.Animal_Id = a.Id
                         WHERE a.Zookeeper_Id=?
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
            `SELECT COUNT(*) AS recordCount 
                FROM Permitted_meal pm 
                LEFT JOIN Animal a ON pm.Animal_Id = a.Id
                WHERE a.Zookeeper_Id=?`, [id],
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
            `SELECT Animal_Id, Food_Id, Quantity FROM Permitted_meal`,
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

function getByAnimalIdAndFoodId(animalId, foodId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM Permitted_meal WHERE Animal_Id = ? AND Food_Id = ?`, [animalId, foodId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

function getDetailsByAnimalIdAndFoodId(animalId, foodId){
    return new Promise((resolve, reject) => {
        db.get(`SELECT pm.Food_Id AS FoodId, pm.Animal_Id AS AnimalId, pm.Quantity AS FoodQuantity,
                 f.Name AS FoodName, f.Calories AS FoodCalories,
                 a.Name AS AnimalName, a.Breed AS AnimalBreed, a.Zookeeper_Id AS ZookeeperId
             FROM Permitted_meal pm
                      LEFT JOIN Food f ON f.Id = pm.Food_Id
                      LEFT JOIN Animal a ON a.Id = pm.Animal_Id
             WHERE pm.Animal_Id = ? AND pm.Food_Id = ?;`,
            [animalId, foodId],
            (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);

                const meal = {
                    Quantity: row.FoodQuantity,
                    Animal: {
                        Name: row.AnimalName,
                        Breed: row.AnimalBreed,
                        Zookeeper: {
                            Id: row.ZookeeperId
                        }
                    },
                    Food: {
                        Name: row.FoodName,
                        Calories: row.FoodCalories
                    }
                };

                resolve([meal]);
            }
        );

    });
}

function getDetailsByAnimalId(id){
    return new Promise((resolve, reject) => {
        db.all(`SELECT pm.Food_Id AS FoodId, pm.Animal_Id AS AnimalId, pm.Quantity AS FoodQuantity,
                 f.Name AS FoodName, f.Calories AS FoodCalories,
                 a.Name AS AnimalName, a.Breed AS AnimalBreed, a.Zookeeper_Id AS ZookeeperId
             FROM Permitted_meal pm
                      LEFT JOIN Food f ON f.Id = pm.Food_Id
                      LEFT JOIN Animal a ON a.Id = pm.Animal_Id
             WHERE pm.Animal_Id = ?;`,
            [id],
            (err, rows) => {
                if (err) return reject(err);
                if (!rows) return resolve(null);

                const meals = [];

                rows.forEach(row => {
                    meals.push({
                        Quantity: row.FoodQuantity,
                        Animal: {
                            Name: row.AnimalName,
                            Breed: row.AnimalBreed,
                            Zookeeper: {
                                Id: row.ZookeeperId
                            }
                        },
                        Food: {
                            Id: row.FoodId,
                            Name: row.FoodName,
                            Calories: row.FoodCalories
                        }
                    });
                });

                resolve(meals);
            }
        );

    });
}

function add(animal_id, food_id, quantity){
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO Permitted_meal (Animal_Id, Food_Id, Quantity) VALUES (?, ?, ?)`,
            [
                Number(animal_id),
                Number(food_id),
                quantity
            ],
            function (err) {
                if (err) reject(err);
                else resolve({
                    AnimalId: animal_id,
                    FoodId: food_id
                });
            }
        );
    });
}

function update(old_animal_id, old_food_id, animal_id, food_id, quantity){
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE Permitted_meal SET Animal_Id=?, Food_Id=?, Quantity=? WHERE Animal_Id=? AND Food_Id=?`,
            [
                Number(animal_id),
                Number(food_id),
                quantity,
                Number(old_animal_id),
                Number(old_food_id)
            ], [animal_id, food_id, quantity, old_animal_id, old_food_id], function (err) {
                if (err) reject(err);
                else resolve({
                    AnimalId: animal_id,
                    FoodId: food_id
                });
            }
        );
    });
}

function deleteByAnimalIdAndFoodId(animalId, foodId) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM Permitted_meal WHERE Animal_Id = ? AND Food_Id = ?`, [animalId, foodId], function (err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

module.exports = {getAllPaginated, getCount, getCountByZookeeper, getAllPaginatedByZookeeper, getAll, getByAnimalIdAndFoodId, getDetailsByAnimalIdAndFoodId, getDetailsByAnimalId, add, update, deleteByAnimalIdAndFoodId};