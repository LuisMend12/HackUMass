// Add smooth transitions for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Handle home button click
    const homeButton = document.querySelector('.home-button');
    if (homeButton) {
        homeButton.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('http')) {
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(function() {
                    window.location = href;
                }, 300);
            }
        });
    }
});

