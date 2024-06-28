const winningCombos = [

    // Horizontal
    "1111000000000000",
    "0000111100000000",
    "0000000011110000",
    "0000000000001111",
    
    // Vertical
    "1000100010001000",
    "0100010001000100",
    "0010001000100010",
    "0001000100010001",

    // Diagonal
    "1000010000100001",
    "0001001001001000"
];


class BingoBoard {
    constructor (container) {

        this.container = container;
        this.cards = [];

        this.init();

    }

    async init () {
        await this.loadCards();
        
        window.addEventListener("hashchange", () => this.handleHashChange());
        this.handleHashChange();

        const codes = loadBingoCodes();
        for (const [sha, code] of codes) {
            const card = this.checkHash(sha);
            card.complete();
        }
    }

    async loadCards () {
        const response = await fetch("/api/v1/config");
        const config = await response.json();

        for (const card of config.cards) {
            const [title, desc, sha256, required] = card;
            const bc = new BingoCard(title, desc, sha256, required);

            this.container.appendChild(bc.elem);
            this.cards.push(bc);
        }
    }

    submitCode (code) {
        const sha = sha256(code);
        const card = this.checkHash(sha);

        if (card) {
            card.complete();
        
            addBingoCode(code);
            saveBingoCodes();
        }

        return card;
    }

    checkHash (sha) {
        const card = this.cards.find(card => card.sha256 === sha);

        return card;
    }

    getCompleted () {
        const bools = this.cards.map(card => !!card.completed);
        return bools.join("");
    }

    checkBingo () {
        const completed = this.getCompleted();
        return winningCombos.includes(completed);
    }

    updateCards () {
        for (const card of this.cards) {
            if (savedBingoCodes.has(card.sha256))
                card.complete();
        }
    }

    handleHashChange () {
        const code = window.location.hash.slice(1);
        window.location.hash = "";

        if (code.length > 0) {
            const valid = this.submitCode(code);

            if (valid)
                console.log("Loaded bingo code from hash:", code);
        }
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
        const card = document.createElement("div");
        card.classList.add("square");

        card.setAttribute("data-desc", this.description);
        card.setAttribute("tabindex", 0);
        
        const cardInner = document.createElement("div");
        cardInner.classList.add("square-inner");

        const cardFront = document.createElement("div");
        cardFront.classList.add("square-front");

        const title = document.createElement("p");
        title.textContent = this.title;

        if (this.required)
            card.classList.add("required");

        if (this.completed)
            card.classList.add("checked");

        card.appendChild(cardInner);
        cardInner.appendChild(cardFront);
        cardFront.appendChild(title);

        return card;
    }

    complete() {
        if (this.completed) return;

        this.completed = true;
        this.elem.classList.add("checked");
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


const bingoContainer = document.getElementById("container-squares");
const Session = new BingoBoard(bingoContainer);

// [...$0.querySelectorAll("p")].map(e => e.textContent.trim().toUpperCase().replaceAll(" ", "").replaceAll("\"", ""))
