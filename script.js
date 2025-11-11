// This script now handles all JS for index.html, replacing the old script.js and inline scripts.

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
    const reportForm = document.getElementById('report-form');

    const openModal = () => reportModal.classList.remove('hidden');
    const closeModal = ()_ => {
        reportModal.classList.add('hidden');
        if(reportForm) reportForm.reset(); // Reset form when closing
    };

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

    if (getLocationBtn) { 
        getLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                getLocationBtn.textContent = 'Getting location...'; 
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

    // --- NEW: Firebase-aware Auth & UI Management ---
    // Wait for Firebase services to be attached to window
    const checkFirebase = setInterval(() => {
        if (window.firebaseServices) {
            clearInterval(checkFirebase);
            initializeAuth();
        }
    }, 100);

    function initializeAuth() {
        const { auth, onAuthStateChanged, signOut } = window.firebaseServices;

        const authLinks = document.getElementById('auth-links');
        const userLinks = document.getElementById('user-links');
        const logoutBtn = document.getElementById('logout-btn');
        
        const mobileAuthLinks = document.getElementById('mobile-auth-links');
        const mobileUserLinks = document.getElementById('mobile-user-links');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

        onAuthStateChanged(auth, (user) => {
            if (user) {
                // --- User is LOGGED IN ---
                if (authLinks) authLinks.style.display = 'none';
                if (userLinks) userLinks.style.display = 'flex';
                if (mobileAuthLinks) mobileAuthLinks.style.display = 'none';
                if (mobileUserLinks) mobileUserLinks.style.display = 'block';

                // Activate "Report an Issue" buttons
                openModalBtns.forEach(btn => {
                    btn.addEventListener('click', (event) => {
                        event.preventDefault();
                        openModal();
                    });
                });

            } else {
                // --- User is LOGGED OUT ---
                if (authLinks) authLinks.style.display = 'flex';
                if (userLinks) userLinks.style.display = 'none';
                if (mobileAuthLinks) mobileAuthLinks.style.display = 'block';
                if (mobileUserLinks) mobileUserLinks.style.display = 'none';

                // Hijack "Report an Issue" buttons
                openModalBtns.forEach(btn => {
                    btn.addEventListener('click', (event) => {
                        event.preventDefault();
                        alert('You must be logged in to report an issue.');
                        window.location.href = 'login.html'; 
                    });
                });
            }
        });

        // --- Logout Logic ---
        const handleLogout = (event) => {
            event.preventDefault();
            signOut(auth).then(() => {
                alert('You have been logged out.');
                window.location.href = 'index.html'; // Go to home page
            }).catch((error) => {
                console.error("Logout Error: ", error);
            });
        };

        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    }


    // --- NEW: Firebase Form Submission ---
    if (reportForm) {
        reportForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            
            const { auth, db, storage, collection, addDoc, serverTimestamp, ref, uploadBytes, getDownloadURL } = window.firebaseServices;
            const user = auth.currentUser;

            if (!user) {
                alert('You must be logged in to submit a report.');
                window.location.href = 'login.html';
                return;
            }

            const submitButton = document.getElementById('submit-report-btn');
            const originalButtonText = submitButton.textContent;
            
            // 1. Get form data
            const category = document.getElementById('issue-category').value;
            const location = document.getElementById('location').value;
            const description = document.getElementById('description').value;
            const photoFile = document.getElementById('photo-upload').files[0];

            if (!category || !location) {
                alert('Please select a category and provide a location.');
                return;
            }
            
            if (!photoFile) {
                alert('Please add a photo as evidence.');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            try {
                // 2. Upload Photo to Firebase Storage
                const photoName = `images/${Date.now()}-${photoFile.name}`;
                const storageRef = ref(storage, photoName);
                const uploadTask = await uploadBytes(storageRef, photoFile);
                const photoURL = await getDownloadURL(uploadTask.ref);

                // 3. Create Report in Firestore
                const reportData = {
                    category: category,
                    location: location,
                    description: description,
                    imageUrl: photoURL,
                    imagePath: photoName, // Store path for potential deletion
                    status: 'Pending',
                    submittedAt: serverTimestamp(),
                    userId: user.uid,
                    userEmail: user.email 
                };

                await addDoc(collection(db, "issues"), reportData);

                // 4. Success
                alert('Report submitted successfully!');
                closeModal();
                window.location.href = 'my-reports.html'; // Redirect to My Reports

            } catch (error) {
                console.error("Error submitting report: ", error);
                alert("An error occurred while submitting your report. Please try again.");
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
});
