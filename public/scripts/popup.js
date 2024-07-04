const { openPopup, closePopup } = (() => {
    const elemPopup = document.getElementById('popup');
    const elemTask = document.getElementById('popup-task');
    const elemDesc = document.getElementById('popup-desc');

    const openPopup = elem => {
        if (elem) {
            elemTask.textContent = elem.textContent;
            elemDesc.textContent = elem.dataset.desc
        }

        elemPopup.classList.add('active');
        elemPopup.focus();
    };

    const closePopup = () => {    
        elemPopup.classList.remove('active');
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