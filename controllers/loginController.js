const bcrypt = require('bcrypt');

const db = require('../models/db.js');
const User = require('../models/UserModel.js');

const loginController = {

    getLogIn: function (req, res) {
        if(req.session.email) {
            var user = {
                firstName: req.session.firstName,
                lastName: req.session.lastName,
                email: req.session.email,
                role: req.session.role
            }

            if(req.session.role == 'purchasing')
                res.redirect('/purchasing/toPurchase');
            else if(req.session.role == 'cashier')
                res.redirect('/cashier/cashierOrders');    // Not final, to be replaced
            else if(req.session.role == 'sales manager')
                res.redirect('/manager/menuItems');      // Not final, to be replaced
            else if(req.session.role == 'inventory')
                res.redirect('/inventory/ingredients');
            else if(req.session.role == 'boss')
                res.redirect('/boss/getAllUsers');
            else if(req.session.role == 'unassigned')
                res.render('unassigned');
            else
                res.send('Error page');  
        }
        else {
            res.render('login');
        }
    },

    postLogIn: function (req, res) {

        var email = req.body.email;
        var password = req.body.password;

        db.findOne(User, {email: email}, '', function(result) {
            if(result) {
                var user = {
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    role: result.role
                }

                console.log(user);

                bcrypt.compare(password, result.password, function(err, equal){
                    if(equal) {
                        req.session.email = user.email;
                        req.session.firstName = user.firstName;
                        req.session.lastName = user.lastName;
                        req.session.role = user.role;

                        console.log(user.email);

                        if(user.role == 'purchasing')
                             res.redirect('/purchasing/toPurchase');
                        else if(user.role == 'cashier')
                            res.redirect('/cashier/cashierOrders');    // Not final, to be replaced
                        else if(user.role == 'sales manager')
                            res.redirect('/manager/menuItems');      // Not final, to be replaced
                        else if(user.role == 'inventory')
                            res.redirect('/inventory/ingredients');
                        else if(user.role == 'boss')
                            res.redirect('/boss/getAllUsers');
                        else if(user.role == 'unassigned')
                            res.render('unassigned');
                        else
                            res.send('Error page');
                    }
                    else {
                        var details = {error: 'Incorrect Email or Password.'};
                        res.render('login', details);
                    }
                });
            }
            else {
                var details = {error: 'Incorrect Email or Password.'};
                res.render('login', details);
            }
        });
    }
}

module.exports = loginController;