// This script will be the frontend JavaScript that communicates with the Flask backend
document.addEventListener('DOMContentLoaded', function() {
    // Interactive Starfield Background
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Star properties
    const stars = [];
    const starCount = Math.floor((window.innerWidth * window.innerHeight) / 1000);
    const starSpeed = 0.03;
    let mouseX = 0;
    let mouseY = 0;

    // Initialize stars
    function initStars() {
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                speed: (Math.random() * 0.05 + 0.01) * 0.2 
            });
        }
    }

    // Draw stars
    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create gradient background
        const gradientBg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradientBg.addColorStop(0, '#0c0c16');
        gradientBg.addColorStop(1, '#1a1a2e');
        
        ctx.fillStyle = gradientBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw each star
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            
            // Move star based on mouse position
            star.x += (mouseX - canvas.width / 2) * star.speed;
            star.y += (mouseY - canvas.height / 2) * star.speed;
            
            // Wrap stars around screen
            if (star.x < 0) star.x = canvas.width;
            if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height;
            if (star.y > canvas.height) star.y = 0;
            
            // Draw star with glow
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            
            const starGradient = ctx.createRadialGradient(
                star.x, star.y, 0, 
                star.x, star.y, star.size * 2
            );
            
            starGradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            starGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = starGradient;
            ctx.fill();
        }
        
        // Add ambient light glow effect
        const ambientGlow = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, canvas.width / 2
        );
        
        ambientGlow.addColorStop(0, 'rgba(0, 219, 222, 0.03)');
        ambientGlow.addColorStop(0.5, 'rgba(252, 0, 255, 0.01)');
        ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = ambientGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        requestAnimationFrame(drawStars);
    }

    // Track mouse movement
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Update search box glow effect
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            const glowEffect = searchBox.querySelector('.glow-effect');
            if (glowEffect) { 
                glowEffect.style.setProperty('--x', mouseX + 'px');
                glowEffect.style.setProperty('--y', mouseY + 'px');
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        stars.length = 0; // Clear existing stars
        initStars();
    });

    // Initialize starfield
    initStars();
    drawStars();

    // Setup the analyze button with API call to backend
    document.getElementById('analyzeBtn').addEventListener('click', function() {
        const topic = document.getElementById('topicInput').value.trim();
        
        if (topic) {
            // Show loading state
            document.getElementById('loadingBox').style.display = 'block';
            document.getElementById('resultsBox').style.display = 'none';
            document.getElementById('errorBox').style.display = 'none';
            
            // Make API call to Flask backend
            fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic: topic })
            })
            .then(response => response.json())
            .then(data => {
                // Hide loading
                document.getElementById('loadingBox').style.display = 'none';
                
                if (data.success) {
                    // Show results
                    const resultsBox = document.getElementById('resultsBox');
                    resultsBox.style.display = 'block';
                    
                    // Set topic hashtag
                    document.querySelector('.hashtag').textContent = '#' + topic;
                    
                   
// Render 8 emotion cards dynamically
const summaryContainer = document.getElementById('sentimentSummary');
summaryContainer.innerHTML = '';

const emotions = data.emotion_percentages;
const counts = data.emotion_counts;

for (const emotion in emotions) {
    const percent = emotions[emotion].toFixed(2);
    const count = counts[emotion];

    const card = document.createElement('div');
    card.className = 'sentiment-card';
    card.innerHTML = `
        <div class="percent">${percent}%</div>
        <div class="count">${count} ${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Tweets</div>
    `;
    summaryContainer.appendChild(card);
}





                    
                  document.querySelector('.dominant-sentiment').textContent = 
    'Dominant emotion: ' + data.dominant.charAt(0).toUpperCase() + data.dominant.slice(1);

                    
                    document.querySelector('.tweet-count').textContent = data.total_tweets + ' tweets analyzed';
                    
                    // Add entrance animation
                    resultsBox.style.opacity = '0';
                    resultsBox.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        resultsBox.style.transition = 'opacity 0.5s, transform 0.5s';
                        resultsBox.style.opacity = '1';
                        resultsBox.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    // Show error
                    const errorBox = document.getElementById('errorBox');
                    errorBox.style.display = 'block';
                    errorBox.textContent = data.error || 'Error analyzing the topic. Please try again.';
                    
                    setTimeout(() => {
                        errorBox.style.display = 'none';
                    }, 5000);
                }
            })
            .catch(error => {
                document.getElementById('loadingBox').style.display = 'none';
                const errorBox = document.getElementById('errorBox');
                errorBox.style.display = 'block';
                errorBox.textContent = 'Network error. Please check your connection and try again.';
                
                setTimeout(() => {
                    errorBox.style.display = 'none';
                }, 5000);
            });
        } else {
            const errorBox = document.getElementById('errorBox');
            errorBox.style.display = 'block';
            errorBox.textContent = 'Please enter a topic to analyze';
            
            setTimeout(() => {
                errorBox.style.display = 'none';
            }, 3000);
        }
    });

    // Input focus effect
    const input = document.getElementById('topicInput');
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('input-focus');
    });

    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('input-focus');
    });
});