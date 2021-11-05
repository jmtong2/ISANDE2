const db = require('./models/db.js');
const url = 'mongodb+srv://draco:nAG5fKmyDbDqsUS5@itisdev-in-stock.mjmm5.mongodb.net/inventory?retryWrites=true&w=majority';

const Unit = require('./models/UnitModel.js');

db.connect(url);

async function createUnit(abbrev, fullName) {
    console.log('Adding unit ' + abbrev + '...');

    const unit = new Unit({
        abbrev: abbrev,
        fullName: fullName
    })

    const result = await unit.save();
    console.log(result);
}

async function listUnits() {
    const units = await Unit
        .find()
        .select('abbrev fullName');
    console.log("Listing all units...");
    console.log(units);
}

// Mass and weight units
createUnit('mg', 'milligram');
createUnit('g', 'gram');
createUnit('kg', 'kilogram');
createUnit('lb', 'pound');
createUnit('oz', 'ounce');

// Volume units
createUnit('ml', 'milliliter');
createUnit('l', 'liter');
createUnit('gal', 'gallon');
createUnit('qt', 'quart');
createUnit('p', 'pint');

listUnits();