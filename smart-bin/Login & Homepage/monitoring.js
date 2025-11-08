// Sidebar Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const contentWrapper = document.querySelector('.content-wrapper');
    
    // Set active nav item based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'monitoring.html';
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPage.includes(href.split('/').pop())) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Check if sidebar state is saved in localStorage
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        contentWrapper.classList.add('sidebar-collapsed');
    }
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        contentWrapper.classList.toggle('sidebar-collapsed');
        
        // Save state to localStorage
        const collapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', collapsed);
    });
    
    // Add smooth transitions for sidebar navigation links
    const navLinks = document.querySelectorAll('.sidebar a[href]:not([href^="#"]):not([href^="http"])');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('http')) {
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(function() {
                    window.location = href;
                }, 300);
            }
        });
    });
});

