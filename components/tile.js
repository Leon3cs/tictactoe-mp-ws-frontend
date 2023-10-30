import game from "../styles/TicTacToe.module.css";
import { CROSS } from "../pages/tic-tac-toe";

export default function Tile({ value, row, col, handler }) {
  const player = value > 0 ? (value === CROSS ? "X" : "O") : "";

  const clickHandler = (event) => {
    handler(row, col);
    event.preventDefault();
  };

  return (
    <div className={game.tile} onClick={clickHandler}>
      {player}
    </div>
  );
}
