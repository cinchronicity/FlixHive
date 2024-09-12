const express = require("express"); //import express module which is a web application framework for Node.js
const app = express(); //create an instance of express
const morgan = require("morgan"); //import morgan module for logging
const bodyParser = require('body-parser'); //import body-parser module for parsing incoming request bodies
const uuid = require('uuid'); //import uuid module for generating unique ids

app.use(morgan("common"));
app.use(bodyParser.json()); //lets us to be able to read data from body object 



let users = [
  {
    userID: 1,
    name: "Alice Johnson",
    favoriteMovies: ["Inception"]
  },
  {
    userID: 2,
    name: "Bob Smith",
    favoriteMovies: ["The Dark Knight"]
  },
  {
    userID: 3,
    name: "Charlie Davis",
    favoriteMovies: ["Pulp Fiction"]
  },
  {
    userID: 4,
    name: "Diana White",
    favoriteMovies: ["The Matrix"]
  },
  {
    userID: 5,
    name: "Ethan Brown",
    favoriteMovies: ["The Shawshank Redemption"]
  }
];

let movies = [
  {
    title: "Inception",
    description: "A skilled thief is given a chance at redemption if he can successfully perform inception, a complex form of mind control through dreams.",
    genre: {
      name: "Science Fiction",
      description: "A genre of speculative fiction typically dealing with imaginative concepts such as futuristic settings, science and technology."
    },
    director: {
      name: "Christopher Nolan",
      bio: "Christopher Nolan is a British-American film director, producer, and screenwriter known for making personal, distinctive films within the Hollywood mainstream.",
      birthYear: 1970,
      deathYear: null
    },
    imageUrl: "https://example.com/inception.jpg",
    featured: true
  },
  {
    title: "The Dark Knight",
    description: "Batman faces off against the Joker, a criminal mastermind who plunges Gotham City into chaos.",
    genre: {
      name: "Action",
      description: "A genre characterized by physical exertion, fast pacing, and sequences of physical feats, including fights, chases, and explosions."
    },
    director: {
      name: "Christopher Nolan",
      bio: "Christopher Nolan is a British-American film director, producer, and screenwriter known for making personal, distinctive films within the Hollywood mainstream.",
      birthYear: 1970,
      deathYear: null
    },
    imageUrl: "https://example.com/darkknight.jpg",
    featured: true
  },
  {
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster, and his wife intertwine in four tales of violence and redemption.",
    genre: {
      name: "Crime",
      description: "A genre that focuses on crimes, their detection, criminals, and their motives."
    },
    director: {
      name: "Quentin Tarantino",
      bio: "Quentin Tarantino is an American filmmaker and screenwriter known for his nonlinear storylines and eclectic dialogues.",
      birthYear: 1963,
      deathYear: null
    },
    imageUrl: "https://example.com/pulpfiction.jpg",
    featured: true
  },
  {
    title: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    genre: {
      name: "Drama",
      description: "A genre that relies on the emotional and relational development of realistic characters."
    },
    director: {
      name: "Francis Ford Coppola",
      bio: "Francis Ford Coppola is an American film director, producer, and screenwriter known for revolutionizing American cinema in the 1970s.",
      birthYear: 1939,
      deathYear: null
    },
    imageUrl: "https://example.com/godfather.jpg",
    featured: true
  },
  {
    title: "The Matrix",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    genre: {
      name: "Science Fiction",
      description: "A genre of speculative fiction typically dealing with imaginative concepts such as futuristic settings, science and technology."
    },
    director: {
      name: "Lana Wachowski",
      bio: "Lana Wachowski is an American filmmaker and writer, known for co-creating the Matrix franchise.",
      birthYear: 1965,
      deathYear: null
    },
    imageUrl: "https://example.com/matrix.jpg",
    featured: true
  },
  {
    title: "Schindler's List",
    description: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives during the Holocaust.",
    genre: {
      name: "Biography",
      description: "A genre that tells the true stories of historical figures and their impact on the world."
    },
    director: {
      name: "Steven Spielberg",
      bio: "Steven Spielberg is an American film director, producer, and screenwriter known for his work in various genres across a prolific career.",
      birthYear: 1946,
      deathYear: null
    },
    imageUrl: "https://example.com/schindler.jpg",
    featured: false
  },
  {
    title: "Fight Club",
    description: "An insomniac office worker forms an underground fight club with a soap salesman.",
    genre: {
      name: "Thriller",
      description: "A genre characterized by tension, suspense, and high stakes, often involving crime or psychological conflict."
    },
    director: {
      name: "David Fincher",
      bio: "David Fincher is an American film director and producer, known for his psychological thrillers and dark, stylish visuals.",
      birthYear: 1962,
      deathYear: null
    },
    imageUrl: "https://example.com/fightclub.jpg",
    featured: false
  },
  {
    title: "Forrest Gump",
    description: "The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    genre: {
      name: "Drama",
      description: "A genre that relies on the emotional and relational development of realistic characters."
    },
    director: {
      name: "Robert Zemeckis",
      bio: "Robert Zemeckis is an American filmmaker and screenwriter known for his innovative use of special effects.",
      birthYear: 1952,
      deathYear: null
    },
    imageUrl: "https://example.com/forrestgump.jpg",
    featured: true
  },
  {
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    genre: {
      name: "Drama",
      description: "A genre that relies on the emotional and relational development of realistic characters."
    },
    director: {
      name: "Frank Darabont",
      bio: "Frank Darabont is an American director, screenwriter, and producer, best known for adapting Stephen King's work into films.",
      birthYear: 1959,
      deathYear: null
    },
    imageUrl: "https://example.com/shawshank.jpg",
    featured: true
  },
  {
    title: "The Silence of the Lambs",
    description: "A young FBI agent must confide in an incarcerated and manipulative killer to receive his help in catching another serial killer.",
    genre: {
      name: "Thriller",
      description: "A genre characterized by tension, suspense, and high stakes, often involving crime or psychological conflict."
    },
    director: {
      name: "Jonathan Demme",
      bio: "Jonathan Demme was an American director, producer, and screenwriter known for his varied filmography, including thrillers and comedies.",
      birthYear: 1944,
      deathYear: 2017
    },
    imageUrl: "https://example.com/silenceofthelambs.jpg",
    featured: false
  }
];

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
