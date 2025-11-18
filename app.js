/*----Grabbing ALl needed form elements----*/
const form = document.getElementById('signupForm');//Using Form ID can find it and use it as a variable for later use

//This variable will hold references of all input fields to be easily used
const fields = {
    name: document.getElementById('name'),  //Full Name Input
    email: document.getElementById('email'), //Email Input
    password: document.getElementById('password'), //Password Input
    phone: document.getElementById('phone'), //Phone Input
    companyToggle: document.getElementById('companyToggle'), //Checkbox toggle for company 
    company: document.getElementById('company'), //company name input
    hp: document.getElementById('hp') //hidden honeypot field (to stop spam bots)
};

//this variable will hold the location for error messages to be displayed
const errorEls = {
    name: document.getElementById('nameError'),
    email: document.getElementById('emailError'),
    password: document.getElementById('passwordError'),
    phone: document.getElementById('phoneError'),
    company: document.getElementById('companyError')
};

//important sections of the form
const companySection = document.getElementById('companyFields'); //The company section which can be hidden or visible
const summary = document.getElementById('error-summary'); //A red box to display all errors at the top
const clearBtn = document.getElementById('clearBtn'); //Clear button for form

/*----Show/Hide Company Fields when checkbox is toggled on or off----*/

//when clicking the toggle box for company
fields.companyToggle.addEventListener('change', () => {
    //show or hide company name field
    companySection.hidden = !fields.companyToggle.checked;
    //if selected make company name required
    if (!companySection.hidden) {
        fields.company.setAttribute('required', '');
    } else {
        //if not selected, remove requirements and clear error
        fields.company.removeAttribute('required');
        errorEls.company.textContent = '';
    }
});


/*----Debounce: Prevent To manyu validations when typing fast----*/

//function that waits a short time before running validation checks so no browser slow down
function debounce(fn, wait = 250) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
    };
}

/*-----Validation Functions for each field-----*/

//name field validation
function validateName() {
    const el = fields.name;
    el.setCustomValidity(''); //to clear old errors

    //check if empty name field
    if (el.validity.valueMissing) {
        el.setCustomValidity('Name is Required.');
    }
    //check if name too short
    else if (el.value.trim().length < 2) {
        el.setCustomValidity('Name must be at least 2 characters.');

    }
    //show error message below field
    errorEls.name.textContent = el.validationMessage;

    //mark field as invalid turning red
    el.setAttribute('aria-invalid', String(!el.checkValidity()));
    //returns true if valid, false if not
    return el.checkValidity();

}

//Function to validate the email field
function validateEmail() {
    const el = fields.email;
    el.setCustomValidity('');

    if (el.validity.valueMissing) {
        el.setCustomValidity('Email is required.');
    } else if (el.validity.typeMismatch) {
        el.setCustomValidity('Enter a valid email address.');
    }

    errorEls.email.textContent = el.validationMessage;
    el.setAttribute('aria-invalid', String(!el.checkValidity()));
    return el.checkValidity();
}

// Password field Validation
function validatePassword() {
    const el = fields.password;
    el.setCustomValidity('');

    if (el.validity.valueMissing) {
        el.setCustomValidity('Password is required.');
    } else if (el.validity.tooShort) {
        el.setCustomValidity('Password must be at least 8 characters.');
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(el.value)) {
        el.setCustomValidity('Add upper case, lower case, and a number.');
    }

    errorEls.password.textContent = el.validationMessage;
    el.setAttribute('aria-invalid', String(!el.checkValidity()));
    return el.checkValidity();
}

// Phone field Validation
function validatePhone() {
    const el = fields.phone;
    el.setCustomValidity('');

    // Only check if user entered something
    if (el.value && !el.checkValidity()) {
        el.setCustomValidity('Phone format example: +358 44 123 4567');
    }

    errorEls.phone.textContent = el.validationMessage;
    el.setAttribute('aria-invalid', String(!el.checkValidity()));
    return el.checkValidity();
}

// Company name Validation if selected earlier
function validateCompany() {
    if (companySection.hidden) return true; // Skip if not shown

    const el = fields.company;
    el.setCustomValidity('');

    if (el.validity.valueMissing) {
        el.setCustomValidity('Company name is required when registering as a company.');
    }

    errorEls.company.textContent = el.validationMessage;
    el.setAttribute('aria-invalid', String(!el.checkValidity()));
    return el.checkValidity();
}


/*-----Validation to check as user types-----*/

// For each field, validation runs as there is input
fields.name.addEventListener('input', () => { debounce(validateName, 150)(); buildSummary(); });

fields.email.addEventListener('input', () => { debounce(validateEmail, 150)(); buildSummary(); });

