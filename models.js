const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema({
  // Schema for movies
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: {
    name: String,
    description: String,
  },
  director: {
    name: String,
    bio: String,
  },
  actors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }], //array of actor objects
  ImagePath: String,
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthdate: Date, //correct format is yyyy-mm-dd
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

let actorSchema = mongoose.Schema({
  name: { type: String, required: true },
  birthYear: { type: Number, required: true },
});

let Movie = mongoose.model("Movie", movieSchema); //creates the model for movies that use the movieSchema
let User = mongoose.model("User", userSchema);
let Actor = mongoose.model("Actor", actorSchema); //creates the model for actors

module.exports.Movie = Movie; //allows us to import the Movie model to other files
module.exports.User = User;
module.exports.Actor = Actor; //export the Actor model
