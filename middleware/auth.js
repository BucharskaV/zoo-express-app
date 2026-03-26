const animalRepository = require('../repositories/animalRepository');

function getAnimalId(req){
    return req.params.id || req.params.animal_id || req.body.animal_id;
}

function auth(options = {}){
    return async (req, res, next) => {
        const {isLoggedIn, roles, isSupervisedAnimal} = options;

        if(isLoggedIn === true && !req.session.username){
            return next({status: 403, message: "Only logged in users can use this functionality!"});
        }

        if(isLoggedIn === false && req.session.username){
            return next({status: 403, message: "Only logged out users can use this functionality!"});
        }

        if(Array.isArray(roles) && roles.length > 0){
            if(!roles.includes(req.session.role)){
                return next({status: 403, message: `Only roles [${roles.join(', ')}] can use this functionality!`});
            }
        }

        if(isSupervisedAnimal && req.session.role === 'Zookeeper'){
            const animal_id = getAnimalId(req);
            if(!animal_id){
                return next({status: 400, message: "The animal id is missing!"});
            }

            const animal = await animalRepository.getById(animal_id);
            if(!animal){
                return next({status: 404, message: "The animal is not found!"});
            }

            if(animal.Zookeeper_Id !== req.session.zookeeper_id){
                return next({status: 403, message: "The animal is not supervised by you!"});
            }
        }

        next();
    }
}

module.exports = {auth};