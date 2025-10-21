# 🎬 FlixHive API

The **server-side component** of the FlixHive movie web application. This REST API provides users with access to information about movies, directors, actors, and genres. Users can also create accounts, update their profiles, and manage a list of their favorite movies.  

This project is built with the **MERN stack** (MongoDB, Express, React, Node.js) and deployed on **Heroku**.

---

## 📌 Features

- Return a list of all movies  
- Return details about a single movie by title (description, genre, director, image URL, featured or not)  
- Return details about a genre by name  
- Return details about a director by name (bio, birth year, death year)  
- Allow new users to register  
- Allow users to update profile information (username, password, email, birthday)  
- Allow users to add or remove movies from their favorites  
- Allow users to delete their account  

---

## 🛠️ Technologies Used

- **Node.js** & **Express** – server and routing  
- **MongoDB** & **Mongoose** – database and object modeling  
- **REST API** – structured endpoints  
- **JWT & Passport.js** – authentication & authorization  
- **bcrypt** – password hashing  
- **Morgan** – HTTP request logging  
- **Body-Parser** – request body parsing  
- **Heroku** – deployment  
- **Postman** – API testing  

---

## 📂 Project Structure
```
FlixHive-api/
│── index.js # Entry point
│── package.json # Project metadata & dependencies
│── models/ # Mongoose schemas
│── routes/ # Express route handlers
│── middleware/ # Authentication, validation, etc.
│── public/ # Static files 
```

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:  
- **Node.js** (v14 or later)  
- **npm** (v6 or later)  
- **MongoDB** (local or hosted on MongoDB Atlas)  

---

### 1️⃣ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/FlixHive.git
   cd FlixHive

2. Install dependencies:
    ```bash 
    npm install
    ```

3. Start MongoDB locally (or connect to your Atlas cluster).

4. Run the server:
    ```
    npm start
    ```

The API will run on http://localhost:8080/.

### 🌐 API Endpoints

| Method | Endpoint                           | Description                       |
| ------ | ---------------------------------- | --------------------------------- |
| GET    | `/movies`                          | Returns list of all movies        |
| GET    | `/movies/:title`                   | Returns data about a single movie |
| GET    | `/genres/:name`                    | Returns data about a genre        |
| GET    | `/directors/:name`                 | Returns data about a director     |
| GET    | `/actors/:name`                    | Returns data about an actor       |
| POST   | `/users`                           | Create a new user                 |
| PUT    | `/users/:username`                 | Update user info                  |
| POST   | `/users/:username/movies/:movieID` | Add movie to favorites            |
| DELETE | `/users/:username/movies/:movieID` | Remove movie from favorites       |
| DELETE | `/users/:username`                 | Delete a user account             |

### 🔐 Authentication & Security

JWT (JSON Web Token) authentication is implemented.

Passwords are hashed using bcrypt.

Requests are validated and protected using Passport.js.

### 🧪 Testing

The API was tested with Postman to ensure all endpoints work as expected and return JSON responses.

### 🌍 Deployment

This API is deployed on Heroku.

 <!--Live API: Heroku App Link --> 
 <!-- replace with your actual link -->

 <!--Documentation: Available via Postman collection -->

### 📖 Future Improvements

Add related movie titles

Allow users to maintain a "To Watch" list in addition to favorites

Include additional metadata such release dates
