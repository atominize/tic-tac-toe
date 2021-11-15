import React from "react";
import reactDom from "react-dom";
import "./index.css";

const Square = (props) => {
  const [a, b, c] = props.winnerSquares;
  const highlight =
    props.squareNumber === a ||
    props.squareNumber === b ||
    props.squareNumber === c
      ? " highlight"
      : "";
  return (
    <button className={"square" + highlight} onClick={props.onClick}>
      {props.value}
    </button>
  );
};

const Move = (props) => {
  return (
    <li>
      <button className={props.bold} onClick={() => props.jumpTo(props.move)}>
        {props.desc}
      </button>
    </li>
  );
};
class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        squareNumber={i}
        winnerSquares={this.props.winnerSquares}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        {[0, 3, 6].map((row) => {
          return (
            <div key={row} className="board-row">
              {[0, 1, 2].map((column) => {
                return this.renderSquare(row + column);
              })}
            </div>
          );
        })}
        {/* <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div> */}
      </div>
    );
  }
}

const Info = (props) => {
  const formatLocation = (location) => {
    const row = Math.floor(location / 3) + 1;
    const column = (location % 3) + 1;
    return `(${column}, ${row})`;
  };

  const moves = props.history.map((step, move) => {
    const desc = step.moveNumber
      ? `#${step.moveNumber} Go to` + formatLocation(step.location)
      : "Go to game start";

    const newStep = props.isAsc
      ? step.moveNumber
      : props.history.length - step.moveNumber - 1;

    const bold = newStep === props.stepNumber ? "bold-move" : "";

    return (
      <>
        <Move
          key={move}
          move={newStep}
          jumpTo={props.jumpTo}
          desc={desc}
          bold={bold}
        />
      </>
    );
  });

  return (
    <>
      <div>{props.status}</div>
      <div>{props.toggleSort}</div>
      <ol>{moves}</ol>
    </>
  );
};

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          location: null,
          moveNumber: 0,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      isAsc: true,
      bold: "",
      highlight: "",
    };
  }

  handleSorting = () => {
    const sortedHistory = this.state.isAsc
      ? this.state.history.slice().sort((a, b) => {
          // console.log(a);
          return b.moveNumber - a.moveNumber;
        })
      : this.state.history.slice().sort((a, b) => {
          return a.moveNumber - b.moveNumber;
        });
    // console.log(sortedHistory);
    this.setState({
      history: sortedHistory,
      stepNumber: sortedHistory.length - this.state.stepNumber - 1,
      isAsc: !this.state.isAsc,
    });
    // console.log(this.state.stepNumber, sortedHistory.length);
  };

  handleClick = (i) => {
    let history;
    if (this.state.isAsc) {
      history = this.state.history.slice(0, this.state.stepNumber + 1);
      // console.log(history);
    } else {
      history = this.state.history;
      // console.log(history);
      history = history.slice(this.state.stepNumber, history.length);
      // console.log(history);
      // return;
    }
    const current = history[this.state.isAsc ? history.length - 1 : 0];
    // console.log(current);
    const squares = current.squares.slice();
    const currentMoveNumber = current.moveNumber;
    if (calculateWinner(squares)[0] || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";

    const newObj = {
      squares: squares,
      location: i,
      moveNumber: currentMoveNumber + 1,
    };

    this.setState({
      history: this.state.isAsc
        ? history.concat([newObj])
        : [newObj].concat(history),
      stepNumber: this.state.isAsc ? history.length : 0,
      xIsNext: !this.state.xIsNext,
    });
    // console.log(this.state.stepNumber);
  };

  jumpTo = (step) => {
    // console.log(this.state.history[step].squares);
    // console.log(step);
    // const histLength = this.state.history.length;
    // console.log(histLength);
    // const newStep = this.state.isAsc ? step : histLength - step - 1;
    // const bold = newStep === this.state.stepNumber ? "bold-move" : "";

    this.setState({
      stepNumber: step,
      xIsNext: this.state.isAsc ? step % 2 === 0 : step % 2 === 1,
      // bold: bold,
    });
  };

  render() {
    const history = this.state.history;
    // console.log(history);
    const current = history[this.state.stepNumber];
    // console.log(this.state.stepNumber);
    const winnerArray = calculateWinner(current.squares);
    const winner = winnerArray[0];
    const winnerSquares = winnerArray[1];
    // console.log(winnerSquares);

    const sort = this.state.isAsc ? "Asc" : "Des";
    const toggleSort = <button onClick={this.handleSorting}>{sort}</button>;

    let [a, b, c] = [-1, -1, -1];
    let status;
    if (winner) {
      status = "Winner: " + winner;
      [a, b, c] = winnerSquares;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    // console.log(history);
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerSquares={[a, b, c]}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <Info
            history={history}
            stepNumber={this.state.stepNumber}
            jumpTo={this.jumpTo}
            status={status}
            toggleSort={toggleSort}
            isAsc={this.state.isAsc}
            bold={this.state.bold}
          />
        </div>
      </div>
    );
  }
}

// ========================================

reactDom.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], [a, b, c]];
    }
  }
  return [null, null];
}
