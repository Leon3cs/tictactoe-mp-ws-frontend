import { Server } from "socket.io";

const BASE_URL = process.env.API_URL || `http://frontend:3000/api`;

const headers = {
  "Content-Type": "application/json",
};

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log("Socket already initialized");
  } else {
    console.log("Socket initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", async (socket) => {
      socket.on("create_match", async () => {
        const response = await fetch(`${BASE_URL}/match`, {
          body: JSON.stringify({ players: [socket.id] }),
          method: "POST",
          headers,
        });

        const data = await response.json();

        const matchId = data.match.gridId;

        socket.join(matchId);
        io.to(matchId).emit("match_data", matchId);
      });

      socket.on("join_match", async (matchId) => {
        try {
          const response = await fetch(
            `${BASE_URL}/match/${matchId}/add/player`,
            {
              body: JSON.stringify({ socketId: socket.id }),
              method: "PUT",
              headers,
            }
          );

          const data = await response.json();

          socket.join(matchId);
          io.to(matchId).emit("player_joined", data);
        } catch (error) {
          console.log(error)
          socket.emit("invalid_match");
        }
      });

      socket.on("player_move", async ({ row, col }, matchId, player) => {
        let match;

        if (player === "O") {
          const response = await fetch(
            `${BASE_URL}/match/${matchId}/move/circle`,
            {
              body: JSON.stringify({ row, col, playerId: socket.id }),
              method: "PATCH",
              headers,
            }
          );

          const data = await response.json();

          match = data;
        } else {
          const response = await fetch(
            `${BASE_URL}/match/${matchId}/move/cross`,
            {
              body: JSON.stringify({ row, col, playerId: socket.id }),
              method: "PATCH",
              headers,
            }
          );

          const data = await response.json();

          match = data;
        }

        io.to(matchId).emit("update_grid", match);
      });

      socket.on("match_reset", async (matchId) => {
        const response = await fetch(`${BASE_URL}/match/${matchId}/reset`, {
          method: "PUT",
          headers,
        });

        const data = await response.json();

        io.to(matchId).emit("update_match", data);
      });

      socket.conn.on("close", async (reason) => {
        try {
          const response = await fetch(
            `${BASE_URL}/match/player/${socket.id}`,
            { method: "GET", headers }
          );

          const data = await response.json();

          if (data) {
            await fetch(`${BASE_URL}/match/${data.matchId}/remove/player`, {
              body: JSON.stringify({ socketId: socket.id }),
              method: "PUT",
              headers,
            });
            io.to(data.matchId).emit("player_disconnect", data, reason);
          }
        } catch (error) {
          console.log(error)
        }
      });
    });
  }
  res.end();
}
