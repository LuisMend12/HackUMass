var user = document.querySelector('#user');
user.addEventListener('keyup', function(e) {
    var u_times = document.querySelector('.u-times');
    var u_check = document.querySelector('.u-check');
    if (user.value.length == 0 || user.value.length < 6) {
        user.style.border = '1px solid red';
        u_times.style.display = 'block';
        u_check.style.display = 'none';
        return false;
    } else {
       user.style.border = '1px solid green';
         u_times.style.display = 'none';
        u_check.style.display = 'block';
      
    }

})

function validate() {
    var user = document.querySelector('#user');
    var pass = document.querySelector('#pass');
    if (user.value == 'admin' && pass.value == 'vvit@123') {
        // Add fade-out animation
        document.body.classList.add('fade-out');
        setTimeout(function() {
            alert('Login Successfull');
            window.location = 'hm.html';
        }, 300);
        return false; // Prevent default form submission
    } else {
        alert('Login Failed!...Try Again');
        return false;
    }
}

function myFunction() {
    var x = document.getElementById("pass");
    if (x.type === 'password') {
        x.type = 'text';
    } else {
        x.type = 'password';
    }
}

