function clickAndSelect({ clickThreshold = 200, debug = false } = {}) {
    // Select all card elements
    const cards = document.querySelectorAll('.card');
    
    // Map to store mousedown timestamps
    const mouseDownMap = new WeakMap();

    cards.forEach(card => {
        // Disable default click behavior on links inside the card
        card.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', e => e.preventDefault());
        });

        // Mousedown: store timestamp
        card.addEventListener('mousedown', () => {
            mouseDownMap.set(card, Date.now());
        });

        // Mouseup: determine if it is a "click"
        card.addEventListener('mouseup', () => {
            const then = mouseDownMap.get(card);
            const now = Date.now();

            // Only proceed if the card was pressed for less than threshold
            if (then && (now - then < clickThreshold)) {
                const link = card.querySelector('a');
                if (link) {
                    window.location.href = link.href;
                    card.classList.add('visited');
                    if (debug) console.log(`Navigating to: ${link.href}`);
                }
            }

            // Clean up timestamp
            mouseDownMap.delete(card);
        });
    });
}

// Usage: call after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => clickAndSelect({ clickThreshold: 200, debug: true }));
