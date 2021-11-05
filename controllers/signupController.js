const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const db = require('../models/db.js');
const User = require('../models/UserModel.js');

const signupController = {

    getSignUp: function (req, res) {
        res.render('signup');
    },

    postSignUp: function (req, res) {

        var errors = validationResult(req);

        if (!errors.isEmpty()) {

            errors = errors.errors;

            var details = {};
            for(i = 0; i < errors.length; i++)
                details[errors[i].param + 'Error'] = errors[i].msg;

            res.render('signup', details);
        }
        else if (req.body.password != req.body.confirmPW) {
            res.redirect(401, '/signup');
        }
        else {
            var firstName = req.body.firstName;
            var lastName = req.body.lastName;
            var email = req.body.email;
            var password = req.body.password;
            var confirmPW = req.body.confirmPW;
    
            bcrypt.hash(password, saltRounds, function(err, hash) {
                var user = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hash,
                }
        
                db.insertOne(User, user, function(flag) {
                    if(flag) {
                        res.redirect('/login')
                        //res.send('firstName: ' + firstName +'lastName: ' + lastName + 'email: ' + email);
                    }
                });
            });
        }
    },

    getCheckEmail: function (req, res) {

        var email = req.query.email;

        db.findOne(User, {email: email}, 'email', function (result) {
            res.send(result);
        });
    }
}

module.exports = signupController;
