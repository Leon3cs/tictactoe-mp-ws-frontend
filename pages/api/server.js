import { Server } from "socket.io";
import {
  CIRCLE,
  CROSS,
  isWinCol,
  isWinDiagLR,
  isWinDiagRL,
  isWinRow,
} from "../tic-tac-toe";

const INITIAL_STATE = () => [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

const checkForWinners = (grid) => {
  const resultRow = isWinRow(grid);
  const resultCol = isWinCol(grid);
  const resultDiagLR = isWinDiagLR(grid);
  const resultDiagRL = isWinDiagRL(grid);

  let result = {
    cross: false,
    circle: false,
    remainingTiles: 0,
  };

  if (
    resultRow.cross ||
    resultCol.cross ||
    resultDiagLR.cross ||
    resultDiagRL.cross
  ) {
    result.cross = true;
  } else {
    result.cross = false;
  }

  if (
    resultRow.circle ||
    resultCol.circle ||
    resultDiagLR.circle ||
    resultDiagRL.circle
  ) {
    result.circle = true;
  } else {
    result.circle = false;
  }

  result.remainingTiles = grid.reduce(
    (total, row) => (total += row.filter((col) => col == 0).length),
    0
  );

  return result;
};

export default function handler(req, res) {
  let matches = [];
  if (res.socket.server.io) {
    console.log("Socket already initialized");
  } else {
    console.log("Socket initializing");

    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", async (socket) => {
      let match;
      match = matches.find((match) => match.players.length < 2);

      if (!match) {
        match = {
          matchId: matches.length + 1,
          players: [socket.id],
          turn: false,
          first: socket.id,
          round: socket.id,
          state: INITIAL_STATE(),
          endgame: false,
          circleWin: false,
          crossWin: false,
          draw: false,
          circleScore: 0,
          crossScore: 0,
        };

        matches.push(match);
        await socket.join(`room${match.matchId}`);
      } else {
        const matchIndex = matches.findIndex(
          (item) => item.matchId === match.matchId
        );
        let players = match.players;
        players.push(socket.id);
        matches[matchIndex].players = players;

        await socket.join(`room${match.matchId}`);
        socket.emit("player_joined", match);
        socket.to(`room${match.matchId}`).emit("player_joined", match);
      }

      socket.on("player_move", (position, matchId) => {
        const matchIndex = matches.findIndex(
          (item) => item.matchId === matchId
        );
        const match = matches[matchIndex];
        const grid = match.state;
        if (match.round == socket.id) {
          if (match.first == socket.id) {
            grid[position.row][position.col] = CIRCLE;
          } else {
            grid[position.row][position.col] = CROSS;
          }
        }
        const result = checkForWinners(grid);

        if (result.cross || result.circle) {
          match.endgame = true;
          match.crossWin = result.cross;
          match.circleWin = result.circle;
          match.draw = false;
          if (result.circle) {
            match.circleScore += 1;
          }
          if (result.cross) {
            match.crossScore += 1;
          }
        } else if (result.remainingTiles == 0) {
          match.endgame = true;
          match.crossWin = false;
          match.circleWin = false;
          match.draw = true;
        } else {
          match.endgame = false;
          match.crossWin = false;
          match.circleWin = false;
          match.draw = false;
          match.turn = !match.turn;
          const oponent = match.players.filter(
            (player) => player !== socket.id
          );
          match.round = oponent[0];
          match.state = grid;
        }

        matches[matchIndex] = match;

        socket.emit("update_match", match);
        socket.to(`room${matchId}`).emit("update_match", match);
      });

      socket.on("match_reset", (matchId) => {
        const matchIndex = matches.findIndex(
          (item) => item.matchId === matchId
        );
        console.log(INITIAL_STATE());
        const match = matches[matchIndex];
        match.turn = false;
        match.round = match.first;
        match.state = INITIAL_STATE();
        match.endgame = false;
        match.circleWin = false;
        match.crossWin = false;
        match.draw = false;

        matches[matchIndex] = match;

        socket.emit("update_match", match);
        socket.to(`room${matchId}`).emit("update_match", match);
      });

      socket.conn.on("close", (reason) => {
        const matchIndex = matches.findIndex((item) =>
          item.players.includes(socket.id)
        );
        let match = matches[matchIndex];
        const players = match.players.filter((player) => player !== socket.id);
        if (players.length) {
          match.players = players;
          match.turn = false;
          match.state = INITIAL_STATE();
          match.fisrt = players[0];
        } else {
          matches = matches.filter((item) => item.matchId !== match.matchId);
        }

        socket
          .to(`room${match.matchId}`)
          .emit("player_disconnect", match, reason);
      });
    });
  }
  res.end();
}
