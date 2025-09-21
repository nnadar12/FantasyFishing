
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

    // NEW: Loading overlay element
    const loadingOverlay = document.getElementById('loading-overlay');

    // --- Dynamic User Data ---
    const userAvatarUrl = `https://i.pravatar.cc/150?u=${loggedInUser}`;
    profileUsername.textContent = loggedInUser;
    profileAvatar.src = userAvatarUrl;

    // --- API and Data ---
    const API_URL = 'http://localhost:3000';
    // NEW: Variable to hold data of the catch currently being uploaded
    let currentCatchData = null;

    let masterFeedData = [
        { username: 'Angler_Alex', avatar: 'https://i.pravatar.cc/150?u=angleralex', species: 'Largemouth Bass', weight: '5.2 lbs', length: '21 inches', points: 150, imageUrl: 'https://picsum.photos/600/400?random=1' },
        { username: 'Fisher_Frank', avatar: 'https://i.pravatar.cc/150?u=fisherfrank', species: 'Rainbow Trout', weight: '3.1 lbs', length: '18 inches', points: 120, imageUrl: 'https://picsum.photos/600/400?random=2' },
        { username: 'Reel_Rachel', avatar: 'https://i.pravatar.cc/150?u=reelrachel', species: 'Striped Bass', weight: '12.7 lbs', length: '30 inches', points: 280, imageUrl: 'https://picsum.photos/600/400?random=3' },
    ];

    async function loadLocalCatches() {
        try {
            const response = await fetch(`${API_URL}/api/images`);
            if (!response.ok) throw new Error('Could not fetch images.');

            const analyzedCatches = await response.json();

            const localCatches = analyzedCatches.map(catchItem => {
                const fishData = catchItem.analysis;
                const weightInLbs = `${fishData.weight.toFixed(1)} lbs`;
                const lengthInInches = `${fishData.length.toFixed(1)} inches`;
                const points = Math.round(fishData.weight * 15 + fishData.length);

                return {
                    username: loggedInUser,
                    avatar: userAvatarUrl,
                    species: fishData.speciesName,
                    weight: weightInLbs,
                    length: lengthInInches,
                    points: points,
                    imageUrl: `${API_URL}${catchItem.imageUrl}`
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
        sessionStorage.removeItem('fantasy-fishing-username');
        window.location.href = 'login.html';
    });

    fileUploadInput.addEventListener('change', async function () {
        const file = this.files[0];
        if (!file) return;

        // 1. Show image preview locally
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            uploadBoxLabel.classList.add('hidden');
        }
        reader.readAsDataURL(file);

        // 2. Show loading screen and upload for analysis
        loadingOverlay.classList.remove('hidden');
        submitCatchBtn.classList.add('hidden'); // Hide button until analysis is done
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Analysis failed on the server.');
            }
            const jsonFileName = (item.imageUrl.substring(0, item.imageUrl.length - 3) + 'json');
            const result = fetch(jsonFileName)
                .then(response => response.json())
                .then(data => {
                    const speciesName = data.species;
                    const weightInLbs = data.weight;
                    const lengthInInches = data.length;

                    console.log(speciesName);
                    console.log(weightInLbs);
                    console.log(lengthInInches);
                }).catch(error => console.error('Error fetching the JSON file:', error));

            const speciesName = result.speciesName;
            const weightInLbs = result.weightInLbs;
            const lengthInInches = result.lengthInInches;
            /*
            const result = await response.json();
            const fishData = result.analysis[0]; // Assuming one fish per image
            //const fishData = result[0];
            // 3. Populate form and store data for publishing
            const weightInLbs = `${fishData.weight.toFixed(1)} lbs`;
            //const weightInLbs = result[1];
            const lengthInInches = `${fishData.length.toFixed(1)} inches`;
            //const lengthInInches = result[2];
            // Simple points calculation based on results
            */
            const points = Math.round(fishData.weight * 15 + fishData.length);

            document.getElementById('species').textContent = speciesName;
            document.getElementById('weight').textContent = weightInLbs;
            document.getElementById('length').textContent = lengthInInches;
            document.getElementById('points').textContent = points;

            currentCatchData = {
                imageUrl: `${API_URL}${result.filePath}`,
                species: fishData.speciesName,
                weight: weightInLbs,
                length: lengthInInches,
                points: points
            };

            // 4. Show the populated info and the publish button
            fishInfoContainer.classList.remove('hidden');
            submitCatchBtn.classList.remove('hidden');
            submitCatchBtn.disabled = false;

        } catch (error) {
            console.error('Error analyzing file:', error);
            alert(`Failed to analyze catch: ${error.message}`);
            resetUploadForm();
        } finally {
            // 5. Hide loading screen regardless of outcome
            loadingOverlay.classList.add('hidden');
        }
    });

    submitCatchBtn.addEventListener('click', () => {
        if (!currentCatchData) {
            alert("No catch data to publish. Please upload an image first.");
            return;
        }

        submitCatchBtn.textContent = 'Publishing...';
        submitCatchBtn.disabled = true;

        // Create the new feed item from the stored, analyzed data
        const newCatch = {
            username: loggedInUser,
            avatar: userAvatarUrl,
            ...currentCatchData
        };

        masterFeedData.unshift(newCatch);
        renderFeed();
        renderUserCatches();

        navigateTo('feed');

        resetUploadForm();
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
            const myCatches = masterFeedData.filter(item => item.username === loggedInUser);
            myCatches.forEach(item => {
                const catchItem = document.createElement('div');
                catchItem.innerHTML = `<img src="${item.imageUrl}" alt="${item.species}">`;
                userCatchesGrid.appendChild(catchItem);
            });
        }
    }

    // --- Helper Functions ---
    function resetUploadForm() {
        fileUploadInput.value = '';
        imagePreview.classList.add('hidden');
        imagePreview.src = '#';
        fishInfoContainer.classList.add('hidden');
        submitCatchBtn.classList.add('hidden');
        uploadBoxLabel.classList.remove('hidden');
        submitCatchBtn.disabled = false;
        submitCatchBtn.textContent = 'Publish';
        currentCatchData = null; // Clear the stored data
    }

    // --- Initial App Load ---
    async function initializeApp() {
        await loadLocalCatches();
        renderFeed();
        renderUserCatches();
    }

    initializeApp();
});