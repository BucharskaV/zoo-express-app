const express = require('express');
const router = express.Router();
const mealRepository = require('../repositories/mealRepository');
const animalRepository = require("../repositories/animalRepository");
const foodRepository = require("../repositories/foodRepository");
const {auth} = require("../middleware/auth");

router.get('/meals', async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        const size = 4;
        let totalCount;
        let meals;

        if(req.session.role == 'Zookeeper'){
            totalCount = await mealRepository.getCountByZookeeper(req.session.zookeeper_id);
            meals = await mealRepository.getAllPaginatedByZookeeper(req.session.zookeeper_id, page, size);
        }
        else{
            totalCount = await mealRepository.getCount();
            meals = await mealRepository.getAllPaginated(page, size);
        }

        const totalPages = Math.ceil(totalCount/size);
        res.render('./meal/list', {page, totalPages, meals});
    } catch (err) {
        next(err);
    }
});

router.get('/meals/add', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: false}), async (req, res, next) => {
    const animals = await animalRepository.getAll();
    const food = await foodRepository.getAll();
    res.render('./meal/add', {animals, food});
});

router.post('/meals/add', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: false}),  async (req, res, next) => {
    try {
        const {animal_id, food_id, quantity} = req.body;
        const errors = await validate(animal_id, food_id, quantity);
        const animal = await animalRepository.getById(animal_id);
        if(animal.Zookeeper_Id !== req.session.zookeeper_id){
            errors.push("The zookeeper can add the meal only for supervised animals!")
        }
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const newMeal = await mealRepository.add(animal_id, food_id, quantity);
        res.json({
            success: true,
            AnimalId: newMeal.AnimalId,
            FoodId: newMeal.FoodId,
        });
    }
    catch (err) {
        next(err);
    }
});

router.get('/meals/edit/:old_animal_id/:old_food_id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    const old_animal_id = req.params.old_animal_id;
    const old_food_id = req.params.old_food_id;
    const animals = await animalRepository.getAll();
    const food = await foodRepository.getAll();
    res.render('./meal/edit', {old_animal_id, old_food_id, animals, food});
});

router.put('/meals/:old_animal_id/:old_food_id', auth({isLoggedIn : true, roles : ['User'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const old_animal_id = req.params.old_animal_id;
        const old_food_id = req.params.old_food_id;
        const {animal_id, food_id, quantity} = req.body;
        const errors = await validate(animal_id, food_id, quantity);
        if(errors.length > 0){
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const mealUpdated = await mealRepository.update(old_animal_id, old_food_id, animal_id, food_id, quantity);
        res.json({
            success: true,
            AnimalId: mealUpdated.AnimalId,
            FoodId: mealUpdated.FoodId,
        });
    }
    catch (err) {
        next(err);
    }
});

router.get('/meals/:animal_id/:food_id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const { animal_id: animalId, food_id: foodId } = req.params;
        const meals = await mealRepository.getDetailsByAnimalIdAndFoodId(animalId, foodId);
        if (!meals) return res.status(404).send("Not found");
        res.render('./meal/details', { meals });
    }
    catch (err) {
        next(err);
    }
});

router.get('/meals/:animal_id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const id = req.params.animal_id;
        const meals = await mealRepository.getDetailsByAnimalId(id);
        if (!meals) return res.status(404).send("Not found");
        res.render('./meal/details', { meals });
    }
    catch (err) {
        next(err);
    }
});

router.get('/meals/delete/:animal_id/:food_id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const { animal_id: animalId, food_id: foodId } = req.params;
        const meal = await mealRepository.getByAnimalIdAndFoodId(animalId, foodId);
        if (!meal) return res.status(404).send("Not found");
        res.render('./meal/delete', { meal });
    }
    catch (err) {
        next(err);
    }
});

router.post('/meals/delete/:animal_id/:food_id', auth({isLoggedIn : true, roles : ['User', 'Zookeeper'], isSupervisedAnimal: false}), async (req, res, next) => {
    try {
        const { animal_id: animalId, food_id: foodId } = req.params;
        if (req.body.confirm === 'yes') {
            await mealRepository.deleteByAnimalIdAndFoodId(animalId, foodId);
        }
        res.redirect('/');
    }
    catch (err) {
        next(err);
    }
});

async function validate(animal_id, food_id, quantity){
    const errors = [];

    if(!animal_id){
        errors.push("The animal is required!");
    }else if(isNaN(Number(animal_id)) || Number(animal_id) < 1){
        errors.push("The animal id must be a positive number!");
    }

    if(!food_id){
        errors.push("The food is required!");
    }else if(isNaN(Number(food_id)) || Number(food_id) < 1){
        errors.push("The food id must be a positive number!");
    }

    const record = await mealRepository.getByAnimalIdAndFoodId(animal_id, food_id);
    if(record){
        errors.push("For this animal and food the permitted meal already exists!");
    }

    if (quantity === "") {
        errors.push("The quantity is required!");
    } else if (quantity.length > 50) {
        errors.push("The quantity must consist up to 50 characters!")
    }

    return errors;
}

module.exports = router;