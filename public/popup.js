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

