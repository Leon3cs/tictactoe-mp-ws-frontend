import styles from "../styles/Home.module.css";
import game from "../styles/TicTacToe.module.css";
import Tile from "../components/tile";
import WaitScreen from "../components/waitScreen";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { checkPosition } from "./tic-tac-toe";
import Link from "next/link";

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
  const [playerId, setPlayerId] = useState("");
  const [round, setRound] = useState("");
  const [matchId, setMatchId] = useState("");
  const [href, setHref] = useState("");
  const [isInvalidMatch, setIsInvalidMatch] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copy link");
  const router = useRouter();

  useEffect(() => {
    const initSocket = async () => {
      await fetch("/api/server");
      socket = io();

      socket.on("connect", () => {
        setPlayerId(socket.id);
      });

      const qs = new URLSearchParams(window.location.search);
      const matchIdToJoin = qs.get("joinMatch");
      const shouldCreateMatch = qs.get("createMatch");

      if (shouldCreateMatch) {
        socket.emit("create_match");
      } else if (matchIdToJoin) {
        const url = `${window.location.origin}/game?joinMatch=${matchIdToJoin}`;
        setHref(url);

        socket.emit("join_match", matchIdToJoin);
      }

      socket.on("match_data", async (matchId) => {
        const url = `${window.location.origin}/game?joinMatch=${matchId}`;
        setHref(url);
      });

      socket.on("player_joined", (data) => {
        setEnableBoard(true);
        setMatchId(data.match.gridId);
        setGrid(data.grid);
        setTurn(data.match.turn);
        setEndGame(data.match.endgame);
        setCrossScore(data.match.crossScore);
        setCircleScore(data.match.circleScore);
        setCrossWin(data.match.crossWin);
        setCircleWin(data.match.circleWin);
        setDraw(data.match.draw);
        setRound(data.match.round);
        if (data.match.first === socket.id) {
          setPlayer("O");
        } else {
          setPlayer("X");
        }
      });

      socket.on("player_disconnect", async (match, reason) => {
        setEnableBoard(false);
      });

      socket.on("update_grid", (data) => {
        setGrid([...data.grid]);
        setTurn(data.match.turn);
        setEndGame(data.match.endgame);
        setCrossScore(data.match.crossScore);
        setCircleScore(data.match.circleScore);
        setCrossWin(data.match.crossWin);
        setCircleWin(data.match.circleWin);
        setDraw(data.match.draw);
        setRound(data.match.round);
      });

      socket.on("update_match", (data) => {
        setGrid([...data.grid]);
        setTurn(data.match.turn);
        setEndGame(data.match.endgame);
        setCrossScore(data.match.crossScore);
        setCircleScore(data.match.circleScore);
        setCrossWin(data.match.crossWin);
        setCircleWin(data.match.circleWin);
        setDraw(data.match.draw);
        setRound(data.match.round);
      });

      socket.on("invalid_match", () => {
        setIsInvalidMatch(true);
      });

      return null;
    };
    initSocket();
  }, []);

  const updateGrid = (row, col) => {
    if (playerId === round && checkPosition(row, col, grid, turn, endGame)) {
      socket.emit("player_move", { row, col }, matchId, player);
    }
  };

  const resetGame = () => {
    socket.emit("match_reset", matchId);
  };

  const quitGame = () => {
    socket.disconnect();
    router.push("/");
  };

  const copyUrl = async () => {
    const blob = new Blob([href], { type: 'text/plain'})

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);

    setCopyButtonText("Copied!");
  };

  return (
    <div className={styles.container}>
      {enableBoard ? (
        <main>
          <div>
            <p className={game.score}>
              You are <strong>{player}</strong>
            </p>
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
          {!!isInvalidMatch ? (
            <div>
              <p className={game.score}>MATCH NOT FOUND</p>
              <p className={game.message}>
                Please quit this game and create a new one by clicking in the
                button below
              </p>
              <div className={game.quitActionContainer}>
                <Link className={game.quitAction} href="/">
                  Return to main page
                </Link>
              </div>
            </div>
          ) : (
            <WaitScreen url={href} copyUrl={copyUrl} copyButtonText={copyButtonText} />
          )}
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
