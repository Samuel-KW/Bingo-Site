// Alert if local storage is disabled
if (typeof localStorage === 'undefined')
    alert('Local storage is disabled, please enable it to use this page.');

class PersistentInput {
    /**
     * Create a new persistent input
     * @param {string} id 
     */
    constructor(id) {
        this.id = id;
        this.input = document.getElementById(id);
        this.value = localStorage.getItem(`-${id}`);
    }

    init() {
        if (!this.input) {
            console.error(`Input with id ${this.id} not found`);
            return;
        }

        if (this.value !== null)
            this.input.value = this.value;

        this.input.addEventListener('input', () => {
            this.setState(this.input.value);
        });
    }

    /**
     * Save the input value to local storage
     */
    setState(value) {
        localStorage.setItem(`-${this.id}`, value);
        this.value = value;
        this.input.value = value;
    }

    /**
     * Load the input value from local storage
     */
    getState() {
        this.value = localStorage.getItem(`-${this.id}`);
        this.input.value = this.value;
        return this.value;
    }
}

class PersistentCheckbox extends PersistentInput {
    init() {
        if (!this.input) {
            console.error(`Checkbox with id ${this.id} not found`);
            return;
        }

        if (this.value === 'true')
            this.input.checked = true;

        this.input.addEventListener('click', () => {
            this.setState(this.input.checked);
        });
    }

    /**
     * Save the input value to local storage
     */
    setState(value) {
        localStorage.setItem(`-${this.id}`, value);
        this.value = value;
        this.input.checked = value;
    }

    /**
     * Load the input value from local storage
     */
    getState() {
        this.value = localStorage.getItem(`-${this.id}`);
        this.input.checked = this.value === 'true';
        return this.value;
    }
}

// Store a map containing entered bingo codes
const savedBingoCodes = new Map();

/**
 * Add a bingo code to the map
 * @param {string} code 
 */
const addBingoCode = (code, sha) => {
    sha = sha || sha256(code);
    document.cookie = sha + '=; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    
    // Save the code to the server
    sendData();

    savedBingoCodes.set(sha, code);
};

const addUserInput = (input, sha) => {
    document.cookie = sha + '=' + input + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    
    // Save the code to the server
    sendData();

    savedBingoCodes.set(sha, input);
};

const addHonorCode = sha => {
    document.cookie = sha + '=1; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    
    // Save the code to the server
    sendData();

    savedBingoCodes.set(sha, true);
};

const sendData = () => {
    return fetch('/data/')
        .then(response => response.json())
        .then(data => console.log('Saved data:', data))
        .catch(err => console.error('Error saving data:', err));
}

/**
 * Save bingo codes to local storage
 */
const saveBingoCodes = () => {
    const codes = [...savedBingoCodes];

    localStorage.setItem('bingoCodes', JSON.stringify(codes));
    console.log('Saved bingo codes to local storage:', codes);
};

/**
 * Load bingo codes from local storage
 * @returns {Map<string, string>} savedBingoCodes
 */
const loadBingoCodes = () => {
    try {
        const codes = JSON.parse(localStorage.getItem('bingoCodes'));

        for (const [sha, code] of codes) 
            savedBingoCodes.set(sha, code);
    
        console.log('Loaded bingo from local storage:', savedBingoCodes);

    } catch (e) {
        localStorage.setItem('bingoCodes', '[]');
    }

    return savedBingoCodes;
};

/**
 * Set a cookie with a name and value
 * @param {string} name 
 * @param {string} value 
 */
const setCookie = (name, value) => {
    document.cookie = `${name}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
};

/**
 * Get a cookie by name
 * @param {string} name 
 * @returns {string | null} cookie value
 */
const getCookie = name => {
    const cookie = document.cookie.split(";")
        .find(item => item.trim().startsWith(name));

    return cookie ? cookie.slice(cookie.indexOf('=') + 1) : null;
};

// Check if user is signed in
getCookie('name') || document.getElementById('sign-in').showModal();

// Make inputs persistent
const checkboxes = ['menu-toggle'];

for (const id of checkboxes) {
    const input = new PersistentCheckbox(id);
    input.init();
}

// Load UUID from cookie
const uuid = getCookie('name');
document.getElementById('uuid').textContent = uuid;