const express = require('express');
const router = express.Router();
const animalRepository = require('../repositories/animalRepository');
const zookeeperRepository = require("../repositories/zookeeperRepository");
const {auth} = require("../middleware/auth");

router.get('/animals', async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        const size = 4;
        let totalCount;
        let animals;

        if(req.session.role == 'Zookeeper'){
            totalCount = await animalRepository.getCountByZookeeper(req.session.zookeeper_id);
            animals = await animalRepository.getAllPaginatedByZookeeper(req.session.zookeeper_id, page, size);
        }
        else{
            totalCount = await animalRepository.getCount();
            animals = await animalRepository.getAllPaginated(page, size);
        }

        const totalPages = Math.ceil(totalCount/size);

        res.render('./animal/list', {page, totalPages, animals});
    } catch (err) {
        next(err);
    }
});

router.get('/animals/add', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    const zookeepers = await zookeeperRepository.getAll();
    res.render('./animal/add', {zookeepers});
});

router.post('/animals/add', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const {name, breed, zookeeper_id} = req.body;
        const errors = validate(zookeeper_id, name, breed);
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const newAnimal = await animalRepository.add(name, breed, zookeeper_id);
        res.json({
            success: true,
            id: newAnimal
        });
    }
    catch (err) {
        next(err);
    }
});

router.get('/animals/edit/:id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: true}), async (req, res, next) => {
    const id = req.params.id;
    const zookeepers = await zookeeperRepository.getAll();
    res.render('./animal/edit', {zookeepers, id});
});

router.put('/animals/:id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: true}), async (req, res, next) => {
    try {
        const id = req.params.id;
        const {name, breed, zookeeper_id} = req.body;
        const errors = validate(zookeeper_id, name, breed);
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const animalUpdated = await animalRepository.update(id, name, breed, zookeeper_id);
        res.json({
            success: true,
            id: animalUpdated
        });
    }
    catch (err) {
        next(err);
    }
});

router.get('/animals/:id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.id;
        const animal = await animalRepository.getDetailsById(id);
        if (!animal) return res.status(404).send("Not found");
        res.render('./animal/details', { animal });
    }
    catch (err) {
        next(err);
    }
});

router.get('/animals/delete/:id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: true}), async (req, res, next) => {
    try {
        const id = req.params.id;
        const animal = await animalRepository.getById(id);
        if (!animal) return res.status(404).send("Not found");
        res.render('./animal/delete', { animal });
    }
    catch (err) {
        next(err);
    }
});

router.post('/animals/delete/:id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: true}), async (req, res, next) => {
    try {
        const id = req.params.id;
        if (req.body.confirm === 'yes') {
            await animalRepository.deleteById(id);
        }
        res.redirect('/');
    }
    catch (err) {
        next(err);
    }
});
function validate(id, name, breed){
    const errors = [];

    if(!id){
        errors.push("The zookeeper is required!");
    }else if(isNaN(Number(id)) || Number(id) < 1){
        errors.push("The zookeeper id must be a positive number!");
    }

    const namePattern = /^[A-Za-z]+$/;
    if(name === ""){
        errors.push("The name is required!");
    }
    else if(name.length > 255){
        errors.push("The name must consist up to 255 characters!")
    }
    else if(!namePattern.test(name)){
        errors.push("The name must consist letters only!");
    }

    const breedPattern = /^[A-Za-z\s]+$/;
    if(breed === ""){
        errors.push("The breed is required!");
    }
    else if(breed.length > 50){
        errors.push("The breed must consist up to 50 characters!")
    }
    else if(!breedPattern.test(breed)){
        errors.push("The breed must consist letters and spaces only!");
    }

    return errors;
}

module.exports = router;