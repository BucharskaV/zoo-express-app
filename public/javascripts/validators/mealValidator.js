async function handleFormActions(event){
    event.preventDefault();
    const form = document.getElementById("mealForm");
    const old_animal_id = form.dataset.old_animal_id;
    const old_food_id = form.dataset.old_food_id;

    const quantity = document.getElementById("quantity").value.trim();
    const animal_id = document.getElementById("animal_id").value.trim();
    const food_id = document.getElementById("food_id").value.trim();

    const errorsF = validate(animal_id, food_id, quantity);
    const fErrors = document.getElementById("fErrors");
    fErrors.innerHTML = "";

    if(errorsF.length > 0){
        errorsF.forEach(e => {
            const li = document.createElement("li");
            li.textContent = e;
            fErrors.appendChild(li);
        });
        return;
    }

    const url = old_animal_id ? `/meals/${old_animal_id}/${old_food_id}` : '/meals/add';
    const method = old_animal_id ? 'PUT' : 'POST';
    const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({quantity, animal_id, food_id})
    });

    const jsonResp = await resp.json();
    if(!jsonResp.success){
        fErrors.innerHTML = "";
        for(const err of Object.values(jsonResp.errors)){
            const li = document.createElement("li");
            li.textContent = err;
            fErrors.appendChild(li);
        }
        return;
    }

    window.location.href = `/meals/${jsonResp.AnimalId}/${jsonResp.FoodId}`;
}

function validate(animal_id, food_id, quantity){
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

    if(quantity === ""){
        errors.push("The quantity is required!");
    }
    else if(quantity.length > 50){
        errors.push("The quantity must consist up to 50 characters!")
    }

    return errors;
}
