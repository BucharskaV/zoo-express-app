const express = require('express');
const router = express.Router();
const userRepository = require('../repositories/userRepository');
const zookeeperRepository = require("../repositories/zookeeperRepository");
const {auth} = require("../middleware/auth");

router.get('/register', auth({isLoggedIn : false, roles : [], isSupervisedAnimal: false}), (req, res, next) =>{
    res.render('./auth/auth-user', {
        text : "Registration",
        action: "Registration",
        zookeepers: null
    });
});

router.get('/login', auth({isLoggedIn : false, roles : [], isSupervisedAnimal: false}), (req, res, next) =>{
    res.render('./auth/auth-user', {
        text : "Login",
        action: "Login",
        zookeepers: null
    });
});

router.get('/register-zookeeper', auth({isLoggedIn : false, roles : [], isSupervisedAnimal: false}), async (req, res, next) =>{
    const zookeepers = await zookeeperRepository.getAll();
    res.render('./auth/auth-user', {
        text : "Registration as zookeeper",
        action: "Registration as zookeeper",
        zookeepers
    });
});

router.post('/register', auth({isLoggedIn : false, roles : [], isSupervisedAnimal: false}), async (req, res, next) =>{
    try {
        const {username, password, role} = req.body;
        const errors = await validate(username, password);
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const newUser = await userRepository.register(username, password, role);
        res.json({
            success: true,
            id: newUser
        });
    }
    catch (err) {
        next(err);
    }
});

router.post('/login', auth({isLoggedIn : false, roles : [], isSupervisedAnimal: false}), async (req, res, next) =>{
    try {
        const {username, password} = req.body;
        const newUser = await userRepository.login(username, password);

        if(newUser.errors){
            return res.json({
                success: false,
                errors: newUser.errors
            });
        }

        req.session.userId = newUser.Id;
        req.session.username = newUser.Username;
        req.session.role = newUser.Role;
        if(req.session.role == 'Zookeeper'){
            req.session.zookeeper_id = newUser.ZookeeperId;
        }

        req.session.save(err => {
            if (err) return next(err);
            res.json({ success: true });
        });
    }
    catch (err) {
        next(err);
    }
});

router.post('/register-zookeeper', auth({isLoggedIn : false, roles : [], isSupervisedAnimal: false}), async (req, res, next) =>{
    try {
        const {username, password, zookeeper_id, role} = req.body;
        const errors = await validate(username, password);
        if(!zookeeper_id){
            errors.push("The zookeeper is required!");
        }else if(isNaN(Number(zookeeper_id)) || Number(zookeeper_id) < 1){
            errors.push("The zookeeper id must be a positive number!");
        }
        const zookeeper = await userRepository.getUserByZookeeperId(zookeeper_id);
        if(zookeeper){
            errors.push("The selected zookeeper already registered!");
        }
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const newUser = await userRepository.register(username, password, role);
        res.json({
            success: true,
            id: newUser
        });
    }
    catch (err) {
        next(err);
    }
});

router.get('/logout', auth({isLoggedIn : true, roles : [], isSupervisedAnimal: false}), (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

async function validate(username, password){
    const errors = [];

    const user = await userRepository.getUserByUsername(username);
    if(user){
        errors.push("The user with given username already exists!");
    }

    const userNamePattern = /^[A-Za-z]+$/;
    if(username === ""){
        errors.push("The username is required!");
    }
    else if(username.length > 15){
        errors.push("The username must consist up to 15 characters!")
    }
    else if(!userNamePattern.test(username)){
        errors.push("The username must consist letters only!");
    }

    const passwordPatternContent = /^(?=.*[A-Za-z])(?=.*\d)(?=.*\W)/;
    const passwordPatternAmount = /^.{8,15}$/;
    if(password === ""){
        errors.push("The password is required!");
    }
    else if(!passwordPatternContent.test(password)){
        errors.push("The password must consist letters, at least one digit and one special character!");
    }
    else if(!passwordPatternAmount.test(password)){
        errors.push("The password must consist of minimum 8 characters and maximum 15 characters!");
    }

    return errors;
}

module.exports = router;