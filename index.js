const express = require("express"); //import express module which is a web application framework for Node.js
const app = express(); //create an instance of express
const morgan = require("morgan"); //import morgan module for logging
const bodyParser = require('body-parser'); //import body-parser module for parsing incoming request bodies
const uuid = require('uuid'); //import uuid module for generating unique ids
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie; //import the Movie model from models.js
const Users = Models.User; 

app.use(morgan("common"));
app.use(bodyParser.json()); //lets us to be able to read data from body object 
app.use(express.urlencoded({ extended: true })); //allows us to read data from the body of POST requests
mongoose.connect('mongodb://localhost:27017/movie_apiDB', { useNewUrlParser: true, useUnifiedTopology: true }); // allows mongoose to connect to movie_apiDB database on local MongoDB server to perform CRUD ops


//CREATE - add a user 
app.post('/users', (req, res) => {
  const newUser = req.body; //newUser is the body of the request

  if (newUser.name) {
    newUser.userID = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('users need names');
 
  }
});

//CREATE - allows users to add movie their list of favorites
app.post('/users/:id/:movieTitle', (req, res) => { 
  const { id, movieTitle } = req.params; 

  let user =users.find (user => user.userID == id ); //let bc if there is a user, we will give it the new updated users name.  ==userID will be a number, but id will be a string from URL strig

  if (user) { //first will find the user, then will push the movie title to the user's favorite movies array
    user.favoriteMovies.push(movieTitle) ;
    res.status(200).send(`${movieTitle} has been added to user ${id}'s favorite movies`);
  } else {
    res.status(400).send('user not found');
  }

});



//READ 
app.get("/", (req, res) => {
  res.send("Welcome to my movie club!");
}); //GET request to the / endpoint will return a welcome message.

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
}); //GET request to the /documentation endpoint will return the documentation HTML file.

//READ - return a list of all movies to user 
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

//READ - in crud- return info about a single movie by title to user
app.get('/movies/:title', (req, res) => {
  // const title = req.params.title; 
  const { title } = req.params; //object destructuring- same as above- creates new var title and that title will be equal to the property of the same name on the object thats on the r side of equal sign 
  const movie = movies.find( movie => movie.title === title); // when you find the movie that has the same title as the title that was passed in the url, return that movie

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no movie found with that title');
  }
}); 

//READ - return data about a genre object by name/title
app.get('/movies/genre/:genreName', (req, res) => { 
  const { genreName } = req.params; 
  const genre = movies.find( movie => movie.genre.name === genreName).genre; //will return property genre of the movie object when the genre name is equal to the genre name passed in the url (.genre is used to return the genre object)

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('genre not found');
  }
}); 

// READ return data about a director by name 
app.get('/movies/directors/:directorName', (req, res) => { 
  const { directorName } = req.params; 
  const director = movies.find( movie => movie.director.name === directorName).director; 

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('director not found');
  }
}); 

//UPDATE to allow users to update their user info
app.put('/users/:id', (req, res) => { //put their id in URL string
  const updatedUser = req.body; 
  const { id } = req.params; 

  let user =users.find (user => user.userID == id ) //let bc if there is a user, we will give it the new updated users name.  ==userID will be a number, but id will be a string from URL strig

  if (user) {
    user.name = updatedUser.name; 
    res.status(200).json(user);
  } else {
    res.status(400).send('user not found');
  }

});

//DELETE - allow users to remove a movie from their list of favorites
app.delete('/users/:id/:movieTitle', (req, res) => { 
  const { id, movieTitle } = req.params; 

  let user =users.find (user => user.userID == id );  //first checking to see if user exists 
  if (user) { 
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle); //filter out the movie title that is not equal to the movie title that was passed in the URL
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s favorite movies`);
  } else {
    res.status(400).send('movie not found');
  }

});

//DELETE - allows users to deregister 
app.delete('/users/:id', (req, res) => { 
  const { id } = req.params; 

  let user = users.find (user => user.userID == id ); 
  
  if (user) { 
    users = users.filter( user => user.userID != id ); //filter method gets the fn that checks if userID is not equal to the id that was passed in the URL
    
    res.status(200).send(` user ${id}'s has been deleted`);
  } else {
    res.status(400).send('user not found');
  }

});


app.use(express.static("public")); //Serve static files in a public folder in the project directory.

//Error-handling middleware function to log all application errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//Listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
