
const gameBoard = (function () {
  const gameBoardArr = [null, null,null, null, null, null, null,null,null];
  let lastPlayedCell = 0;
  const row1 = () => {return (isWinningTriple(0,1,2))}
  const row2 = () => {return (isWinningTriple(3,4,5))}
  const row3 = () => {return (isWinningTriple(6,7,8))}
  const col1 = () => {return (isWinningTriple(0,3,6))}
  const col2 = () => {return (isWinningTriple(1,4,7))}
  const col3 = () => {return (isWinningTriple(2,5,8))}
  const diag1 = () => {return (isWinningTriple(0,4,8))}
  const diag2 = () => {return (isWinningTriple(2,4,6))}
  function isWinningTriple(x, y, z) {
    if (((gameBoardArr[x]) === 'X' && (gameBoardArr[y] === 'X') && (gameBoardArr[z] === 'X')) 
       || ((gameBoardArr[x]) === 'O' && (gameBoardArr[y] === 'O') && (gameBoardArr[z] === 'O'))) {
      return true;
      } else {
        return false;
      }
  }
  function isInPlay() {
    console.log("row1:", row1());
    if (gameBoardArr.includes(null) && (!row1()) && (!row2()) && (!row3()) && (!col1()) && (!col2()) && (!col3()) && (!diag1()) && (!diag2())) {
       console.log("isInPlay true");
       return true;
    } else {
      console.log("isInPlay false");
      return false;
    }
  }
  function updatePlay(player) {
    console.log("current player symbol is:", player.symbol)
    gameBoardArr[player.currentCell] = player.symbol;
    // console.log("gameboard index being updated is", player.currentCell);
    // console.log("gameboard array value is", gameBoardArr[player.currentCell]);
    lastPlayedCell = player.currentCell;
  }
  function result() {
    if (!isInPlay()){
        if ((row1()) || (col1()) || (diag1())) return gameBoardArr[0];
        else if (row2()) return gameBoardArr[3];
        else if (row3()) return gameBoardArr[6];
        else if (col2()) return gameBoardArr[1];
        else if ((col3()) || (diag2())) return gameBoardArr[2];
        else return 'tie';
    }
  }
  return { gameBoardArr, isInPlay, updatePlay, result };
})()

function player(name, symbol, active, score) {
  let currentCell;
  return { name, active, symbol, currentCell, score };
}

const displayController = (function() {
  // const scoreDisplay = document.querySelector('#scoreDisplay');
  const resultDisplay = document.querySelector('#resultDisplay');
  const cellBtns = document.querySelectorAll('.cellBtn');
  // scoreDisplay.textContent = '';
  // playerDisplay.textContent = '';
  function updateDisplay(gameBoard) { 
    cellBtns.forEach((cellBtn) => {
      cellBtn.innerText = gameBoard.gameBoardArr[cellBtn.dataset.cellId];
    })
  }
  // function updateScore(result){

  // }
  function postResultMsg(result){
    if (result==='tie') resultDisplay.textContent = 'IT A TIE';
    else resultDisplay.textContent = `${result} WINS`;
  }

  return {updateDisplay, postResultMsg};
})();


const player1 = player('john', 'X', false, 0);
const player2 = player('jane', 'O', false, 0);
player1.active = true;
const cellBtns = document.querySelectorAll('.cellBtn');
cellBtns.forEach((cellBtn) => {
  cellBtn.addEventListener("click", (event) => {
    currentCell = event.target.dataset.cellId;   
    if (gameBoard.isInPlay()) { 
      if (player1.active) {
        console.log("in play - player1:", player1.name);
        player1.currentCell = currentCell;
        gameBoard.updatePlay(player1);
        player1.active = false;
        player2.active = true;
      }else if (player2.active) {
        console.log("in play - player2:", player2.name);
        player2.currentCell = currentCell;
        gameBoard.updatePlay(player2);
        player2.active = false;
        player1.active = true;
      }
      console.log("Gameboard array currentCell index is", currentCell);
      console.log("Gameboard array currentCell value is", gameBoard.gameBoardArr[currentCell]);
      displayController.updateDisplay(gameBoard);
    } else {
        if (gameBoard.result() === 'tie') displayController.postResultMsg('tie');
        else if (gameBoard.result() === player1.symbol) displayController.postResultMsg(player1.name);
        else displayController.postResultMsg(player2.name);
    }
  })
})


// if (gameBoard.result() === 'tie') displayController.postResult('tie')
// else if (gameBoard.result() === player1.symbol) displayController.postResult(player1.name)
// else displayController.postResult(player2.name)
    



