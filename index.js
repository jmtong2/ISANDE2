const dotenv = require('dotenv');
//const bodyParser = require('body-parser');
const express = require('express');
const hbs = require('hbs');
const routes = require('./routes/routes');
const session = require('express-session');
const db = require('./models/db.js');
const mongoStore = require('connect-mongo');

const app = express();

dotenv.config();
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;
// Hindi na ginamit ni sir Arren ito  kasi meron an sa express na urlencoded sa baba
//app.use(bodyParser.urlencoded({extended: false}));


app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

// Register Helpers

hbs.registerHelper('isGreaterThan', function(arg1, arg2, options) {
    return (arg1 >= arg2) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('compare', function(lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function(l, r) { return l == r; },
        '===': function(l, r) { return l === r; },
        '!=': function(l, r) { return l != r; },
        '!==': function(l, r) { return l !== r; },
        '<': function(l, r) { return l < r; },
        '>': function(l, r) { return l > r; },
        '<=': function(l, r) { return l <= r; },
        '>=': function(l, r) { return l >= r; },
        'typeof': function(l, r) { return typeof l == r; }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// parses incoming requests with urlencoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// implement 'express-session'
app.use(session({
    'secret': 'Appdate-session',
    'resave': false,
    'saveUninitialized': false,
    store: mongoStore.create({ mongoUrl: 'mongodb+srv://Group2:Appdate@appdate.adtwc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority' })
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});



// define the paths contained to './routes/routes.js
app.use('/', routes);


// connects to the database
db.connect();

// if the route is not defined in the server, render `../views/error.hbs`
app.use((req, res) => {
    res.status(404);
    res.write("Not Found");
});

app.listen(port, hostname, () => {
    console.log('Server is running at:');
    console.log('http://' + hostname + ':' + port);
});