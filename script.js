document.addEventListener('DOMContentLoaded', () => {
        
    // --- Mobile Menu Toggle ---
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const openIcon = document.getElementById('menu-open-icon');
    const closeIcon = document.getElementById('menu-close-icon');

    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        openIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
    });

    // --- Report Issue Modal ---
    const reportModal = document.getElementById('report-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    // ### CHANGED: Find ALL buttons/links that open the modal ###
    const openModalBtns = document.querySelectorAll('.open-report-modal');

    const openModal = () => reportModal.classList.remove('hidden');
    const closeModal = () => reportModal.classList.add('hidden');

    // Add click event to all open modal buttons/links
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent page jump for <a> links
            openModal();
        });
    });

    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal if user clicks outside the modal content
    reportModal.addEventListener('click', (event) => {
        if (event.target === reportModal) {
            closeModal();
        }
    });

    // --- Form Submission ---
    const reportForm = document.getElementById('report-form');

    // ### CHANGED: Updated form submission logic ###
    reportForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent actual form submission
        
        // 1. Get data from the form
        const category = document.getElementById('issue-category').value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('description').value;

        // Basic validation
        if (!category || !location) {
            alert('Please select a category and provide a location.');
            return;
        }

        // 2. Create a new issue object
        const newIssue = {
            id: "#F7C" + Math.floor(105 + Math.random() * 900), // Generate a new ID
            category: category,
            location: location,
            status: 'Pending' // New issues are always Pending
        };

        // 3. Get existing issues from localStorage or create a new array
        let issues = JSON.parse(localStorage.getItem('fixYourCityIssues')) || [];

        // 4. Add the new issue
        issues.push(newIssue);

        // 5. Save the updated issues array back to localStorage
        localStorage.setItem('fixYourCityIssues', JSON.stringify(issues));
        
        // 6. Close the modal
        closeModal();
        
        // 7. Reset the form
        reportForm.reset();

        // 8. Redirect to the issue status page
        window.location.href = 'issue-status.html';
    });

});
