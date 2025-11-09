document.addEventListener('DOMContentLoaded', () => {
    
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
            openModal();
        });
    });

    closeModalBtn.addEventListener('click', closeModal);
    
    reportModal.addEventListener('click', (event) => {
        if (event.target === reportModal) {
            closeModal();
        }
    });

    // --- NEW: Geolocation Button ---
    const getLocationBtn = document.getElementById('get-location-btn');
    const locationInput = document.getElementById('location');

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


    // --- UPDATED: Form Submission ---
    const reportForm = document.getElementById('report-form');

    reportForm.addEventListener('submit', (event) => {
        event.preventDefault(); 
        
        // 1. Get data from the form
        const category = document.getElementById('issue-category').value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('description').value;
        const currentDate = new Date().toLocaleDateString('en-IN'); // DD/MM/YYYY format

        if (!category || !location) {
            alert('Please select a category and provide a location.');
            return;
        }

        // 2. Create a new issue object
        const newIssue = {
            id: "#F7C" + Math.floor(105 + Math.random() * 900), // Generate a new ID
            category: category,
            location: location,
            status: 'Pending', // New issues are always Pending
            date: currentDate // Add the current date
        };

        // 3. Get existing issues from localStorage or create new arrays
        //    We will have TWO lists:
        //    - 'fixYourCityIssues': For ALL public issues (Explore page)
        //    - 'myFixYourCityReports': For only the user's reports (My Reports page)
        
        let allIssues = JSON.parse(localStorage.getItem('fixYourCityIssues')) || [];
        let myIssues = JSON.parse(localStorage.getItem('myFixYourCityReports')) || [];

        // 4. Add the new issue to BOTH lists
        allIssues.push(newIssue);
        myIssues.push(newIssue);

        // 5. Save BOTH updated arrays back to localStorage
        localStorage.setItem('fixYourCityIssues', JSON.stringify(allIssues));
        localStorage.setItem('myFixYourCityReports', JSON.stringify(myIssues));
        
        // 6. Close the modal
        closeModal();
        
        // 7. Reset the form
        reportForm.reset();

        // 8. UPDATED: Redirect to the "My Reports" page
        window.location.href = 'my-reports.html';
    });

});
