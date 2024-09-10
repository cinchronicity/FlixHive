const express = require("express"); //import express module which is a web application framework for Node.js
const app = express(); //create an instance of express
const morgan = require("morgan"); //import morgan module for logging

app.use(morgan("common"));

app.get("/secreturl", (req, res) => {
  res.send("This is a secret url with super top-secret content.");
});
//score is rotten tomatoes score
let top10movies = [
  { title: "The Godfather", year: 1972, score: 97 },
  { title: "The Dark Knight", year: 2008, score: 94 },
  { title: "Schindler's List", year: 1993, score: 98 },
  { title: "Pulp Fiction", year: 1994, score: 92 },
  {
    title: "The Lord of the Rings: The Return of the King",
    year: 2003,
    score: 93,
  },
  { title: "Fight Club", year: 1999, score: 79 },
  { title: "Forrest Gump", year: 1994, score: 71 },
  { title: "Inception", year: 2010, score: 87 },
  { title: "The Shawshank Redemption", year: 1994, score: 91 },
  { title: "Parasite", year: 2019, score: 99 },
];

app.get("/", (req, res) => {
  res.send("Welcome to my movie club!");
}); //GET request to the / endpoint will return a welcome message.

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
}); //GET request to the /documentation endpoint will return the documentation HTML file.

app.get("/movies", (req, res) => {
  res.json(top10movies);
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
