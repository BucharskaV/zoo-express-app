async function handleFormActions(event){
    event.preventDefault();
    const form = document.getElementById("zookeeperForm");
    const id = form.dataset.id;

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const department = document.getElementById("department").value.trim();

    const errorsF = validate(firstName, lastName, department);
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

    const url = id ? `/zookeepers/${id}` : '/zookeepers/add';
    const method = id ? 'PUT' : 'POST';
    const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({firstName, lastName, department})
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

    window.location.href = `/zookeepers/${jsonResp.id}`;
}

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