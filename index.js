const express = require("express"); //import express module which is a web application framework for Node.js
const app = express(); //create an instance of express
const morgan = require("morgan"); //import morgan module for logging
const bodyParser = require("body-parser"); //import body-parser module for parsing incoming request bodies
const uuid = require("uuid"); //import uuid module for generating unique ids
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie; //import the Movie model from models.js
const Users = Models.User;
const Actors = Models.Actor;

app.use(morgan("common"));
app.use(bodyParser.json()); //lets us to be able to read data from body object
app.use(express.urlencoded({ extended: true })); //allows us to read data from the body of POST requests
mongoose.connect("mongodb://localhost:27017/movie_apiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); // allows mongoose to connect to movie_apiDB database on local MongoDB server to perform CRUD ops

//CREATE - add a user
app.post("/users", async (req, res) => {
  await Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + "already exists"); //query user and if user exists, return 400 status code and msg
      } else {
        Users.create({
          //if user does not exist, create new user with defined users schema in models.js
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          birthday: req.body.birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          }) //callback fn on the promise
          .catch((error) => {
            //error handling
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

//READ - get all users
app.get("/users", async (req, res) => {
  await Users.find() //find grabs data on all docs in collection using the User model
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ- Get a user by username
app.get("/users/:username", async (req, res) => {
  await Users.findOne({ username: req.params.username }) //pass a parameter(Username) to the findOne method to find a user by username
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//UPDATE- allow users to update their user info
app.put("/users/:username", async (req, res) => {
  console.log('Request Body:', req.body); // Log the request body

  await Users.findOneAndUpdate(
    { username: req.params.username },
    {
      //find user by username and update using set (specifies what fields to update)
      $set: {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        birthdate: req.body.birthdate,
      },
    },
    { new: true }
  ) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      //promise then method to return updated user
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// CREATE- Add a movie to a user's list of favorites 
app.post("/users/:username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { username: req.params.username },
    {
      $push: { favoriteMovies: req.params.MovieID }, //*check if MovieID routes correctly */
    },
    { new: true }
  ) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//return a list of all movies to user as JSON object
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ- return data about a single movie by title to user
app.get("/movies/:title", async (req, res) => {
  await Movies.findOne({ title: req.params.title }) //pass a parameter(title) to the findOne method to find a movie by title
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Delete a user by username
app.delete("/users/:username", async (req, res) => {
  await Users.findOneAndDelete({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + " was not found");
      } else {
        res.status(200).send(req.params.username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Return data about a director (bio, birth year, death year) by name
app.get("/directors/:name", async (req, res) => {
  await Movies.findOne({ 'director.name': req.params.name }) 
    .then((director) => {
      res.json(director.director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Return data about a genre (description) by name/title (e.g., “Thriller”)
app.get("/genres/:name", async (req, res) => {
  await Movies.findOne({ 'genre.name': req.params.name }) 
    .then((genre) => {
      res.json(genre.genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Return data about an actor (bio, birth year) by name
app.get("/actors/:name", async (req, res) => {
  await Actors.findOne({ name: req.params.name }) 
    .then((actor) => {
      res.json(actor);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Allow users to remove a movie from their list of favorites
app.delete("/users/:username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { username: req.params.username },
    {
      $pull: { favoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Allow existing users to deregister
app.delete("/users/:username", async (req, res) => {
  await Users.findOneAndDelete({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + " was not found");
      } else {
        res.status(200).send(req.params.username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});


//default response for when a request is made to the root URL
app.get("/", (req, res) => {
  res.send("Welcome to the FlixHive!");
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
