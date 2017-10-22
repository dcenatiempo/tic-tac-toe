var color ="#1a8cff";
// 2 players 0='X' 1='O'
var player = ["X", "O"];

// is human 'X' or 'O'?
var human = 0;

// how smart is AI - depth to search
var intel =0;

// playing board
var board = [
  null, null, null,   // 0, 1, 2
  null, null, null,   // 3, 4, 5
  null, null, null ]; // 6, 7, 8

// winning conditions
var win = [
  [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ],  // horizontal win
  [ 0, 3, 6 ], [ 1, 4, 7 ], [ 2, 5, 8 ],  // verticle win
  [ 0, 4, 8 ], [ 2, 4, 6 ] ];             // diagonal win

// initialize game
function reset() {
  $("#game-over").hide();
  $("#screen").html(
    '<h2>Choose your mark:</h2>' +
    '<div class="intel-cont">' +
      '<button id="l1" class="xo x">X</button><button id="l3" class="xo o">O</button>' +
    '</div>'
  );

  board = [ null, null, null, null, null, null, null, null, null ] ;

  $(".x").click(function(){
    human = 0;
    createBoard();
  });

  $(".o").click(function() {
    human = 1;
    createBoard();
    setTimeout(function() {
      assignCell(nextMove(board));
    },500);
  });
}

// given board b, returns whos turn it currently is: 0 or 1
function whosTurn(b) { 
  var count = 0;
  for ( var i=0; i < b.length; i++ ) {
    if( b[i] === null )
      count++; }
  if ( count % 2 == 0 )
    return 1;		// if even # of empty spaces, it is O's turn
  else return 0;		// if odd # of empty spaces, it is X's turn - X always goes first
}

// returns an array of empty spaces on board
function actions(b) {
  var array = [];
  for ( var i=0; i<b.length; i++){
    if (b[i] == null)
      array.push(i);
  }
  return array;
}

// returns new game board state after action a is taken
function results(b, a) {
  var newBoard = b.map(function(item){ return item;});
  newBoard.splice(a, 1, whosTurn(b));
  return newBoard
}
/*********************************************************************************
* algorithm behind AI https://en.wikipedia.org/wiki/Minimax
* minimax()
* utility()
* terminal()
*********************************************************************************/

/*************************************************************
* minimax()
* AI algorithm for two player zero sum games comprised of
* decision rules for minimizing the possible loss for a
* worst case (maximum loss) scenario.
*************************************************************/
function minimax(b, depth = 0) {
  if (depth >= intel){ // only go as deep as inteligence
    return utility(b, human);}
  if (terminal(b))
    return utility(b, human);
  else if (whosTurn(b) == human){

    var aArray = actions(b);
    var aNew;
    var aMax = -1000;
    for (var i=0; i<aArray.length; i++){
      aNew = minimax(results(b, aArray[i]), depth+1);
      if (aNew > aMax)
        aMax = aNew;
    }
    return aMax;
  }
  else if (whosTurn(b) != human){
    var bArray = actions(b);
    var bNew;
    var bMin = 1000;
    for (var i=0; i<bArray.length; i++){
      bNew = minimax(results(b, bArray[i]), depth+1);
      if (bNew < bMin)
        bMin = bNew;
    }
    return bMin
  }
}

/*************************************************************
* utility()
* returns utility of board b for player p
*************************************************************/
function utility(b, p) {
  var tCount = 0; // total number of occupied squares
  var pCount = 0; // counter for player p squares
  var nCount = 0; // counter for empty/null squares
  var utility = 0;// score this funciton returns

  // count total occupied squares
  for (var x=0; x<b.length; x++){
    if (b[x] !== null)
      tCount++;
  }
  if (tCount == 0)
    return .001;

  for (var i=0; i<win.length; i++){ // loop through each win condition
    for (var j=0; j<win[i].length; j++){
      if (b[win[i][j]] == p)
        pCount++;
      else if(b[win[i][j]] == null)
        nCount++
      }
    if (pCount + nCount == 3) { // row/col/diag is not occupied by opponent
      switch (pCount){
        case 1:				// player has 1 in a row
          utility += 1;
          break;
        case 2:				// player has 2 in a row
          utility += 10;
          break;
        case 3:				// player has won
          utility = 100;
          return utility;
      }
    }
    if (pCount === 0) {		// row/col/diag is not occupied by player
      switch (nCount){
        case 2:				// opponent has 1 in a row
          utility -= 1.01;
          break;
        case 1:				// opponent has 2 in a row
          utility -= 10.1;
          break;
        case 0:				// opponent has won
          utility = -100;
          return utility;
      }
    }
    if (tCount < 9)
      utility += (tCount/100); // prevents false draw 
    pCount = 0;
    nCount = 0;
  }
  return utility;
}

