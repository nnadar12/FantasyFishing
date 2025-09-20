document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username-input');

    loginBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim(); // Get the username and remove whitespace

        if (username) {
            // If a username is entered, save it to session storage
            sessionStorage.setItem('fantasy-fishing-username', username);
            // Redirect the user to the main app page
            window.location.href = 'index.html';
        } else {
            // If no username is entered, alert the user
            alert('Please enter a username.');
        }
    });
});