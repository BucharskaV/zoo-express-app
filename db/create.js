const db = require('./db.js');

// -- Created by Redgate Data Modeler (https://datamodeler.redgate-platform.com)
// -- Last modification date: 2025-12-09 16:33:51.893
function createTables(callback){
    db.serialize(()=>{
        db.run(`
            CREATE TABLE User (
                                  Id integer NOT NULL CONSTRAINT User_pk PRIMARY KEY,
                                  Username varchar(15) NOT NULL,
                                  Password varchar(255) NOT NULL,
                                  Role varchar(50) NOT NULL
            );
        `);

        db.run(`
            CREATE TABLE Zookeeper (
                                       Id integer NOT NULL CONSTRAINT Zookeeper_pk PRIMARY KEY,
                                       FirstName varchar(255) NOT NULL,
                                       LastName varchar(255) NOT NULL,
                                       Department character(1) NOT NULL,
                                       User_Id integer,
                                       CONSTRAINT Zookeeper_User FOREIGN KEY (User_Id)
                                           REFERENCES User (Id)
            );
        `);

        db.run(`
            CREATE TABLE Animal (
                                    Id integer NOT NULL CONSTRAINT Animal_pk PRIMARY KEY,
                                    Name varchar(255) NOT NULL,
                                    Breed varchar(50) NOT NULL,
                                    Zookeeper_Id integer NOT NULL,
                                    CONSTRAINT Animal_Zookeeper FOREIGN KEY (Zookeeper_Id)
                                        REFERENCES Zookeeper (Id)
                                        ON DELETE CASCADE
            );
        `);

        db.run(`
            CREATE TABLE Food (
                                  Id integer NOT NULL CONSTRAINT Food_pk PRIMARY KEY,
                                  Name varchar(255) NOT NULL,
                                  Calories float NOT NULL
            );
        `);

        db.run(`
            CREATE TABLE Permitted_meal (
                                            Animal_Id integer NOT NULL,
                                            Food_Id integer NOT NULL,
                                            Quantity varchar(50) NOT NULL,
                                            CONSTRAINT Permitted_meal_pk PRIMARY KEY (Animal_Id,Food_Id),
                                            CONSTRAINT animal_food_Animal FOREIGN KEY (Animal_Id)
                                                REFERENCES Animal (Id)
                                                ON DELETE CASCADE,
                                            CONSTRAINT animal_food_Food FOREIGN KEY (Food_Id)
                                                REFERENCES Food (Id)
                                                ON DELETE CASCADE
            );
        `, callback);
        console.log("Created")
    });
}

module.exports = createTables;