import { Server } from "socket.io";
import axios from "axios";

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log("Socket already initialized");
  } else {
    console.log("Socket initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", async (socket) => {
      socket.on("create_match", async () => {
        const response = await axios.post("http://localhost:8000/match", {
          players: [socket.id],
        });

        const matchId = response.data.match.gridId;

        socket.join(matchId);
        io.to(matchId).emit("match_data", matchId);
      });

      socket.on("join_match", async (matchId) => {
        const response = await axios.put(
          `http://localhost:8000/match/${matchId}/add/player`,
          { socketId: socket.id }
        );

        socket.join(matchId);
        io.to(matchId).emit("player_joined", response.data);
      });

      socket.on("player_move", async ({ row, col }, matchId, player) => {
        let match;

        if (player === "O") {
          const response = await axios.patch(
            `http://localhost:8000/match/${matchId}/move/circle`,
            { row, col, playerId: socket.id }
          );

          match = response.data
        } else {
          const response = await axios.patch(
            `http://localhost:8000/match/${matchId}/move/cross`,
            { row, col, playerId: socket.id }
          );

          match = response.data
        }

        io.to(matchId).emit("update_grid", match);
      });

      socket.on("match_reset", async (matchId) => {
        const response = await axios.put(`http://localhost:8000/match/${matchId}/reset`)

        io.to(matchId).emit('update_match', response.data)
      });

      socket.conn.on("close", async (reason) => {
        const matchData = await axios.get(
          `http://localhost:8000/match/player/${socket.id}`
        );

        if (matchData.data) {
          const response = await axios.put(
            `http://localhost:8000/match/${matchData.data.matchId}/remove/player`,
            { socketId: socket.id }
          );
          io.to(matchData.data.matchId).emit("player_disconnect");
        }
      });
    });
  }
  res.end();
}
