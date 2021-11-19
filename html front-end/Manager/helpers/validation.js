const { check } = require('express-validator');

const validation = {

    signupValidation: function () {

        var validation = [
            check('firstName', 'First name should not be empty.').notEmpty(),
            check('lastName', 'Last name should not be empty.').notEmpty(),
            check('email', 'Email should not be empty.').notEmpty(),
            check('password', 'Passwords should contain at least 8 characters.').isLength({min: 8})
        ];

        return validation;
    }
}

module.exports = validation;
