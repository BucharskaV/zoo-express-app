const db = require('../db/db');
const bcrypt = require('bcrypt');
const saltRounds = 5;

function getUserByUsername(username){
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM User WHERE Username=?`, [username], function (err, user){
                if (err) reject(err);
                else resolve(user);
            }
        );
    });
}

function getUserByZookeeperId(zookeeperId){
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * 
                FROM User u
                JOIN Zookeeper z ON z.User_Id = u.Id 
                WHERE z.Id=?`, [zookeeperId], function (err, user){
                if (err) reject(err);
                else resolve(user);
            }
        );
    });
}

function register(username, password, role){
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash){
            if (err) reject(err);
            db.run(
                `INSERT INTO User (Username, Password, Role) VALUES (?, ?, ?)`,[username, hash, role], function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    });
}

function login(username, password){
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT u.Id, u.Username, u.Password, u.Role, z.Id AS ZookeeperId
                FROM User u 
                LEFT JOIN Zookeeper z ON z.User_Id = u.Id
                WHERE Username=?`, [username], function (err, user){
                if (err) return reject(err);
                else if(!user) return resolve({errors: ["No user with given username!"]});

                bcrypt.compare(password, user.Password, (err, result) => {
                    if (err) return reject(err);
                    if (result) resolve(user);
                    else resolve({errors: ["Incorrect password!"]});
                });
            }
        );
    });
}

module.exports = {register, getUserByUsername, getUserByZookeeperId, login};