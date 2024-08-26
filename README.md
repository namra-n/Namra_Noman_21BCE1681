**Chess-Like Turn-Based Game**

This repository contains the code for a simple turn-based chess-like game built with HTML, CSS, JavaScript, and Socket.IO.
Two players can compete by moving their characters across a 5x5 grid, aiming to eliminate the opponent's pieces.

**Features:**

Real-time gameplay through Socket.IO for two players online. 
Basic movement rules for Pawn, Hero 1, and Hero 2 characters. 
Turn indicator showing the active player. Visual representation of the game board and characters. 
Highlighting of valid moves for the selected character. 
Game over notification with the winning player. 
Option to start a new game. 

**Technologies Used:**

Frontend: HTML, CSS, JavaScript 
Backend: Node.js, Express, Socket.IO

**Getting Started:**

Install dependencies: npm install (assuming you have Node.js and npm installed) 
Run the server: node server.js 
Open http://localhost:3000 (default port) in two different browsers to play the game.

**Code Structure:**

public: Contains the HTML, CSS, and JavaScript files for the client-side game interface. 
server.js: Implements the game logic, character classes, and Socket.IO event handlers for server-side operations
