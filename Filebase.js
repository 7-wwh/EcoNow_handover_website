import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQNd1bQWwvkeOud5ROhlLiCUGTchJTblM",
  authDomain: "econow2526.firebaseapp.com",
  projectId: "econow2526",
  storageBucket: "econow2526.firebasestorage.app",
  messagingSenderId: "514653585801",
  appId: "1:514653585801:web:25021a25966df011f76158",
  measurementId: "G-ZHPJDXJ65H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

async function saveEmailToFirestore(email) {
  const emailRef = doc(db, "user_emails", email);
  const docSnap = await getDoc(emailRef);

  if (docSnap.exists()) {
    throw new Error("This email has already been registered.");
  }

  await setDoc(emailRef, {
    email: email,
    timestamp: new Date(),
    userAgent: navigator.userAgent
  });
  
  logEvent(analytics, 'email_submitted', { email_provided: true });
}

const button = document.getElementById('cta-button');
const emailInput = document.getElementById('emailInput');
const statusMsg = document.getElementById('statusMsg');

if (button && emailInput && statusMsg) {
  button.addEventListener('click', async () => {
    const val = emailInput.value.trim();
    
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      try {
        button.disabled = true;
        button.textContent = "Verifying...";
        
        await saveEmailToFirestore(val);
        
        window.location.href = 'main.html';
      } catch (err) {
        statusMsg.textContent = err.message;
        button.disabled = false;
        button.textContent = "Enter Booklet";
      }
    } else {
      statusMsg.textContent = "Invalid email format.";
    }
  });
}
