const User = require('../models/UserModel.js');

const bossController = {

    getAllUsers: function (req, res) {
        User.find({})
            .sort('role')
            .exec()
			.then((result) => {
				res.render('bossAssignUsers', { Users: result });
                console.log(result);
			})
			.catch((err) => {
				console.log(err);
			});;
    },

    getAssignRole: function (req, res) {
        var email = req.params.email;

        User.findOne({email: email})
            .exec()
            .then((result) => {
                res.render('bossAssignRole', result);
                console.log(result);
            })
            .catch((err) => {
				console.log(err);
			});;
    },

    postAssignRole: function (req, res) {
        var email = req.body.email;

        User.findOneAndUpdate({email: email}, {role: req.body.role})
            .exec()
            .then((result) => {
                res.redirect('/boss/getAllUsers');
            })
            .catch((err) => {
				console.log(err);
			});;
    }
}

module.exports = bossController;