document.addEventListener('DOMContentLoaded', () => {
    
    // --- NEW: Auth State Management (UI Toggle) ---
    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');
    const logoutBtn = document.getElementById('logout-btn');
    
    const mobileAuthLinks = document.getElementById('mobile-auth-links');
    const mobileUserLinks = document.getElementById('mobile-user-links');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    const isLoggedIn = localStorage.getItem('fixYourCityUserLoggedIn') === 'true';

    if (isLoggedIn) {
        // User is logged in: Hide "Login/Sign Up", Show "Logout"
        if (authLinks) authLinks.style.display = 'none';
        if (userLinks) userLinks.style.display = 'flex';
        if (mobileAuthLinks) mobileAuthLinks.style.display = 'none';
        if (mobileUserLinks) mobileUserLinks.style.display = 'block';
    } else {
        // User is logged out: Show "Login/Sign Up", Hide "Logout"
        if (authLinks) authLinks.style.display = 'flex';
        if (userLinks) userLinks.style.display = 'none';
        if (mobileAuthLinks) mobileAuthLinks.style.display = 'block';
        if (mobileUserLinks) mobileUserLinks.style.display = 'none';
    }

    // Logout function
    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.setItem('fixYourCityUserLoggedIn', 'false'); // Set flag to false
        alert('You have been logged out.');
        window.location.reload(); // Reload page to update UI
    };

    // Attach logout handlers
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    // --- END OF NEW AUTH LOGIC ---


    // --- Mobile Menu Toggle ---
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const openIcon = document.getElementById('menu-open-icon');
    const closeIcon = document.getElementById('menu-close-icon');

    if (menuButton) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            openIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
    }

    // --- Report Issue Modal ---
    const reportModal = document.getElementById('report-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const openModalBtns = document.querySelectorAll('.open-report-modal');

    const openModal = () => reportModal.classList.remove('hidden');
    const closeModal = () => reportModal.classList.add('hidden');

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent page jump for <a> links
            
            // ### MODIFIED: Check login status ###
            const currentLoginStatus = localStorage.getItem('fixYourCityUserLoggedIn') === 'true';

            if (currentLoginStatus) {
                // User is logged in, open the modal
                openModal();
            } else {
                // User is not logged in, alert and redirect to login.html
                alert('You must be logged in to report an issue.');
                window.location.href = 'login.html'; 
            }
            // ### END OF MODIFICATION ###
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (reportModal) {
        reportModal.addEventListener('click', (event) => {
            if (event.target === reportModal) {
                closeModal();
            }
        });
    }

    // --- Geolocation Button ---
    const getLocationBtn = document.getElementById('get-location-btn');
    const locationInput = document.getElementById('location');

    if (getLocationBtn) { // Check if the button exists on this page
        getLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                getLocationBtn.textContent = 'Getting location...'; // Provide feedback
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude.toFixed(5);
                    const lon = position.coords.longitude.toFixed(5);
                    locationInput.value = `Lat: ${lat}, Lon: ${lon}`;
                    getLocationBtn.textContent = 'Use my current location';
                }, () => {
                    alert('Unable to retrieve your location. Please check browser permissions and try again.');
                    getLocationBtn.textContent = 'Use my current location';
                });
            } else {
                alert('Geolocation is not supported by this browser. Please enter your location manually.');
            }
        });
    }


    // --- Form Submission ---
    const reportForm = document.getElementById('report-form');

    if (reportForm) { // Check if the form exists on this page
        reportForm.addEventListener('submit', (event) => {
            event.preventDefault(); 
            
            // 1. Get text data from the form
            const category = document.getElementById('issue-category').value;
            const location = document.getElementById('location').value;
            const currentDate = new Date().toLocaleDateString('en-IN'); // DD/MM/YYYY format
            const file = document.getElementById('photo-upload').files[0];

            if (!category || !location) {
                alert('Please select a category and provide a location.');
                return;
            }

            // 2. Define the function that saves the data
            // This will be called *after* the file is read, or immediately if no file
            const saveIssueAndRedirect = (photoData) => {
                
                // 3. Create a new issue object
                const newIssue = {
                    id: "#F7C" + Math.floor(105 + Math.random() * 900),
                    category: category,
                    location: location,
                    status: 'Pending',
                    date: currentDate,
                    photoData: photoData // NEW: Add the photo data (will be null if no file)
                };

                // 4. Get existing issues from localStorage or create new arrays
                let allIssues = JSON.parse(localStorage.getItem('fixYourCityIssues')) || [];
                let myIssues = JSON.parse(localStorage.getItem('myFixYourCityReports')) || [];

                // 5. Add the new issue to BOTH lists
                allIssues.push(newIssue);
                myIssues.push(newIssue);

                // 6. Save BOTH updated arrays back to localStorage
                localStorage.setItem('fixYourCityIssues', JSON.stringify(allIssues));
                localStorage.setItem('myFixYourCityReports', JSON.stringify(myIssues));
                
                // 7. Close the modal
                closeModal();
                
                // 8. Reset the form
                reportForm.reset();

                // 9. Redirect to the "My Reports" page
                window.location.href = 'my-reports.html';
            };


            // 3. Check if a file was selected and read it
            if (file) {
                const reader = new FileReader();
                
                // This event fires when the file reading is complete
                reader.onload = (e) => {
                    // e.target.result contains the Base64 string
                    saveIssueAndRedirect(e.target.result); 
                };

                reader.onerror = (e) => {
                    console.error("File reading error: ", e);
                    alert("There was an error reading your file. Submitting report without image.");
                    saveIssueAndRedirect(null); // Save without image on error
                };
                
                // Start reading the file
                reader.readAsDataURL(file);

            } else {
                // If no file was selected, save the report with null for photoData
                saveIssueAndRedirect(null);
            }
        });
    }
});
