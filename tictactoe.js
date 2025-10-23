// Pub/Sub Module
const PubSub = (function() {
    const events = {};
    function subscribe(event, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        if (!events[event]) {
            events[event] = [];
        }
        // Prevent duplicate subscriptions
        if (!events[event].includes(callback)) {
            events[event].push(callback);
        }
    }
    function publish(event, data) {
        if (events[event]) {
            events[event].forEach(callback => callback(data));
        }
    }
    function unsubscribe(event, callback) {
        if (events[event]) {
            events[event] = events[event].filter(cb => cb !== callback);
        }
    }
    return {subscribe, publish, unsubscribe};
})();

const gameBoard = (function () {
  let gameBoardArr = [null, null, null, null, null, null, null, null, null];
  const row1 = () => {return (isWinningTriple(0,1,2))}
  const row2 = () => {return (isWinningTriple(3,4,5))}
  const row3 = () => {return (isWinningTriple(6,7,8))}
  const col1 = () => {return (isWinningTriple(0,3,6))}
  const col2 = () => {return (isWinningTriple(1,4,7))}
  const col3 = () => {return (isWinningTriple(2,5,8))}
  const diag1 = () => {return (isWinningTriple(0,4,8))}
  const diag2 = () => {return (isWinningTriple(2,4,6))}

  function init() {
      gameBoardArr = [null, null, null, null, null, null, null, null, null];
      document.querySelectorAll('.cellBtn').forEach(cellBtn => {
          cellBtn.addEventListener('click', () => updatePlayOnClick(cellBtn));
        });
  }
  // update the gameboard array on click and publish the click event so other modules can fire on click
  function updatePlayOnClick(cellBtn) {
    if ((isInPlay()) && (cellBtn.textContent === '')){
      if (player1.active) {
        console.log("current player name and symbol is:", player1.name, player1.symbol);
        gameBoardArr[cellBtn.dataset.cellId] = player1.symbol;
        player1.active = false;
        if (isInPlay()) player2.active = true;
      } else if (player2.active) {
        console.log("current player name and symbol is:", player2.name, player2.symbol)
        gameBoardArr[cellBtn.dataset.cellId] = player2.symbol;
        player2.active = false;
        if (isInPlay()) player1.active = true;
      }
      PubSub.publish('button:clicked', { cellBtn, gameBoardArrCopy: [...gameBoardArr] });
    }
  }
  function isWinningTriple(x, y, z) {
    if (((gameBoardArr[x]) === 'X' && (gameBoardArr[y] === 'X') && (gameBoardArr[z] === 'X')) 
       || ((gameBoardArr[x]) === 'O' && (gameBoardArr[y] === 'O') && (gameBoardArr[z] === 'O'))) {
      return true;
      } else {
        return false;
      }
  }
  function isInPlay() {
    if (gameBoardArr.includes(null) && (!row1()) && (!row2()) && (!row3()) && (!col1()) && (!col2()) && (!col3()) && (!diag1()) && (!diag2())) {
       console.log("isInPlay true");
       return true;
    } else {
      console.log("isInPlay false");
      return false;
    }
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
  return { init, isInPlay, result };
})()

function player(name, symbol, active) {
  return { name, active, symbol };
}

const displayController = (function() {
  const resultDisplay = document.querySelector('#resultDisplay');
  function displayOnCellClick({ cellBtn, gameBoardArrCopy }) {
        cellBtn.textContent = gameBoardArrCopy[cellBtn.dataset.cellId];
        cellBtn.style.backgroundColor = '#9bacddff';
        if (!gameBoard.isInPlay()) postResultMsg(); 
  }
  function init() {
    clearResultMsg();
    clearGameBoard();
    PubSub.subscribe('button:clicked', displayOnCellClick);
  }
  function postResultMsg(){
    let result = gameBoard.result();
    if (result ==='tie') resultDisplay.textContent = "IT'S A TIE";
    else if (player1.symbol === result) resultDisplay.textContent = `${player1.name} WINS`;
    else resultDisplay.textContent = `${player2.name} WINS`;
  }
  function clearResultMsg(){
    resultDisplay.textContent = "Play tic tac toe!!!";
  }
  function clearGameBoard(){
    document.querySelectorAll('.cellBtn').forEach(cellBtn => {
      cellBtn.textContent = '';
      cellBtn.style.backgroundColor = 'whitesmoke';
    })
  }
  return {init};
})();



const player1 = player('', 'X', false);
const player2 = player('', 'O', false);

const addPlayersForm = document.getElementById('addPlayersForm');
addPlayersForm.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Form submitted!');
    const formData = new FormData(addPlayersForm);
    player1.name = formData.get('player_one');
    player2.name = formData.get('player_two');
    player1.active = true;
    gameBoard.init();
    displayController.init();
    this.reset();
})







