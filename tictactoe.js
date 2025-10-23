// PubSub Module to mediate events so both gameboard and displayController can act on same click events
const PubSub = (function() {
    const events = {};
    function subscribe(event, callback) {
        if (typeof callback !== 'function') {throw new Error('Callback must be a function');}
        if (!events[event]) {events[event] = [];}
        // Prevent duplicate subscriptions
        if (!events[event].includes(callback)) {events[event].push(callback);}
    }
    function publish(event, data) {
        if (events[event]) {events[event].forEach(callback => callback(data));}
    }
    function unsubscribe(event, callback) {
        if (events[event]) {events[event] = events[event].filter(cb => cb !== callback);}
    }
    return {subscribe, publish, unsubscribe};
})();

const gameBoard = (function () {
  let gameBoardArr = [null, null, null, null, null, null, null, null, null];
  const row1wins = () => {return (isWinningTriple(0,1,2))}
  const row2wins = () => {return (isWinningTriple(3,4,5))}
  const row3wins = () => {return (isWinningTriple(6,7,8))}
  const col1wins = () => {return (isWinningTriple(0,3,6))}
  const col2wins = () => {return (isWinningTriple(1,4,7))}
  const col3wins = () => {return (isWinningTriple(2,5,8))}
  const diag1wins = () => {return (isWinningTriple(0,4,8))}
  const diag2wins = () => {return (isWinningTriple(2,4,6))}

  function init() {
      gameBoardArr = [null, null, null, null, null, null, null, null, null];
      document.querySelectorAll('.cellBtn').forEach(cellBtn => {
          cellBtn.addEventListener('click', () => updatePlayOnClick(cellBtn));
        });
  }
  // update the gameboard array and progress game on click, then publish the click event so display module can fire on click
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
    if (gameBoardArr.includes(null) && (!row1wins()) && (!row2wins()) && (!row3wins()) && (!col1wins()) && (!col2wins()) && (!col3wins()) && (!diag1wins()) && (!diag2wins())) {
       console.log("isInPlay true");
       return true;
    } else {
      console.log("isInPlay false");
      return false;
    }
  }
  function result() {
    if (!isInPlay()){
        if ((row1wins()) || (col1wins()) || (diag1wins())) return gameBoardArr[0];
        else if (row2wins()) return gameBoardArr[3];
        else if (row3wins()) return gameBoardArr[6];
        else if (col2wins()) return gameBoardArr[1];
        else if ((col3wins()) || (diag2wins())) return gameBoardArr[2];
        else return 'tie';
    }
  }
  return { init, isInPlay, result };
})()

function player(name, symbol, active) {
  return { name, symbol, active };
}

const displayController = (function() {
  const resultDisplay = document.querySelector('#resultDisplay');
  const whoseTurnDisplay = document.querySelector('#whoseTurnDisplay');
  function init() {
    clearResultMsg();
    clearGameBoard();
    PubSub.subscribe('button:clicked', displayOnCellClick);
    PubSub.subscribe('formSubmitted', displayOnFormSubmit);
  }
  function displayOnCellClick({ cellBtn, gameBoardArrCopy }) {
        cellBtn.textContent = gameBoardArrCopy[cellBtn.dataset.cellId];
        cellBtn.style.backgroundColor = '#9bacddff';
        if (gameBoard.isInPlay()) {
          if (!player1.active) whoseTurnDisplay.textContent = `${player2.name}'s Turn`
          else whoseTurnDisplay.textContent = `${player1.name}'s Turn`
        }
        else {
          whoseTurnDisplay.textContent = ""
          postResultMsg(); 
        }
  }
  function displayOnFormSubmit() {
    whoseTurnDisplay.textContent = `${player1.name}'s Turn`
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

const gameController = (function() {
  function init() {
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
        PubSub.publish('formSubmitted');
        this.reset();
    })
  }
  return {init};
})()


const player1 = player('', 'X', false);
const player2 = player('', 'O', false);
gameController.init();






