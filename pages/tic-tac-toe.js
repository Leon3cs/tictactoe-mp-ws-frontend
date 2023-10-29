import styles from "../styles/Home.module.css";
import game from "../styles/TicTacToe.module.css";
import Tile from "../components/tile";
import { useState } from "react";

export const CROSS = 1;
export const CIRCLE = 2;

export const checkPosition = (row, col, grid, turn, endGame) => {
  if (!endGame) {
    return grid[row][col] === 0;
  }
};

export const isWinRow = (grid) => {
  let cross = false;
  let circle = false;

  grid.forEach((row) => {
    if (row.filter((item) => item === CROSS).length === 3) cross = true;
    if (row.filter((item) => item === CIRCLE).length === 3) circle = true;
  });

  return {
    cross,
    circle,
  };
};

export const isWinCol = (grid) => {
  let cross = false;
  let circle = false;

  let colsAsRows = [];

  for (let i = 0; i < grid.length; i++) {
    colsAsRows.push([grid[0][i], grid[1][i], grid[2][i]]);
  }

  colsAsRows.forEach((row) => {
    if (row.filter((item) => item === CROSS).length === 3) cross = true;
    if (row.filter((item) => item === CIRCLE).length === 3) circle = true;
  });

  return {
    cross,
    circle,
  };
};

export const isWinDiagLR = (grid) => {
  let cross = false;
  let circle = false;

  let positions = [];

  grid.forEach((row, index) => {
    positions.push(row[index]);
  });

  if (positions.filter((item) => item === CROSS).length === 3) cross = true;
  if (positions.filter((item) => item === CIRCLE).length === 3) circle = true;

  return {
    cross,
    circle,
  };
};

export const isWinDiagRL = (grid) => {
  let cross = false;
  let circle = false;

  let positions = [];

  grid.forEach((row, index) => {
    positions.push(row[row.length - 1 - index]);
  });

  if (positions.filter((item) => item === CROSS).length === 3) cross = true;
  if (positions.filter((item) => item === CIRCLE).length === 3) circle = true;

  return {
    cross,
    circle,
  };
};

export default function TicTacToe() {
  const INITIAL_GRID = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const [grid, setGrid] = useState([...INITIAL_GRID]);
  const [turn, setTurn] = useState(false);
  const [crossWin, setCrossWin] = useState(false);
  const [circleWin, setCircleWin] = useState(false);
  const [draw, setDraw] = useState(false);
  const [emptyTiles, setEmptyTiles] = useState(0);
  const [endGame, setEndGame] = useState(false);
  const [started, setStarted] = useState(false);
  const [circleScore, setCircleScore] = useState(0);
  const [crossScore, setCrossScore] = useState(0);

  const checkForWinners = () => {
    const resultRow = isWinRow(grid);
    const resultCol = isWinCol(grid);
    const resultDiagLR = isWinDiagLR(grid);
    const resultDiagRL = isWinDiagRL(grid);

    if (
      resultRow.cross ||
      resultCol.cross ||
      resultDiagLR.cross ||
      resultDiagRL.cross
    ) {
      setCrossWin(true);
      setCrossScore(crossScore + 1);
    } else {
      setCrossWin(false);
    }

    if (
      resultRow.circle ||
      resultCol.circle ||
      resultDiagLR.circle ||
      resultDiagRL.circle
    ) {
      setCircleWin(true);
      setCircleScore(circleScore + 1);
    } else {
      setCircleWin(false);
    }

    const overallResult = [
      ...Object.values(resultRow),
      ...Object.values(resultCol),
      ...Object.values(resultDiagLR),
      ...Object.values(resultDiagRL),
    ];

    return !!overallResult.find((item) => !!item);
  };

  const updateGrid = (row, col) => {
    let newGrid = grid;
    setStarted(true);
    if (checkPosition(row, col, newGrid, turn, endGame)) {
      if (turn) {
        newGrid[row][col] = CROSS;
      } else {
        newGrid[row][col] = CIRCLE;
      }

      setGrid([...newGrid]);

      const result = checkForWinners();

      const remainingTiles = newGrid.reduce(
        (total, row) => (total += row.filter((col) => col == 0).length),
        0
      );
      setEmptyTiles(remainingTiles);
      if (!remainingTiles) {
        setEndGame(true);
      }
      if (result) {
        setDraw(false);
        setEndGame(true);
      } else {
        setDraw(true);
      }
      setTurn(!turn);
    }
  };

  const resetGame = () => {
    setGrid([...INITIAL_GRID]);
    setDraw(false);
    setCircleWin(false);
    setCrossWin(false);
    setEndGame(false);
    setTurn(false);
    setStarted(false);
  };

  const changeTurn = () => {
    setTurn(!turn);
  };

  const clearScore = () => {
    setCircleScore(0);
    setCrossScore(0);
  };

  return (
    <div className={styles.container}>
      <main>
        <div>
          <p className={game.score}>Score</p>
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
          {grid.map((row, x) =>
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
          <button disabled={started} onClick={changeTurn}>
            Change Turn
          </button>
          {!!endGame && (
            <div>
              {!!crossWin && <p>'X' is winner!</p>}
              {!!circleWin && <p>'O' is winner!</p>}
              {!!draw && <p>Draw</p>}
              <div className={game.actionsContainer}>
                <button onClick={resetGame}>Reset game</button>
                <button onClick={clearScore}>Clear score</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
