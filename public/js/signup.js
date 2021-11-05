$(document).ready(function () {
    $('#email').keyup(function () {

        // get the value entered the user in the `<input>` element
        var email = $('#email').val();
        if (email.includes(" ")){
            $('#email').css('border', '2px solid red');
            $('#emailError').text('Email is invalid');
            $('#submit').css('background-color', 'grey');
            $('#submit').prop('disabled', true);
        }
        else {
            $.get('/getCheckEmail', {email: email}, function (result) {
                
                if(result.email == email) {
                    $('#email').css('border', '2px solid red');
                    $('#emailError').text('Email already registered');
                    $('#submit').css('background-color', 'grey');
                    $('#submit').prop('disabled', true);
                }
                
                else {
                    $('#email').css('border', '');
                    $('#emailError').text('');
                    $('#submit').css('background-color', '#0275d8');
                    $('#submit').prop('disabled', false);
                }
            });
        }
    });

    $('#password').keyup(function() {
        var password = $("#password").val();

        if (password.length < 8) {
            $('#passwordError').text('Password must contain at least 8 characters');
            $('#password').css('border', '2px solid red');
            $('#submit').css('background-color', 'grey');
            $('#submit').prop('disabled', true);
        }
        else {
            $('#passwordError').text('');
            $('#password').css('border', '');
            $('#submit').css('background-color', '#0275d8');
            $('#submit').prop('disabled', false);
        }
    });

    $('#confirmPW').keyup(function() {
        var confirmPassword = $('#confirmPW').val();
        var password = $('#password').val();

        if(confirmPassword != password) {
            $('#confirmPasswordError').text('Password does not match');
            $('#confirmPW').css('border', '2px solid red');
            $('#submit').css('background-color', 'grey');
            $('#submit').prop('disabled', true);
        }
        else {
            $('#confirmPasswordError').text('');
            $('#confirmPW').css('border', '');
            $('#submit').css('background-color', '#0275d8');
            $('#submit').prop('disabled', false);
        }
    });
});