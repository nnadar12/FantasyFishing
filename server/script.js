document.addEventListener('DOMContentLoaded', () => {
    // --- User Session Management ---
    const loggedInUser = sessionStorage.getItem('fantasy-fishing-username');

    // If no user is logged in, redirect to the login page immediately.
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return; // Stop further execution of the script
    }

    // --- Element Selection ---
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    const feed = document.getElementById('feed');
    const userCatchesGrid = document.getElementById('user-catches-grid');
    const logoutBtn = document.getElementById('logout-btn');
    const profileUsername = document.getElementById('profile-username');
    const profileAvatar = document.getElementById('profile-avatar');
    
    const fileUploadInput = document.getElementById('file-upload');
    const imagePreview = document.getElementById('preview-image');
    const fishInfoContainer = document.getElementById('fish-info');
    const submitCatchBtn = document.getElementById('submit-catch-btn');
    const uploadBoxLabel = document.querySelector('.custom-file-upload');
    
    // --- Dynamic User Data ---
    const userAvatarUrl = `https://i.pravatar.cc/150?u=${loggedInUser}`;
    profileUsername.textContent = loggedInUser;
    profileAvatar.src = userAvatarUrl;

    // --- API and Data ---
    const API_URL = 'http://localhost:3000';
    let masterFeedData = [
        { username: 'Angler_Alex', avatar: 'https://i.pravatar.cc/150?u=angleralex', species: 'Largemouth Bass', weight: '5.2 lbs', length: '21 inches', points: 150, imageUrl: 'https://picsum.photos/600/400?random=1' },
        { username: 'Fisher_Frank', avatar: 'https://i.pravatar.cc/150?u=fisherfrank', species: 'Rainbow Trout', weight: '3.1 lbs', length: '18 inches', points: 120, imageUrl: 'https://picsum.photos/600/400?random=2' },
        { username: 'Reel_Rachel', avatar: 'https://i.pravatar.cc/150?u=reelrachel', species: 'Striped Bass', weight: '12.7 lbs', length: '30 inches', points: 280, imageUrl: 'https://picsum.photos/600/400?random=3' },
    ];

    async function loadLocalCatches() {
        try {
            const response = await fetch(`${API_URL}/api/images`);
            if (!response.ok) throw new Error('Could not fetch images.');
            
            const imagePaths = await response.json();

            const localCatches = imagePaths.map(path => {
                const simulatedData = simulateAIDetection(true);
                // THE CHANGE: Use the logged-in user's details for their catches
                return {
                    username: loggedInUser,
                    avatar: userAvatarUrl,
                    species: simulatedData.species,
                    weight: simulatedData.weight,
                    length: simulatedData.length,
                    points: simulatedData.points,
                    imageUrl: `${API_URL}${path}` 
                };
            });
            masterFeedData = [...localCatches.reverse(), ...masterFeedData];
        } catch (error) {
            console.error("Failed to load local catches:", error);
        }
    }

    // --- Navigation ---
    function navigateTo(sectionId) {
        const targetLink = document.querySelector(`nav a[href="#${sectionId}"]`);
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        if (targetLink) {
            targetLink.classList.add('active');
        }

        sections.forEach(section => {
            section.id === sectionId ? section.classList.remove('hidden') : section.classList.add('hidden');
        });
    }

    // --- Event Listeners ---
    navLinks.forEach(link => {
        if (link.id !== 'logout-btn') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                navigateTo(targetId);
            });
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // THE CHANGE: Clear the stored username on logout
        sessionStorage.removeItem('fantasy-fishing-username');
        window.location.href = 'login.html';
    });

    fileUploadInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                uploadBoxLabel.classList.add('hidden');
                simulateAIDetection();
                fishInfoContainer.classList.remove('hidden');
                submitCatchBtn.classList.remove('hidden');
                submitCatchBtn.disabled = false;
            }
            reader.readAsDataURL(file);
        }
    });
    
    submitCatchBtn.addEventListener('click', async () => {
        const file = fileUploadInput.files[0];
        if (!file) return alert("No file selected.");
        
        submitCatchBtn.textContent = 'Publishing...';
        submitCatchBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('File upload failed on the server.');
            const result = await response.json();
            
            // THE CHANGE: Create the new catch using the logged-in user's details
            const newCatch = {
                username: loggedInUser,
                avatar: userAvatarUrl,
                species: document.getElementById('species').textContent,
                weight: document.getElementById('weight').textContent,
                length: document.getElementById('length').textContent,
                points: parseInt(document.getElementById('points').textContent, 10),
                imageUrl: `${API_URL}${result.filePath}`
            };

            masterFeedData.unshift(newCatch);
            renderFeed();
            renderUserCatches();
            
            navigateTo('feed');
            
            resetUploadForm();

        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to publish catch. See console for details.');
            resetUploadForm();
        }
    });
    
    // --- Render Functions ---
    function renderFeed() {
        feed.innerHTML = '';
        masterFeedData.forEach(item => {
            const feedItem = document.createElement('div');
            feedItem.classList.add('feed-item');
            feedItem.innerHTML = `
                <div class="post-header"><img src="${item.avatar}" alt="${item.username} avatar"><span class="username">${item.username}</span></div>
                <div class="post-image"><img src="${item.imageUrl}" alt="Catch by ${item.username}"></div>
                <div class="post-content">
                    <div class="post-info">
                        <h4>${item.species}</h4>
                        <p>Weight: ${item.weight} | Length: ${item.length}</p>
                        <p class="points">${item.points} points</p>
                    </div>
                </div>`;
            feed.appendChild(feedItem);
        });
    }

    function renderUserCatches() {
        if (userCatchesGrid) {
            userCatchesGrid.innerHTML = '';
            // THE CHANGE: Filter catches based on the logged-in user
            const myCatches = masterFeedData.filter(item => item.username === loggedInUser);
            myCatches.forEach(item => {
                const catchItem = document.createElement('div');
                catchItem.innerHTML = `<img src="${item.imageUrl}" alt="${item.species}">`;
                userCatchesGrid.appendChild(catchItem);
            });
        }
    }

    // --- Helper Functions ---
    function simulateAIDetection(returnData = false) {
        const speciesList = ['Spotted Seatrout', 'Cobia', 'King Mackerel', 'Sheepshead'];
        const species = speciesList[Math.floor(Math.random() * speciesList.length)];
        const weight = `${(Math.random() * 10 + 2).toFixed(1)} lbs`;
        const length = `${(Math.random() * 15 + 12).toFixed(1)} inches`;
        const points = Math.floor(Math.random() * 150 + 50);

        if (returnData) return { species, weight, length, points };

        document.getElementById('species').textContent = species;
        document.getElementById('weight').textContent = weight;
        document.getElementById('length').textContent = length;
        document.getElementById('points').textContent = points;
    }

    function resetUploadForm() {
        fileUploadInput.value = '';
        imagePreview.classList.add('hidden');
        imagePreview.src = '#';
        fishInfoContainer.classList.add('hidden');
        submitCatchBtn.classList.add('hidden');
        uploadBoxLabel.classList.remove('hidden');
        submitCatchBtn.disabled = false;
        submitCatchBtn.textContent = 'Publish';
    }

    // --- Initial App Load ---
    async function initializeApp() {
        await loadLocalCatches();
        renderFeed();
        renderUserCatches();
    }

    initializeApp();
});