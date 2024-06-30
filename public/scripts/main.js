// The debounce function receives our function as a parameter
const debounce = (fn) => {

    // This holds the requestAnimationFrame reference, so we can cancel it if we wish
    let frame;

    // The debounce function returns a new function that can receive a variable number of arguments
    return (...params) => {

        // If the frame variable has been defined, clear it now, and queue for next frame
        if (frame) {
            cancelAnimationFrame(frame);
        }

        // Queue our function call for the next frame
        frame = requestAnimationFrame(() => {

            // Call our function and pass any params we received
            fn(...params);
        });

    }
};


// Reads out the scroll position and stores it in the data attribute
// so we can use it in our stylesheets
const storeScroll = () => {
    document.documentElement.dataset.scroll = window.scrollY;
}

// Listen for new scroll events, here we debounce our `storeScroll` function
document.addEventListener('scroll', debounce(storeScroll), { passive: true });

// Update scroll position for first time
storeScroll();


const squares = document.querySelectorAll('.square');

// Add active 
document.getElementById('container-squares').addEventListener('click', function (e) {
    let elem = e.target;

    while (elem != null && elem != this) {
        if (elem.classList.contains('square')) {
             
            // Prevent event bubbling
            e.stopPropagation();

            // Remove active class from all squares
            squares.forEach(elem => elem.classList.remove('active'));
            
            // Add active class to the clicked square
            elem.classList.add('active');

            openPopup(elem);
            return;
        }

        elem = elem.parentElement
    }
});

// Register the service worker
if ('serviceWorker' in navigator) {

    // Wait for the 'load' event to not block other work
    window.addEventListener('load', async () => {

        // Try to register the service worker.
        try {
            // Register the service worker
            const reg = await navigator.serviceWorker.register('service-worker.js');

            console.log('Service worker registered!', reg);
        } catch (err) {
            console.log('Service worker registration failed: ', err);
        }
    });
}

const hash = window.location.hash.slice(1);
