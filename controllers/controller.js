const User = require('../models/UserModel.js');
const controller = {

    getFavicon: function (req, res) {
        res.status(204);
    },

    getIndex: function (req, res) {
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
            res.render('index');
        }

    }
};

module.exports = controller;
