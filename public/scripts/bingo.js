const winningCombos = [

    // Horizontal
    '1111000000000000',
    '0000111100000000',
    '0000000011110000',
    '0000000000001111',
    
    // Vertical
    '1000100010001000',
    '0100010001000100',
    '0010001000100010',
    '0001000100010001',

    // Diagonal
    '1000010000100001',
    '0001001001001000'
];

const cards = [];

const main = async function () {

    

}

main();

class BingoBoard {
    constructor (container) {
        this.container = container;
        
        this.cards = [];

        this.loadCards();
    }

    async loadCards () {
        const response = await fetch('/api/v1/config');
        const config = await response.json();

        for (const card of config.cards) {
            const [title, desc, sha256, required] = card;

            this.cards.push(new BingoCard(title, desc, sha256, required));
        }
    }

    checkCode (code) {
        const sha = sha256(code);
        const card = this.cards.find(card => card.sha256 === sha);

        if (card) {
            card.complete();
            return sha;
        }

        return false;
    }
}

class BingoCard {
    constructor (title, description, sha256, required=false, completed=false) {
        this.title = title;
        this.description = description;
        this.sha256 = sha256;

        this.required = required;
        this.completed = completed;

        this.elem = this.generateCard();
    }

    generateCard() {
        const card = document.createElement('div');
        card.classList.add('square');
        
        const cardInner = document.createElement('div');
        cardInner.classList.add('square-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('square-front');

        const title = document.createElement('p');
        
        title.textContent = this.title;

        title.setAttribute('data-desc', this.desc);
        title.setAttribute('tabindex', 0);

        if (this.required)
            card.classList.add('required');

        if (this.completed)
            card.classList.add('checked');

        card.appendChild(cardInner);
        cardInner.appendChild(cardFront);
        cardFront.appendChild(title);
        return card;
    }

    complete() {
        this.completed = true;
        this.elem.classList.add('checked');
    }

    checkCode(code) {
        const sha = sha256(code);
        if (sha === this.sha256) {
            this.complete();
            return sha;
        }

        return false
    }
}


