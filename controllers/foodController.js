const express = require('express');
const router = express.Router();
const foodRepository = require('../repositories/foodRepository');
const {auth} = require("../middleware/auth");

router.get('/food', async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        const size = 4;
        const totalCount = await foodRepository.getCount();
        const totalPages = Math.ceil(totalCount/size);

        const food = await foodRepository.getAllPaginated(page, size);
        res.render('./food/list', {page, totalPages, food});
    } catch (err) {
        next(err);
    }
});

router.get('/food/add', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    res.render('./food/add');
});

router.post('/food/add', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const {name, calories} = req.body;
        const errors = validate(name, calories);
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const newFood = await foodRepository.add(name, calories);
        res.json({
            success: true,
            id: newFood
        });
    }
    catch (err) {
        next(err);
    }
});

router.get('/food/edit/:id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    const id = req.params.id;
    res.render('./food/edit', {id});
});

router.put('/food/:id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.id;
        const {name, calories} = req.body;
        const errors = validate(name, calories);
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const foodUpdated = await foodRepository.update(id, name, calories);
        res.json({
            success: true,
            id: foodUpdated
        });
    }
    catch (err) {
        next(err);
    }
});

router.get('/food/:id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.id;
        const food = await foodRepository.getDetailsById(id);
        if (!food) return res.status(404).send("Not found");
        res.render('./food/details', { food });
    } catch (err) {
        next(err);
    }
});

router.get('/food/delete/:id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.id;
        const food = await foodRepository.getById(id);
        if (!food) return res.status(404).send("Not found");
        res.render('./food/delete', { food });
    }
    catch (err) {
        next(err);
    }
});

router.post('/food/delete/:id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.id;
        if (req.body.confirm === 'yes') {
            await foodRepository.deleteById(id);
        }
        res.redirect('/');
    }
    catch (err) {
        next(err);
    }
});


function validate(name, calories){
    const errors = [];

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

    const caloriesNumber = parseFloat(calories);
    if(isNaN(caloriesNumber)){
        errors.push("The calories should be a number!");
    }
    else if(caloriesNumber < 0){
        errors.push("The calories number can't be a negative number!");
    }

    return errors;
}

module.exports = router;