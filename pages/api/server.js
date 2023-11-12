import { Server } from "socket.io";
import axios from "axios";

const BASE_URL = 'http://api:8000'

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log("Socket already initialized");
  } else {
    console.log("Socket initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", async (socket) => {
      socket.on("create_match", async () => {
        const response = await axios.post(`${BASE_URL}/match`, {
          players: [socket.id],
        });

        const matchId = response.data.match.gridId;

        socket.join(matchId);
        io.to(matchId).emit("match_data", matchId);
      });

      socket.on("join_match", async (matchId) => {
        try{
          const response = await axios.put(
            `${BASE_URL}/match/${matchId}/add/player`,
            { socketId: socket.id }
          );
  
          socket.join(matchId);
          io.to(matchId).emit("player_joined", response.data);
        }catch(error){
          socket.emit('invalid_match')
        }
      });

      socket.on("player_move", async ({ row, col }, matchId, player) => {
        let match;

        if (player === "O") {
          const response = await axios.patch(
            `${BASE_URL}/match/${matchId}/move/circle`,
            { row, col, playerId: socket.id }
          );

          match = response.data
        } else {
          const response = await axios.patch(
            `${BASE_URL}/match/${matchId}/move/cross`,
            { row, col, playerId: socket.id }
          );

          match = response.data
        }

        io.to(matchId).emit("update_grid", match);
      });

      socket.on("match_reset", async (matchId) => {
        const response = await axios.put(`${BASE_URL}/match/${matchId}/reset`)

        io.to(matchId).emit('update_match', response.data)
      });

      socket.conn.on("close", async (reason) => {
        try{
          const matchData = await axios.get(
            `${BASE_URL}/match/player/${socket.id}`
          );
  
          if (matchData.data) {
            const response = await axios.put(
              `${BASE_URL}/match/${matchData.data.matchId}/remove/player`,
              { socketId: socket.id }
            );
            io.to(matchData.data.matchId).emit("player_disconnect");
          }
        }catch(error){
          
        }
      });
    });
  }
  res.end();
}
