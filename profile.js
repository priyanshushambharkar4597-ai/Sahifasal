
// profile.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js";

/* FIREBASE CONFIG */
const firebaseConfig = {
    apiKey: "AIzaSyBH-CX5-8VUQJ3ueS_I57WX5X7ywjlKJNY",
    authDomain: "sahifasal.firebaseapp.com",
    projectId: "sahifasal",
    storageBucket: "sahifasal.firebasestorage.app",
    messagingSenderId: "488779378198",
    appId: "1:488779378198:web:dfa18941ca4c6dc4ee4f37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM Elements
const userName = document.querySelector('.center h3');
const userRole = document.querySelector('.center p');
const fullNameInput = document.getElementById('input-fullname');
const emailInput = document.getElementById('input-email');
const phoneInput = document.getElementById('input-phone');
const districtInput = document.getElementById('input-district');
const avatarImg = document.querySelector('.avatar img');
const saveBtn = document.querySelector('.card .btn');
const updatePhotoBtn = document.querySelector('.upload + .btn');
const fileInput = document.querySelector('.upload input');

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in - load their profile data
        await loadUserProfile(user.uid);
    } else {
        // No user logged in, redirect to login
        window.location.href = 'index.html';
    }
});

// Load user profile from Firestore (data from registration)
async function loadUserProfile(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // AUTO-FILL ALL FIELDS with registration data
            userName.textContent = userData.name || 'Farmer';
            fullNameInput.value = userData.name || '';
            emailInput.value = userData.email || '';
            phoneInput.value = userData.phone || '';
            districtInput.value = userData.district || userData.dist || ''; // Handle both field names
            
            // Set role/status
            userRole.textContent = 'Verified Farmer ✓';
            
            // Load avatar if exists
            if (userData.photoURL) {
                avatarImg.src = userData.photoURL;
            }
            
            console.log('Profile loaded successfully:', userData);
        } else {
            console.log('No user data found in Firestore');
           
            userName.textContent = 'New Farmer';
            userRole.textContent = 'New Member';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error loading profile data');
    }
}


saveBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    
    if (!user) {
        alert('Please login again');
        return;
    }
    
    
    const updatedData = {
        name: fullNameInput.value.trim(),
        phone: phoneInput.value.trim(),
        district: districtInput.value.trim(),
        email: emailInput.value, 
        updatedAt: new Date()
    };
    
    
    if (!updatedData.name || !updatedData.phone || !updatedData.district) {
        alert('Please fill in all fields');
        return;
    }
    
   
    if (updatedData.phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    
    try {
        
        saveBtn.textContent = 'Saving Changes...';
        saveBtn.disabled = true;
        
        
        await updateDoc(doc(db, 'users', user.uid), {
            name: updatedData.name,
            phone: updatedData.phone,
            district: updatedData.district,
            updatedAt: new Date()
        });
        
        
        userName.textContent = updatedData.name;
        
       
        alert('✅ Profile updated successfully!');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('❌ Error updating profile: ' + error.message);
    } finally {
        
        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;
    }
});


updatePhotoBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const user = auth.currentUser;
    
    if (!file) {
        alert('Please select an image first');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    
    updatePhotoBtn.textContent = 'Uploading...';
    updatePhotoBtn.disabled = true;
    
    try {
        
        const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        
      
        const photoURL = await getDownloadURL(storageRef);
        
        
        await updateDoc(doc(db, 'users', user.uid), {
            photoURL: photoURL
        });
        
        
        avatarImg.src = photoURL;
        
        alert('✅ Profile photo updated successfully!');
    } catch (error) {
        console.error('Error uploading photo:', error);
        alert('❌ Error uploading photo: ' + error.message);
    } finally {
        updatePhotoBtn.textContent = 'Update Photo';
        updatePhotoBtn.disabled = false;
        fileInput.value = ''; 
    }
});


document.querySelectorAll('.sidebar a').forEach(link => {
    if (link.textContent.includes('Logout')) {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await auth.signOut();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});


document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.querySelector('.menu-btn');
    
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target) && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});


fullNameInput.addEventListener('input', () => {
    if (fullNameInput.value.trim().length < 2) {
        fullNameInput.style.borderColor = '#ef4444';
    } else {
        fullNameInput.style.borderColor = '#22c55e';
    }
});

phoneInput.addEventListener('input', () => {
    const phone = phoneInput.value.trim();
    if (phone.length > 0 && phone.length < 10) {
        phoneInput.style.borderColor = '#ef4444';
    } else if (phone.length >= 10) {
        phoneInput.style.borderColor = '#22c55e';
    } else {
        phoneInput.style.borderColor = '#e2e8f0';
    }
});
