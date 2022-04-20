import { useEffect, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { Alert, Button, ButtonGroup, Col, Row } from "reactstrap";
import Queen from "./Queen";

export default function Board() {
  const cols = [50, 150, 250, 350, 450, 550, 650, 750];
  const rows = [45, 145, 245, 345, 445, 545, 645, 745];

  const [error, setError] = useState(null);
  const [board, setBoard] = useState([]);
  const [queens, setQueens] = useState(0);

  const [index, setIndex] = useState(0);
  const [state, setState] = useState(new Array(9).fill(null));

  const boardSize = 7;

  let isPrevDisabled = index <= 1;
  let isNextDisabled = state[index] !== null && index < 9 ? false : true;

  const fillBoard = () => {
    const gState = [...state];
    const boardData = new Array(8).fill().map(() =>
      Array(8)
        .fill()
        .map(
          (e) =>
            (e = {
              hasAQueen: false,
              isConflict: false,
              id: Math.floor(Math.random() * 1000),
            })
        )
    );
    gState[index] = {
      queens,
      board: JSON.parse(JSON.stringify(boardData)),
    };
    setIndex(index + 1);
    setState(gState);

    setBoard(boardData);
  };

  const resetBoard = () => {
    let boardData = [...board];

    boardData.forEach((col) =>
      col.forEach((element) => {
        element.hasAQueen = false;
        element.isConflict = false;
      })
    );
    
    setBoard(boardData);
    return boardData
  };

  useEffect(() => {
    fillBoard();
  }, []);

  const changeDiagonalStatus = (colIndex, rowIndex, inConflict) => {
    const boardData = [...board];

    boardData[colIndex][rowIndex].hasAQueen = inConflict;

    boardData.forEach((row) => (row[rowIndex].isConflict = inConflict)); // ** Horizontal
    boardData[colIndex].forEach((cell) => (cell.isConflict = inConflict)); // ** Vertical

    let c, r;
    // ** ↘
    if (colIndex >= rowIndex) {
      c = colIndex - rowIndex;
      r = 0;
    } else {
      c = 0;
      r = rowIndex - colIndex;
    }
    while (c <= 7 && r <= 7) {
      boardData[c][r].isConflict = inConflict;
      c++;
      r++;
    }

    // ** ↙
    if (colIndex + rowIndex <= 7) {
      c = rowIndex + colIndex;
      r = 0;
    } else {
      c = 7;
      r = rowIndex + colIndex - c;
    }
    while (c >= 0 && r <= 7) {
      boardData[c][r].isConflict = inConflict;
      c--;
      r++;
    }

    setBoard(boardData);
  };

  const putCellsInConflict = () => {
    const boardData = [...board];

    for (let colIndex = 0; colIndex < 8; colIndex++) {
      for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        if (boardData[colIndex][rowIndex].hasAQueen) {
          // ** Horizontal
          boardData.forEach((row) => (row[rowIndex].isConflict = true));

          // ** Vertical
          boardData[colIndex].forEach((cell) => (cell.isConflict = true));

          let c, r;
          // ** ↘
          if (colIndex >= rowIndex) {
            c = colIndex - rowIndex;
            r = 0;
          } else {
            c = 0;
            r = rowIndex - colIndex;
          }
          while (c <= boardSize && r <= boardSize) {
            boardData[c][r].isConflict = true;
            c++;
            r++;
          }

          // ** ↙
          if (colIndex + rowIndex <= boardSize) {
            c = rowIndex + colIndex;
            r = 0;
          } else {
            c = boardSize;
            r = rowIndex + colIndex - c;
          }
          while (c >= 0 && r <= boardSize) {
            boardData[c][r].isConflict = true;
            c--;
            r++;
          }
          setBoard(boardData);
        }
      }
    }
  };

  const addQueenToBoard = ({ x, y }) => {
    const boardData = [...board];

    const colIndex = rows.findIndex((r) => r === x);
    const rowIndex = cols.findIndex((c) => c === y);

    if (
      !(
        boardData[colIndex][rowIndex].isConflict ||
        boardData[colIndex][rowIndex].hasAQueen
      )
    ) {
      setError(null);
      const row = { ...boardData[colIndex][rowIndex] };
      row.hasAQueen = true;
      boardData[colIndex][rowIndex] = row;

      setBoard(boardData);
      setQueens(queens + 1);

      return [queens + 1, boardData];
    } else {
      setError("Invalid cell");
      return [queens, boardData];
    }
  };

  const deleteAQueen = ({ x, y }) => {
    const boardData = [...board];

    const colIndex = rows.findIndex((r) => r === x);
    const rowIndex = cols.findIndex((c) => c === y);

    changeDiagonalStatus(colIndex, rowIndex, false);
    setBoard(boardData);
    setQueens(queens - 1);
  };

  function clone(obj) {
    let copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

  const saveState = (currentState) => {
    const gState = JSON.parse(JSON.stringify(state));

    const obj = clone({ ...gState[index] });

    obj.queens = currentState[0];
    obj.board = JSON.parse(JSON.stringify(currentState[1]));

    gState[index] = obj;

    for (let i = index + 1; i < 9; i++) {
      gState[i] = null;
    }

    setIndex(index + 1);
    setState(gState);
  };

  const handleClick = (e) => {
    const currentState = addQueenToBoard({
      x: e.target.attrs.x,
      y: e.target.attrs.y,
    });
    putCellsInConflict();

    saveState(currentState);
  };

  const handleReset = () => {

    let gState = [...state];
    gState = new Array(9).fill(null);

    const x = resetBoard();

    gState[0] = {
      queens: 0,
      board: JSON.parse(JSON.stringify(x))
    }

    setState(gState)
    setIndex(1)
    setQueens(0);
    setError(null);
  };

  const handleDelete = (e) => {
    deleteAQueen({
      x: e.target.attrs.x,
      y: e.target.attrs.y,
    });
    putCellsInConflict();
    setError(null);
  };

  const handlePrev = () => {
    const gState = [...state];
    const data = clone({ ...gState[index - 2] });

    setBoard(data.board);
    setError(data.error);
    setQueens(data.queens);
    setIndex(index - 1);
  };

  const handleNext = () => {
    const gState = [...state];
    const data = clone({ ...gState[index] });

    setBoard(data.board);
    setError(data.error);
    setQueens(data.queens);
    setIndex(index + 1);
  };

  return (
    <Row>
      <Col md="3" className="d-flex justify-content-center mt-5">
        <div>
          <Button color="primary" onClick={handleReset}>
            Reset
          </Button>

          <div className="mt-4">
            <ButtonGroup>
              <Button
                className="xxx"
                color="primary"
                disabled={isPrevDisabled}
                onClick={handlePrev}
              >
                Prev
              </Button>
              <Button
                className="xxx"
                color="primary"
                disabled={isNextDisabled}
                onClick={handleNext}
              >
                Next
              </Button>
            </ButtonGroup>
          </div>

          {queens === 8 && <Alert color="success mt-4">You Win!</Alert>}
          {error && <Alert color="danger mt-4">{error}</Alert>}
        </div>
      </Col>
      <Col className="d-flex justify-content-center mt-2">
        <Stage width={900} height={900}>
          <Layer>
            {board.map((row, j) =>
              row.map((rect, i) => {
                let number = j + i + 2;
                return (
                  <Rect
                    key={i}
                    x={rows[j]}
                    y={cols[i]}
                    width={100}
                    height={100}
                    fill={number % 2 === 0 ? "#3b3b3b" : "#d6d6d6"}
                    onClick={handleClick}
                  />
                );
              })
            )}
            {board.map((e, i) =>
              e.map((r, j) => {
                if (board[i][j].hasAQueen) {
                  return (
                    <Queen
                      key={i}
                      x={rows[i]}
                      y={cols[j]}
                      onDelete={handleDelete}
                    />
                  );
                }
              })
            )}
          </Layer>
        </Stage>
      </Col>
    </Row>
  );
}
