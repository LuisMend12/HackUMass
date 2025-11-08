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

    // Notification System
    if (currentPage.includes('monitoring.html')) {
        initNotificationSystem();
    }
});

// ============================================================================
// HARDWARE INTEGRATION POINT
// ============================================================================
// When hardware is implemented, replace the simulation code below with
// actual hardware data. The hardware should call processNewItem() function
// with the following structure:
//
// processNewItem({
//     type: 'Plastic Bottle',      // Item class/type detected by hardware
//     bin: 'BIN-001',              // Bin ID from hardware
//     weight: '0.5 kg',            // Weight from hardware sensor
//     recyclable: true,             // Whether item is recyclable
//     image: 'base64_image_data'    // Image captured by hardware camera
// });
//
// The system will automatically:
// - Show notification popup
// - Update dashboard statistics
// - Update pie chart by class
// - Save data to localStorage
// ============================================================================

// Notification System for Dashboard
function initNotificationSystem() {
    const notificationPopup = document.getElementById('notificationPopup');
    const notificationClose = document.getElementById('notificationClose');
    const notificationCheck = document.getElementById('notificationCheck');
    
    // Stats counters
    let totalItems = parseInt(localStorage.getItem('totalItems')) || 0;
    let recycledItems = parseInt(localStorage.getItem('recycledItems')) || 0;
    let todayItems = parseInt(localStorage.getItem('todayItems')) || 0;
    
    // Item counts by class - for pie chart
    // HARDWARE INTEGRATION: This will be automatically updated when hardware sends data
    let itemCountsByClass = JSON.parse(localStorage.getItem('itemCountsByClass')) || {
        'Plastic': 0,
        'Glass': 0,
        'Cardboard': 0,
        'Metal': 0,
        'Food Waste': 0,
        'Paper': 0,
        'Other': 0
    };
    
    // Color mapping for each item class in pie chart
    const classColors = {
        'Plastic': '#6f42c1',      // Purple
        'Glass': '#17a2b8',        // Cyan
        'Cardboard': '#ffc107',     // Yellow
        'Metal': '#357266',        // Myrtle Green
        'Food Waste': '#dc3545',    // Red
        'Paper': '#28a745',        // Green
        'Other': '#6c757d'         // Gray
    };
    
    // Update stats display
    function updateStats() {
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('recycledItems').textContent = recycledItems;
        document.getElementById('todayItems').textContent = todayItems;
        
        // Save to localStorage
        localStorage.setItem('totalItems', totalItems);
        localStorage.setItem('recycledItems', recycledItems);
        localStorage.setItem('todayItems', todayItems);
        localStorage.setItem('itemCountsByClass', JSON.stringify(itemCountsByClass));
    }
    
    // Update pie chart based on item counts by class
    // HARDWARE INTEGRATION: This function automatically updates when processNewItem() is called
    function updatePieChart() {
        const pieChartContent = document.getElementById('pieChartContent');
        const pieChartLegend = document.getElementById('pieChartLegend');
        
        if (!pieChartContent || !pieChartLegend) return;
        
        // Calculate total items
        const total = Object.values(itemCountsByClass).reduce((sum, count) => sum + count, 0);
        
        if (total === 0) {
            // Show empty state
            pieChartContent.innerHTML = '<p style="color: #357266; font-weight: 600; text-align: center; padding: 40px;">No items detected yet</p>';
            pieChartLegend.innerHTML = '';
            return;
        }
        
        // Clear previous content
        pieChartContent.innerHTML = '';
        pieChartLegend.innerHTML = '';
        
        // Calculate percentages and create segments
        let currentAngle = 0;
        const segments = [];
        
        for (const [className, count] of Object.entries(itemCountsByClass)) {
            if (count > 0) {
                const percentage = (count / total) * 100;
                const color = classColors[className] || classColors['Other'];
                
                segments.push({
                    className: className,
                    percentage: percentage,
                    count: count,
                    color: color,
                    startAngle: currentAngle,
                    endAngle: currentAngle + (percentage / 100) * 360
                });
                
                currentAngle += (percentage / 100) * 360;
            }
        }
        
        // Create SVG pie chart
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'pie-chart-svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        
        const radius = 45;
        const centerX = 50;
        const centerY = 50;
        
        // Create pie segments
        segments.forEach(segment => {
            const startAngleRad = (segment.startAngle * Math.PI) / 180;
            const endAngleRad = (segment.endAngle * Math.PI) / 180;
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            
            const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
            path.setAttribute('fill', segment.color);
            path.setAttribute('class', 'pie-segment');
            path.setAttribute('title', `${segment.className}: ${segment.count} items (${Math.round(segment.percentage)}%)`);
            svg.appendChild(path);
        });
        
        // Add center circle with total
        const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerCircle.setAttribute('cx', centerX);
        centerCircle.setAttribute('cy', centerY);
        centerCircle.setAttribute('r', radius * 0.6);
        centerCircle.setAttribute('fill', '#D9EDDA');
        svg.appendChild(centerCircle);
        
        pieChartContent.appendChild(svg);
        
        // Add center text
        const centerDiv = document.createElement('div');
        centerDiv.className = 'pie-center';
        centerDiv.innerHTML = `
            <div class="pie-center-value">${total}</div>
            <div class="pie-center-label">Total Items</div>
        `;
        pieChartContent.appendChild(centerDiv);
        
        // Create legend
        segments.forEach(segment => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <span class="legend-color" style="background-color: ${segment.color}"></span>
                <span class="legend-text">
                    <strong>${segment.className}</strong>
                    <span>${segment.count} items (${Math.round(segment.percentage)}%)</span>
                </span>
            `;
            pieChartLegend.appendChild(legendItem);
        });
    }
    
    // Item types for simulation (DEMO ONLY - Remove when hardware is connected)
    const itemTypes = [
        { type: 'Plastic Bottle', class: 'Plastic', bin: 'BIN-001', weight: '0.5 kg', recyclable: true, image: 'https://picsum.photos/150/150?random=1' },
        { type: 'Glass Jar', class: 'Glass', bin: 'BIN-002', weight: '0.8 kg', recyclable: true, image: 'https://picsum.photos/150/150?random=2' },
        { type: 'Cardboard Box', class: 'Cardboard', bin: 'BIN-003', weight: '0.3 kg', recyclable: true, image: 'https://picsum.photos/150/150?random=3' },
        { type: 'Aluminum Can', class: 'Metal', bin: 'BIN-001', weight: '0.2 kg', recyclable: true, image: 'https://picsum.photos/150/150?random=4' },
        { type: 'Food Waste', class: 'Food Waste', bin: 'BIN-004', weight: '1.2 kg', recyclable: false, image: 'https://picsum.photos/150/150?random=5' },
        { type: 'Paper', class: 'Paper', bin: 'BIN-003', weight: '0.1 kg', recyclable: true, image: 'https://picsum.photos/150/150?random=6' },
        { type: 'Plastic Bag', class: 'Plastic', bin: 'BIN-001', weight: '0.05 kg', recyclable: true, image: 'https://picsum.photos/150/150?random=7' },
        { type: 'Metal Scrap', class: 'Metal', bin: 'BIN-002', weight: '2.5 kg', recyclable: true, image: 'https://picsum.photos/150/150?random=8' }
    ];
    
    // Process new item - CALL THIS FUNCTION FROM HARDWARE
    // HARDWARE INTEGRATION: Replace simulation calls with hardware event listener
    function processNewItem(item) {
        // Extract class from item type (hardware should provide 'class' field directly)
        const itemClass = item.class || extractClassFromType(item.type) || 'Other';
        
        // Update item counts by class
        if (!itemCountsByClass[itemClass]) {
            itemCountsByClass[itemClass] = 0;
        }
        itemCountsByClass[itemClass]++;
        
        // Show notification popup
        showNotification(item);
        
        // Update all stats and charts
        updateStats();
        updatePieChart();
    }
    
    // Helper function to extract class from item type (for demo)
    function extractClassFromType(type) {
        const typeLower = type.toLowerCase();
        if (typeLower.includes('plastic')) return 'Plastic';
        if (typeLower.includes('glass')) return 'Glass';
        if (typeLower.includes('cardboard')) return 'Cardboard';
        if (typeLower.includes('metal') || typeLower.includes('aluminum')) return 'Metal';
        if (typeLower.includes('food') || typeLower.includes('waste')) return 'Food Waste';
        if (typeLower.includes('paper')) return 'Paper';
        return 'Other';
    }
    
    // Show notification popup
    function showNotification(item) {
        document.getElementById('notificationImage').src = item.image;
        document.getElementById('notificationType').textContent = item.type;
        document.getElementById('notificationBin').textContent = item.bin;
        document.getElementById('notificationWeight').textContent = item.weight;
        
        // Format time
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('notificationTime').textContent = timeString;
        
        // Show popup with animation
        notificationPopup.classList.add('show');
        
        // Update stats
        totalItems++;
        if (item.recyclable) {
            recycledItems++;
        }
        todayItems++;
    }
    
    // Close notification
    function closeNotification() {
        notificationPopup.classList.remove('show');
    }
    
    // Event listeners
    if (notificationClose) {
        notificationClose.addEventListener('click', closeNotification);
    }
    
    if (notificationCheck) {
        notificationCheck.addEventListener('click', closeNotification);
    }
    
    // Close on background click
    notificationPopup.addEventListener('click', function(e) {
        if (e.target === notificationPopup) {
            closeNotification();
        }
    });
    
    // Initialize stats and charts
    updateStats();
    updatePieChart();
    
    // ============================================================================
    // DEMO SIMULATION - REMOVE THIS WHEN HARDWARE IS CONNECTED
    // ============================================================================
    // Replace this section with hardware event listener:
    // hardware.addEventListener('itemDetected', (item) => processNewItem(item));
    // ============================================================================
    
    // Simulate items being thrown away (for demo)
    setTimeout(function() {
        const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        processNewItem(randomItem);
    }, 3000);
    
    // Show notifications every 8-15 seconds (demo only)
    setInterval(function() {
        if (!notificationPopup.classList.contains('show')) {
            const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            processNewItem(randomItem);
        }
    }, 8000 + Math.random() * 7000);
    
    // ============================================================================
    // EXPOSE FUNCTION FOR HARDWARE INTEGRATION
    // ============================================================================
    // Make processNewItem available globally so hardware can call it
    window.processNewItem = processNewItem;
    // ============================================================================
}

