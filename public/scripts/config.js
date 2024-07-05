const container = document.getElementById('container');

const generateQRCode = function (elemKey, qrCode) {
    const privateKey = 'https://oasc.bingo-list.com/#' + elemKey.value.trim();

    qrCode.makeCode(privateKey);
};

const showJsonPopup = () => {
    document.getElementById('generate').disabled = true;

    const sections = document.querySelectorAll('.section');
    const data = { cards: [] };

    for (const section of sections) {
        const cardTitle = section.querySelector('.card-title').value;
        const cardKey = section.querySelector('.private-key').value;
        const description = section.querySelector('.description').value;
        const select = section.querySelector('.card-type').value;
        const required = section.querySelector('.required').checked;
        const key = section.querySelector('.private-key').value;

        let hash = cardKey;

        if (select != 'QR Code' || !key)
            hash = cardTitle;

        data.cards.push([key, cardTitle, description, sha256(hash), select, required]);
    }

    const jsonData = JSON.stringify(data, null, 2);

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'popup';

    const instructions = document.createElement('p');
    instructions.textContent = 'Download or save the following code to the root of the project folder. Make sure to save the QR codes and private keys! They must be manually saved!';

    const textarea = document.createElement('textarea');
    textarea.value = jsonData;

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadButton = document.createElement('a');
    downloadButton.textContent = 'Download';
    downloadButton.href = url;
    downloadButton.download = 'config.json';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popup);
        URL.revokeObjectURL(url);
        document.getElementById('generate').disabled = false;
    });

    popup.appendChild(instructions);
    popup.appendChild(textarea);
    popup.appendChild(downloadButton);
    popup.appendChild(closeButton);

    document.body.appendChild(popup);
};

class PersistentInput {
    /**
     * Create a new persistent input
     * @param {string} id 
     */
    constructor(id, elem) {
        this.id = id;
        this.input = elem ?? document.getElementById(id);
        this.value = '';

        this.init();
    }

    init() {
        if (!this.input) {
            console.error(`Input with id ${this.id} not found`);
            return;
        }

        this.getState();

        this.input.addEventListener('input', () => {
            this.setState(this.input.value);
        });
    }

    /**
     * Save the input value to local storage
     */
    setState(value) {
        localStorage.setItem(`~${this.id}`, value);
        this.value = value;
        this.input.value = value;
    }

    /**
     * Load the input value from local storage
     */
    getState() {
        this.value = localStorage.getItem(`~${this.id}`);
        
        if (this.value === undefined || this.value === null) return;

        this.input.value = this.value;
        this.input.dispatchEvent(new Event('blur'));

        return this.value;
    }
}

class PersistentCheckbox extends PersistentInput {
    init() {
        if (!this.input)
            return console.error(`Checkbox with id ${this.id} not found`);

        this.getState();

        this.input.addEventListener('click', () => {
            this.setState(this.input.checked);
        });
    }

    /**
     * Save the input value to local storage
     */
    setState(value) {
        localStorage.setItem(`~${this.id}`, value);
        this.value = value;
        this.input.checked = value;
    }

    /**
     * Load the input value from local storage
     */
    getState() {
        this.value = localStorage.getItem(`~${this.id}`);
        this.input.checked = this.value === 'true';
        return this.value;
    }
}

class PersistentSelect extends PersistentInput {
    init() {
        if (!this.input)
            return console.error(`Select input with id ${this.id} not found`);

        this.getState();

        this.input.addEventListener('change', () => this.setState(this.input.value));
    }

    /**
     * Save the input value to local storage
     */
    setState(value) {
        localStorage.setItem(`~${this.id}`, value);
        this.value = value;
        this.input.value = value;
    }

    /**
     * Load the input value from local storage
     */
    getState() {
        this.value = localStorage.getItem(`~${this.id}`);
        this.input.value = this.value
        return this.value;
    }
}

const size = 4;

for (let i = 0; i < size * size; i++) {
    const section = document.createElement('div');
    section.className = 'section';

    // Create the content div
    const content = document.createElement('div');
    content.className = 'content';

    // Create input elements
    const cardTitle = document.createElement('input');
    cardTitle.type = 'text';
    cardTitle.placeholder = 'Card Title';
    cardTitle.className = 'card-title';
    cardTitle.id = `t${i}`;

    const description = document.createElement('input');
    description.type = 'text';
    description.placeholder = 'Description';
    description.className = 'description';
    description.id = `d${i}`;

    const privateKey = document.createElement('input');
    privateKey.type = 'text';
    privateKey.placeholder = 'Private Key';
    privateKey.className = 'private-key';
    privateKey.id = `k${i}`;
    
    const selectInput = document.createElement('select');
    selectInput.className = 'card-type';
    selectInput.id = `s${i}`;

    const bingoCardTypes = ['QR Code', 'Honor System', 'Given', 'User Input'];
    for (const type of bingoCardTypes) {
        const option = document.createElement('option');
        option.value = type;
        option.text = type;
        selectInput.appendChild(option);
    }

    

    const requiredLabel = document.createElement('label');
    const requiredCheckbox = document.createElement('input');
    requiredCheckbox.type = 'checkbox';
    requiredCheckbox.className = 'required';
    requiredCheckbox.id = `r${i}`;
    
    requiredLabel.appendChild(requiredCheckbox);
    requiredLabel.appendChild(document.createTextNode('Required'));

    // Append inputs to content div
    content.appendChild(cardTitle);
    content.appendChild(description);
    content.appendChild(privateKey);
    content.appendChild(selectInput);
    content.appendChild(requiredLabel);

    // Create QR code div
    const qrCodeDiv = document.createElement('div');
    qrCodeDiv.className = 'qrcode';

    // Bind QR code instance to input element
    const qrCode = new QRCode(qrCodeDiv, {
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    // Add event listeners
    privateKey.addEventListener('blur', () => generateQRCode(privateKey, qrCode) );
    privateKey.addEventListener('keypress', e => e.key === 'Enter' && generateQRCode(privateKey, qrCode));

    selectInput.addEventListener('change', () => {
        if (selectInput.value === 'QR Code') {
            privateKey.classList.remove('disabled');
            qrCodeDiv.classList.remove('disabled');
        } else {
            privateKey.classList.add('disabled');
            qrCodeDiv.classList.add('disabled');
        }
    });

    new PersistentInput(cardTitle.id, cardTitle);
    new PersistentInput(description.id, description);
    new PersistentInput(privateKey.id, privateKey);
    new PersistentCheckbox(requiredCheckbox.id, requiredCheckbox);
    new PersistentSelect(selectInput.id, selectInput);

    // Append content and QR code div to section
    section.appendChild(content);
    section.appendChild(qrCodeDiv);

    // Append section to container
    container.appendChild(section);
}