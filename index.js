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
// let allowedOrigins = [
//   "http://localhost:8080",
//   "http://testsite.com",
//   "http://localhost:1234",
//   "https://flixhive-cf7fbbd939d2.herokuapp.com",
//   "https://the-flixhive.netlify.app",
//   "http://localhost:4200"
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         // If a specific origin isn’t found on the list of allowed origins
//         let message =
//           "The CORS policy for this application doesn’t allow access from origin " +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

app.use(cors()); //allows all domains to access the API

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

/**
 * @description Register a new user
 * @function
 * @name registerUser
 * @route POST /users
 * @param {Object} req.body - User registration data
 * @param {string} req.body.username - Username (min 5 chars, alphanumeric only)
 * @param {string} req.body.password - User password
 * @param {string} req.body.email - Valid email address
 * @param {string} req.body.birthdate - User birthdate (YYYY-MM-DD)
 * @returns {Object} 201 - Created user object
 * @returns {Object} 400 - User already exists
 * @returns {Object} 422 - Validation errors
 * @returns {Object} 500 - Server error
 * @example
 * // Request body:
 * {
 *   "username": "johndoe123",
 *   "password": "securePassword",
 *   "email": "john@example.com",
 *   "birthdate": "1990-01-01"
 * }
 */
//CREATE
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

/**
 * @description Add a movie to user's favorites list
 * @function
 * @name addMovieToFavorites
 * @route POST /users/:username/movies/:MovieID
 * @param {string} req.params.username - Username
 * @param {string} req.params.MovieID - Movie ID to add to favorites
 * @security JWT
 * @returns {Object} Updated user object with new favorite (default 200 status)
 * @returns {Object} 500 - Server error
 */
//CREATE
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

/**
 * @description Get all users (Admin only)
 * @function
 * @name getAllUsers
 * @route GET /users
 * @security JWT
 * @returns {Array<Object>} 201 - Array of all user objects
 * @returns {Object} 500 - Server error
 */
//READ
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

/**
 * @description Get user by username
 * @function
 * @name getUserByUsername
 * @route GET /users/:username
 * @param {string} req.params.username - Username to retrieve
 * @security JWT
 * @returns {Object} 200 (default response) - User object
 * @returns {Object} 500 - Server error
 */
//READ
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

/**
 * @description Get all movies with populated actor data
 * @function
 * @name getAllMovies
 * @route GET /movies
 * @security JWT
 * @returns {Array<Object>} 201 - Array of movie objects with actor names and birth years
 * @returns {Object} 500 - Server error
 */
//READ
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .populate("actors", "name birthYear")
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @description Get movie by title with populated actor data
 * @function
 * @name getMovieByTitle
 * @route GET /movies/:title
 * @param {string} req.params.title - Movie title to retrieve
 * @security JWT
 * @returns {Object} 200 (default response) - Movie object with actor details
 * @returns {Object} 500 - Server error
 */
//READ
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ title: req.params.title })
      .populate("actors", "name birthYear") //pass a parameter(title) to the findOne method to find a movie by title
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @description Get director information by name
 * @function
 * @name getDirectorByName
 * @route GET /directors/:name
 * @param {string} req.params.name - Director name
 * @security JWT
 * @returns {Object} 200 (default response) - Director object with bio, birth year, death year
 * @returns {Object} 500 - Server error
 */
//READ
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

/**
 * @description Get genre information by name
 * @function
 * @name getGenreByName
 * @route GET /genres/:name
 * @param {string} req.params.name - Genre name
 * @security JWT
 * @returns {Object} 200 (default response) - Genre object with description
 * @returns {Object} 500 - Server error
 */
//READ
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

/**
 * @description Get actor information by name
 * @function
 * @name getActorByName
 * @route GET /actors/:name
 * @param {string} req.params.name - Actor name
 * @security JWT
 * @returns {Object} 200 (default response) - Actor object with bio and birth year
 * @returns {Object} 500 - Server error
 */
// READ
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

