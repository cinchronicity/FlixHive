const jwtSecret = "your_jwt_secret";

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("passport"); //uses our passport file

/**
 * Generate JWT token for authenticated user
 * @function
 * @name generateJWTToken
 * @param {Object} user - User object
 * @returns {string} JWT token string
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

/**
 * User login endpoint 
 * @function
 * @name Login
 * @route POST /login
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.username - Username
 * @param {string} req.body.password - Password
 * @returns {Object} 200 - JWT token and user object
 * @returns {Object} 401 - Invalid credentials
 * @example
 * // Request body:
 * {
 *   "username": "johndoe123",
 *   "password": "securePassword"
 * }
 * // Response:
 * {
 *   "user": { ... },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */

/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} birthdate - Birthdate
 * @property {Array<string>} favoriteMovies - Array of favorite movie IDs
 */

//POST Login
module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "something is not right",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
