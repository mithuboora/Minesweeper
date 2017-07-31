
function newGame(difficulty) {

  switch (difficulty) {
      case 'easy':
          board = new Board(6,8);
          break;
      case 'hard':
          board = new Board(12, 15);
          break;
      case 'medium':
      default:
          board = new Board(8, 10);
          break;
  }
  board.render();
  board.gameOver = false;

  $('.boxx').click(function (eventObject) {
      board.click(eventObject.target);
  });

  return board;
}


function Board(row, col){
  this.row = row;
  this.col = col;
  this.boxxs = [];
  this.gameOver = false;
  this.boxxsCleared = 0;
  this.bombCount = 0;

  this.click = function (target_elem) {
      var row = $(target_elem).attr("data-row");
      var col = $(target_elem).attr("data-col");


      if (this.gameOver === true) {
          return;
      }

      if (this.boxxs[row - 1][col - 1].explored == true) {
          return;
      }

      if (this.boxxs[row - 1][col - 1].holds == -1) {
          this.explode();
      } else if (this.boxxs[row - 1][col - 1].holds == 0) {
          this.clear(row - 1, col - 1);
          uncoverSurroundings.call(this, row - 1, col - 1);
      } else {
          this.clear(row - 1, col - 1);
      }
  }

  this.render = function() {
      var boxxs = "";
      for (i = 1; i <= row; i++) {
          for (j = 1; j <= col; j++) {
              boxxs = boxxs.concat('<div class="boxx" data-row="' + i + '" data-col="' + j + '">&nbsp;</div>');
          }
          boxxs = boxxs.concat('<br />');
      }
      $('#board').empty();
      $('#board').append(boxxs);
  }

  this.explode = function() {
      for (i = 0; i < this.row; i++) {
          for (j = 0; j < this.col; j++) {
              if (this.boxxs[i][j].holds == -1) {
                  var dom_target = 'div[data-row="' + (i + 1) + '"][data-col="' + (j + 1) + '"]';
                  $(dom_target).addClass('bomb');
                  $(dom_target).html('<i class="fa fa-bomb"></i>');
              }
          }
      }
      this.gameOver = true;
      $('#new-game').show();
  }

  var numBombNear = function(row, col) {
      var sum = 0;

      if (this.boxxs[row][col].holds == -1) {
          return -1;
      }

      sum += valueAt.call(this, row - 1, col - 1) + valueAt.call(this, row - 1, col) + valueAt.call(this, row - 1, col + 1)
          + valueAt.call(this, row, col - 1) + valueAt.call(this, row, col + 1)
          + valueAt.call(this, row + 1, col - 1) + valueAt.call(this, row + 1, col) + valueAt.call(this, row + 1, col + 1);

      return sum;
  }

  function valueAt(row, col) {
      if (row < 0 || row >= this.row || col < 0 || col >= this.col) {
          return 0;
      } else if(this.boxxs[row][col].holds == -1){
          return 1;
      } else {
          return 0;
      }
  }

  if (this.boxxs !== undefined) {
      this.boxxs = new Array(this.row);

      for (i = 0; i < this.row; i++) {
          this.boxxs[i] = new Array(this.col);
          for (j = 0; j < this.col; j++) {
              this.boxxs[i][j] = new boxx(false, 0);
          }
      }

      var min = 1;
      var max = this.row * this.col;
      this.bombCount = Math.round((Math.random() * ((max / 2) - min) + (min)));
      $('#value').html(this.bombCount);
      for (i = 0; i < this.bombCount; i++) {
          var bombIndex = Math.round(Math.random() * (max - 1));
          var x = Math.floor(bombIndex / this.col);
          var y = bombIndex % this.col;
          this.boxxs[x][y] = new boxx(false, -1);
      }

      for (i = 0; i < this.row; i++) {
          for (j = 0; j < this.col; j++) {
              this.boxxs[i][j].holds = numBombNear.call(this, i, j);
          }
      }
  }

  this.clear = function (row, col) {
      var dom_target = 'div[data-row="' + (row + 1) + '"][data-col="' + (col + 1) + '"]';
      $(dom_target).addClass('safe');
      if (this.boxxs[row][col].holds > 0) {
          $(dom_target).text(this.boxxs[row][col].holds);
      } else {
          $(dom_target).html('&nbsp');
      }
      checkAllCellsExplored.call(this);
      this.boxxsCleared++;
      this.boxxs[row][col].explored = true;
  }

  function checkAllCellsExplored(){
      if (this.row * this.col - this.boxxsCleared == this.bombCount) {
          for (i = 0; i < this.row; i++) {
              for (j = 0; j < this.col; j++) {
                  if (this.boxxs[i][j].holds == -1) {
                      var bomb_target = 'div[data-row="' + (i + 1) + '"][data-col="' + (j + 1) + '"]';
                      $(bomb_target).html('<i class="fa fa-smile-o"></i>');
                      this.gameOver = true;
                      $('#new-game').show();
                  }
              }
          }
      }
  }

  function uncoverSurroundings(row, col) {
      checkboxx.call(this, row - 1, col - 1); checkboxx.call(this, row - 1, col); checkboxx.call(this, row - 1, col + 1);
      checkboxx.call(this, row, col - 1); checkboxx.call(this, row, col + 1);
      checkboxx.call(this, row + 1, col - 1); checkboxx.call(this, row + 1, col); checkboxx.call(this, row + 1, col + 1);
      checkAllCellsExplored.call(this);
  }

  function checkboxx(row, col) {
      if (row < 0 || row >= this.row || col < 0 || col >= this.col || this.boxxs[row][col].explored == true) {
          return;
      } else if (this.boxxs[row][col].holds >= 0) {
          this.clear(row, col);
          if (this.boxxs[row][col].holds == 0) {
              uncoverSurroundings.call(this, row, col);
              return;
          }
      }
  }
}


function boxx(explored, holds){
  this.explored = explored;
  this.holds = holds;
}
