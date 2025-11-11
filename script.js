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
    
    // --- THIS IS THE CORRECTED LINE ---
    const closeModal = () => {
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


    // --- *** UPDATED: Firebase Form Submission with Compression & Progress *** ---
    if (reportForm) {
        reportForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            
            // Get new functions from window
            const { auth, db, storage, collection, addDoc, serverTimestamp, ref, getDownloadURL, uploadBytesResumable, onSnapshot } = window.firebaseServices;
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
            submitButton.textContent = 'Compressing image...';

            // --- NEW COMPRESSION STEP ---
            const options = {
              maxSizeMB: 1,         // Max file size 1MB
              maxWidthOrHeight: 1920, // Resize to max 1920px
              useWebWorker: true
            }

            let compressedFile;
            try {
              compressedFile = await imageCompression(photoFile, options);
            } catch (compressionError) {
              console.error("Image compression error: ", compressionError);
              alert("Could not compress image. Please try a smaller file.");
              submitButton.disabled = false;
              submitButton.textContent = originalButtonText;
              return; // Stop submission
            }
            // --- END COMPRESSION STEP ---


            // --- NEW UPLOAD LOGIC with Progress ---
            try {
                // Upload the NEW compressedFile
                const photoName = `images/${Date.now()}-${compressedFile.name}`;
                const storageRef = ref(storage, photoName);

                // *** Use uploadBytesResumable ***
                const uploadTask = uploadBytesResumable(storageRef, compressedFile);

                // Listen for state changes, errors, and completion
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        // Get task progress
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        submitButton.textContent = `Uploading... ${Math.round(progress)}%`;
                    }, 
                    (error) => {
                        // Handle unsuccessful uploads
                        console.error("Upload error: ", error);
                        alert("Photo upload failed. Please try again.");
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }, 
                    async () => {
                        // Handle successful uploads on complete
                        submitButton.textContent = 'Saving report...';
                        
                        try {
                            // 3. Get URL and Create Report in Firestore
                            const photoURL = await getDownloadURL(uploadTask.snapshot.ref);

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
                        
                        } catch (saveError) {
                            console.error("Error saving report to Firestore: ", saveError);
                            alert("Photo uploaded, but saving the report failed. Please try again.");
                            submitButton.disabled = false;
                            submitButton.textContent = originalButtonText;
                        }
                    }
                );

            } catch (error) {
                // This catches errors *before* the upload starts
                console.error("Error setting up upload: ", error);
                alert("An error occurred. Please try again.");
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
});
