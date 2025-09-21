document.addEventListener('DOMContentLoaded', () => {
    // --- User Session Management ---
    const loggedInUser = sessionStorage.getItem('fantasy-fishing-username');

    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
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
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // THE CHANGE: New selectors for description and location inputs
    const descriptionInput = document.getElementById('description-input');
    const locationInput = document.getElementById('location-input');
    
    const leagueCards = document.querySelectorAll('.league-card');
    const backToLeaguesBtn = document.getElementById('back-to-leagues-btn');
    const leagueDetailName = document.getElementById('league-detail-name');
    const leagueNavLinks = document.querySelectorAll('.league-nav a');
    const leagueTabContents = document.querySelectorAll('.league-tab-content');
    const leagueFeed = document.getElementById('league-feed');
    
    const joinLeagueBtn = document.getElementById('join-league-btn');
    const createLeagueBtn = document.getElementById('create-league-btn');

    // --- Dynamic User Data ---
    const userAvatarUrl = `https://i.pravatar.cc/150?u=${loggedInUser}`;
    profileUsername.textContent = loggedInUser;
    profileAvatar.src = userAvatarUrl;

    // --- API and Data ---
    const API_URL = 'http://localhost:3000';
    let currentCatchData = null;

    // THE CHANGE: Updated mock data to include timestamp, location, and description
    let masterFeedData = [
        { username: 'Aadit', avatar: 'https://i.pravatar.cc/150?u=angleralex', species: 'Largemouth Bass', weight: '5.2 lbs', length: '21 inches', points: 150, imageUrl: 'https://picsum.photos/600/400?random=1', timestamp: '2025-09-20T10:00:00Z', location: 'Lake Minnetonka, MN', description: 'Caught this beauty right by the docks!' },
        { username: 'Fisher_Frank', avatar: 'https://i.pravatar.cc/150?u=fisherfrank', species: 'Rainbow Trout', weight: '3.1 lbs', length: '18 inches', points: 120, imageUrl: 'https://picsum.photos/600/400?random=2', timestamp: '2025-09-19T18:30:00Z', location: 'Madison River, MT', description: 'Great fight on a fly rod.' },
        { username: 'Reel_Rachel', avatar: 'https://i.pravatar.cc/150?u=reelrachel', species: 'Striped Bass', weight: '12.7 lbs', length: '30 inches', points: 280, imageUrl: 'https://picsum.photos/600/400?random=3', timestamp: '2025-09-19T12:15:00Z', location: 'Cape Cod Canal, MA', description: '' },
        { username: 'Angler_Alex', avatar: 'https://i.pravatar.cc/150?u=angleralex', species: 'Northern Pike', weight: '8.1 lbs', length: '28 inches', points: 200, imageUrl: 'https://picsum.photos/600/400?random=4', timestamp: '2025-09-18T15:00:00Z', location: 'Lake of the Woods, ON', description: 'A real water wolf!' },
        { username: 'Reel_Rachel', avatar: 'https://i.pravatar.cc/150?u=reelrachel', species: 'Walleye', weight: '6.5 lbs', length: '24 inches', points: 180, imageUrl: 'https://picsum.photos/600/400?random=5', timestamp: '2025-09-17T20:00:00Z', location: 'Lake Erie, OH', description: 'Perfect evening for a catch.' },
        { username: 'Fisher_Frank', avatar: 'https://i.pravatar.cc/150?u=fisherfrank', species: 'Catfish', weight: '15.3 lbs', length: '32 inches', points: 310, imageUrl: 'https://picsum.photos/600/400?random=6', timestamp: '2025-09-16T22:45:00Z', location: 'Mississippi River, LA', description: 'Took forever to reel this one in.' }
    ];
    
    const leaguesData = {
        'weekend-warriors': {
            name: 'Weekend Warriors',
            members: ['Angler_Alex', 'Reel_Rachel', loggedInUser, 'Fisher_Frank']
        }
    };
    let currentLeagueId = null;

    async function loadLocalCatches() {
        try {
            const response = await fetch(`${API_URL}/api/images`);
            if (!response.ok) throw new Error('Could not fetch images.');
            
            const analyzedCatches = await response.json();

            const localCatches = analyzedCatches
                .map(catchItem => {
                    const fishData = catchItem.analysis;
                    if (!fishData || typeof fishData.weight === 'undefined') {
                        return null;
                    }
                    const weightInLbs = `${fishData.weight.toFixed(1)} lbs`;
                    const lengthInInches = `${fishData.length.toFixed(1)} inches`;
                    const points = Math.round(fishData.weight * 15 + fishData.length);
                    return {
                        username: loggedInUser,
                        avatar: userAvatarUrl,
                        species: fishData.species,
                        weight: weightInLbs,
                        length: lengthInInches,
                        points: points,
                        imageUrl: `${API_URL}${catchItem.imageUrl}`,
                        timestamp: new Date().toISOString(), // Default to now for loaded catches
                        location: 'Unknown Location',
                        description: 'My latest catch!'
                    };
                })
                .filter(item => item !== null);

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

    fileUploadInput.addEventListener('change', async function() {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            uploadBoxLabel.classList.add('hidden');
        }
        reader.readAsDataURL(file);

        loadingOverlay.classList.remove('hidden');
        submitCatchBtn.classList.add('hidden');
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
            
            const result = await response.json();
            const fishData = result.analysis;

            if (!fishData || typeof fishData.weight === 'undefined') {
                throw new Error('Could not identify a fish in the image. Please try another one.');
            }

            const weightInLbs = `${fishData.weight.toFixed(1)} lbs`;
            const lengthInInches = `${fishData.length.toFixed(1)} inches`;
            const points = Math.round(fishData.weight * 15 + fishData.length);

            document.getElementById('species').textContent = fishData.species;
            document.getElementById('weight').textContent = weightInLbs;
            document.getElementById('length').textContent = lengthInInches;
            document.getElementById('points').textContent = points;
            
            currentCatchData = {
                imageUrl: `${API_URL}${result.filePath}`,
                species: fishData.species,
                weight: weightInLbs,
                length: lengthInInches,
                points: points
            };

            fishInfoContainer.classList.remove('hidden');
            submitCatchBtn.classList.remove('hidden');
            submitCatchBtn.disabled = false;

        } catch (error) {
            console.error('Error analyzing file:', error);
            alert(`Failed to analyze catch: ${error.message}`);
            resetUploadForm();
        } finally {
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

        // THE CHANGE: Get values from new inputs and add to the new catch object
        const description = descriptionInput.value;
        const location = locationInput.value;

        const newCatch = {
            username: loggedInUser,
            avatar: userAvatarUrl,
            description: description,
            location: location,
            timestamp: new Date().toISOString(), // Use ISO string for consistency
            ...currentCatchData
        };

        masterFeedData.unshift(newCatch);
        renderFeed();
        renderUserCatches();
        
        navigateTo('feed');
        
        resetUploadForm();
    });

    leagueCards.forEach(card => {
        card.addEventListener('click', () => {
            currentLeagueId = card.dataset.leagueId;
            showLeagueDetail(currentLeagueId);
        });
    });

    backToLeaguesBtn.addEventListener('click', () => {
        navigateTo('leagues');
        currentLeagueId = null;
    });

    leagueNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            leagueNavLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            const targetTab = link.dataset.tab;
            leagueTabContents.forEach(content => {
                if (content.id === `${targetTab}-content`) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });

    joinLeagueBtn.addEventListener('click', () => {
        alert('Join League functionality is coming soon!');
    });

    createLeagueBtn.addEventListener('click', () => {
        alert('Create League functionality is coming soon!');
    });


    // --- Render Functions ---
    function renderFeed() {
        feed.innerHTML = '';
        masterFeedData.forEach(item => {
            feed.appendChild(createFeedItem(item, { showPoints: false }));
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
    
    function showLeagueDetail(leagueId) {
        const league = leaguesData[leagueId];
        if (!league) return;

        leagueDetailName.textContent = league.name;
        
        renderLeagueFeed(leagueId);
        renderLeaderboard(leagueId);
        renderMembers(leagueId);
        
        leagueNavLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.tab === 'leaderboard');
        });
        leagueTabContents.forEach(content => {
            content.classList.toggle('hidden', content.id !== 'leaderboard-content');
        });

        navigateTo('league-detail');
    }

    function renderLeagueFeed(leagueId) {
        leagueFeed.innerHTML = '';
        const league = leaguesData[leagueId];
        const leagueMembers = league.members;
        const feedItems = masterFeedData.filter(item => leagueMembers.includes(item.username));

        feedItems.forEach(item => {
            leagueFeed.appendChild(createFeedItem(item, { showPoints: true }));
        });
    }

    function renderLeaderboard(leagueId) {
        const container = document.getElementById('leaderboard-content');
        const league = leaguesData[leagueId];
        const scores = {};

        league.members.forEach(member => {
            scores[member] = 0;
        });

        masterFeedData.forEach(item => {
            if (league.members.includes(item.username)) {
                scores[item.username] += item.points;
            }
        });

        const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

        let tableHtml = '<table class="leaderboard-table"><tr><th>Rank</th><th>User</th><th>Points</th></tr>';
        sortedScores.forEach(([user, points], index) => {
            tableHtml += `<tr><td>${index + 1}</td><td>${user}</td><td>${points}</td></tr>`;
        });
        tableHtml += '</table>';
        container.innerHTML = tableHtml;
    }

    function renderMembers(leagueId) {
        const container = document.getElementById('members-content');
        const league = leaguesData[leagueId];
        let listHtml = '<h3>League Members</h3><ul class="member-list">';
        league.members.forEach(member => {
            listHtml += `<li>${member}</li>`;
        });
        listHtml += '</ul>';
        container.innerHTML = listHtml;
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
        currentCatchData = null;
        
        // THE CHANGE: Reset new input fields
        descriptionInput.value = '';
        locationInput.value = '';
    }
    
    // THE CHANGE: This function now renders date, location, and description
    function createFeedItem(item, options = { showPoints: true }) {
        const feedItem = document.createElement('div');
        feedItem.classList.add('feed-item');

        const pointsHtml = options.showPoints ? `<p class="points">${item.points} points</p>` : '';
        const date = new Date(item.timestamp).toLocaleDateString();
        const locationHtml = item.location ? `<span class="post-location">${item.location}</span>` : '';
        const descriptionHtml = item.description ? `<p class="post-description">${item.description}</p>` : '';

        feedItem.innerHTML = `
            <div class="post-header">
                <img src="${item.avatar}" alt="${item.username} avatar">
                <div class="post-header-info">
                    <span class="username">${item.username}</span>
                    ${locationHtml}
                </div>
                <span class="post-date">${date}</span>
            </div>
            <div class="post-image"><img src="${item.imageUrl}" alt="Catch by ${item.username}"></div>
            <div class="post-content">
                <div class="post-info">
                    <h4>${item.species}</h4>
                    <p>Weight: ${item.weight} | Length: ${item.length}</p>
                    ${descriptionHtml}
                    ${pointsHtml}
                </div>
            </div>`;
        return feedItem;
    }

    // --- Initial App Load ---
    async function initializeApp() {
        await loadLocalCatches();
        renderFeed();
        renderUserCatches();
    }

    initializeApp();
});