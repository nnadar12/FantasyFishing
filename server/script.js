document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selection ---
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    const feed = document.getElementById('feed');
    // FIXED: Selecting by ID is more reliable and solves the null error
    const userCatchesGrid = document.getElementById('user-catches-grid');

    // --- Mock Data ---
    const mockFeedData = [
        { username: 'Angler_Alex', avatar: 'https://i.pravatar.cc/150?u=angleralex', species: 'Largemouth Bass', weight: '5.2 lbs', length: '21 inches', points: 150 },
        { username: 'Fisher_Frank', avatar: 'https://i.pravatar.cc/150?u=fisherfrank', species: 'Rainbow Trout', weight: '3.1 lbs', length: '18 inches', points: 120 },
        { username: 'Reel_Rachel', avatar: 'https://i.pravatar.cc/150?u=reelrachel', species: 'Striped Bass', weight: '12.7 lbs', length: '30 inches', points: 280 },
        { username: 'Nicholas', avatar: 'https://i.pravatar.cc/150?u=nicholas', species: 'Red Snapper', weight: '8.5 lbs', length: '24 inches', points: 210 }
    ];

    // --- Event Listeners ---
    loginBtn.addEventListener('click', () => {
        console.log("Login button clicked!");
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        renderFeed();
        renderUserCatches();
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(section => {
                section.id === targetId ? section.classList.remove('hidden') : section.classList.add('hidden');
            });
        });
    });

    // --- REWRITTEN Render Functions ---

    /**
     * Renders the main feed to exactly match the new minimalist design.
     * Uses a Font Awesome icon instead of a large image.
     */
    function renderFeed() {
        feed.innerHTML = ''; // Clear existing feed
        mockFeedData.forEach(item => {
            const feedItem = document.createElement('div');
            feedItem.classList.add('feed-item');
            
            // This new HTML structure matches your target image perfectly
            feedItem.innerHTML = `
                <div class="post-header">
                    <img src="${item.avatar}" alt="${item.username} avatar">
                    <span class="username">${item.username}</span>
                </div>
                <div class="post-content">
                    <div class="fish-icon">
                        <i class="fas fa-fish"></i>
                    </div>
                    <div class="post-info">
                        <h4>${item.species}</h4>
                        <p>Weight: ${item.weight} | Length: ${item.length}</p>
                        <p class="points">${item.points} points</p>
                    </div>
                </div>
            `;
            feed.appendChild(feedItem);
        });
    }

    /**
     * Renders a grid of images for the user's profile page.
     * This function is now more robust to prevent errors.
     */
    function renderUserCatches() {
        // FIXED: Add a check to ensure the element exists before trying to modify it
        if (userCatchesGrid) {
            userCatchesGrid.innerHTML = ''; // Clear existing catches
            const myCatches = mockFeedData.filter(item => item.username === 'Nicholas');
            
            myCatches.forEach((item, index) => {
                const catchItem = document.createElement('div');
                // Using a placeholder image for the grid view on the profile
                catchItem.innerHTML = `<img src="https://picsum.photos/300/300?random=${index + 100}" alt="${item.species}">`;
                userCatchesGrid.appendChild(catchItem);
            });
        }
    }
});