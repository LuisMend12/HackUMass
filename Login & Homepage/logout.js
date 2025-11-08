// Function to check if a specific cookie exists
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Check authentication cookie
const isAuthenticated = getCookie("authenticated") === "true";

// Add class safely if authenticated
if (isAuthenticated) {
    document.body.classList.add("authenticated");
}
