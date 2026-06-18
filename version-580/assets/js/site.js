(() => {
    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let active = 0;

        const showSlide = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, current) => {
                slide.classList.toggle('is-active', current === active);
            });
            dots.forEach((dot, current) => {
                dot.classList.toggle('is-active', current === active);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        if (slides.length > 1) {
            window.setInterval(() => showSlide(active + 1), 5200);
        }
    }

    const filterInput = document.querySelector('[data-local-filter]');
    const filterList = document.querySelector('[data-filter-list]');
    if (filterInput && filterList) {
        const cards = Array.from(filterList.querySelectorAll('.movie-card'));
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';
        if (initial) {
            filterInput.value = initial;
        }

        const filterCards = () => {
            const keyword = filterInput.value.trim().toLowerCase();
            cards.forEach((card) => {
                const text = card.textContent.toLowerCase() + ' ' + Array.from(card.attributes).map((attr) => attr.value).join(' ').toLowerCase();
                card.classList.toggle('is-hidden', keyword !== '' && !text.includes(keyword));
            });
        };

        filterInput.addEventListener('input', filterCards);
        filterCards();
    }
})();
