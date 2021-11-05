const bcrypt = require('bcrypt');
const saltRounds = 10;

const db = require('./models/db.js');

// const url = 'mongodb://localhost:27017/itisdev-instock';
const url = 'mongodb+srv://draco:nAG5fKmyDbDqsUS5@itisdev-in-stock.mjmm5.mongodb.net/inventory?retryWrites=true&w=majority';

const User = require('./models/UserModel.js');

db.connect(url);

/* TO DO LIST
    - user authentication
    - user session
*/

async function createUser(firstName, lastName, email, password, role) {
    console.log('Adding user ' + email + '...');

    const hash = await bcrypt.hash(password, saltRounds);

    const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hash,
        role: role
    })

    const result = await user.save();
    console.log(result);
}

async function listUsers() {
    const users = await User
        .find()
        .select('firstName email role');
    console.log("Listing all users...");
    console.log(users);
}

createUser('Manjiro', 'Sano', 'm.sano@gmail.com', 'password123', 'sales manager');
createUser('Ken', 'Ryuguji', 'k.ryuguji@gmail.com', 'password234', 'cashier');
createUser('Takemichi', 'Hanagaki', 't.hanagaki@gmail.com', 'password345', 'purchasing');

createUser('inventory', 'inventory', 'inventory@gmail.com', 'inventory', 'inventory');
createUser('purchasing', 'purchasing', 'purchasing@gmail.com', 'purchasing', 'purchasing');
createUser('salesmanager', 'salesmanager', 'salesmanager@gmail.com', 'salesmanager', 'sales manager');
createUser('cashier', 'cashier', 'cashier@gmail.com', 'cashier123', 'cashier');

listUsers();