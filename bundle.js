(function (d3$1) {
  'use strict';

  const SYMBOLS = 'pnbrqkPNBRQK';

  const DEFAULT_POSITION =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const TERMINATION_MARKERS = ['1-0', '0-1', '1/2-1/2', '*'];

  const PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15],
  };

  const PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1],
  };

  // prettier-ignore
  const ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
  ];

  // prettier-ignore
  const RAYS = [
     17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
      0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
      0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
      0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
      0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
      1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
      0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
      0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
      0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
      0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
    -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
  ];

  const SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

  const BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64,
  };

  const RANK_1 = 7;
  const RANK_2 = 6;
  const RANK_7 = 1;
  const RANK_8 = 0;

  // prettier-ignore
  const SQUARE_MAP = {
    a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
    a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
    a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
    a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
    a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
    a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
    a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
  };

  const ROOKS = {
    w: [
      { square: SQUARE_MAP.a1, flag: BITS.QSIDE_CASTLE },
      { square: SQUARE_MAP.h1, flag: BITS.KSIDE_CASTLE },
    ],
    b: [
      { square: SQUARE_MAP.a8, flag: BITS.QSIDE_CASTLE },
      { square: SQUARE_MAP.h8, flag: BITS.KSIDE_CASTLE },
    ],
  };

  const PARSER_STRICT = 0;
  const PARSER_SLOPPY = 1;

  /* this function is used to uniquely identify ambiguous moves */
  function get_disambiguator(move, moves) {
    var from = move.from;
    var to = move.to;
    var piece = move.piece;

    var ambiguities = 0;
    var same_rank = 0;
    var same_file = 0;

    for (var i = 0, len = moves.length; i < len; i++) {
      var ambig_from = moves[i].from;
      var ambig_to = moves[i].to;
      var ambig_piece = moves[i].piece;

      /* if a move of the same piece type ends on the same to square, we'll
       * need to add a disambiguator to the algebraic notation
       */
      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++;

        if (rank(from) === rank(ambig_from)) {
          same_rank++;
        }

        if (file(from) === file(ambig_from)) {
          same_file++;
        }
      }
    }

    if (ambiguities > 0) {
      /* if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      if (same_rank > 0 && same_file > 0) {
        return algebraic(from)
      } else if (same_file > 0) {
        /* if the moving piece rests on the same file, use the rank symbol as the
         * disambiguator
         */
        return algebraic(from).charAt(1)
      } else {
        /* else use the file symbol */
        return algebraic(from).charAt(0)
      }
    }

    return ''
  }

  function infer_piece_type(san) {
    var piece_type = san.charAt(0);
    if (piece_type >= 'a' && piece_type <= 'h') {
      var matches = san.match(/[a-h]\d.*[a-h]\d/);
      if (matches) {
        return undefined
      }
      return PAWN
    }
    piece_type = piece_type.toLowerCase();
    if (piece_type === 'o') {
      return KING
    }
    return piece_type
  }

  // parses all of the decorators out of a SAN string
  function stripped_san(move) {
    return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '')
  }

  /*****************************************************************************
   * UTILITY FUNCTIONS
   ****************************************************************************/
  function rank(i) {
    return i >> 4
  }

  function file(i) {
    return i & 15
  }

  function algebraic(i) {
    var f = file(i),
      r = rank(i);
    return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1)
  }

  function swap_color(c) {
    return c === WHITE ? BLACK : WHITE
  }

  function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1
  }

  function clone(obj) {
    var dupe = obj instanceof Array ? [] : {};

    for (var property in obj) {
      if (typeof property === 'object') {
        dupe[property] = clone(obj[property]);
      } else {
        dupe[property] = obj[property];
      }
    }

    return dupe
  }

  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '')
  }

  /***************************************************************************
   * PUBLIC CONSTANTS
   **************************************************************************/

  const BLACK = 'b';
  const WHITE = 'w';

  const EMPTY = -1;

  const PAWN = 'p';
  const KNIGHT = 'n';
  const BISHOP = 'b';
  const ROOK = 'r';
  const QUEEN = 'q';
  const KING = 'k';

  const FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q',
  };

  const Chess = function (fen) {
    var board = new Array(128);
    var kings = { w: EMPTY, b: EMPTY };
    var turn = WHITE;
    var castling = { w: 0, b: 0 };
    var ep_square = EMPTY;
    var half_moves = 0;
    var move_number = 1;
    var history = [];
    var header = {};
    var comments = {};

    /* if the user passes in a fen string, load it, else default to
     * starting position
     */
    if (typeof fen === 'undefined') {
      load(DEFAULT_POSITION);
    } else {
      load(fen);
    }

    function clear(keep_headers) {
      if (typeof keep_headers === 'undefined') {
        keep_headers = false;
      }

      board = new Array(128);
      kings = { w: EMPTY, b: EMPTY };
      turn = WHITE;
      castling = { w: 0, b: 0 };
      ep_square = EMPTY;
      half_moves = 0;
      move_number = 1;
      history = [];
      if (!keep_headers) header = {};
      comments = {};
      update_setup(generate_fen());
    }

    function prune_comments() {
      var reversed_history = [];
      var current_comments = {};
      var copy_comment = function (fen) {
        if (fen in comments) {
          current_comments[fen] = comments[fen];
        }
      };
      while (history.length > 0) {
        reversed_history.push(undo_move());
      }
      copy_comment(generate_fen());
      while (reversed_history.length > 0) {
        make_move(reversed_history.pop());
        copy_comment(generate_fen());
      }
      comments = current_comments;
    }

    function reset() {
      load(DEFAULT_POSITION);
    }

    function load(fen, keep_headers) {
      if (typeof keep_headers === 'undefined') {
        keep_headers = false;
      }

      var tokens = fen.split(/\s+/);
      var position = tokens[0];
      var square = 0;

      if (!validate_fen(fen).valid) {
        return false
      }

      clear(keep_headers);

      for (var i = 0; i < position.length; i++) {
        var piece = position.charAt(i);

        if (piece === '/') {
          square += 8;
        } else if (is_digit(piece)) {
          square += parseInt(piece, 10);
        } else {
          var color = piece < 'a' ? WHITE : BLACK;
          put({ type: piece.toLowerCase(), color: color }, algebraic(square));
          square++;
        }
      }

      turn = tokens[1];

      if (tokens[2].indexOf('K') > -1) {
        castling.w |= BITS.KSIDE_CASTLE;
      }
      if (tokens[2].indexOf('Q') > -1) {
        castling.w |= BITS.QSIDE_CASTLE;
      }
      if (tokens[2].indexOf('k') > -1) {
        castling.b |= BITS.KSIDE_CASTLE;
      }
      if (tokens[2].indexOf('q') > -1) {
        castling.b |= BITS.QSIDE_CASTLE;
      }

      ep_square = tokens[3] === '-' ? EMPTY : SQUARE_MAP[tokens[3]];
      half_moves = parseInt(tokens[4], 10);
      move_number = parseInt(tokens[5], 10);

      update_setup(generate_fen());

      return true
    }

    /* TODO: this function is pretty much crap - it validates structure but
     * completely ignores content (e.g. doesn't verify that each side has a king)
     * ... we should rewrite this, and ditch the silly error_number field while
     * we're at it
     */
    function validate_fen(fen) {
      var errors = {
        0: 'No errors.',
        1: 'FEN string must contain six space-delimited fields.',
        2: '6th field (move number) must be a positive integer.',
        3: '5th field (half move counter) must be a non-negative integer.',
        4: '4th field (en-passant square) is invalid.',
        5: '3rd field (castling availability) is invalid.',
        6: '2nd field (side to move) is invalid.',
        7: "1st field (piece positions) does not contain 8 '/'-delimited rows.",
        8: '1st field (piece positions) is invalid [consecutive numbers].',
        9: '1st field (piece positions) is invalid [invalid piece].',
        10: '1st field (piece positions) is invalid [row too large].',
        11: 'Illegal en-passant square',
      };

      /* 1st criterion: 6 space-seperated fields? */
      var tokens = fen.split(/\s+/);
      if (tokens.length !== 6) {
        return { valid: false, error_number: 1, error: errors[1] }
      }

      /* 2nd criterion: move number field is a integer value > 0? */
      if (isNaN(tokens[5]) || parseInt(tokens[5], 10) <= 0) {
        return { valid: false, error_number: 2, error: errors[2] }
      }

      /* 3rd criterion: half move counter is an integer >= 0? */
      if (isNaN(tokens[4]) || parseInt(tokens[4], 10) < 0) {
        return { valid: false, error_number: 3, error: errors[3] }
      }

      /* 4th criterion: 4th field is a valid e.p.-string? */
      if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
        return { valid: false, error_number: 4, error: errors[4] }
      }

      /* 5th criterion: 3th field is a valid castle-string? */
      if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
        return { valid: false, error_number: 5, error: errors[5] }
      }

      /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
      if (!/^(w|b)$/.test(tokens[1])) {
        return { valid: false, error_number: 6, error: errors[6] }
      }

      /* 7th criterion: 1st field contains 8 rows? */
      var rows = tokens[0].split('/');
      if (rows.length !== 8) {
        return { valid: false, error_number: 7, error: errors[7] }
      }

      /* 8th criterion: every row is valid? */
      for (var i = 0; i < rows.length; i++) {
        /* check for right sum of fields AND not two numbers in succession */
        var sum_fields = 0;
        var previous_was_number = false;

        for (var k = 0; k < rows[i].length; k++) {
          if (!isNaN(rows[i][k])) {
            if (previous_was_number) {
              return { valid: false, error_number: 8, error: errors[8] }
            }
            sum_fields += parseInt(rows[i][k], 10);
            previous_was_number = true;
          } else {
            if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
              return { valid: false, error_number: 9, error: errors[9] }
            }
            sum_fields += 1;
            previous_was_number = false;
          }
        }
        if (sum_fields !== 8) {
          return { valid: false, error_number: 10, error: errors[10] }
        }
      }

      if (
        (tokens[3][1] == '3' && tokens[1] == 'w') ||
        (tokens[3][1] == '6' && tokens[1] == 'b')
      ) {
        return { valid: false, error_number: 11, error: errors[11] }
      }

      /* everything's okay! */
      return { valid: true, error_number: 0, error: errors[0] }
    }

    function generate_fen() {
      var empty = 0;
      var fen = '';

      for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
        if (board[i] == null) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          var color = board[i].color;
          var piece = board[i].type;

          fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
        }

        if ((i + 1) & 0x88) {
          if (empty > 0) {
            fen += empty;
          }

          if (i !== SQUARE_MAP.h1) {
            fen += '/';
          }

          empty = 0;
          i += 8;
        }
      }

      var cflags = '';
      if (castling[WHITE] & BITS.KSIDE_CASTLE) {
        cflags += 'K';
      }
      if (castling[WHITE] & BITS.QSIDE_CASTLE) {
        cflags += 'Q';
      }
      if (castling[BLACK] & BITS.KSIDE_CASTLE) {
        cflags += 'k';
      }
      if (castling[BLACK] & BITS.QSIDE_CASTLE) {
        cflags += 'q';
      }

      /* do we have an empty castling flag? */
      cflags = cflags || '-';
      var epflags = ep_square === EMPTY ? '-' : algebraic(ep_square);

      return [fen, turn, cflags, epflags, half_moves, move_number].join(' ')
    }

    function set_header(args) {
      for (var i = 0; i < args.length; i += 2) {
        if (typeof args[i] === 'string' && typeof args[i + 1] === 'string') {
          header[args[i]] = args[i + 1];
        }
      }
      return header
    }

    /* called when the initial board setup is changed with put() or remove().
     * modifies the SetUp and FEN properties of the header object.  if the FEN is
     * equal to the default position, the SetUp and FEN are deleted
     * the setup is only updated if history.length is zero, ie moves haven't been
     * made.
     */
    function update_setup(fen) {
      if (history.length > 0) return

      if (fen !== DEFAULT_POSITION) {
        header['SetUp'] = '1';
        header['FEN'] = fen;
      } else {
        delete header['SetUp'];
        delete header['FEN'];
      }
    }

    function get(square) {
      var piece = board[SQUARE_MAP[square]];
      return piece ? { type: piece.type, color: piece.color } : null
    }

    function put(piece, square) {
      /* check for valid piece object */
      if (!('type' in piece && 'color' in piece)) {
        return false
      }

      /* check for piece */
      if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
        return false
      }

      /* check for valid square */
      if (!(square in SQUARE_MAP)) {
        return false
      }

      var sq = SQUARE_MAP[square];

      /* don't let the user place more than one king */
      if (
        piece.type == KING &&
        !(kings[piece.color] == EMPTY || kings[piece.color] == sq)
      ) {
        return false
      }

      board[sq] = { type: piece.type, color: piece.color };
      if (piece.type === KING) {
        kings[piece.color] = sq;
      }

      update_setup(generate_fen());

      return true
    }

    function remove(square) {
      var piece = get(square);
      board[SQUARE_MAP[square]] = null;
      if (piece && piece.type === KING) {
        kings[piece.color] = EMPTY;
      }

      update_setup(generate_fen());

      return piece
    }

    function build_move(board, from, to, flags, promotion) {
      var move = {
        color: turn,
        from: from,
        to: to,
        flags: flags,
        piece: board[from].type,
      };

      if (promotion) {
        move.flags |= BITS.PROMOTION;
        move.promotion = promotion;
      }

      if (board[to]) {
        move.captured = board[to].type;
      } else if (flags & BITS.EP_CAPTURE) {
        move.captured = PAWN;
      }
      return move
    }

    function generate_moves(options) {
      function add_move(board, moves, from, to, flags) {
        /* if pawn promotion */
        if (
          board[from].type === PAWN &&
          (rank(to) === RANK_8 || rank(to) === RANK_1)
        ) {
          var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
          for (var i = 0, len = pieces.length; i < len; i++) {
            moves.push(build_move(board, from, to, flags, pieces[i]));
          }
        } else {
          moves.push(build_move(board, from, to, flags));
        }
      }

      var moves = [];
      var us = turn;
      var them = swap_color(us);
      var second_rank = { b: RANK_7, w: RANK_2 };

      var first_sq = SQUARE_MAP.a8;
      var last_sq = SQUARE_MAP.h1;
      var single_square = false;

      /* do we want legal moves? */
      var legal =
        typeof options !== 'undefined' && 'legal' in options
          ? options.legal
          : true;

      var piece_type =
        typeof options !== 'undefined' &&
        'piece' in options &&
        typeof options.piece === 'string'
          ? options.piece.toLowerCase()
          : true;

      /* are we generating moves for a single square? */
      if (typeof options !== 'undefined' && 'square' in options) {
        if (options.square in SQUARE_MAP) {
          first_sq = last_sq = SQUARE_MAP[options.square];
          single_square = true;
        } else {
          /* invalid square */
          return []
        }
      }

      for (var i = first_sq; i <= last_sq; i++) {
        /* did we run off the end of the board */
        if (i & 0x88) {
          i += 7;
          continue
        }

        var piece = board[i];
        if (piece == null || piece.color !== us) {
          continue
        }

        if (piece.type === PAWN && (piece_type === true || piece_type === PAWN)) {
          /* single square, non-capturing */
          var square = i + PAWN_OFFSETS[us][0];
          if (board[square] == null) {
            add_move(board, moves, i, square, BITS.NORMAL);

            /* double square */
            var square = i + PAWN_OFFSETS[us][1];
            if (second_rank[us] === rank(i) && board[square] == null) {
              add_move(board, moves, i, square, BITS.BIG_PAWN);
            }
          }

          /* pawn captures */
          for (j = 2; j < 4; j++) {
            var square = i + PAWN_OFFSETS[us][j];
            if (square & 0x88) continue

            if (board[square] != null && board[square].color === them) {
              add_move(board, moves, i, square, BITS.CAPTURE);
            } else if (square === ep_square) {
              add_move(board, moves, i, ep_square, BITS.EP_CAPTURE);
            }
          }
        } else if (piece_type === true || piece_type === piece.type) {
          for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
            var offset = PIECE_OFFSETS[piece.type][j];
            var square = i;

            while (true) {
              square += offset;
              if (square & 0x88) break

              if (board[square] == null) {
                add_move(board, moves, i, square, BITS.NORMAL);
              } else {
                if (board[square].color === us) break
                add_move(board, moves, i, square, BITS.CAPTURE);
                break
              }

              /* break, if knight or king */
              if (piece.type === 'n' || piece.type === 'k') break
            }
          }
        }
      }

      /* check for castling if: a) we're generating all moves, or b) we're doing
       * single square move generation on the king's square
       */
      if (piece_type === true || piece_type === KING) {
        if (!single_square || last_sq === kings[us]) {
          /* king-side castling */
          if (castling[us] & BITS.KSIDE_CASTLE) {
            var castling_from = kings[us];
            var castling_to = castling_from + 2;

            if (
              board[castling_from + 1] == null &&
              board[castling_to] == null &&
              !attacked(them, kings[us]) &&
              !attacked(them, castling_from + 1) &&
              !attacked(them, castling_to)
            ) {
              add_move(board, moves, kings[us], castling_to, BITS.KSIDE_CASTLE);
            }
          }

          /* queen-side castling */
          if (castling[us] & BITS.QSIDE_CASTLE) {
            var castling_from = kings[us];
            var castling_to = castling_from - 2;

            if (
              board[castling_from - 1] == null &&
              board[castling_from - 2] == null &&
              board[castling_from - 3] == null &&
              !attacked(them, kings[us]) &&
              !attacked(them, castling_from - 1) &&
              !attacked(them, castling_to)
            ) {
              add_move(board, moves, kings[us], castling_to, BITS.QSIDE_CASTLE);
            }
          }
        }
      }

      /* return all pseudo-legal moves (this includes moves that allow the king
       * to be captured)
       */
      if (!legal) {
        return moves
      }

      /* filter out illegal moves */
      var legal_moves = [];
      for (var i = 0, len = moves.length; i < len; i++) {
        make_move(moves[i]);
        if (!king_attacked(us)) {
          legal_moves.push(moves[i]);
        }
        undo_move();
      }

      return legal_moves
    }

    /* convert a move from 0x88 coordinates to Standard Algebraic Notation
     * (SAN)
     *
     * @param {boolean} sloppy Use the sloppy SAN generator to work around over
     * disambiguation bugs in Fritz and Chessbase.  See below:
     *
     * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
     * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
     * 4. ... Ne7 is technically the valid SAN
     */
    function move_to_san(move, moves) {
      var output = '';

      if (move.flags & BITS.KSIDE_CASTLE) {
        output = 'O-O';
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        output = 'O-O-O';
      } else {
        if (move.piece !== PAWN) {
          var disambiguator = get_disambiguator(move, moves);
          output += move.piece.toUpperCase() + disambiguator;
        }

        if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
          if (move.piece === PAWN) {
            output += algebraic(move.from)[0];
          }
          output += 'x';
        }

        output += algebraic(move.to);

        if (move.flags & BITS.PROMOTION) {
          output += '=' + move.promotion.toUpperCase();
        }
      }

      make_move(move);
      if (in_check()) {
        if (in_checkmate()) {
          output += '#';
        } else {
          output += '+';
        }
      }
      undo_move();

      return output
    }

    function attacked(color, square) {
      for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
        /* did we run off the end of the board */
        if (i & 0x88) {
          i += 7;
          continue
        }

        /* if empty square or wrong color */
        if (board[i] == null || board[i].color !== color) continue

        var piece = board[i];
        var difference = i - square;
        var index = difference + 119;

        if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
          if (piece.type === PAWN) {
            if (difference > 0) {
              if (piece.color === WHITE) return true
            } else {
              if (piece.color === BLACK) return true
            }
            continue
          }

          /* if the piece is a knight or a king */
          if (piece.type === 'n' || piece.type === 'k') return true

          var offset = RAYS[index];
          var j = i + offset;

          var blocked = false;
          while (j !== square) {
            if (board[j] != null) {
              blocked = true;
              break
            }
            j += offset;
          }

          if (!blocked) return true
        }
      }

      return false
    }

    function king_attacked(color) {
      return attacked(swap_color(color), kings[color])
    }

    function in_check() {
      return king_attacked(turn)
    }

    function in_checkmate() {
      return in_check() && generate_moves().length === 0
    }

    function in_stalemate() {
      return !in_check() && generate_moves().length === 0
    }

    function insufficient_material() {
      var pieces = {};
      var bishops = [];
      var num_pieces = 0;
      var sq_color = 0;

      for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
        sq_color = (sq_color + 1) % 2;
        if (i & 0x88) {
          i += 7;
          continue
        }

        var piece = board[i];
        if (piece) {
          pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;
          if (piece.type === BISHOP) {
            bishops.push(sq_color);
          }
          num_pieces++;
        }
      }

      /* k vs. k */
      if (num_pieces === 2) {
        return true
      } else if (
        /* k vs. kn .... or .... k vs. kb */
        num_pieces === 3 &&
        (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)
      ) {
        return true
      } else if (num_pieces === pieces[BISHOP] + 2) {
        /* kb vs. kb where any number of bishops are all on the same color */
        var sum = 0;
        var len = bishops.length;
        for (var i = 0; i < len; i++) {
          sum += bishops[i];
        }
        if (sum === 0 || sum === len) {
          return true
        }
      }

      return false
    }

    function in_threefold_repetition() {
      /* TODO: while this function is fine for casual use, a better
       * implementation would use a Zobrist key (instead of FEN). the
       * Zobrist key would be maintained in the make_move/undo_move functions,
       * avoiding the costly that we do below.
       */
      var moves = [];
      var positions = {};
      var repetition = false;

      while (true) {
        var move = undo_move();
        if (!move) break
        moves.push(move);
      }

      while (true) {
        /* remove the last two fields in the FEN string, they're not needed
         * when checking for draw by rep */
        var fen = generate_fen().split(' ').slice(0, 4).join(' ');

        /* has the position occurred three or move times */
        positions[fen] = fen in positions ? positions[fen] + 1 : 1;
        if (positions[fen] >= 3) {
          repetition = true;
        }

        if (!moves.length) {
          break
        }
        make_move(moves.pop());
      }

      return repetition
    }

    function push(move) {
      history.push({
        move: move,
        kings: { b: kings.b, w: kings.w },
        turn: turn,
        castling: { b: castling.b, w: castling.w },
        ep_square: ep_square,
        half_moves: half_moves,
        move_number: move_number,
      });
    }

    function make_move(move) {
      var us = turn;
      var them = swap_color(us);
      push(move);

      board[move.to] = board[move.from];
      board[move.from] = null;

      /* if ep capture, remove the captured pawn */
      if (move.flags & BITS.EP_CAPTURE) {
        if (turn === BLACK) {
          board[move.to - 16] = null;
        } else {
          board[move.to + 16] = null;
        }
      }

      /* if pawn promotion, replace with new piece */
      if (move.flags & BITS.PROMOTION) {
        board[move.to] = { type: move.promotion, color: us };
      }

      /* if we moved the king */
      if (board[move.to].type === KING) {
        kings[board[move.to].color] = move.to;

        /* if we castled, move the rook next to the king */
        if (move.flags & BITS.KSIDE_CASTLE) {
          var castling_to = move.to - 1;
          var castling_from = move.to + 1;
          board[castling_to] = board[castling_from];
          board[castling_from] = null;
        } else if (move.flags & BITS.QSIDE_CASTLE) {
          var castling_to = move.to + 1;
          var castling_from = move.to - 2;
          board[castling_to] = board[castling_from];
          board[castling_from] = null;
        }

        /* turn off castling */
        castling[us] = '';
      }

      /* turn off castling if we move a rook */
      if (castling[us]) {
        for (var i = 0, len = ROOKS[us].length; i < len; i++) {
          if (
            move.from === ROOKS[us][i].square &&
            castling[us] & ROOKS[us][i].flag
          ) {
            castling[us] ^= ROOKS[us][i].flag;
            break
          }
        }
      }

      /* turn off castling if we capture a rook */
      if (castling[them]) {
        for (var i = 0, len = ROOKS[them].length; i < len; i++) {
          if (
            move.to === ROOKS[them][i].square &&
            castling[them] & ROOKS[them][i].flag
          ) {
            castling[them] ^= ROOKS[them][i].flag;
            break
          }
        }
      }

      /* if big pawn move, update the en passant square */
      if (move.flags & BITS.BIG_PAWN) {
        if (turn === 'b') {
          ep_square = move.to - 16;
        } else {
          ep_square = move.to + 16;
        }
      } else {
        ep_square = EMPTY;
      }

      /* reset the 50 move counter if a pawn is moved or a piece is captured */
      if (move.piece === PAWN) {
        half_moves = 0;
      } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        half_moves = 0;
      } else {
        half_moves++;
      }

      if (turn === BLACK) {
        move_number++;
      }
      turn = swap_color(turn);
    }

    function undo_move() {
      var old = history.pop();
      if (old == null) {
        return null
      }

      var move = old.move;
      kings = old.kings;
      turn = old.turn;
      castling = old.castling;
      ep_square = old.ep_square;
      half_moves = old.half_moves;
      move_number = old.move_number;

      var us = turn;
      var them = swap_color(turn);

      board[move.from] = board[move.to];
      board[move.from].type = move.piece; // to undo any promotions
      board[move.to] = null;

      if (move.flags & BITS.CAPTURE) {
        board[move.to] = { type: move.captured, color: them };
      } else if (move.flags & BITS.EP_CAPTURE) {
        var index;
        if (us === BLACK) {
          index = move.to - 16;
        } else {
          index = move.to + 16;
        }
        board[index] = { type: PAWN, color: them };
      }

      if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
        var castling_to, castling_from;
        if (move.flags & BITS.KSIDE_CASTLE) {
          castling_to = move.to + 1;
          castling_from = move.to - 1;
        } else if (move.flags & BITS.QSIDE_CASTLE) {
          castling_to = move.to - 2;
          castling_from = move.to + 1;
        }

        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      }

      return move
    }

    // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
    function move_from_san(move, sloppy) {
      // strip off any move decorations: e.g Nf3+?! becomes Nf3
      var clean_move = stripped_san(move);

      // the move parsers is a 2-step state
      for (var parser = 0; parser < 2; parser++) {
        if (parser == PARSER_SLOPPY) {
          // only run the sloppy parse if explicitly requested
          if (!sloppy) {
            return null
          }

          // The sloppy parser allows the user to parse non-standard chess
          // notations. This parser is opt-in (by specifying the
          // '{ sloppy: true }' setting) and is only run after the Standard
          // Algebraic Notation (SAN) parser has failed.
          //
          // When running the sloppy parser, we'll run a regex to grab the piece,
          // the to/from square, and an optional promotion piece. This regex will
          // parse common non-standard notation like: Pe2-e4, Rc1c4, Qf3xf7,
          // f7f8q, b1c3

          // NOTE: Some positions and moves may be ambiguous when using the
          // sloppy parser. For example, in this position:
          // 6k1/8/8/B7/8/8/8/BN4K1 w - - 0 1, the move b1c3 may be interpreted
          // as Nc3 or B1c3 (a disambiguated bishop move). In these cases, the
          // sloppy parser will default to the most most basic interpretation
          // (which is b1c3 parsing to Nc3).

          // FIXME: these var's are hoisted into function scope, this will need
          // to change when switching to const/let

          var overly_disambiguated = false;

          var matches = clean_move.match(
            /([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/
          );
          if (matches) {
            var piece = matches[1];
            var from = matches[2];
            var to = matches[3];
            var promotion = matches[4];

            if (from.length == 1) {
              overly_disambiguated = true;
            }
          } else {
            // The [a-h]?[1-8]? portion of the regex below handles moves that may
            // be overly disambiguated (e.g. Nge7 is unnecessary and non-standard
            // when there is one legal knight move to e7). In this case, the value
            // of 'from' variable will be a rank or file, not a square.
            var matches = clean_move.match(
              /([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/
            );

            if (matches) {
              var piece = matches[1];
              var from = matches[2];
              var to = matches[3];
              var promotion = matches[4];

              if (from.length == 1) {
                var overly_disambiguated = true;
              }
            }
          }
        }

        var piece_type = infer_piece_type(clean_move);
        var moves = generate_moves({
          legal: true,
          piece: piece ? piece : piece_type,
        });

        for (var i = 0, len = moves.length; i < len; i++) {
          switch (parser) {
            case PARSER_STRICT: {
              if (clean_move === stripped_san(move_to_san(moves[i], moves))) {
                return moves[i]
              }
              break
            }
            case PARSER_SLOPPY: {
              if (matches) {
                // hand-compare move properties with the results from our sloppy
                // regex
                if (
                  (!piece || piece.toLowerCase() == moves[i].piece) &&
                  SQUARE_MAP[from] == moves[i].from &&
                  SQUARE_MAP[to] == moves[i].to &&
                  (!promotion || promotion.toLowerCase() == moves[i].promotion)
                ) {
                  return moves[i]
                } else if (overly_disambiguated) {
                  // SPECIAL CASE: we parsed a move string that may have an
                  // unneeded rank/file disambiguator (e.g. Nge7).  The 'from'
                  // variable will
                  var square = algebraic(moves[i].from);
                  if (
                    (!piece || piece.toLowerCase() == moves[i].piece) &&
                    SQUARE_MAP[to] == moves[i].to &&
                    (from == square[0] || from == square[1]) &&
                    (!promotion || promotion.toLowerCase() == moves[i].promotion)
                  ) {
                    return moves[i]
                  }
                }
              }
            }
          }
        }
      }

      return null
    }

    /* pretty = external move object */
    function make_pretty(ugly_move) {
      var move = clone(ugly_move);
      move.san = move_to_san(move, generate_moves({ legal: true }));
      move.to = algebraic(move.to);
      move.from = algebraic(move.from);

      var flags = '';

      for (var flag in BITS) {
        if (BITS[flag] & move.flags) {
          flags += FLAGS[flag];
        }
      }
      move.flags = flags;

      return move
    }

    /*****************************************************************************
     * DEBUGGING UTILITIES
     ****************************************************************************/
    function perft(depth) {
      var moves = generate_moves({ legal: false });
      var nodes = 0;
      var color = turn;

      for (var i = 0, len = moves.length; i < len; i++) {
        make_move(moves[i]);
        if (!king_attacked(color)) {
          if (depth - 1 > 0) {
            var child_nodes = perft(depth - 1);
            nodes += child_nodes;
          } else {
            nodes++;
          }
        }
        undo_move();
      }

      return nodes
    }

    return {
      /***************************************************************************
       * PUBLIC API
       **************************************************************************/
      load: function (fen) {
        return load(fen)
      },

      reset: function () {
        return reset()
      },

      moves: function (options) {
        /* The internal representation of a chess move is in 0x88 format, and
         * not meant to be human-readable.  The code below converts the 0x88
         * square coordinates to algebraic coordinates.  It also prunes an
         * unnecessary move keys resulting from a verbose call.
         */

        var ugly_moves = generate_moves(options);
        var moves = [];

        for (var i = 0, len = ugly_moves.length; i < len; i++) {
          /* does the user want a full move object (most likely not), or just
           * SAN
           */
          if (
            typeof options !== 'undefined' &&
            'verbose' in options &&
            options.verbose
          ) {
            moves.push(make_pretty(ugly_moves[i]));
          } else {
            moves.push(
              move_to_san(ugly_moves[i], generate_moves({ legal: true }))
            );
          }
        }

        return moves
      },

      in_check: function () {
        return in_check()
      },

      in_checkmate: function () {
        return in_checkmate()
      },

      in_stalemate: function () {
        return in_stalemate()
      },

      in_draw: function () {
        return (
          half_moves >= 100 ||
          in_stalemate() ||
          insufficient_material() ||
          in_threefold_repetition()
        )
      },

      insufficient_material: function () {
        return insufficient_material()
      },

      in_threefold_repetition: function () {
        return in_threefold_repetition()
      },

      game_over: function () {
        return (
          half_moves >= 100 ||
          in_checkmate() ||
          in_stalemate() ||
          insufficient_material() ||
          in_threefold_repetition()
        )
      },

      validate_fen: function (fen) {
        return validate_fen(fen)
      },

      fen: function () {
        return generate_fen()
      },

      board: function () {
        var output = [],
          row = [];

        for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
          if (board[i] == null) {
            row.push(null);
          } else {
            row.push({
              square: algebraic(i),
              type: board[i].type,
              color: board[i].color,
            });
          }
          if ((i + 1) & 0x88) {
            output.push(row);
            row = [];
            i += 8;
          }
        }

        return output
      },

      pgn: function (options) {
        /* using the specification from http://www.chessclub.com/help/PGN-spec
         * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
         */
        var newline =
          typeof options === 'object' && typeof options.newline_char === 'string'
            ? options.newline_char
            : '\n';
        var max_width =
          typeof options === 'object' && typeof options.max_width === 'number'
            ? options.max_width
            : 0;
        var result = [];
        var header_exists = false;

        /* add the PGN header headerrmation */
        for (var i in header) {
          /* TODO: order of enumerated properties in header object is not
           * guaranteed, see ECMA-262 spec (section 12.6.4)
           */
          result.push('[' + i + ' "' + header[i] + '"]' + newline);
          header_exists = true;
        }

        if (header_exists && history.length) {
          result.push(newline);
        }

        var append_comment = function (move_string) {
          var comment = comments[generate_fen()];
          if (typeof comment !== 'undefined') {
            var delimiter = move_string.length > 0 ? ' ' : '';
            move_string = `${move_string}${delimiter}{${comment}}`;
          }
          return move_string
        };

        /* pop all of history onto reversed_history */
        var reversed_history = [];
        while (history.length > 0) {
          reversed_history.push(undo_move());
        }

        var moves = [];
        var move_string = '';

        /* special case of a commented starting position with no moves */
        if (reversed_history.length === 0) {
          moves.push(append_comment(''));
        }

        /* build the list of moves.  a move_string looks like: "3. e3 e6" */
        while (reversed_history.length > 0) {
          move_string = append_comment(move_string);
          var move = reversed_history.pop();

          /* if the position started with black to move, start PGN with 1. ... */
          if (!history.length && move.color === 'b') {
            move_string = move_number + '. ...';
          } else if (move.color === 'w') {
            /* store the previous generated move_string if we have one */
            if (move_string.length) {
              moves.push(move_string);
            }
            move_string = move_number + '.';
          }

          move_string =
            move_string + ' ' + move_to_san(move, generate_moves({ legal: true }));
          make_move(move);
        }

        /* are there any other leftover moves? */
        if (move_string.length) {
          moves.push(append_comment(move_string));
        }

        /* is there a result? */
        if (typeof header.Result !== 'undefined') {
          moves.push(header.Result);
        }

        /* history should be back to what it was before we started generating PGN,
         * so join together moves
         */
        if (max_width === 0) {
          return result.join('') + moves.join(' ')
        }

        var strip = function () {
          if (result.length > 0 && result[result.length - 1] === ' ') {
            result.pop();
            return true
          }
          return false
        };

        /* NB: this does not preserve comment whitespace. */
        var wrap_comment = function (width, move) {
          for (var token of move.split(' ')) {
            if (!token) {
              continue
            }
            if (width + token.length > max_width) {
              while (strip()) {
                width--;
              }
              result.push(newline);
              width = 0;
            }
            result.push(token);
            width += token.length;
            result.push(' ');
            width++;
          }
          if (strip()) {
            width--;
          }
          return width
        };

        /* wrap the PGN output at max_width */
        var current_width = 0;
        for (var i = 0; i < moves.length; i++) {
          if (current_width + moves[i].length > max_width) {
            if (moves[i].includes('{')) {
              current_width = wrap_comment(current_width, moves[i]);
              continue
            }
          }
          /* if the current move will push past max_width */
          if (current_width + moves[i].length > max_width && i !== 0) {
            /* don't end the line with whitespace */
            if (result[result.length - 1] === ' ') {
              result.pop();
            }

            result.push(newline);
            current_width = 0;
          } else if (i !== 0) {
            result.push(' ');
            current_width++;
          }
          result.push(moves[i]);
          current_width += moves[i].length;
        }

        return result.join('')
      },

      load_pgn: function (pgn, options) {
        // allow the user to specify the sloppy move parser to work around over
        // disambiguation bugs in Fritz and Chessbase
        var sloppy =
          typeof options !== 'undefined' && 'sloppy' in options
            ? options.sloppy
            : false;

        function mask(str) {
          return str.replace(/\\/g, '\\')
        }

        function parse_pgn_header(header, options) {
          var newline_char =
            typeof options === 'object' &&
            typeof options.newline_char === 'string'
              ? options.newline_char
              : '\r?\n';
          var header_obj = {};
          var headers = header.split(new RegExp(mask(newline_char)));
          var key = '';
          var value = '';

          for (var i = 0; i < headers.length; i++) {
            key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
            value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\ *\]$/, '$1');
            if (trim(key).length > 0) {
              header_obj[key] = value;
            }
          }

          return header_obj
        }

        var newline_char =
          typeof options === 'object' && typeof options.newline_char === 'string'
            ? options.newline_char
            : '\r?\n';

        // RegExp to split header. Takes advantage of the fact that header and movetext
        // will always have a blank line between them (ie, two newline_char's).
        // With default newline_char, will equal: /^(\[((?:\r?\n)|.)*\])(?:\r?\n){2}/
        var header_regex = new RegExp(
          '^(\\[((?:' +
            mask(newline_char) +
            ')|.)*\\])' +
            '(?:' +
            mask(newline_char) +
            '){2}'
        );

        // If no header given, begin with moves.
        var header_string = header_regex.test(pgn)
          ? header_regex.exec(pgn)[1]
          : '';

        // Put the board in the starting position
        reset();

        /* parse PGN header */
        var headers = parse_pgn_header(header_string, options);
        for (var key in headers) {
          set_header([key, headers[key]]);
        }

        /* load the starting position indicated by [Setup '1'] and
         * [FEN position] */
        if (headers['SetUp'] === '1') {
          if (!('FEN' in headers && load(headers['FEN'], true))) {
            // second argument to load: don't clear the headers
            return false
          }
        }

        /* NB: the regexes below that delete move numbers, recursive
         * annotations, and numeric annotation glyphs may also match
         * text in comments. To prevent this, we transform comments
         * by hex-encoding them in place and decoding them again after
         * the other tokens have been deleted.
         *
         * While the spec states that PGN files should be ASCII encoded,
         * we use {en,de}codeURIComponent here to support arbitrary UTF8
         * as a convenience for modern users */

        var to_hex = function (string) {
          return Array.from(string)
            .map(function (c) {
              /* encodeURI doesn't transform most ASCII characters,
               * so we handle these ourselves */
              return c.charCodeAt(0) < 128
                ? c.charCodeAt(0).toString(16)
                : encodeURIComponent(c).replace(/\%/g, '').toLowerCase()
            })
            .join('')
        };

        var from_hex = function (string) {
          return string.length == 0
            ? ''
            : decodeURIComponent('%' + string.match(/.{1,2}/g).join('%'))
        };

        var encode_comment = function (string) {
          string = string.replace(new RegExp(mask(newline_char), 'g'), ' ');
          return `{${to_hex(string.slice(1, string.length - 1))}}`
        };

        var decode_comment = function (string) {
          if (string.startsWith('{') && string.endsWith('}')) {
            return from_hex(string.slice(1, string.length - 1))
          }
        };

        /* delete header to get the moves */
        var ms = pgn
          .replace(header_string, '')
          .replace(
            /* encode comments so they don't get deleted below */
            new RegExp(`(\{[^}]*\})+?|;([^${mask(newline_char)}]*)`, 'g'),
            function (match, bracket, semicolon) {
              return bracket !== undefined
                ? encode_comment(bracket)
                : ' ' + encode_comment(`{${semicolon.slice(1)}}`)
            }
          )
          .replace(new RegExp(mask(newline_char), 'g'), ' ');

        /* delete recursive annotation variations */
        var rav_regex = /(\([^\(\)]+\))+?/g;
        while (rav_regex.test(ms)) {
          ms = ms.replace(rav_regex, '');
        }

        /* delete move numbers */
        ms = ms.replace(/\d+\.(\.\.)?/g, '');

        /* delete ... indicating black to move */
        ms = ms.replace(/\.\.\./g, '');

        /* delete numeric annotation glyphs */
        ms = ms.replace(/\$\d+/g, '');

        /* trim and get array of moves */
        var moves = trim(ms).split(new RegExp(/\s+/));

        /* delete empty entries */
        moves = moves.join(',').replace(/,,+/g, ',').split(',');
        var move = '';

        var result = '';

        for (var half_move = 0; half_move < moves.length; half_move++) {
          var comment = decode_comment(moves[half_move]);
          if (comment !== undefined) {
            comments[generate_fen()] = comment;
            continue
          }

          move = move_from_san(moves[half_move], sloppy);

          /* invalid move */
          if (move == null) {
            /* was the move an end of game marker */
            if (TERMINATION_MARKERS.indexOf(moves[half_move]) > -1) {
              result = moves[half_move];
            } else {
              return false
            }
          } else {
            /* reset the end of game marker if making a valid move */
            result = '';
            make_move(move);
          }
        }

        /* Per section 8.2.6 of the PGN spec, the Result tag pair must match
         * match the termination marker. Only do this when headers are present,
         * but the result tag is missing
         */
        if (result && Object.keys(header).length && !header['Result']) {
          set_header(['Result', result]);
        }

        return true
      },

      header: function () {
        return set_header(arguments)
      },

      turn: function () {
        return turn
      },

      move: function (move, options) {
        /* The move function can be called with in the following parameters:
         *
         * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
         *
         * .move({ from: 'h7', <- where the 'move' is a move object (additional
         *         to :'h8',      fields are ignored)
         *         promotion: 'q',
         *      })
         */

        // allow the user to specify the sloppy move parser to work around over
        // disambiguation bugs in Fritz and Chessbase
        var sloppy =
          typeof options !== 'undefined' && 'sloppy' in options
            ? options.sloppy
            : false;

        var move_obj = null;

        if (typeof move === 'string') {
          move_obj = move_from_san(move, sloppy);
        } else if (typeof move === 'object') {
          var moves = generate_moves();

          /* convert the pretty move object to an ugly move object */
          for (var i = 0, len = moves.length; i < len; i++) {
            if (
              move.from === algebraic(moves[i].from) &&
              move.to === algebraic(moves[i].to) &&
              (!('promotion' in moves[i]) ||
                move.promotion === moves[i].promotion)
            ) {
              move_obj = moves[i];
              break
            }
          }
        }

        /* failed to find move */
        if (!move_obj) {
          return null
        }

        /* need to make a copy of move because we can't generate SAN after the
         * move is made
         */
        var pretty_move = make_pretty(move_obj);

        make_move(move_obj);

        return pretty_move
      },

      undo: function () {
        var move = undo_move();
        return move ? make_pretty(move) : null
      },

      clear: function () {
        return clear()
      },

      put: function (piece, square) {
        return put(piece, square)
      },

      get: function (square) {
        return get(square)
      },

      ascii() {
        var s = '   +------------------------+\n';
        for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
          /* display the rank */
          if (file(i) === 0) {
            s += ' ' + '87654321'[rank(i)] + ' |';
          }

          /* empty piece */
          if (board[i] == null) {
            s += ' . ';
          } else {
            var piece = board[i].type;
            var color = board[i].color;
            var symbol =
              color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
            s += ' ' + symbol + ' ';
          }

          if ((i + 1) & 0x88) {
            s += '|\n';
            i += 8;
          }
        }
        s += '   +------------------------+\n';
        s += '     a  b  c  d  e  f  g  h';

        return s
      },

      remove: function (square) {
        return remove(square)
      },

      perft: function (depth) {
        return perft(depth)
      },

      square_color: function (square) {
        if (square in SQUARE_MAP) {
          var sq_0x88 = SQUARE_MAP[square];
          return (rank(sq_0x88) + file(sq_0x88)) % 2 === 0 ? 'light' : 'dark'
        }

        return null
      },

      history: function (options) {
        var reversed_history = [];
        var move_history = [];
        var verbose =
          typeof options !== 'undefined' &&
          'verbose' in options &&
          options.verbose;

        while (history.length > 0) {
          reversed_history.push(undo_move());
        }

        while (reversed_history.length > 0) {
          var move = reversed_history.pop();
          if (verbose) {
            move_history.push(make_pretty(move));
          } else {
            move_history.push(move_to_san(move, generate_moves({ legal: true })));
          }
          make_move(move);
        }

        return move_history
      },

      get_comment: function () {
        return comments[generate_fen()]
      },

      set_comment: function (comment) {
        comments[generate_fen()] = comment.replace('{', '[').replace('}', ']');
      },

      delete_comment: function () {
        var comment = comments[generate_fen()];
        delete comments[generate_fen()];
        return comment
      },

      get_comments: function () {
        prune_comments();
        return Object.keys(comments).map(function (fen) {
          return { fen: fen, comment: comments[fen] }
        })
      },

      delete_comments: function () {
        prune_comments();
        return Object.keys(comments).map(function (fen) {
          var comment = comments[fen];
          delete comments[fen];
          return { fen: fen, comment: comment }
        })
      },
    }
  };

  // Load the CSV file

  const chess1 = new Chess();
  //chess1.load_pgn("1. d4 d5 2. c4 e5 3. dxe5 d4 4. e3 Bb4+ 5. Bd2 dxe3 6. Bxb4 exf2+ 7. Ke2 fxg1=N+ 8. Rhxg1")
  //1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rhf1
  //r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4
  //r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R
  //e4-e5-Nf3-Nc6-Bc4-Nd4-Nxe5-Qg5-Nxf7-Qxg2-Rhf1
  chess1.move("e4");
  chess1.move("e5");
  chess1.move("Nf3");
  chess1.move("Nc6");
  chess1.move("Bc4");
  chess1.move("Nd4");
  chess1.move("Nxe5");
  chess1.move("Qg5");
  chess1.move("Nxf7");
  chess1.move("Qxg2");
  console.log(chess1.fen());
  chess1.move("Rhf1");
  console.log(chess1.fen());
  var board = Chessboard('myBoard', "start");

  //chessboard and graphic dimensions
  const chessboardwidth = 250;
  const width = window.innerWidth -5 - chessboardwidth;
  console.log(window.innerWidth);
  console.log(window.innerHeight);
  const radius = width / 2;
  // e3 e4 d4 g3 b4

  // const svg = select('body')
  //   .append('svg')
  //   .attr('width', width)
  //   .attr('height', height)
  // .attr('class','sunburst-chess')
  // 	.attr(
  //     'transform',
  //     `translate(${centerX}, ${-20*centerY})`
  //   )
  // 	.attr(
  //     'viewBox',
  //     `${-radius} ${-radius} ${width} ${width}`
  //   ); // Apply translation to center the SVG element

  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(1 / radius)
    .padRadius(radius)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius((d) => Math.sqrt(d.y1) - 1);
  const mousearc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius(radius);

  // svg.append("path")
  //   .attr("d", arcGenerator)
  //   .attr("fill", "black");
  // svg.append("path")
  //   .attr("d", arcGenerator1)
  //   .attr("fill", "black");

  // // Get the DOM node of the SVG element
  // document.body.appendChild(svg.node());
  // const element = svg.node();
  // element.value = { sequence: [], percentage: 0.0 };
  //console.log(element);

  // possible colors
  const color = d3$1.scaleOrdinal()
    .domain(['e3-0', 'e3-1','e4-0','e4-1', 'd4-0','d4-1', 'g3-0', 'g3-1','b4-0','b4-1','f3-0','f3-1','d3-0','d3-1'])
    .range([
      '#ffc0cb',
      '#800000',
      '#90EE90',
      '#008000',
      '#add8e6',
      '#000080',
      '#ff00ff',
      '#800080',
      '#ffff00',
      '#808000',
  		'#d3d3d3',
      '#808080',
      '#ffa500',
      '#ff8c00',
    ]);

  const partition = (data) =>
    d3
      .partition()
      .size([2 * Math.PI, radius * radius])(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value)
    );

  // const label = svg
  //   .append('text')
  //   .attr('text-anchor', 'middle')
  //   .attr('fill', 'blue')
  //   .style('visibility', 'hidden');

  // label
  //   .append('tspan')
  //   .attr('class', 'percentage')
  //   .attr('x', 0)
  //   .attr('y', 0)
  //   .attr('dy', '-0.1em')
  //   .attr('font-size', '3em')
  //   .text('');

  // label
  //   .append('tspan')
  //   .attr('x', 0)
  //   .attr('y', 0)
  //   .attr('dy', '2.5em')
  //   .text('of chess players playing in this way');

  // adding slider
    let slider = document.getElementById(
      'dateSlider1'
    );
  let sliderValue = document.getElementById("sliderValue");

  let filename = '2015-12.csv';

  generateSunburst(filename);
  //selectAll('.sunburst-chess').remove()
  //const targetFiles = ['2014-01.csv','2014-01-2.csv','2014-01-3.csv']
  const targetFiles = ['2015-12-1.csv', '2015-12-2.csv', '2015-12-3.csv'];
    slider.addEventListener('input', function () {
      const index = parseInt(this.value);
      let text = "";
    switch (index) {
      case 0:
  //      text = "Popular Games";
        	text = "Top 500";
        break;
      case 1:
  //      text = "Medium frequency";
        	text = "500-1000 ";
        break;
      case 2:
  //      text = "Niche Games";
        	text = "1000-1500 ";
        break;
  //    case 3:
  //      	text = "151-200";
  //      break;
  //    case 4:
  //      	text = "201-250";
      default:
        text = "";
    }
      console.log(text);
      sliderValue.textContent = text;
  d3$1.selectAll('.sunburst-path').remove();
      d3$1.selectAll('.sunburst-path-mouse').remove();
      const newName = targetFiles[index];
      filename = newName;

      console.log(filename);
      generateSunburst(filename);
  		// date to human readable quarter
      // if (
      //   targetDate.getTime() ===
      //   targetDates[0].getTime()
      // ) {
      //   season = 'Oct-Dec, 2016';
      // }
    });

  // generateSunburst(filename)
  function generateSunburst(filename){
  d3$1.csv(filename)
    .then((parsedData) => {
      //console.log(parsedData);
      //console.log(parsedData[1].pgn)
      return buildHierarchy(parsedData);
    })
    .then((data) => {
      //console.log(data)
      const root = partition(data);
  //   const svg = select('body')
  //   .append('svg')
  //   .attr('width', width)
  //   .attr('height', height)
  // //.attr('class','sunburst-chess')
  // 	.attr(
  //     'transform',
  //     `translate(${centerX}, ${-22*centerY})`
  //   )
  // 	.attr(
  //     'viewBox',
  //     `${-radius} ${-radius} ${width} ${width}`
  //   );
    //const svg = document.getElementById("sunburst");
    const svg = d3$1.select("#sunburst");
      console.log(svg);
    const element = svg.node();
  element.value = { sequence: [], percentage: 0.0 };
    const label = svg
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', 'blue')
    .style('visibility', 'hidden');

  label
    .append('tspan')
    .attr('class', 'percentage')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', '-0.1em')
    .attr('font-size', '2em')
    .text('');

  label
    .append('tspan')
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', '2em')
    .text('Games');
      const path = svg
        .append('g')
        .selectAll('path')
        .data(
          root.descendants().filter((d) => {
            // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
            return (
              d.depth && d.x1 - d.x0 > 0.000001
            );
          })
        )
        .join('path');
      
        path.attr('fill', (data) => {
          let h = data.depth - 1;
          console.log(h);
          for (let i = 0; i < h; i++) {
            //console.log(i);
            data = data.parent;
          }
  // color the black player darker
          if(h%2 ===0){
                 return color(data.data.name+'-0');
          } else {
           return color(data.data.name+'-1');
          }
          //console.log(data);
         // console.log(data.data.name);
          
        })
        //.attr('fill','gold')
        .attr('d', arc)
    .attr('class','sunburst-path');

      svg
        .append('g')
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseleave', () => {
          path.attr('fill-opacity', 1);
          label.style('visibility', 'hidden');
          // Update the value of this view
          element.value = {
            sequence: [],
            percentage: 0.0,
          };
          element.dispatchEvent(
            new CustomEvent('input')
          );
        })
        .selectAll('path')
        .data(
          root.descendants().filter((d) => {
            // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
            return d.depth && d.x1 - d.x0 > 0.001;
          })
        )
        .join('path')
        .attr('d', mousearc)
      .attr('class','sunburst-path-mouse')
        .on('mouseenter', (event, d) => {
          // Get the ancestors of the current segment, minus the root
          d3$1.selectAll('.steps').remove();
          const sequence = d
            .ancestors()
            .reverse()
            .slice(1);
          // Highlight the ancestors
          path.attr('fill-opacity', (node) =>
            sequence.indexOf(node) >= 0 ? 1.0 : 0.3
          );
          const percentage = (
            (100 * d.value) /
            root.value
          ).toPrecision(3);
          label
            .style('visibility', null)
            .select('.percentage')
            .text(percentage + '%');
          // Update the value of this view with the currently hovered sequence and percentage
          element.value = { sequence, percentage };
          element.dispatchEvent(
            new CustomEvent('input')
          );
        //'1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5'
          let str = "";
          //console.log( element.value.sequence)
          for (let i = 0;i < element.value.sequence.length;i++) {
            if(i%2===0){
              var num = i/2 +1;
              str = str+num.toString()+". ";
            }
            str =str +element.value.sequence[i].data.name+" ";
          }
       //1. e4 e5 2. Qh5 d6 3. Bc4 Nf6 4. Qxf7# 
          console.log(str);
        if(str.includes('Rh')){
                d3.csv("2.csv").then(function(data) {
    // Convert the data into a JavaScript object or map
    var csvData = {};
    data.forEach(function(d) {
      csvData[d.pgn] = d.fen;
    });
                  //console.log(str)
    var value = csvData[str.slice(0, str.length - 1)];
    console.log(value);
                  var board = Chessboard('myBoard', value);
  }).catch(function(error) {
    console.error("Error loading CSV file:", error);
  });
         // var board = Chessboard('myBoard', "r1b1kbnr/pppp1Npp/8/8/2BnP3/8/PPPP1PqP/RNBQKR2 b Qkq - 1 6")
        }
  			else {	//board.clear(false)
        const chessnow = new Chess();
        chessnow.load_pgn(str);
        console.log(chessnow.fen());

        var board = Chessboard('myBoard', chessnow.fen());
  }
                label
            .append('tspan')
            .attr('class', 'steps')
            .attr('x', 0)
            .attr('y', 420)
            .attr('dy', '-0.1em')
            .attr('font-size', '1.5em')
            .text(str);
        });

      // const svgbread = d3
      //   .create("svg")
      //   .attr("viewBox", `0 0 ${breadcrumbWidth * 10} ${breadcrumbHeight}`)
      // .attr('transform', `translate(${centerX}, ${centerY})`)
      //   .style("font", "12px sans-serif")
      //   .style("margin", "5px");

      //   const g = svgbread
      //     .selectAll("g")
      //     .data(element.value.sequence)
      //     .join("g")
      //     .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`);

      //   g.append("polygon")
      //     .attr("points", breadcrumbPoints)
      //     .attr("fill", d => 'pink')
      //     .attr("stroke", "white");

      //   g.append("text")
      //     .attr("x", (breadcrumbWidth + 10) / 2)
      //     .attr("y", 15)
      //     .attr("dy", "0.35em")
      //     .attr("text-anchor", "middle")
      //     .attr("fill", "white")
      //     .text(d => d.data.name);

      //   svgbread
      //     .append("text")
      //     .text(element.value.percentage > 0 ? element.value.percentage + "%" : "")
      //     .attr("x", (element.value.sequence.length + 0.5) * breadcrumbWidth)
      //     .attr("y", breadcrumbHeight / 2)
      //     .attr("dy", "0.35em")
      //     .attr("text-anchor", "middle");
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
  function buildHierarchy(csv) {
    // Helper function that transforms the given CSV into a hierarchical format.
    const root = { name: 'root', children: [] };
    for (let i = 0; i < csv.length; i++) {
      const sequence = csv[i].pgn;
      const size = +csv[i].freq;
      if (isNaN(size)) {
        // e.g. if this is a header row
        continue;
      }
      const parts = sequence.split('-');
      console.log(parts.length);
      let currentNode = root;
      for (let j = 0; j < parts.length; j++) {
        console.log(currentNode);
        console.log(parts[j]);
        const children = currentNode['children'];
        const nodeName = parts[j];
        let childNode = null;
        if (j + 1 < parts.length) {
          // Not yet at the end of the sequence; move down the tree.
          let foundChild = false;
          for (let k = 0;k < children.length;k++) {
            if (children[k]['name'] == nodeName) {
              childNode = children[k];
              foundChild = true;
              break;
            }
          }
          // If we don't already have a child node for this branch, create it.
          if (!foundChild) {
            childNode = {
              name: nodeName,
              children: [],
            };
            children.push(childNode);
            console.log("addnew");
          }
          currentNode = childNode;
          console.log(currentNode);
        } else {
          // Reached the end of the sequence; create a leaf node.
          childNode = {
            name: nodeName,
            children: [],
            value: size,
          };
          children.push(childNode);
        }
      }
    }
    return root;
  }

}(d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImNoZXNzLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU1lNQk9MUyA9ICdwbmJycWtQTkJSUUsnXG5cbmNvbnN0IERFRkFVTFRfUE9TSVRJT04gPVxuICAncm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUiB3IEtRa3EgLSAwIDEnXG5cbmNvbnN0IFRFUk1JTkFUSU9OX01BUktFUlMgPSBbJzEtMCcsICcwLTEnLCAnMS8yLTEvMicsICcqJ11cblxuY29uc3QgUEFXTl9PRkZTRVRTID0ge1xuICBiOiBbMTYsIDMyLCAxNywgMTVdLFxuICB3OiBbLTE2LCAtMzIsIC0xNywgLTE1XSxcbn1cblxuY29uc3QgUElFQ0VfT0ZGU0VUUyA9IHtcbiAgbjogWy0xOCwgLTMzLCAtMzEsIC0xNCwgMTgsIDMzLCAzMSwgMTRdLFxuICBiOiBbLTE3LCAtMTUsIDE3LCAxNV0sXG4gIHI6IFstMTYsIDEsIDE2LCAtMV0sXG4gIHE6IFstMTcsIC0xNiwgLTE1LCAxLCAxNywgMTYsIDE1LCAtMV0sXG4gIGs6IFstMTcsIC0xNiwgLTE1LCAxLCAxNywgMTYsIDE1LCAtMV0sXG59XG5cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgQVRUQUNLUyA9IFtcbiAgMjAsIDAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwgMCwyMCwgMCxcbiAgIDAsMjAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwyMCwgMCwgMCxcbiAgIDAsIDAsMjAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwyMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsMjAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwyMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDI0LCAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsIDAsMjAsIDIsIDI0LCAgMiwyMCwgMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsIDAsIDIsNTMsIDU2LCA1MywgMiwgMCwgMCwgMCwgMCwgMCwgMCxcbiAgMjQsMjQsMjQsMjQsMjQsMjQsNTYsICAwLCA1NiwyNCwyNCwyNCwyNCwyNCwyNCwgMCxcbiAgIDAsIDAsIDAsIDAsIDAsIDIsNTMsIDU2LCA1MywgMiwgMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsIDAsMjAsIDIsIDI0LCAgMiwyMCwgMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDI0LCAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsMjAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwyMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsMjAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwyMCwgMCwgMCwgMCxcbiAgIDAsMjAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwyMCwgMCwgMCxcbiAgMjAsIDAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwgMCwyMFxuXTtcblxuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBSQVlTID0gW1xuICAgMTcsICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsIDE2LCAgMCwgIDAsICAwLCAgMCwgIDAsICAwLCAxNSwgMCxcbiAgICAwLCAxNywgIDAsICAwLCAgMCwgIDAsICAwLCAxNiwgIDAsICAwLCAgMCwgIDAsICAwLCAxNSwgIDAsIDAsXG4gICAgMCwgIDAsIDE3LCAgMCwgIDAsICAwLCAgMCwgMTYsICAwLCAgMCwgIDAsICAwLCAxNSwgIDAsICAwLCAwLFxuICAgIDAsICAwLCAgMCwgMTcsICAwLCAgMCwgIDAsIDE2LCAgMCwgIDAsICAwLCAxNSwgIDAsICAwLCAgMCwgMCxcbiAgICAwLCAgMCwgIDAsICAwLCAxNywgIDAsICAwLCAxNiwgIDAsICAwLCAxNSwgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgMCwgIDAsICAwLCAgMCwgIDAsIDE3LCAgMCwgMTYsICAwLCAxNSwgIDAsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwgMTcsIDE2LCAxNSwgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwgMCxcbiAgICAxLCAgMSwgIDEsICAxLCAgMSwgIDEsICAxLCAgMCwgLTEsIC0xLCAgLTEsLTEsIC0xLCAtMSwgLTEsIDAsXG4gICAgMCwgIDAsICAwLCAgMCwgIDAsICAwLC0xNSwtMTYsLTE3LCAgMCwgIDAsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgIDAsICAwLCAgMCwgIDAsICAwLC0xNSwgIDAsLTE2LCAgMCwtMTcsICAwLCAgMCwgIDAsICAwLCAgMCwgMCxcbiAgICAwLCAgMCwgIDAsICAwLC0xNSwgIDAsICAwLC0xNiwgIDAsICAwLC0xNywgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgMCwgIDAsICAwLC0xNSwgIDAsICAwLCAgMCwtMTYsICAwLCAgMCwgIDAsLTE3LCAgMCwgIDAsICAwLCAwLFxuICAgIDAsICAwLC0xNSwgIDAsICAwLCAgMCwgIDAsLTE2LCAgMCwgIDAsICAwLCAgMCwtMTcsICAwLCAgMCwgMCxcbiAgICAwLC0xNSwgIDAsICAwLCAgMCwgIDAsICAwLC0xNiwgIDAsICAwLCAgMCwgIDAsICAwLC0xNywgIDAsIDAsXG4gIC0xNSwgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwtMTYsICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsLTE3XG5dO1xuXG5jb25zdCBTSElGVFMgPSB7IHA6IDAsIG46IDEsIGI6IDIsIHI6IDMsIHE6IDQsIGs6IDUgfVxuXG5jb25zdCBCSVRTID0ge1xuICBOT1JNQUw6IDEsXG4gIENBUFRVUkU6IDIsXG4gIEJJR19QQVdOOiA0LFxuICBFUF9DQVBUVVJFOiA4LFxuICBQUk9NT1RJT046IDE2LFxuICBLU0lERV9DQVNUTEU6IDMyLFxuICBRU0lERV9DQVNUTEU6IDY0LFxufVxuXG5jb25zdCBSQU5LXzEgPSA3XG5jb25zdCBSQU5LXzIgPSA2XG5jb25zdCBSQU5LXzMgPSA1XG5jb25zdCBSQU5LXzQgPSA0XG5jb25zdCBSQU5LXzUgPSAzXG5jb25zdCBSQU5LXzYgPSAyXG5jb25zdCBSQU5LXzcgPSAxXG5jb25zdCBSQU5LXzggPSAwXG5cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgU1FVQVJFX01BUCA9IHtcbiAgYTg6ICAgMCwgYjg6ICAgMSwgYzg6ICAgMiwgZDg6ICAgMywgZTg6ICAgNCwgZjg6ICAgNSwgZzg6ICAgNiwgaDg6ICAgNyxcbiAgYTc6ICAxNiwgYjc6ICAxNywgYzc6ICAxOCwgZDc6ICAxOSwgZTc6ICAyMCwgZjc6ICAyMSwgZzc6ICAyMiwgaDc6ICAyMyxcbiAgYTY6ICAzMiwgYjY6ICAzMywgYzY6ICAzNCwgZDY6ICAzNSwgZTY6ICAzNiwgZjY6ICAzNywgZzY6ICAzOCwgaDY6ICAzOSxcbiAgYTU6ICA0OCwgYjU6ICA0OSwgYzU6ICA1MCwgZDU6ICA1MSwgZTU6ICA1MiwgZjU6ICA1MywgZzU6ICA1NCwgaDU6ICA1NSxcbiAgYTQ6ICA2NCwgYjQ6ICA2NSwgYzQ6ICA2NiwgZDQ6ICA2NywgZTQ6ICA2OCwgZjQ6ICA2OSwgZzQ6ICA3MCwgaDQ6ICA3MSxcbiAgYTM6ICA4MCwgYjM6ICA4MSwgYzM6ICA4MiwgZDM6ICA4MywgZTM6ICA4NCwgZjM6ICA4NSwgZzM6ICA4NiwgaDM6ICA4NyxcbiAgYTI6ICA5NiwgYjI6ICA5NywgYzI6ICA5OCwgZDI6ICA5OSwgZTI6IDEwMCwgZjI6IDEwMSwgZzI6IDEwMiwgaDI6IDEwMyxcbiAgYTE6IDExMiwgYjE6IDExMywgYzE6IDExNCwgZDE6IDExNSwgZTE6IDExNiwgZjE6IDExNywgZzE6IDExOCwgaDE6IDExOVxufTtcblxuY29uc3QgUk9PS1MgPSB7XG4gIHc6IFtcbiAgICB7IHNxdWFyZTogU1FVQVJFX01BUC5hMSwgZmxhZzogQklUUy5RU0lERV9DQVNUTEUgfSxcbiAgICB7IHNxdWFyZTogU1FVQVJFX01BUC5oMSwgZmxhZzogQklUUy5LU0lERV9DQVNUTEUgfSxcbiAgXSxcbiAgYjogW1xuICAgIHsgc3F1YXJlOiBTUVVBUkVfTUFQLmE4LCBmbGFnOiBCSVRTLlFTSURFX0NBU1RMRSB9LFxuICAgIHsgc3F1YXJlOiBTUVVBUkVfTUFQLmg4LCBmbGFnOiBCSVRTLktTSURFX0NBU1RMRSB9LFxuICBdLFxufVxuXG5jb25zdCBQQVJTRVJfU1RSSUNUID0gMFxuY29uc3QgUEFSU0VSX1NMT1BQWSA9IDFcblxuLyogdGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHVuaXF1ZWx5IGlkZW50aWZ5IGFtYmlndW91cyBtb3ZlcyAqL1xuZnVuY3Rpb24gZ2V0X2Rpc2FtYmlndWF0b3IobW92ZSwgbW92ZXMpIHtcbiAgdmFyIGZyb20gPSBtb3ZlLmZyb21cbiAgdmFyIHRvID0gbW92ZS50b1xuICB2YXIgcGllY2UgPSBtb3ZlLnBpZWNlXG5cbiAgdmFyIGFtYmlndWl0aWVzID0gMFxuICB2YXIgc2FtZV9yYW5rID0gMFxuICB2YXIgc2FtZV9maWxlID0gMFxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciBhbWJpZ19mcm9tID0gbW92ZXNbaV0uZnJvbVxuICAgIHZhciBhbWJpZ190byA9IG1vdmVzW2ldLnRvXG4gICAgdmFyIGFtYmlnX3BpZWNlID0gbW92ZXNbaV0ucGllY2VcblxuICAgIC8qIGlmIGEgbW92ZSBvZiB0aGUgc2FtZSBwaWVjZSB0eXBlIGVuZHMgb24gdGhlIHNhbWUgdG8gc3F1YXJlLCB3ZSdsbFxuICAgICAqIG5lZWQgdG8gYWRkIGEgZGlzYW1iaWd1YXRvciB0byB0aGUgYWxnZWJyYWljIG5vdGF0aW9uXG4gICAgICovXG4gICAgaWYgKHBpZWNlID09PSBhbWJpZ19waWVjZSAmJiBmcm9tICE9PSBhbWJpZ19mcm9tICYmIHRvID09PSBhbWJpZ190bykge1xuICAgICAgYW1iaWd1aXRpZXMrK1xuXG4gICAgICBpZiAocmFuayhmcm9tKSA9PT0gcmFuayhhbWJpZ19mcm9tKSkge1xuICAgICAgICBzYW1lX3JhbmsrK1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlsZShmcm9tKSA9PT0gZmlsZShhbWJpZ19mcm9tKSkge1xuICAgICAgICBzYW1lX2ZpbGUrK1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChhbWJpZ3VpdGllcyA+IDApIHtcbiAgICAvKiBpZiB0aGVyZSBleGlzdHMgYSBzaW1pbGFyIG1vdmluZyBwaWVjZSBvbiB0aGUgc2FtZSByYW5rIGFuZCBmaWxlIGFzXG4gICAgICogdGhlIG1vdmUgaW4gcXVlc3Rpb24sIHVzZSB0aGUgc3F1YXJlIGFzIHRoZSBkaXNhbWJpZ3VhdG9yXG4gICAgICovXG4gICAgaWYgKHNhbWVfcmFuayA+IDAgJiYgc2FtZV9maWxlID4gMCkge1xuICAgICAgcmV0dXJuIGFsZ2VicmFpYyhmcm9tKVxuICAgIH0gZWxzZSBpZiAoc2FtZV9maWxlID4gMCkge1xuICAgICAgLyogaWYgdGhlIG1vdmluZyBwaWVjZSByZXN0cyBvbiB0aGUgc2FtZSBmaWxlLCB1c2UgdGhlIHJhbmsgc3ltYm9sIGFzIHRoZVxuICAgICAgICogZGlzYW1iaWd1YXRvclxuICAgICAgICovXG4gICAgICByZXR1cm4gYWxnZWJyYWljKGZyb20pLmNoYXJBdCgxKVxuICAgIH0gZWxzZSB7XG4gICAgICAvKiBlbHNlIHVzZSB0aGUgZmlsZSBzeW1ib2wgKi9cbiAgICAgIHJldHVybiBhbGdlYnJhaWMoZnJvbSkuY2hhckF0KDApXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuICcnXG59XG5cbmZ1bmN0aW9uIGluZmVyX3BpZWNlX3R5cGUoc2FuKSB7XG4gIHZhciBwaWVjZV90eXBlID0gc2FuLmNoYXJBdCgwKVxuICBpZiAocGllY2VfdHlwZSA+PSAnYScgJiYgcGllY2VfdHlwZSA8PSAnaCcpIHtcbiAgICB2YXIgbWF0Y2hlcyA9IHNhbi5tYXRjaCgvW2EtaF1cXGQuKlthLWhdXFxkLylcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICByZXR1cm4gUEFXTlxuICB9XG4gIHBpZWNlX3R5cGUgPSBwaWVjZV90eXBlLnRvTG93ZXJDYXNlKClcbiAgaWYgKHBpZWNlX3R5cGUgPT09ICdvJykge1xuICAgIHJldHVybiBLSU5HXG4gIH1cbiAgcmV0dXJuIHBpZWNlX3R5cGVcbn1cblxuLy8gcGFyc2VzIGFsbCBvZiB0aGUgZGVjb3JhdG9ycyBvdXQgb2YgYSBTQU4gc3RyaW5nXG5mdW5jdGlvbiBzdHJpcHBlZF9zYW4obW92ZSkge1xuICByZXR1cm4gbW92ZS5yZXBsYWNlKC89LywgJycpLnJlcGxhY2UoL1srI10/Wz8hXSokLywgJycpXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogVVRJTElUWSBGVU5DVElPTlNcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gcmFuayhpKSB7XG4gIHJldHVybiBpID4+IDRcbn1cblxuZnVuY3Rpb24gZmlsZShpKSB7XG4gIHJldHVybiBpICYgMTVcbn1cblxuZnVuY3Rpb24gYWxnZWJyYWljKGkpIHtcbiAgdmFyIGYgPSBmaWxlKGkpLFxuICAgIHIgPSByYW5rKGkpXG4gIHJldHVybiAnYWJjZGVmZ2gnLnN1YnN0cmluZyhmLCBmICsgMSkgKyAnODc2NTQzMjEnLnN1YnN0cmluZyhyLCByICsgMSlcbn1cblxuZnVuY3Rpb24gc3dhcF9jb2xvcihjKSB7XG4gIHJldHVybiBjID09PSBXSElURSA/IEJMQUNLIDogV0hJVEVcbn1cblxuZnVuY3Rpb24gaXNfZGlnaXQoYykge1xuICByZXR1cm4gJzAxMjM0NTY3ODknLmluZGV4T2YoYykgIT09IC0xXG59XG5cbmZ1bmN0aW9uIGNsb25lKG9iaikge1xuICB2YXIgZHVwZSA9IG9iaiBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB7fVxuXG4gIGZvciAodmFyIHByb3BlcnR5IGluIG9iaikge1xuICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT09ICdvYmplY3QnKSB7XG4gICAgICBkdXBlW3Byb3BlcnR5XSA9IGNsb25lKG9ialtwcm9wZXJ0eV0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGR1cGVbcHJvcGVydHldID0gb2JqW3Byb3BlcnR5XVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkdXBlXG59XG5cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIFBVQkxJQyBDT05TVEFOVFNcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuZXhwb3J0IGNvbnN0IEJMQUNLID0gJ2InXG5leHBvcnQgY29uc3QgV0hJVEUgPSAndydcblxuZXhwb3J0IGNvbnN0IEVNUFRZID0gLTFcblxuZXhwb3J0IGNvbnN0IFBBV04gPSAncCdcbmV4cG9ydCBjb25zdCBLTklHSFQgPSAnbidcbmV4cG9ydCBjb25zdCBCSVNIT1AgPSAnYidcbmV4cG9ydCBjb25zdCBST09LID0gJ3InXG5leHBvcnQgY29uc3QgUVVFRU4gPSAncSdcbmV4cG9ydCBjb25zdCBLSU5HID0gJ2snXG5cbmV4cG9ydCBjb25zdCBTUVVBUkVTID0gKGZ1bmN0aW9uICgpIHtcbiAgLyogZnJvbSB0aGUgRUNNQS0yNjIgc3BlYyAoc2VjdGlvbiAxMi42LjQpOlxuICAgKiBcIlRoZSBtZWNoYW5pY3Mgb2YgZW51bWVyYXRpbmcgdGhlIHByb3BlcnRpZXMgLi4uIGlzXG4gICAqIGltcGxlbWVudGF0aW9uIGRlcGVuZGVudFwiXG4gICAqIHNvOiBmb3IgKHZhciBzcSBpbiBTUVVBUkVTKSB7IGtleXMucHVzaChzcSk7IH0gbWlnaHQgbm90IGJlXG4gICAqIG9yZGVyZWQgY29ycmVjdGx5XG4gICAqL1xuICB2YXIga2V5cyA9IFtdXG4gIGZvciAodmFyIGkgPSBTUVVBUkVfTUFQLmE4OyBpIDw9IFNRVUFSRV9NQVAuaDE7IGkrKykge1xuICAgIGlmIChpICYgMHg4OCkge1xuICAgICAgaSArPSA3XG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBrZXlzLnB1c2goYWxnZWJyYWljKGkpKVxuICB9XG4gIHJldHVybiBrZXlzXG59KSgpXG5cbmV4cG9ydCBjb25zdCBGTEFHUyA9IHtcbiAgTk9STUFMOiAnbicsXG4gIENBUFRVUkU6ICdjJyxcbiAgQklHX1BBV046ICdiJyxcbiAgRVBfQ0FQVFVSRTogJ2UnLFxuICBQUk9NT1RJT046ICdwJyxcbiAgS1NJREVfQ0FTVExFOiAnaycsXG4gIFFTSURFX0NBU1RMRTogJ3EnLFxufVxuXG5leHBvcnQgY29uc3QgQ2hlc3MgPSBmdW5jdGlvbiAoZmVuKSB7XG4gIHZhciBib2FyZCA9IG5ldyBBcnJheSgxMjgpXG4gIHZhciBraW5ncyA9IHsgdzogRU1QVFksIGI6IEVNUFRZIH1cbiAgdmFyIHR1cm4gPSBXSElURVxuICB2YXIgY2FzdGxpbmcgPSB7IHc6IDAsIGI6IDAgfVxuICB2YXIgZXBfc3F1YXJlID0gRU1QVFlcbiAgdmFyIGhhbGZfbW92ZXMgPSAwXG4gIHZhciBtb3ZlX251bWJlciA9IDFcbiAgdmFyIGhpc3RvcnkgPSBbXVxuICB2YXIgaGVhZGVyID0ge31cbiAgdmFyIGNvbW1lbnRzID0ge31cblxuICAvKiBpZiB0aGUgdXNlciBwYXNzZXMgaW4gYSBmZW4gc3RyaW5nLCBsb2FkIGl0LCBlbHNlIGRlZmF1bHQgdG9cbiAgICogc3RhcnRpbmcgcG9zaXRpb25cbiAgICovXG4gIGlmICh0eXBlb2YgZmVuID09PSAndW5kZWZpbmVkJykge1xuICAgIGxvYWQoREVGQVVMVF9QT1NJVElPTilcbiAgfSBlbHNlIHtcbiAgICBsb2FkKGZlbilcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyKGtlZXBfaGVhZGVycykge1xuICAgIGlmICh0eXBlb2Yga2VlcF9oZWFkZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAga2VlcF9oZWFkZXJzID0gZmFsc2VcbiAgICB9XG5cbiAgICBib2FyZCA9IG5ldyBBcnJheSgxMjgpXG4gICAga2luZ3MgPSB7IHc6IEVNUFRZLCBiOiBFTVBUWSB9XG4gICAgdHVybiA9IFdISVRFXG4gICAgY2FzdGxpbmcgPSB7IHc6IDAsIGI6IDAgfVxuICAgIGVwX3NxdWFyZSA9IEVNUFRZXG4gICAgaGFsZl9tb3ZlcyA9IDBcbiAgICBtb3ZlX251bWJlciA9IDFcbiAgICBoaXN0b3J5ID0gW11cbiAgICBpZiAoIWtlZXBfaGVhZGVycykgaGVhZGVyID0ge31cbiAgICBjb21tZW50cyA9IHt9XG4gICAgdXBkYXRlX3NldHVwKGdlbmVyYXRlX2ZlbigpKVxuICB9XG5cbiAgZnVuY3Rpb24gcHJ1bmVfY29tbWVudHMoKSB7XG4gICAgdmFyIHJldmVyc2VkX2hpc3RvcnkgPSBbXVxuICAgIHZhciBjdXJyZW50X2NvbW1lbnRzID0ge31cbiAgICB2YXIgY29weV9jb21tZW50ID0gZnVuY3Rpb24gKGZlbikge1xuICAgICAgaWYgKGZlbiBpbiBjb21tZW50cykge1xuICAgICAgICBjdXJyZW50X2NvbW1lbnRzW2Zlbl0gPSBjb21tZW50c1tmZW5dXG4gICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChoaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHJldmVyc2VkX2hpc3RvcnkucHVzaCh1bmRvX21vdmUoKSlcbiAgICB9XG4gICAgY29weV9jb21tZW50KGdlbmVyYXRlX2ZlbigpKVxuICAgIHdoaWxlIChyZXZlcnNlZF9oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgIG1ha2VfbW92ZShyZXZlcnNlZF9oaXN0b3J5LnBvcCgpKVxuICAgICAgY29weV9jb21tZW50KGdlbmVyYXRlX2ZlbigpKVxuICAgIH1cbiAgICBjb21tZW50cyA9IGN1cnJlbnRfY29tbWVudHNcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGxvYWQoREVGQVVMVF9QT1NJVElPTilcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWQoZmVuLCBrZWVwX2hlYWRlcnMpIHtcbiAgICBpZiAodHlwZW9mIGtlZXBfaGVhZGVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGtlZXBfaGVhZGVycyA9IGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIHRva2VucyA9IGZlbi5zcGxpdCgvXFxzKy8pXG4gICAgdmFyIHBvc2l0aW9uID0gdG9rZW5zWzBdXG4gICAgdmFyIHNxdWFyZSA9IDBcblxuICAgIGlmICghdmFsaWRhdGVfZmVuKGZlbikudmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNsZWFyKGtlZXBfaGVhZGVycylcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zaXRpb24ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwaWVjZSA9IHBvc2l0aW9uLmNoYXJBdChpKVxuXG4gICAgICBpZiAocGllY2UgPT09ICcvJykge1xuICAgICAgICBzcXVhcmUgKz0gOFxuICAgICAgfSBlbHNlIGlmIChpc19kaWdpdChwaWVjZSkpIHtcbiAgICAgICAgc3F1YXJlICs9IHBhcnNlSW50KHBpZWNlLCAxMClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjb2xvciA9IHBpZWNlIDwgJ2EnID8gV0hJVEUgOiBCTEFDS1xuICAgICAgICBwdXQoeyB0eXBlOiBwaWVjZS50b0xvd2VyQ2FzZSgpLCBjb2xvcjogY29sb3IgfSwgYWxnZWJyYWljKHNxdWFyZSkpXG4gICAgICAgIHNxdWFyZSsrXG4gICAgICB9XG4gICAgfVxuXG4gICAgdHVybiA9IHRva2Vuc1sxXVxuXG4gICAgaWYgKHRva2Vuc1syXS5pbmRleE9mKCdLJykgPiAtMSkge1xuICAgICAgY2FzdGxpbmcudyB8PSBCSVRTLktTSURFX0NBU1RMRVxuICAgIH1cbiAgICBpZiAodG9rZW5zWzJdLmluZGV4T2YoJ1EnKSA+IC0xKSB7XG4gICAgICBjYXN0bGluZy53IHw9IEJJVFMuUVNJREVfQ0FTVExFXG4gICAgfVxuICAgIGlmICh0b2tlbnNbMl0uaW5kZXhPZignaycpID4gLTEpIHtcbiAgICAgIGNhc3RsaW5nLmIgfD0gQklUUy5LU0lERV9DQVNUTEVcbiAgICB9XG4gICAgaWYgKHRva2Vuc1syXS5pbmRleE9mKCdxJykgPiAtMSkge1xuICAgICAgY2FzdGxpbmcuYiB8PSBCSVRTLlFTSURFX0NBU1RMRVxuICAgIH1cblxuICAgIGVwX3NxdWFyZSA9IHRva2Vuc1szXSA9PT0gJy0nID8gRU1QVFkgOiBTUVVBUkVfTUFQW3Rva2Vuc1szXV1cbiAgICBoYWxmX21vdmVzID0gcGFyc2VJbnQodG9rZW5zWzRdLCAxMClcbiAgICBtb3ZlX251bWJlciA9IHBhcnNlSW50KHRva2Vuc1s1XSwgMTApXG5cbiAgICB1cGRhdGVfc2V0dXAoZ2VuZXJhdGVfZmVuKCkpXG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyogVE9ETzogdGhpcyBmdW5jdGlvbiBpcyBwcmV0dHkgbXVjaCBjcmFwIC0gaXQgdmFsaWRhdGVzIHN0cnVjdHVyZSBidXRcbiAgICogY29tcGxldGVseSBpZ25vcmVzIGNvbnRlbnQgKGUuZy4gZG9lc24ndCB2ZXJpZnkgdGhhdCBlYWNoIHNpZGUgaGFzIGEga2luZylcbiAgICogLi4uIHdlIHNob3VsZCByZXdyaXRlIHRoaXMsIGFuZCBkaXRjaCB0aGUgc2lsbHkgZXJyb3JfbnVtYmVyIGZpZWxkIHdoaWxlXG4gICAqIHdlJ3JlIGF0IGl0XG4gICAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZV9mZW4oZmVuKSB7XG4gICAgdmFyIGVycm9ycyA9IHtcbiAgICAgIDA6ICdObyBlcnJvcnMuJyxcbiAgICAgIDE6ICdGRU4gc3RyaW5nIG11c3QgY29udGFpbiBzaXggc3BhY2UtZGVsaW1pdGVkIGZpZWxkcy4nLFxuICAgICAgMjogJzZ0aCBmaWVsZCAobW92ZSBudW1iZXIpIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLicsXG4gICAgICAzOiAnNXRoIGZpZWxkIChoYWxmIG1vdmUgY291bnRlcikgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLicsXG4gICAgICA0OiAnNHRoIGZpZWxkIChlbi1wYXNzYW50IHNxdWFyZSkgaXMgaW52YWxpZC4nLFxuICAgICAgNTogJzNyZCBmaWVsZCAoY2FzdGxpbmcgYXZhaWxhYmlsaXR5KSBpcyBpbnZhbGlkLicsXG4gICAgICA2OiAnMm5kIGZpZWxkIChzaWRlIHRvIG1vdmUpIGlzIGludmFsaWQuJyxcbiAgICAgIDc6IFwiMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGRvZXMgbm90IGNvbnRhaW4gOCAnLyctZGVsaW1pdGVkIHJvd3MuXCIsXG4gICAgICA4OiAnMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGlzIGludmFsaWQgW2NvbnNlY3V0aXZlIG51bWJlcnNdLicsXG4gICAgICA5OiAnMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGlzIGludmFsaWQgW2ludmFsaWQgcGllY2VdLicsXG4gICAgICAxMDogJzFzdCBmaWVsZCAocGllY2UgcG9zaXRpb25zKSBpcyBpbnZhbGlkIFtyb3cgdG9vIGxhcmdlXS4nLFxuICAgICAgMTE6ICdJbGxlZ2FsIGVuLXBhc3NhbnQgc3F1YXJlJyxcbiAgICB9XG5cbiAgICAvKiAxc3QgY3JpdGVyaW9uOiA2IHNwYWNlLXNlcGVyYXRlZCBmaWVsZHM/ICovXG4gICAgdmFyIHRva2VucyA9IGZlbi5zcGxpdCgvXFxzKy8pXG4gICAgaWYgKHRva2Vucy5sZW5ndGggIT09IDYpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAxLCBlcnJvcjogZXJyb3JzWzFdIH1cbiAgICB9XG5cbiAgICAvKiAybmQgY3JpdGVyaW9uOiBtb3ZlIG51bWJlciBmaWVsZCBpcyBhIGludGVnZXIgdmFsdWUgPiAwPyAqL1xuICAgIGlmIChpc05hTih0b2tlbnNbNV0pIHx8IHBhcnNlSW50KHRva2Vuc1s1XSwgMTApIDw9IDApIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAyLCBlcnJvcjogZXJyb3JzWzJdIH1cbiAgICB9XG5cbiAgICAvKiAzcmQgY3JpdGVyaW9uOiBoYWxmIG1vdmUgY291bnRlciBpcyBhbiBpbnRlZ2VyID49IDA/ICovXG4gICAgaWYgKGlzTmFOKHRva2Vuc1s0XSkgfHwgcGFyc2VJbnQodG9rZW5zWzRdLCAxMCkgPCAwKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogMywgZXJyb3I6IGVycm9yc1szXSB9XG4gICAgfVxuXG4gICAgLyogNHRoIGNyaXRlcmlvbjogNHRoIGZpZWxkIGlzIGEgdmFsaWQgZS5wLi1zdHJpbmc/ICovXG4gICAgaWYgKCEvXigtfFthYmNkZWZnaF1bMzZdKSQvLnRlc3QodG9rZW5zWzNdKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcl9udW1iZXI6IDQsIGVycm9yOiBlcnJvcnNbNF0gfVxuICAgIH1cblxuICAgIC8qIDV0aCBjcml0ZXJpb246IDN0aCBmaWVsZCBpcyBhIHZhbGlkIGNhc3RsZS1zdHJpbmc/ICovXG4gICAgaWYgKCEvXihLUT9rP3E/fFFrP3E/fGtxP3xxfC0pJC8udGVzdCh0b2tlbnNbMl0pKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogNSwgZXJyb3I6IGVycm9yc1s1XSB9XG4gICAgfVxuXG4gICAgLyogNnRoIGNyaXRlcmlvbjogMm5kIGZpZWxkIGlzIFwid1wiICh3aGl0ZSkgb3IgXCJiXCIgKGJsYWNrKT8gKi9cbiAgICBpZiAoIS9eKHd8YikkLy50ZXN0KHRva2Vuc1sxXSkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiA2LCBlcnJvcjogZXJyb3JzWzZdIH1cbiAgICB9XG5cbiAgICAvKiA3dGggY3JpdGVyaW9uOiAxc3QgZmllbGQgY29udGFpbnMgOCByb3dzPyAqL1xuICAgIHZhciByb3dzID0gdG9rZW5zWzBdLnNwbGl0KCcvJylcbiAgICBpZiAocm93cy5sZW5ndGggIT09IDgpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiA3LCBlcnJvcjogZXJyb3JzWzddIH1cbiAgICB9XG5cbiAgICAvKiA4dGggY3JpdGVyaW9uOiBldmVyeSByb3cgaXMgdmFsaWQ/ICovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvKiBjaGVjayBmb3IgcmlnaHQgc3VtIG9mIGZpZWxkcyBBTkQgbm90IHR3byBudW1iZXJzIGluIHN1Y2Nlc3Npb24gKi9cbiAgICAgIHZhciBzdW1fZmllbGRzID0gMFxuICAgICAgdmFyIHByZXZpb3VzX3dhc19udW1iZXIgPSBmYWxzZVxuXG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHJvd3NbaV0ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgaWYgKCFpc05hTihyb3dzW2ldW2tdKSkge1xuICAgICAgICAgIGlmIChwcmV2aW91c193YXNfbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogOCwgZXJyb3I6IGVycm9yc1s4XSB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1bV9maWVsZHMgKz0gcGFyc2VJbnQocm93c1tpXVtrXSwgMTApXG4gICAgICAgICAgcHJldmlvdXNfd2FzX251bWJlciA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIS9eW3BybmJxa1BSTkJRS10kLy50ZXN0KHJvd3NbaV1ba10pKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogOSwgZXJyb3I6IGVycm9yc1s5XSB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1bV9maWVsZHMgKz0gMVxuICAgICAgICAgIHByZXZpb3VzX3dhc19udW1iZXIgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VtX2ZpZWxkcyAhPT0gOCkge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogMTAsIGVycm9yOiBlcnJvcnNbMTBdIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAodG9rZW5zWzNdWzFdID09ICczJyAmJiB0b2tlbnNbMV0gPT0gJ3cnKSB8fFxuICAgICAgKHRva2Vuc1szXVsxXSA9PSAnNicgJiYgdG9rZW5zWzFdID09ICdiJylcbiAgICApIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAxMSwgZXJyb3I6IGVycm9yc1sxMV0gfVxuICAgIH1cblxuICAgIC8qIGV2ZXJ5dGhpbmcncyBva2F5ISAqL1xuICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBlcnJvcl9udW1iZXI6IDAsIGVycm9yOiBlcnJvcnNbMF0gfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVfZmVuKCkge1xuICAgIHZhciBlbXB0eSA9IDBcbiAgICB2YXIgZmVuID0gJydcblxuICAgIGZvciAodmFyIGkgPSBTUVVBUkVfTUFQLmE4OyBpIDw9IFNRVUFSRV9NQVAuaDE7IGkrKykge1xuICAgICAgaWYgKGJvYXJkW2ldID09IG51bGwpIHtcbiAgICAgICAgZW1wdHkrK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVtcHR5ID4gMCkge1xuICAgICAgICAgIGZlbiArPSBlbXB0eVxuICAgICAgICAgIGVtcHR5ID0gMFxuICAgICAgICB9XG4gICAgICAgIHZhciBjb2xvciA9IGJvYXJkW2ldLmNvbG9yXG4gICAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldLnR5cGVcblxuICAgICAgICBmZW4gKz0gY29sb3IgPT09IFdISVRFID8gcGllY2UudG9VcHBlckNhc2UoKSA6IHBpZWNlLnRvTG93ZXJDYXNlKClcbiAgICAgIH1cblxuICAgICAgaWYgKChpICsgMSkgJiAweDg4KSB7XG4gICAgICAgIGlmIChlbXB0eSA+IDApIHtcbiAgICAgICAgICBmZW4gKz0gZW1wdHlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpICE9PSBTUVVBUkVfTUFQLmgxKSB7XG4gICAgICAgICAgZmVuICs9ICcvJ1xuICAgICAgICB9XG5cbiAgICAgICAgZW1wdHkgPSAwXG4gICAgICAgIGkgKz0gOFxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjZmxhZ3MgPSAnJ1xuICAgIGlmIChjYXN0bGluZ1tXSElURV0gJiBCSVRTLktTSURFX0NBU1RMRSkge1xuICAgICAgY2ZsYWdzICs9ICdLJ1xuICAgIH1cbiAgICBpZiAoY2FzdGxpbmdbV0hJVEVdICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgIGNmbGFncyArPSAnUSdcbiAgICB9XG4gICAgaWYgKGNhc3RsaW5nW0JMQUNLXSAmIEJJVFMuS1NJREVfQ0FTVExFKSB7XG4gICAgICBjZmxhZ3MgKz0gJ2snXG4gICAgfVxuICAgIGlmIChjYXN0bGluZ1tCTEFDS10gJiBCSVRTLlFTSURFX0NBU1RMRSkge1xuICAgICAgY2ZsYWdzICs9ICdxJ1xuICAgIH1cblxuICAgIC8qIGRvIHdlIGhhdmUgYW4gZW1wdHkgY2FzdGxpbmcgZmxhZz8gKi9cbiAgICBjZmxhZ3MgPSBjZmxhZ3MgfHwgJy0nXG4gICAgdmFyIGVwZmxhZ3MgPSBlcF9zcXVhcmUgPT09IEVNUFRZID8gJy0nIDogYWxnZWJyYWljKGVwX3NxdWFyZSlcblxuICAgIHJldHVybiBbZmVuLCB0dXJuLCBjZmxhZ3MsIGVwZmxhZ3MsIGhhbGZfbW92ZXMsIG1vdmVfbnVtYmVyXS5qb2luKCcgJylcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldF9oZWFkZXIoYXJncykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgaWYgKHR5cGVvZiBhcmdzW2ldID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYXJnc1tpICsgMV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGhlYWRlclthcmdzW2ldXSA9IGFyZ3NbaSArIDFdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoZWFkZXJcbiAgfVxuXG4gIC8qIGNhbGxlZCB3aGVuIHRoZSBpbml0aWFsIGJvYXJkIHNldHVwIGlzIGNoYW5nZWQgd2l0aCBwdXQoKSBvciByZW1vdmUoKS5cbiAgICogbW9kaWZpZXMgdGhlIFNldFVwIGFuZCBGRU4gcHJvcGVydGllcyBvZiB0aGUgaGVhZGVyIG9iamVjdC4gIGlmIHRoZSBGRU4gaXNcbiAgICogZXF1YWwgdG8gdGhlIGRlZmF1bHQgcG9zaXRpb24sIHRoZSBTZXRVcCBhbmQgRkVOIGFyZSBkZWxldGVkXG4gICAqIHRoZSBzZXR1cCBpcyBvbmx5IHVwZGF0ZWQgaWYgaGlzdG9yeS5sZW5ndGggaXMgemVybywgaWUgbW92ZXMgaGF2ZW4ndCBiZWVuXG4gICAqIG1hZGUuXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVfc2V0dXAoZmVuKSB7XG4gICAgaWYgKGhpc3RvcnkubGVuZ3RoID4gMCkgcmV0dXJuXG5cbiAgICBpZiAoZmVuICE9PSBERUZBVUxUX1BPU0lUSU9OKSB7XG4gICAgICBoZWFkZXJbJ1NldFVwJ10gPSAnMSdcbiAgICAgIGhlYWRlclsnRkVOJ10gPSBmZW5cbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIGhlYWRlclsnU2V0VXAnXVxuICAgICAgZGVsZXRlIGhlYWRlclsnRkVOJ11cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXQoc3F1YXJlKSB7XG4gICAgdmFyIHBpZWNlID0gYm9hcmRbU1FVQVJFX01BUFtzcXVhcmVdXVxuICAgIHJldHVybiBwaWVjZSA/IHsgdHlwZTogcGllY2UudHlwZSwgY29sb3I6IHBpZWNlLmNvbG9yIH0gOiBudWxsXG4gIH1cblxuICBmdW5jdGlvbiBwdXQocGllY2UsIHNxdWFyZSkge1xuICAgIC8qIGNoZWNrIGZvciB2YWxpZCBwaWVjZSBvYmplY3QgKi9cbiAgICBpZiAoISgndHlwZScgaW4gcGllY2UgJiYgJ2NvbG9yJyBpbiBwaWVjZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8qIGNoZWNrIGZvciBwaWVjZSAqL1xuICAgIGlmIChTWU1CT0xTLmluZGV4T2YocGllY2UudHlwZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8qIGNoZWNrIGZvciB2YWxpZCBzcXVhcmUgKi9cbiAgICBpZiAoIShzcXVhcmUgaW4gU1FVQVJFX01BUCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHZhciBzcSA9IFNRVUFSRV9NQVBbc3F1YXJlXVxuXG4gICAgLyogZG9uJ3QgbGV0IHRoZSB1c2VyIHBsYWNlIG1vcmUgdGhhbiBvbmUga2luZyAqL1xuICAgIGlmIChcbiAgICAgIHBpZWNlLnR5cGUgPT0gS0lORyAmJlxuICAgICAgIShraW5nc1twaWVjZS5jb2xvcl0gPT0gRU1QVFkgfHwga2luZ3NbcGllY2UuY29sb3JdID09IHNxKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgYm9hcmRbc3FdID0geyB0eXBlOiBwaWVjZS50eXBlLCBjb2xvcjogcGllY2UuY29sb3IgfVxuICAgIGlmIChwaWVjZS50eXBlID09PSBLSU5HKSB7XG4gICAgICBraW5nc1twaWVjZS5jb2xvcl0gPSBzcVxuICAgIH1cblxuICAgIHVwZGF0ZV9zZXR1cChnZW5lcmF0ZV9mZW4oKSlcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUoc3F1YXJlKSB7XG4gICAgdmFyIHBpZWNlID0gZ2V0KHNxdWFyZSlcbiAgICBib2FyZFtTUVVBUkVfTUFQW3NxdWFyZV1dID0gbnVsbFxuICAgIGlmIChwaWVjZSAmJiBwaWVjZS50eXBlID09PSBLSU5HKSB7XG4gICAgICBraW5nc1twaWVjZS5jb2xvcl0gPSBFTVBUWVxuICAgIH1cblxuICAgIHVwZGF0ZV9zZXR1cChnZW5lcmF0ZV9mZW4oKSlcblxuICAgIHJldHVybiBwaWVjZVxuICB9XG5cbiAgZnVuY3Rpb24gYnVpbGRfbW92ZShib2FyZCwgZnJvbSwgdG8sIGZsYWdzLCBwcm9tb3Rpb24pIHtcbiAgICB2YXIgbW92ZSA9IHtcbiAgICAgIGNvbG9yOiB0dXJuLFxuICAgICAgZnJvbTogZnJvbSxcbiAgICAgIHRvOiB0byxcbiAgICAgIGZsYWdzOiBmbGFncyxcbiAgICAgIHBpZWNlOiBib2FyZFtmcm9tXS50eXBlLFxuICAgIH1cblxuICAgIGlmIChwcm9tb3Rpb24pIHtcbiAgICAgIG1vdmUuZmxhZ3MgfD0gQklUUy5QUk9NT1RJT05cbiAgICAgIG1vdmUucHJvbW90aW9uID0gcHJvbW90aW9uXG4gICAgfVxuXG4gICAgaWYgKGJvYXJkW3RvXSkge1xuICAgICAgbW92ZS5jYXB0dXJlZCA9IGJvYXJkW3RvXS50eXBlXG4gICAgfSBlbHNlIGlmIChmbGFncyAmIEJJVFMuRVBfQ0FQVFVSRSkge1xuICAgICAgbW92ZS5jYXB0dXJlZCA9IFBBV05cbiAgICB9XG4gICAgcmV0dXJuIG1vdmVcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlX21vdmVzKG9wdGlvbnMpIHtcbiAgICBmdW5jdGlvbiBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGZyb20sIHRvLCBmbGFncykge1xuICAgICAgLyogaWYgcGF3biBwcm9tb3Rpb24gKi9cbiAgICAgIGlmIChcbiAgICAgICAgYm9hcmRbZnJvbV0udHlwZSA9PT0gUEFXTiAmJlxuICAgICAgICAocmFuayh0bykgPT09IFJBTktfOCB8fCByYW5rKHRvKSA9PT0gUkFOS18xKVxuICAgICAgKSB7XG4gICAgICAgIHZhciBwaWVjZXMgPSBbUVVFRU4sIFJPT0ssIEJJU0hPUCwgS05JR0hUXVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGllY2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgbW92ZXMucHVzaChidWlsZF9tb3ZlKGJvYXJkLCBmcm9tLCB0bywgZmxhZ3MsIHBpZWNlc1tpXSkpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1vdmVzLnB1c2goYnVpbGRfbW92ZShib2FyZCwgZnJvbSwgdG8sIGZsYWdzKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbW92ZXMgPSBbXVxuICAgIHZhciB1cyA9IHR1cm5cbiAgICB2YXIgdGhlbSA9IHN3YXBfY29sb3IodXMpXG4gICAgdmFyIHNlY29uZF9yYW5rID0geyBiOiBSQU5LXzcsIHc6IFJBTktfMiB9XG5cbiAgICB2YXIgZmlyc3Rfc3EgPSBTUVVBUkVfTUFQLmE4XG4gICAgdmFyIGxhc3Rfc3EgPSBTUVVBUkVfTUFQLmgxXG4gICAgdmFyIHNpbmdsZV9zcXVhcmUgPSBmYWxzZVxuXG4gICAgLyogZG8gd2Ugd2FudCBsZWdhbCBtb3Zlcz8gKi9cbiAgICB2YXIgbGVnYWwgPVxuICAgICAgdHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdsZWdhbCcgaW4gb3B0aW9uc1xuICAgICAgICA/IG9wdGlvbnMubGVnYWxcbiAgICAgICAgOiB0cnVlXG5cbiAgICB2YXIgcGllY2VfdHlwZSA9XG4gICAgICB0eXBlb2Ygb3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICdwaWVjZScgaW4gb3B0aW9ucyAmJlxuICAgICAgdHlwZW9mIG9wdGlvbnMucGllY2UgPT09ICdzdHJpbmcnXG4gICAgICAgID8gb3B0aW9ucy5waWVjZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIDogdHJ1ZVxuXG4gICAgLyogYXJlIHdlIGdlbmVyYXRpbmcgbW92ZXMgZm9yIGEgc2luZ2xlIHNxdWFyZT8gKi9cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdzcXVhcmUnIGluIG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zLnNxdWFyZSBpbiBTUVVBUkVfTUFQKSB7XG4gICAgICAgIGZpcnN0X3NxID0gbGFzdF9zcSA9IFNRVUFSRV9NQVBbb3B0aW9ucy5zcXVhcmVdXG4gICAgICAgIHNpbmdsZV9zcXVhcmUgPSB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBpbnZhbGlkIHNxdWFyZSAqL1xuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gZmlyc3Rfc3E7IGkgPD0gbGFzdF9zcTsgaSsrKSB7XG4gICAgICAvKiBkaWQgd2UgcnVuIG9mZiB0aGUgZW5kIG9mIHRoZSBib2FyZCAqL1xuICAgICAgaWYgKGkgJiAweDg4KSB7XG4gICAgICAgIGkgKz0gN1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgcGllY2UgPSBib2FyZFtpXVxuICAgICAgaWYgKHBpZWNlID09IG51bGwgfHwgcGllY2UuY29sb3IgIT09IHVzKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChwaWVjZS50eXBlID09PSBQQVdOICYmIChwaWVjZV90eXBlID09PSB0cnVlIHx8IHBpZWNlX3R5cGUgPT09IFBBV04pKSB7XG4gICAgICAgIC8qIHNpbmdsZSBzcXVhcmUsIG5vbi1jYXB0dXJpbmcgKi9cbiAgICAgICAgdmFyIHNxdWFyZSA9IGkgKyBQQVdOX09GRlNFVFNbdXNdWzBdXG4gICAgICAgIGlmIChib2FyZFtzcXVhcmVdID09IG51bGwpIHtcbiAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5OT1JNQUwpXG5cbiAgICAgICAgICAvKiBkb3VibGUgc3F1YXJlICovXG4gICAgICAgICAgdmFyIHNxdWFyZSA9IGkgKyBQQVdOX09GRlNFVFNbdXNdWzFdXG4gICAgICAgICAgaWYgKHNlY29uZF9yYW5rW3VzXSA9PT0gcmFuayhpKSAmJiBib2FyZFtzcXVhcmVdID09IG51bGwpIHtcbiAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgaSwgc3F1YXJlLCBCSVRTLkJJR19QQVdOKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHBhd24gY2FwdHVyZXMgKi9cbiAgICAgICAgZm9yIChqID0gMjsgaiA8IDQ7IGorKykge1xuICAgICAgICAgIHZhciBzcXVhcmUgPSBpICsgUEFXTl9PRkZTRVRTW3VzXVtqXVxuICAgICAgICAgIGlmIChzcXVhcmUgJiAweDg4KSBjb250aW51ZVxuXG4gICAgICAgICAgaWYgKGJvYXJkW3NxdWFyZV0gIT0gbnVsbCAmJiBib2FyZFtzcXVhcmVdLmNvbG9yID09PSB0aGVtKSB7XG4gICAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5DQVBUVVJFKVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3F1YXJlID09PSBlcF9zcXVhcmUpIHtcbiAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgaSwgZXBfc3F1YXJlLCBCSVRTLkVQX0NBUFRVUkUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBpZWNlX3R5cGUgPT09IHRydWUgfHwgcGllY2VfdHlwZSA9PT0gcGllY2UudHlwZSkge1xuICAgICAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gUElFQ0VfT0ZGU0VUU1twaWVjZS50eXBlXS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgIHZhciBvZmZzZXQgPSBQSUVDRV9PRkZTRVRTW3BpZWNlLnR5cGVdW2pdXG4gICAgICAgICAgdmFyIHNxdWFyZSA9IGlcblxuICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBzcXVhcmUgKz0gb2Zmc2V0XG4gICAgICAgICAgICBpZiAoc3F1YXJlICYgMHg4OCkgYnJlYWtcblxuICAgICAgICAgICAgaWYgKGJvYXJkW3NxdWFyZV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5OT1JNQUwpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoYm9hcmRbc3F1YXJlXS5jb2xvciA9PT0gdXMpIGJyZWFrXG4gICAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgaSwgc3F1YXJlLCBCSVRTLkNBUFRVUkUpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGJyZWFrLCBpZiBrbmlnaHQgb3Iga2luZyAqL1xuICAgICAgICAgICAgaWYgKHBpZWNlLnR5cGUgPT09ICduJyB8fCBwaWVjZS50eXBlID09PSAnaycpIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogY2hlY2sgZm9yIGNhc3RsaW5nIGlmOiBhKSB3ZSdyZSBnZW5lcmF0aW5nIGFsbCBtb3Zlcywgb3IgYikgd2UncmUgZG9pbmdcbiAgICAgKiBzaW5nbGUgc3F1YXJlIG1vdmUgZ2VuZXJhdGlvbiBvbiB0aGUga2luZydzIHNxdWFyZVxuICAgICAqL1xuICAgIGlmIChwaWVjZV90eXBlID09PSB0cnVlIHx8IHBpZWNlX3R5cGUgPT09IEtJTkcpIHtcbiAgICAgIGlmICghc2luZ2xlX3NxdWFyZSB8fCBsYXN0X3NxID09PSBraW5nc1t1c10pIHtcbiAgICAgICAgLyoga2luZy1zaWRlIGNhc3RsaW5nICovXG4gICAgICAgIGlmIChjYXN0bGluZ1t1c10gJiBCSVRTLktTSURFX0NBU1RMRSkge1xuICAgICAgICAgIHZhciBjYXN0bGluZ19mcm9tID0ga2luZ3NbdXNdXG4gICAgICAgICAgdmFyIGNhc3RsaW5nX3RvID0gY2FzdGxpbmdfZnJvbSArIDJcblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb20gKyAxXSA9PSBudWxsICYmXG4gICAgICAgICAgICBib2FyZFtjYXN0bGluZ190b10gPT0gbnVsbCAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGtpbmdzW3VzXSkgJiZcbiAgICAgICAgICAgICFhdHRhY2tlZCh0aGVtLCBjYXN0bGluZ19mcm9tICsgMSkgJiZcbiAgICAgICAgICAgICFhdHRhY2tlZCh0aGVtLCBjYXN0bGluZ190bylcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3Zlcywga2luZ3NbdXNdLCBjYXN0bGluZ190bywgQklUUy5LU0lERV9DQVNUTEUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogcXVlZW4tc2lkZSBjYXN0bGluZyAqL1xuICAgICAgICBpZiAoY2FzdGxpbmdbdXNdICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgICAgICB2YXIgY2FzdGxpbmdfZnJvbSA9IGtpbmdzW3VzXVxuICAgICAgICAgIHZhciBjYXN0bGluZ190byA9IGNhc3RsaW5nX2Zyb20gLSAyXG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBib2FyZFtjYXN0bGluZ19mcm9tIC0gMV0gPT0gbnVsbCAmJlxuICAgICAgICAgICAgYm9hcmRbY2FzdGxpbmdfZnJvbSAtIDJdID09IG51bGwgJiZcbiAgICAgICAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb20gLSAzXSA9PSBudWxsICYmXG4gICAgICAgICAgICAhYXR0YWNrZWQodGhlbSwga2luZ3NbdXNdKSAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGNhc3RsaW5nX2Zyb20gLSAxKSAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGNhc3RsaW5nX3RvKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgYWRkX21vdmUoYm9hcmQsIG1vdmVzLCBraW5nc1t1c10sIGNhc3RsaW5nX3RvLCBCSVRTLlFTSURFX0NBU1RMRSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiByZXR1cm4gYWxsIHBzZXVkby1sZWdhbCBtb3ZlcyAodGhpcyBpbmNsdWRlcyBtb3ZlcyB0aGF0IGFsbG93IHRoZSBraW5nXG4gICAgICogdG8gYmUgY2FwdHVyZWQpXG4gICAgICovXG4gICAgaWYgKCFsZWdhbCkge1xuICAgICAgcmV0dXJuIG1vdmVzXG4gICAgfVxuXG4gICAgLyogZmlsdGVyIG91dCBpbGxlZ2FsIG1vdmVzICovXG4gICAgdmFyIGxlZ2FsX21vdmVzID0gW11cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbW92ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIG1ha2VfbW92ZShtb3Zlc1tpXSlcbiAgICAgIGlmICgha2luZ19hdHRhY2tlZCh1cykpIHtcbiAgICAgICAgbGVnYWxfbW92ZXMucHVzaChtb3Zlc1tpXSlcbiAgICAgIH1cbiAgICAgIHVuZG9fbW92ZSgpXG4gICAgfVxuXG4gICAgcmV0dXJuIGxlZ2FsX21vdmVzXG4gIH1cblxuICAvKiBjb252ZXJ0IGEgbW92ZSBmcm9tIDB4ODggY29vcmRpbmF0ZXMgdG8gU3RhbmRhcmQgQWxnZWJyYWljIE5vdGF0aW9uXG4gICAqIChTQU4pXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2xvcHB5IFVzZSB0aGUgc2xvcHB5IFNBTiBnZW5lcmF0b3IgdG8gd29yayBhcm91bmQgb3ZlclxuICAgKiBkaXNhbWJpZ3VhdGlvbiBidWdzIGluIEZyaXR6IGFuZCBDaGVzc2Jhc2UuICBTZWUgYmVsb3c6XG4gICAqXG4gICAqIHIxYnFrYm5yL3BwcDJwcHAvMm41LzFCMXBQMy80UDMvOC9QUFBQMlBQL1JOQlFLMU5SIGIgS1FrcSAtIDIgNFxuICAgKiA0LiAuLi4gTmdlNyBpcyBvdmVybHkgZGlzYW1iaWd1YXRlZCBiZWNhdXNlIHRoZSBrbmlnaHQgb24gYzYgaXMgcGlubmVkXG4gICAqIDQuIC4uLiBOZTcgaXMgdGVjaG5pY2FsbHkgdGhlIHZhbGlkIFNBTlxuICAgKi9cbiAgZnVuY3Rpb24gbW92ZV90b19zYW4obW92ZSwgbW92ZXMpIHtcbiAgICB2YXIgb3V0cHV0ID0gJydcblxuICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5LU0lERV9DQVNUTEUpIHtcbiAgICAgIG91dHB1dCA9ICdPLU8nXG4gICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgIG91dHB1dCA9ICdPLU8tTydcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1vdmUucGllY2UgIT09IFBBV04pIHtcbiAgICAgICAgdmFyIGRpc2FtYmlndWF0b3IgPSBnZXRfZGlzYW1iaWd1YXRvcihtb3ZlLCBtb3ZlcylcbiAgICAgICAgb3V0cHV0ICs9IG1vdmUucGllY2UudG9VcHBlckNhc2UoKSArIGRpc2FtYmlndWF0b3JcbiAgICAgIH1cblxuICAgICAgaWYgKG1vdmUuZmxhZ3MgJiAoQklUUy5DQVBUVVJFIHwgQklUUy5FUF9DQVBUVVJFKSkge1xuICAgICAgICBpZiAobW92ZS5waWVjZSA9PT0gUEFXTikge1xuICAgICAgICAgIG91dHB1dCArPSBhbGdlYnJhaWMobW92ZS5mcm9tKVswXVxuICAgICAgICB9XG4gICAgICAgIG91dHB1dCArPSAneCdcbiAgICAgIH1cblxuICAgICAgb3V0cHV0ICs9IGFsZ2VicmFpYyhtb3ZlLnRvKVxuXG4gICAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuUFJPTU9USU9OKSB7XG4gICAgICAgIG91dHB1dCArPSAnPScgKyBtb3ZlLnByb21vdGlvbi50b1VwcGVyQ2FzZSgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFrZV9tb3ZlKG1vdmUpXG4gICAgaWYgKGluX2NoZWNrKCkpIHtcbiAgICAgIGlmIChpbl9jaGVja21hdGUoKSkge1xuICAgICAgICBvdXRwdXQgKz0gJyMnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQgKz0gJysnXG4gICAgICB9XG4gICAgfVxuICAgIHVuZG9fbW92ZSgpXG5cbiAgICByZXR1cm4gb3V0cHV0XG4gIH1cblxuICBmdW5jdGlvbiBhdHRhY2tlZChjb2xvciwgc3F1YXJlKSB7XG4gICAgZm9yICh2YXIgaSA9IFNRVUFSRV9NQVAuYTg7IGkgPD0gU1FVQVJFX01BUC5oMTsgaSsrKSB7XG4gICAgICAvKiBkaWQgd2UgcnVuIG9mZiB0aGUgZW5kIG9mIHRoZSBib2FyZCAqL1xuICAgICAgaWYgKGkgJiAweDg4KSB7XG4gICAgICAgIGkgKz0gN1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvKiBpZiBlbXB0eSBzcXVhcmUgb3Igd3JvbmcgY29sb3IgKi9cbiAgICAgIGlmIChib2FyZFtpXSA9PSBudWxsIHx8IGJvYXJkW2ldLmNvbG9yICE9PSBjb2xvcikgY29udGludWVcblxuICAgICAgdmFyIHBpZWNlID0gYm9hcmRbaV1cbiAgICAgIHZhciBkaWZmZXJlbmNlID0gaSAtIHNxdWFyZVxuICAgICAgdmFyIGluZGV4ID0gZGlmZmVyZW5jZSArIDExOVxuXG4gICAgICBpZiAoQVRUQUNLU1tpbmRleF0gJiAoMSA8PCBTSElGVFNbcGllY2UudHlwZV0pKSB7XG4gICAgICAgIGlmIChwaWVjZS50eXBlID09PSBQQVdOKSB7XG4gICAgICAgICAgaWYgKGRpZmZlcmVuY2UgPiAwKSB7XG4gICAgICAgICAgICBpZiAocGllY2UuY29sb3IgPT09IFdISVRFKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocGllY2UuY29sb3IgPT09IEJMQUNLKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLyogaWYgdGhlIHBpZWNlIGlzIGEga25pZ2h0IG9yIGEga2luZyAqL1xuICAgICAgICBpZiAocGllY2UudHlwZSA9PT0gJ24nIHx8IHBpZWNlLnR5cGUgPT09ICdrJykgcmV0dXJuIHRydWVcblxuICAgICAgICB2YXIgb2Zmc2V0ID0gUkFZU1tpbmRleF1cbiAgICAgICAgdmFyIGogPSBpICsgb2Zmc2V0XG5cbiAgICAgICAgdmFyIGJsb2NrZWQgPSBmYWxzZVxuICAgICAgICB3aGlsZSAoaiAhPT0gc3F1YXJlKSB7XG4gICAgICAgICAgaWYgKGJvYXJkW2pdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGJsb2NrZWQgPSB0cnVlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBqICs9IG9mZnNldFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFibG9ja2VkKSByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgZnVuY3Rpb24ga2luZ19hdHRhY2tlZChjb2xvcikge1xuICAgIHJldHVybiBhdHRhY2tlZChzd2FwX2NvbG9yKGNvbG9yKSwga2luZ3NbY29sb3JdKVxuICB9XG5cbiAgZnVuY3Rpb24gaW5fY2hlY2soKSB7XG4gICAgcmV0dXJuIGtpbmdfYXR0YWNrZWQodHVybilcbiAgfVxuXG4gIGZ1bmN0aW9uIGluX2NoZWNrbWF0ZSgpIHtcbiAgICByZXR1cm4gaW5fY2hlY2soKSAmJiBnZW5lcmF0ZV9tb3ZlcygpLmxlbmd0aCA9PT0gMFxuICB9XG5cbiAgZnVuY3Rpb24gaW5fc3RhbGVtYXRlKCkge1xuICAgIHJldHVybiAhaW5fY2hlY2soKSAmJiBnZW5lcmF0ZV9tb3ZlcygpLmxlbmd0aCA9PT0gMFxuICB9XG5cbiAgZnVuY3Rpb24gaW5zdWZmaWNpZW50X21hdGVyaWFsKCkge1xuICAgIHZhciBwaWVjZXMgPSB7fVxuICAgIHZhciBiaXNob3BzID0gW11cbiAgICB2YXIgbnVtX3BpZWNlcyA9IDBcbiAgICB2YXIgc3FfY29sb3IgPSAwXG5cbiAgICBmb3IgKHZhciBpID0gU1FVQVJFX01BUC5hODsgaSA8PSBTUVVBUkVfTUFQLmgxOyBpKyspIHtcbiAgICAgIHNxX2NvbG9yID0gKHNxX2NvbG9yICsgMSkgJSAyXG4gICAgICBpZiAoaSAmIDB4ODgpIHtcbiAgICAgICAgaSArPSA3XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldXG4gICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgcGllY2VzW3BpZWNlLnR5cGVdID0gcGllY2UudHlwZSBpbiBwaWVjZXMgPyBwaWVjZXNbcGllY2UudHlwZV0gKyAxIDogMVxuICAgICAgICBpZiAocGllY2UudHlwZSA9PT0gQklTSE9QKSB7XG4gICAgICAgICAgYmlzaG9wcy5wdXNoKHNxX2NvbG9yKVxuICAgICAgICB9XG4gICAgICAgIG51bV9waWVjZXMrK1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qIGsgdnMuIGsgKi9cbiAgICBpZiAobnVtX3BpZWNlcyA9PT0gMikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgLyogayB2cy4ga24gLi4uLiBvciAuLi4uIGsgdnMuIGtiICovXG4gICAgICBudW1fcGllY2VzID09PSAzICYmXG4gICAgICAocGllY2VzW0JJU0hPUF0gPT09IDEgfHwgcGllY2VzW0tOSUdIVF0gPT09IDEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSBpZiAobnVtX3BpZWNlcyA9PT0gcGllY2VzW0JJU0hPUF0gKyAyKSB7XG4gICAgICAvKiBrYiB2cy4ga2Igd2hlcmUgYW55IG51bWJlciBvZiBiaXNob3BzIGFyZSBhbGwgb24gdGhlIHNhbWUgY29sb3IgKi9cbiAgICAgIHZhciBzdW0gPSAwXG4gICAgICB2YXIgbGVuID0gYmlzaG9wcy5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgc3VtICs9IGJpc2hvcHNbaV1cbiAgICAgIH1cbiAgICAgIGlmIChzdW0gPT09IDAgfHwgc3VtID09PSBsZW4pIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIGluX3RocmVlZm9sZF9yZXBldGl0aW9uKCkge1xuICAgIC8qIFRPRE86IHdoaWxlIHRoaXMgZnVuY3Rpb24gaXMgZmluZSBmb3IgY2FzdWFsIHVzZSwgYSBiZXR0ZXJcbiAgICAgKiBpbXBsZW1lbnRhdGlvbiB3b3VsZCB1c2UgYSBab2JyaXN0IGtleSAoaW5zdGVhZCBvZiBGRU4pLiB0aGVcbiAgICAgKiBab2JyaXN0IGtleSB3b3VsZCBiZSBtYWludGFpbmVkIGluIHRoZSBtYWtlX21vdmUvdW5kb19tb3ZlIGZ1bmN0aW9ucyxcbiAgICAgKiBhdm9pZGluZyB0aGUgY29zdGx5IHRoYXQgd2UgZG8gYmVsb3cuXG4gICAgICovXG4gICAgdmFyIG1vdmVzID0gW11cbiAgICB2YXIgcG9zaXRpb25zID0ge31cbiAgICB2YXIgcmVwZXRpdGlvbiA9IGZhbHNlXG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIG1vdmUgPSB1bmRvX21vdmUoKVxuICAgICAgaWYgKCFtb3ZlKSBicmVha1xuICAgICAgbW92ZXMucHVzaChtb3ZlKVxuICAgIH1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAvKiByZW1vdmUgdGhlIGxhc3QgdHdvIGZpZWxkcyBpbiB0aGUgRkVOIHN0cmluZywgdGhleSdyZSBub3QgbmVlZGVkXG4gICAgICAgKiB3aGVuIGNoZWNraW5nIGZvciBkcmF3IGJ5IHJlcCAqL1xuICAgICAgdmFyIGZlbiA9IGdlbmVyYXRlX2ZlbigpLnNwbGl0KCcgJykuc2xpY2UoMCwgNCkuam9pbignICcpXG5cbiAgICAgIC8qIGhhcyB0aGUgcG9zaXRpb24gb2NjdXJyZWQgdGhyZWUgb3IgbW92ZSB0aW1lcyAqL1xuICAgICAgcG9zaXRpb25zW2Zlbl0gPSBmZW4gaW4gcG9zaXRpb25zID8gcG9zaXRpb25zW2Zlbl0gKyAxIDogMVxuICAgICAgaWYgKHBvc2l0aW9uc1tmZW5dID49IDMpIHtcbiAgICAgICAgcmVwZXRpdGlvbiA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCFtb3Zlcy5sZW5ndGgpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIG1ha2VfbW92ZShtb3Zlcy5wb3AoKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVwZXRpdGlvblxuICB9XG5cbiAgZnVuY3Rpb24gcHVzaChtb3ZlKSB7XG4gICAgaGlzdG9yeS5wdXNoKHtcbiAgICAgIG1vdmU6IG1vdmUsXG4gICAgICBraW5nczogeyBiOiBraW5ncy5iLCB3OiBraW5ncy53IH0sXG4gICAgICB0dXJuOiB0dXJuLFxuICAgICAgY2FzdGxpbmc6IHsgYjogY2FzdGxpbmcuYiwgdzogY2FzdGxpbmcudyB9LFxuICAgICAgZXBfc3F1YXJlOiBlcF9zcXVhcmUsXG4gICAgICBoYWxmX21vdmVzOiBoYWxmX21vdmVzLFxuICAgICAgbW92ZV9udW1iZXI6IG1vdmVfbnVtYmVyLFxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBtYWtlX21vdmUobW92ZSkge1xuICAgIHZhciB1cyA9IHR1cm5cbiAgICB2YXIgdGhlbSA9IHN3YXBfY29sb3IodXMpXG4gICAgcHVzaChtb3ZlKVxuXG4gICAgYm9hcmRbbW92ZS50b10gPSBib2FyZFttb3ZlLmZyb21dXG4gICAgYm9hcmRbbW92ZS5mcm9tXSA9IG51bGxcblxuICAgIC8qIGlmIGVwIGNhcHR1cmUsIHJlbW92ZSB0aGUgY2FwdHVyZWQgcGF3biAqL1xuICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5FUF9DQVBUVVJFKSB7XG4gICAgICBpZiAodHVybiA9PT0gQkxBQ0spIHtcbiAgICAgICAgYm9hcmRbbW92ZS50byAtIDE2XSA9IG51bGxcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvYXJkW21vdmUudG8gKyAxNl0gPSBudWxsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogaWYgcGF3biBwcm9tb3Rpb24sIHJlcGxhY2Ugd2l0aCBuZXcgcGllY2UgKi9cbiAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuUFJPTU9USU9OKSB7XG4gICAgICBib2FyZFttb3ZlLnRvXSA9IHsgdHlwZTogbW92ZS5wcm9tb3Rpb24sIGNvbG9yOiB1cyB9XG4gICAgfVxuXG4gICAgLyogaWYgd2UgbW92ZWQgdGhlIGtpbmcgKi9cbiAgICBpZiAoYm9hcmRbbW92ZS50b10udHlwZSA9PT0gS0lORykge1xuICAgICAga2luZ3NbYm9hcmRbbW92ZS50b10uY29sb3JdID0gbW92ZS50b1xuXG4gICAgICAvKiBpZiB3ZSBjYXN0bGVkLCBtb3ZlIHRoZSByb29rIG5leHQgdG8gdGhlIGtpbmcgKi9cbiAgICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5LU0lERV9DQVNUTEUpIHtcbiAgICAgICAgdmFyIGNhc3RsaW5nX3RvID0gbW92ZS50byAtIDFcbiAgICAgICAgdmFyIGNhc3RsaW5nX2Zyb20gPSBtb3ZlLnRvICsgMVxuICAgICAgICBib2FyZFtjYXN0bGluZ190b10gPSBib2FyZFtjYXN0bGluZ19mcm9tXVxuICAgICAgICBib2FyZFtjYXN0bGluZ19mcm9tXSA9IG51bGxcbiAgICAgIH0gZWxzZSBpZiAobW92ZS5mbGFncyAmIEJJVFMuUVNJREVfQ0FTVExFKSB7XG4gICAgICAgIHZhciBjYXN0bGluZ190byA9IG1vdmUudG8gKyAxXG4gICAgICAgIHZhciBjYXN0bGluZ19mcm9tID0gbW92ZS50byAtIDJcbiAgICAgICAgYm9hcmRbY2FzdGxpbmdfdG9dID0gYm9hcmRbY2FzdGxpbmdfZnJvbV1cbiAgICAgICAgYm9hcmRbY2FzdGxpbmdfZnJvbV0gPSBudWxsXG4gICAgICB9XG5cbiAgICAgIC8qIHR1cm4gb2ZmIGNhc3RsaW5nICovXG4gICAgICBjYXN0bGluZ1t1c10gPSAnJ1xuICAgIH1cblxuICAgIC8qIHR1cm4gb2ZmIGNhc3RsaW5nIGlmIHdlIG1vdmUgYSByb29rICovXG4gICAgaWYgKGNhc3RsaW5nW3VzXSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IFJPT0tTW3VzXS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbW92ZS5mcm9tID09PSBST09LU1t1c11baV0uc3F1YXJlICYmXG4gICAgICAgICAgY2FzdGxpbmdbdXNdICYgUk9PS1NbdXNdW2ldLmZsYWdcbiAgICAgICAgKSB7XG4gICAgICAgICAgY2FzdGxpbmdbdXNdIF49IFJPT0tTW3VzXVtpXS5mbGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qIHR1cm4gb2ZmIGNhc3RsaW5nIGlmIHdlIGNhcHR1cmUgYSByb29rICovXG4gICAgaWYgKGNhc3RsaW5nW3RoZW1dKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gUk9PS1NbdGhlbV0ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIG1vdmUudG8gPT09IFJPT0tTW3RoZW1dW2ldLnNxdWFyZSAmJlxuICAgICAgICAgIGNhc3RsaW5nW3RoZW1dICYgUk9PS1NbdGhlbV1baV0uZmxhZ1xuICAgICAgICApIHtcbiAgICAgICAgICBjYXN0bGluZ1t0aGVtXSBePSBST09LU1t0aGVtXVtpXS5mbGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qIGlmIGJpZyBwYXduIG1vdmUsIHVwZGF0ZSB0aGUgZW4gcGFzc2FudCBzcXVhcmUgKi9cbiAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuQklHX1BBV04pIHtcbiAgICAgIGlmICh0dXJuID09PSAnYicpIHtcbiAgICAgICAgZXBfc3F1YXJlID0gbW92ZS50byAtIDE2XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcF9zcXVhcmUgPSBtb3ZlLnRvICsgMTZcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXBfc3F1YXJlID0gRU1QVFlcbiAgICB9XG5cbiAgICAvKiByZXNldCB0aGUgNTAgbW92ZSBjb3VudGVyIGlmIGEgcGF3biBpcyBtb3ZlZCBvciBhIHBpZWNlIGlzIGNhcHR1cmVkICovXG4gICAgaWYgKG1vdmUucGllY2UgPT09IFBBV04pIHtcbiAgICAgIGhhbGZfbW92ZXMgPSAwXG4gICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgKEJJVFMuQ0FQVFVSRSB8IEJJVFMuRVBfQ0FQVFVSRSkpIHtcbiAgICAgIGhhbGZfbW92ZXMgPSAwXG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbGZfbW92ZXMrK1xuICAgIH1cblxuICAgIGlmICh0dXJuID09PSBCTEFDSykge1xuICAgICAgbW92ZV9udW1iZXIrK1xuICAgIH1cbiAgICB0dXJuID0gc3dhcF9jb2xvcih0dXJuKVxuICB9XG5cbiAgZnVuY3Rpb24gdW5kb19tb3ZlKCkge1xuICAgIHZhciBvbGQgPSBoaXN0b3J5LnBvcCgpXG4gICAgaWYgKG9sZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBtb3ZlID0gb2xkLm1vdmVcbiAgICBraW5ncyA9IG9sZC5raW5nc1xuICAgIHR1cm4gPSBvbGQudHVyblxuICAgIGNhc3RsaW5nID0gb2xkLmNhc3RsaW5nXG4gICAgZXBfc3F1YXJlID0gb2xkLmVwX3NxdWFyZVxuICAgIGhhbGZfbW92ZXMgPSBvbGQuaGFsZl9tb3Zlc1xuICAgIG1vdmVfbnVtYmVyID0gb2xkLm1vdmVfbnVtYmVyXG5cbiAgICB2YXIgdXMgPSB0dXJuXG4gICAgdmFyIHRoZW0gPSBzd2FwX2NvbG9yKHR1cm4pXG5cbiAgICBib2FyZFttb3ZlLmZyb21dID0gYm9hcmRbbW92ZS50b11cbiAgICBib2FyZFttb3ZlLmZyb21dLnR5cGUgPSBtb3ZlLnBpZWNlIC8vIHRvIHVuZG8gYW55IHByb21vdGlvbnNcbiAgICBib2FyZFttb3ZlLnRvXSA9IG51bGxcblxuICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5DQVBUVVJFKSB7XG4gICAgICBib2FyZFttb3ZlLnRvXSA9IHsgdHlwZTogbW92ZS5jYXB0dXJlZCwgY29sb3I6IHRoZW0gfVxuICAgIH0gZWxzZSBpZiAobW92ZS5mbGFncyAmIEJJVFMuRVBfQ0FQVFVSRSkge1xuICAgICAgdmFyIGluZGV4XG4gICAgICBpZiAodXMgPT09IEJMQUNLKSB7XG4gICAgICAgIGluZGV4ID0gbW92ZS50byAtIDE2XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IG1vdmUudG8gKyAxNlxuICAgICAgfVxuICAgICAgYm9hcmRbaW5kZXhdID0geyB0eXBlOiBQQVdOLCBjb2xvcjogdGhlbSB9XG4gICAgfVxuXG4gICAgaWYgKG1vdmUuZmxhZ3MgJiAoQklUUy5LU0lERV9DQVNUTEUgfCBCSVRTLlFTSURFX0NBU1RMRSkpIHtcbiAgICAgIHZhciBjYXN0bGluZ190bywgY2FzdGxpbmdfZnJvbVxuICAgICAgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLktTSURFX0NBU1RMRSkge1xuICAgICAgICBjYXN0bGluZ190byA9IG1vdmUudG8gKyAxXG4gICAgICAgIGNhc3RsaW5nX2Zyb20gPSBtb3ZlLnRvIC0gMVxuICAgICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgICAgY2FzdGxpbmdfdG8gPSBtb3ZlLnRvIC0gMlxuICAgICAgICBjYXN0bGluZ19mcm9tID0gbW92ZS50byArIDFcbiAgICAgIH1cblxuICAgICAgYm9hcmRbY2FzdGxpbmdfdG9dID0gYm9hcmRbY2FzdGxpbmdfZnJvbV1cbiAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb21dID0gbnVsbFxuICAgIH1cblxuICAgIHJldHVybiBtb3ZlXG4gIH1cblxuICAvLyBjb252ZXJ0IGEgbW92ZSBmcm9tIFN0YW5kYXJkIEFsZ2VicmFpYyBOb3RhdGlvbiAoU0FOKSB0byAweDg4IGNvb3JkaW5hdGVzXG4gIGZ1bmN0aW9uIG1vdmVfZnJvbV9zYW4obW92ZSwgc2xvcHB5KSB7XG4gICAgLy8gc3RyaXAgb2ZmIGFueSBtb3ZlIGRlY29yYXRpb25zOiBlLmcgTmYzKz8hIGJlY29tZXMgTmYzXG4gICAgdmFyIGNsZWFuX21vdmUgPSBzdHJpcHBlZF9zYW4obW92ZSlcblxuICAgIC8vIHRoZSBtb3ZlIHBhcnNlcnMgaXMgYSAyLXN0ZXAgc3RhdGVcbiAgICBmb3IgKHZhciBwYXJzZXIgPSAwOyBwYXJzZXIgPCAyOyBwYXJzZXIrKykge1xuICAgICAgaWYgKHBhcnNlciA9PSBQQVJTRVJfU0xPUFBZKSB7XG4gICAgICAgIC8vIG9ubHkgcnVuIHRoZSBzbG9wcHkgcGFyc2UgaWYgZXhwbGljaXRseSByZXF1ZXN0ZWRcbiAgICAgICAgaWYgKCFzbG9wcHkpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHNsb3BweSBwYXJzZXIgYWxsb3dzIHRoZSB1c2VyIHRvIHBhcnNlIG5vbi1zdGFuZGFyZCBjaGVzc1xuICAgICAgICAvLyBub3RhdGlvbnMuIFRoaXMgcGFyc2VyIGlzIG9wdC1pbiAoYnkgc3BlY2lmeWluZyB0aGVcbiAgICAgICAgLy8gJ3sgc2xvcHB5OiB0cnVlIH0nIHNldHRpbmcpIGFuZCBpcyBvbmx5IHJ1biBhZnRlciB0aGUgU3RhbmRhcmRcbiAgICAgICAgLy8gQWxnZWJyYWljIE5vdGF0aW9uIChTQU4pIHBhcnNlciBoYXMgZmFpbGVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXaGVuIHJ1bm5pbmcgdGhlIHNsb3BweSBwYXJzZXIsIHdlJ2xsIHJ1biBhIHJlZ2V4IHRvIGdyYWIgdGhlIHBpZWNlLFxuICAgICAgICAvLyB0aGUgdG8vZnJvbSBzcXVhcmUsIGFuZCBhbiBvcHRpb25hbCBwcm9tb3Rpb24gcGllY2UuIFRoaXMgcmVnZXggd2lsbFxuICAgICAgICAvLyBwYXJzZSBjb21tb24gbm9uLXN0YW5kYXJkIG5vdGF0aW9uIGxpa2U6IFBlMi1lNCwgUmMxYzQsIFFmM3hmNyxcbiAgICAgICAgLy8gZjdmOHEsIGIxYzNcblxuICAgICAgICAvLyBOT1RFOiBTb21lIHBvc2l0aW9ucyBhbmQgbW92ZXMgbWF5IGJlIGFtYmlndW91cyB3aGVuIHVzaW5nIHRoZVxuICAgICAgICAvLyBzbG9wcHkgcGFyc2VyLiBGb3IgZXhhbXBsZSwgaW4gdGhpcyBwb3NpdGlvbjpcbiAgICAgICAgLy8gNmsxLzgvOC9CNy84LzgvOC9CTjRLMSB3IC0gLSAwIDEsIHRoZSBtb3ZlIGIxYzMgbWF5IGJlIGludGVycHJldGVkXG4gICAgICAgIC8vIGFzIE5jMyBvciBCMWMzIChhIGRpc2FtYmlndWF0ZWQgYmlzaG9wIG1vdmUpLiBJbiB0aGVzZSBjYXNlcywgdGhlXG4gICAgICAgIC8vIHNsb3BweSBwYXJzZXIgd2lsbCBkZWZhdWx0IHRvIHRoZSBtb3N0IG1vc3QgYmFzaWMgaW50ZXJwcmV0YXRpb25cbiAgICAgICAgLy8gKHdoaWNoIGlzIGIxYzMgcGFyc2luZyB0byBOYzMpLlxuXG4gICAgICAgIC8vIEZJWE1FOiB0aGVzZSB2YXIncyBhcmUgaG9pc3RlZCBpbnRvIGZ1bmN0aW9uIHNjb3BlLCB0aGlzIHdpbGwgbmVlZFxuICAgICAgICAvLyB0byBjaGFuZ2Ugd2hlbiBzd2l0Y2hpbmcgdG8gY29uc3QvbGV0XG5cbiAgICAgICAgdmFyIG92ZXJseV9kaXNhbWJpZ3VhdGVkID0gZmFsc2VcblxuICAgICAgICB2YXIgbWF0Y2hlcyA9IGNsZWFuX21vdmUubWF0Y2goXG4gICAgICAgICAgLyhbcG5icnFrUE5CUlFLXSk/KFthLWhdWzEtOF0peD8tPyhbYS1oXVsxLThdKShbcXJiblFSQk5dKT8vXG4gICAgICAgIClcbiAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICB2YXIgcGllY2UgPSBtYXRjaGVzWzFdXG4gICAgICAgICAgdmFyIGZyb20gPSBtYXRjaGVzWzJdXG4gICAgICAgICAgdmFyIHRvID0gbWF0Y2hlc1szXVxuICAgICAgICAgIHZhciBwcm9tb3Rpb24gPSBtYXRjaGVzWzRdXG5cbiAgICAgICAgICBpZiAoZnJvbS5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgb3Zlcmx5X2Rpc2FtYmlndWF0ZWQgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoZSBbYS1oXT9bMS04XT8gcG9ydGlvbiBvZiB0aGUgcmVnZXggYmVsb3cgaGFuZGxlcyBtb3ZlcyB0aGF0IG1heVxuICAgICAgICAgIC8vIGJlIG92ZXJseSBkaXNhbWJpZ3VhdGVkIChlLmcuIE5nZTcgaXMgdW5uZWNlc3NhcnkgYW5kIG5vbi1zdGFuZGFyZFxuICAgICAgICAgIC8vIHdoZW4gdGhlcmUgaXMgb25lIGxlZ2FsIGtuaWdodCBtb3ZlIHRvIGU3KS4gSW4gdGhpcyBjYXNlLCB0aGUgdmFsdWVcbiAgICAgICAgICAvLyBvZiAnZnJvbScgdmFyaWFibGUgd2lsbCBiZSBhIHJhbmsgb3IgZmlsZSwgbm90IGEgc3F1YXJlLlxuICAgICAgICAgIHZhciBtYXRjaGVzID0gY2xlYW5fbW92ZS5tYXRjaChcbiAgICAgICAgICAgIC8oW3BuYnJxa1BOQlJRS10pPyhbYS1oXT9bMS04XT8peD8tPyhbYS1oXVsxLThdKShbcXJiblFSQk5dKT8vXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIHZhciBwaWVjZSA9IG1hdGNoZXNbMV1cbiAgICAgICAgICAgIHZhciBmcm9tID0gbWF0Y2hlc1syXVxuICAgICAgICAgICAgdmFyIHRvID0gbWF0Y2hlc1szXVxuICAgICAgICAgICAgdmFyIHByb21vdGlvbiA9IG1hdGNoZXNbNF1cblxuICAgICAgICAgICAgaWYgKGZyb20ubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgdmFyIG92ZXJseV9kaXNhbWJpZ3VhdGVkID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcGllY2VfdHlwZSA9IGluZmVyX3BpZWNlX3R5cGUoY2xlYW5fbW92ZSlcbiAgICAgIHZhciBtb3ZlcyA9IGdlbmVyYXRlX21vdmVzKHtcbiAgICAgICAgbGVnYWw6IHRydWUsXG4gICAgICAgIHBpZWNlOiBwaWVjZSA/IHBpZWNlIDogcGllY2VfdHlwZSxcbiAgICAgIH0pXG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBzd2l0Y2ggKHBhcnNlcikge1xuICAgICAgICAgIGNhc2UgUEFSU0VSX1NUUklDVDoge1xuICAgICAgICAgICAgaWYgKGNsZWFuX21vdmUgPT09IHN0cmlwcGVkX3Nhbihtb3ZlX3RvX3Nhbihtb3Zlc1tpXSwgbW92ZXMpKSkge1xuICAgICAgICAgICAgICByZXR1cm4gbW92ZXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgUEFSU0VSX1NMT1BQWToge1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgLy8gaGFuZC1jb21wYXJlIG1vdmUgcHJvcGVydGllcyB3aXRoIHRoZSByZXN1bHRzIGZyb20gb3VyIHNsb3BweVxuICAgICAgICAgICAgICAvLyByZWdleFxuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgKCFwaWVjZSB8fCBwaWVjZS50b0xvd2VyQ2FzZSgpID09IG1vdmVzW2ldLnBpZWNlKSAmJlxuICAgICAgICAgICAgICAgIFNRVUFSRV9NQVBbZnJvbV0gPT0gbW92ZXNbaV0uZnJvbSAmJlxuICAgICAgICAgICAgICAgIFNRVUFSRV9NQVBbdG9dID09IG1vdmVzW2ldLnRvICYmXG4gICAgICAgICAgICAgICAgKCFwcm9tb3Rpb24gfHwgcHJvbW90aW9uLnRvTG93ZXJDYXNlKCkgPT0gbW92ZXNbaV0ucHJvbW90aW9uKVxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW92ZXNbaV1cbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChvdmVybHlfZGlzYW1iaWd1YXRlZCkge1xuICAgICAgICAgICAgICAgIC8vIFNQRUNJQUwgQ0FTRTogd2UgcGFyc2VkIGEgbW92ZSBzdHJpbmcgdGhhdCBtYXkgaGF2ZSBhblxuICAgICAgICAgICAgICAgIC8vIHVubmVlZGVkIHJhbmsvZmlsZSBkaXNhbWJpZ3VhdG9yIChlLmcuIE5nZTcpLiAgVGhlICdmcm9tJ1xuICAgICAgICAgICAgICAgIC8vIHZhcmlhYmxlIHdpbGxcbiAgICAgICAgICAgICAgICB2YXIgc3F1YXJlID0gYWxnZWJyYWljKG1vdmVzW2ldLmZyb20pXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgKCFwaWVjZSB8fCBwaWVjZS50b0xvd2VyQ2FzZSgpID09IG1vdmVzW2ldLnBpZWNlKSAmJlxuICAgICAgICAgICAgICAgICAgU1FVQVJFX01BUFt0b10gPT0gbW92ZXNbaV0udG8gJiZcbiAgICAgICAgICAgICAgICAgIChmcm9tID09IHNxdWFyZVswXSB8fCBmcm9tID09IHNxdWFyZVsxXSkgJiZcbiAgICAgICAgICAgICAgICAgICghcHJvbW90aW9uIHx8IHByb21vdGlvbi50b0xvd2VyQ2FzZSgpID09IG1vdmVzW2ldLnByb21vdGlvbilcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtb3Zlc1tpXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvKiBwcmV0dHkgPSBleHRlcm5hbCBtb3ZlIG9iamVjdCAqL1xuICBmdW5jdGlvbiBtYWtlX3ByZXR0eSh1Z2x5X21vdmUpIHtcbiAgICB2YXIgbW92ZSA9IGNsb25lKHVnbHlfbW92ZSlcbiAgICBtb3ZlLnNhbiA9IG1vdmVfdG9fc2FuKG1vdmUsIGdlbmVyYXRlX21vdmVzKHsgbGVnYWw6IHRydWUgfSkpXG4gICAgbW92ZS50byA9IGFsZ2VicmFpYyhtb3ZlLnRvKVxuICAgIG1vdmUuZnJvbSA9IGFsZ2VicmFpYyhtb3ZlLmZyb20pXG5cbiAgICB2YXIgZmxhZ3MgPSAnJ1xuXG4gICAgZm9yICh2YXIgZmxhZyBpbiBCSVRTKSB7XG4gICAgICBpZiAoQklUU1tmbGFnXSAmIG1vdmUuZmxhZ3MpIHtcbiAgICAgICAgZmxhZ3MgKz0gRkxBR1NbZmxhZ11cbiAgICAgIH1cbiAgICB9XG4gICAgbW92ZS5mbGFncyA9IGZsYWdzXG5cbiAgICByZXR1cm4gbW92ZVxuICB9XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqIERFQlVHR0lORyBVVElMSVRJRVNcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIGZ1bmN0aW9uIHBlcmZ0KGRlcHRoKSB7XG4gICAgdmFyIG1vdmVzID0gZ2VuZXJhdGVfbW92ZXMoeyBsZWdhbDogZmFsc2UgfSlcbiAgICB2YXIgbm9kZXMgPSAwXG4gICAgdmFyIGNvbG9yID0gdHVyblxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1vdmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBtYWtlX21vdmUobW92ZXNbaV0pXG4gICAgICBpZiAoIWtpbmdfYXR0YWNrZWQoY29sb3IpKSB7XG4gICAgICAgIGlmIChkZXB0aCAtIDEgPiAwKSB7XG4gICAgICAgICAgdmFyIGNoaWxkX25vZGVzID0gcGVyZnQoZGVwdGggLSAxKVxuICAgICAgICAgIG5vZGVzICs9IGNoaWxkX25vZGVzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbm9kZXMrK1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB1bmRvX21vdmUoKVxuICAgIH1cblxuICAgIHJldHVybiBub2Rlc1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogUFVCTElDIEFQSVxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICBsb2FkOiBmdW5jdGlvbiAoZmVuKSB7XG4gICAgICByZXR1cm4gbG9hZChmZW4pXG4gICAgfSxcblxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcmVzZXQoKVxuICAgIH0sXG5cbiAgICBtb3ZlczogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIC8qIFRoZSBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiBhIGNoZXNzIG1vdmUgaXMgaW4gMHg4OCBmb3JtYXQsIGFuZFxuICAgICAgICogbm90IG1lYW50IHRvIGJlIGh1bWFuLXJlYWRhYmxlLiAgVGhlIGNvZGUgYmVsb3cgY29udmVydHMgdGhlIDB4ODhcbiAgICAgICAqIHNxdWFyZSBjb29yZGluYXRlcyB0byBhbGdlYnJhaWMgY29vcmRpbmF0ZXMuICBJdCBhbHNvIHBydW5lcyBhblxuICAgICAgICogdW5uZWNlc3NhcnkgbW92ZSBrZXlzIHJlc3VsdGluZyBmcm9tIGEgdmVyYm9zZSBjYWxsLlxuICAgICAgICovXG5cbiAgICAgIHZhciB1Z2x5X21vdmVzID0gZ2VuZXJhdGVfbW92ZXMob3B0aW9ucylcbiAgICAgIHZhciBtb3ZlcyA9IFtdXG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB1Z2x5X21vdmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIC8qIGRvZXMgdGhlIHVzZXIgd2FudCBhIGZ1bGwgbW92ZSBvYmplY3QgKG1vc3QgbGlrZWx5IG5vdCksIG9yIGp1c3RcbiAgICAgICAgICogU0FOXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgJ3ZlcmJvc2UnIGluIG9wdGlvbnMgJiZcbiAgICAgICAgICBvcHRpb25zLnZlcmJvc2VcbiAgICAgICAgKSB7XG4gICAgICAgICAgbW92ZXMucHVzaChtYWtlX3ByZXR0eSh1Z2x5X21vdmVzW2ldKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb3Zlcy5wdXNoKFxuICAgICAgICAgICAgbW92ZV90b19zYW4odWdseV9tb3Zlc1tpXSwgZ2VuZXJhdGVfbW92ZXMoeyBsZWdhbDogdHJ1ZSB9KSlcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1vdmVzXG4gICAgfSxcblxuICAgIGluX2NoZWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW5fY2hlY2soKVxuICAgIH0sXG5cbiAgICBpbl9jaGVja21hdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpbl9jaGVja21hdGUoKVxuICAgIH0sXG5cbiAgICBpbl9zdGFsZW1hdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpbl9zdGFsZW1hdGUoKVxuICAgIH0sXG5cbiAgICBpbl9kcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBoYWxmX21vdmVzID49IDEwMCB8fFxuICAgICAgICBpbl9zdGFsZW1hdGUoKSB8fFxuICAgICAgICBpbnN1ZmZpY2llbnRfbWF0ZXJpYWwoKSB8fFxuICAgICAgICBpbl90aHJlZWZvbGRfcmVwZXRpdGlvbigpXG4gICAgICApXG4gICAgfSxcblxuICAgIGluc3VmZmljaWVudF9tYXRlcmlhbDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGluc3VmZmljaWVudF9tYXRlcmlhbCgpXG4gICAgfSxcblxuICAgIGluX3RocmVlZm9sZF9yZXBldGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW5fdGhyZWVmb2xkX3JlcGV0aXRpb24oKVxuICAgIH0sXG5cbiAgICBnYW1lX292ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGhhbGZfbW92ZXMgPj0gMTAwIHx8XG4gICAgICAgIGluX2NoZWNrbWF0ZSgpIHx8XG4gICAgICAgIGluX3N0YWxlbWF0ZSgpIHx8XG4gICAgICAgIGluc3VmZmljaWVudF9tYXRlcmlhbCgpIHx8XG4gICAgICAgIGluX3RocmVlZm9sZF9yZXBldGl0aW9uKClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVfZmVuOiBmdW5jdGlvbiAoZmVuKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGVfZmVuKGZlbilcbiAgICB9LFxuXG4gICAgZmVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZ2VuZXJhdGVfZmVuKClcbiAgICB9LFxuXG4gICAgYm9hcmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvdXRwdXQgPSBbXSxcbiAgICAgICAgcm93ID0gW11cblxuICAgICAgZm9yICh2YXIgaSA9IFNRVUFSRV9NQVAuYTg7IGkgPD0gU1FVQVJFX01BUC5oMTsgaSsrKSB7XG4gICAgICAgIGlmIChib2FyZFtpXSA9PSBudWxsKSB7XG4gICAgICAgICAgcm93LnB1c2gobnVsbClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByb3cucHVzaCh7XG4gICAgICAgICAgICBzcXVhcmU6IGFsZ2VicmFpYyhpKSxcbiAgICAgICAgICAgIHR5cGU6IGJvYXJkW2ldLnR5cGUsXG4gICAgICAgICAgICBjb2xvcjogYm9hcmRbaV0uY29sb3IsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGkgKyAxKSAmIDB4ODgpIHtcbiAgICAgICAgICBvdXRwdXQucHVzaChyb3cpXG4gICAgICAgICAgcm93ID0gW11cbiAgICAgICAgICBpICs9IDhcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcblxuICAgIHBnbjogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIC8qIHVzaW5nIHRoZSBzcGVjaWZpY2F0aW9uIGZyb20gaHR0cDovL3d3dy5jaGVzc2NsdWIuY29tL2hlbHAvUEdOLXNwZWNcbiAgICAgICAqIGV4YW1wbGUgZm9yIGh0bWwgdXNhZ2U6IC5wZ24oeyBtYXhfd2lkdGg6IDcyLCBuZXdsaW5lX2NoYXI6IFwiPGJyIC8+XCIgfSlcbiAgICAgICAqL1xuICAgICAgdmFyIG5ld2xpbmUgPVxuICAgICAgICB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG9wdGlvbnMubmV3bGluZV9jaGFyID09PSAnc3RyaW5nJ1xuICAgICAgICAgID8gb3B0aW9ucy5uZXdsaW5lX2NoYXJcbiAgICAgICAgICA6ICdcXG4nXG4gICAgICB2YXIgbWF4X3dpZHRoID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvcHRpb25zLm1heF93aWR0aCA9PT0gJ251bWJlcidcbiAgICAgICAgICA/IG9wdGlvbnMubWF4X3dpZHRoXG4gICAgICAgICAgOiAwXG4gICAgICB2YXIgcmVzdWx0ID0gW11cbiAgICAgIHZhciBoZWFkZXJfZXhpc3RzID0gZmFsc2VcblxuICAgICAgLyogYWRkIHRoZSBQR04gaGVhZGVyIGhlYWRlcnJtYXRpb24gKi9cbiAgICAgIGZvciAodmFyIGkgaW4gaGVhZGVyKSB7XG4gICAgICAgIC8qIFRPRE86IG9yZGVyIG9mIGVudW1lcmF0ZWQgcHJvcGVydGllcyBpbiBoZWFkZXIgb2JqZWN0IGlzIG5vdFxuICAgICAgICAgKiBndWFyYW50ZWVkLCBzZWUgRUNNQS0yNjIgc3BlYyAoc2VjdGlvbiAxMi42LjQpXG4gICAgICAgICAqL1xuICAgICAgICByZXN1bHQucHVzaCgnWycgKyBpICsgJyBcIicgKyBoZWFkZXJbaV0gKyAnXCJdJyArIG5ld2xpbmUpXG4gICAgICAgIGhlYWRlcl9leGlzdHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChoZWFkZXJfZXhpc3RzICYmIGhpc3RvcnkubGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG5ld2xpbmUpXG4gICAgICB9XG5cbiAgICAgIHZhciBhcHBlbmRfY29tbWVudCA9IGZ1bmN0aW9uIChtb3ZlX3N0cmluZykge1xuICAgICAgICB2YXIgY29tbWVudCA9IGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXVxuICAgICAgICBpZiAodHlwZW9mIGNvbW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdmFyIGRlbGltaXRlciA9IG1vdmVfc3RyaW5nLmxlbmd0aCA+IDAgPyAnICcgOiAnJ1xuICAgICAgICAgIG1vdmVfc3RyaW5nID0gYCR7bW92ZV9zdHJpbmd9JHtkZWxpbWl0ZXJ9eyR7Y29tbWVudH19YFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtb3ZlX3N0cmluZ1xuICAgICAgfVxuXG4gICAgICAvKiBwb3AgYWxsIG9mIGhpc3Rvcnkgb250byByZXZlcnNlZF9oaXN0b3J5ICovXG4gICAgICB2YXIgcmV2ZXJzZWRfaGlzdG9yeSA9IFtdXG4gICAgICB3aGlsZSAoaGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldmVyc2VkX2hpc3RvcnkucHVzaCh1bmRvX21vdmUoKSlcbiAgICAgIH1cblxuICAgICAgdmFyIG1vdmVzID0gW11cbiAgICAgIHZhciBtb3ZlX3N0cmluZyA9ICcnXG5cbiAgICAgIC8qIHNwZWNpYWwgY2FzZSBvZiBhIGNvbW1lbnRlZCBzdGFydGluZyBwb3NpdGlvbiB3aXRoIG5vIG1vdmVzICovXG4gICAgICBpZiAocmV2ZXJzZWRfaGlzdG9yeS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbW92ZXMucHVzaChhcHBlbmRfY29tbWVudCgnJykpXG4gICAgICB9XG5cbiAgICAgIC8qIGJ1aWxkIHRoZSBsaXN0IG9mIG1vdmVzLiAgYSBtb3ZlX3N0cmluZyBsb29rcyBsaWtlOiBcIjMuIGUzIGU2XCIgKi9cbiAgICAgIHdoaWxlIChyZXZlcnNlZF9oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgbW92ZV9zdHJpbmcgPSBhcHBlbmRfY29tbWVudChtb3ZlX3N0cmluZylcbiAgICAgICAgdmFyIG1vdmUgPSByZXZlcnNlZF9oaXN0b3J5LnBvcCgpXG5cbiAgICAgICAgLyogaWYgdGhlIHBvc2l0aW9uIHN0YXJ0ZWQgd2l0aCBibGFjayB0byBtb3ZlLCBzdGFydCBQR04gd2l0aCAxLiAuLi4gKi9cbiAgICAgICAgaWYgKCFoaXN0b3J5Lmxlbmd0aCAmJiBtb3ZlLmNvbG9yID09PSAnYicpIHtcbiAgICAgICAgICBtb3ZlX3N0cmluZyA9IG1vdmVfbnVtYmVyICsgJy4gLi4uJ1xuICAgICAgICB9IGVsc2UgaWYgKG1vdmUuY29sb3IgPT09ICd3Jykge1xuICAgICAgICAgIC8qIHN0b3JlIHRoZSBwcmV2aW91cyBnZW5lcmF0ZWQgbW92ZV9zdHJpbmcgaWYgd2UgaGF2ZSBvbmUgKi9cbiAgICAgICAgICBpZiAobW92ZV9zdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICBtb3Zlcy5wdXNoKG1vdmVfc3RyaW5nKVxuICAgICAgICAgIH1cbiAgICAgICAgICBtb3ZlX3N0cmluZyA9IG1vdmVfbnVtYmVyICsgJy4nXG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlX3N0cmluZyA9XG4gICAgICAgICAgbW92ZV9zdHJpbmcgKyAnICcgKyBtb3ZlX3RvX3Nhbihtb3ZlLCBnZW5lcmF0ZV9tb3Zlcyh7IGxlZ2FsOiB0cnVlIH0pKVxuICAgICAgICBtYWtlX21vdmUobW92ZSlcbiAgICAgIH1cblxuICAgICAgLyogYXJlIHRoZXJlIGFueSBvdGhlciBsZWZ0b3ZlciBtb3Zlcz8gKi9cbiAgICAgIGlmIChtb3ZlX3N0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgbW92ZXMucHVzaChhcHBlbmRfY29tbWVudChtb3ZlX3N0cmluZykpXG4gICAgICB9XG5cbiAgICAgIC8qIGlzIHRoZXJlIGEgcmVzdWx0PyAqL1xuICAgICAgaWYgKHR5cGVvZiBoZWFkZXIuUmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb3Zlcy5wdXNoKGhlYWRlci5SZXN1bHQpXG4gICAgICB9XG5cbiAgICAgIC8qIGhpc3Rvcnkgc2hvdWxkIGJlIGJhY2sgdG8gd2hhdCBpdCB3YXMgYmVmb3JlIHdlIHN0YXJ0ZWQgZ2VuZXJhdGluZyBQR04sXG4gICAgICAgKiBzbyBqb2luIHRvZ2V0aGVyIG1vdmVzXG4gICAgICAgKi9cbiAgICAgIGlmIChtYXhfd2lkdGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCcnKSArIG1vdmVzLmpvaW4oJyAnKVxuICAgICAgfVxuXG4gICAgICB2YXIgc3RyaXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChyZXN1bHQubGVuZ3RoID4gMCAmJiByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSAnICcpIHtcbiAgICAgICAgICByZXN1bHQucG9wKClcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICAvKiBOQjogdGhpcyBkb2VzIG5vdCBwcmVzZXJ2ZSBjb21tZW50IHdoaXRlc3BhY2UuICovXG4gICAgICB2YXIgd3JhcF9jb21tZW50ID0gZnVuY3Rpb24gKHdpZHRoLCBtb3ZlKSB7XG4gICAgICAgIGZvciAodmFyIHRva2VuIG9mIG1vdmUuc3BsaXQoJyAnKSkge1xuICAgICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh3aWR0aCArIHRva2VuLmxlbmd0aCA+IG1heF93aWR0aCkge1xuICAgICAgICAgICAgd2hpbGUgKHN0cmlwKCkpIHtcbiAgICAgICAgICAgICAgd2lkdGgtLVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3bGluZSlcbiAgICAgICAgICAgIHdpZHRoID0gMFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHQucHVzaCh0b2tlbilcbiAgICAgICAgICB3aWR0aCArPSB0b2tlbi5sZW5ndGhcbiAgICAgICAgICByZXN1bHQucHVzaCgnICcpXG4gICAgICAgICAgd2lkdGgrK1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdHJpcCgpKSB7XG4gICAgICAgICAgd2lkdGgtLVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aWR0aFxuICAgICAgfVxuXG4gICAgICAvKiB3cmFwIHRoZSBQR04gb3V0cHV0IGF0IG1heF93aWR0aCAqL1xuICAgICAgdmFyIGN1cnJlbnRfd2lkdGggPSAwXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjdXJyZW50X3dpZHRoICsgbW92ZXNbaV0ubGVuZ3RoID4gbWF4X3dpZHRoKSB7XG4gICAgICAgICAgaWYgKG1vdmVzW2ldLmluY2x1ZGVzKCd7JykpIHtcbiAgICAgICAgICAgIGN1cnJlbnRfd2lkdGggPSB3cmFwX2NvbW1lbnQoY3VycmVudF93aWR0aCwgbW92ZXNbaV0pXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBpZiB0aGUgY3VycmVudCBtb3ZlIHdpbGwgcHVzaCBwYXN0IG1heF93aWR0aCAqL1xuICAgICAgICBpZiAoY3VycmVudF93aWR0aCArIG1vdmVzW2ldLmxlbmd0aCA+IG1heF93aWR0aCAmJiBpICE9PSAwKSB7XG4gICAgICAgICAgLyogZG9uJ3QgZW5kIHRoZSBsaW5lIHdpdGggd2hpdGVzcGFjZSAqL1xuICAgICAgICAgIGlmIChyZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSAnICcpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wb3AoKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdC5wdXNoKG5ld2xpbmUpXG4gICAgICAgICAgY3VycmVudF93aWR0aCA9IDBcbiAgICAgICAgfSBlbHNlIGlmIChpICE9PSAwKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goJyAnKVxuICAgICAgICAgIGN1cnJlbnRfd2lkdGgrK1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKG1vdmVzW2ldKVxuICAgICAgICBjdXJyZW50X3dpZHRoICs9IG1vdmVzW2ldLmxlbmd0aFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0LmpvaW4oJycpXG4gICAgfSxcblxuICAgIGxvYWRfcGduOiBmdW5jdGlvbiAocGduLCBvcHRpb25zKSB7XG4gICAgICAvLyBhbGxvdyB0aGUgdXNlciB0byBzcGVjaWZ5IHRoZSBzbG9wcHkgbW92ZSBwYXJzZXIgdG8gd29yayBhcm91bmQgb3ZlclxuICAgICAgLy8gZGlzYW1iaWd1YXRpb24gYnVncyBpbiBGcml0eiBhbmQgQ2hlc3NiYXNlXG4gICAgICB2YXIgc2xvcHB5ID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdzbG9wcHknIGluIG9wdGlvbnNcbiAgICAgICAgICA/IG9wdGlvbnMuc2xvcHB5XG4gICAgICAgICAgOiBmYWxzZVxuXG4gICAgICBmdW5jdGlvbiBtYXNrKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFwnKVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYXNfa2V5cyhvYmplY3QpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBhcnNlX3Bnbl9oZWFkZXIoaGVhZGVyLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBuZXdsaW5lX2NoYXIgPVxuICAgICAgICAgIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgIHR5cGVvZiBvcHRpb25zLm5ld2xpbmVfY2hhciA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgID8gb3B0aW9ucy5uZXdsaW5lX2NoYXJcbiAgICAgICAgICAgIDogJ1xccj9cXG4nXG4gICAgICAgIHZhciBoZWFkZXJfb2JqID0ge31cbiAgICAgICAgdmFyIGhlYWRlcnMgPSBoZWFkZXIuc3BsaXQobmV3IFJlZ0V4cChtYXNrKG5ld2xpbmVfY2hhcikpKVxuICAgICAgICB2YXIga2V5ID0gJydcbiAgICAgICAgdmFyIHZhbHVlID0gJydcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBrZXkgPSBoZWFkZXJzW2ldLnJlcGxhY2UoL15cXFsoW0EtWl1bQS1aYS16XSopXFxzLipcXF0kLywgJyQxJylcbiAgICAgICAgICB2YWx1ZSA9IGhlYWRlcnNbaV0ucmVwbGFjZSgvXlxcW1tBLVphLXpdK1xcc1wiKC4qKVwiXFwgKlxcXSQvLCAnJDEnKVxuICAgICAgICAgIGlmICh0cmltKGtleSkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGVhZGVyX29ialtrZXldID0gdmFsdWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGVhZGVyX29ialxuICAgICAgfVxuXG4gICAgICB2YXIgbmV3bGluZV9jaGFyID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvcHRpb25zLm5ld2xpbmVfY2hhciA9PT0gJ3N0cmluZydcbiAgICAgICAgICA/IG9wdGlvbnMubmV3bGluZV9jaGFyXG4gICAgICAgICAgOiAnXFxyP1xcbidcblxuICAgICAgLy8gUmVnRXhwIHRvIHNwbGl0IGhlYWRlci4gVGFrZXMgYWR2YW50YWdlIG9mIHRoZSBmYWN0IHRoYXQgaGVhZGVyIGFuZCBtb3ZldGV4dFxuICAgICAgLy8gd2lsbCBhbHdheXMgaGF2ZSBhIGJsYW5rIGxpbmUgYmV0d2VlbiB0aGVtIChpZSwgdHdvIG5ld2xpbmVfY2hhcidzKS5cbiAgICAgIC8vIFdpdGggZGVmYXVsdCBuZXdsaW5lX2NoYXIsIHdpbGwgZXF1YWw6IC9eKFxcWygoPzpcXHI/XFxuKXwuKSpcXF0pKD86XFxyP1xcbil7Mn0vXG4gICAgICB2YXIgaGVhZGVyX3JlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgICAgJ14oXFxcXFsoKD86JyArXG4gICAgICAgICAgbWFzayhuZXdsaW5lX2NoYXIpICtcbiAgICAgICAgICAnKXwuKSpcXFxcXSknICtcbiAgICAgICAgICAnKD86JyArXG4gICAgICAgICAgbWFzayhuZXdsaW5lX2NoYXIpICtcbiAgICAgICAgICAnKXsyfSdcbiAgICAgIClcblxuICAgICAgLy8gSWYgbm8gaGVhZGVyIGdpdmVuLCBiZWdpbiB3aXRoIG1vdmVzLlxuICAgICAgdmFyIGhlYWRlcl9zdHJpbmcgPSBoZWFkZXJfcmVnZXgudGVzdChwZ24pXG4gICAgICAgID8gaGVhZGVyX3JlZ2V4LmV4ZWMocGduKVsxXVxuICAgICAgICA6ICcnXG5cbiAgICAgIC8vIFB1dCB0aGUgYm9hcmQgaW4gdGhlIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAgICByZXNldCgpXG5cbiAgICAgIC8qIHBhcnNlIFBHTiBoZWFkZXIgKi9cbiAgICAgIHZhciBoZWFkZXJzID0gcGFyc2VfcGduX2hlYWRlcihoZWFkZXJfc3RyaW5nLCBvcHRpb25zKVxuICAgICAgZm9yICh2YXIga2V5IGluIGhlYWRlcnMpIHtcbiAgICAgICAgc2V0X2hlYWRlcihba2V5LCBoZWFkZXJzW2tleV1dKVxuICAgICAgfVxuXG4gICAgICAvKiBsb2FkIHRoZSBzdGFydGluZyBwb3NpdGlvbiBpbmRpY2F0ZWQgYnkgW1NldHVwICcxJ10gYW5kXG4gICAgICAgKiBbRkVOIHBvc2l0aW9uXSAqL1xuICAgICAgaWYgKGhlYWRlcnNbJ1NldFVwJ10gPT09ICcxJykge1xuICAgICAgICBpZiAoISgnRkVOJyBpbiBoZWFkZXJzICYmIGxvYWQoaGVhZGVyc1snRkVOJ10sIHRydWUpKSkge1xuICAgICAgICAgIC8vIHNlY29uZCBhcmd1bWVudCB0byBsb2FkOiBkb24ndCBjbGVhciB0aGUgaGVhZGVyc1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qIE5COiB0aGUgcmVnZXhlcyBiZWxvdyB0aGF0IGRlbGV0ZSBtb3ZlIG51bWJlcnMsIHJlY3Vyc2l2ZVxuICAgICAgICogYW5ub3RhdGlvbnMsIGFuZCBudW1lcmljIGFubm90YXRpb24gZ2x5cGhzIG1heSBhbHNvIG1hdGNoXG4gICAgICAgKiB0ZXh0IGluIGNvbW1lbnRzLiBUbyBwcmV2ZW50IHRoaXMsIHdlIHRyYW5zZm9ybSBjb21tZW50c1xuICAgICAgICogYnkgaGV4LWVuY29kaW5nIHRoZW0gaW4gcGxhY2UgYW5kIGRlY29kaW5nIHRoZW0gYWdhaW4gYWZ0ZXJcbiAgICAgICAqIHRoZSBvdGhlciB0b2tlbnMgaGF2ZSBiZWVuIGRlbGV0ZWQuXG4gICAgICAgKlxuICAgICAgICogV2hpbGUgdGhlIHNwZWMgc3RhdGVzIHRoYXQgUEdOIGZpbGVzIHNob3VsZCBiZSBBU0NJSSBlbmNvZGVkLFxuICAgICAgICogd2UgdXNlIHtlbixkZX1jb2RlVVJJQ29tcG9uZW50IGhlcmUgdG8gc3VwcG9ydCBhcmJpdHJhcnkgVVRGOFxuICAgICAgICogYXMgYSBjb252ZW5pZW5jZSBmb3IgbW9kZXJuIHVzZXJzICovXG5cbiAgICAgIHZhciB0b19oZXggPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHN0cmluZylcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAvKiBlbmNvZGVVUkkgZG9lc24ndCB0cmFuc2Zvcm0gbW9zdCBBU0NJSSBjaGFyYWN0ZXJzLFxuICAgICAgICAgICAgICogc28gd2UgaGFuZGxlIHRoZXNlIG91cnNlbHZlcyAqL1xuICAgICAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSA8IDEyOFxuICAgICAgICAgICAgICA/IGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNilcbiAgICAgICAgICAgICAgOiBlbmNvZGVVUklDb21wb25lbnQoYykucmVwbGFjZSgvXFwlL2csICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuam9pbignJylcbiAgICAgIH1cblxuICAgICAgdmFyIGZyb21faGV4ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nLmxlbmd0aCA9PSAwXG4gICAgICAgICAgPyAnJ1xuICAgICAgICAgIDogZGVjb2RlVVJJQ29tcG9uZW50KCclJyArIHN0cmluZy5tYXRjaCgvLnsxLDJ9L2cpLmpvaW4oJyUnKSlcbiAgICAgIH1cblxuICAgICAgdmFyIGVuY29kZV9jb21tZW50ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShuZXcgUmVnRXhwKG1hc2sobmV3bGluZV9jaGFyKSwgJ2cnKSwgJyAnKVxuICAgICAgICByZXR1cm4gYHske3RvX2hleChzdHJpbmcuc2xpY2UoMSwgc3RyaW5nLmxlbmd0aCAtIDEpKX19YFxuICAgICAgfVxuXG4gICAgICB2YXIgZGVjb2RlX2NvbW1lbnQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGlmIChzdHJpbmcuc3RhcnRzV2l0aCgneycpICYmIHN0cmluZy5lbmRzV2l0aCgnfScpKSB7XG4gICAgICAgICAgcmV0dXJuIGZyb21faGV4KHN0cmluZy5zbGljZSgxLCBzdHJpbmcubGVuZ3RoIC0gMSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogZGVsZXRlIGhlYWRlciB0byBnZXQgdGhlIG1vdmVzICovXG4gICAgICB2YXIgbXMgPSBwZ25cbiAgICAgICAgLnJlcGxhY2UoaGVhZGVyX3N0cmluZywgJycpXG4gICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgIC8qIGVuY29kZSBjb21tZW50cyBzbyB0aGV5IGRvbid0IGdldCBkZWxldGVkIGJlbG93ICovXG4gICAgICAgICAgbmV3IFJlZ0V4cChgKFxce1tefV0qXFx9KSs/fDsoW14ke21hc2sobmV3bGluZV9jaGFyKX1dKilgLCAnZycpLFxuICAgICAgICAgIGZ1bmN0aW9uIChtYXRjaCwgYnJhY2tldCwgc2VtaWNvbG9uKSB7XG4gICAgICAgICAgICByZXR1cm4gYnJhY2tldCAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgID8gZW5jb2RlX2NvbW1lbnQoYnJhY2tldClcbiAgICAgICAgICAgICAgOiAnICcgKyBlbmNvZGVfY29tbWVudChgeyR7c2VtaWNvbG9uLnNsaWNlKDEpfX1gKVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKG1hc2sobmV3bGluZV9jaGFyKSwgJ2cnKSwgJyAnKVxuXG4gICAgICAvKiBkZWxldGUgcmVjdXJzaXZlIGFubm90YXRpb24gdmFyaWF0aW9ucyAqL1xuICAgICAgdmFyIHJhdl9yZWdleCA9IC8oXFwoW15cXChcXCldK1xcKSkrPy9nXG4gICAgICB3aGlsZSAocmF2X3JlZ2V4LnRlc3QobXMpKSB7XG4gICAgICAgIG1zID0gbXMucmVwbGFjZShyYXZfcmVnZXgsICcnKVxuICAgICAgfVxuXG4gICAgICAvKiBkZWxldGUgbW92ZSBudW1iZXJzICovXG4gICAgICBtcyA9IG1zLnJlcGxhY2UoL1xcZCtcXC4oXFwuXFwuKT8vZywgJycpXG5cbiAgICAgIC8qIGRlbGV0ZSAuLi4gaW5kaWNhdGluZyBibGFjayB0byBtb3ZlICovXG4gICAgICBtcyA9IG1zLnJlcGxhY2UoL1xcLlxcLlxcLi9nLCAnJylcblxuICAgICAgLyogZGVsZXRlIG51bWVyaWMgYW5ub3RhdGlvbiBnbHlwaHMgKi9cbiAgICAgIG1zID0gbXMucmVwbGFjZSgvXFwkXFxkKy9nLCAnJylcblxuICAgICAgLyogdHJpbSBhbmQgZ2V0IGFycmF5IG9mIG1vdmVzICovXG4gICAgICB2YXIgbW92ZXMgPSB0cmltKG1zKS5zcGxpdChuZXcgUmVnRXhwKC9cXHMrLykpXG5cbiAgICAgIC8qIGRlbGV0ZSBlbXB0eSBlbnRyaWVzICovXG4gICAgICBtb3ZlcyA9IG1vdmVzLmpvaW4oJywnKS5yZXBsYWNlKC8sLCsvZywgJywnKS5zcGxpdCgnLCcpXG4gICAgICB2YXIgbW92ZSA9ICcnXG5cbiAgICAgIHZhciByZXN1bHQgPSAnJ1xuXG4gICAgICBmb3IgKHZhciBoYWxmX21vdmUgPSAwOyBoYWxmX21vdmUgPCBtb3Zlcy5sZW5ndGg7IGhhbGZfbW92ZSsrKSB7XG4gICAgICAgIHZhciBjb21tZW50ID0gZGVjb2RlX2NvbW1lbnQobW92ZXNbaGFsZl9tb3ZlXSlcbiAgICAgICAgaWYgKGNvbW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXSA9IGNvbW1lbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgbW92ZSA9IG1vdmVfZnJvbV9zYW4obW92ZXNbaGFsZl9tb3ZlXSwgc2xvcHB5KVxuXG4gICAgICAgIC8qIGludmFsaWQgbW92ZSAqL1xuICAgICAgICBpZiAobW92ZSA9PSBudWxsKSB7XG4gICAgICAgICAgLyogd2FzIHRoZSBtb3ZlIGFuIGVuZCBvZiBnYW1lIG1hcmtlciAqL1xuICAgICAgICAgIGlmIChURVJNSU5BVElPTl9NQVJLRVJTLmluZGV4T2YobW92ZXNbaGFsZl9tb3ZlXSkgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbW92ZXNbaGFsZl9tb3ZlXVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLyogcmVzZXQgdGhlIGVuZCBvZiBnYW1lIG1hcmtlciBpZiBtYWtpbmcgYSB2YWxpZCBtb3ZlICovXG4gICAgICAgICAgcmVzdWx0ID0gJydcbiAgICAgICAgICBtYWtlX21vdmUobW92ZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKiBQZXIgc2VjdGlvbiA4LjIuNiBvZiB0aGUgUEdOIHNwZWMsIHRoZSBSZXN1bHQgdGFnIHBhaXIgbXVzdCBtYXRjaFxuICAgICAgICogbWF0Y2ggdGhlIHRlcm1pbmF0aW9uIG1hcmtlci4gT25seSBkbyB0aGlzIHdoZW4gaGVhZGVycyBhcmUgcHJlc2VudCxcbiAgICAgICAqIGJ1dCB0aGUgcmVzdWx0IHRhZyBpcyBtaXNzaW5nXG4gICAgICAgKi9cbiAgICAgIGlmIChyZXN1bHQgJiYgT2JqZWN0LmtleXMoaGVhZGVyKS5sZW5ndGggJiYgIWhlYWRlclsnUmVzdWx0J10pIHtcbiAgICAgICAgc2V0X2hlYWRlcihbJ1Jlc3VsdCcsIHJlc3VsdF0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcblxuICAgIGhlYWRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNldF9oZWFkZXIoYXJndW1lbnRzKVxuICAgIH0sXG5cbiAgICB0dXJuOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdHVyblxuICAgIH0sXG5cbiAgICBtb3ZlOiBmdW5jdGlvbiAobW92ZSwgb3B0aW9ucykge1xuICAgICAgLyogVGhlIG1vdmUgZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCB3aXRoIGluIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczpcbiAgICAgICAqXG4gICAgICAgKiAubW92ZSgnTnhiNycpICAgICAgPC0gd2hlcmUgJ21vdmUnIGlzIGEgY2FzZS1zZW5zaXRpdmUgU0FOIHN0cmluZ1xuICAgICAgICpcbiAgICAgICAqIC5tb3ZlKHsgZnJvbTogJ2g3JywgPC0gd2hlcmUgdGhlICdtb3ZlJyBpcyBhIG1vdmUgb2JqZWN0IChhZGRpdGlvbmFsXG4gICAgICAgKiAgICAgICAgIHRvIDonaDgnLCAgICAgIGZpZWxkcyBhcmUgaWdub3JlZClcbiAgICAgICAqICAgICAgICAgcHJvbW90aW9uOiAncScsXG4gICAgICAgKiAgICAgIH0pXG4gICAgICAgKi9cblxuICAgICAgLy8gYWxsb3cgdGhlIHVzZXIgdG8gc3BlY2lmeSB0aGUgc2xvcHB5IG1vdmUgcGFyc2VyIHRvIHdvcmsgYXJvdW5kIG92ZXJcbiAgICAgIC8vIGRpc2FtYmlndWF0aW9uIGJ1Z3MgaW4gRnJpdHogYW5kIENoZXNzYmFzZVxuICAgICAgdmFyIHNsb3BweSA9XG4gICAgICAgIHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJyAmJiAnc2xvcHB5JyBpbiBvcHRpb25zXG4gICAgICAgICAgPyBvcHRpb25zLnNsb3BweVxuICAgICAgICAgIDogZmFsc2VcblxuICAgICAgdmFyIG1vdmVfb2JqID0gbnVsbFxuXG4gICAgICBpZiAodHlwZW9mIG1vdmUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG1vdmVfb2JqID0gbW92ZV9mcm9tX3Nhbihtb3ZlLCBzbG9wcHkpXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb3ZlID09PSAnb2JqZWN0Jykge1xuICAgICAgICB2YXIgbW92ZXMgPSBnZW5lcmF0ZV9tb3ZlcygpXG5cbiAgICAgICAgLyogY29udmVydCB0aGUgcHJldHR5IG1vdmUgb2JqZWN0IHRvIGFuIHVnbHkgbW92ZSBvYmplY3QgKi9cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1vdmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgbW92ZS5mcm9tID09PSBhbGdlYnJhaWMobW92ZXNbaV0uZnJvbSkgJiZcbiAgICAgICAgICAgIG1vdmUudG8gPT09IGFsZ2VicmFpYyhtb3Zlc1tpXS50bykgJiZcbiAgICAgICAgICAgICghKCdwcm9tb3Rpb24nIGluIG1vdmVzW2ldKSB8fFxuICAgICAgICAgICAgICBtb3ZlLnByb21vdGlvbiA9PT0gbW92ZXNbaV0ucHJvbW90aW9uKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgbW92ZV9vYmogPSBtb3Zlc1tpXVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogZmFpbGVkIHRvIGZpbmQgbW92ZSAqL1xuICAgICAgaWYgKCFtb3ZlX29iaikge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuXG4gICAgICAvKiBuZWVkIHRvIG1ha2UgYSBjb3B5IG9mIG1vdmUgYmVjYXVzZSB3ZSBjYW4ndCBnZW5lcmF0ZSBTQU4gYWZ0ZXIgdGhlXG4gICAgICAgKiBtb3ZlIGlzIG1hZGVcbiAgICAgICAqL1xuICAgICAgdmFyIHByZXR0eV9tb3ZlID0gbWFrZV9wcmV0dHkobW92ZV9vYmopXG5cbiAgICAgIG1ha2VfbW92ZShtb3ZlX29iailcblxuICAgICAgcmV0dXJuIHByZXR0eV9tb3ZlXG4gICAgfSxcblxuICAgIHVuZG86IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtb3ZlID0gdW5kb19tb3ZlKClcbiAgICAgIHJldHVybiBtb3ZlID8gbWFrZV9wcmV0dHkobW92ZSkgOiBudWxsXG4gICAgfSxcblxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gY2xlYXIoKVxuICAgIH0sXG5cbiAgICBwdXQ6IGZ1bmN0aW9uIChwaWVjZSwgc3F1YXJlKSB7XG4gICAgICByZXR1cm4gcHV0KHBpZWNlLCBzcXVhcmUpXG4gICAgfSxcblxuICAgIGdldDogZnVuY3Rpb24gKHNxdWFyZSkge1xuICAgICAgcmV0dXJuIGdldChzcXVhcmUpXG4gICAgfSxcblxuICAgIGFzY2lpKCkge1xuICAgICAgdmFyIHMgPSAnICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcXG4nXG4gICAgICBmb3IgKHZhciBpID0gU1FVQVJFX01BUC5hODsgaSA8PSBTUVVBUkVfTUFQLmgxOyBpKyspIHtcbiAgICAgICAgLyogZGlzcGxheSB0aGUgcmFuayAqL1xuICAgICAgICBpZiAoZmlsZShpKSA9PT0gMCkge1xuICAgICAgICAgIHMgKz0gJyAnICsgJzg3NjU0MzIxJ1tyYW5rKGkpXSArICcgfCdcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIGVtcHR5IHBpZWNlICovXG4gICAgICAgIGlmIChib2FyZFtpXSA9PSBudWxsKSB7XG4gICAgICAgICAgcyArPSAnIC4gJ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldLnR5cGVcbiAgICAgICAgICB2YXIgY29sb3IgPSBib2FyZFtpXS5jb2xvclxuICAgICAgICAgIHZhciBzeW1ib2wgPVxuICAgICAgICAgICAgY29sb3IgPT09IFdISVRFID8gcGllY2UudG9VcHBlckNhc2UoKSA6IHBpZWNlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBzICs9ICcgJyArIHN5bWJvbCArICcgJ1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChpICsgMSkgJiAweDg4KSB7XG4gICAgICAgICAgcyArPSAnfFxcbidcbiAgICAgICAgICBpICs9IDhcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcyArPSAnICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcXG4nXG4gICAgICBzICs9ICcgICAgIGEgIGIgIGMgIGQgIGUgIGYgIGcgIGgnXG5cbiAgICAgIHJldHVybiBzXG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKHNxdWFyZSkge1xuICAgICAgcmV0dXJuIHJlbW92ZShzcXVhcmUpXG4gICAgfSxcblxuICAgIHBlcmZ0OiBmdW5jdGlvbiAoZGVwdGgpIHtcbiAgICAgIHJldHVybiBwZXJmdChkZXB0aClcbiAgICB9LFxuXG4gICAgc3F1YXJlX2NvbG9yOiBmdW5jdGlvbiAoc3F1YXJlKSB7XG4gICAgICBpZiAoc3F1YXJlIGluIFNRVUFSRV9NQVApIHtcbiAgICAgICAgdmFyIHNxXzB4ODggPSBTUVVBUkVfTUFQW3NxdWFyZV1cbiAgICAgICAgcmV0dXJuIChyYW5rKHNxXzB4ODgpICsgZmlsZShzcV8weDg4KSkgJSAyID09PSAwID8gJ2xpZ2h0JyA6ICdkYXJrJ1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG5cbiAgICBoaXN0b3J5OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgdmFyIHJldmVyc2VkX2hpc3RvcnkgPSBbXVxuICAgICAgdmFyIG1vdmVfaGlzdG9yeSA9IFtdXG4gICAgICB2YXIgdmVyYm9zZSA9XG4gICAgICAgIHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAndmVyYm9zZScgaW4gb3B0aW9ucyAmJlxuICAgICAgICBvcHRpb25zLnZlcmJvc2VcblxuICAgICAgd2hpbGUgKGhpc3RvcnkubGVuZ3RoID4gMCkge1xuICAgICAgICByZXZlcnNlZF9oaXN0b3J5LnB1c2godW5kb19tb3ZlKCkpXG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChyZXZlcnNlZF9oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIG1vdmUgPSByZXZlcnNlZF9oaXN0b3J5LnBvcCgpXG4gICAgICAgIGlmICh2ZXJib3NlKSB7XG4gICAgICAgICAgbW92ZV9oaXN0b3J5LnB1c2gobWFrZV9wcmV0dHkobW92ZSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW92ZV9oaXN0b3J5LnB1c2gobW92ZV90b19zYW4obW92ZSwgZ2VuZXJhdGVfbW92ZXMoeyBsZWdhbDogdHJ1ZSB9KSkpXG4gICAgICAgIH1cbiAgICAgICAgbWFrZV9tb3ZlKG1vdmUpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb3ZlX2hpc3RvcnlcbiAgICB9LFxuXG4gICAgZ2V0X2NvbW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjb21tZW50c1tnZW5lcmF0ZV9mZW4oKV1cbiAgICB9LFxuXG4gICAgc2V0X2NvbW1lbnQ6IGZ1bmN0aW9uIChjb21tZW50KSB7XG4gICAgICBjb21tZW50c1tnZW5lcmF0ZV9mZW4oKV0gPSBjb21tZW50LnJlcGxhY2UoJ3snLCAnWycpLnJlcGxhY2UoJ30nLCAnXScpXG4gICAgfSxcblxuICAgIGRlbGV0ZV9jb21tZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29tbWVudCA9IGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXVxuICAgICAgZGVsZXRlIGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXVxuICAgICAgcmV0dXJuIGNvbW1lbnRcbiAgICB9LFxuXG4gICAgZ2V0X2NvbW1lbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBwcnVuZV9jb21tZW50cygpXG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoY29tbWVudHMpLm1hcChmdW5jdGlvbiAoZmVuKSB7XG4gICAgICAgIHJldHVybiB7IGZlbjogZmVuLCBjb21tZW50OiBjb21tZW50c1tmZW5dIH1cbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGRlbGV0ZV9jb21tZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgcHJ1bmVfY29tbWVudHMoKVxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbW1lbnRzKS5tYXAoZnVuY3Rpb24gKGZlbikge1xuICAgICAgICB2YXIgY29tbWVudCA9IGNvbW1lbnRzW2Zlbl1cbiAgICAgICAgZGVsZXRlIGNvbW1lbnRzW2Zlbl1cbiAgICAgICAgcmV0dXJuIHsgZmVuOiBmZW4sIGNvbW1lbnQ6IGNvbW1lbnQgfVxuICAgICAgfSlcbiAgICB9LFxuICB9XG59IiwiaW1wb3J0IHtcbiAgY3N2LFxuICBzZWxlY3QsXG4gIHNlbGVjdEFsbCxcbiAgc2NhbGVMaW5lYXIsXG4gIHNjYWxlT3JkaW5hbCxcbiAganNvbixcbn0gZnJvbSAnZDMnO1xuaW1wb3J0IHsgQ2hlc3MgfSBmcm9tICcuL2NoZXNzLmpzJ1xuXG4vLyBMb2FkIHRoZSBDU1YgZmlsZVxuXG5jb25zdCBjaGVzczEgPSBuZXcgQ2hlc3MoKVxuLy9jaGVzczEubG9hZF9wZ24oXCIxLiBkNCBkNSAyLiBjNCBlNSAzLiBkeGU1IGQ0IDQuIGUzIEJiNCsgNS4gQmQyIGR4ZTMgNi4gQnhiNCBleGYyKyA3LiBLZTIgZnhnMT1OKyA4LiBSaHhnMVwiKVxuLy8xLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJjNCBOZDQgNC4gTnhlNSBRZzUgNS4gTnhmNyBReGcyIDYuIFJoZjFcbi8vcjFicWsxbnIvcHBwcDFwcHAvMm41LzJiMXAzLzJCMVAzLzVOMi9QUFBQMVBQUC9STkJRSzJSIHcgS1FrcSAtIDQgNFxuLy9yMWJxazFuci9wcHBwMXBwcC8ybjUvMmIxcDMvMkIxUDMvNU4yL1BQUFAxUFBQL1JOQlFLMlJcbi8vZTQtZTUtTmYzLU5jNi1CYzQtTmQ0LU54ZTUtUWc1LU54ZjctUXhnMi1SaGYxXG5jaGVzczEubW92ZShcImU0XCIpXG5jaGVzczEubW92ZShcImU1XCIpXG5jaGVzczEubW92ZShcIk5mM1wiKVxuY2hlc3MxLm1vdmUoXCJOYzZcIilcbmNoZXNzMS5tb3ZlKFwiQmM0XCIpXG5jaGVzczEubW92ZShcIk5kNFwiKVxuY2hlc3MxLm1vdmUoXCJOeGU1XCIpXG5jaGVzczEubW92ZShcIlFnNVwiKVxuY2hlc3MxLm1vdmUoXCJOeGY3XCIpXG5jaGVzczEubW92ZShcIlF4ZzJcIilcbmNvbnNvbGUubG9nKGNoZXNzMS5mZW4oKSlcbmNoZXNzMS5tb3ZlKFwiUmhmMVwiKVxuY29uc29sZS5sb2coY2hlc3MxLmZlbigpKVxudmFyIHJ1eUxvcGV6ID1cbiAgJ3IxYnFrYm5yL3BwcHAxcHBwLzJuNS8xQjJwMy80UDMvNU4yL1BQUFAxUFBQL1JOQlFLMlInO1xudmFyIGJvYXJkID0gQ2hlc3Nib2FyZCgnbXlCb2FyZCcsIFwic3RhcnRcIik7XG5cbi8vY2hlc3Nib2FyZCBhbmQgZ3JhcGhpYyBkaW1lbnNpb25zXG5jb25zdCBjaGVzc2JvYXJkd2lkdGggPSAyNTBcbmNvbnN0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggLTUgLSBjaGVzc2JvYXJkd2lkdGg7XG5jb25zb2xlLmxvZyh3aW5kb3cuaW5uZXJXaWR0aCk7XG5jb25zb2xlLmxvZyh3aW5kb3cuaW5uZXJIZWlnaHQpO1xuY29uc3QgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gNTtcbmNvbnN0IGJyZWFkY3J1bWJXaWR0aCA9IDc1O1xuY29uc3QgYnJlYWRjcnVtYkhlaWdodCA9IDMwO1xuY29uc3QgcmFkaXVzID0gd2lkdGggLyAyO1xuY29uc3QgY2VudGVyWCA9IHdpZHRoIC8gMTYgKyBjaGVzc2JvYXJkd2lkdGg7IC8vIFgtY29vcmRpbmF0ZSBvZiB0aGUgZGVzaXJlZCBjZW50ZXIgcG9zaXRpb25cbmNvbnN0IGNlbnRlclkgPSBoZWlnaHQvMzA7XG4vLyBlMyBlNCBkNCBnMyBiNFxuXG4vLyBjb25zdCBzdmcgPSBzZWxlY3QoJ2JvZHknKVxuLy8gICAuYXBwZW5kKCdzdmcnKVxuLy8gICAuYXR0cignd2lkdGgnLCB3aWR0aClcbi8vICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbi8vIC5hdHRyKCdjbGFzcycsJ3N1bmJ1cnN0LWNoZXNzJylcbi8vIFx0LmF0dHIoXG4vLyAgICAgJ3RyYW5zZm9ybScsXG4vLyAgICAgYHRyYW5zbGF0ZSgke2NlbnRlclh9LCAkey0yMCpjZW50ZXJZfSlgXG4vLyAgIClcbi8vIFx0LmF0dHIoXG4vLyAgICAgJ3ZpZXdCb3gnLFxuLy8gICAgIGAkey1yYWRpdXN9ICR7LXJhZGl1c30gJHt3aWR0aH0gJHt3aWR0aH1gXG4vLyAgICk7IC8vIEFwcGx5IHRyYW5zbGF0aW9uIHRvIGNlbnRlciB0aGUgU1ZHIGVsZW1lbnRcblxuY29uc3QgYXJjID0gZDNcbiAgLmFyYygpXG4gIC5zdGFydEFuZ2xlKChkKSA9PiBkLngwKVxuICAuZW5kQW5nbGUoKGQpID0+IGQueDEpXG4gIC5wYWRBbmdsZSgxIC8gcmFkaXVzKVxuICAucGFkUmFkaXVzKHJhZGl1cylcbiAgLmlubmVyUmFkaXVzKChkKSA9PiBNYXRoLnNxcnQoZC55MCkpXG4gIC5vdXRlclJhZGl1cygoZCkgPT4gTWF0aC5zcXJ0KGQueTEpIC0gMSk7XG5jb25zdCBtb3VzZWFyYyA9IGQzXG4gIC5hcmMoKVxuICAuc3RhcnRBbmdsZSgoZCkgPT4gZC54MClcbiAgLmVuZEFuZ2xlKChkKSA9PiBkLngxKVxuICAuaW5uZXJSYWRpdXMoKGQpID0+IE1hdGguc3FydChkLnkwKSlcbiAgLm91dGVyUmFkaXVzKHJhZGl1cyk7XG5cbi8vIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4vLyAgIC5hdHRyKFwiZFwiLCBhcmNHZW5lcmF0b3IpXG4vLyAgIC5hdHRyKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xuLy8gc3ZnLmFwcGVuZChcInBhdGhcIilcbi8vICAgLmF0dHIoXCJkXCIsIGFyY0dlbmVyYXRvcjEpXG4vLyAgIC5hdHRyKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xuXG4vLyAvLyBHZXQgdGhlIERPTSBub2RlIG9mIHRoZSBTVkcgZWxlbWVudFxuLy8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdmcubm9kZSgpKTtcbi8vIGNvbnN0IGVsZW1lbnQgPSBzdmcubm9kZSgpO1xuLy8gZWxlbWVudC52YWx1ZSA9IHsgc2VxdWVuY2U6IFtdLCBwZXJjZW50YWdlOiAwLjAgfTtcbi8vY29uc29sZS5sb2coZWxlbWVudCk7XG5cbi8vIHBvc3NpYmxlIGNvbG9yc1xuY29uc3QgY29sb3IgPSBzY2FsZU9yZGluYWwoKVxuICAuZG9tYWluKFsnZTMtMCcsICdlMy0xJywnZTQtMCcsJ2U0LTEnLCAnZDQtMCcsJ2Q0LTEnLCAnZzMtMCcsICdnMy0xJywnYjQtMCcsJ2I0LTEnLCdmMy0wJywnZjMtMScsJ2QzLTAnLCdkMy0xJ10pXG4gIC5yYW5nZShbXG4gICAgJyNmZmMwY2InLFxuICAgICcjODAwMDAwJyxcbiAgICAnIzkwRUU5MCcsXG4gICAgJyMwMDgwMDAnLFxuICAgICcjYWRkOGU2JyxcbiAgICAnIzAwMDA4MCcsXG4gICAgJyNmZjAwZmYnLFxuICAgICcjODAwMDgwJyxcbiAgICAnI2ZmZmYwMCcsXG4gICAgJyM4MDgwMDAnLFxuXHRcdCcjZDNkM2QzJyxcbiAgICAnIzgwODA4MCcsXG4gICAgJyNmZmE1MDAnLFxuICAgICcjZmY4YzAwJyxcbiAgXSk7XG5cbmNvbnN0IHBhcnRpdGlvbiA9IChkYXRhKSA9PlxuICBkM1xuICAgIC5wYXJ0aXRpb24oKVxuICAgIC5zaXplKFsyICogTWF0aC5QSSwgcmFkaXVzICogcmFkaXVzXSkoXG4gICAgZDNcbiAgICAgIC5oaWVyYXJjaHkoZGF0YSlcbiAgICAgIC5zdW0oKGQpID0+IGQudmFsdWUpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi52YWx1ZSAtIGEudmFsdWUpXG4gICk7XG5cbi8vIGNvbnN0IGxhYmVsID0gc3ZnXG4vLyAgIC5hcHBlbmQoJ3RleHQnKVxuLy8gICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbi8vICAgLmF0dHIoJ2ZpbGwnLCAnYmx1ZScpXG4vLyAgIC5zdHlsZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcblxuLy8gbGFiZWxcbi8vICAgLmFwcGVuZCgndHNwYW4nKVxuLy8gICAuYXR0cignY2xhc3MnLCAncGVyY2VudGFnZScpXG4vLyAgIC5hdHRyKCd4JywgMClcbi8vICAgLmF0dHIoJ3knLCAwKVxuLy8gICAuYXR0cignZHknLCAnLTAuMWVtJylcbi8vICAgLmF0dHIoJ2ZvbnQtc2l6ZScsICczZW0nKVxuLy8gICAudGV4dCgnJyk7XG5cbi8vIGxhYmVsXG4vLyAgIC5hcHBlbmQoJ3RzcGFuJylcbi8vICAgLmF0dHIoJ3gnLCAwKVxuLy8gICAuYXR0cigneScsIDApXG4vLyAgIC5hdHRyKCdkeScsICcyLjVlbScpXG4vLyAgIC50ZXh0KCdvZiBjaGVzcyBwbGF5ZXJzIHBsYXlpbmcgaW4gdGhpcyB3YXknKTtcblxuLy8gYWRkaW5nIHNsaWRlclxuICBsZXQgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgJ2RhdGVTbGlkZXIxJ1xuICApO1xubGV0IHNsaWRlclZhbHVlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzbGlkZXJWYWx1ZVwiKTtcblxubGV0IGZpbGVuYW1lID0gJzIwMTUtMTIuY3N2J1xuXG5nZW5lcmF0ZVN1bmJ1cnN0KGZpbGVuYW1lKVxuLy9zZWxlY3RBbGwoJy5zdW5idXJzdC1jaGVzcycpLnJlbW92ZSgpXG4vL2NvbnN0IHRhcmdldEZpbGVzID0gWycyMDE0LTAxLmNzdicsJzIwMTQtMDEtMi5jc3YnLCcyMDE0LTAxLTMuY3N2J11cbmNvbnN0IHRhcmdldEZpbGVzID0gWycyMDE1LTEyLTEuY3N2JywgJzIwMTUtMTItMi5jc3YnLCAnMjAxNS0xMi0zLmNzdiddXG4gIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KHRoaXMudmFsdWUpO1xuICAgIGxldCB0ZXh0ID0gXCJcIjtcbiAgc3dpdGNoIChpbmRleCkge1xuICAgIGNhc2UgMDpcbi8vICAgICAgdGV4dCA9IFwiUG9wdWxhciBHYW1lc1wiO1xuICAgICAgXHR0ZXh0ID0gXCJUb3AgNTAwXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE6XG4vLyAgICAgIHRleHQgPSBcIk1lZGl1bSBmcmVxdWVuY3lcIjtcbiAgICAgIFx0dGV4dCA9IFwiNTAwLTEwMDAgXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4vLyAgICAgIHRleHQgPSBcIk5pY2hlIEdhbWVzXCI7XG4gICAgICBcdHRleHQgPSBcIjEwMDAtMTUwMCBcIjtcbiAgICAgIGJyZWFrO1xuLy8gICAgY2FzZSAzOlxuLy8gICAgICBcdHRleHQgPSBcIjE1MS0yMDBcIjtcbi8vICAgICAgYnJlYWs7XG4vLyAgICBjYXNlIDQ6XG4vLyAgICAgIFx0dGV4dCA9IFwiMjAxLTI1MFwiO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0ZXh0ID0gXCJcIjtcbiAgfVxuICAgIGNvbnNvbGUubG9nKHRleHQpXG4gICAgc2xpZGVyVmFsdWUudGV4dENvbnRlbnQgPSB0ZXh0O1xuc2VsZWN0QWxsKCcuc3VuYnVyc3QtcGF0aCcpLnJlbW92ZSgpXG4gICAgc2VsZWN0QWxsKCcuc3VuYnVyc3QtcGF0aC1tb3VzZScpLnJlbW92ZSgpXG4gICAgY29uc3QgbmV3TmFtZSA9IHRhcmdldEZpbGVzW2luZGV4XTtcbiAgICBmaWxlbmFtZSA9IG5ld05hbWU7XG5cbiAgICBjb25zb2xlLmxvZyhmaWxlbmFtZSk7XG4gICAgZ2VuZXJhdGVTdW5idXJzdChmaWxlbmFtZSlcblx0XHQvLyBkYXRlIHRvIGh1bWFuIHJlYWRhYmxlIHF1YXJ0ZXJcbiAgICAvLyBpZiAoXG4gICAgLy8gICB0YXJnZXREYXRlLmdldFRpbWUoKSA9PT1cbiAgICAvLyAgIHRhcmdldERhdGVzWzBdLmdldFRpbWUoKVxuICAgIC8vICkge1xuICAgIC8vICAgc2Vhc29uID0gJ09jdC1EZWMsIDIwMTYnO1xuICAgIC8vIH1cbiAgfSk7XG5cbi8vIGdlbmVyYXRlU3VuYnVyc3QoZmlsZW5hbWUpXG5mdW5jdGlvbiBnZW5lcmF0ZVN1bmJ1cnN0KGZpbGVuYW1lKXtcbmNzdihmaWxlbmFtZSlcbiAgLnRoZW4oKHBhcnNlZERhdGEpID0+IHtcbiAgICAvL2NvbnNvbGUubG9nKHBhcnNlZERhdGEpO1xuICAgIC8vY29uc29sZS5sb2cocGFyc2VkRGF0YVsxXS5wZ24pXG4gICAgcmV0dXJuIGJ1aWxkSGllcmFyY2h5KHBhcnNlZERhdGEpO1xuICB9KVxuICAudGhlbigoZGF0YSkgPT4ge1xuICAgIC8vY29uc29sZS5sb2coZGF0YSlcbiAgICBjb25zdCByb290ID0gcGFydGl0aW9uKGRhdGEpO1xuLy8gICBjb25zdCBzdmcgPSBzZWxlY3QoJ2JvZHknKVxuLy8gICAuYXBwZW5kKCdzdmcnKVxuLy8gICAuYXR0cignd2lkdGgnLCB3aWR0aClcbi8vICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbi8vIC8vLmF0dHIoJ2NsYXNzJywnc3VuYnVyc3QtY2hlc3MnKVxuLy8gXHQuYXR0cihcbi8vICAgICAndHJhbnNmb3JtJyxcbi8vICAgICBgdHJhbnNsYXRlKCR7Y2VudGVyWH0sICR7LTIyKmNlbnRlcll9KWBcbi8vICAgKVxuLy8gXHQuYXR0cihcbi8vICAgICAndmlld0JveCcsXG4vLyAgICAgYCR7LXJhZGl1c30gJHstcmFkaXVzfSAke3dpZHRofSAke3dpZHRofWBcbi8vICAgKTtcbiAgLy9jb25zdCBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1bmJ1cnN0XCIpO1xuICBjb25zdCBzdmcgPSBzZWxlY3QoXCIjc3VuYnVyc3RcIik7XG4gICAgY29uc29sZS5sb2coc3ZnKVxuICBjb25zdCBlbGVtZW50ID0gc3ZnLm5vZGUoKTtcbmVsZW1lbnQudmFsdWUgPSB7IHNlcXVlbmNlOiBbXSwgcGVyY2VudGFnZTogMC4wIH07XG4gIGNvbnN0IGxhYmVsID0gc3ZnXG4gIC5hcHBlbmQoJ3RleHQnKVxuICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgLmF0dHIoJ2ZpbGwnLCAnYmx1ZScpXG4gIC5zdHlsZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcblxubGFiZWxcbiAgLmFwcGVuZCgndHNwYW4nKVxuICAuYXR0cignY2xhc3MnLCAncGVyY2VudGFnZScpXG4gIC5hdHRyKCd4JywgMClcbiAgLmF0dHIoJ3knLCAwKVxuICAuYXR0cignZHknLCAnLTAuMWVtJylcbiAgLmF0dHIoJ2ZvbnQtc2l6ZScsICcyZW0nKVxuICAudGV4dCgnJyk7XG5cbmxhYmVsXG4gIC5hcHBlbmQoJ3RzcGFuJylcbiAgLmF0dHIoJ3gnLCAwKVxuICAuYXR0cigneScsIDApXG4gIC5hdHRyKCdkeScsICcyZW0nKVxuICAudGV4dCgnR2FtZXMnKTtcbiAgICBjb25zdCBwYXRoID0gc3ZnXG4gICAgICAuYXBwZW5kKCdnJylcbiAgICAgIC5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgICAgLmRhdGEoXG4gICAgICAgIHJvb3QuZGVzY2VuZGFudHMoKS5maWx0ZXIoKGQpID0+IHtcbiAgICAgICAgICAvLyBEb24ndCBkcmF3IHRoZSByb290IG5vZGUsIGFuZCBmb3IgZWZmaWNpZW5jeSwgZmlsdGVyIG91dCBub2RlcyB0aGF0IHdvdWxkIGJlIHRvbyBzbWFsbCB0byBzZWVcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgZC5kZXB0aCAmJiBkLngxIC0gZC54MCA+IDAuMDAwMDAxXG4gICAgICAgICAgKTtcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC5qb2luKCdwYXRoJylcbiAgICBcbiAgICAgIHBhdGguYXR0cignZmlsbCcsIChkYXRhKSA9PiB7XG4gICAgICAgIGxldCBoID0gZGF0YS5kZXB0aCAtIDE7XG4gICAgICAgIGNvbnNvbGUubG9nKGgpXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaDsgaSsrKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhpKTtcbiAgICAgICAgICBkYXRhID0gZGF0YS5wYXJlbnQ7XG4gICAgICAgIH1cbi8vIGNvbG9yIHRoZSBibGFjayBwbGF5ZXIgZGFya2VyXG4gICAgICAgIGlmKGglMiA9PT0wKXtcbiAgICAgICAgICAgICAgIHJldHVybiBjb2xvcihkYXRhLmRhdGEubmFtZSsnLTAnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiBjb2xvcihkYXRhLmRhdGEubmFtZSsnLTEnKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgIC8vIGNvbnNvbGUubG9nKGRhdGEuZGF0YS5uYW1lKTtcbiAgICAgICAgXG4gICAgICB9KVxuICAgICAgLy8uYXR0cignZmlsbCcsJ2dvbGQnKVxuICAgICAgLmF0dHIoJ2QnLCBhcmMpXG4gIC5hdHRyKCdjbGFzcycsJ3N1bmJ1cnN0LXBhdGgnKTtcblxuICAgIHN2Z1xuICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAuYXR0cignZmlsbCcsICdub25lJylcbiAgICAgIC5hdHRyKCdwb2ludGVyLWV2ZW50cycsICdhbGwnKVxuICAgICAgLm9uKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICBwYXRoLmF0dHIoJ2ZpbGwtb3BhY2l0eScsIDEpO1xuICAgICAgICBsYWJlbC5zdHlsZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGlzIHZpZXdcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IHtcbiAgICAgICAgICBzZXF1ZW5jZTogW10sXG4gICAgICAgICAgcGVyY2VudGFnZTogMC4wLFxuICAgICAgICB9O1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KCdpbnB1dCcpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnNlbGVjdEFsbCgncGF0aCcpXG4gICAgICAuZGF0YShcbiAgICAgICAgcm9vdC5kZXNjZW5kYW50cygpLmZpbHRlcigoZCkgPT4ge1xuICAgICAgICAgIC8vIERvbid0IGRyYXcgdGhlIHJvb3Qgbm9kZSwgYW5kIGZvciBlZmZpY2llbmN5LCBmaWx0ZXIgb3V0IG5vZGVzIHRoYXQgd291bGQgYmUgdG9vIHNtYWxsIHRvIHNlZVxuICAgICAgICAgIHJldHVybiBkLmRlcHRoICYmIGQueDEgLSBkLngwID4gMC4wMDE7XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICAuam9pbigncGF0aCcpXG4gICAgICAuYXR0cignZCcsIG1vdXNlYXJjKVxuICAgIC5hdHRyKCdjbGFzcycsJ3N1bmJ1cnN0LXBhdGgtbW91c2UnKVxuICAgICAgLm9uKCdtb3VzZWVudGVyJywgKGV2ZW50LCBkKSA9PiB7XG4gICAgICAgIC8vIEdldCB0aGUgYW5jZXN0b3JzIG9mIHRoZSBjdXJyZW50IHNlZ21lbnQsIG1pbnVzIHRoZSByb290XG4gICAgICAgIHNlbGVjdEFsbCgnLnN0ZXBzJykucmVtb3ZlKCk7XG4gICAgICAgIGNvbnN0IHNlcXVlbmNlID0gZFxuICAgICAgICAgIC5hbmNlc3RvcnMoKVxuICAgICAgICAgIC5yZXZlcnNlKClcbiAgICAgICAgICAuc2xpY2UoMSk7XG4gICAgICAgIC8vIEhpZ2hsaWdodCB0aGUgYW5jZXN0b3JzXG4gICAgICAgIHBhdGguYXR0cignZmlsbC1vcGFjaXR5JywgKG5vZGUpID0+XG4gICAgICAgICAgc2VxdWVuY2UuaW5kZXhPZihub2RlKSA+PSAwID8gMS4wIDogMC4zXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSAoXG4gICAgICAgICAgKDEwMCAqIGQudmFsdWUpIC9cbiAgICAgICAgICByb290LnZhbHVlXG4gICAgICAgICkudG9QcmVjaXNpb24oMyk7XG4gICAgICAgIGxhYmVsXG4gICAgICAgICAgLnN0eWxlKCd2aXNpYmlsaXR5JywgbnVsbClcbiAgICAgICAgICAuc2VsZWN0KCcucGVyY2VudGFnZScpXG4gICAgICAgICAgLnRleHQocGVyY2VudGFnZSArICclJyk7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdmFsdWUgb2YgdGhpcyB2aWV3IHdpdGggdGhlIGN1cnJlbnRseSBob3ZlcmVkIHNlcXVlbmNlIGFuZCBwZXJjZW50YWdlXG4gICAgICAgIGVsZW1lbnQudmFsdWUgPSB7IHNlcXVlbmNlLCBwZXJjZW50YWdlIH07XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoJ2lucHV0JylcbiAgICAgICAgKTtcbiAgICAgIC8vJzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmM0IEJjNSdcbiAgICAgICAgbGV0IHN0ciA9IFwiXCI7XG4gICAgICAgIC8vY29uc29sZS5sb2coIGVsZW1lbnQudmFsdWUuc2VxdWVuY2UpXG4gICAgICAgIGZvciAobGV0IGkgPSAwO2kgPCBlbGVtZW50LnZhbHVlLnNlcXVlbmNlLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICBpZihpJTI9PT0wKXtcbiAgICAgICAgICAgIHZhciBudW0gPSBpLzIgKzE7XG4gICAgICAgICAgICBzdHIgPSBzdHIrbnVtLnRvU3RyaW5nKCkrXCIuIFwiXG4gICAgICAgICAgfVxuICAgICAgICAgIHN0ciA9c3RyICtlbGVtZW50LnZhbHVlLnNlcXVlbmNlW2ldLmRhdGEubmFtZStcIiBcIjtcbiAgICAgICAgfVxuICAgICAvLzEuIGU0IGU1IDIuIFFoNSBkNiAzLiBCYzQgTmY2IDQuIFF4ZjcjIFxuICAgICAgICBjb25zb2xlLmxvZyhzdHIpO1xuICAgICAgaWYoc3RyLmluY2x1ZGVzKCdSaCcpKXtcbiAgICAgICAgICAgICAgZDMuY3N2KFwiMi5jc3ZcIikudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gIC8vIENvbnZlcnQgdGhlIGRhdGEgaW50byBhIEphdmFTY3JpcHQgb2JqZWN0IG9yIG1hcFxuICB2YXIgY3N2RGF0YSA9IHt9O1xuICBkYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIGNzdkRhdGFbZC5wZ25dID0gZC5mZW47XG4gIH0pO1xuXG4gIC8vIFNlYXJjaCBmb3IgYSB2YWx1ZSB1c2luZyB0aGUga2V5XG4gIHZhciBrZXkgPSBcInlvdXJfa2V5XCI7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhzdHIpXG4gIHZhciB2YWx1ZSA9IGNzdkRhdGFbc3RyLnNsaWNlKDAsIHN0ci5sZW5ndGggLSAxKV07XG4gIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB2YXIgYm9hcmQgPSBDaGVzc2JvYXJkKCdteUJvYXJkJywgdmFsdWUpO1xufSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgY29uc29sZS5lcnJvcihcIkVycm9yIGxvYWRpbmcgQ1NWIGZpbGU6XCIsIGVycm9yKTtcbn0pO1xuICAgICAgIC8vIHZhciBib2FyZCA9IENoZXNzYm9hcmQoJ215Qm9hcmQnLCBcInIxYjFrYm5yL3BwcHAxTnBwLzgvOC8yQm5QMy84L1BQUFAxUHFQL1JOQlFLUjIgYiBRa3EgLSAxIDZcIilcbiAgICAgIH1cblx0XHRcdGVsc2V7XHQvL2JvYXJkLmNsZWFyKGZhbHNlKVxuICAgICAgY29uc3QgY2hlc3Nub3cgPSBuZXcgQ2hlc3MoKVxuICAgICAgY2hlc3Nub3cubG9hZF9wZ24oc3RyKVxuICAgICAgY29uc29sZS5sb2coY2hlc3Nub3cuZmVuKCkpXG5cbiAgICAgIHZhciBib2FyZCA9IENoZXNzYm9hcmQoJ215Qm9hcmQnLCBjaGVzc25vdy5mZW4oKSk7XG59XG4gICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgLmFwcGVuZCgndHNwYW4nKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdzdGVwcycpXG4gICAgICAgICAgLmF0dHIoJ3gnLCAwKVxuICAgICAgICAgIC5hdHRyKCd5JywgNDIwKVxuICAgICAgICAgIC5hdHRyKCdkeScsICctMC4xZW0nKVxuICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAnMS41ZW0nKVxuICAgICAgICAgIC50ZXh0KHN0cik7XG4gICAgICB9KTtcblxuICAgIC8vIGNvbnN0IHN2Z2JyZWFkID0gZDNcbiAgICAvLyAgIC5jcmVhdGUoXCJzdmdcIilcbiAgICAvLyAgIC5hdHRyKFwidmlld0JveFwiLCBgMCAwICR7YnJlYWRjcnVtYldpZHRoICogMTB9ICR7YnJlYWRjcnVtYkhlaWdodH1gKVxuICAgIC8vIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7Y2VudGVyWH0sICR7Y2VudGVyWX0pYClcbiAgICAvLyAgIC5zdHlsZShcImZvbnRcIiwgXCIxMnB4IHNhbnMtc2VyaWZcIilcbiAgICAvLyAgIC5zdHlsZShcIm1hcmdpblwiLCBcIjVweFwiKTtcblxuICAgIC8vICAgY29uc3QgZyA9IHN2Z2JyZWFkXG4gICAgLy8gICAgIC5zZWxlY3RBbGwoXCJnXCIpXG4gICAgLy8gICAgIC5kYXRhKGVsZW1lbnQudmFsdWUuc2VxdWVuY2UpXG4gICAgLy8gICAgIC5qb2luKFwiZ1wiKVxuICAgIC8vICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCAoZCwgaSkgPT4gYHRyYW5zbGF0ZSgke2kgKiBicmVhZGNydW1iV2lkdGh9LCAwKWApO1xuXG4gICAgLy8gICBnLmFwcGVuZChcInBvbHlnb25cIilcbiAgICAvLyAgICAgLmF0dHIoXCJwb2ludHNcIiwgYnJlYWRjcnVtYlBvaW50cylcbiAgICAvLyAgICAgLmF0dHIoXCJmaWxsXCIsIGQgPT4gJ3BpbmsnKVxuICAgIC8vICAgICAuYXR0cihcInN0cm9rZVwiLCBcIndoaXRlXCIpO1xuXG4gICAgLy8gICBnLmFwcGVuZChcInRleHRcIilcbiAgICAvLyAgICAgLmF0dHIoXCJ4XCIsIChicmVhZGNydW1iV2lkdGggKyAxMCkgLyAyKVxuICAgIC8vICAgICAuYXR0cihcInlcIiwgMTUpXG4gICAgLy8gICAgIC5hdHRyKFwiZHlcIiwgXCIwLjM1ZW1cIilcbiAgICAvLyAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKVxuICAgIC8vICAgICAuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKVxuICAgIC8vICAgICAudGV4dChkID0+IGQuZGF0YS5uYW1lKTtcblxuICAgIC8vICAgc3ZnYnJlYWRcbiAgICAvLyAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAvLyAgICAgLnRleHQoZWxlbWVudC52YWx1ZS5wZXJjZW50YWdlID4gMCA/IGVsZW1lbnQudmFsdWUucGVyY2VudGFnZSArIFwiJVwiIDogXCJcIilcbiAgICAvLyAgICAgLmF0dHIoXCJ4XCIsIChlbGVtZW50LnZhbHVlLnNlcXVlbmNlLmxlbmd0aCArIDAuNSkgKiBicmVhZGNydW1iV2lkdGgpXG4gICAgLy8gICAgIC5hdHRyKFwieVwiLCBicmVhZGNydW1iSGVpZ2h0IC8gMilcbiAgICAvLyAgICAgLmF0dHIoXCJkeVwiLCBcIjAuMzVlbVwiKVxuICAgIC8vICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpO1xuICB9KVxuICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGJ1aWxkSGllcmFyY2h5KGNzdikge1xuICAvLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCB0cmFuc2Zvcm1zIHRoZSBnaXZlbiBDU1YgaW50byBhIGhpZXJhcmNoaWNhbCBmb3JtYXQuXG4gIGNvbnN0IHJvb3QgPSB7IG5hbWU6ICdyb290JywgY2hpbGRyZW46IFtdIH07XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY3N2Lmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2VxdWVuY2UgPSBjc3ZbaV0ucGduO1xuICAgIGNvbnN0IHNpemUgPSArY3N2W2ldLmZyZXE7XG4gICAgaWYgKGlzTmFOKHNpemUpKSB7XG4gICAgICAvLyBlLmcuIGlmIHRoaXMgaXMgYSBoZWFkZXIgcm93XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgcGFydHMgPSBzZXF1ZW5jZS5zcGxpdCgnLScpO1xuICAgIGNvbnNvbGUubG9nKHBhcnRzLmxlbmd0aClcbiAgICBsZXQgY3VycmVudE5vZGUgPSByb290O1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnNvbGUubG9nKGN1cnJlbnROb2RlKVxuICAgICAgY29uc29sZS5sb2cocGFydHNbal0pXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGN1cnJlbnROb2RlWydjaGlsZHJlbiddO1xuICAgICAgY29uc3Qgbm9kZU5hbWUgPSBwYXJ0c1tqXTtcbiAgICAgIGxldCBjaGlsZE5vZGUgPSBudWxsO1xuICAgICAgaWYgKGogKyAxIDwgcGFydHMubGVuZ3RoKSB7XG4gICAgICAgIC8vIE5vdCB5ZXQgYXQgdGhlIGVuZCBvZiB0aGUgc2VxdWVuY2U7IG1vdmUgZG93biB0aGUgdHJlZS5cbiAgICAgICAgbGV0IGZvdW5kQ2hpbGQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7ayA8IGNoaWxkcmVuLmxlbmd0aDtrKyspIHtcbiAgICAgICAgICBpZiAoY2hpbGRyZW5ba11bJ25hbWUnXSA9PSBub2RlTmFtZSkge1xuICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5ba107XG4gICAgICAgICAgICBmb3VuZENoaWxkID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSBkb24ndCBhbHJlYWR5IGhhdmUgYSBjaGlsZCBub2RlIGZvciB0aGlzIGJyYW5jaCwgY3JlYXRlIGl0LlxuICAgICAgICBpZiAoIWZvdW5kQ2hpbGQpIHtcbiAgICAgICAgICBjaGlsZE5vZGUgPSB7XG4gICAgICAgICAgICBuYW1lOiBub2RlTmFtZSxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGROb2RlKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImFkZG5ld1wiKVxuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnROb2RlID0gY2hpbGROb2RlO1xuICAgICAgICBjb25zb2xlLmxvZyhjdXJyZW50Tm9kZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgc2VxdWVuY2U7IGNyZWF0ZSBhIGxlYWYgbm9kZS5cbiAgICAgICAgY2hpbGROb2RlID0ge1xuICAgICAgICAgIG5hbWU6IG5vZGVOYW1lLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICB2YWx1ZTogc2l6ZSxcbiAgICAgICAgfTtcbiAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZE5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm9vdDtcbn1cbi8vIEdlbmVyYXRlIGEgc3RyaW5nIHRoYXQgZGVzY3JpYmVzIHRoZSBwb2ludHMgb2YgYSBicmVhZGNydW1iIFNWRyBwb2x5Z29uLlxuZnVuY3Rpb24gYnJlYWRjcnVtYlBvaW50cyhkLCBpKSB7XG4gIGNvbnN0IHRpcFdpZHRoID0gMTA7XG4gIGNvbnN0IHBvaW50cyA9IFtdO1xuICBwb2ludHMucHVzaCgnMCwwJyk7XG4gIHBvaW50cy5wdXNoKGAke2JyZWFkY3J1bWJXaWR0aH0sMGApO1xuICBwb2ludHMucHVzaChcbiAgICBgJHticmVhZGNydW1iV2lkdGggKyB0aXBXaWR0aH0sJHtcbiAgICAgIGJyZWFkY3J1bWJIZWlnaHQgLyAyXG4gICAgfWBcbiAgKTtcbiAgcG9pbnRzLnB1c2goXG4gICAgYCR7YnJlYWRjcnVtYldpZHRofSwke2JyZWFkY3J1bWJIZWlnaHR9YFxuICApO1xuICBwb2ludHMucHVzaChgMCwke2JyZWFkY3J1bWJIZWlnaHR9YCk7XG4gIGlmIChpID4gMCkge1xuICAgIC8vIExlZnRtb3N0IGJyZWFkY3J1bWI7IGRvbid0IGluY2x1ZGUgNnRoIHZlcnRleC5cbiAgICBwb2ludHMucHVzaChcbiAgICAgIGAke3RpcFdpZHRofSwke2JyZWFkY3J1bWJIZWlnaHQgLyAyfWBcbiAgICApO1xuICB9XG4gIHJldHVybiBwb2ludHMuam9pbignICcpO1xufVxuIl0sIm5hbWVzIjpbInNjYWxlT3JkaW5hbCIsInNlbGVjdEFsbCIsImNzdiIsInNlbGVjdCJdLCJtYXBwaW5ncyI6Ijs7O0VBQUEsTUFBTSxPQUFPLEdBQUcsZUFBYztBQUM5QjtFQUNBLE1BQU0sZ0JBQWdCO0VBQ3RCLEVBQUUsMkRBQTBEO0FBQzVEO0VBQ0EsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBQztBQUMxRDtFQUNBLE1BQU0sWUFBWSxHQUFHO0VBQ3JCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0VBQ3JCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDekIsRUFBQztBQUNEO0VBQ0EsTUFBTSxhQUFhLEdBQUc7RUFDdEIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7RUFDekMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0VBQ3ZCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNyQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUN2QyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUN2QyxFQUFDO0FBQ0Q7RUFDQTtFQUNBLE1BQU0sT0FBTyxHQUFHO0VBQ2hCLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztFQUNuRCxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUNuRCxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7RUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUNuRCxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDbkQsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7RUFDaEQsQ0FBQyxDQUFDO0FBQ0Y7RUFDQTtFQUNBLE1BQU0sSUFBSSxHQUFHO0VBQ2IsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7RUFDaEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7RUFDaEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7RUFDaEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7RUFDaEUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO0VBQ2hFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQzdELENBQUMsQ0FBQztBQUNGO0VBQ0EsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRTtBQUNyRDtFQUNBLE1BQU0sSUFBSSxHQUFHO0VBQ2IsRUFBRSxNQUFNLEVBQUUsQ0FBQztFQUNYLEVBQUUsT0FBTyxFQUFFLENBQUM7RUFDWixFQUFFLFFBQVEsRUFBRSxDQUFDO0VBQ2IsRUFBRSxVQUFVLEVBQUUsQ0FBQztFQUNmLEVBQUUsU0FBUyxFQUFFLEVBQUU7RUFDZixFQUFFLFlBQVksRUFBRSxFQUFFO0VBQ2xCLEVBQUUsWUFBWSxFQUFFLEVBQUU7RUFDbEIsRUFBQztBQUNEO0VBQ0EsTUFBTSxNQUFNLEdBQUcsRUFBQztFQUNoQixNQUFNLE1BQU0sR0FBRyxFQUFDO0VBS2hCLE1BQU0sTUFBTSxHQUFHLEVBQUM7RUFDaEIsTUFBTSxNQUFNLEdBQUcsRUFBQztBQUNoQjtFQUNBO0VBQ0EsTUFBTSxVQUFVLEdBQUc7RUFDbkIsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDO0VBQ3hFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtFQUN4RSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7RUFDeEUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFO0VBQ3hFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtFQUN4RSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7RUFDeEUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHO0VBQ3hFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRztFQUN4RSxDQUFDLENBQUM7QUFDRjtFQUNBLE1BQU0sS0FBSyxHQUFHO0VBQ2QsRUFBRSxDQUFDLEVBQUU7RUFDTCxJQUFJLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUU7RUFDdEQsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFVLENB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TUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7RUFDMUQsTUFBTSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEUsS0FBSztBQUNMO0VBQ0E7RUFDQSxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0VBQ3pELE1BQU0sT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2hFLEtBQUs7QUFDTDtFQUNBO0VBQ0EsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2pELE1BQU0sT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2hFLEtBQUs7QUFDTDtFQUNBO0VBQ0EsSUFBSSxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ3RELE1BQU0sT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2hFLEtBQUs7QUFDTDtFQUNBO0VBQ0EsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNwQyxNQUFNLE9B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QUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsRUFBRTtFQUMvRTtFQUNBLFFBQVEsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDNUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUU7RUFDbkMsVUFBVSxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUM7QUFDeEQ7RUFDQTtFQUNBLFVBQVUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDOUMsVUFBVSxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtFQUNwRSxZQUFZLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBQztFQUM1RCxXQUFXO0VBQ1gsU0FBUztBQUNUO0VBQ0E7RUFDQSxRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0VBQ2hDLFVBQVUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDOUMsVUFBVSxJQUFJLE1BQU0sR0FBRyxJQUFJLEVBQUUsUUFBUTtBQUNyQztFQUNBLFVBQVUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO0VBQ3JFLFlBQVksUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFDO0VBQzNE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QyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtFQUM1RCxRQUFRO0VBQ1IsVUFBVSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO0VBQzNDLFVBQVUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0VBQzFDLFVBQVU7RUFDVixVQUFVLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSTtFQUMzQyxVQUFVLEtBQUs7RUFDZixTQUFTO0VBQ1QsT0FBTztFQUNQLEtBQUs7QUFDTDtFQUNBO0VBQ0EsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtFQUN4QixNQUFNLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDOUQsUUFBUTtFQUNSLFVBQVUsSUFBSSxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtFQUMzQyxVQUFVLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtFQUM5QyxVQUFVO0VBQ1YsVUFBVSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUk7RUFDL0MsVUFBVSxLQUFLO0VBQ2YsU0FBUztFQUNULE9BQU87RUFDUCxLQUFLO0FBQ0w7RUFDQTtFQUNBLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUU7RUFDcEMsTUFBTSxJQUFJLElBQUksS0FB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