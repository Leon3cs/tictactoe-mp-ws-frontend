import styles from "../styles/Home.module.css";
import game from "../styles/TicTacToe.module.css";
import Tile from "../components/tile";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { checkPosition } from './tic-tac-toe'

let socket;

export default function Game() {
  const [enableBoard, setEnableBoard] = useState(false);
  const [grid, setGrid] = useState([]);
  const [turn, setTurn] = useState(false);
  const [endGame, setEndGame] = useState(false);
  const [crossWin, setCrossWin] = useState(false);
  const [circleWin, setCircleWin] = useState(false);
  const [draw, setDraw] = useState(false);
  const [circleScore, setCircleScore] = useState(0);
  const [crossScore, setCrossScore] = useState(0);
  const [player, setPlayer] = useState("");
  const [playerId, setPlayerId] = useState('')
  const [round, setRound] = useState("");
  const [matchId, setMatchId] = useState('')
  const router = useRouter();

  useEffect(() => {
    const initSocket = async () => {
      await fetch("/api/server");
      socket = io();

      socket.on("connect", () => {
        setPlayerId(socket.id);
      });

      socket.on("player_joined", (match) => {
        setEnableBoard(true);
        setMatchId(match.matchId)
        setGrid(match.state);
        setTurn(match.turn);
        setEndGame(match.endgame);
        setCrossScore(match.crossScore);
        setCircleScore(match.circleScore);
        setCrossWin(match.crossWin);
        setCircleWin(match.circleWin);
        setDraw(match.draw);
        setRound(match.round);
        if (match.first === socket.id) {
          setPlayer("O");
        } else {
          setPlayer("X");
        }
      });

      socket.on("player_disconnect", (match, reason) => {
        setEnableBoard(false);
      });

      socket.on('update_grid', match => {
        setGrid([...match.state]);
        setTurn(match.turn);
        setEndGame(match.endgame);
        setCrossScore(match.crossScore);
        setCircleScore(match.circleScore);
        setCrossWin(match.crossWin);
        setCircleWin(match.circleWin);
        setDraw(match.draw);
        setRound(match.round);
      })

      socket.on('update_match', (match) => {
        setGrid([...match.state]);
        setTurn(match.turn);
        setEndGame(match.endgame);
        setCrossScore(match.crossScore);
        setCircleScore(match.circleScore);
        setCrossWin(match.crossWin);
        setCircleWin(match.circleWin);
        setDraw(match.draw);
        setRound(match.round);
      })

      return null;
    };
    initSocket();
  }, []);

  const updateGrid = (row, col) => {
    if((playerId === round) && (checkPosition(row, col, grid, turn, endGame))){
      socket.emit('player_move', {row, col}, matchId)
    }
  };

  const resetGame = () => {
    socket.emit('match_reset', matchId)
  };

  const quitGame = () => {
    socket.disconnect();
    router.push("/");
  };

  return (
    <div className={styles.container}>
      {enableBoard ? (
        <main>
          <div>
            <p className={game.score}>You are <strong>{player}</strong></p>
          </div>
          <div>
            <p className={game.player}>Score</p>
          </div>
          <div className={game.scoreContainer}>
            <div>
              <p className={game.player}>
                O: <strong className={game.points}>{circleScore}</strong>
              </p>
            </div>
            <div>
              <p className={game.player}>
                X: <strong className={game.points}>{crossScore}</strong>
              </p>
            </div>
          </div>
          <div className={game.grid}>
            {grid.length &&
              grid.map((row, x) =>
                row.map((tile, y) => (
                  <Tile
                    value={tile}
                    key={`${x}${y}`}
                    row={x}
                    col={y}
                    handler={updateGrid}
                  ></Tile>
                ))
              )}
          </div>
          <div className={game.result}>
            <p>Turn: {turn ? "X" : "O"}</p>
            {!!endGame && (
              <div className={game.results}>
                {!!crossWin && <p>'X' is winner!</p>}
                {!!circleWin && <p>'O' is winner!</p>}
                {!!draw && <p>Draw</p>}
                <div className={game.actionsContainer}>
                  <button onClick={resetGame}>Reset game</button>
                  <button onClick={quitGame}>Quit game</button>
                </div>
              </div>
            )}
          </div>
        </main>
      ) : (
        <main>
          <p>WAITING FOR OTHER PLAYER</p>
        </main>
      )}
      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel" className={styles.logo} />
        </a>
      </footer>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
      `}</style>
    </div>
  );
}
