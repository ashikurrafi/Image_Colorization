const scrollUpButton = document.getElementById('scrollUpButton');
            
window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
        scrollUpButton.classList.remove('hidden');
    } else {
        scrollUpButton.classList.add('hidden');
    }
});

scrollUpButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});