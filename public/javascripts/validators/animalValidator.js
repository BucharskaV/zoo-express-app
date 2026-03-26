async function handleFormActions(event){
    event.preventDefault();
    const form = document.getElementById("animalForm");
    const id = form.dataset.id;

    const name = document.getElementById("name").value.trim();
    const breed = document.getElementById("breed").value.trim();
    const zookeeper_id = document.getElementById("zookeeper_id").value.trim();

    const errorsF = validate(zookeeper_id, name, breed);
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

    const url = id ? `/animals/${id}` : '/animals/add';
    const method = id ? 'PUT' : 'POST';
    const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({name, breed, zookeeper_id})
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

    window.location.href = `/animals/${jsonResp.id}`;
}

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
