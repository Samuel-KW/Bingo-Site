const { openPopup, closePopup } = (() => {
    const elemPopup = document.getElementById('popup');
    const elemTask = document.getElementById('popup-task');
    const elemDesc = document.getElementById('popup-desc');
    const elemCustom = document.getElementById('popup-custom');

    const closePopup = () => {    
        elemPopup.classList.remove('active');
    };

    const openPopup = elem => {
        if (!elem) return;

        const title = elem.textContent.trim();
        const desc = elem.dataset.desc.trim();

        const type = elem.getAttribute('type');
        const sha = elem.getAttribute('key');

        elemTask.textContent = title;
        elemDesc.textContent = desc;

        // Remove previous elements
        while (elemCustom.firstChild)
            elemCustom.removeChild(elemCustom.firstChild);

        // Disable user input if task is completed
        if (elem.classList.contains("checked")) {
            elemCustom.style.pointerEvents = "none";
            elemCustom.style.opacity = "0.5";
        } else {
            elemCustom.style.pointerEvents = "auto";
            elemCustom.style.opacity = "1";
        }

        switch (type) {
            case "Given":
            case "Honor System":
                const button = document.createElement("button");
                button.classList.add("square-complete");
                button.textContent = "Complete";
                button.addEventListener('click', () => {
                    button.disabled = true;
                    elem.classList.add("checked");
                    addHonorCode(sha);
                    saveBingoCodes();
                    closePopup();
                });
                
                elemCustom.appendChild(button);

                break;

            case "User Input":
                const input = document.createElement("textarea");
                input.placeholder = "Enter your response...";
                input.maxLength = 128;
                input.classList.add("square-input");
                elemCustom.appendChild(input);

                const inpButton = document.createElement("button");
                inpButton.classList.add("square-complete");
                inpButton.textContent = "Complete";
                inpButton.addEventListener('click', () => {

                    // Remove newlines and semicolons
                    const resp = input.value.trim().replace(/\n/g, ' ').replace(/;/g, '');

                    // Verify content
                    if (resp.length < 3) return;

                    inpButton.disabled = true;
                    elem.classList.add("checked");

                    addUserInput(resp, sha);
                    saveBingoCodes();
                    closePopup();

                });
                
                elemCustom.appendChild(inpButton);
                break;

            case "QR Code":
                const instructions = document.createElement("p");
                instructions.textContent = "Scan the QR code to complete this task.";
                instructions.classList.add("instructions");
                elemCustom.appendChild(instructions);
                break;

            default:
                console.error("Invalid card type:", type);
        }

        elemPopup.classList.add('active');
        elemPopup.focus();
    };

    

    document.addEventListener('click', (e) => {
        
        // If user clicks outside popup
        if (!elemPopup.contains(e.target))
            closePopup();
    });

    return {
        openPopup,
        closePopup
    };
})();

function submitName () {
    
    const username = this.querySelector('input').value.trim();
    const uuid = username.replace(/[^a-zA-Z0-9]/g, '') + '~' + Date.now().toString(36);

    document.cookie = 'name=' + uuid + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    
    fetch('/data/')
        .then(response => response.json())
        .then(data => {
            console.log('Saved username:', data);
        })
        .catch(error => {
            console.error('Error saving username:', error);
        });
}