fields.password.addEventListener('input', () => { debounce(validatePassword, 150)(); buildSummary(); });

fields.phone.addEventListener('input', () => { debounce(validatePhone, 150)(); buildSummary(); });

fields.company.addEventListener('input', () => { debounce(validateCompany, 150)(); buildSummary(); });

/*----Illustrate all errors, at top of page and error summary----*/

//Function to check all fields, and if any issues, displays the error messages together
function buildSummary() {
    const problems = [];

    if (!validateName()) problems.push('Name: ' + fields.name.validationMessage);
    if (!validateEmail()) problems.push('Email: ' + fields.email.validationMessage);
    if (!validatePassword()) problems.push('Password: ' + fields.password.validationMessage);
    if (!validatePhone()) problems.push('Phone: ' + fields.phone.validationMessage);
    if (!companySection.hidden && !validateCompany()) problems.push('Company: ' + fields.company.validationMessage);

    // If there are errors, show the red summary box
    if (problems.length) {
        summary.classList.remove('visually-hidden');
        summary.innerHTML = 'Please fix the following: ' + problems.join('<br>');
    } else {
        // If no errors, hide the summary box
        summary.classList.add('visually-hidden');
        summary.innerHTML = '';
    }
}


/*----Continuously saves data in form into storage-----*/

// This key is used to store data in the browser
const STORAGE_KEY = 'ws5-signup';

// Function that saves the current form data to browser storage
function saveDraft() {
    const data = {
        name: fields.name.value,
        email: fields.email.value,
        phone: fields.phone.value,
        password: fields.password.value,
        companyToggle: fields.companyToggle.checked,
        company: fields.company.value
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    console.log('Saved Draft:', data); // Displays the draft in DevTools Console
}

// Function will Load saved data on page reopen
function restoreDraft() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return; // No saved data will show empty

        const data = JSON.parse(raw);

        fields.name.value = data.name || '';
        fields.email.value = data.email || '';
        fields.phone.value = data.phone || '';
        fields.password.value = data.password || '';
        fields.companyToggle.checked = Boolean(data.companyToggle);
        companySection.hidden = !fields.companyToggle.checked;
        fields.company.value = data.company || '';

        console.log('Restored Draft:', data);
    } catch (e) {
        console.error('Restore Error:', e);
    }
}

// Save data every time user types or clicks
['input', 'change'].forEach(evt => form.addEventListener(evt, debounce(saveDraft, 300)));

// Call function to load saved data when opening page
restoreDraft();


/*----Reseting all info in form with clear button----*/

clearBtn.addEventListener('click', () => {
    form.reset(); //This will clear all input fields
    localStorage.removeItem(STORAGE_KEY); //This deletes saved data
    Object.values(errorEls).forEach(e => e.textContent = ''); //This will clear error messages
    companySection.hidden = true; //This will hide company fields
    buildSummary(); //changed error summary
    console.log('Form Cleared'); //Logs into console that was pressed and cleared
});


/*----Submission button, to save data and last validate checks----*/

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop normal form submit to then use custom

    //Check all fields again
    const isValid = validateName() && validateEmail() && validatePassword() && validatePhone() && validateCompany();
    buildSummary();

    //If not valid, will highlight focus on first error
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (!isValid && firstInvalid) {
        firstInvalid.focus();
        return;
    }

    //If hidden field has text from bot being detected will block submit
    if (fields.hp.value) {
        alert('Submission blocked due to bot detection.');
        return;
    }

    //Formulates all data to be sent
    const payload = {
        name: fields.name.value,
        email: fields.email.value,
        phone: fields.phone.value,
        company: fields.companyToggle.checked ? fields.company.value : '',
        time: new Date().toISOString()
    };

    try {
        // Send data to a demo server, is not a real database
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        alert('Submitted successfully. Demo ID: ' + data.id);
        console.log('Submitted Data:', payload);
    } catch (error) {
        alert('Network error occurred. Please try again.');
        console.error('Submission Error:', error);
    }
});


/*----- Optional Phone Normalization-----*/

// When user leaves the phone number input field, will run some code to clean up and format properly
fields.phone.addEventListener('blur', () => {
    
    // Remove all spaces, dashes, etc. — keep only numbers and +
    const digits = fields.phone.value.replace(/[^0-9+]/g, '');

    // If starts with 0, replace with Finland code +358
    if (digits.startsWith('0')) {
        fields.phone.value = '+358' + digits.slice(1);
    }
    // If already has +, keep it
    else if (digits.startsWith('+')) {
        fields.phone.value = digits;
    }
    // Otherwise, add +358
    else {
        fields.phone.value = '+358' + digits;
    }

    console.log('Normalised Phone:', fields.phone.value); //Will show in DevTools
});