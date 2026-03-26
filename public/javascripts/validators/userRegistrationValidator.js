async function handleFormActions(event){
    event.preventDefault();
    const form = document.getElementById("userForm");
    const action = form.dataset.action;

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    let role = "";
    let inputs = {};
    let url = "";

    switch (action){
        case "Registration":
            addErrors(username, password);
            role = 'User';
            inputs = {username, password, role};
            url = '/register';
            break;
        case "Login":
            inputs = {username, password};
            url = '/login';
            break;
        case "Registration as zookeeper":
            addErrors(username, password);
            const zookeeper_id = document.getElementById("zookeeper_id").value.trim();
            role = 'Zookeeper';
            inputs = {username, password, zookeeper_id, role};
            url = '/register-zookeeper';
            break;
    }

    const resp = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
        credentials: 'same-origin'
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

    window.location.href = `/`;
}

function addErrors(username, password){
    const errorsF = validate(username, password);
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
}

function validate(username, password){
    const errors = [];

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