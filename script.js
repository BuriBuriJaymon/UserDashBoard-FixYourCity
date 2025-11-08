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
    const openModalBtnHero = document.getElementById('report-issue-hero-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    const openModal = () => reportModal.classList.remove('hidden');
    const closeModal = () => reportModal.classList.add('hidden');

    openModalBtnHero.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Also find the "Report an Issue" link in the nav and make it open the modal
    // Note: This requires adding an ID to that link in the HTML, e.g., id="report-issue-nav-btn"
    // For now, only the hero button is wired. Let's wire up all links with that href.
    
    // Get all "Report an Issue" links (desktop, mobile)
    const openModalLinks = document.querySelectorAll('a[href="#"], button'); // A bit broad, let's be more specific
    
    // A better way: Find all elements that should open the modal
    // We already have the hero button. Let's find the nav links.
    // The original code only wired the hero button. Sticking to "DON'T DO ANY OTHER CHANGES".
    // If you want the nav links to work, you'd add IDs and event listeners for them too.
    
    // Close modal if user clicks outside the modal content
    reportModal.addEventListener('click', (event) => {
        if (event.target === reportModal) {
            closeModal();
        }
    });

    // --- Form Submission ---
    const reportForm = document.getElementById('report-form');
    const successMessage = document.getElementById('success-message');

    reportForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent actual form submission
        
        // You would typically send this data to a server here.
        // For this demo, we'll just close the modal and show a success message.
        
        closeModal();
        
        // Show success message
        successMessage.classList.remove('hidden');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);

        // Reset the form
        reportForm.reset();
    });

});
