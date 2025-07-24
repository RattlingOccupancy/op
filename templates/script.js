let currentVisibleIndividualChart = false;
let hideTimeoutRef = null;  // NEW
let hoverTimer = null;



// This script will be the frontend JavaScript that communicates with the Flask backend
document.addEventListener('DOMContentLoaded', function () {
    // Interactive Starfield Background
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Star properties
    const stars = [];
    const starCount = Math.floor((window.innerWidth * window.innerHeight) / 1000);
    // const starSpeed = 0.03; // Original starSpeed, seems unused in the draw loop for overall speed
    let mouseX = 0;
    let mouseY = 0;

    // Initialize stars
    function initStars() {
        stars.length = 0; // Clear existing stars before re-initializing
        const newStarCount = Math.floor((window.innerWidth * window.innerHeight) / 1000);
        for (let i = 0; i < newStarCount; i++) {
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
    document.addEventListener('mousemove', function (e) {
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
    window.addEventListener('resize', function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // stars.length = 0; // Clear existing stars - initStars will do this
        initStars();
    });

    // Initialize starfield
    initStars();
    drawStars();

    // Setup the analyze button with API call to backend
    const analyzeBtn = document.getElementById('analyzeBtn');
    const topicInput = document.getElementById('topicInput');
    const loadingBox = document.getElementById('loadingBox');
    const resultsBox = document.getElementById('resultsBox');
    const errorBox = document.getElementById('errorBox');
    const sentimentSummaryContainer = document.getElementById('sentimentSummary');
    const hashtagEl = resultsBox.querySelector('.hashtag');
    // const tweetCountEl = resultsBox.querySelector('.tweet-count');
    const dominantSentimentEl = resultsBox.querySelector('.dominant-sentiment');

    // Individual Emotion Chart Elements
    const individualEmotionChartEl = document.getElementById('individualEmotionChart');
    const individualEmotionNameEl = document.getElementById('individualEmotionName');
    const individualEmotionBarEl = document.getElementById('individualEmotionBar');
    const individualEmotionPercentageEl = document.getElementById('individualEmotionPercentage');


    // Prevent chart from hiding if mouse enters the chart container itself
individualEmotionChartEl.addEventListener('mouseenter', () => {
    if (hoverTimer) clearTimeout(hoverTimer);
});

individualEmotionChartEl.addEventListener('mouseleave', () => {
    hideIndividualEmotionGraph();
});


    let currentVisibleIndividualChart = false;
    let hideTimeoutRef = null;

    function showIndividualEmotionGraph(emotionName, percentage) {
        // Cancel any pending hide timeout before showing new graph
        if (hideTimeoutRef) {
            clearTimeout(hideTimeoutRef);
            hideTimeoutRef = null;
        }

        const capitalizedEmotion = emotionName.charAt(0).toUpperCase() + emotionName.slice(1);
        individualEmotionNameEl.textContent = `${capitalizedEmotion} Detail`;
        individualEmotionBarEl.style.height = `${percentage}%`;
        individualEmotionPercentageEl.textContent = `${percentage.toFixed(2)}%`;

        individualEmotionChartEl.style.display = 'block';

        // Smooth transition
        setTimeout(() => {
            individualEmotionChartEl.style.opacity = '1';
            individualEmotionChartEl.style.transform = 'translateY(0)';
        }, 10);

        currentVisibleIndividualChart = true;
    }



    function hideIndividualEmotionGraph() {
        hoverTimer = setTimeout(() => {
            individualEmotionChartEl.style.opacity = '0';
            individualEmotionChartEl.style.transform = 'translateY(10px)';
            setTimeout(() => {
                individualEmotionChartEl.style.display = 'none';
            }, 300);
        }, 100); // small delay to check if pointer is still on any element
    }






    analyzeBtn.addEventListener('click', function () {
        const topic = topicInput.value.trim();

        if (topic) {
            loadingBox.style.display = 'block';
            resultsBox.style.display = 'none';
            errorBox.style.display = 'none';
            if (individualEmotionChartEl) { // Check if element exists
                individualEmotionChartEl.style.display = 'none'; // Hide on new analysis
            }
            currentVisibleIndividualChart = false;

            fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ topic: topic })
            })
                .then(response => response.json())
                .then(data => {
                    loadingBox.style.display = 'none';

                    if (data.success) {
                        resultsBox.style.display = 'block';
                        hashtagEl.textContent = ' Result for #' + topic.replace(/\s+/g, ''); // Remove spaces for hashtag

                        sentimentSummaryContainer.innerHTML = ''; // Clear previous cards

                        const emotions = data.emotion_percentages;
                        const counts = data.emotion_counts;

                        for (const emotion in emotions) {
                            const percent = emotions[emotion]; // Use the direct value
                            const count = counts[emotion];

                            const card = document.createElement('div');
                            card.className = 'sentiment-card';
                            // Store data for individual graph
                            card.dataset.emotion = emotion;
                            card.dataset.percentage = percent.toFixed(2);

                            card.innerHTML = `
                            <div class="percent">${percent.toFixed(2)}%</div>
                            <div class="count">${count} ${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Tweets</div>
                        `;

                            // Event listeners for individual graph
                            card.addEventListener('mouseenter', () => {
                                if (hoverTimer) clearTimeout(hoverTimer); // Cancel pending hide
                                showIndividualEmotionGraph(card.dataset.emotion, parseFloat(card.dataset.percentage));
                            });

                            card.addEventListener('mouseleave', () => {
                                hideIndividualEmotionGraph();
                            });

                            // For mobile: click to show/update
                            card.addEventListener('click', () => {
                                showIndividualEmotionGraph(card.dataset.emotion, parseFloat(card.dataset.percentage));
                                // On mobile, it will stay visible until another card is clicked or it's explicitly hidden
                            });

                            sentimentSummaryContainer.appendChild(card);
                        }

                        dominantSentimentEl.textContent =
                            'Dominant emotion: ' + data.dominant.charAt(0).toUpperCase() + data.dominant.slice(1);

                        // tweetCountEl.textContent = data.total_tweets + ' tweets analyzed';

                        resultsBox.style.opacity = '0';
                        resultsBox.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            resultsBox.style.transition = 'opacity 0.5s, transform 0.5s';
                            resultsBox.style.opacity = '1';
                            resultsBox.style.transform = 'translateY(0)';
                        }, 50);

                    } else {
                        // Show error
                        errorBox.style.display = 'block';
                        errorBox.textContent = data.error || 'Error analyzing the topic. Please try again.';

                        setTimeout(() => {
                            errorBox.style.display = 'none';
                        }, 5000);
                    }
                })
                .catch(error => {
                    loadingBox.style.display = 'none';
                    errorBox.style.display = 'block';
                    errorBox.textContent = 'Network error. Please check your connection and try again.';

                    setTimeout(() => {
                        errorBox.style.display = 'none';
                    }, 5000);
                });
        } else {
            errorBox.style.display = 'block';
            errorBox.textContent = 'Please enter a topic to analyze';

            setTimeout(() => {
                errorBox.style.display = 'none';
            }, 3000);
        }
    });

    // Input focus effect
    const input = document.getElementById('topicInput');
    input.addEventListener('focus', function () {
        this.parentElement.classList.add('input-focus');
    });

    input.addEventListener('blur', function () {
        this.parentElement.classList.remove('input-focus');
    });
});