const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const db = require('../models/db.js');
const User = require('../models/UserModel.js');

const signupController = {

    getSignUp: function (req, res) {
        if(req.session.email) {
            const user = {
                firstName: req.session.firstName,
                lastName: req.session.lastName,
                email: req.session.email,
                role: req.session.role
            };

            if(req.session.role == 'purchasing')
                res.redirect('/purchasing/reorder');
            else if(req.session.role == 'cashier')
                res.redirect('/cashier/cashierOrders');    // Not final, to be replaced
            else if(req.session.role == 'sales manager')
                res.redirect('/manager/menuItems');      // Not final, to be replaced
            else if(req.session.role == 'inventory')
                res.redirect('/inventory/dashboard');
            else
                res.send('Error page');  
        }
        else {
            res.render('signup');
        }
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
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const email = req.body.email;
            const password = req.body.password;
            const confirmPW = req.body.confirmPW;
            const role = req.body.role;
    
            bcrypt.hash(password, saltRounds, function(err, hash) {
                var user = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hash,
                    role: role
                };
        
                db.insertOne(User, user, function(flag) {
                    if(flag) {
                        res.redirect('/index');
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
};

module.exports = signupController;
