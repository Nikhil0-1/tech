// EDUTUG INDIA - Core Authentication Logic

class AuthManager {
    constructor() {
        this.auth = window.edutugAuth;
        this.db = window.edutugDb;
        this.currentUser = null;
        this.userRole = null;
    }

    initAuthListener(callback) {
        if (!this.auth) {
            console.error("Firebase Auth not initialized.");
            return;
        }

        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                // Fetch role from db
                await this.fetchUserRole(user.uid);
                if (callback) callback(user, this.userRole);
            } else {
                this.currentUser = null;
                this.userRole = null;
                if (callback) callback(null, null);
                // Redirect to login if not already there
                if (!window.location.pathname.endsWith('login.html') &&
                    !window.location.pathname.endsWith('/') &&
                    !window.location.pathname.endsWith('index.html')) {
                    // Note: index.html is the game screen, which might share login
                    // or be public, but typically requires teacher auth to start.
                    // Assuming a separate login page or index is login for admins.
                }
            }
        });
    }

    async fetchUserRole(uid) {
        try {
            // Check super_admin
            let snapshot = await this.db.ref(`users/super_admin/${uid}`).once('value');
            if (snapshot.exists()) {
                this.userRole = 'super_admin';
                return;
            }

            // Check school_admin
            snapshot = await this.db.ref(`users/school_admin/${uid}`).once('value');
            if (snapshot.exists()) {
                this.userRole = 'school_admin';
                return;
            }

            // Check teacher
            snapshot = await this.db.ref(`users/teachers/${uid}`).once('value');
            if (snapshot.exists()) {
                this.userRole = 'teacher';
                return;
            }

            this.userRole = 'unknown';
        } catch (error) {
            console.error("Error fetching role:", error);
            this.userRole = null;
        }
    }

    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            await this.fetchUserRole(userCredential.user.uid);
            this.redirectBasedOnRole();
            return userCredential.user;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }

    async logout() {
        try {
            await this.auth.signOut();
            window.location.href = 'login.html'; // Assuming a common login page
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    redirectBasedOnRole() {
        switch (this.userRole) {
            case 'super_admin':
                window.location.href = 'superadmin.html';
                break;
            case 'school_admin':
                window.location.href = 'schooladmin.html';
                break;
            case 'teacher':
                window.location.href = 'teacher.html';
                break;
            default:
                console.warn("Unknown role, preventing redirect.");
                alert("Account role not recognized. Contact Support.");
        }
    }

    requireRole(requiredRolesArray) {
        this.initAuthListener((user, role) => {
            if (!user) {
                window.location.href = 'login.html';
            } else if (!requiredRolesArray.includes(role)) {
                // Unauthorized
                document.body.innerHTML = `
                    <div style="display:flex; height:100vh; align-items:center; justify-content:center; text-align:center; font-family:sans-serif;">
                        <div>
                            <h1>Unauthorized Access</h1>
                            <p>You do not have permission to view this page.</p>
                            <button onclick="window.edutugAuthManager.logout()" style="padding: 10px 20px; background:#DC3545; color:white; border:none; border-radius:5px; cursor:pointer; margin-top:20px;">Logout</button>
                        </div>
                    </div>
                `;
            }
        });
    }
}

// Attach to window
window.edutugAuthManager = new AuthManager();
