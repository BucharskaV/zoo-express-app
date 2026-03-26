async function handleFormActions(event){
    event.preventDefault();
    const form = document.getElementById("foodForm");
    const id = form.dataset.id;

    const name = document.getElementById("name").value.trim();
    const calories = document.getElementById("calories").value.trim();

    const errorsF = validate(name, calories);
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

    const url = id ? `/food/${id}` : '/food/add';
    const method = id ? 'PUT' : 'POST';
    const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({name, calories})
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

    window.location.href = `/food/${jsonResp.id}`;
}

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