/*************************************************************
* terminal()
* determines if the game is in a terminal state
*************************************************************/
function terminal(b) {
  var u = utility(b, human);
  if (u === 0)
    return true;
  if (Math.abs(u) == 100)
    return true;
  else return false;
}
/*********************************************************************************
* end minimax algorithm
*********************************************************************************/

// picks random empty cell
function randCell(b) {
  return actions(b)[getRand( 0, actions(b).length-1 )];
} 

// returns space of next move for AI
function nextMove(b) {
  // if intel is -1, pick random cell
  if (intel === -1)
    return randCell(b);
  // determines round#
  var rnd = 0;
  for (var x=0; x<b.length; x++){
    if (b[x] !== null)
      rnd++;
  }
  // first round of Level 0 AI
  if (intel === 0) {
    if (rnd === 0 || rnd === 1)
      return randCell(b);
  }
  // first round of Level 1+ AI
  if (intel > 0) {
    if (rnd === 0) {
      //choose one of corners or middle randomly
      var r = getRand(0,4);
      return r*2;
    }
  }

  //subsequent rounds of Level 0+ AI
  var moves = actions(b);
  var move;
  var aNew;
  var aMin = 1000;
  for (var i=0; i< moves.length; i++){
    aNew = minimax(results(b, moves[i]));
    //console.log(moves[i]+" "+aNew)
    if (aNew < aMin){
      aMin = aNew;
      move = moves[i];
    }
  }
  return move;
}

function createBoard(){
  $("#screen").html(
    '<div class="board">' +
      '<div id="0" class="cell"></div><div id="1" class="cell"></div><div id="2" class="cell"></div>' +
      '<div id="3" class="cell"></div><div id="4" class="cell"></div><div id="5" class="cell"></div>' +
      '<div id="6" class="cell"></div><div id="7" class="cell"></div><div id="8" class="cell"></div>' +
    '</div>');
  turnOnBoard();
}

function assignCell(cell){
  drawCell(cell);
  board[cell] = whosTurn(board);
}

function drawCell(cell) {
  $("#" + cell).text(player[whosTurn(board)]);
}
function turnOnBoard() {
  $(".cell").click(function(){
    // check to see if cell picked already
    var picked = $(this).attr('id');
    if (board[picked] == null) {
      assignCell(picked);
      turnOffBoard();
      setTimeout (function(){
        if (isWinner(board) == null){
          assignCell(nextMove(board));
          if (isWinner(board) == null)
            turnOnBoard();
          else endGame(isWinner(board));
        }
        else endGame(isWinner(board));
      },500);
    }
  });
}

function endGame(result) {
  $("#game-over").show();
  if (result == 2){
    $("#message").text('Draw');
    $("#game-over").css("background-color", "rgba(140, 140, 140, .5)");
  }
  else if (result == human){
    $("#message").text('You Win!');
    $("#game-over").css("background-color", "rgba(71, 209, 71, .5)");
  }
  else {
    $("#message").text('You Lose!');
    $("#game-over").css("background-color", "rgba(255, 71, 26, .5)");	
  }
  setTimeout(function(){
    reset();
  }, 2000);
}

function turnOffBoard(){
  $(".cell").off();
}

function isWinner(b) {
  var playa = Math.abs(whosTurn(b)-1);
  var util = utility(b, playa);
  if (util == 100){
    return playa;
  }
  else if (util == 0){
    return 2;
  }
  else {
    return null;
  }
} 

// random number generator, inclusive
function getRand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  //The maximum is inclusive and the minimum is inclusive 
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// control computer AI
$("#l1").click(function(){
  intel = -1;
  $("#l1").css({"background-color": color, "color": "white"});
  $("#l2").css({"background-color": "white", "color": color});
  $("#l3").css({"background-color": "white", "color": color});
});
$("#l2").click(function(){
  intel = 0;
  $("#l1").css({"background-color": "white", "color": color});
  $("#l2").css({"background-color": color, "color": "white"});
  $("#l3").css({"background-color": "white", "color": color});
});
$("#l3").click(function(){
  intel = 1;
  $("#l1").css({"background-color": "white", "color": color});
  $("#l2").css({"background-color": "white", "color": color});
  $("#l3").css({"background-color": color, "color": "white"});
});

reset();
$("#l1").click();