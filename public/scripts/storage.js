// Alert if local storage is disabled
if (typeof localStorage === 'undefined')
    alert('Local storage is disabled, please enable it to use this page.');

// Store a map containing entered bingo codes
const savedBingoCodes = new Map();

/**
 * Add a bingo code to the map
 * @param {string} code 
 */
const addBingoCode = code => {
    const sha = sha256(code);
    savedBingoCodes.set(sha, code);
};

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
