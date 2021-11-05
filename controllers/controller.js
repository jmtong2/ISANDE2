
const controller = {

    getFavicon: function (req, res) {
        res.status(204);
    },

    getIndex: function (req, res) {
        // if (req.session.username != undefined)
        //     res.redirect('/homepage');
        // else
            res.render('index');

    }
}

module.exports = controller;
