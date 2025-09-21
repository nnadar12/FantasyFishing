document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username-input');
    // THE FIX: Changed selector to 'loading-overlay' to match the updated HTML
    const loginLoadingOverlay = document.getElementById('loading-overlay'); 

    loginBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim(); // Get the username and remove whitespace

        if (username) {
            // Show the loading overlay
            loginLoadingOverlay.classList.remove('hidden');

            // Simulate a delay for login (e.g., 2 seconds)
            setTimeout(() => {
                // If a username is entered, save it to session storage
                sessionStorage.setItem('fantasy-fishing-username', username);
                // Redirect the user to the main app page
                window.location.href = 'index.html';
            }, 2000); // 2000 milliseconds = 2 seconds
        } else {
            // If no username is entered, alert the user
            alert('Please enter a username.');
        }
    });
});