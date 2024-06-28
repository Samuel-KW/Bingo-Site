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

        if (this.checkBingo())
            this.handleBingo();
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

            if (this.checkBingo())
                this.handleBingo();
        }

        return card;
    }

    handleBingo () {
        alert("Congrats! Bingo achieved!");
    }

    handleBlackout () {
        localStorage.setItem("blackoutTime", Date.now());
        alert("Congrats! You achieved a blackout!");
    }

    checkHash (sha) {
        const card = this.cards.find(card => card.sha256 === sha);

        return card;
    }

    getCompleted () {
        const bools = this.cards.map(card => !!card.completed);
        return bools.join("");
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

    checkBingo () {
        const size = Math.sqrt(this.cards.length);

        if (this.cards.every(card => card.completed)) {
            this.handleBlackout();
            return true;
        }

        return this.checkBingoRequired() &&
            (this.checkBingoHorizontal(size) || this.checkBingoVertical(size) || this.checkBingoDiagonal(size));
    }

    checkBingoRequired () {
        const required = this.cards.filter(card => card.required);
        return required.every(card => card.completed);
    }

    checkBingoHorizontal (size) {
        for (let i = 0; i < size; i++) {
            const start = i * size;
            const row = this.cards.slice(start, start + size);

            if (row.every(card => card.completed))
                return true;
        }

        return false;
    }

    checkBingoVertical (size) {
        for (let i = 0; i < size; i++) {
            const col = this.cards.filter((_, j) => j % size === i);

            if (col.every(card => card.completed))
                return true;
        }

        return false;
    }

    checkBingoDiagonal (size) {
        const diag1 = this.cards.filter((_, i) => i % (size + 1) === 0);
        const diag2 = this.cards.filter((_, i) => i % (size - 1) === 0 && i > 0 && i < size * size - 1);

        return diag1.every(card => card.completed) || diag2.every(card => card.completed)
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
