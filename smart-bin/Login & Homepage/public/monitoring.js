document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const contentWrapper = document.querySelector('.content-wrapper');

    const currentPage = window.location.pathname.split('/').pop() || 'monitoring.html';
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        const href = item.getAttribute('href');
        item.classList.toggle('active', href && currentPage.includes(href.split('/').pop()));
    });

    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    sidebar.classList.toggle('collapsed', isCollapsed);
    contentWrapper.classList.toggle('sidebar-collapsed', isCollapsed);

    sidebarToggle.addEventListener('click', () => {
        const collapsed = sidebar.classList.toggle('collapsed');
        contentWrapper.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', collapsed);
    });

    document.querySelectorAll('.sidebar a[href]:not([href^="#"]):not([href^="http"])')
        .forEach(link => link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href) {
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(() => window.location = href, 300);
            }
        }));

    if (currentPage.includes('monitoring.html')) initNotificationSystem();
});

// ======================================
// Notification & Dashboard System
// ======================================
function initNotificationSystem() {
    const notificationPopup = document.getElementById('notificationPopup');
    const notificationClose = document.getElementById('notificationClose');
    const notificationCheck = document.getElementById('notificationCheck');

    let totalItems = parseInt(localStorage.getItem('totalItems')) || 0;
    let recycledItems = parseInt(localStorage.getItem('recycledItems')) || 0;
    let todayItems = parseInt(localStorage.getItem('todayItems')) || 0;
    let itemCountsByClass = JSON.parse(localStorage.getItem('itemCountsByClass')) || {
        Plastic: 0, Glass: 0, Cardboard: 0, Metal: 0, 'Food Waste': 0, Paper: 0, Other: 0
    };

    const classColors = {
        Plastic: '#6f42c1', Glass: '#17a2b8', Cardboard: '#ffc107', Metal: '#357266',
        'Food Waste': '#dc3545', Paper: '#28a745', Other: '#6c757d'
    };

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

    // ===========================
    // Stats & Pie Chart
    // ===========================
    function updateStats() {
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('recycledItems').textContent = recycledItems;
        document.getElementById('todayItems').textContent = todayItems;
        localStorage.setItem('totalItems', totalItems);
        localStorage.setItem('recycledItems', recycledItems);
        localStorage.setItem('todayItems', todayItems);
        localStorage.setItem('itemCountsByClass', JSON.stringify(itemCountsByClass));
    }

    function updatePieChart() {
        const pieChartContent = document.getElementById('pieChartContent');
        const pieChartLegend = document.getElementById('pieChartLegend');
        if (!pieChartContent || !pieChartLegend) return;

        const total = Object.values(itemCountsByClass).reduce((a, b) => a + b, 0);
        pieChartContent.innerHTML = '';
        pieChartLegend.innerHTML = '';
        if (total === 0) return pieChartContent.innerHTML = '<p style="text-align:center;padding:40px;color:#357266;font-weight:600;">No items detected yet</p>';

        let currentAngle = 0;
        const segments = Object.entries(itemCountsByClass).filter(([, count]) => count > 0).map(([name, count]) => {
            const percentage = (count / total) * 100;
            const segment = { className: name, count, percentage, color: classColors[name] || classColors.Other, startAngle: currentAngle, endAngle: currentAngle + (percentage / 100) * 360 };
            currentAngle = segment.endAngle;
            return segment;
        });

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'pie-chart-svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        const r = 45, cx = 50, cy = 50;

        segments.forEach(s => {
            const x1 = cx + r * Math.cos(s.startAngle * Math.PI / 180);
            const y1 = cy + r * Math.sin(s.startAngle * Math.PI / 180);
            const x2 = cx + r * Math.cos(s.endAngle * Math.PI / 180);
            const y2 = cy + r * Math.sin(s.endAngle * Math.PI / 180);
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${s.endAngle - s.startAngle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`);
            path.setAttribute('fill', s.color);
            path.setAttribute('title', `${s.className}: ${s.count} items (${Math.round(s.percentage)}%)`);
            svg.appendChild(path);
        });

        const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerCircle.setAttribute('cx', cx); centerCircle.setAttribute('cy', cy);
        centerCircle.setAttribute('r', r * 0.6); centerCircle.setAttribute('fill', '#D9EDDA');
        svg.appendChild(centerCircle);
        pieChartContent.appendChild(svg);

        const centerDiv = document.createElement('div');
        centerDiv.className = 'pie-center';
        centerDiv.innerHTML = `<div class="pie-center-value">${total}</div><div class="pie-center-label">Total Items</div>`;
        pieChartContent.appendChild(centerDiv);

        segments.forEach(s => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `<span class="legend-color" style="background-color:${s.color}"></span>
                                    <span class="legend-text"><strong>${s.className}</strong> <span>${s.count} items (${Math.round(s.percentage)}%)</span></span>`;
            pieChartLegend.appendChild(legendItem);
        });
    }

    // ===========================
    // Process New Item
    // ===========================
    function processNewItem(item) {
        const itemClass = item.class || extractClassFromType(item.type);
        itemCountsByClass[itemClass] = (itemCountsByClass[itemClass] || 0) + 1;

        showNotification(item);
        updateStats();
        updatePieChart();
    }

    function extractClassFromType(type) {
        const t = type.toLowerCase();
        if (t.includes('plastic')) return 'Plastic';
        if (t.includes('glass')) return 'Glass';
        if (t.includes('cardboard')) return 'Cardboard';
        if (t.includes('metal') || t.includes('aluminum')) return 'Metal';
        if (t.includes('food') || t.includes('waste')) return 'Food Waste';
        if (t.includes('paper')) return 'Paper';
        return 'Other';
    }

    // ===========================
    // Notification & Sound
    // ===========================
    const celebrationSound = new Audio('/sounds/GAMECas-A_bright,_exciting_c-Elevenlabs.mp3');
    celebrationSound.preload = 'auto';
    window.celebrationSound = celebrationSound;

    const announcerQueue = [];
    let isAnnouncerPlaying = false;

    function unlockAudio() {
        window.celebrationSound.play().catch(() => {});
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    }
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    async function fetchAnnouncerAudio(text) {
        const voiceId = "qxTFXDYbGcR8GaHSjczg";
        const apiKey = "sk_c169d368cdba96d2710b2a5c802f7d83483041fad4de9c10";
        try {
            const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: "POST",
                headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
                body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.75, similarity_boost: 0.5 } })
            });
            if (!resp.ok) throw new Error(await resp.text());
            const buffer = await resp.arrayBuffer();
            return URL.createObjectURL(new Blob([buffer], { type: "audio/mpeg" }));
        } catch (err) {
            console.error("TTS error:", err);
            return null;
        }
    }

    async function playNextAnnouncement() {
        if (isAnnouncerPlaying || !announcerQueue.length) return;
        isAnnouncerPlaying = true;
        const text = announcerQueue.shift();
        const audioUrl = await fetchAnnouncerAudio(text);
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.onended = () => { isAnnouncerPlaying = false; playNextAnnouncement(); };
            audio.play().catch(() => { isAnnouncerPlaying = false; playNextAnnouncement(); });
        } else { isAnnouncerPlaying = false; playNextAnnouncement(); }
    }

    function queueAnnouncement(text) { announcerQueue.push(text); playNextAnnouncement(); }

    function showNotification(item) {
        document.getElementById('notificationImage').src = item.image;
        document.getElementById('notificationType').textContent = item.type;
        document.getElementById('notificationBin').textContent = item.bin;
        document.getElementById('notificationWeight').textContent = item.weight;
        document.getElementById('notificationTime').textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        notificationPopup.classList.add('show');

        if (window.celebrationSound) {
            window.celebrationSound.currentTime = 0;
            window.celebrationSound.play().catch(() => {});
        }

        queueAnnouncement(`Attention! ${item.type} detected in ${item.bin}!`);

        totalItems++; if (item.recyclable) recycledItems++; todayItems++;
    }

    function closeNotification() { notificationPopup.classList.remove('show'); }

    [notificationClose, notificationCheck].forEach(el => el?.addEventListener('click', closeNotification));
    notificationPopup.addEventListener('click', e => { if (e.target === notificationPopup) closeNotification(); });

    // ===========================
    // Hardware Demo Simulation
    // ===========================
    setTimeout(() => processNewItem(itemTypes[Math.floor(Math.random() * itemTypes.length)]), 3000);
    setInterval(() => {
        if (!notificationPopup.classList.contains('show')) processNewItem(itemTypes[Math.floor(Math.random() * itemTypes.length)]);
    }, 8000 + Math.random() * 7000);

    // ===========================
    // WebSocket / Socket.io Integration
    // ===========================
    if (typeof io !== 'undefined' && window.location.pathname.includes('monitoring.html')) {
        try {
            const socket = io('http://localhost:5000', { reconnection: false, timeout: 2000, transports: ['websocket', 'polling'] });
            socket.on('connect', () => console.log('✓ Connected to webcam detection server'));
            socket.on('new_item', itemData => window.processNewItem?.(itemData));
        } catch {}
    }

    // Expose globally
    window.processNewItem = processNewItem;

    // Initial render
    updateStats(); updatePieChart();
}
