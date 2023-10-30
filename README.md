# Multiplayer TicTacToe game  

Interface built with NextJS and networking logic with SocketIO

## Introduction

This project was built with the goal to learn how to use WebSockets.

A TicTacToe game with multiplayer functionality was the perfect idea to try to implement because it has simple mechanics, and allow to think scenarios of when an socket event will take place, like a player move, or someone has won the game, score updates, players quiting and joining matches, and etc.

NextJS was the framework of choice because of its abilities to work as a frontend and server combined.

Game was built only in React first, with all its rules on client-side, and then, a server with SocketIO was built with the rules from the React version and more logic to accomodate a series of 1x1 games, and also a and a new page that only consumes all the game state provided by the server.

## The game grid

The game is represented by a 3x3 matrix, initially with all its elements value as 0 like in the example below

```javascript
const grid = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
]
```

When a player moves, the server computes if the position chosen by the player is available, and then changes the element value according to the constants that represent each player.

```javascript
const CROSS = 1
const CIRCLE = 2
```

## The Match object

The server holds a list of matches. This Match object represents the state of the game, and is used to organize all sockets that connects to it in groups of 2, so the matches are always 1v1 players.

```javascript
const match = {
    matchId: 0, // Identifies the match 
    players: [], // List of players in this match, each player is represented by the socket id
    turn: false, // Identify which player can make a move, either 'O' or 'X'
    first: '', // The socket id of the first player to enter in this match
    round: '', // The socket id of the player that can make a move
    state: [], // The game grid, represented as a 3x3 matrix 
    endgame: false, // Becomes 'true' if either a player won, or all tiles of the grid have been filled by a player move
    circleWin: false, // Becomes 'true' if the player as 'O' won a game
    crossWin: false, // Becomes 'true' if the player as 'X' won a game
    draw: false, // Becomes 'true' in none of the players won after all tiles have been filled by a player move
    circleScore: 0, // Counts how many games the player as 'O' won 
    crossScore: 0, // Counts how many games the player as 'X' won 
}
```

## Matchmaking

When a player enters a game, the server will try to find a game that has a player waiting for an oponent, if it doesn`t find one, a new match will be created and the player will be added to this match. If a second player joins the match created for the first player, both of them will receive the current match state and the game begins.

## Player events

When a player makes a move, a client-side validation occurs to ensure the move is to a empty tile on the grid, if it is a valid move, then an event is dispatched to the websocket server, updating the grid, checking if there is any winners or a draw, and dispatching an event for the players in this match the updated game state, so the front end can refresh it's interface

When a match finishes, both players are presented to two options: 
- "reset game" will return the match to it's initial state and the players can have another round, this option will trigger an event for the server to reset the match state and dispatch an event to the players that updates the current match state on the client-side.
- "quit game" will trigger an event for the player that clicked it to remove is socket id from the players list of that match, so it becomes available for another player to join while the player that stayed waits for an oponent.

## Disconnect behaviour

If any player leave a match, either by losing connection, close the browser tab, or use the Quit Game option after a match ends, the server will remove the socket id from the list of players of that match, so the match becomes available for another player to join, and also, the remaining player becomes de first to play inthe match replacing the `first` in the match object. If the second player of that match also leaves, the server will remove the match object from the list of active matches, so when a new match is created, the previous `matchId` can be reused.

## Timeline of updates

1. Initial commit
    - Client-side only version of the tic tac toe
    - Multiplayer version but matchmaking with random players only