/**
 * @description Update user profile information
 * @function
 * @name updateUserProfile
 * @route PUT /users/:username
 * @param {string} req.params.username - Username to update
 * @param {Object} req.body - User update data (all fields optional)
 * @param {string} [req.body.username] - New username (min 5 chars, alphanumeric)
 * @param {string} [req.body.password] - New password
 * @param {string} [req.body.email] - New email address
 * @param {string} [req.body.birthdate] - New birthdate (YYYY-MM-DD)
 * @security JWT
 * @returns {Object} 200 - Updated user object (without password)
 * @returns {Object} 404 - User not found
 * @returns {Object} 409 - Username or email already exists
 * @returns {Object} 422 - Validation errors
 * @returns {Object} 500 - Server error
 * @example
 * // Request body (all fields optional):
 * {
 *   "username": "newusername",
 *   "password": "newpassword123",
 *   "email": "newemail@example.com",
 *   "birthdate": "1985-05-15"
 * }
 */
//UPDATE
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
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
    // Check validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      // Find the existing user by ID from the JWT token
      const existingUser = await Users.findById(req.user._id);

      if (!existingUser) {
        return res.status(404).send("User not found");
      }

      // Prepare update object
      const updateData = {};

      // Only add fields that are present in the request
      if (req.body.username) updateData.username = req.body.username;
      if (req.body.email) updateData.email = req.body.email;
      if (req.body.birthdate) updateData.birthdate = req.body.birthdate;

      // Special handling for password
      if (req.body.password) {
        updateData.password = Users.hashPassword(req.body.password);
      }

      // Perform the update using the user's ID
      const updatedUser = await Users.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        {
          new: true, // Return the updated document
          runValidators: true, // Run mongoose validators
        }
      );

      // Remove sensitive information before sending response
      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      res.json(userResponse);
    } catch (error) {
      console.error("Update error:", error);

      // Handle potential duplicate key errors
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Username or email already exists",
        });
      }

      res.status(500).json({
        message: "An error occurred while updating the profile",
        error: error.message,
      });
    }
  }
);

/**
 * @description Remove movie from user's favorites list
 * @function
 * @name removeMovieFromFavorites
 * @route DELETE /users/:username/movies/:MovieID
 * @param {string} req.params.username - Username
 * @param {string} req.params.MovieID - Movie ID to remove from favorites
 * @security JWT
 * @returns {Object} 200 (default response) - Updated user object without removed favorite
 * @returns {Object} 500 - Server error
 */
// DELETE
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

/**
 * @description Delete user account (deregister)
 * @function
 * @name deleteUserAccount
 * @route DELETE /users/:username
 * @param {string} req.params.username - Username to delete
 * @security JWT
 * @returns {string} 200 - Confirmation message
 * @returns {string} 400 - User not found
 * @returns {Object} 500 - Server error
 */
//DELETE
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

/**
 * @description Welcome message for root endpoint
 * @function
 * @name welcomeMessage
 * @route GET /
 * @returns {string} 200 - Welcome message
 * @example
 * // Response:
 * "Welcome to the FlixHive!"
 */
app.get("/", (req, res) => {
  res.send("Welcome to the FlixHive!");
});

/**
 * @description Serve static files from the public directory
 * @function
 * @name serveStaticFiles
 * @param {string} path - Directory path "public"
 * @returns {void} Serves static assets (CSS, JS, images, etc.)
 */
app.use(express.static("public")); //Serve static files in a public folder in the project directory.

/**
 * @description Global error handling middleware. Catches and handles all unhandled errors in the application
 * @function
 * @name globalErrorHandler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {string} 500 - Generic error message
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//Listen for requests on port 8080
// app.listen(8080, () => {
//   console.log("Your app is listening on port 8080.");
// });

/**
 * @description Starts the Express server and listens for incoming requests.
 * Listens on the port specified by environment variable PORT or defaults to 8080.
 * Binds to all network interfaces (0.0.0.0) for deployment compatibility.
 * @function
 * @name startServer

 * @constant {number} port - Port number from environment or default 8080
 */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
