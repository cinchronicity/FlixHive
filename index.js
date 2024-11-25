const express = require("express"); //import express module which is a web application framework for Node.js
const app = express(); //create an instance of express
const morgan = require("morgan"); //import morgan module for logging
const bodyParser = require("body-parser"); //import body-parser module for parsing incoming request bodies
const uuid = require("uuid"); //import uuid module for generating unique ids
const mongoose = require("mongoose");
const Models = require("./models.js");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie; //import the Movie model from models.js
const Users = Models.User;
const Actors = Models.Actor;

app.use(morgan("common"));
app.use(bodyParser.json()); //lets us to be able to read data from body object
app.use(express.urlencoded({ extended: true })); //allows us to read data from the body of POST requests

const cors = require("cors"); //import cors module to allow requests from all origins
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// app.use(cors());  //allows all domains to access the API

//passport middleware function for authenticating users
let auth = require("./auth")(app); //(app) allows Express into auth.js file
const passport = require("passport");
require("./passport");

// allows mongoose to connect to movie_apiDB database on local MongoDB server to perform CRUD ops
// mongoose.connect("mongodb://localhost:27017/movie_apiDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

//connects Heroku app to MongoDB Atlas database without showing Mongo credentials
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//CREATE - add a user
app.post(
  "/users",
  [
    check("username", "username is required").isLength({ min: 5 }),
    check(
      "username",
      "username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password); //hash password entered by user when registering before storing it in MongoDB
    console.log("hashed password: ", hashedPassword); //log hashed password for debugging
    await Users.findOne({ username: req.body.username })
      .then((user) => {
        //check if user already exists
        if (user) {
          return res.status(400).send(req.body.username + "already exists"); //query user and if user exists, return 400 status code and msg
        } else {
          Users.create({
            //if user does not exist, create new user with defined users schema in models.js
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthdate: req.body.birthdate,
          })
            .then((user) => {
              //if user is created, return 201 status code and user object
              res.status(201).json(user);
            }) //callback fn on the promise
            .catch((error) => {
              //error handling for create method
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      // error for findOne method
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// CREATE- Add a movie to a user's list of favorites
app.post(
  "/users/:username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

//READ - get all users ADMIN USE ONLY
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find() //find grabs data on all docs in collection using the User model
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// READ- Get a user by username
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ username: req.params.username }) //pass a parameter(Username) to the findOne method to find a user by username
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ- return a list of all movies to user as JSON object
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// READ- return data about a single movie by title to user
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ title: req.params.title }) //pass a parameter(title) to the findOne method to find a movie by title
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ Return data about a director (bio, birth year, death year) by name
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "director.name": req.params.name })
      .then((director) => {
        res.json(director.director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ- Return data about a genre (description) by name/title (e.g., “Thriller”)
app.get(
  "/genres/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "genre.name": req.params.name })
      .then((genre) => {
        res.json(genre.genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// READ- Return data about an actor (bio, birth year) by name
app.get(
  "/actors/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Actors.findOne({ name: req.params.name })
      .then((actor) => {
        res.json(actor);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//UPDATE- allow users to update their user info
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  //ensures provided fields are valid
  [
    check("username")
      .optional()
      .isLength({ min: 5 })
      .withMessage("Username must be at least 5 characters long"),
    check("username")
      .optional()
      .isAlphanumeric()
      .withMessage(
        "Username contains non-alphanumeric characters - not allowed."
      ),
    check("email")
      .optional()
      .isEmail()
      .withMessage("Email does not appear to be valid"),
    check("password")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Password is required"),
    check("birthdate")
      .optional()
      .isDate()
      .withMessage("Birthdate must be a valid date in YYYY-MM-DD format"),
  ],
  async (req, res) => {
    //check validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    //condition to check if the user is authorized to make changes to specified user
    if (req.user.username !== req.params.username) {
      return res
        .status(400)
        .send(
          req.params.username + " is not authorized to update this user profile"
        );
    }
    //update user doc with provided fields
    let reqbody = {
      username: req.body.username,
      email: req.body.email,
      birthdate: req.body.birthdate,
    };
    if (req.body.password) {
      reqbody.password = Users.hashPassword(req.body.password);
    }
    await Users.findOneAndUpdate(
      { username: req.params.username },
      {
        //find user by username and update using set (specifies what fields to update)
        $set: reqbody,
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
  }
);

// DELETE- Allow users to remove a movie from their list of favorites
app.delete(
  "/users/:username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

//DELETE allow existing users to deregister
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

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

//Listen for requests on port 8080
// app.listen(8080, () => {
//   console.log("Your app is listening on port 8080.");
// });

//listens for requests and logs the port number
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
