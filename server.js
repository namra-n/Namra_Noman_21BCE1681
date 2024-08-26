const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Game state
let gameState = {
  board: Array(5).fill(null).map(() => Array(5).fill('')), // 5x5 grid
  players: {
    A: { characters: [], active: true },
    B: { characters: [], active: false }
  }
};

// Character Classes
class Character {
  constructor(name, position) {
    this.name = name;
    this.position = position;
  }
}

class Pawn extends Character {
  validMoves() {
    return ['L', 'R', 'F', 'B'];
  }
}

class Hero1 extends Character {
  validMoves() {
    return ['L', 'R', 'F', 'B'];
  }
}

class Hero2 extends Character {
  validMoves() {
    return ['FL', 'FR', 'BL', 'BR'];
  }
}

// Game Logic Functions
function initializeGame() {
  gameState = {
    board: Array(5).fill(null).map(() => Array(5).fill('')),
    players: {
      A: { characters: [], active: true },
      B: { characters: [], active: false }
    }
  };
}

function placeCharacters(player, positions) {
  const startRow = player === 'A' ? 0 : 4;
  positions.forEach((char, i) => {
    let character;
    if (char === 'P') {
      character = new Pawn(`${player}-P${i + 1}`, [startRow, i]);
    } else if (char === 'H1') {
      character = new Hero1(`${player}-H1`, [startRow, i]);
    } else if (char === 'H2') {
      character = new Hero2(`${player}-H2`, [startRow, i]);
    }
    gameState.board[startRow][i] = character.name;
    gameState.players[player].characters.push(character);
  });
}

function moveCharacter(player, charName, move) {
  const character = gameState.players[player].characters.find(char => char.name === charName);
  if (!character) return;

  const [row, col] = character.position;
  let newRow = row;
  let newCol = col;

  switch (move) {
    case 'L':
      newCol = col - 1;
      break;
    case 'R':
      newCol = col + 1;
      break;
    case 'F':
      newRow = row - 1;
      break;
    case 'B':
      newRow = row + 1;
      break;
    case 'FL': // For Hero2 diagonal move
      newRow = row - 1;
      newCol = col - 1;
      break;
    case 'FR': // For Hero2 diagonal move
      newRow = row - 1;
      newCol = col + 1;
      break;
    case 'BL': // For Hero2 diagonal move
      newRow = row + 1;
      newCol = col - 1;
      break;
    case 'BR': // For Hero2 diagonal move
      newRow = row + 1;
      newCol = col + 1;
      break;
    default:
      return; // Invalid move
  }

  // Out of bounds check
  if (newRow < 0 || newRow > 4 || newCol < 0 || newCol > 4) return;

  // Check if target cell is occupied by a friendly character
  const targetCell = gameState.board[newRow][newCol];
  if (targetCell && targetCell.startsWith(player)) return; // Move is invalid

  // Move character to the new position and remove any opponent character
  character.position = [newRow, newCol];
  if (targetCell) {
    const opponent = targetCell.split('-')[0] === 'A' ? 'B' : 'A';
    gameState.players[opponent].characters = gameState.players[opponent].characters.filter(char => char.position[0] !== newRow || char.position[1] !== newCol);
  }

  // Update game state and broadcast
  updateBoard();
  switchTurns();
  emitGameState();
}

function updateBoard() {
  gameState.board = Array(5).fill(null).map(() => Array(5).fill(''));
  ['A', 'B'].forEach(player => {
    gameState.players[player].characters.forEach(char => {
      const [row, col] = char.position;
      gameState.board[row][col] = char.name;
    });
  });
}

function switchTurns() {
  gameState.players.A.active = !gameState.players.A.active;
  gameState.players.B.active = !gameState.players.B.active;
}

function emitGameState() {
  io.emit('game_state', gameState);
}

function checkGameOver() {
  const allCharactersA = gameState.players.A.characters;
  const allCharactersB = gameState.players.B.characters;
  if (allCharactersA.length === 0) {
    io.emit('game_over', { winner: 'B' });
  } else if (allCharactersB.length === 0) {
    io.emit('game_over', { winner: 'A' });
  }
}

// Serve static files
app.use(express.static('public'));

// Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected');
  emitGameState();

  socket.on('initialize_game', () => {
    initializeGame();
    emitGameState();
  });

  socket.on('place_characters', (data) => {
    placeCharacters(data.player, data.positions);
    emitGameState();
  });

  socket.on('move_character', (data) => {
    moveCharacter(data.player, data.char_name, data.move);
    checkGameOver();
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});