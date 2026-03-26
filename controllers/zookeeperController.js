const express = require('express');
const router = express.Router();
const zookeeperRepository = require('../repositories/zookeeperRepository');
const {auth} = require("../middleware/auth");

router.get('/zookeepers', async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        const size = 4;
        const totalCount = await zookeeperRepository.getCount();
        const totalPages = Math.ceil(totalCount/size);

        const zookeepers = await zookeeperRepository.getAllPaginated(page, size);
        res.render('./zookeeper/list', {page, totalPages, zookeepers});
    } catch (err) {
        next(err);
    }
});

router.get('/zookeepers/add', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    res.render('./zookeeper/add');
});

router.post('/zookeepers/add', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const {firstName, lastName, department} = req.body;
        const errors = validate(firstName, lastName, department);
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const newZookeeper = await zookeeperRepository.add(firstName, lastName, department);
        res.json({
            success: true,
            id: newZookeeper
        });
    }
    catch (err) {
        next(err);
    }
});

router.get('/zookeepers/edit/:id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    const id = req.params.id;
    res.render('./zookeeper/edit', {id});
});

router.put('/zookeepers/:id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.id;
        const {firstName, lastName, department} = req.body;
        const errors = validate(firstName, lastName, department);
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const zookeeperUpdated = await zookeeperRepository.update(id, firstName, lastName, department);
        res.json({
            success: true,
            id: zookeeperUpdated
        });
    }
    catch (err) {
        next(err);
    }
});

router.get('/zookeepers/:id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.id;
        const zookeeper = await zookeeperRepository.getDetailsById(id);
        if (!zookeeper) return res.status(404).send("Not found");
        res.render('./zookeeper/details', { zookeeper });
    }
    catch (err) {
        next(err);
    }
});

router.get('/zookeepers/delete/:id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.id;
        const zookeeper = await zookeeperRepository.getById(id);
        if (!zookeeper) return res.status(404).send("Not found");
        res.render('./zookeeper/delete', { zookeeper });
    }
    catch (err) {
        next(err);
    }
});

router.post('/zookeepers/delete/:id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.id;
        if (req.body.confirm === 'yes') {
            await zookeeperRepository.deleteById(id);
        }
        res.redirect('/');
    }
    catch (err) {
        next(err);
    }
});

function validate(firstName, lastName, department){
    const errors = [];

    const firstNamePattern = /^[A-Za-z]+$/;
    if(firstName === ""){
        errors.push("The first name is required!");
    }
    else if(firstName.length > 255){
        errors.push("The first name must consist up to 255 characters!")
    }
    else if(!firstNamePattern.test(firstName)){
        errors.push("The first name must consist letters only, without spaces and numbers!");
    }

    const lastNamePattern = /^[A-Za-z]+$/;
    if(lastName === ""){
        errors.push("The last name is required!");
    }else if(lastName.length > 255){
        errors.push("The last name must consist up to 255 characters!")
    }
    else if(!lastNamePattern.test(lastName)){
        errors.push("The last name must consist letters only, without spaces and numbers!");
    }

    const departmentPattern = /^[A-Z]$/;
    if(department === ""){
        errors.push("The department is required!");
    }
    else if(!departmentPattern.test(department)){
        errors.push("The department should be represented by one uppercase letter!");
    }
    return errors;
}

module.exports = router;