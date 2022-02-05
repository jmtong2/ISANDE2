const mongoose = require("mongoose");

// To fix all deprecation warnings according to mongoose documentation
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// const options = {
//   useUnifiedTopology: true,
//   useNewUrlParser: true
// };



const dbURI = 'mongodb+srv://Group2:Appdate@appdate.adtwc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'; // ADD ATLAS MONGODB DATABASE
      //"mongodb+srv://admin:admin@jkl.8e9pu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const database = {
  
  connect: function () {
    
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://Group2:Appdate@appdate.adtwc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

  },


  
  /*
    inserts a single `doc` to the database based on the model `model`
  */
  insertOne: function(model, doc, callback) {
      model.create(doc, function(error, result) {
          if(error) return callback(false);
          console.log('Added ' + result);
          return callback(true);
      });
  },

  /*
      inserts multiple `docs` to the database based on the model `model`
  */
  insertMany: function(model, docs) {
      model.insertMany(docs, function(error, result) {
          if(error) return callback(false);
          console.log('Added ' + result);
          return callback(true);
      });
  },

  /*
      searches for a single document based on the model `model`
      filtered through the object `query`
      limits the fields returned based on the string `projection`
      callback function is called after the execution of findOne() function
  */
  findOne: function(model, query, projection, callback) {
      model.findOne(query, projection, function(error, result) {
          if(error) return callback(false);
          return callback(result);
      });
  },

  /*
      searches for multiple documents based on the model `model`
      filtered through the object `query`
      limits the fields returned based on the string `projection`
      callback function is called after the execution of findMany() function
  */
  findMany: function(model, query, projection, callback) {
      model.find(query, projection, function(error, result) {
          if(error) return callback(false);
          return callback(result);
      });
  },

  /*
      updates the value defined in the object `update`
      on a single document based on the model `model`
      filtered by the object `filter`
  */
  updateOne: function(model, filter, update, callback) {
      model.updateOne(filter, update, function(error, result) {
          if(error)
          {
              console.log(error);
            return callback(false);   
          }
          console.log('Document modified: ' + result.nModified);
          return callback(true);
      });
  },

  /*
      updates the value defined in the object `update`
      on multiple documents based on the model `model`
      filtered using the object `filter`
  */
  updateMany: function(model, filter, update, callback) {
      model.updateMany(filter, update, function(error, result) {
          if(error) return callback(false);
          console.log('Documents modified: ' + result.nModified);
          return callback(true);
      });
  },

  /*
      deletes a single document based on the model `model`
      filtered using the object `conditions`
  */
  deleteOne: function(model, conditions, callback) {
      model.deleteOne(conditions, function (error, result) {
          if(error) return callback(false);
          console.log('Document deleted: ' + result.deletedCount);
          return callback(true);
      });
  },


  /*
      deletes multiple documents based on the model `model`
      filtered using the object `conditions`
  */
  deleteMany: function(model, conditions, callback) {
      model.deleteMany(conditions, function (error, result) {
          if(error) return callback(false);
          console.log('Document deleted: ' + result.deletedCount);
          return callback(true);
      });
  }
}



module.exports = database;