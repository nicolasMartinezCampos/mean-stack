// base setup
// =====================

//call the pakages
var express = require('express'); 		// call express
var app = express(); 				// define our app using express
var bodyParser = require('body-parser');	// get body-parser
var morgan	= require('morgan');        // used to see requests
var mongoose = require('mongoose');		// for working w/ our db
var port = process.env.PORT || 8080; // set the port for our app
var User = require('./app/models/user');

// connect to our db 'test'
mongoose.connect('mongodb://localhost:27017/db_name');

// app confoguration ---------------------------------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function (req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers',  'X-Requested-With,content-type, \
22 Authorization');
  next();
});

// log all requests to the console

app.use(morgan('dev'));

// ROUTES FOR OUR API
// =============================================================================

// basic route for the home page
app.get('/', function (req,res) {
  res.send("Welcome for the home page");
});

// get a instance of the express router
var apiRouter = express.Router();

// middleware to use all requests
/*apiRouter.use(function (req, res, next) {
  //do logging
  console.log('Somebody just came to our app!');
  // this is where we will authenticate users
  next(); // make sure we go to the next routes and don't stop here
});*/

// route middleware and first route here

//on routes that end in /users
//------------------------------------------------------------------------------
apiRouter.route('/users')

  // create a user (accessed at POST http://localhost:8080/api/users)
  .post(function (req, res) {
    // create a new instance of the User Model
    var user = new User();

    // set the user information (comes from the request)
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.password;

    // save the user and check for errors
    user.save(function (err) {
      if(err) {
        // duplicated entry
        if(err.code == 1100)
          return res.json({ success : false, message : 'A user with that\
          username alredy exist. '});
        else
            return res.send(err);
      }
              res.json({ message : 'User created!'});
    });
  })
  //  get all the users (accessed at GET http://localhost:8080/api/users)
  .get(function (req, res) {
    User.find(function (err, users) {
      if(err) res.send(err);
      //return the users
      res.json(users);
    });
  });

apiRouter.route('/users/:user_id')
  // get the user whit that id
  // (accessed at GET http://localhost:8080/api/users/:user_id)
  .get(function(req, res){
    User.findById(req.params.user_id, function(err, user){
      if(err) res.send(err);

      // return that user
      res.json(user);
    });
  })

  // update the user with this id
  // (accessed at PUT http://localhost:8080/api/users/:user_id)
  .put(function(req, res){
    User.findById(req.params.user_id, function(err, user){
      if(err) res.send(err);

      // update user info only its new
      if(req.body.name) user.name = req.body.name;
      if(req.body.username) user.username = req.body.username;
      if(req.body.password) user.password = req.body.password;

      // save the user
      user.save(function (err) {
        if(err) res.send(err);

        // return a message
        res.json({ message : 'User update!'});
      });
    });
  })

  // delete a user whit this id
  // (accessed at DELETE http://localhost:8080/api/users/:user_id)
  .delete(function (req, res) {
    User.remove({
      _id : req.params.user_id
    }, function(err, user){
      if(err) return res.send(err);
      res.json({message : 'Successfully delete!' });
  });
});

// test route to make sure everything is working
// access at GET http://localhost:8080/api
apiRouter.get('/', function (req,res) {
  res.json({message : "hooray! welcome to our api"});
});

// more routes for our API will happen here

// REGISTER OUR ROUTES ---------------------------------------------------------
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);

//start the server
app.listen(port);
console.log(">>>>> Magic happens on port " + port + " <<<<<");
