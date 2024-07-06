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
            if (card) card.complete();
        }

        if (this.checkBingo())
            this.handleBingo();
    }

    async loadCards () {
        const response = await fetch("/api/v1/config");
        const config = await response.json();

        for (const card of config) {
            const [title, desc, sha256, type, required] = card;
            const bc = new BingoCard(title, desc, sha256, type, required);

            this.container.appendChild(bc.elem);
            this.cards.push(bc);
        }
    }

    submitCode (code) {
        const sha = sha256(code);
        const card = this.checkHash(sha);

        if (card) {
            card.complete();
        
            addBingoCode(code, sha);
            saveBingoCodes();

            if (this.checkBingo())
                this.handleBingo();
        }

        return card;
    }

    handleBingo () {
        const duration = 2000; // Duration of the animation in milliseconds
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 15, spread: 300, ticks: 80, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
            }));
            confetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
            }));
        }, 250);
    }

    handleBlackout () {
        if (!localStorage.getItem("blackoutTime"))
            localStorage.setItem("blackoutTime", Date.now());

        document.documentElement.setAttribute('data-blackout', true)
    }

    openDialog (title, message) {
        const dialog = document.getElementById("dialog");
        const dialogTitle = document.getElementById("dialog-title");
        const dialogMessage = document.getElementById("dialog-message");

        dialogTitle.textContent = title;
        dialogMessage.textContent = message;

        dialog.showModal();
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
    constructor (title, description, sha256, type, required=false, completed=false) {
        this.title = title;
        this.description = description;
        this.sha256 = sha256;
        this.type = type;

        this.required = required;
        this.completed = completed;

        this.elem = this.generateCard();
    }

    generateCard() {
        const card = document.createElement("div");
        card.classList.add("square");

        card.setAttribute("data-desc", this.description);
        card.setAttribute("tabindex", 0);
        card.setAttribute("key", this.sha256);
        card.setAttribute("type", this.type);
        
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

        cardFront.appendChild(title);

        card.appendChild(cardInner);
        cardInner.appendChild(cardFront);

        return card;
    }

    complete() {
        if (this.completed) return;

        this.completed = true;
        this.elem.classList.add("checked");
    }
}


const bingoContainer = document.getElementById("container-squares");
const Session = new BingoBoard(bingoContainer);

// [...$0.querySelectorAll("p")].map(e => e.textContent.trim().toUpperCase().replaceAll(" ", "").replaceAll("\"", ""))
