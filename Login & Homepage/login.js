// Username validation
const userInput = document.querySelector('#user');
const uTimes = document.querySelector('.u_times');
const uCheck = document.querySelector('.u_check');

userInput.addEventListener('keyup', () => {
    if (userInput.value.length < 6) {
        userInput.style.border = '2px solid red';
        uTimes.style.display = 'inline';
        uCheck.style.display = 'none';
    } else {
        userInput.style.border = '2px solid green';
        uTimes.style.display = 'none';
        uCheck.style.display = 'inline';
    }
});

// Login validation
function validate() {
    const user = document.querySelector('#user');
    const pass = document.querySelector('#pass');

    if (user.value === 'admin' && pass.value === 'vvit@123') {
        // Optional: Use inline message instead of alert
        alert('Login Successful!');
        window.location.href = 'hm.html';
        return true;
    } else {
        alert('Login Failed! Please try again.');
        user.style.border = '2px solid red';
        pass.style.border = '2px solid red';
        return false;
    }
}

// Toggle password visibility
function togglePassword() {
    const passInput = document.getElementById('pass');
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
}
