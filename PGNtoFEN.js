fenPositions = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
chessBoardArray = 
  [
  'r','n','b','q','k','b','n','r',
  'p','p','p','p','p','p','p','p',
  '1','1','1','1','1','1','1','1',
  '1','1','1','1','1','1','1','1',
  '1','1','1','1','1','1','1','1',
  '1','1','1','1','1','1','1','1',
  'P','P','P','P','P','P','P','P',
  'R','N','B','Q','K','B','N','R'
]
whiteMove = true
encroissantSquare = '-'
castlingRights = 'KQkq'
halfMoves = 0
moveNumber = 0
lastMove = 'First move'

function printFEN() {
  return getFENpositions() + ' ' + (whiteMove ? 'w' : 'b') + ' ' + (castlingRights ? castlingRights : '-') + ' ' + encroissantSquare  + ' ' + halfMoves + ' ' + moveNumber
}

function getFENpositions() {
  currentFEN = ''
  rowEnds = [8, 16, 24, 32, 40, 48, 56, 64]
  rowEnds.forEach(n => {
    blankSquares = 0
    chessBoardArray.slice(n-8, n).forEach(i => {
      if (i !== '1') {
        if (blankSquares > 0) {
          currentFEN += blankSquares
          blankSquares = 0
        }
        currentFEN += i
      }
      else {
        blankSquares += 1
      }
    })
    if (blankSquares > 0) {
      currentFEN += blankSquares
      blankSquares = 0
    }
    currentFEN += '/'
  })
  currentFEN = currentFEN.slice(0,-1)
  return currentFEN
}

function getMoves(pgn) {
  linesCount = pgn.split(/\r\n|\r|\n/).length
  moves = pgn.match(/(1\.).*/gm)[0]
  return moves
}


module.exports = { printFEN, getMoves }