// Add smooth transitions for all links on the page
document.addEventListener('DOMContentLoaded', function() {
  // Handle regular links (logout button, etc.)
  const links = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="http"])');
  links.forEach(link => {
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

clickAndSelect()

function clickAndSelect() {
  let cards = Array.from( document.querySelectorAll('.card') ),
      elements = []
  
  // Add child nodes to clickable elements
  cards.forEach(card => {
    elements = elements.concat( Array.from(card.children) )
  })

  // Attach to mouse events
  elements.forEach(element => {
    
    // click: Disable
    element.addEventListener('click', e => e.preventDefault())
    
    // mousedown: Log the timestamp
    element.addEventListener('mousedown', e => {
      let card = e.target.closest(".card")
      card.setAttribute('data-md', Date.now())
    })
    
    // mouseup: Determine whether to click
    element.addEventListener('mouseup', e => {
      
      // Only one please
      e.stopPropagation();

      let card = (e.target.classList.contains("card")) ? e.target : e.target.closest('.card'),
          then = card.getAttribute('data-md'),
          now = Date.now()

      // Allow 200ms to distinguish click from non-click
      if(now - then < 200) {
        
        // Add fade-out animation
        document.body.classList.add('fade-out');
        
        // Visit the link in the card after transition
        setTimeout(function() {
          window.location = card.querySelector('a').href;
        }, 300);
    
        // Remove for production
        card.classList.add('visited')
        console.log(card.querySelector('a').href)
        
      }
  
      // Clean up
      card.removeAttribute('data-md')
      
    })
  })
}

// 🦊 Fox Prank Jumpscare with Greenscreen Removal
document.addEventListener('DOMContentLoaded', function() {
  const foxBtn = document.getElementById('fox-prank-btn');
  const overlay = document.getElementById('jumpscare-overlay');
  const video = document.getElementById('jumpscare-video');
  const canvas = document.getElementById('chroma-canvas');
  const closeBtn = document.getElementById('close-jumpscare');
  const ctx = canvas.getContext('2d');

  if (!foxBtn || !overlay || !video || !canvas) return;

  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Chroma key function to remove greenscreen
  function removeGreenscreen() {
    if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Remove green pixels (chroma key) - improved algorithm
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate color distance from pure green (0, 255, 0)
        const greenDistance = Math.sqrt(
          Math.pow(r - 0, 2) + 
          Math.pow(g - 255, 2) + 
          Math.pow(b - 0, 2)
        );
        
        // Also check if green is dominant
        const total = r + g + b;
        const greenRatio = g / (total || 1);
        
        // Threshold for greenscreen detection (lower = more sensitive)
        const distanceThreshold = 100;
        const ratioThreshold = 0.4;
        
        // Check if pixel is green (greenscreen)
        const isGreen = greenDistance < distanceThreshold && greenRatio > ratioThreshold;
        
        if (isGreen) {
          // Make green pixels fully transparent
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }
    
    if (!video.paused && !video.ended) {
      requestAnimationFrame(removeGreenscreen);
    }
  }

  // Show jumpscare
  foxBtn.addEventListener('click', function() {
    overlay.classList.add('active');
    video.style.display = 'block';
    video.currentTime = 0;
    video.play().then(() => {
      // Unmute for sound
      video.muted = false;
      video.volume = 1.0;
      // Start chroma key processing
      removeGreenscreen();
    }).catch(err => {
      console.log('Video play error:', err);
    });
  });

  // Close jumpscare
  function closeJumpscare() {
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    overlay.classList.remove('active');
    video.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  closeBtn.addEventListener('click', closeJumpscare);
  
  // Auto-close when video ends
  video.addEventListener('ended', closeJumpscare);
  
  // Show close button after a delay
  video.addEventListener('play', function() {
    setTimeout(() => {
      closeBtn.classList.add('show');
    }, 2000);
  });
  
  video.addEventListener('pause', function() {
    closeBtn.classList.remove('show');
  });
});