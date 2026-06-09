console.log("FIREBASE JS LOADED");
const firebaseConfig = {
  apiKey: "AIzaSyCVEzL6tnKbLv0xNV8kQ9ktZ66TC9VuxSw",
  authDomain: "kaskad-crm.firebaseapp.com",
  projectId: "kaskad-crm",
  storageBucket: "kaskad-crm.firebasestorage.app",
  messagingSenderId: "863659229823",
  appId: "1:863659229823:web:1b83afbc456cdbaaa6754a"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const USER_ROLES = {
  "suliko87.sg@gmail.com": "admin",
  "abdullohis1987@gmail.com": "admin"
};

function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const errorBox = document.getElementById("loginError");

  errorBox.innerText = "";

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => {
      errorBox.innerText = "Неверный email или пароль";
      console.error(err);
    });
}

function logoutUser() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {
  const loginScreen = document.getElementById("loginScreen");
  const mainMenu1 = document.getElementById("mainMenu1");

  if (!loginScreen || !mainMenu1) return;

  if (user) {
    const email = user.email.toLowerCase();
    const role = USER_ROLES[email] || "manager";

    loginScreen.style.display = "none";
    mainMenu1.style.display = "flex";

    applyRole(role);

  } else {
    loginScreen.style.display = "flex";
    mainMenu1.style.display = "none";
  }
});

function applyRole(role) {
  const monitorBtn = document.querySelector(
    '[onclick="checkMonitoringAccess()"]'
  );

  if (!monitorBtn) return;

  if (role === "admin") {
    monitorBtn.style.display = "block";
  } else {
    monitorBtn.style.display = "none";
  }
}