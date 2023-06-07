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
    var whiteSquareGrey = '#a9a9a9';
    var blackSquareGrey = '#696969';
    const chess1 = new Chess();
    var game = new Chess();
    var gameelite = new Chess();
    
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
    console.log(chess1.pgn());
    chess1.move("Rhf1");
    console.log(chess1.fen());
    var board = Chessboard('myBoard', "start");
    var boardelite = Chessboard('myBoardelite', "start");
    const viewSize = 1000;
    //chessboard and graphic dimensions
  //  const chessboardwidth = 250;
  //const width = window.innerWidth -5 - chessboardwidth;
  //  const width = window.innerWidth/2 -5;
  	const width = viewSize*3/4;
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
    document.getElementById("bishop").addEventListener("click", function() {
      console.log(this.id);
      
              var svgImage = document.getElementById("svgImage");
      console.log(svgImage.src);
          svgImage.src = this.id +".svg";
      var heatmaptext = document.getElementById("heatmaptitle");
      heatmaptext.textContent = "Bishops";
      var heatmaptmain = document.getElementById("heatmap-main");
      heatmaptmain.textContent = "Target your opponent's weak f pawn! Pin your opponent's knight";
      var heatmaptcom = document.getElementById("heatmap-comment");
      heatmaptcom.textContent = "Note that f pawn is only protected by each king. In the opening stage, if you are a beginner, it's intuitive to develop your light square bishop (resp. dark square bishop in black's perspective) to the c4 square (resp. c5 square in black's perspective). If you're white, normally, your opponent's knight will be developed to c6 or f6 square. Hence its also good in many cases to develop your bishop with tempo to b5 or g5 square in order to restrict the mobility of the knight. This is called pin in chess.";
    });
    document.getElementById("king").addEventListener("click", function() {
      console.log(this.id);
      
              var svgImage = document.getElementById("svgImage");
      console.log(svgImage.src);
          svgImage.src = this.id +".svg";
  var heatmaptext = document.getElementById("heatmaptitle");
      heatmaptext.textContent = "Kings";
      var heatmaptmain = document.getElementById("heatmap-main");
      heatmaptmain.textContent = "Keep your king safe! Castle early.";
      var heatmaptcom = document.getElementById("heatmap-comment");
      heatmaptcom.textContent = "The chess king is vulnerable; prioritize its safety. Castle early, preferably kingside. Kingside castling is more common than the queenside one even at top levels.";
    });
    document.getElementById("queen").addEventListener("click", function() {
      console.log(this.id);
      
              var svgImage = document.getElementById("svgImage");
      console.log(svgImage.src);
          svgImage.src = this.id +".svg";
      var heatmaptext = document.getElementById("heatmaptitle");
      heatmaptext.textContent = "Queens";
      var heatmaptmain = document.getElementById("heatmap-main");
      heatmaptmain.textContent = "Treat your queen well. Not only in life, but also in chess!";
      var heatmaptcom = document.getElementById("heatmap-comment");
      heatmaptcom.textContent ="The queen is the strongest piece in chess, requiring protection and effective use. Heat maps indicate high occupancy on a4, a5, h4, and h5 squares due to potential checks and capturing undefended pieces. The occupation of f3 by the queen lacks a clear explanation, posing an open problem.";
    });
    document.getElementById("rook").addEventListener("click", function() {
      console.log(this.id);
      
              var svgImage = document.getElementById("svgImage");
      console.log(svgImage.src);
          svgImage.src = this.id +".svg";
      var heatmaptext = document.getElementById("heatmaptitle");
      heatmaptext.textContent = "Rooks";
      var heatmaptmain = document.getElementById("heatmap-main");
      heatmaptmain.textContent = "Connect the rooks, support the center!";
      var heatmaptcom = document.getElementById("heatmap-comment");
      heatmaptcom.textContent ="Rooks on h file typically comes to f1 (f8 in black's perspective) after kingside castling. That's why f1 and f8 are occupied by rooks so frequently. Now let your two rooks defend each other and fight for open files. In a number of situations, rooks want to support the two centered files (d and e files).";
      
    });
    document.getElementById("pawn").addEventListener("click", function() {
      console.log(this.id);
      
              var svgImage = document.getElementById("svgImage");
      console.log(svgImage.src);
          svgImage.src = this.id +".svg";
      var heatmaptext = document.getElementById("heatmaptitle");
      heatmaptext.textContent = "Pawns";
      var heatmaptmain = document.getElementById("heatmap-main");
      heatmaptmain.textContent = "Control the center!";
      var heatmaptcom = document.getElementById("heatmap-comment");
      heatmaptcom.textContent ="Control the center by placing attacking pieces on central squares. e4 and d4 (e5 and d5 for black) are common for this. Pushing the c pawn protects the center. Avoid playing f3 (f6 for Black) as it weakens the castled king.";
    });
    document.getElementById("knight").addEventListener("click", function() {
      console.log(this.id);
      
              var svgImage = document.getElementById("svgImage");
      console.log(svgImage.src);
          svgImage.src = this.id +".svg";
   		var heatmaptext = document.getElementById("heatmaptitle");
      heatmaptext.textContent = "Knights";
      var heatmaptmain = document.getElementById("heatmap-main");
      heatmaptmain.textContent = "Control the center!";
      var heatmaptcom = document.getElementById("heatmap-comment");
      heatmaptcom.textContent = "Controlling the center is an important theme in chess. Develop your knight to c3 and f3 squares (c6 and f6 in black's perspective) in the beginning stage of the game. Sometimes they come to d2 or e2 squares (d7 or e7 in black's perspective) to support another knight.";
    });
    let clickmode = false;
    document.getElementById("clickmode").addEventListener("click", function() {
      clickmode = false;
    });
    let clickmodeelite = false;
    document.getElementById("clickmode-elite").addEventListener("click", function() {
      clickmodeelite = false;
    });
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
      let rateslider = document.getElementById(
        'rateSlider'
      );
      let eliteslider = document.getElementById(
        'rateSlider-elite'
      );
    let sliderValue = document.getElementById("sliderValue");
    let rateValue = document.getElementById("rateValue");
    let eliteValue = document.getElementById("rateValue-elite");
    let levelValue = 0;
    let levelValueelite = 0;
    let filename = '3500-4000.csv';
    let filenameelite = 'elite.csv';
    //let filename = '2015-12.csv'
    console.log(rateslider);
    rateslider.addEventListener('input',function(){
            const index = parseInt(this.value);
      let text = "";
      switch (index) {
        case 0:
          levelValue = 0;
          text = "Top 500";
          break;
        case 1:
          levelValue = 1;
          text = "500-1000";
          break;
        case 2:
          levelValue = 2;
          text = "1000-1500";
          break;
        case 3:
          levelValue = 3;
          text = "1500-2000";
          break;
        case 4:
          levelValue = 4;
          text = "2000-2500";
          break;
        case 5:
          levelValue = 5;
          text = "2500-3000";
          break;
      }
      rateValue.textContent = text;
          d3$1.selectAll('.sunburst-path').remove();
        d3$1.selectAll('.sunburst-path-mouse').remove();
        d3$1.selectAll('.percentage').remove();
        d3$1.selectAll('.game-text').remove();
                d3$1.selectAll('.steps').remove();
            d3$1.selectAll('.steps-click').remove();
      clickmode=false;
      generateSunburst(filename,input,levelValue);
    });
    eliteslider.addEventListener('input',function(){
      console.log("in elite");
            const index = parseInt(this.value);
      let text = "";
      switch (index) {
        case 0:
          levelValueelite = 0;
          text = "Top 500";
          break;
        case 1:
          levelValueelite = 1;
          text = "500-1000";
          break;
        case 2:
          levelValueelite = 2;
          text = "1000-1500";
          break;
        case 3:
          levelValueelite = 3;
          text = "1500-2000";
          break;
        case 4:
          levelValueelite = 4;
          text = "2000-2100";
          break;
        case 5:
          levelValueelite = 5;
          text = "2500-3000";
          break;
      }
      eliteValue.textContent = text;
          d3$1.selectAll('.sunburst-path-elite').remove();
        d3$1.selectAll('.sunburst-path-mouse-elite').remove();
        d3$1.selectAll('.percentage-elite').remove();
        d3$1.selectAll('.game-text-elite').remove();
                    d3$1.selectAll('.steps-elite').remove();
            d3$1.selectAll('.steps-click-elite').remove();
      clickmodeelite = false;
      
      generateSunburstElite(filenameelite,inputelite,levelValueelite);
    });
    //const input = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5"
    const input = "";
    const inputelite = "";
    generateSunburst(filename,input,0);
  	generateSunburstElite(filenameelite,input,0);
    document.getElementById("newgame").addEventListener("click", function() {
      game = new Chess();
        d3$1.selectAll('.sunburst-path').remove();
        d3$1.selectAll('.sunburst-path-mouse').remove();
        d3$1.selectAll('.percentage').remove();
        d3$1.selectAll('.game-text').remove();
                d3$1.selectAll('.steps').remove();
            d3$1.selectAll('.steps-click').remove();
      clickmode = false;
      generateSunburst(filename,input,levelValue);
    });
    document.getElementById("newgame-elite").addEventListener("click", function() {
      game = new Chess();
        d3$1.selectAll('.sunburst-path-elite').remove();
        d3$1.selectAll('.sunburst-path-mouse-elite').remove();
        d3$1.selectAll('.percentage-elite').remove();
        d3$1.selectAll('.game-text-elite').remove();
                        d3$1.selectAll('.steps-elite').remove();
            d3$1.selectAll('.steps-click-elite').remove();
      clickmodeelite = false;
      generateSunburstElite(filenameelite,inputelite,levelValueelite);
    });
      slider.addEventListener('input', function () {
        console.log(levelValue);
        const index = parseInt(this.value);
        let text = "";
      switch (index) {
        case 0:
    //      text = "Popular Games";
              text = "3500-4000";
          break;
        case 1:
    //      text = "Medium frequency";
              text = "3000-3500";
          break;
        case 2:
    //      text = "Niche Games";
              text = "2500-3000";
          break;
       case 3:
             text = "2000-2500";
         break;
       case 4:
             text = "1500-2000";
          break;
      	case 5:
            text = "1000-1500";
          break;
        default:
          text = "";
      }
        console.log(text);
        sliderValue.textContent = text;
        clickmode = false;
        d3$1.selectAll('.percentage').remove();
        d3$1.selectAll('.game-text').remove();
            d3$1.selectAll('.sunburst-path').remove();
        d3$1.selectAll('.sunburst-path-mouse').remove();
                  d3$1.selectAll('.steps').remove();
            d3$1.selectAll('.steps-click').remove();
        //filename = newName;
        filename = text+".csv";
    
        console.log(filename);
        generateSunburst(filename,input,levelValue);
            // date to human readable quarter
        // if (
        //   targetDate.getTime() ===
        //   targetDates[0].getTime()
        // ) {
        //   season = 'Oct-Dec, 2016';
        // }
      });
    
    // generateSunburst(filename)
    function generateSunburst(filename,input,lineindex){
    d3$1.csv(filename)
      .then((parsedData) => {
        console.log(parsedData);
        //console.log(parsedData[1].pgn)
        return buildHierarchy(parsedData.slice(0+lineindex*500, 500+lineindex*500));
      //return buildHierarchy(parsedData)
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
      .attr("class",'game-text')
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
            //console.log(h)
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
      .attr('class','sunburst-path'); //build path end
            console.log(root.descendants());
        svg
          .append('g')
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
          .on('mouseleave', () => {
          if(clickmode === false){
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
          }
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
          .on('click', (event, d) => {
          clickmode = true;
            // Get the ancestors of the current segment, minus the root
            d3$1.selectAll('.steps-click').remove();
                    d3$1.selectAll('.steps').remove();

          console.log(d);
            const sequence = d
              .ancestors()
              .reverse()
              .slice(1);
            // Highlight the ancestors
          console.log(sequence);
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
          let last = element.value.sequence[element.value.sequence.length-1];
          console.log(last.data);
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
              .attr('class', 'steps-click')
              .attr('x', 0)
              .attr('y', 400)
              .attr('dy', '-0.1em')
              .attr('font-size', '2em')
              .text(str);
          })
          .on('mouseenter', (event, d) => {
            // Get the ancestors of the current segment, minus the root
          if (clickmode === false){
            d3$1.selectAll('.steps').remove();
            d3$1.selectAll('.steps-click').remove();
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
              .attr('y', 400)
              .attr('dy', '-0.1em')
              .attr('font-size', '2em')
              .text(str);
          }
          });
      var config = {
      draggable: true,
      position: 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onMouseoutSquare: onMouseoutSquare,
      onMouseoverSquare: onMouseoverSquare,
      onSnapEnd: onSnapEnd
    };
    board = Chessboard('myBoard', config);
                console.log(root.descendants()); //have path
      //1. e4 e5 2. Qh5
              //const input = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5"
      if(input!==""){
              const output = input.replace(/\d+\.\s/g, "").replace(/\s/g, "-");
              const sequenceStr = output.split("-");
              console.log(sequenceStr);
              const filteredArr = sequenceStr.map((name, index) => {
              const depth = index + 1;
              return root.descendants().find(item => item.data.name === name && item.depth === depth);
              });
                      //const highLightSunburst = filteredArr
              const highLightSunburst = filteredArr.filter((d) => {
              // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
              return d.depth && d.x1 - d.x0 > 0.001;
            });
                        console.log(highLightSunburst);
        //check
        let validSunburst = true;
        validSunburst = root.descendants().includes(highLightSunburst[0]);
        console.log(validSunburst);
        for(let i = 1;i<highLightSunburst.length;i++){
          validSunburst = highLightSunburst[i-1].children.includes(highLightSunburst[i]);
          if(validSunburst ===false) {break;}
            
        }
        if(validSunburst){
                      path.attr('fill-opacity', (node) =>
              highLightSunburst.indexOf(node) >= 0 ? 1.0 : 0.3
            );
            const percentage = (
              (100 * highLightSunburst[highLightSunburst.length - 1].value) /
              root.value
            ).toPrecision(3);
            label
              .style('visibility', null)
              .select('.percentage')
              .text(percentage + '%');
        } else {
                label
              .style('visibility', null)
              .select('.percentage')
              .text("No Games");
        }
      }
            // // Update the value of this view with the currently hovered sequence and percentage
            // element.value = { sequence, percentage };
            // element.dispatchEvent(
            //   new CustomEvent('input')
            // );
      })
      
      .catch((error) => {
        console.error('Error:', error);
      });
    }
    function generateSunburstElite(filename,input,lineindex){
    d3$1.csv(filename)
      .then((parsedData) => {
        console.log(parsedData);
        //console.log(parsedData[1].pgn)
        return buildHierarchy(parsedData.slice(0+lineindex*500, 500+lineindex*500));
      //return buildHierarchy(parsedData)
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
      const svg = d3$1.select("#sunburst-elite");
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
      .attr('class', 'percentage-elite')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '-0.1em')
      .attr('font-size', '2em')
      .text('');
    
    label
      .append('tspan')
      .attr("class",'game-text-elite')
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
            //console.log(h)
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
      .attr('class','sunburst-path-elite'); //build path end/////////////////////////////////////////////////////////////////////////////
            console.log(root.descendants());
        svg
          .append('g')
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
          .on('mouseleave', () => {
          if(clickmodeelite === false){
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
          }
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
        .attr('class','sunburst-path-mouse-elite')
          .on('click', (event, d) => {
          clickmodeelite = true;
            // Get the ancestors of the current segment, minus the root
            d3$1.selectAll('.steps-click-elite').remove();
            d3$1.selectAll('.steps-elite').remove();

          console.log(d);
            const sequence = d
              .ancestors()
              .reverse()
              .slice(1);
            // Highlight the ancestors
          console.log(sequence);
            path.attr('fill-opacity', (node) =>
              sequence.indexOf(node) >= 0 ? 1.0 : 0.3
            );
            const percentage = (
              (100 * d.value) /
              root.value
            ).toPrecision(3);
            label
              .style('visibility', null)
              .select('.percentage-elite')
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
          let last = element.value.sequence[element.value.sequence.length-1];
          console.log(last.data);
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
                    var boardelite = Chessboard('myBoardelite', value);
    }).catch(function(error) {
      console.error("Error loading CSV file:", error);
    });
           // var board = Chessboard('myBoard', "r1b1kbnr/pppp1Npp/8/8/2BnP3/8/PPPP1PqP/RNBQKR2 b Qkq - 1 6")
          }
                else {	//board.clear(false)
          const chessnow = new Chess();
          chessnow.load_pgn(str);
          console.log(chessnow.fen());
    
          var boardelite = Chessboard('myBoardelite', chessnow.fen());
    }
                  label
              .append('tspan')
              .attr('class', 'steps-click-elite')
              .attr('x', 0)
              .attr('y', 400)
              .attr('dy', '-0.1em')
              .attr('font-size', '2em')
              .text(str);
          })
          .on('mouseenter', (event, d) => {
            // Get the ancestors of the current segment, minus the root
          if (clickmodeelite === false){
            d3$1.selectAll('.steps-elite').remove();
            d3$1.selectAll('.steps-click-elite').remove();
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
              .select('.percentage-elite')
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
                    var boardelite = Chessboard('myBoardelite', value);
    }).catch(function(error) {
      console.error("Error loading CSV file:", error);
    });
           // var board = Chessboard('myBoard', "r1b1kbnr/pppp1Npp/8/8/2BnP3/8/PPPP1PqP/RNBQKR2 b Qkq - 1 6")
          }
                else {	//board.clear(false)
          const chessnow = new Chess();
          chessnow.load_pgn(str);
          console.log(chessnow.fen());
    
          var boardelite = Chessboard('myBoardelite', chessnow.fen());
    }
                  label
              .append('tspan')
              .attr('class', 'steps-elite')
              .attr('x', 0)
              .attr('y', 400)
              .attr('dy', '-0.1em')
              .attr('font-size', '2em')
              .text(str);
          }
          });
      var config = {
      draggable: true,
      position: 'start',
      onDragStart: onDragStartElite,
      onDrop: onDropElite,
      onMouseoutSquare: onMouseoutSquareElite,
      onMouseoverSquare: onMouseoverSquareElite,
      onSnapEnd: onSnapEndElite
    };
    boardelite = Chessboard('myBoardelite', config);
                console.log(root.descendants()); //have path
      //1. e4 e5 2. Qh5
              //const input = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5"
      if(input!==""){
              const output = input.replace(/\d+\.\s/g, "").replace(/\s/g, "-");
              const sequenceStr = output.split("-");
              console.log(sequenceStr);
              const filteredArr = sequenceStr.map((name, index) => {
              const depth = index + 1;
              return root.descendants().find(item => item.data.name === name && item.depth === depth);
              });
                      //const highLightSunburst = filteredArr
              const highLightSunburst = filteredArr.filter((d) => {
              // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
              return d.depth && d.x1 - d.x0 > 0.001;
            });
                        console.log(highLightSunburst);
        //check
        let validSunburst = true;
        validSunburst = root.descendants().includes(highLightSunburst[0]);
        console.log(validSunburst);
        for(let i = 1;i<highLightSunburst.length;i++){
          validSunburst = highLightSunburst[i-1].children.includes(highLightSunburst[i]);
          if(validSunburst ===false) {break;}
            
        }
        if(validSunburst){
                      path.attr('fill-opacity', (node) =>
              highLightSunburst.indexOf(node) >= 0 ? 1.0 : 0.3
            );
            const percentage = (
              (100 * highLightSunburst[highLightSunburst.length - 1].value) /
              root.value
            ).toPrecision(3);
            label
              .style('visibility', null)
              .select('.percentage-elite')
              .text(percentage + '%');
        } else {
                label
              .style('visibility', null)
              .select('.percentage-elite')
              .text("No Games");
        }
      }
            // // Update the value of this view with the currently hovered sequence and percentage
            // element.value = { sequence, percentage };
            // element.dispatchEvent(
            //   new CustomEvent('input')
            // );
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
        const parts = sequence.split('=');
       // console.log(parts.length)
        let currentNode = root;
        for (let j = 0; j < parts.length; j++) {
          // console.log(currentNode)
          // console.log(parts[j])
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
              //console.log("addnew")
            }
            currentNode = childNode;
            //console.log(currentNode)
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
    function removeGreySquares () {
      $('#myBoard .square-55d63').css('background', '');
    }
    function removeGreySquaresElite () {
      $('#myBoardelite .square-55d63').css('background', '');
    }
    function greySquare (square) {
      var $square = $('#myBoard .square-' + square);
        console.log(square);
      var background = whiteSquareGrey;
      if ($square.hasClass('black-3c85d')) {
        background = blackSquareGrey;
      }
    
      $square.css('background', background);
    }
    function greySquareElite (square) {
      var $square = $('#myBoardelite .square-' + square);
        console.log(square);
      var background = whiteSquareGrey;
      if ($square.hasClass('black-3c85d')) {
        background = blackSquareGrey;
      }
    
      $square.css('background', background);
    }
    
    function onDragStart (source, piece) {
      // do not pick up pieces if the game is over
      if (game.game_over()) return false
    
      // or if it's not that side's turn
      if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
      }
    }
    function onDragStartElite (source, piece) {
      // do not pick up pieces if the game is over
      if (gameelite.game_over()) return false
    
      // or if it's not that side's turn
      if ((gameelite.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (gameelite.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
      }
    }
    
    function onDrop (source, target) {
      removeGreySquares();
    
      // see if the move is legal
      var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
      });
    
      // illegal move
      if (move === null) return 'snapback'
      console.log(game.pgn());
      d3$1.selectAll('.sunburst-path').remove();
        d3$1.selectAll('.sunburst-path-mouse').remove();
        d3$1.selectAll('.percentage').remove();
        d3$1.selectAll('.game-text').remove();
    
        generateSunburst(filename,game.pgn(),levelValue);
    }
    function onDropElite (source, target) {
      removeGreySquaresElite();
    
      // see if the move is legal
      var move = gameelite.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
      });
    
      // illegal move
      if (move === null) return 'snapback'
      console.log(gameelite.pgn());
      d3$1.selectAll('.sunburst-path-elite').remove();
        d3$1.selectAll('.sunburst-path-mouse-elite').remove();
        d3$1.selectAll('.percentage-elite').remove();
        d3$1.selectAll('.game-text-elite').remove();
    
        generateSunburstElite(filenameelite,gameelite.pgn(),levelValueelite);
    }
    function onMouseoverSquare (square, piece) {
      // get list of possible moves for this square
      var moves = game.moves({
        square: square,
        verbose: true
      });
    
      // exit if there are no moves available for this square
      if (moves.length === 0) return
    
      // highlight the square they moused over
      console.log(typeof square);
      console.log(square);
      greySquare(square);
    
      // highlight the possible squares for this piece
      for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
      }
    }
    function onMouseoverSquareElite (square, piece) {
      // get list of possible moves for this square
      var moves = gameelite.moves({
        square: square,
        verbose: true
      });
    
      // exit if there are no moves available for this square
      if (moves.length === 0) return
    
      // highlight the square they moused over
      console.log(typeof square);
      console.log(square);
      greySquareElite(square);
    
      // highlight the possible squares for this piece
      for (var i = 0; i < moves.length; i++) {
        greySquareElite(moves[i].to);
      }
    }
    
    function onMouseoutSquare (square, piece) {
      removeGreySquares();
    }
    function onMouseoutSquareElite (square, piece) {
      removeGreySquaresElite();
    }
    function onSnapEnd () {
      board.position(game.fen());
    }
    function onSnapEndElite () {
      boardelite.position(gameelite.fen());
    }

}(d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImNoZXNzLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU1lNQk9MUyA9ICdwbmJycWtQTkJSUUsnXG5cbmNvbnN0IERFRkFVTFRfUE9TSVRJT04gPVxuICAncm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUiB3IEtRa3EgLSAwIDEnXG5cbmNvbnN0IFRFUk1JTkFUSU9OX01BUktFUlMgPSBbJzEtMCcsICcwLTEnLCAnMS8yLTEvMicsICcqJ11cblxuY29uc3QgUEFXTl9PRkZTRVRTID0ge1xuICBiOiBbMTYsIDMyLCAxNywgMTVdLFxuICB3OiBbLTE2LCAtMzIsIC0xNywgLTE1XSxcbn1cblxuY29uc3QgUElFQ0VfT0ZGU0VUUyA9IHtcbiAgbjogWy0xOCwgLTMzLCAtMzEsIC0xNCwgMTgsIDMzLCAzMSwgMTRdLFxuICBiOiBbLTE3LCAtMTUsIDE3LCAxNV0sXG4gIHI6IFstMTYsIDEsIDE2LCAtMV0sXG4gIHE6IFstMTcsIC0xNiwgLTE1LCAxLCAxNywgMTYsIDE1LCAtMV0sXG4gIGs6IFstMTcsIC0xNiwgLTE1LCAxLCAxNywgMTYsIDE1LCAtMV0sXG59XG5cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgQVRUQUNLUyA9IFtcbiAgMjAsIDAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwgMCwyMCwgMCxcbiAgIDAsMjAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwyMCwgMCwgMCxcbiAgIDAsIDAsMjAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwyMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsMjAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwyMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDI0LCAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsIDAsMjAsIDIsIDI0LCAgMiwyMCwgMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsIDAsIDIsNTMsIDU2LCA1MywgMiwgMCwgMCwgMCwgMCwgMCwgMCxcbiAgMjQsMjQsMjQsMjQsMjQsMjQsNTYsICAwLCA1NiwyNCwyNCwyNCwyNCwyNCwyNCwgMCxcbiAgIDAsIDAsIDAsIDAsIDAsIDIsNTMsIDU2LCA1MywgMiwgMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsIDAsMjAsIDIsIDI0LCAgMiwyMCwgMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDI0LCAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsIDAsMjAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwyMCwgMCwgMCwgMCwgMCxcbiAgIDAsIDAsMjAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwyMCwgMCwgMCwgMCxcbiAgIDAsMjAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwyMCwgMCwgMCxcbiAgMjAsIDAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwgMCwyMFxuXTtcblxuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBSQVlTID0gW1xuICAgMTcsICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsIDE2LCAgMCwgIDAsICAwLCAgMCwgIDAsICAwLCAxNSwgMCxcbiAgICAwLCAxNywgIDAsICAwLCAgMCwgIDAsICAwLCAxNiwgIDAsICAwLCAgMCwgIDAsICAwLCAxNSwgIDAsIDAsXG4gICAgMCwgIDAsIDE3LCAgMCwgIDAsICAwLCAgMCwgMTYsICAwLCAgMCwgIDAsICAwLCAxNSwgIDAsICAwLCAwLFxuICAgIDAsICAwLCAgMCwgMTcsICAwLCAgMCwgIDAsIDE2LCAgMCwgIDAsICAwLCAxNSwgIDAsICAwLCAgMCwgMCxcbiAgICAwLCAgMCwgIDAsICAwLCAxNywgIDAsICAwLCAxNiwgIDAsICAwLCAxNSwgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgMCwgIDAsICAwLCAgMCwgIDAsIDE3LCAgMCwgMTYsICAwLCAxNSwgIDAsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwgMTcsIDE2LCAxNSwgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwgMCxcbiAgICAxLCAgMSwgIDEsICAxLCAgMSwgIDEsICAxLCAgMCwgLTEsIC0xLCAgLTEsLTEsIC0xLCAtMSwgLTEsIDAsXG4gICAgMCwgIDAsICAwLCAgMCwgIDAsICAwLC0xNSwtMTYsLTE3LCAgMCwgIDAsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgIDAsICAwLCAgMCwgIDAsICAwLC0xNSwgIDAsLTE2LCAgMCwtMTcsICAwLCAgMCwgIDAsICAwLCAgMCwgMCxcbiAgICAwLCAgMCwgIDAsICAwLC0xNSwgIDAsICAwLC0xNiwgIDAsICAwLC0xNywgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgMCwgIDAsICAwLC0xNSwgIDAsICAwLCAgMCwtMTYsICAwLCAgMCwgIDAsLTE3LCAgMCwgIDAsICAwLCAwLFxuICAgIDAsICAwLC0xNSwgIDAsICAwLCAgMCwgIDAsLTE2LCAgMCwgIDAsICAwLCAgMCwtMTcsICAwLCAgMCwgMCxcbiAgICAwLC0xNSwgIDAsICAwLCAgMCwgIDAsICAwLC0xNiwgIDAsICAwLCAgMCwgIDAsICAwLC0xNywgIDAsIDAsXG4gIC0xNSwgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwtMTYsICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsLTE3XG5dO1xuXG5jb25zdCBTSElGVFMgPSB7IHA6IDAsIG46IDEsIGI6IDIsIHI6IDMsIHE6IDQsIGs6IDUgfVxuXG5jb25zdCBCSVRTID0ge1xuICBOT1JNQUw6IDEsXG4gIENBUFRVUkU6IDIsXG4gIEJJR19QQVdOOiA0LFxuICBFUF9DQVBUVVJFOiA4LFxuICBQUk9NT1RJT046IDE2LFxuICBLU0lERV9DQVNUTEU6IDMyLFxuICBRU0lERV9DQVNUTEU6IDY0LFxufVxuXG5jb25zdCBSQU5LXzEgPSA3XG5jb25zdCBSQU5LXzIgPSA2XG5jb25zdCBSQU5LXzMgPSA1XG5jb25zdCBSQU5LXzQgPSA0XG5jb25zdCBSQU5LXzUgPSAzXG5jb25zdCBSQU5LXzYgPSAyXG5jb25zdCBSQU5LXzcgPSAxXG5jb25zdCBSQU5LXzggPSAwXG5cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgU1FVQVJFX01BUCA9IHtcbiAgYTg6ICAgMCwgYjg6ICAgMSwgYzg6ICAgMiwgZDg6ICAgMywgZTg6ICAgNCwgZjg6ICAgNSwgZzg6ICAgNiwgaDg6ICAgNyxcbiAgYTc6ICAxNiwgYjc6ICAxNywgYzc6ICAxOCwgZDc6ICAxOSwgZTc6ICAyMCwgZjc6ICAyMSwgZzc6ICAyMiwgaDc6ICAyMyxcbiAgYTY6ICAzMiwgYjY6ICAzMywgYzY6ICAzNCwgZDY6ICAzNSwgZTY6ICAzNiwgZjY6ICAzNywgZzY6ICAzOCwgaDY6ICAzOSxcbiAgYTU6ICA0OCwgYjU6ICA0OSwgYzU6ICA1MCwgZDU6ICA1MSwgZTU6ICA1MiwgZjU6ICA1MywgZzU6ICA1NCwgaDU6ICA1NSxcbiAgYTQ6ICA2NCwgYjQ6ICA2NSwgYzQ6ICA2NiwgZDQ6ICA2NywgZTQ6ICA2OCwgZjQ6ICA2OSwgZzQ6ICA3MCwgaDQ6ICA3MSxcbiAgYTM6ICA4MCwgYjM6ICA4MSwgYzM6ICA4MiwgZDM6ICA4MywgZTM6ICA4NCwgZjM6ICA4NSwgZzM6ICA4NiwgaDM6ICA4NyxcbiAgYTI6ICA5NiwgYjI6ICA5NywgYzI6ICA5OCwgZDI6ICA5OSwgZTI6IDEwMCwgZjI6IDEwMSwgZzI6IDEwMiwgaDI6IDEwMyxcbiAgYTE6IDExMiwgYjE6IDExMywgYzE6IDExNCwgZDE6IDExNSwgZTE6IDExNiwgZjE6IDExNywgZzE6IDExOCwgaDE6IDExOVxufTtcblxuY29uc3QgUk9PS1MgPSB7XG4gIHc6IFtcbiAgICB7IHNxdWFyZTogU1FVQVJFX01BUC5hMSwgZmxhZzogQklUUy5RU0lERV9DQVNUTEUgfSxcbiAgICB7IHNxdWFyZTogU1FVQVJFX01BUC5oMSwgZmxhZzogQklUUy5LU0lERV9DQVNUTEUgfSxcbiAgXSxcbiAgYjogW1xuICAgIHsgc3F1YXJlOiBTUVVBUkVfTUFQLmE4LCBmbGFnOiBCSVRTLlFTSURFX0NBU1RMRSB9LFxuICAgIHsgc3F1YXJlOiBTUVVBUkVfTUFQLmg4LCBmbGFnOiBCSVRTLktTSURFX0NBU1RMRSB9LFxuICBdLFxufVxuXG5jb25zdCBQQVJTRVJfU1RSSUNUID0gMFxuY29uc3QgUEFSU0VSX1NMT1BQWSA9IDFcblxuLyogdGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHVuaXF1ZWx5IGlkZW50aWZ5IGFtYmlndW91cyBtb3ZlcyAqL1xuZnVuY3Rpb24gZ2V0X2Rpc2FtYmlndWF0b3IobW92ZSwgbW92ZXMpIHtcbiAgdmFyIGZyb20gPSBtb3ZlLmZyb21cbiAgdmFyIHRvID0gbW92ZS50b1xuICB2YXIgcGllY2UgPSBtb3ZlLnBpZWNlXG5cbiAgdmFyIGFtYmlndWl0aWVzID0gMFxuICB2YXIgc2FtZV9yYW5rID0gMFxuICB2YXIgc2FtZV9maWxlID0gMFxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciBhbWJpZ19mcm9tID0gbW92ZXNbaV0uZnJvbVxuICAgIHZhciBhbWJpZ190byA9IG1vdmVzW2ldLnRvXG4gICAgdmFyIGFtYmlnX3BpZWNlID0gbW92ZXNbaV0ucGllY2VcblxuICAgIC8qIGlmIGEgbW92ZSBvZiB0aGUgc2FtZSBwaWVjZSB0eXBlIGVuZHMgb24gdGhlIHNhbWUgdG8gc3F1YXJlLCB3ZSdsbFxuICAgICAqIG5lZWQgdG8gYWRkIGEgZGlzYW1iaWd1YXRvciB0byB0aGUgYWxnZWJyYWljIG5vdGF0aW9uXG4gICAgICovXG4gICAgaWYgKHBpZWNlID09PSBhbWJpZ19waWVjZSAmJiBmcm9tICE9PSBhbWJpZ19mcm9tICYmIHRvID09PSBhbWJpZ190bykge1xuICAgICAgYW1iaWd1aXRpZXMrK1xuXG4gICAgICBpZiAocmFuayhmcm9tKSA9PT0gcmFuayhhbWJpZ19mcm9tKSkge1xuICAgICAgICBzYW1lX3JhbmsrK1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlsZShmcm9tKSA9PT0gZmlsZShhbWJpZ19mcm9tKSkge1xuICAgICAgICBzYW1lX2ZpbGUrK1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChhbWJpZ3VpdGllcyA+IDApIHtcbiAgICAvKiBpZiB0aGVyZSBleGlzdHMgYSBzaW1pbGFyIG1vdmluZyBwaWVjZSBvbiB0aGUgc2FtZSByYW5rIGFuZCBmaWxlIGFzXG4gICAgICogdGhlIG1vdmUgaW4gcXVlc3Rpb24sIHVzZSB0aGUgc3F1YXJlIGFzIHRoZSBkaXNhbWJpZ3VhdG9yXG4gICAgICovXG4gICAgaWYgKHNhbWVfcmFuayA+IDAgJiYgc2FtZV9maWxlID4gMCkge1xuICAgICAgcmV0dXJuIGFsZ2VicmFpYyhmcm9tKVxuICAgIH0gZWxzZSBpZiAoc2FtZV9maWxlID4gMCkge1xuICAgICAgLyogaWYgdGhlIG1vdmluZyBwaWVjZSByZXN0cyBvbiB0aGUgc2FtZSBmaWxlLCB1c2UgdGhlIHJhbmsgc3ltYm9sIGFzIHRoZVxuICAgICAgICogZGlzYW1iaWd1YXRvclxuICAgICAgICovXG4gICAgICByZXR1cm4gYWxnZWJyYWljKGZyb20pLmNoYXJBdCgxKVxuICAgIH0gZWxzZSB7XG4gICAgICAvKiBlbHNlIHVzZSB0aGUgZmlsZSBzeW1ib2wgKi9cbiAgICAgIHJldHVybiBhbGdlYnJhaWMoZnJvbSkuY2hhckF0KDApXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuICcnXG59XG5cbmZ1bmN0aW9uIGluZmVyX3BpZWNlX3R5cGUoc2FuKSB7XG4gIHZhciBwaWVjZV90eXBlID0gc2FuLmNoYXJBdCgwKVxuICBpZiAocGllY2VfdHlwZSA+PSAnYScgJiYgcGllY2VfdHlwZSA8PSAnaCcpIHtcbiAgICB2YXIgbWF0Y2hlcyA9IHNhbi5tYXRjaCgvW2EtaF1cXGQuKlthLWhdXFxkLylcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICByZXR1cm4gUEFXTlxuICB9XG4gIHBpZWNlX3R5cGUgPSBwaWVjZV90eXBlLnRvTG93ZXJDYXNlKClcbiAgaWYgKHBpZWNlX3R5cGUgPT09ICdvJykge1xuICAgIHJldHVybiBLSU5HXG4gIH1cbiAgcmV0dXJuIHBpZWNlX3R5cGVcbn1cblxuLy8gcGFyc2VzIGFsbCBvZiB0aGUgZGVjb3JhdG9ycyBvdXQgb2YgYSBTQU4gc3RyaW5nXG5mdW5jdGlvbiBzdHJpcHBlZF9zYW4obW92ZSkge1xuICByZXR1cm4gbW92ZS5yZXBsYWNlKC89LywgJycpLnJlcGxhY2UoL1srI10/Wz8hXSokLywgJycpXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogVVRJTElUWSBGVU5DVElPTlNcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuZnVuY3Rpb24gcmFuayhpKSB7XG4gIHJldHVybiBpID4+IDRcbn1cblxuZnVuY3Rpb24gZmlsZShpKSB7XG4gIHJldHVybiBpICYgMTVcbn1cblxuZnVuY3Rpb24gYWxnZWJyYWljKGkpIHtcbiAgdmFyIGYgPSBmaWxlKGkpLFxuICAgIHIgPSByYW5rKGkpXG4gIHJldHVybiAnYWJjZGVmZ2gnLnN1YnN0cmluZyhmLCBmICsgMSkgKyAnODc2NTQzMjEnLnN1YnN0cmluZyhyLCByICsgMSlcbn1cblxuZnVuY3Rpb24gc3dhcF9jb2xvcihjKSB7XG4gIHJldHVybiBjID09PSBXSElURSA/IEJMQUNLIDogV0hJVEVcbn1cblxuZnVuY3Rpb24gaXNfZGlnaXQoYykge1xuICByZXR1cm4gJzAxMjM0NTY3ODknLmluZGV4T2YoYykgIT09IC0xXG59XG5cbmZ1bmN0aW9uIGNsb25lKG9iaikge1xuICB2YXIgZHVwZSA9IG9iaiBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB7fVxuXG4gIGZvciAodmFyIHByb3BlcnR5IGluIG9iaikge1xuICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT09ICdvYmplY3QnKSB7XG4gICAgICBkdXBlW3Byb3BlcnR5XSA9IGNsb25lKG9ialtwcm9wZXJ0eV0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGR1cGVbcHJvcGVydHldID0gb2JqW3Byb3BlcnR5XVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkdXBlXG59XG5cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIFBVQkxJQyBDT05TVEFOVFNcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuZXhwb3J0IGNvbnN0IEJMQUNLID0gJ2InXG5leHBvcnQgY29uc3QgV0hJVEUgPSAndydcblxuZXhwb3J0IGNvbnN0IEVNUFRZID0gLTFcblxuZXhwb3J0IGNvbnN0IFBBV04gPSAncCdcbmV4cG9ydCBjb25zdCBLTklHSFQgPSAnbidcbmV4cG9ydCBjb25zdCBCSVNIT1AgPSAnYidcbmV4cG9ydCBjb25zdCBST09LID0gJ3InXG5leHBvcnQgY29uc3QgUVVFRU4gPSAncSdcbmV4cG9ydCBjb25zdCBLSU5HID0gJ2snXG5cbmV4cG9ydCBjb25zdCBTUVVBUkVTID0gKGZ1bmN0aW9uICgpIHtcbiAgLyogZnJvbSB0aGUgRUNNQS0yNjIgc3BlYyAoc2VjdGlvbiAxMi42LjQpOlxuICAgKiBcIlRoZSBtZWNoYW5pY3Mgb2YgZW51bWVyYXRpbmcgdGhlIHByb3BlcnRpZXMgLi4uIGlzXG4gICAqIGltcGxlbWVudGF0aW9uIGRlcGVuZGVudFwiXG4gICAqIHNvOiBmb3IgKHZhciBzcSBpbiBTUVVBUkVTKSB7IGtleXMucHVzaChzcSk7IH0gbWlnaHQgbm90IGJlXG4gICAqIG9yZGVyZWQgY29ycmVjdGx5XG4gICAqL1xuICB2YXIga2V5cyA9IFtdXG4gIGZvciAodmFyIGkgPSBTUVVBUkVfTUFQLmE4OyBpIDw9IFNRVUFSRV9NQVAuaDE7IGkrKykge1xuICAgIGlmIChpICYgMHg4OCkge1xuICAgICAgaSArPSA3XG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBrZXlzLnB1c2goYWxnZWJyYWljKGkpKVxuICB9XG4gIHJldHVybiBrZXlzXG59KSgpXG5cbmV4cG9ydCBjb25zdCBGTEFHUyA9IHtcbiAgTk9STUFMOiAnbicsXG4gIENBUFRVUkU6ICdjJyxcbiAgQklHX1BBV046ICdiJyxcbiAgRVBfQ0FQVFVSRTogJ2UnLFxuICBQUk9NT1RJT046ICdwJyxcbiAgS1NJREVfQ0FTVExFOiAnaycsXG4gIFFTSURFX0NBU1RMRTogJ3EnLFxufVxuXG5leHBvcnQgY29uc3QgQ2hlc3MgPSBmdW5jdGlvbiAoZmVuKSB7XG4gIHZhciBib2FyZCA9IG5ldyBBcnJheSgxMjgpXG4gIHZhciBraW5ncyA9IHsgdzogRU1QVFksIGI6IEVNUFRZIH1cbiAgdmFyIHR1cm4gPSBXSElURVxuICB2YXIgY2FzdGxpbmcgPSB7IHc6IDAsIGI6IDAgfVxuICB2YXIgZXBfc3F1YXJlID0gRU1QVFlcbiAgdmFyIGhhbGZfbW92ZXMgPSAwXG4gIHZhciBtb3ZlX251bWJlciA9IDFcbiAgdmFyIGhpc3RvcnkgPSBbXVxuICB2YXIgaGVhZGVyID0ge31cbiAgdmFyIGNvbW1lbnRzID0ge31cblxuICAvKiBpZiB0aGUgdXNlciBwYXNzZXMgaW4gYSBmZW4gc3RyaW5nLCBsb2FkIGl0LCBlbHNlIGRlZmF1bHQgdG9cbiAgICogc3RhcnRpbmcgcG9zaXRpb25cbiAgICovXG4gIGlmICh0eXBlb2YgZmVuID09PSAndW5kZWZpbmVkJykge1xuICAgIGxvYWQoREVGQVVMVF9QT1NJVElPTilcbiAgfSBlbHNlIHtcbiAgICBsb2FkKGZlbilcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyKGtlZXBfaGVhZGVycykge1xuICAgIGlmICh0eXBlb2Yga2VlcF9oZWFkZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAga2VlcF9oZWFkZXJzID0gZmFsc2VcbiAgICB9XG5cbiAgICBib2FyZCA9IG5ldyBBcnJheSgxMjgpXG4gICAga2luZ3MgPSB7IHc6IEVNUFRZLCBiOiBFTVBUWSB9XG4gICAgdHVybiA9IFdISVRFXG4gICAgY2FzdGxpbmcgPSB7IHc6IDAsIGI6IDAgfVxuICAgIGVwX3NxdWFyZSA9IEVNUFRZXG4gICAgaGFsZl9tb3ZlcyA9IDBcbiAgICBtb3ZlX251bWJlciA9IDFcbiAgICBoaXN0b3J5ID0gW11cbiAgICBpZiAoIWtlZXBfaGVhZGVycykgaGVhZGVyID0ge31cbiAgICBjb21tZW50cyA9IHt9XG4gICAgdXBkYXRlX3NldHVwKGdlbmVyYXRlX2ZlbigpKVxuICB9XG5cbiAgZnVuY3Rpb24gcHJ1bmVfY29tbWVudHMoKSB7XG4gICAgdmFyIHJldmVyc2VkX2hpc3RvcnkgPSBbXVxuICAgIHZhciBjdXJyZW50X2NvbW1lbnRzID0ge31cbiAgICB2YXIgY29weV9jb21tZW50ID0gZnVuY3Rpb24gKGZlbikge1xuICAgICAgaWYgKGZlbiBpbiBjb21tZW50cykge1xuICAgICAgICBjdXJyZW50X2NvbW1lbnRzW2Zlbl0gPSBjb21tZW50c1tmZW5dXG4gICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChoaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHJldmVyc2VkX2hpc3RvcnkucHVzaCh1bmRvX21vdmUoKSlcbiAgICB9XG4gICAgY29weV9jb21tZW50KGdlbmVyYXRlX2ZlbigpKVxuICAgIHdoaWxlIChyZXZlcnNlZF9oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgIG1ha2VfbW92ZShyZXZlcnNlZF9oaXN0b3J5LnBvcCgpKVxuICAgICAgY29weV9jb21tZW50KGdlbmVyYXRlX2ZlbigpKVxuICAgIH1cbiAgICBjb21tZW50cyA9IGN1cnJlbnRfY29tbWVudHNcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGxvYWQoREVGQVVMVF9QT1NJVElPTilcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWQoZmVuLCBrZWVwX2hlYWRlcnMpIHtcbiAgICBpZiAodHlwZW9mIGtlZXBfaGVhZGVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGtlZXBfaGVhZGVycyA9IGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIHRva2VucyA9IGZlbi5zcGxpdCgvXFxzKy8pXG4gICAgdmFyIHBvc2l0aW9uID0gdG9rZW5zWzBdXG4gICAgdmFyIHNxdWFyZSA9IDBcblxuICAgIGlmICghdmFsaWRhdGVfZmVuKGZlbikudmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNsZWFyKGtlZXBfaGVhZGVycylcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zaXRpb24ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwaWVjZSA9IHBvc2l0aW9uLmNoYXJBdChpKVxuXG4gICAgICBpZiAocGllY2UgPT09ICcvJykge1xuICAgICAgICBzcXVhcmUgKz0gOFxuICAgICAgfSBlbHNlIGlmIChpc19kaWdpdChwaWVjZSkpIHtcbiAgICAgICAgc3F1YXJlICs9IHBhcnNlSW50KHBpZWNlLCAxMClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjb2xvciA9IHBpZWNlIDwgJ2EnID8gV0hJVEUgOiBCTEFDS1xuICAgICAgICBwdXQoeyB0eXBlOiBwaWVjZS50b0xvd2VyQ2FzZSgpLCBjb2xvcjogY29sb3IgfSwgYWxnZWJyYWljKHNxdWFyZSkpXG4gICAgICAgIHNxdWFyZSsrXG4gICAgICB9XG4gICAgfVxuXG4gICAgdHVybiA9IHRva2Vuc1sxXVxuXG4gICAgaWYgKHRva2Vuc1syXS5pbmRleE9mKCdLJykgPiAtMSkge1xuICAgICAgY2FzdGxpbmcudyB8PSBCSVRTLktTSURFX0NBU1RMRVxuICAgIH1cbiAgICBpZiAodG9rZW5zWzJdLmluZGV4T2YoJ1EnKSA+IC0xKSB7XG4gICAgICBjYXN0bGluZy53IHw9IEJJVFMuUVNJREVfQ0FTVExFXG4gICAgfVxuICAgIGlmICh0b2tlbnNbMl0uaW5kZXhPZignaycpID4gLTEpIHtcbiAgICAgIGNhc3RsaW5nLmIgfD0gQklUUy5LU0lERV9DQVNUTEVcbiAgICB9XG4gICAgaWYgKHRva2Vuc1syXS5pbmRleE9mKCdxJykgPiAtMSkge1xuICAgICAgY2FzdGxpbmcuYiB8PSBCSVRTLlFTSURFX0NBU1RMRVxuICAgIH1cblxuICAgIGVwX3NxdWFyZSA9IHRva2Vuc1szXSA9PT0gJy0nID8gRU1QVFkgOiBTUVVBUkVfTUFQW3Rva2Vuc1szXV1cbiAgICBoYWxmX21vdmVzID0gcGFyc2VJbnQodG9rZW5zWzRdLCAxMClcbiAgICBtb3ZlX251bWJlciA9IHBhcnNlSW50KHRva2Vuc1s1XSwgMTApXG5cbiAgICB1cGRhdGVfc2V0dXAoZ2VuZXJhdGVfZmVuKCkpXG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyogVE9ETzogdGhpcyBmdW5jdGlvbiBpcyBwcmV0dHkgbXVjaCBjcmFwIC0gaXQgdmFsaWRhdGVzIHN0cnVjdHVyZSBidXRcbiAgICogY29tcGxldGVseSBpZ25vcmVzIGNvbnRlbnQgKGUuZy4gZG9lc24ndCB2ZXJpZnkgdGhhdCBlYWNoIHNpZGUgaGFzIGEga2luZylcbiAgICogLi4uIHdlIHNob3VsZCByZXdyaXRlIHRoaXMsIGFuZCBkaXRjaCB0aGUgc2lsbHkgZXJyb3JfbnVtYmVyIGZpZWxkIHdoaWxlXG4gICAqIHdlJ3JlIGF0IGl0XG4gICAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZV9mZW4oZmVuKSB7XG4gICAgdmFyIGVycm9ycyA9IHtcbiAgICAgIDA6ICdObyBlcnJvcnMuJyxcbiAgICAgIDE6ICdGRU4gc3RyaW5nIG11c3QgY29udGFpbiBzaXggc3BhY2UtZGVsaW1pdGVkIGZpZWxkcy4nLFxuICAgICAgMjogJzZ0aCBmaWVsZCAobW92ZSBudW1iZXIpIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLicsXG4gICAgICAzOiAnNXRoIGZpZWxkIChoYWxmIG1vdmUgY291bnRlcikgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLicsXG4gICAgICA0OiAnNHRoIGZpZWxkIChlbi1wYXNzYW50IHNxdWFyZSkgaXMgaW52YWxpZC4nLFxuICAgICAgNTogJzNyZCBmaWVsZCAoY2FzdGxpbmcgYXZhaWxhYmlsaXR5KSBpcyBpbnZhbGlkLicsXG4gICAgICA2OiAnMm5kIGZpZWxkIChzaWRlIHRvIG1vdmUpIGlzIGludmFsaWQuJyxcbiAgICAgIDc6IFwiMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGRvZXMgbm90IGNvbnRhaW4gOCAnLyctZGVsaW1pdGVkIHJvd3MuXCIsXG4gICAgICA4OiAnMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGlzIGludmFsaWQgW2NvbnNlY3V0aXZlIG51bWJlcnNdLicsXG4gICAgICA5OiAnMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGlzIGludmFsaWQgW2ludmFsaWQgcGllY2VdLicsXG4gICAgICAxMDogJzFzdCBmaWVsZCAocGllY2UgcG9zaXRpb25zKSBpcyBpbnZhbGlkIFtyb3cgdG9vIGxhcmdlXS4nLFxuICAgICAgMTE6ICdJbGxlZ2FsIGVuLXBhc3NhbnQgc3F1YXJlJyxcbiAgICB9XG5cbiAgICAvKiAxc3QgY3JpdGVyaW9uOiA2IHNwYWNlLXNlcGVyYXRlZCBmaWVsZHM/ICovXG4gICAgdmFyIHRva2VucyA9IGZlbi5zcGxpdCgvXFxzKy8pXG4gICAgaWYgKHRva2Vucy5sZW5ndGggIT09IDYpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAxLCBlcnJvcjogZXJyb3JzWzFdIH1cbiAgICB9XG5cbiAgICAvKiAybmQgY3JpdGVyaW9uOiBtb3ZlIG51bWJlciBmaWVsZCBpcyBhIGludGVnZXIgdmFsdWUgPiAwPyAqL1xuICAgIGlmIChpc05hTih0b2tlbnNbNV0pIHx8IHBhcnNlSW50KHRva2Vuc1s1XSwgMTApIDw9IDApIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAyLCBlcnJvcjogZXJyb3JzWzJdIH1cbiAgICB9XG5cbiAgICAvKiAzcmQgY3JpdGVyaW9uOiBoYWxmIG1vdmUgY291bnRlciBpcyBhbiBpbnRlZ2VyID49IDA/ICovXG4gICAgaWYgKGlzTmFOKHRva2Vuc1s0XSkgfHwgcGFyc2VJbnQodG9rZW5zWzRdLCAxMCkgPCAwKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogMywgZXJyb3I6IGVycm9yc1szXSB9XG4gICAgfVxuXG4gICAgLyogNHRoIGNyaXRlcmlvbjogNHRoIGZpZWxkIGlzIGEgdmFsaWQgZS5wLi1zdHJpbmc/ICovXG4gICAgaWYgKCEvXigtfFthYmNkZWZnaF1bMzZdKSQvLnRlc3QodG9rZW5zWzNdKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcl9udW1iZXI6IDQsIGVycm9yOiBlcnJvcnNbNF0gfVxuICAgIH1cblxuICAgIC8qIDV0aCBjcml0ZXJpb246IDN0aCBmaWVsZCBpcyBhIHZhbGlkIGNhc3RsZS1zdHJpbmc/ICovXG4gICAgaWYgKCEvXihLUT9rP3E/fFFrP3E/fGtxP3xxfC0pJC8udGVzdCh0b2tlbnNbMl0pKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogNSwgZXJyb3I6IGVycm9yc1s1XSB9XG4gICAgfVxuXG4gICAgLyogNnRoIGNyaXRlcmlvbjogMm5kIGZpZWxkIGlzIFwid1wiICh3aGl0ZSkgb3IgXCJiXCIgKGJsYWNrKT8gKi9cbiAgICBpZiAoIS9eKHd8YikkLy50ZXN0KHRva2Vuc1sxXSkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiA2LCBlcnJvcjogZXJyb3JzWzZdIH1cbiAgICB9XG5cbiAgICAvKiA3dGggY3JpdGVyaW9uOiAxc3QgZmllbGQgY29udGFpbnMgOCByb3dzPyAqL1xuICAgIHZhciByb3dzID0gdG9rZW5zWzBdLnNwbGl0KCcvJylcbiAgICBpZiAocm93cy5sZW5ndGggIT09IDgpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiA3LCBlcnJvcjogZXJyb3JzWzddIH1cbiAgICB9XG5cbiAgICAvKiA4dGggY3JpdGVyaW9uOiBldmVyeSByb3cgaXMgdmFsaWQ/ICovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvKiBjaGVjayBmb3IgcmlnaHQgc3VtIG9mIGZpZWxkcyBBTkQgbm90IHR3byBudW1iZXJzIGluIHN1Y2Nlc3Npb24gKi9cbiAgICAgIHZhciBzdW1fZmllbGRzID0gMFxuICAgICAgdmFyIHByZXZpb3VzX3dhc19udW1iZXIgPSBmYWxzZVxuXG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHJvd3NbaV0ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgaWYgKCFpc05hTihyb3dzW2ldW2tdKSkge1xuICAgICAgICAgIGlmIChwcmV2aW91c193YXNfbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogOCwgZXJyb3I6IGVycm9yc1s4XSB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1bV9maWVsZHMgKz0gcGFyc2VJbnQocm93c1tpXVtrXSwgMTApXG4gICAgICAgICAgcHJldmlvdXNfd2FzX251bWJlciA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIS9eW3BybmJxa1BSTkJRS10kLy50ZXN0KHJvd3NbaV1ba10pKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogOSwgZXJyb3I6IGVycm9yc1s5XSB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1bV9maWVsZHMgKz0gMVxuICAgICAgICAgIHByZXZpb3VzX3dhc19udW1iZXIgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VtX2ZpZWxkcyAhPT0gOCkge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogMTAsIGVycm9yOiBlcnJvcnNbMTBdIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAodG9rZW5zWzNdWzFdID09ICczJyAmJiB0b2tlbnNbMV0gPT0gJ3cnKSB8fFxuICAgICAgKHRva2Vuc1szXVsxXSA9PSAnNicgJiYgdG9rZW5zWzFdID09ICdiJylcbiAgICApIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAxMSwgZXJyb3I6IGVycm9yc1sxMV0gfVxuICAgIH1cblxuICAgIC8qIGV2ZXJ5dGhpbmcncyBva2F5ISAqL1xuICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBlcnJvcl9udW1iZXI6IDAsIGVycm9yOiBlcnJvcnNbMF0gfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVfZmVuKCkge1xuICAgIHZhciBlbXB0eSA9IDBcbiAgICB2YXIgZmVuID0gJydcblxuICAgIGZvciAodmFyIGkgPSBTUVVBUkVfTUFQLmE4OyBpIDw9IFNRVUFSRV9NQVAuaDE7IGkrKykge1xuICAgICAgaWYgKGJvYXJkW2ldID09IG51bGwpIHtcbiAgICAgICAgZW1wdHkrK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVtcHR5ID4gMCkge1xuICAgICAgICAgIGZlbiArPSBlbXB0eVxuICAgICAgICAgIGVtcHR5ID0gMFxuICAgICAgICB9XG4gICAgICAgIHZhciBjb2xvciA9IGJvYXJkW2ldLmNvbG9yXG4gICAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldLnR5cGVcblxuICAgICAgICBmZW4gKz0gY29sb3IgPT09IFdISVRFID8gcGllY2UudG9VcHBlckNhc2UoKSA6IHBpZWNlLnRvTG93ZXJDYXNlKClcbiAgICAgIH1cblxuICAgICAgaWYgKChpICsgMSkgJiAweDg4KSB7XG4gICAgICAgIGlmIChlbXB0eSA+IDApIHtcbiAgICAgICAgICBmZW4gKz0gZW1wdHlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpICE9PSBTUVVBUkVfTUFQLmgxKSB7XG4gICAgICAgICAgZmVuICs9ICcvJ1xuICAgICAgICB9XG5cbiAgICAgICAgZW1wdHkgPSAwXG4gICAgICAgIGkgKz0gOFxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjZmxhZ3MgPSAnJ1xuICAgIGlmIChjYXN0bGluZ1tXSElURV0gJiBCSVRTLktTSURFX0NBU1RMRSkge1xuICAgICAgY2ZsYWdzICs9ICdLJ1xuICAgIH1cbiAgICBpZiAoY2FzdGxpbmdbV0hJVEVdICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgIGNmbGFncyArPSAnUSdcbiAgICB9XG4gICAgaWYgKGNhc3RsaW5nW0JMQUNLXSAmIEJJVFMuS1NJREVfQ0FTVExFKSB7XG4gICAgICBjZmxhZ3MgKz0gJ2snXG4gICAgfVxuICAgIGlmIChjYXN0bGluZ1tCTEFDS10gJiBCSVRTLlFTSURFX0NBU1RMRSkge1xuICAgICAgY2ZsYWdzICs9ICdxJ1xuICAgIH1cblxuICAgIC8qIGRvIHdlIGhhdmUgYW4gZW1wdHkgY2FzdGxpbmcgZmxhZz8gKi9cbiAgICBjZmxhZ3MgPSBjZmxhZ3MgfHwgJy0nXG4gICAgdmFyIGVwZmxhZ3MgPSBlcF9zcXVhcmUgPT09IEVNUFRZID8gJy0nIDogYWxnZWJyYWljKGVwX3NxdWFyZSlcblxuICAgIHJldHVybiBbZmVuLCB0dXJuLCBjZmxhZ3MsIGVwZmxhZ3MsIGhhbGZfbW92ZXMsIG1vdmVfbnVtYmVyXS5qb2luKCcgJylcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldF9oZWFkZXIoYXJncykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgaWYgKHR5cGVvZiBhcmdzW2ldID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYXJnc1tpICsgMV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGhlYWRlclthcmdzW2ldXSA9IGFyZ3NbaSArIDFdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoZWFkZXJcbiAgfVxuXG4gIC8qIGNhbGxlZCB3aGVuIHRoZSBpbml0aWFsIGJvYXJkIHNldHVwIGlzIGNoYW5nZWQgd2l0aCBwdXQoKSBvciByZW1vdmUoKS5cbiAgICogbW9kaWZpZXMgdGhlIFNldFVwIGFuZCBGRU4gcHJvcGVydGllcyBvZiB0aGUgaGVhZGVyIG9iamVjdC4gIGlmIHRoZSBGRU4gaXNcbiAgICogZXF1YWwgdG8gdGhlIGRlZmF1bHQgcG9zaXRpb24sIHRoZSBTZXRVcCBhbmQgRkVOIGFyZSBkZWxldGVkXG4gICAqIHRoZSBzZXR1cCBpcyBvbmx5IHVwZGF0ZWQgaWYgaGlzdG9yeS5sZW5ndGggaXMgemVybywgaWUgbW92ZXMgaGF2ZW4ndCBiZWVuXG4gICAqIG1hZGUuXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVfc2V0dXAoZmVuKSB7XG4gICAgaWYgKGhpc3RvcnkubGVuZ3RoID4gMCkgcmV0dXJuXG5cbiAgICBpZiAoZmVuICE9PSBERUZBVUxUX1BPU0lUSU9OKSB7XG4gICAgICBoZWFkZXJbJ1NldFVwJ10gPSAnMSdcbiAgICAgIGhlYWRlclsnRkVOJ10gPSBmZW5cbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIGhlYWRlclsnU2V0VXAnXVxuICAgICAgZGVsZXRlIGhlYWRlclsnRkVOJ11cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXQoc3F1YXJlKSB7XG4gICAgdmFyIHBpZWNlID0gYm9hcmRbU1FVQVJFX01BUFtzcXVhcmVdXVxuICAgIHJldHVybiBwaWVjZSA/IHsgdHlwZTogcGllY2UudHlwZSwgY29sb3I6IHBpZWNlLmNvbG9yIH0gOiBudWxsXG4gIH1cblxuICBmdW5jdGlvbiBwdXQocGllY2UsIHNxdWFyZSkge1xuICAgIC8qIGNoZWNrIGZvciB2YWxpZCBwaWVjZSBvYmplY3QgKi9cbiAgICBpZiAoISgndHlwZScgaW4gcGllY2UgJiYgJ2NvbG9yJyBpbiBwaWVjZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8qIGNoZWNrIGZvciBwaWVjZSAqL1xuICAgIGlmIChTWU1CT0xTLmluZGV4T2YocGllY2UudHlwZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8qIGNoZWNrIGZvciB2YWxpZCBzcXVhcmUgKi9cbiAgICBpZiAoIShzcXVhcmUgaW4gU1FVQVJFX01BUCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHZhciBzcSA9IFNRVUFSRV9NQVBbc3F1YXJlXVxuXG4gICAgLyogZG9uJ3QgbGV0IHRoZSB1c2VyIHBsYWNlIG1vcmUgdGhhbiBvbmUga2luZyAqL1xuICAgIGlmIChcbiAgICAgIHBpZWNlLnR5cGUgPT0gS0lORyAmJlxuICAgICAgIShraW5nc1twaWVjZS5jb2xvcl0gPT0gRU1QVFkgfHwga2luZ3NbcGllY2UuY29sb3JdID09IHNxKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgYm9hcmRbc3FdID0geyB0eXBlOiBwaWVjZS50eXBlLCBjb2xvcjogcGllY2UuY29sb3IgfVxuICAgIGlmIChwaWVjZS50eXBlID09PSBLSU5HKSB7XG4gICAgICBraW5nc1twaWVjZS5jb2xvcl0gPSBzcVxuICAgIH1cblxuICAgIHVwZGF0ZV9zZXR1cChnZW5lcmF0ZV9mZW4oKSlcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUoc3F1YXJlKSB7XG4gICAgdmFyIHBpZWNlID0gZ2V0KHNxdWFyZSlcbiAgICBib2FyZFtTUVVBUkVfTUFQW3NxdWFyZV1dID0gbnVsbFxuICAgIGlmIChwaWVjZSAmJiBwaWVjZS50eXBlID09PSBLSU5HKSB7XG4gICAgICBraW5nc1twaWVjZS5jb2xvcl0gPSBFTVBUWVxuICAgIH1cblxuICAgIHVwZGF0ZV9zZXR1cChnZW5lcmF0ZV9mZW4oKSlcblxuICAgIHJldHVybiBwaWVjZVxuICB9XG5cbiAgZnVuY3Rpb24gYnVpbGRfbW92ZShib2FyZCwgZnJvbSwgdG8sIGZsYWdzLCBwcm9tb3Rpb24pIHtcbiAgICB2YXIgbW92ZSA9IHtcbiAgICAgIGNvbG9yOiB0dXJuLFxuICAgICAgZnJvbTogZnJvbSxcbiAgICAgIHRvOiB0byxcbiAgICAgIGZsYWdzOiBmbGFncyxcbiAgICAgIHBpZWNlOiBib2FyZFtmcm9tXS50eXBlLFxuICAgIH1cblxuICAgIGlmIChwcm9tb3Rpb24pIHtcbiAgICAgIG1vdmUuZmxhZ3MgfD0gQklUUy5QUk9NT1RJT05cbiAgICAgIG1vdmUucHJvbW90aW9uID0gcHJvbW90aW9uXG4gICAgfVxuXG4gICAgaWYgKGJvYXJkW3RvXSkge1xuICAgICAgbW92ZS5jYXB0dXJlZCA9IGJvYXJkW3RvXS50eXBlXG4gICAgfSBlbHNlIGlmIChmbGFncyAmIEJJVFMuRVBfQ0FQVFVSRSkge1xuICAgICAgbW92ZS5jYXB0dXJlZCA9IFBBV05cbiAgICB9XG4gICAgcmV0dXJuIG1vdmVcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlX21vdmVzKG9wdGlvbnMpIHtcbiAgICBmdW5jdGlvbiBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGZyb20sIHRvLCBmbGFncykge1xuICAgICAgLyogaWYgcGF3biBwcm9tb3Rpb24gKi9cbiAgICAgIGlmIChcbiAgICAgICAgYm9hcmRbZnJvbV0udHlwZSA9PT0gUEFXTiAmJlxuICAgICAgICAocmFuayh0bykgPT09IFJBTktfOCB8fCByYW5rKHRvKSA9PT0gUkFOS18xKVxuICAgICAgKSB7XG4gICAgICAgIHZhciBwaWVjZXMgPSBbUVVFRU4sIFJPT0ssIEJJU0hPUCwgS05JR0hUXVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGllY2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgbW92ZXMucHVzaChidWlsZF9tb3ZlKGJvYXJkLCBmcm9tLCB0bywgZmxhZ3MsIHBpZWNlc1tpXSkpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1vdmVzLnB1c2goYnVpbGRfbW92ZShib2FyZCwgZnJvbSwgdG8sIGZsYWdzKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbW92ZXMgPSBbXVxuICAgIHZhciB1cyA9IHR1cm5cbiAgICB2YXIgdGhlbSA9IHN3YXBfY29sb3IodXMpXG4gICAgdmFyIHNlY29uZF9yYW5rID0geyBiOiBSQU5LXzcsIHc6IFJBTktfMiB9XG5cbiAgICB2YXIgZmlyc3Rfc3EgPSBTUVVBUkVfTUFQLmE4XG4gICAgdmFyIGxhc3Rfc3EgPSBTUVVBUkVfTUFQLmgxXG4gICAgdmFyIHNpbmdsZV9zcXVhcmUgPSBmYWxzZVxuXG4gICAgLyogZG8gd2Ugd2FudCBsZWdhbCBtb3Zlcz8gKi9cbiAgICB2YXIgbGVnYWwgPVxuICAgICAgdHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdsZWdhbCcgaW4gb3B0aW9uc1xuICAgICAgICA/IG9wdGlvbnMubGVnYWxcbiAgICAgICAgOiB0cnVlXG5cbiAgICB2YXIgcGllY2VfdHlwZSA9XG4gICAgICB0eXBlb2Ygb3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICdwaWVjZScgaW4gb3B0aW9ucyAmJlxuICAgICAgdHlwZW9mIG9wdGlvbnMucGllY2UgPT09ICdzdHJpbmcnXG4gICAgICAgID8gb3B0aW9ucy5waWVjZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIDogdHJ1ZVxuXG4gICAgLyogYXJlIHdlIGdlbmVyYXRpbmcgbW92ZXMgZm9yIGEgc2luZ2xlIHNxdWFyZT8gKi9cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdzcXVhcmUnIGluIG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zLnNxdWFyZSBpbiBTUVVBUkVfTUFQKSB7XG4gICAgICAgIGZpcnN0X3NxID0gbGFzdF9zcSA9IFNRVUFSRV9NQVBbb3B0aW9ucy5zcXVhcmVdXG4gICAgICAgIHNpbmdsZV9zcXVhcmUgPSB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBpbnZhbGlkIHNxdWFyZSAqL1xuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gZmlyc3Rfc3E7IGkgPD0gbGFzdF9zcTsgaSsrKSB7XG4gICAgICAvKiBkaWQgd2UgcnVuIG9mZiB0aGUgZW5kIG9mIHRoZSBib2FyZCAqL1xuICAgICAgaWYgKGkgJiAweDg4KSB7XG4gICAgICAgIGkgKz0gN1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgcGllY2UgPSBib2FyZFtpXVxuICAgICAgaWYgKHBpZWNlID09IG51bGwgfHwgcGllY2UuY29sb3IgIT09IHVzKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChwaWVjZS50eXBlID09PSBQQVdOICYmIChwaWVjZV90eXBlID09PSB0cnVlIHx8IHBpZWNlX3R5cGUgPT09IFBBV04pKSB7XG4gICAgICAgIC8qIHNpbmdsZSBzcXVhcmUsIG5vbi1jYXB0dXJpbmcgKi9cbiAgICAgICAgdmFyIHNxdWFyZSA9IGkgKyBQQVdOX09GRlNFVFNbdXNdWzBdXG4gICAgICAgIGlmIChib2FyZFtzcXVhcmVdID09IG51bGwpIHtcbiAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5OT1JNQUwpXG5cbiAgICAgICAgICAvKiBkb3VibGUgc3F1YXJlICovXG4gICAgICAgICAgdmFyIHNxdWFyZSA9IGkgKyBQQVdOX09GRlNFVFNbdXNdWzFdXG4gICAgICAgICAgaWYgKHNlY29uZF9yYW5rW3VzXSA9PT0gcmFuayhpKSAmJiBib2FyZFtzcXVhcmVdID09IG51bGwpIHtcbiAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgaSwgc3F1YXJlLCBCSVRTLkJJR19QQVdOKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHBhd24gY2FwdHVyZXMgKi9cbiAgICAgICAgZm9yIChqID0gMjsgaiA8IDQ7IGorKykge1xuICAgICAgICAgIHZhciBzcXVhcmUgPSBpICsgUEFXTl9PRkZTRVRTW3VzXVtqXVxuICAgICAgICAgIGlmIChzcXVhcmUgJiAweDg4KSBjb250aW51ZVxuXG4gICAgICAgICAgaWYgKGJvYXJkW3NxdWFyZV0gIT0gbnVsbCAmJiBib2FyZFtzcXVhcmVdLmNvbG9yID09PSB0aGVtKSB7XG4gICAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5DQVBUVVJFKVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3F1YXJlID09PSBlcF9zcXVhcmUpIHtcbiAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgaSwgZXBfc3F1YXJlLCBCSVRTLkVQX0NBUFRVUkUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBpZWNlX3R5cGUgPT09IHRydWUgfHwgcGllY2VfdHlwZSA9PT0gcGllY2UudHlwZSkge1xuICAgICAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gUElFQ0VfT0ZGU0VUU1twaWVjZS50eXBlXS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgIHZhciBvZmZzZXQgPSBQSUVDRV9PRkZTRVRTW3BpZWNlLnR5cGVdW2pdXG4gICAgICAgICAgdmFyIHNxdWFyZSA9IGlcblxuICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBzcXVhcmUgKz0gb2Zmc2V0XG4gICAgICAgICAgICBpZiAoc3F1YXJlICYgMHg4OCkgYnJlYWtcblxuICAgICAgICAgICAgaWYgKGJvYXJkW3NxdWFyZV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5OT1JNQUwpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoYm9hcmRbc3F1YXJlXS5jb2xvciA9PT0gdXMpIGJyZWFrXG4gICAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgaSwgc3F1YXJlLCBCSVRTLkNBUFRVUkUpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGJyZWFrLCBpZiBrbmlnaHQgb3Iga2luZyAqL1xuICAgICAgICAgICAgaWYgKHBpZWNlLnR5cGUgPT09ICduJyB8fCBwaWVjZS50eXBlID09PSAnaycpIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogY2hlY2sgZm9yIGNhc3RsaW5nIGlmOiBhKSB3ZSdyZSBnZW5lcmF0aW5nIGFsbCBtb3Zlcywgb3IgYikgd2UncmUgZG9pbmdcbiAgICAgKiBzaW5nbGUgc3F1YXJlIG1vdmUgZ2VuZXJhdGlvbiBvbiB0aGUga2luZydzIHNxdWFyZVxuICAgICAqL1xuICAgIGlmIChwaWVjZV90eXBlID09PSB0cnVlIHx8IHBpZWNlX3R5cGUgPT09IEtJTkcpIHtcbiAgICAgIGlmICghc2luZ2xlX3NxdWFyZSB8fCBsYXN0X3NxID09PSBraW5nc1t1c10pIHtcbiAgICAgICAgLyoga2luZy1zaWRlIGNhc3RsaW5nICovXG4gICAgICAgIGlmIChjYXN0bGluZ1t1c10gJiBCSVRTLktTSURFX0NBU1RMRSkge1xuICAgICAgICAgIHZhciBjYXN0bGluZ19mcm9tID0ga2luZ3NbdXNdXG4gICAgICAgICAgdmFyIGNhc3RsaW5nX3RvID0gY2FzdGxpbmdfZnJvbSArIDJcblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb20gKyAxXSA9PSBudWxsICYmXG4gICAgICAgICAgICBib2FyZFtjYXN0bGluZ190b10gPT0gbnVsbCAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGtpbmdzW3VzXSkgJiZcbiAgICAgICAgICAgICFhdHRhY2tlZCh0aGVtLCBjYXN0bGluZ19mcm9tICsgMSkgJiZcbiAgICAgICAgICAgICFhdHRhY2tlZCh0aGVtLCBjYXN0bGluZ190bylcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3Zlcywga2luZ3NbdXNdLCBjYXN0bGluZ190bywgQklUUy5LU0lERV9DQVNUTEUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogcXVlZW4tc2lkZSBjYXN0bGluZyAqL1xuICAgICAgICBpZiAoY2FzdGxpbmdbdXNdICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgICAgICB2YXIgY2FzdGxpbmdfZnJvbSA9IGtpbmdzW3VzXVxuICAgICAgICAgIHZhciBjYXN0bGluZ190byA9IGNhc3RsaW5nX2Zyb20gLSAyXG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBib2FyZFtjYXN0bGluZ19mcm9tIC0gMV0gPT0gbnVsbCAmJlxuICAgICAgICAgICAgYm9hcmRbY2FzdGxpbmdfZnJvbSAtIDJdID09IG51bGwgJiZcbiAgICAgICAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb20gLSAzXSA9PSBudWxsICYmXG4gICAgICAgICAgICAhYXR0YWNrZWQodGhlbSwga2luZ3NbdXNdKSAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGNhc3RsaW5nX2Zyb20gLSAxKSAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGNhc3RsaW5nX3RvKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgYWRkX21vdmUoYm9hcmQsIG1vdmVzLCBraW5nc1t1c10sIGNhc3RsaW5nX3RvLCBCSVRTLlFTSURFX0NBU1RMRSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiByZXR1cm4gYWxsIHBzZXVkby1sZWdhbCBtb3ZlcyAodGhpcyBpbmNsdWRlcyBtb3ZlcyB0aGF0IGFsbG93IHRoZSBraW5nXG4gICAgICogdG8gYmUgY2FwdHVyZWQpXG4gICAgICovXG4gICAgaWYgKCFsZWdhbCkge1xuICAgICAgcmV0dXJuIG1vdmVzXG4gICAgfVxuXG4gICAgLyogZmlsdGVyIG91dCBpbGxlZ2FsIG1vdmVzICovXG4gICAgdmFyIGxlZ2FsX21vdmVzID0gW11cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbW92ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIG1ha2VfbW92ZShtb3Zlc1tpXSlcbiAgICAgIGlmICgha2luZ19hdHRhY2tlZCh1cykpIHtcbiAgICAgICAgbGVnYWxfbW92ZXMucHVzaChtb3Zlc1tpXSlcbiAgICAgIH1cbiAgICAgIHVuZG9fbW92ZSgpXG4gICAgfVxuXG4gICAgcmV0dXJuIGxlZ2FsX21vdmVzXG4gIH1cblxuICAvKiBjb252ZXJ0IGEgbW92ZSBmcm9tIDB4ODggY29vcmRpbmF0ZXMgdG8gU3RhbmRhcmQgQWxnZWJyYWljIE5vdGF0aW9uXG4gICAqIChTQU4pXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2xvcHB5IFVzZSB0aGUgc2xvcHB5IFNBTiBnZW5lcmF0b3IgdG8gd29yayBhcm91bmQgb3ZlclxuICAgKiBkaXNhbWJpZ3VhdGlvbiBidWdzIGluIEZyaXR6IGFuZCBDaGVzc2Jhc2UuICBTZWUgYmVsb3c6XG4gICAqXG4gICAqIHIxYnFrYm5yL3BwcDJwcHAvMm41LzFCMXBQMy80UDMvOC9QUFBQMlBQL1JOQlFLMU5SIGIgS1FrcSAtIDIgNFxuICAgKiA0LiAuLi4gTmdlNyBpcyBvdmVybHkgZGlzYW1iaWd1YXRlZCBiZWNhdXNlIHRoZSBrbmlnaHQgb24gYzYgaXMgcGlubmVkXG4gICAqIDQuIC4uLiBOZTcgaXMgdGVjaG5pY2FsbHkgdGhlIHZhbGlkIFNBTlxuICAgKi9cbiAgZnVuY3Rpb24gbW92ZV90b19zYW4obW92ZSwgbW92ZXMpIHtcbiAgICB2YXIgb3V0cHV0ID0gJydcblxuICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5LU0lERV9DQVNUTEUpIHtcbiAgICAgIG91dHB1dCA9ICdPLU8nXG4gICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgIG91dHB1dCA9ICdPLU8tTydcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1vdmUucGllY2UgIT09IFBBV04pIHtcbiAgICAgICAgdmFyIGRpc2FtYmlndWF0b3IgPSBnZXRfZGlzYW1iaWd1YXRvcihtb3ZlLCBtb3ZlcylcbiAgICAgICAgb3V0cHV0ICs9IG1vdmUucGllY2UudG9VcHBlckNhc2UoKSArIGRpc2FtYmlndWF0b3JcbiAgICAgIH1cblxuICAgICAgaWYgKG1vdmUuZmxhZ3MgJiAoQklUUy5DQVBUVVJFIHwgQklUUy5FUF9DQVBUVVJFKSkge1xuICAgICAgICBpZiAobW92ZS5waWVjZSA9PT0gUEFXTikge1xuICAgICAgICAgIG91dHB1dCArPSBhbGdlYnJhaWMobW92ZS5mcm9tKVswXVxuICAgICAgICB9XG4gICAgICAgIG91dHB1dCArPSAneCdcbiAgICAgIH1cblxuICAgICAgb3V0cHV0ICs9IGFsZ2VicmFpYyhtb3ZlLnRvKVxuXG4gICAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuUFJPTU9USU9OKSB7XG4gICAgICAgIG91dHB1dCArPSAnPScgKyBtb3ZlLnByb21vdGlvbi50b1VwcGVyQ2FzZSgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFrZV9tb3ZlKG1vdmUpXG4gICAgaWYgKGluX2NoZWNrKCkpIHtcbiAgICAgIGlmIChpbl9jaGVja21hdGUoKSkge1xuICAgICAgICBvdXRwdXQgKz0gJyMnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQgKz0gJysnXG4gICAgICB9XG4gICAgfVxuICAgIHVuZG9fbW92ZSgpXG5cbiAgICByZXR1cm4gb3V0cHV0XG4gIH1cblxuICBmdW5jdGlvbiBhdHRhY2tlZChjb2xvciwgc3F1YXJlKSB7XG4gICAgZm9yICh2YXIgaSA9IFNRVUFSRV9NQVAuYTg7IGkgPD0gU1FVQVJFX01BUC5oMTsgaSsrKSB7XG4gICAgICAvKiBkaWQgd2UgcnVuIG9mZiB0aGUgZW5kIG9mIHRoZSBib2FyZCAqL1xuICAgICAgaWYgKGkgJiAweDg4KSB7XG4gICAgICAgIGkgKz0gN1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvKiBpZiBlbXB0eSBzcXVhcmUgb3Igd3JvbmcgY29sb3IgKi9cbiAgICAgIGlmIChib2FyZFtpXSA9PSBudWxsIHx8IGJvYXJkW2ldLmNvbG9yICE9PSBjb2xvcikgY29udGludWVcblxuICAgICAgdmFyIHBpZWNlID0gYm9hcmRbaV1cbiAgICAgIHZhciBkaWZmZXJlbmNlID0gaSAtIHNxdWFyZVxuICAgICAgdmFyIGluZGV4ID0gZGlmZmVyZW5jZSArIDExOVxuXG4gICAgICBpZiAoQVRUQUNLU1tpbmRleF0gJiAoMSA8PCBTSElGVFNbcGllY2UudHlwZV0pKSB7XG4gICAgICAgIGlmIChwaWVjZS50eXBlID09PSBQQVdOKSB7XG4gICAgICAgICAgaWYgKGRpZmZlcmVuY2UgPiAwKSB7XG4gICAgICAgICAgICBpZiAocGllY2UuY29sb3IgPT09IFdISVRFKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocGllY2UuY29sb3IgPT09IEJMQUNLKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLyogaWYgdGhlIHBpZWNlIGlzIGEga25pZ2h0IG9yIGEga2luZyAqL1xuICAgICAgICBpZiAocGllY2UudHlwZSA9PT0gJ24nIHx8IHBpZWNlLnR5cGUgPT09ICdrJykgcmV0dXJuIHRydWVcblxuICAgICAgICB2YXIgb2Zmc2V0ID0gUkFZU1tpbmRleF1cbiAgICAgICAgdmFyIGogPSBpICsgb2Zmc2V0XG5cbiAgICAgICAgdmFyIGJsb2NrZWQgPSBmYWxzZVxuICAgICAgICB3aGlsZSAoaiAhPT0gc3F1YXJlKSB7XG4gICAgICAgICAgaWYgKGJvYXJkW2pdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGJsb2NrZWQgPSB0cnVlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgICBqICs9IG9mZnNldFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFibG9ja2VkKSByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgZnVuY3Rpb24ga2luZ19hdHRhY2tlZChjb2xvcikge1xuICAgIHJldHVybiBhdHRhY2tlZChzd2FwX2NvbG9yKGNvbG9yKSwga2luZ3NbY29sb3JdKVxuICB9XG5cbiAgZnVuY3Rpb24gaW5fY2hlY2soKSB7XG4gICAgcmV0dXJuIGtpbmdfYXR0YWNrZWQodHVybilcbiAgfVxuXG4gIGZ1bmN0aW9uIGluX2NoZWNrbWF0ZSgpIHtcbiAgICByZXR1cm4gaW5fY2hlY2soKSAmJiBnZW5lcmF0ZV9tb3ZlcygpLmxlbmd0aCA9PT0gMFxuICB9XG5cbiAgZnVuY3Rpb24gaW5fc3RhbGVtYXRlKCkge1xuICAgIHJldHVybiAhaW5fY2hlY2soKSAmJiBnZW5lcmF0ZV9tb3ZlcygpLmxlbmd0aCA9PT0gMFxuICB9XG5cbiAgZnVuY3Rpb24gaW5zdWZmaWNpZW50X21hdGVyaWFsKCkge1xuICAgIHZhciBwaWVjZXMgPSB7fVxuICAgIHZhciBiaXNob3BzID0gW11cbiAgICB2YXIgbnVtX3BpZWNlcyA9IDBcbiAgICB2YXIgc3FfY29sb3IgPSAwXG5cbiAgICBmb3IgKHZhciBpID0gU1FVQVJFX01BUC5hODsgaSA8PSBTUVVBUkVfTUFQLmgxOyBpKyspIHtcbiAgICAgIHNxX2NvbG9yID0gKHNxX2NvbG9yICsgMSkgJSAyXG4gICAgICBpZiAoaSAmIDB4ODgpIHtcbiAgICAgICAgaSArPSA3XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldXG4gICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgcGllY2VzW3BpZWNlLnR5cGVdID0gcGllY2UudHlwZSBpbiBwaWVjZXMgPyBwaWVjZXNbcGllY2UudHlwZV0gKyAxIDogMVxuICAgICAgICBpZiAocGllY2UudHlwZSA9PT0gQklTSE9QKSB7XG4gICAgICAgICAgYmlzaG9wcy5wdXNoKHNxX2NvbG9yKVxuICAgICAgICB9XG4gICAgICAgIG51bV9waWVjZXMrK1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qIGsgdnMuIGsgKi9cbiAgICBpZiAobnVtX3BpZWNlcyA9PT0gMikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgLyogayB2cy4ga24gLi4uLiBvciAuLi4uIGsgdnMuIGtiICovXG4gICAgICBudW1fcGllY2VzID09PSAzICYmXG4gICAgICAocGllY2VzW0JJU0hPUF0gPT09IDEgfHwgcGllY2VzW0tOSUdIVF0gPT09IDEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSBpZiAobnVtX3BpZWNlcyA9PT0gcGllY2VzW0JJU0hPUF0gKyAyKSB7XG4gICAgICAvKiBrYiB2cy4ga2Igd2hlcmUgYW55IG51bWJlciBvZiBiaXNob3BzIGFyZSBhbGwgb24gdGhlIHNhbWUgY29sb3IgKi9cbiAgICAgIHZhciBzdW0gPSAwXG4gICAgICB2YXIgbGVuID0gYmlzaG9wcy5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgc3VtICs9IGJpc2hvcHNbaV1cbiAgICAgIH1cbiAgICAgIGlmIChzdW0gPT09IDAgfHwgc3VtID09PSBsZW4pIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIGluX3RocmVlZm9sZF9yZXBldGl0aW9uKCkge1xuICAgIC8qIFRPRE86IHdoaWxlIHRoaXMgZnVuY3Rpb24gaXMgZmluZSBmb3IgY2FzdWFsIHVzZSwgYSBiZXR0ZXJcbiAgICAgKiBpbXBsZW1lbnRhdGlvbiB3b3VsZCB1c2UgYSBab2JyaXN0IGtleSAoaW5zdGVhZCBvZiBGRU4pLiB0aGVcbiAgICAgKiBab2JyaXN0IGtleSB3b3VsZCBiZSBtYWludGFpbmVkIGluIHRoZSBtYWtlX21vdmUvdW5kb19tb3ZlIGZ1bmN0aW9ucyxcbiAgICAgKiBhdm9pZGluZyB0aGUgY29zdGx5IHRoYXQgd2UgZG8gYmVsb3cuXG4gICAgICovXG4gICAgdmFyIG1vdmVzID0gW11cbiAgICB2YXIgcG9zaXRpb25zID0ge31cbiAgICB2YXIgcmVwZXRpdGlvbiA9IGZhbHNlXG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIG1vdmUgPSB1bmRvX21vdmUoKVxuICAgICAgaWYgKCFtb3ZlKSBicmVha1xuICAgICAgbW92ZXMucHVzaChtb3ZlKVxuICAgIH1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAvKiByZW1vdmUgdGhlIGxhc3QgdHdvIGZpZWxkcyBpbiB0aGUgRkVOIHN0cmluZywgdGhleSdyZSBub3QgbmVlZGVkXG4gICAgICAgKiB3aGVuIGNoZWNraW5nIGZvciBkcmF3IGJ5IHJlcCAqL1xuICAgICAgdmFyIGZlbiA9IGdlbmVyYXRlX2ZlbigpLnNwbGl0KCcgJykuc2xpY2UoMCwgNCkuam9pbignICcpXG5cbiAgICAgIC8qIGhhcyB0aGUgcG9zaXRpb24gb2NjdXJyZWQgdGhyZWUgb3IgbW92ZSB0aW1lcyAqL1xuICAgICAgcG9zaXRpb25zW2Zlbl0gPSBmZW4gaW4gcG9zaXRpb25zID8gcG9zaXRpb25zW2Zlbl0gKyAxIDogMVxuICAgICAgaWYgKHBvc2l0aW9uc1tmZW5dID49IDMpIHtcbiAgICAgICAgcmVwZXRpdGlvbiA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCFtb3Zlcy5sZW5ndGgpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIG1ha2VfbW92ZShtb3Zlcy5wb3AoKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVwZXRpdGlvblxuICB9XG5cbiAgZnVuY3Rpb24gcHVzaChtb3ZlKSB7XG4gICAgaGlzdG9yeS5wdXNoKHtcbiAgICAgIG1vdmU6IG1vdmUsXG4gICAgICBraW5nczogeyBiOiBraW5ncy5iLCB3OiBraW5ncy53IH0sXG4gICAgICB0dXJuOiB0dXJuLFxuICAgICAgY2FzdGxpbmc6IHsgYjogY2FzdGxpbmcuYiwgdzogY2FzdGxpbmcudyB9LFxuICAgICAgZXBfc3F1YXJlOiBlcF9zcXVhcmUsXG4gICAgICBoYWxmX21vdmVzOiBoYWxmX21vdmVzLFxuICAgICAgbW92ZV9udW1iZXI6IG1vdmVfbnVtYmVyLFxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBtYWtlX21vdmUobW92ZSkge1xuICAgIHZhciB1cyA9IHR1cm5cbiAgICB2YXIgdGhlbSA9IHN3YXBfY29sb3IodXMpXG4gICAgcHVzaChtb3ZlKVxuXG4gICAgYm9hcmRbbW92ZS50b10gPSBib2FyZFttb3ZlLmZyb21dXG4gICAgYm9hcmRbbW92ZS5mcm9tXSA9IG51bGxcblxuICAgIC8qIGlmIGVwIGNhcHR1cmUsIHJlbW92ZSB0aGUgY2FwdHVyZWQgcGF3biAqL1xuICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5FUF9DQVBUVVJFKSB7XG4gICAgICBpZiAodHVybiA9PT0gQkxBQ0spIHtcbiAgICAgICAgYm9hcmRbbW92ZS50byAtIDE2XSA9IG51bGxcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvYXJkW21vdmUudG8gKyAxNl0gPSBudWxsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogaWYgcGF3biBwcm9tb3Rpb24sIHJlcGxhY2Ugd2l0aCBuZXcgcGllY2UgKi9cbiAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuUFJPTU9USU9OKSB7XG4gICAgICBib2FyZFttb3ZlLnRvXSA9IHsgdHlwZTogbW92ZS5wcm9tb3Rpb24sIGNvbG9yOiB1cyB9XG4gICAgfVxuXG4gICAgLyogaWYgd2UgbW92ZWQgdGhlIGtpbmcgKi9cbiAgICBpZiAoYm9hcmRbbW92ZS50b10udHlwZSA9PT0gS0lORykge1xuICAgICAga2luZ3NbYm9hcmRbbW92ZS50b10uY29sb3JdID0gbW92ZS50b1xuXG4gICAgICAvKiBpZiB3ZSBjYXN0bGVkLCBtb3ZlIHRoZSByb29rIG5leHQgdG8gdGhlIGtpbmcgKi9cbiAgICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5LU0lERV9DQVNUTEUpIHtcbiAgICAgICAgdmFyIGNhc3RsaW5nX3RvID0gbW92ZS50byAtIDFcbiAgICAgICAgdmFyIGNhc3RsaW5nX2Zyb20gPSBtb3ZlLnRvICsgMVxuICAgICAgICBib2FyZFtjYXN0bGluZ190b10gPSBib2FyZFtjYXN0bGluZ19mcm9tXVxuICAgICAgICBib2FyZFtjYXN0bGluZ19mcm9tXSA9IG51bGxcbiAgICAgIH0gZWxzZSBpZiAobW92ZS5mbGFncyAmIEJJVFMuUVNJREVfQ0FTVExFKSB7XG4gICAgICAgIHZhciBjYXN0bGluZ190byA9IG1vdmUudG8gKyAxXG4gICAgICAgIHZhciBjYXN0bGluZ19mcm9tID0gbW92ZS50byAtIDJcbiAgICAgICAgYm9hcmRbY2FzdGxpbmdfdG9dID0gYm9hcmRbY2FzdGxpbmdfZnJvbV1cbiAgICAgICAgYm9hcmRbY2FzdGxpbmdfZnJvbV0gPSBudWxsXG4gICAgICB9XG5cbiAgICAgIC8qIHR1cm4gb2ZmIGNhc3RsaW5nICovXG4gICAgICBjYXN0bGluZ1t1c10gPSAnJ1xuICAgIH1cblxuICAgIC8qIHR1cm4gb2ZmIGNhc3RsaW5nIGlmIHdlIG1vdmUgYSByb29rICovXG4gICAgaWYgKGNhc3RsaW5nW3VzXSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IFJPT0tTW3VzXS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbW92ZS5mcm9tID09PSBST09LU1t1c11baV0uc3F1YXJlICYmXG4gICAgICAgICAgY2FzdGxpbmdbdXNdICYgUk9PS1NbdXNdW2ldLmZsYWdcbiAgICAgICAgKSB7XG4gICAgICAgICAgY2FzdGxpbmdbdXNdIF49IFJPT0tTW3VzXVtpXS5mbGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qIHR1cm4gb2ZmIGNhc3RsaW5nIGlmIHdlIGNhcHR1cmUgYSByb29rICovXG4gICAgaWYgKGNhc3RsaW5nW3RoZW1dKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gUk9PS1NbdGhlbV0ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIG1vdmUudG8gPT09IFJPT0tTW3RoZW1dW2ldLnNxdWFyZSAmJlxuICAgICAgICAgIGNhc3RsaW5nW3RoZW1dICYgUk9PS1NbdGhlbV1baV0uZmxhZ1xuICAgICAgICApIHtcbiAgICAgICAgICBjYXN0bGluZ1t0aGVtXSBePSBST09LU1t0aGVtXVtpXS5mbGFnXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qIGlmIGJpZyBwYXduIG1vdmUsIHVwZGF0ZSB0aGUgZW4gcGFzc2FudCBzcXVhcmUgKi9cbiAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuQklHX1BBV04pIHtcbiAgICAgIGlmICh0dXJuID09PSAnYicpIHtcbiAgICAgICAgZXBfc3F1YXJlID0gbW92ZS50byAtIDE2XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcF9zcXVhcmUgPSBtb3ZlLnRvICsgMTZcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXBfc3F1YXJlID0gRU1QVFlcbiAgICB9XG5cbiAgICAvKiByZXNldCB0aGUgNTAgbW92ZSBjb3VudGVyIGlmIGEgcGF3biBpcyBtb3ZlZCBvciBhIHBpZWNlIGlzIGNhcHR1cmVkICovXG4gICAgaWYgKG1vdmUucGllY2UgPT09IFBBV04pIHtcbiAgICAgIGhhbGZfbW92ZXMgPSAwXG4gICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgKEJJVFMuQ0FQVFVSRSB8IEJJVFMuRVBfQ0FQVFVSRSkpIHtcbiAgICAgIGhhbGZfbW92ZXMgPSAwXG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbGZfbW92ZXMrK1xuICAgIH1cblxuICAgIGlmICh0dXJuID09PSBCTEFDSykge1xuICAgICAgbW92ZV9udW1iZXIrK1xuICAgIH1cbiAgICB0dXJuID0gc3dhcF9jb2xvcih0dXJuKVxuICB9XG5cbiAgZnVuY3Rpb24gdW5kb19tb3ZlKCkge1xuICAgIHZhciBvbGQgPSBoaXN0b3J5LnBvcCgpXG4gICAgaWYgKG9sZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBtb3ZlID0gb2xkLm1vdmVcbiAgICBraW5ncyA9IG9sZC5raW5nc1xuICAgIHR1cm4gPSBvbGQudHVyblxuICAgIGNhc3RsaW5nID0gb2xkLmNhc3RsaW5nXG4gICAgZXBfc3F1YXJlID0gb2xkLmVwX3NxdWFyZVxuICAgIGhhbGZfbW92ZXMgPSBvbGQuaGFsZl9tb3Zlc1xuICAgIG1vdmVfbnVtYmVyID0gb2xkLm1vdmVfbnVtYmVyXG5cbiAgICB2YXIgdXMgPSB0dXJuXG4gICAgdmFyIHRoZW0gPSBzd2FwX2NvbG9yKHR1cm4pXG5cbiAgICBib2FyZFttb3ZlLmZyb21dID0gYm9hcmRbbW92ZS50b11cbiAgICBib2FyZFttb3ZlLmZyb21dLnR5cGUgPSBtb3ZlLnBpZWNlIC8vIHRvIHVuZG8gYW55IHByb21vdGlvbnNcbiAgICBib2FyZFttb3ZlLnRvXSA9IG51bGxcblxuICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5DQVBUVVJFKSB7XG4gICAgICBib2FyZFttb3ZlLnRvXSA9IHsgdHlwZTogbW92ZS5jYXB0dXJlZCwgY29sb3I6IHRoZW0gfVxuICAgIH0gZWxzZSBpZiAobW92ZS5mbGFncyAmIEJJVFMuRVBfQ0FQVFVSRSkge1xuICAgICAgdmFyIGluZGV4XG4gICAgICBpZiAodXMgPT09IEJMQUNLKSB7XG4gICAgICAgIGluZGV4ID0gbW92ZS50byAtIDE2XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IG1vdmUudG8gKyAxNlxuICAgICAgfVxuICAgICAgYm9hcmRbaW5kZXhdID0geyB0eXBlOiBQQVdOLCBjb2xvcjogdGhlbSB9XG4gICAgfVxuXG4gICAgaWYgKG1vdmUuZmxhZ3MgJiAoQklUUy5LU0lERV9DQVNUTEUgfCBCSVRTLlFTSURFX0NBU1RMRSkpIHtcbiAgICAgIHZhciBjYXN0bGluZ190bywgY2FzdGxpbmdfZnJvbVxuICAgICAgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLktTSURFX0NBU1RMRSkge1xuICAgICAgICBjYXN0bGluZ190byA9IG1vdmUudG8gKyAxXG4gICAgICAgIGNhc3RsaW5nX2Zyb20gPSBtb3ZlLnRvIC0gMVxuICAgICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgICAgY2FzdGxpbmdfdG8gPSBtb3ZlLnRvIC0gMlxuICAgICAgICBjYXN0bGluZ19mcm9tID0gbW92ZS50byArIDFcbiAgICAgIH1cblxuICAgICAgYm9hcmRbY2FzdGxpbmdfdG9dID0gYm9hcmRbY2FzdGxpbmdfZnJvbV1cbiAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb21dID0gbnVsbFxuICAgIH1cblxuICAgIHJldHVybiBtb3ZlXG4gIH1cblxuICAvLyBjb252ZXJ0IGEgbW92ZSBmcm9tIFN0YW5kYXJkIEFsZ2VicmFpYyBOb3RhdGlvbiAoU0FOKSB0byAweDg4IGNvb3JkaW5hdGVzXG4gIGZ1bmN0aW9uIG1vdmVfZnJvbV9zYW4obW92ZSwgc2xvcHB5KSB7XG4gICAgLy8gc3RyaXAgb2ZmIGFueSBtb3ZlIGRlY29yYXRpb25zOiBlLmcgTmYzKz8hIGJlY29tZXMgTmYzXG4gICAgdmFyIGNsZWFuX21vdmUgPSBzdHJpcHBlZF9zYW4obW92ZSlcblxuICAgIC8vIHRoZSBtb3ZlIHBhcnNlcnMgaXMgYSAyLXN0ZXAgc3RhdGVcbiAgICBmb3IgKHZhciBwYXJzZXIgPSAwOyBwYXJzZXIgPCAyOyBwYXJzZXIrKykge1xuICAgICAgaWYgKHBhcnNlciA9PSBQQVJTRVJfU0xPUFBZKSB7XG4gICAgICAgIC8vIG9ubHkgcnVuIHRoZSBzbG9wcHkgcGFyc2UgaWYgZXhwbGljaXRseSByZXF1ZXN0ZWRcbiAgICAgICAgaWYgKCFzbG9wcHkpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHNsb3BweSBwYXJzZXIgYWxsb3dzIHRoZSB1c2VyIHRvIHBhcnNlIG5vbi1zdGFuZGFyZCBjaGVzc1xuICAgICAgICAvLyBub3RhdGlvbnMuIFRoaXMgcGFyc2VyIGlzIG9wdC1pbiAoYnkgc3BlY2lmeWluZyB0aGVcbiAgICAgICAgLy8gJ3sgc2xvcHB5OiB0cnVlIH0nIHNldHRpbmcpIGFuZCBpcyBvbmx5IHJ1biBhZnRlciB0aGUgU3RhbmRhcmRcbiAgICAgICAgLy8gQWxnZWJyYWljIE5vdGF0aW9uIChTQU4pIHBhcnNlciBoYXMgZmFpbGVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXaGVuIHJ1bm5pbmcgdGhlIHNsb3BweSBwYXJzZXIsIHdlJ2xsIHJ1biBhIHJlZ2V4IHRvIGdyYWIgdGhlIHBpZWNlLFxuICAgICAgICAvLyB0aGUgdG8vZnJvbSBzcXVhcmUsIGFuZCBhbiBvcHRpb25hbCBwcm9tb3Rpb24gcGllY2UuIFRoaXMgcmVnZXggd2lsbFxuICAgICAgICAvLyBwYXJzZSBjb21tb24gbm9uLXN0YW5kYXJkIG5vdGF0aW9uIGxpa2U6IFBlMi1lNCwgUmMxYzQsIFFmM3hmNyxcbiAgICAgICAgLy8gZjdmOHEsIGIxYzNcblxuICAgICAgICAvLyBOT1RFOiBTb21lIHBvc2l0aW9ucyBhbmQgbW92ZXMgbWF5IGJlIGFtYmlndW91cyB3aGVuIHVzaW5nIHRoZVxuICAgICAgICAvLyBzbG9wcHkgcGFyc2VyLiBGb3IgZXhhbXBsZSwgaW4gdGhpcyBwb3NpdGlvbjpcbiAgICAgICAgLy8gNmsxLzgvOC9CNy84LzgvOC9CTjRLMSB3IC0gLSAwIDEsIHRoZSBtb3ZlIGIxYzMgbWF5IGJlIGludGVycHJldGVkXG4gICAgICAgIC8vIGFzIE5jMyBvciBCMWMzIChhIGRpc2FtYmlndWF0ZWQgYmlzaG9wIG1vdmUpLiBJbiB0aGVzZSBjYXNlcywgdGhlXG4gICAgICAgIC8vIHNsb3BweSBwYXJzZXIgd2lsbCBkZWZhdWx0IHRvIHRoZSBtb3N0IG1vc3QgYmFzaWMgaW50ZXJwcmV0YXRpb25cbiAgICAgICAgLy8gKHdoaWNoIGlzIGIxYzMgcGFyc2luZyB0byBOYzMpLlxuXG4gICAgICAgIC8vIEZJWE1FOiB0aGVzZSB2YXIncyBhcmUgaG9pc3RlZCBpbnRvIGZ1bmN0aW9uIHNjb3BlLCB0aGlzIHdpbGwgbmVlZFxuICAgICAgICAvLyB0byBjaGFuZ2Ugd2hlbiBzd2l0Y2hpbmcgdG8gY29uc3QvbGV0XG5cbiAgICAgICAgdmFyIG92ZXJseV9kaXNhbWJpZ3VhdGVkID0gZmFsc2VcblxuICAgICAgICB2YXIgbWF0Y2hlcyA9IGNsZWFuX21vdmUubWF0Y2goXG4gICAgICAgICAgLyhbcG5icnFrUE5CUlFLXSk/KFthLWhdWzEtOF0peD8tPyhbYS1oXVsxLThdKShbcXJiblFSQk5dKT8vXG4gICAgICAgIClcbiAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICB2YXIgcGllY2UgPSBtYXRjaGVzWzFdXG4gICAgICAgICAgdmFyIGZyb20gPSBtYXRjaGVzWzJdXG4gICAgICAgICAgdmFyIHRvID0gbWF0Y2hlc1szXVxuICAgICAgICAgIHZhciBwcm9tb3Rpb24gPSBtYXRjaGVzWzRdXG5cbiAgICAgICAgICBpZiAoZnJvbS5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgb3Zlcmx5X2Rpc2FtYmlndWF0ZWQgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoZSBbYS1oXT9bMS04XT8gcG9ydGlvbiBvZiB0aGUgcmVnZXggYmVsb3cgaGFuZGxlcyBtb3ZlcyB0aGF0IG1heVxuICAgICAgICAgIC8vIGJlIG92ZXJseSBkaXNhbWJpZ3VhdGVkIChlLmcuIE5nZTcgaXMgdW5uZWNlc3NhcnkgYW5kIG5vbi1zdGFuZGFyZFxuICAgICAgICAgIC8vIHdoZW4gdGhlcmUgaXMgb25lIGxlZ2FsIGtuaWdodCBtb3ZlIHRvIGU3KS4gSW4gdGhpcyBjYXNlLCB0aGUgdmFsdWVcbiAgICAgICAgICAvLyBvZiAnZnJvbScgdmFyaWFibGUgd2lsbCBiZSBhIHJhbmsgb3IgZmlsZSwgbm90IGEgc3F1YXJlLlxuICAgICAgICAgIHZhciBtYXRjaGVzID0gY2xlYW5fbW92ZS5tYXRjaChcbiAgICAgICAgICAgIC8oW3BuYnJxa1BOQlJRS10pPyhbYS1oXT9bMS04XT8peD8tPyhbYS1oXVsxLThdKShbcXJiblFSQk5dKT8vXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIHZhciBwaWVjZSA9IG1hdGNoZXNbMV1cbiAgICAgICAgICAgIHZhciBmcm9tID0gbWF0Y2hlc1syXVxuICAgICAgICAgICAgdmFyIHRvID0gbWF0Y2hlc1szXVxuICAgICAgICAgICAgdmFyIHByb21vdGlvbiA9IG1hdGNoZXNbNF1cblxuICAgICAgICAgICAgaWYgKGZyb20ubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgdmFyIG92ZXJseV9kaXNhbWJpZ3VhdGVkID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcGllY2VfdHlwZSA9IGluZmVyX3BpZWNlX3R5cGUoY2xlYW5fbW92ZSlcbiAgICAgIHZhciBtb3ZlcyA9IGdlbmVyYXRlX21vdmVzKHtcbiAgICAgICAgbGVnYWw6IHRydWUsXG4gICAgICAgIHBpZWNlOiBwaWVjZSA/IHBpZWNlIDogcGllY2VfdHlwZSxcbiAgICAgIH0pXG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBzd2l0Y2ggKHBhcnNlcikge1xuICAgICAgICAgIGNhc2UgUEFSU0VSX1NUUklDVDoge1xuICAgICAgICAgICAgaWYgKGNsZWFuX21vdmUgPT09IHN0cmlwcGVkX3Nhbihtb3ZlX3RvX3Nhbihtb3Zlc1tpXSwgbW92ZXMpKSkge1xuICAgICAgICAgICAgICByZXR1cm4gbW92ZXNbaV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgUEFSU0VSX1NMT1BQWToge1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgLy8gaGFuZC1jb21wYXJlIG1vdmUgcHJvcGVydGllcyB3aXRoIHRoZSByZXN1bHRzIGZyb20gb3VyIHNsb3BweVxuICAgICAgICAgICAgICAvLyByZWdleFxuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgKCFwaWVjZSB8fCBwaWVjZS50b0xvd2VyQ2FzZSgpID09IG1vdmVzW2ldLnBpZWNlKSAmJlxuICAgICAgICAgICAgICAgIFNRVUFSRV9NQVBbZnJvbV0gPT0gbW92ZXNbaV0uZnJvbSAmJlxuICAgICAgICAgICAgICAgIFNRVUFSRV9NQVBbdG9dID09IG1vdmVzW2ldLnRvICYmXG4gICAgICAgICAgICAgICAgKCFwcm9tb3Rpb24gfHwgcHJvbW90aW9uLnRvTG93ZXJDYXNlKCkgPT0gbW92ZXNbaV0ucHJvbW90aW9uKVxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW92ZXNbaV1cbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChvdmVybHlfZGlzYW1iaWd1YXRlZCkge1xuICAgICAgICAgICAgICAgIC8vIFNQRUNJQUwgQ0FTRTogd2UgcGFyc2VkIGEgbW92ZSBzdHJpbmcgdGhhdCBtYXkgaGF2ZSBhblxuICAgICAgICAgICAgICAgIC8vIHVubmVlZGVkIHJhbmsvZmlsZSBkaXNhbWJpZ3VhdG9yIChlLmcuIE5nZTcpLiAgVGhlICdmcm9tJ1xuICAgICAgICAgICAgICAgIC8vIHZhcmlhYmxlIHdpbGxcbiAgICAgICAgICAgICAgICB2YXIgc3F1YXJlID0gYWxnZWJyYWljKG1vdmVzW2ldLmZyb20pXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgKCFwaWVjZSB8fCBwaWVjZS50b0xvd2VyQ2FzZSgpID09IG1vdmVzW2ldLnBpZWNlKSAmJlxuICAgICAgICAgICAgICAgICAgU1FVQVJFX01BUFt0b10gPT0gbW92ZXNbaV0udG8gJiZcbiAgICAgICAgICAgICAgICAgIChmcm9tID09IHNxdWFyZVswXSB8fCBmcm9tID09IHNxdWFyZVsxXSkgJiZcbiAgICAgICAgICAgICAgICAgICghcHJvbW90aW9uIHx8IHByb21vdGlvbi50b0xvd2VyQ2FzZSgpID09IG1vdmVzW2ldLnByb21vdGlvbilcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtb3Zlc1tpXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvKiBwcmV0dHkgPSBleHRlcm5hbCBtb3ZlIG9iamVjdCAqL1xuICBmdW5jdGlvbiBtYWtlX3ByZXR0eSh1Z2x5X21vdmUpIHtcbiAgICB2YXIgbW92ZSA9IGNsb25lKHVnbHlfbW92ZSlcbiAgICBtb3ZlLnNhbiA9IG1vdmVfdG9fc2FuKG1vdmUsIGdlbmVyYXRlX21vdmVzKHsgbGVnYWw6IHRydWUgfSkpXG4gICAgbW92ZS50byA9IGFsZ2VicmFpYyhtb3ZlLnRvKVxuICAgIG1vdmUuZnJvbSA9IGFsZ2VicmFpYyhtb3ZlLmZyb20pXG5cbiAgICB2YXIgZmxhZ3MgPSAnJ1xuXG4gICAgZm9yICh2YXIgZmxhZyBpbiBCSVRTKSB7XG4gICAgICBpZiAoQklUU1tmbGFnXSAmIG1vdmUuZmxhZ3MpIHtcbiAgICAgICAgZmxhZ3MgKz0gRkxBR1NbZmxhZ11cbiAgICAgIH1cbiAgICB9XG4gICAgbW92ZS5mbGFncyA9IGZsYWdzXG5cbiAgICByZXR1cm4gbW92ZVxuICB9XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqIERFQlVHR0lORyBVVElMSVRJRVNcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIGZ1bmN0aW9uIHBlcmZ0KGRlcHRoKSB7XG4gICAgdmFyIG1vdmVzID0gZ2VuZXJhdGVfbW92ZXMoeyBsZWdhbDogZmFsc2UgfSlcbiAgICB2YXIgbm9kZXMgPSAwXG4gICAgdmFyIGNvbG9yID0gdHVyblxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1vdmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBtYWtlX21vdmUobW92ZXNbaV0pXG4gICAgICBpZiAoIWtpbmdfYXR0YWNrZWQoY29sb3IpKSB7XG4gICAgICAgIGlmIChkZXB0aCAtIDEgPiAwKSB7XG4gICAgICAgICAgdmFyIGNoaWxkX25vZGVzID0gcGVyZnQoZGVwdGggLSAxKVxuICAgICAgICAgIG5vZGVzICs9IGNoaWxkX25vZGVzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbm9kZXMrK1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB1bmRvX21vdmUoKVxuICAgIH1cblxuICAgIHJldHVybiBub2Rlc1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogUFVCTElDIEFQSVxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICBsb2FkOiBmdW5jdGlvbiAoZmVuKSB7XG4gICAgICByZXR1cm4gbG9hZChmZW4pXG4gICAgfSxcblxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcmVzZXQoKVxuICAgIH0sXG5cbiAgICBtb3ZlczogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIC8qIFRoZSBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiBhIGNoZXNzIG1vdmUgaXMgaW4gMHg4OCBmb3JtYXQsIGFuZFxuICAgICAgICogbm90IG1lYW50IHRvIGJlIGh1bWFuLXJlYWRhYmxlLiAgVGhlIGNvZGUgYmVsb3cgY29udmVydHMgdGhlIDB4ODhcbiAgICAgICAqIHNxdWFyZSBjb29yZGluYXRlcyB0byBhbGdlYnJhaWMgY29vcmRpbmF0ZXMuICBJdCBhbHNvIHBydW5lcyBhblxuICAgICAgICogdW5uZWNlc3NhcnkgbW92ZSBrZXlzIHJlc3VsdGluZyBmcm9tIGEgdmVyYm9zZSBjYWxsLlxuICAgICAgICovXG5cbiAgICAgIHZhciB1Z2x5X21vdmVzID0gZ2VuZXJhdGVfbW92ZXMob3B0aW9ucylcbiAgICAgIHZhciBtb3ZlcyA9IFtdXG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB1Z2x5X21vdmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIC8qIGRvZXMgdGhlIHVzZXIgd2FudCBhIGZ1bGwgbW92ZSBvYmplY3QgKG1vc3QgbGlrZWx5IG5vdCksIG9yIGp1c3RcbiAgICAgICAgICogU0FOXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgJ3ZlcmJvc2UnIGluIG9wdGlvbnMgJiZcbiAgICAgICAgICBvcHRpb25zLnZlcmJvc2VcbiAgICAgICAgKSB7XG4gICAgICAgICAgbW92ZXMucHVzaChtYWtlX3ByZXR0eSh1Z2x5X21vdmVzW2ldKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb3Zlcy5wdXNoKFxuICAgICAgICAgICAgbW92ZV90b19zYW4odWdseV9tb3Zlc1tpXSwgZ2VuZXJhdGVfbW92ZXMoeyBsZWdhbDogdHJ1ZSB9KSlcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1vdmVzXG4gICAgfSxcblxuICAgIGluX2NoZWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW5fY2hlY2soKVxuICAgIH0sXG5cbiAgICBpbl9jaGVja21hdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpbl9jaGVja21hdGUoKVxuICAgIH0sXG5cbiAgICBpbl9zdGFsZW1hdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpbl9zdGFsZW1hdGUoKVxuICAgIH0sXG5cbiAgICBpbl9kcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBoYWxmX21vdmVzID49IDEwMCB8fFxuICAgICAgICBpbl9zdGFsZW1hdGUoKSB8fFxuICAgICAgICBpbnN1ZmZpY2llbnRfbWF0ZXJpYWwoKSB8fFxuICAgICAgICBpbl90aHJlZWZvbGRfcmVwZXRpdGlvbigpXG4gICAgICApXG4gICAgfSxcblxuICAgIGluc3VmZmljaWVudF9tYXRlcmlhbDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGluc3VmZmljaWVudF9tYXRlcmlhbCgpXG4gICAgfSxcblxuICAgIGluX3RocmVlZm9sZF9yZXBldGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW5fdGhyZWVmb2xkX3JlcGV0aXRpb24oKVxuICAgIH0sXG5cbiAgICBnYW1lX292ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGhhbGZfbW92ZXMgPj0gMTAwIHx8XG4gICAgICAgIGluX2NoZWNrbWF0ZSgpIHx8XG4gICAgICAgIGluX3N0YWxlbWF0ZSgpIHx8XG4gICAgICAgIGluc3VmZmljaWVudF9tYXRlcmlhbCgpIHx8XG4gICAgICAgIGluX3RocmVlZm9sZF9yZXBldGl0aW9uKClcbiAgICAgIClcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVfZmVuOiBmdW5jdGlvbiAoZmVuKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGVfZmVuKGZlbilcbiAgICB9LFxuXG4gICAgZmVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZ2VuZXJhdGVfZmVuKClcbiAgICB9LFxuXG4gICAgYm9hcmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvdXRwdXQgPSBbXSxcbiAgICAgICAgcm93ID0gW11cblxuICAgICAgZm9yICh2YXIgaSA9IFNRVUFSRV9NQVAuYTg7IGkgPD0gU1FVQVJFX01BUC5oMTsgaSsrKSB7XG4gICAgICAgIGlmIChib2FyZFtpXSA9PSBudWxsKSB7XG4gICAgICAgICAgcm93LnB1c2gobnVsbClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByb3cucHVzaCh7XG4gICAgICAgICAgICBzcXVhcmU6IGFsZ2VicmFpYyhpKSxcbiAgICAgICAgICAgIHR5cGU6IGJvYXJkW2ldLnR5cGUsXG4gICAgICAgICAgICBjb2xvcjogYm9hcmRbaV0uY29sb3IsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGkgKyAxKSAmIDB4ODgpIHtcbiAgICAgICAgICBvdXRwdXQucHVzaChyb3cpXG4gICAgICAgICAgcm93ID0gW11cbiAgICAgICAgICBpICs9IDhcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcblxuICAgIHBnbjogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIC8qIHVzaW5nIHRoZSBzcGVjaWZpY2F0aW9uIGZyb20gaHR0cDovL3d3dy5jaGVzc2NsdWIuY29tL2hlbHAvUEdOLXNwZWNcbiAgICAgICAqIGV4YW1wbGUgZm9yIGh0bWwgdXNhZ2U6IC5wZ24oeyBtYXhfd2lkdGg6IDcyLCBuZXdsaW5lX2NoYXI6IFwiPGJyIC8+XCIgfSlcbiAgICAgICAqL1xuICAgICAgdmFyIG5ld2xpbmUgPVxuICAgICAgICB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG9wdGlvbnMubmV3bGluZV9jaGFyID09PSAnc3RyaW5nJ1xuICAgICAgICAgID8gb3B0aW9ucy5uZXdsaW5lX2NoYXJcbiAgICAgICAgICA6ICdcXG4nXG4gICAgICB2YXIgbWF4X3dpZHRoID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvcHRpb25zLm1heF93aWR0aCA9PT0gJ251bWJlcidcbiAgICAgICAgICA/IG9wdGlvbnMubWF4X3dpZHRoXG4gICAgICAgICAgOiAwXG4gICAgICB2YXIgcmVzdWx0ID0gW11cbiAgICAgIHZhciBoZWFkZXJfZXhpc3RzID0gZmFsc2VcblxuICAgICAgLyogYWRkIHRoZSBQR04gaGVhZGVyIGhlYWRlcnJtYXRpb24gKi9cbiAgICAgIGZvciAodmFyIGkgaW4gaGVhZGVyKSB7XG4gICAgICAgIC8qIFRPRE86IG9yZGVyIG9mIGVudW1lcmF0ZWQgcHJvcGVydGllcyBpbiBoZWFkZXIgb2JqZWN0IGlzIG5vdFxuICAgICAgICAgKiBndWFyYW50ZWVkLCBzZWUgRUNNQS0yNjIgc3BlYyAoc2VjdGlvbiAxMi42LjQpXG4gICAgICAgICAqL1xuICAgICAgICByZXN1bHQucHVzaCgnWycgKyBpICsgJyBcIicgKyBoZWFkZXJbaV0gKyAnXCJdJyArIG5ld2xpbmUpXG4gICAgICAgIGhlYWRlcl9leGlzdHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChoZWFkZXJfZXhpc3RzICYmIGhpc3RvcnkubGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG5ld2xpbmUpXG4gICAgICB9XG5cbiAgICAgIHZhciBhcHBlbmRfY29tbWVudCA9IGZ1bmN0aW9uIChtb3ZlX3N0cmluZykge1xuICAgICAgICB2YXIgY29tbWVudCA9IGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXVxuICAgICAgICBpZiAodHlwZW9mIGNvbW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdmFyIGRlbGltaXRlciA9IG1vdmVfc3RyaW5nLmxlbmd0aCA+IDAgPyAnICcgOiAnJ1xuICAgICAgICAgIG1vdmVfc3RyaW5nID0gYCR7bW92ZV9zdHJpbmd9JHtkZWxpbWl0ZXJ9eyR7Y29tbWVudH19YFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtb3ZlX3N0cmluZ1xuICAgICAgfVxuXG4gICAgICAvKiBwb3AgYWxsIG9mIGhpc3Rvcnkgb250byByZXZlcnNlZF9oaXN0b3J5ICovXG4gICAgICB2YXIgcmV2ZXJzZWRfaGlzdG9yeSA9IFtdXG4gICAgICB3aGlsZSAoaGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldmVyc2VkX2hpc3RvcnkucHVzaCh1bmRvX21vdmUoKSlcbiAgICAgIH1cblxuICAgICAgdmFyIG1vdmVzID0gW11cbiAgICAgIHZhciBtb3ZlX3N0cmluZyA9ICcnXG5cbiAgICAgIC8qIHNwZWNpYWwgY2FzZSBvZiBhIGNvbW1lbnRlZCBzdGFydGluZyBwb3NpdGlvbiB3aXRoIG5vIG1vdmVzICovXG4gICAgICBpZiAocmV2ZXJzZWRfaGlzdG9yeS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbW92ZXMucHVzaChhcHBlbmRfY29tbWVudCgnJykpXG4gICAgICB9XG5cbiAgICAgIC8qIGJ1aWxkIHRoZSBsaXN0IG9mIG1vdmVzLiAgYSBtb3ZlX3N0cmluZyBsb29rcyBsaWtlOiBcIjMuIGUzIGU2XCIgKi9cbiAgICAgIHdoaWxlIChyZXZlcnNlZF9oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgbW92ZV9zdHJpbmcgPSBhcHBlbmRfY29tbWVudChtb3ZlX3N0cmluZylcbiAgICAgICAgdmFyIG1vdmUgPSByZXZlcnNlZF9oaXN0b3J5LnBvcCgpXG5cbiAgICAgICAgLyogaWYgdGhlIHBvc2l0aW9uIHN0YXJ0ZWQgd2l0aCBibGFjayB0byBtb3ZlLCBzdGFydCBQR04gd2l0aCAxLiAuLi4gKi9cbiAgICAgICAgaWYgKCFoaXN0b3J5Lmxlbmd0aCAmJiBtb3ZlLmNvbG9yID09PSAnYicpIHtcbiAgICAgICAgICBtb3ZlX3N0cmluZyA9IG1vdmVfbnVtYmVyICsgJy4gLi4uJ1xuICAgICAgICB9IGVsc2UgaWYgKG1vdmUuY29sb3IgPT09ICd3Jykge1xuICAgICAgICAgIC8qIHN0b3JlIHRoZSBwcmV2aW91cyBnZW5lcmF0ZWQgbW92ZV9zdHJpbmcgaWYgd2UgaGF2ZSBvbmUgKi9cbiAgICAgICAgICBpZiAobW92ZV9zdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICBtb3Zlcy5wdXNoKG1vdmVfc3RyaW5nKVxuICAgICAgICAgIH1cbiAgICAgICAgICBtb3ZlX3N0cmluZyA9IG1vdmVfbnVtYmVyICsgJy4nXG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlX3N0cmluZyA9XG4gICAgICAgICAgbW92ZV9zdHJpbmcgKyAnICcgKyBtb3ZlX3RvX3Nhbihtb3ZlLCBnZW5lcmF0ZV9tb3Zlcyh7IGxlZ2FsOiB0cnVlIH0pKVxuICAgICAgICBtYWtlX21vdmUobW92ZSlcbiAgICAgIH1cblxuICAgICAgLyogYXJlIHRoZXJlIGFueSBvdGhlciBsZWZ0b3ZlciBtb3Zlcz8gKi9cbiAgICAgIGlmIChtb3ZlX3N0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgbW92ZXMucHVzaChhcHBlbmRfY29tbWVudChtb3ZlX3N0cmluZykpXG4gICAgICB9XG5cbiAgICAgIC8qIGlzIHRoZXJlIGEgcmVzdWx0PyAqL1xuICAgICAgaWYgKHR5cGVvZiBoZWFkZXIuUmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb3Zlcy5wdXNoKGhlYWRlci5SZXN1bHQpXG4gICAgICB9XG5cbiAgICAgIC8qIGhpc3Rvcnkgc2hvdWxkIGJlIGJhY2sgdG8gd2hhdCBpdCB3YXMgYmVmb3JlIHdlIHN0YXJ0ZWQgZ2VuZXJhdGluZyBQR04sXG4gICAgICAgKiBzbyBqb2luIHRvZ2V0aGVyIG1vdmVzXG4gICAgICAgKi9cbiAgICAgIGlmIChtYXhfd2lkdGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCcnKSArIG1vdmVzLmpvaW4oJyAnKVxuICAgICAgfVxuXG4gICAgICB2YXIgc3RyaXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChyZXN1bHQubGVuZ3RoID4gMCAmJiByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSAnICcpIHtcbiAgICAgICAgICByZXN1bHQucG9wKClcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICAvKiBOQjogdGhpcyBkb2VzIG5vdCBwcmVzZXJ2ZSBjb21tZW50IHdoaXRlc3BhY2UuICovXG4gICAgICB2YXIgd3JhcF9jb21tZW50ID0gZnVuY3Rpb24gKHdpZHRoLCBtb3ZlKSB7XG4gICAgICAgIGZvciAodmFyIHRva2VuIG9mIG1vdmUuc3BsaXQoJyAnKSkge1xuICAgICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh3aWR0aCArIHRva2VuLmxlbmd0aCA+IG1heF93aWR0aCkge1xuICAgICAgICAgICAgd2hpbGUgKHN0cmlwKCkpIHtcbiAgICAgICAgICAgICAgd2lkdGgtLVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3bGluZSlcbiAgICAgICAgICAgIHdpZHRoID0gMFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHQucHVzaCh0b2tlbilcbiAgICAgICAgICB3aWR0aCArPSB0b2tlbi5sZW5ndGhcbiAgICAgICAgICByZXN1bHQucHVzaCgnICcpXG4gICAgICAgICAgd2lkdGgrK1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdHJpcCgpKSB7XG4gICAgICAgICAgd2lkdGgtLVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aWR0aFxuICAgICAgfVxuXG4gICAgICAvKiB3cmFwIHRoZSBQR04gb3V0cHV0IGF0IG1heF93aWR0aCAqL1xuICAgICAgdmFyIGN1cnJlbnRfd2lkdGggPSAwXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjdXJyZW50X3dpZHRoICsgbW92ZXNbaV0ubGVuZ3RoID4gbWF4X3dpZHRoKSB7XG4gICAgICAgICAgaWYgKG1vdmVzW2ldLmluY2x1ZGVzKCd7JykpIHtcbiAgICAgICAgICAgIGN1cnJlbnRfd2lkdGggPSB3cmFwX2NvbW1lbnQoY3VycmVudF93aWR0aCwgbW92ZXNbaV0pXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBpZiB0aGUgY3VycmVudCBtb3ZlIHdpbGwgcHVzaCBwYXN0IG1heF93aWR0aCAqL1xuICAgICAgICBpZiAoY3VycmVudF93aWR0aCArIG1vdmVzW2ldLmxlbmd0aCA+IG1heF93aWR0aCAmJiBpICE9PSAwKSB7XG4gICAgICAgICAgLyogZG9uJ3QgZW5kIHRoZSBsaW5lIHdpdGggd2hpdGVzcGFjZSAqL1xuICAgICAgICAgIGlmIChyZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSAnICcpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wb3AoKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdC5wdXNoKG5ld2xpbmUpXG4gICAgICAgICAgY3VycmVudF93aWR0aCA9IDBcbiAgICAgICAgfSBlbHNlIGlmIChpICE9PSAwKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goJyAnKVxuICAgICAgICAgIGN1cnJlbnRfd2lkdGgrK1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKG1vdmVzW2ldKVxuICAgICAgICBjdXJyZW50X3dpZHRoICs9IG1vdmVzW2ldLmxlbmd0aFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0LmpvaW4oJycpXG4gICAgfSxcblxuICAgIGxvYWRfcGduOiBmdW5jdGlvbiAocGduLCBvcHRpb25zKSB7XG4gICAgICAvLyBhbGxvdyB0aGUgdXNlciB0byBzcGVjaWZ5IHRoZSBzbG9wcHkgbW92ZSBwYXJzZXIgdG8gd29yayBhcm91bmQgb3ZlclxuICAgICAgLy8gZGlzYW1iaWd1YXRpb24gYnVncyBpbiBGcml0eiBhbmQgQ2hlc3NiYXNlXG4gICAgICB2YXIgc2xvcHB5ID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdzbG9wcHknIGluIG9wdGlvbnNcbiAgICAgICAgICA/IG9wdGlvbnMuc2xvcHB5XG4gICAgICAgICAgOiBmYWxzZVxuXG4gICAgICBmdW5jdGlvbiBtYXNrKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFwnKVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYXNfa2V5cyhvYmplY3QpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBhcnNlX3Bnbl9oZWFkZXIoaGVhZGVyLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBuZXdsaW5lX2NoYXIgPVxuICAgICAgICAgIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgIHR5cGVvZiBvcHRpb25zLm5ld2xpbmVfY2hhciA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgID8gb3B0aW9ucy5uZXdsaW5lX2NoYXJcbiAgICAgICAgICAgIDogJ1xccj9cXG4nXG4gICAgICAgIHZhciBoZWFkZXJfb2JqID0ge31cbiAgICAgICAgdmFyIGhlYWRlcnMgPSBoZWFkZXIuc3BsaXQobmV3IFJlZ0V4cChtYXNrKG5ld2xpbmVfY2hhcikpKVxuICAgICAgICB2YXIga2V5ID0gJydcbiAgICAgICAgdmFyIHZhbHVlID0gJydcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBrZXkgPSBoZWFkZXJzW2ldLnJlcGxhY2UoL15cXFsoW0EtWl1bQS1aYS16XSopXFxzLipcXF0kLywgJyQxJylcbiAgICAgICAgICB2YWx1ZSA9IGhlYWRlcnNbaV0ucmVwbGFjZSgvXlxcW1tBLVphLXpdK1xcc1wiKC4qKVwiXFwgKlxcXSQvLCAnJDEnKVxuICAgICAgICAgIGlmICh0cmltKGtleSkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGVhZGVyX29ialtrZXldID0gdmFsdWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGVhZGVyX29ialxuICAgICAgfVxuXG4gICAgICB2YXIgbmV3bGluZV9jaGFyID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvcHRpb25zLm5ld2xpbmVfY2hhciA9PT0gJ3N0cmluZydcbiAgICAgICAgICA/IG9wdGlvbnMubmV3bGluZV9jaGFyXG4gICAgICAgICAgOiAnXFxyP1xcbidcblxuICAgICAgLy8gUmVnRXhwIHRvIHNwbGl0IGhlYWRlci4gVGFrZXMgYWR2YW50YWdlIG9mIHRoZSBmYWN0IHRoYXQgaGVhZGVyIGFuZCBtb3ZldGV4dFxuICAgICAgLy8gd2lsbCBhbHdheXMgaGF2ZSBhIGJsYW5rIGxpbmUgYmV0d2VlbiB0aGVtIChpZSwgdHdvIG5ld2xpbmVfY2hhcidzKS5cbiAgICAgIC8vIFdpdGggZGVmYXVsdCBuZXdsaW5lX2NoYXIsIHdpbGwgZXF1YWw6IC9eKFxcWygoPzpcXHI/XFxuKXwuKSpcXF0pKD86XFxyP1xcbil7Mn0vXG4gICAgICB2YXIgaGVhZGVyX3JlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgICAgJ14oXFxcXFsoKD86JyArXG4gICAgICAgICAgbWFzayhuZXdsaW5lX2NoYXIpICtcbiAgICAgICAgICAnKXwuKSpcXFxcXSknICtcbiAgICAgICAgICAnKD86JyArXG4gICAgICAgICAgbWFzayhuZXdsaW5lX2NoYXIpICtcbiAgICAgICAgICAnKXsyfSdcbiAgICAgIClcblxuICAgICAgLy8gSWYgbm8gaGVhZGVyIGdpdmVuLCBiZWdpbiB3aXRoIG1vdmVzLlxuICAgICAgdmFyIGhlYWRlcl9zdHJpbmcgPSBoZWFkZXJfcmVnZXgudGVzdChwZ24pXG4gICAgICAgID8gaGVhZGVyX3JlZ2V4LmV4ZWMocGduKVsxXVxuICAgICAgICA6ICcnXG5cbiAgICAgIC8vIFB1dCB0aGUgYm9hcmQgaW4gdGhlIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAgICByZXNldCgpXG5cbiAgICAgIC8qIHBhcnNlIFBHTiBoZWFkZXIgKi9cbiAgICAgIHZhciBoZWFkZXJzID0gcGFyc2VfcGduX2hlYWRlcihoZWFkZXJfc3RyaW5nLCBvcHRpb25zKVxuICAgICAgZm9yICh2YXIga2V5IGluIGhlYWRlcnMpIHtcbiAgICAgICAgc2V0X2hlYWRlcihba2V5LCBoZWFkZXJzW2tleV1dKVxuICAgICAgfVxuXG4gICAgICAvKiBsb2FkIHRoZSBzdGFydGluZyBwb3NpdGlvbiBpbmRpY2F0ZWQgYnkgW1NldHVwICcxJ10gYW5kXG4gICAgICAgKiBbRkVOIHBvc2l0aW9uXSAqL1xuICAgICAgaWYgKGhlYWRlcnNbJ1NldFVwJ10gPT09ICcxJykge1xuICAgICAgICBpZiAoISgnRkVOJyBpbiBoZWFkZXJzICYmIGxvYWQoaGVhZGVyc1snRkVOJ10sIHRydWUpKSkge1xuICAgICAgICAgIC8vIHNlY29uZCBhcmd1bWVudCB0byBsb2FkOiBkb24ndCBjbGVhciB0aGUgaGVhZGVyc1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qIE5COiB0aGUgcmVnZXhlcyBiZWxvdyB0aGF0IGRlbGV0ZSBtb3ZlIG51bWJlcnMsIHJlY3Vyc2l2ZVxuICAgICAgICogYW5ub3RhdGlvbnMsIGFuZCBudW1lcmljIGFubm90YXRpb24gZ2x5cGhzIG1heSBhbHNvIG1hdGNoXG4gICAgICAgKiB0ZXh0IGluIGNvbW1lbnRzLiBUbyBwcmV2ZW50IHRoaXMsIHdlIHRyYW5zZm9ybSBjb21tZW50c1xuICAgICAgICogYnkgaGV4LWVuY29kaW5nIHRoZW0gaW4gcGxhY2UgYW5kIGRlY29kaW5nIHRoZW0gYWdhaW4gYWZ0ZXJcbiAgICAgICAqIHRoZSBvdGhlciB0b2tlbnMgaGF2ZSBiZWVuIGRlbGV0ZWQuXG4gICAgICAgKlxuICAgICAgICogV2hpbGUgdGhlIHNwZWMgc3RhdGVzIHRoYXQgUEdOIGZpbGVzIHNob3VsZCBiZSBBU0NJSSBlbmNvZGVkLFxuICAgICAgICogd2UgdXNlIHtlbixkZX1jb2RlVVJJQ29tcG9uZW50IGhlcmUgdG8gc3VwcG9ydCBhcmJpdHJhcnkgVVRGOFxuICAgICAgICogYXMgYSBjb252ZW5pZW5jZSBmb3IgbW9kZXJuIHVzZXJzICovXG5cbiAgICAgIHZhciB0b19oZXggPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHN0cmluZylcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAvKiBlbmNvZGVVUkkgZG9lc24ndCB0cmFuc2Zvcm0gbW9zdCBBU0NJSSBjaGFyYWN0ZXJzLFxuICAgICAgICAgICAgICogc28gd2UgaGFuZGxlIHRoZXNlIG91cnNlbHZlcyAqL1xuICAgICAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSA8IDEyOFxuICAgICAgICAgICAgICA/IGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNilcbiAgICAgICAgICAgICAgOiBlbmNvZGVVUklDb21wb25lbnQoYykucmVwbGFjZSgvXFwlL2csICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuam9pbignJylcbiAgICAgIH1cblxuICAgICAgdmFyIGZyb21faGV4ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nLmxlbmd0aCA9PSAwXG4gICAgICAgICAgPyAnJ1xuICAgICAgICAgIDogZGVjb2RlVVJJQ29tcG9uZW50KCclJyArIHN0cmluZy5tYXRjaCgvLnsxLDJ9L2cpLmpvaW4oJyUnKSlcbiAgICAgIH1cblxuICAgICAgdmFyIGVuY29kZV9jb21tZW50ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShuZXcgUmVnRXhwKG1hc2sobmV3bGluZV9jaGFyKSwgJ2cnKSwgJyAnKVxuICAgICAgICByZXR1cm4gYHske3RvX2hleChzdHJpbmcuc2xpY2UoMSwgc3RyaW5nLmxlbmd0aCAtIDEpKX19YFxuICAgICAgfVxuXG4gICAgICB2YXIgZGVjb2RlX2NvbW1lbnQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGlmIChzdHJpbmcuc3RhcnRzV2l0aCgneycpICYmIHN0cmluZy5lbmRzV2l0aCgnfScpKSB7XG4gICAgICAgICAgcmV0dXJuIGZyb21faGV4KHN0cmluZy5zbGljZSgxLCBzdHJpbmcubGVuZ3RoIC0gMSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogZGVsZXRlIGhlYWRlciB0byBnZXQgdGhlIG1vdmVzICovXG4gICAgICB2YXIgbXMgPSBwZ25cbiAgICAgICAgLnJlcGxhY2UoaGVhZGVyX3N0cmluZywgJycpXG4gICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgIC8qIGVuY29kZSBjb21tZW50cyBzbyB0aGV5IGRvbid0IGdldCBkZWxldGVkIGJlbG93ICovXG4gICAgICAgICAgbmV3IFJlZ0V4cChgKFxce1tefV0qXFx9KSs/fDsoW14ke21hc2sobmV3bGluZV9jaGFyKX1dKilgLCAnZycpLFxuICAgICAgICAgIGZ1bmN0aW9uIChtYXRjaCwgYnJhY2tldCwgc2VtaWNvbG9uKSB7XG4gICAgICAgICAgICByZXR1cm4gYnJhY2tldCAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgID8gZW5jb2RlX2NvbW1lbnQoYnJhY2tldClcbiAgICAgICAgICAgICAgOiAnICcgKyBlbmNvZGVfY29tbWVudChgeyR7c2VtaWNvbG9uLnNsaWNlKDEpfX1gKVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKG1hc2sobmV3bGluZV9jaGFyKSwgJ2cnKSwgJyAnKVxuXG4gICAgICAvKiBkZWxldGUgcmVjdXJzaXZlIGFubm90YXRpb24gdmFyaWF0aW9ucyAqL1xuICAgICAgdmFyIHJhdl9yZWdleCA9IC8oXFwoW15cXChcXCldK1xcKSkrPy9nXG4gICAgICB3aGlsZSAocmF2X3JlZ2V4LnRlc3QobXMpKSB7XG4gICAgICAgIG1zID0gbXMucmVwbGFjZShyYXZfcmVnZXgsICcnKVxuICAgICAgfVxuXG4gICAgICAvKiBkZWxldGUgbW92ZSBudW1iZXJzICovXG4gICAgICBtcyA9IG1zLnJlcGxhY2UoL1xcZCtcXC4oXFwuXFwuKT8vZywgJycpXG5cbiAgICAgIC8qIGRlbGV0ZSAuLi4gaW5kaWNhdGluZyBibGFjayB0byBtb3ZlICovXG4gICAgICBtcyA9IG1zLnJlcGxhY2UoL1xcLlxcLlxcLi9nLCAnJylcblxuICAgICAgLyogZGVsZXRlIG51bWVyaWMgYW5ub3RhdGlvbiBnbHlwaHMgKi9cbiAgICAgIG1zID0gbXMucmVwbGFjZSgvXFwkXFxkKy9nLCAnJylcblxuICAgICAgLyogdHJpbSBhbmQgZ2V0IGFycmF5IG9mIG1vdmVzICovXG4gICAgICB2YXIgbW92ZXMgPSB0cmltKG1zKS5zcGxpdChuZXcgUmVnRXhwKC9cXHMrLykpXG5cbiAgICAgIC8qIGRlbGV0ZSBlbXB0eSBlbnRyaWVzICovXG4gICAgICBtb3ZlcyA9IG1vdmVzLmpvaW4oJywnKS5yZXBsYWNlKC8sLCsvZywgJywnKS5zcGxpdCgnLCcpXG4gICAgICB2YXIgbW92ZSA9ICcnXG5cbiAgICAgIHZhciByZXN1bHQgPSAnJ1xuXG4gICAgICBmb3IgKHZhciBoYWxmX21vdmUgPSAwOyBoYWxmX21vdmUgPCBtb3Zlcy5sZW5ndGg7IGhhbGZfbW92ZSsrKSB7XG4gICAgICAgIHZhciBjb21tZW50ID0gZGVjb2RlX2NvbW1lbnQobW92ZXNbaGFsZl9tb3ZlXSlcbiAgICAgICAgaWYgKGNvbW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXSA9IGNvbW1lbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgbW92ZSA9IG1vdmVfZnJvbV9zYW4obW92ZXNbaGFsZl9tb3ZlXSwgc2xvcHB5KVxuXG4gICAgICAgIC8qIGludmFsaWQgbW92ZSAqL1xuICAgICAgICBpZiAobW92ZSA9PSBudWxsKSB7XG4gICAgICAgICAgLyogd2FzIHRoZSBtb3ZlIGFuIGVuZCBvZiBnYW1lIG1hcmtlciAqL1xuICAgICAgICAgIGlmIChURVJNSU5BVElPTl9NQVJLRVJTLmluZGV4T2YobW92ZXNbaGFsZl9tb3ZlXSkgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbW92ZXNbaGFsZl9tb3ZlXVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLyogcmVzZXQgdGhlIGVuZCBvZiBnYW1lIG1hcmtlciBpZiBtYWtpbmcgYSB2YWxpZCBtb3ZlICovXG4gICAgICAgICAgcmVzdWx0ID0gJydcbiAgICAgICAgICBtYWtlX21vdmUobW92ZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKiBQZXIgc2VjdGlvbiA4LjIuNiBvZiB0aGUgUEdOIHNwZWMsIHRoZSBSZXN1bHQgdGFnIHBhaXIgbXVzdCBtYXRjaFxuICAgICAgICogbWF0Y2ggdGhlIHRlcm1pbmF0aW9uIG1hcmtlci4gT25seSBkbyB0aGlzIHdoZW4gaGVhZGVycyBhcmUgcHJlc2VudCxcbiAgICAgICAqIGJ1dCB0aGUgcmVzdWx0IHRhZyBpcyBtaXNzaW5nXG4gICAgICAgKi9cbiAgICAgIGlmIChyZXN1bHQgJiYgT2JqZWN0LmtleXMoaGVhZGVyKS5sZW5ndGggJiYgIWhlYWRlclsnUmVzdWx0J10pIHtcbiAgICAgICAgc2V0X2hlYWRlcihbJ1Jlc3VsdCcsIHJlc3VsdF0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcblxuICAgIGhlYWRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNldF9oZWFkZXIoYXJndW1lbnRzKVxuICAgIH0sXG5cbiAgICB0dXJuOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdHVyblxuICAgIH0sXG5cbiAgICBtb3ZlOiBmdW5jdGlvbiAobW92ZSwgb3B0aW9ucykge1xuICAgICAgLyogVGhlIG1vdmUgZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCB3aXRoIGluIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczpcbiAgICAgICAqXG4gICAgICAgKiAubW92ZSgnTnhiNycpICAgICAgPC0gd2hlcmUgJ21vdmUnIGlzIGEgY2FzZS1zZW5zaXRpdmUgU0FOIHN0cmluZ1xuICAgICAgICpcbiAgICAgICAqIC5tb3ZlKHsgZnJvbTogJ2g3JywgPC0gd2hlcmUgdGhlICdtb3ZlJyBpcyBhIG1vdmUgb2JqZWN0IChhZGRpdGlvbmFsXG4gICAgICAgKiAgICAgICAgIHRvIDonaDgnLCAgICAgIGZpZWxkcyBhcmUgaWdub3JlZClcbiAgICAgICAqICAgICAgICAgcHJvbW90aW9uOiAncScsXG4gICAgICAgKiAgICAgIH0pXG4gICAgICAgKi9cblxuICAgICAgLy8gYWxsb3cgdGhlIHVzZXIgdG8gc3BlY2lmeSB0aGUgc2xvcHB5IG1vdmUgcGFyc2VyIHRvIHdvcmsgYXJvdW5kIG92ZXJcbiAgICAgIC8vIGRpc2FtYmlndWF0aW9uIGJ1Z3MgaW4gRnJpdHogYW5kIENoZXNzYmFzZVxuICAgICAgdmFyIHNsb3BweSA9XG4gICAgICAgIHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJyAmJiAnc2xvcHB5JyBpbiBvcHRpb25zXG4gICAgICAgICAgPyBvcHRpb25zLnNsb3BweVxuICAgICAgICAgIDogZmFsc2VcblxuICAgICAgdmFyIG1vdmVfb2JqID0gbnVsbFxuXG4gICAgICBpZiAodHlwZW9mIG1vdmUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG1vdmVfb2JqID0gbW92ZV9mcm9tX3Nhbihtb3ZlLCBzbG9wcHkpXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb3ZlID09PSAnb2JqZWN0Jykge1xuICAgICAgICB2YXIgbW92ZXMgPSBnZW5lcmF0ZV9tb3ZlcygpXG5cbiAgICAgICAgLyogY29udmVydCB0aGUgcHJldHR5IG1vdmUgb2JqZWN0IHRvIGFuIHVnbHkgbW92ZSBvYmplY3QgKi9cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1vdmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgbW92ZS5mcm9tID09PSBhbGdlYnJhaWMobW92ZXNbaV0uZnJvbSkgJiZcbiAgICAgICAgICAgIG1vdmUudG8gPT09IGFsZ2VicmFpYyhtb3Zlc1tpXS50bykgJiZcbiAgICAgICAgICAgICghKCdwcm9tb3Rpb24nIGluIG1vdmVzW2ldKSB8fFxuICAgICAgICAgICAgICBtb3ZlLnByb21vdGlvbiA9PT0gbW92ZXNbaV0ucHJvbW90aW9uKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgbW92ZV9vYmogPSBtb3Zlc1tpXVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogZmFpbGVkIHRvIGZpbmQgbW92ZSAqL1xuICAgICAgaWYgKCFtb3ZlX29iaikge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuXG4gICAgICAvKiBuZWVkIHRvIG1ha2UgYSBjb3B5IG9mIG1vdmUgYmVjYXVzZSB3ZSBjYW4ndCBnZW5lcmF0ZSBTQU4gYWZ0ZXIgdGhlXG4gICAgICAgKiBtb3ZlIGlzIG1hZGVcbiAgICAgICAqL1xuICAgICAgdmFyIHByZXR0eV9tb3ZlID0gbWFrZV9wcmV0dHkobW92ZV9vYmopXG5cbiAgICAgIG1ha2VfbW92ZShtb3ZlX29iailcblxuICAgICAgcmV0dXJuIHByZXR0eV9tb3ZlXG4gICAgfSxcblxuICAgIHVuZG86IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtb3ZlID0gdW5kb19tb3ZlKClcbiAgICAgIHJldHVybiBtb3ZlID8gbWFrZV9wcmV0dHkobW92ZSkgOiBudWxsXG4gICAgfSxcblxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gY2xlYXIoKVxuICAgIH0sXG5cbiAgICBwdXQ6IGZ1bmN0aW9uIChwaWVjZSwgc3F1YXJlKSB7XG4gICAgICByZXR1cm4gcHV0KHBpZWNlLCBzcXVhcmUpXG4gICAgfSxcblxuICAgIGdldDogZnVuY3Rpb24gKHNxdWFyZSkge1xuICAgICAgcmV0dXJuIGdldChzcXVhcmUpXG4gICAgfSxcblxuICAgIGFzY2lpKCkge1xuICAgICAgdmFyIHMgPSAnICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcXG4nXG4gICAgICBmb3IgKHZhciBpID0gU1FVQVJFX01BUC5hODsgaSA8PSBTUVVBUkVfTUFQLmgxOyBpKyspIHtcbiAgICAgICAgLyogZGlzcGxheSB0aGUgcmFuayAqL1xuICAgICAgICBpZiAoZmlsZShpKSA9PT0gMCkge1xuICAgICAgICAgIHMgKz0gJyAnICsgJzg3NjU0MzIxJ1tyYW5rKGkpXSArICcgfCdcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIGVtcHR5IHBpZWNlICovXG4gICAgICAgIGlmIChib2FyZFtpXSA9PSBudWxsKSB7XG4gICAgICAgICAgcyArPSAnIC4gJ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldLnR5cGVcbiAgICAgICAgICB2YXIgY29sb3IgPSBib2FyZFtpXS5jb2xvclxuICAgICAgICAgIHZhciBzeW1ib2wgPVxuICAgICAgICAgICAgY29sb3IgPT09IFdISVRFID8gcGllY2UudG9VcHBlckNhc2UoKSA6IHBpZWNlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBzICs9ICcgJyArIHN5bWJvbCArICcgJ1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChpICsgMSkgJiAweDg4KSB7XG4gICAgICAgICAgcyArPSAnfFxcbidcbiAgICAgICAgICBpICs9IDhcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcyArPSAnICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcXG4nXG4gICAgICBzICs9ICcgICAgIGEgIGIgIGMgIGQgIGUgIGYgIGcgIGgnXG5cbiAgICAgIHJldHVybiBzXG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKHNxdWFyZSkge1xuICAgICAgcmV0dXJuIHJlbW92ZShzcXVhcmUpXG4gICAgfSxcblxuICAgIHBlcmZ0OiBmdW5jdGlvbiAoZGVwdGgpIHtcbiAgICAgIHJldHVybiBwZXJmdChkZXB0aClcbiAgICB9LFxuXG4gICAgc3F1YXJlX2NvbG9yOiBmdW5jdGlvbiAoc3F1YXJlKSB7XG4gICAgICBpZiAoc3F1YXJlIGluIFNRVUFSRV9NQVApIHtcbiAgICAgICAgdmFyIHNxXzB4ODggPSBTUVVBUkVfTUFQW3NxdWFyZV1cbiAgICAgICAgcmV0dXJuIChyYW5rKHNxXzB4ODgpICsgZmlsZShzcV8weDg4KSkgJSAyID09PSAwID8gJ2xpZ2h0JyA6ICdkYXJrJ1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG5cbiAgICBoaXN0b3J5OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgdmFyIHJldmVyc2VkX2hpc3RvcnkgPSBbXVxuICAgICAgdmFyIG1vdmVfaGlzdG9yeSA9IFtdXG4gICAgICB2YXIgdmVyYm9zZSA9XG4gICAgICAgIHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAndmVyYm9zZScgaW4gb3B0aW9ucyAmJlxuICAgICAgICBvcHRpb25zLnZlcmJvc2VcblxuICAgICAgd2hpbGUgKGhpc3RvcnkubGVuZ3RoID4gMCkge1xuICAgICAgICByZXZlcnNlZF9oaXN0b3J5LnB1c2godW5kb19tb3ZlKCkpXG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChyZXZlcnNlZF9oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIG1vdmUgPSByZXZlcnNlZF9oaXN0b3J5LnBvcCgpXG4gICAgICAgIGlmICh2ZXJib3NlKSB7XG4gICAgICAgICAgbW92ZV9oaXN0b3J5LnB1c2gobWFrZV9wcmV0dHkobW92ZSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW92ZV9oaXN0b3J5LnB1c2gobW92ZV90b19zYW4obW92ZSwgZ2VuZXJhdGVfbW92ZXMoeyBsZWdhbDogdHJ1ZSB9KSkpXG4gICAgICAgIH1cbiAgICAgICAgbWFrZV9tb3ZlKG1vdmUpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb3ZlX2hpc3RvcnlcbiAgICB9LFxuXG4gICAgZ2V0X2NvbW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBjb21tZW50c1tnZW5lcmF0ZV9mZW4oKV1cbiAgICB9LFxuXG4gICAgc2V0X2NvbW1lbnQ6IGZ1bmN0aW9uIChjb21tZW50KSB7XG4gICAgICBjb21tZW50c1tnZW5lcmF0ZV9mZW4oKV0gPSBjb21tZW50LnJlcGxhY2UoJ3snLCAnWycpLnJlcGxhY2UoJ30nLCAnXScpXG4gICAgfSxcblxuICAgIGRlbGV0ZV9jb21tZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29tbWVudCA9IGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXVxuICAgICAgZGVsZXRlIGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXVxuICAgICAgcmV0dXJuIGNvbW1lbnRcbiAgICB9LFxuXG4gICAgZ2V0X2NvbW1lbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBwcnVuZV9jb21tZW50cygpXG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoY29tbWVudHMpLm1hcChmdW5jdGlvbiAoZmVuKSB7XG4gICAgICAgIHJldHVybiB7IGZlbjogZmVuLCBjb21tZW50OiBjb21tZW50c1tmZW5dIH1cbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGRlbGV0ZV9jb21tZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgcHJ1bmVfY29tbWVudHMoKVxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbW1lbnRzKS5tYXAoZnVuY3Rpb24gKGZlbikge1xuICAgICAgICB2YXIgY29tbWVudCA9IGNvbW1lbnRzW2Zlbl1cbiAgICAgICAgZGVsZXRlIGNvbW1lbnRzW2Zlbl1cbiAgICAgICAgcmV0dXJuIHsgZmVuOiBmZW4sIGNvbW1lbnQ6IGNvbW1lbnQgfVxuICAgICAgfSlcbiAgICB9LFxuICB9XG59IiwiaW1wb3J0IHtcbiAgICBjc3YsXG4gICAgc2VsZWN0LFxuICAgIHNlbGVjdEFsbCxcbiAgICBzY2FsZUxpbmVhcixcbiAgICBzY2FsZU9yZGluYWwsXG4gICAganNvbixcbiAgfSBmcm9tICdkMyc7XG4gIGltcG9ydCB7IENoZXNzIH0gZnJvbSAnLi9jaGVzcy5qcydcbiAgXG4gIC8vIExvYWQgdGhlIENTViBmaWxlXG4gIHZhciB3aGl0ZVNxdWFyZUdyZXkgPSAnI2E5YTlhOSdcbiAgdmFyIGJsYWNrU3F1YXJlR3JleSA9ICcjNjk2OTY5J1xuICBjb25zdCBjaGVzczEgPSBuZXcgQ2hlc3MoKVxuICB2YXIgZ2FtZSA9IG5ldyBDaGVzcygpXG4gIHZhciBnYW1lZWxpdGUgPSBuZXcgQ2hlc3MoKVxuICBcbiAgLy9jaGVzczEubG9hZF9wZ24oXCIxLiBkNCBkNSAyLiBjNCBlNSAzLiBkeGU1IGQ0IDQuIGUzIEJiNCsgNS4gQmQyIGR4ZTMgNi4gQnhiNCBleGYyKyA3LiBLZTIgZnhnMT1OKyA4LiBSaHhnMVwiKVxuICAvLzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmM0IE5kNCA0LiBOeGU1IFFnNSA1LiBOeGY3IFF4ZzIgNi4gUmhmMVxuICAvL3IxYnFrMW5yL3BwcHAxcHBwLzJuNS8yYjFwMy8yQjFQMy81TjIvUFBQUDFQUFAvUk5CUUsyUiB3IEtRa3EgLSA0IDRcbiAgLy9yMWJxazFuci9wcHBwMXBwcC8ybjUvMmIxcDMvMkIxUDMvNU4yL1BQUFAxUFBQL1JOQlFLMlJcbiAgLy9lNC1lNS1OZjMtTmM2LUJjNC1OZDQtTnhlNS1RZzUtTnhmNy1ReGcyLVJoZjFcbiAgY2hlc3MxLm1vdmUoXCJlNFwiKVxuICBjaGVzczEubW92ZShcImU1XCIpXG4gIGNoZXNzMS5tb3ZlKFwiTmYzXCIpXG4gIGNoZXNzMS5tb3ZlKFwiTmM2XCIpXG4gIGNoZXNzMS5tb3ZlKFwiQmM0XCIpXG4gIGNoZXNzMS5tb3ZlKFwiTmQ0XCIpXG4gIGNoZXNzMS5tb3ZlKFwiTnhlNVwiKVxuICBjaGVzczEubW92ZShcIlFnNVwiKVxuICBjaGVzczEubW92ZShcIk54ZjdcIilcbiAgY2hlc3MxLm1vdmUoXCJReGcyXCIpXG4gIGNvbnNvbGUubG9nKGNoZXNzMS5wZ24oKSlcbiAgY2hlc3MxLm1vdmUoXCJSaGYxXCIpXG4gIGNvbnNvbGUubG9nKGNoZXNzMS5mZW4oKSlcbiAgdmFyIHJ1eUxvcGV6ID1cbiAgICAncjFicWtibnIvcHBwcDFwcHAvMm41LzFCMnAzLzRQMy81TjIvUFBQUDFQUFAvUk5CUUsyUic7XG4gIHZhciBib2FyZCA9IENoZXNzYm9hcmQoJ215Qm9hcmQnLCBcInN0YXJ0XCIpO1xuICB2YXIgYm9hcmRlbGl0ZSA9IENoZXNzYm9hcmQoJ215Qm9hcmRlbGl0ZScsIFwic3RhcnRcIik7XG4gIGNvbnN0IHZpZXdTaXplID0gMTAwMDtcbiAgLy9jaGVzc2JvYXJkIGFuZCBncmFwaGljIGRpbWVuc2lvbnNcbi8vICBjb25zdCBjaGVzc2JvYXJkd2lkdGggPSAyNTA7XG4vL2NvbnN0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGggLTUgLSBjaGVzc2JvYXJkd2lkdGg7XG4vLyAgY29uc3Qgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aC8yIC01O1xuXHRjb25zdCB3aWR0aCA9IHZpZXdTaXplKjMvNDtcblx0Y29uc29sZS5sb2cod2luZG93LmlubmVyV2lkdGgpO1xuICBjb25zb2xlLmxvZyh3aW5kb3cuaW5uZXJIZWlnaHQpO1xuLy8gIGNvbnN0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIDU7XG4vL1x0Y29uc3QgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0LzIgLTU7XG4gY29uc3QgaGVpZ2h0ID0gdmlld1NpemUqMy80O1xuLy8gIGNvbnN0IGJyZWFkY3J1bWJXaWR0aCA9IDc1O1xuLy9cdGNvbnN0IGJyZWFkY3J1bWJXaWR0aCA9IDc1LzI7XG5cdGNvbnN0IGJyZWFkY3J1bWJXaWR0aCA9IHZpZXdTaXplLzIwO1xuLy8gIGNvbnN0IGJyZWFkY3J1bWJIZWlnaHQgPSAzMDtcbi8vXHRjb25zdCBicmVhZGNydW1iSGVpZ2h0ID0gMzAvMjtcblx0Y29uc3QgYnJlYWRjcnVtYkhlaWdodCA9IHZpZXdTaXplLzUwO1x0XG4gIGNvbnN0IHJhZGl1cyA9IHdpZHRoIC8gMjtcbi8vICBjb25zdCBjZW50ZXJYID0gd2lkdGggLyAxNiArIGNoZXNzYm9hcmR3aWR0aDsgLy8gWC1jb29yZGluYXRlIG9mIHRoZSBkZXNpcmVkIGNlbnRlciBwb3NpdGlvblxuLy8gIGNvbnN0IGNlbnRlclkgPSBoZWlnaHQvMzA7XG5cdGNvbnN0IGNlbnRlclggPSAwO1xuXHRjb25zdCBjZW50ZXJZID0wO1xuICAvLyBlMyBlNCBkNCBnMyBiNFxuICBcbiAgLy8gY29uc3Qgc3ZnID0gc2VsZWN0KCdib2R5JylcbiAgLy8gICAuYXBwZW5kKCdzdmcnKVxuICAvLyAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAvLyAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG4gIC8vIC5hdHRyKCdjbGFzcycsJ3N1bmJ1cnN0LWNoZXNzJylcbiAgLy8gXHQuYXR0cihcbiAgLy8gICAgICd0cmFuc2Zvcm0nLFxuICAvLyAgICAgYHRyYW5zbGF0ZSgke2NlbnRlclh9LCAkey0yMCpjZW50ZXJZfSlgXG4gIC8vICAgKVxuICAvLyBcdC5hdHRyKFxuICAvLyAgICAgJ3ZpZXdCb3gnLFxuICAvLyAgICAgYCR7LXJhZGl1c30gJHstcmFkaXVzfSAke3dpZHRofSAke3dpZHRofWBcbiAgLy8gICApOyAvLyBBcHBseSB0cmFuc2xhdGlvbiB0byBjZW50ZXIgdGhlIFNWRyBlbGVtZW50XG4gIFxuICBjb25zdCBhcmMgPSBkM1xuICAgIC5hcmMoKVxuICAgIC5zdGFydEFuZ2xlKChkKSA9PiBkLngwKVxuICAgIC5lbmRBbmdsZSgoZCkgPT4gZC54MSlcbiAgICAucGFkQW5nbGUoMSAvIHJhZGl1cylcbiAgICAucGFkUmFkaXVzKHJhZGl1cylcbiAgICAuaW5uZXJSYWRpdXMoKGQpID0+IE1hdGguc3FydChkLnkwKSlcbiAgICAub3V0ZXJSYWRpdXMoKGQpID0+IE1hdGguc3FydChkLnkxKSAtIDEpO1xuICBjb25zdCBtb3VzZWFyYyA9IGQzXG4gICAgLmFyYygpXG4gICAgLnN0YXJ0QW5nbGUoKGQpID0+IGQueDApXG4gICAgLmVuZEFuZ2xlKChkKSA9PiBkLngxKVxuICAgIC5pbm5lclJhZGl1cygoZCkgPT4gTWF0aC5zcXJ0KGQueTApKVxuICAgIC5vdXRlclJhZGl1cyhyYWRpdXMpO1xuICBcbiAgLy8gc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgLy8gICAuYXR0cihcImRcIiwgYXJjR2VuZXJhdG9yKVxuICAvLyAgIC5hdHRyKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xuICAvLyBzdmcuYXBwZW5kKFwicGF0aFwiKVxuICAvLyAgIC5hdHRyKFwiZFwiLCBhcmNHZW5lcmF0b3IxKVxuICAvLyAgIC5hdHRyKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xuICBcbiAgLy8gLy8gR2V0IHRoZSBET00gbm9kZSBvZiB0aGUgU1ZHIGVsZW1lbnRcbiAgLy8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdmcubm9kZSgpKTtcbiAgLy8gY29uc3QgZWxlbWVudCA9IHN2Zy5ub2RlKCk7XG4gIC8vIGVsZW1lbnQudmFsdWUgPSB7IHNlcXVlbmNlOiBbXSwgcGVyY2VudGFnZTogMC4wIH07XG4gIC8vY29uc29sZS5sb2coZWxlbWVudCk7XG4gIFxuICAvLyBwb3NzaWJsZSBjb2xvcnNcbiAgY29uc3QgY29sb3IgPSBzY2FsZU9yZGluYWwoKVxuICAgIC5kb21haW4oWydlMy0wJywgJ2UzLTEnLCdlNC0wJywnZTQtMScsICdkNC0wJywnZDQtMScsICdnMy0wJywgJ2czLTEnLCdiNC0wJywnYjQtMScsJ2YzLTAnLCdmMy0xJywnZDMtMCcsJ2QzLTEnXSlcbiAgICAucmFuZ2UoW1xuICAgICAgJyNmZmMwY2InLFxuICAgICAgJyM4MDAwMDAnLFxuICAgICAgJyM5MEVFOTAnLFxuICAgICAgJyMwMDgwMDAnLFxuICAgICAgJyNhZGQ4ZTYnLFxuICAgICAgJyMwMDAwODAnLFxuICAgICAgJyNmZjAwZmYnLFxuICAgICAgJyM4MDAwODAnLFxuICAgICAgJyNmZmZmMDAnLFxuICAgICAgJyM4MDgwMDAnLFxuICAgICAgICAgICcjZDNkM2QzJyxcbiAgICAgICcjODA4MDgwJyxcbiAgICAgICcjZmZhNTAwJyxcbiAgICAgICcjZmY4YzAwJyxcbiAgICBdKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJiaXNob3BcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuaWQpXG4gICAgXG4gICAgICAgICAgICB2YXIgc3ZnSW1hZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN2Z0ltYWdlXCIpO1xuICAgIGNvbnNvbGUubG9nKHN2Z0ltYWdlLnNyYylcbiAgICAgICAgc3ZnSW1hZ2Uuc3JjID0gdGhpcy5pZCArXCIuc3ZnXCI7XG4gICAgdmFyIGhlYXRtYXB0ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWF0bWFwdGl0bGVcIilcbiAgICBoZWF0bWFwdGV4dC50ZXh0Q29udGVudCA9IFwiQmlzaG9wc1wiXG4gICAgdmFyIGhlYXRtYXB0bWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGVhdG1hcC1tYWluXCIpXG4gICAgaGVhdG1hcHRtYWluLnRleHRDb250ZW50ID0gXCJUYXJnZXQgeW91ciBvcHBvbmVudCdzIHdlYWsgZiBwYXduISBQaW4geW91ciBvcHBvbmVudCdzIGtuaWdodFwiXG4gICAgdmFyIGhlYXRtYXB0Y29tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWF0bWFwLWNvbW1lbnRcIilcbiAgICBoZWF0bWFwdGNvbS50ZXh0Q29udGVudCA9IFwiTm90ZSB0aGF0IGYgcGF3biBpcyBvbmx5IHByb3RlY3RlZCBieSBlYWNoIGtpbmcuIEluIHRoZSBvcGVuaW5nIHN0YWdlLCBpZiB5b3UgYXJlIGEgYmVnaW5uZXIsIGl0J3MgaW50dWl0aXZlIHRvIGRldmVsb3AgeW91ciBsaWdodCBzcXVhcmUgYmlzaG9wIChyZXNwLiBkYXJrIHNxdWFyZSBiaXNob3AgaW4gYmxhY2sncyBwZXJzcGVjdGl2ZSkgdG8gdGhlIGM0IHNxdWFyZSAocmVzcC4gYzUgc3F1YXJlIGluIGJsYWNrJ3MgcGVyc3BlY3RpdmUpLiBJZiB5b3UncmUgd2hpdGUsIG5vcm1hbGx5LCB5b3VyIG9wcG9uZW50J3Mga25pZ2h0IHdpbGwgYmUgZGV2ZWxvcGVkIHRvIGM2IG9yIGY2IHNxdWFyZS4gSGVuY2UgaXRzIGFsc28gZ29vZCBpbiBtYW55IGNhc2VzIHRvIGRldmVsb3AgeW91ciBiaXNob3Agd2l0aCB0ZW1wbyB0byBiNSBvciBnNSBzcXVhcmUgaW4gb3JkZXIgdG8gcmVzdHJpY3QgdGhlIG1vYmlsaXR5IG9mIHRoZSBrbmlnaHQuIFRoaXMgaXMgY2FsbGVkIHBpbiBpbiBjaGVzcy5cIlxuICB9KTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJraW5nXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkKVxuICAgIFxuICAgICAgICAgICAgdmFyIHN2Z0ltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdmdJbWFnZVwiKTtcbiAgICBjb25zb2xlLmxvZyhzdmdJbWFnZS5zcmMpXG4gICAgICAgIHN2Z0ltYWdlLnNyYyA9IHRoaXMuaWQgK1wiLnN2Z1wiO1xudmFyIGhlYXRtYXB0ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWF0bWFwdGl0bGVcIilcbiAgICBoZWF0bWFwdGV4dC50ZXh0Q29udGVudCA9IFwiS2luZ3NcIlxuICAgIHZhciBoZWF0bWFwdG1haW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImhlYXRtYXAtbWFpblwiKVxuICAgIGhlYXRtYXB0bWFpbi50ZXh0Q29udGVudCA9IFwiS2VlcCB5b3VyIGtpbmcgc2FmZSEgQ2FzdGxlIGVhcmx5LlwiXG4gICAgdmFyIGhlYXRtYXB0Y29tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWF0bWFwLWNvbW1lbnRcIilcbiAgICBoZWF0bWFwdGNvbS50ZXh0Q29udGVudCA9IFwiVGhlIGNoZXNzIGtpbmcgaXMgdnVsbmVyYWJsZTsgcHJpb3JpdGl6ZSBpdHMgc2FmZXR5LiBDYXN0bGUgZWFybHksIHByZWZlcmFibHkga2luZ3NpZGUuIEtpbmdzaWRlIGNhc3RsaW5nIGlzIG1vcmUgY29tbW9uIHRoYW4gdGhlIHF1ZWVuc2lkZSBvbmUgZXZlbiBhdCB0b3AgbGV2ZWxzLlwiXG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1ZWVuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkKVxuICAgIFxuICAgICAgICAgICAgdmFyIHN2Z0ltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdmdJbWFnZVwiKTtcbiAgICBjb25zb2xlLmxvZyhzdmdJbWFnZS5zcmMpXG4gICAgICAgIHN2Z0ltYWdlLnNyYyA9IHRoaXMuaWQgK1wiLnN2Z1wiO1xuICAgIHZhciBoZWF0bWFwdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGVhdG1hcHRpdGxlXCIpXG4gICAgaGVhdG1hcHRleHQudGV4dENvbnRlbnQgPSBcIlF1ZWVuc1wiXG4gICAgdmFyIGhlYXRtYXB0bWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGVhdG1hcC1tYWluXCIpXG4gICAgaGVhdG1hcHRtYWluLnRleHRDb250ZW50ID0gXCJUcmVhdCB5b3VyIHF1ZWVuIHdlbGwuIE5vdCBvbmx5IGluIGxpZmUsIGJ1dCBhbHNvIGluIGNoZXNzIVwiXG4gICAgdmFyIGhlYXRtYXB0Y29tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWF0bWFwLWNvbW1lbnRcIilcbiAgICBoZWF0bWFwdGNvbS50ZXh0Q29udGVudCA9XCJUaGUgcXVlZW4gaXMgdGhlIHN0cm9uZ2VzdCBwaWVjZSBpbiBjaGVzcywgcmVxdWlyaW5nIHByb3RlY3Rpb24gYW5kIGVmZmVjdGl2ZSB1c2UuIEhlYXQgbWFwcyBpbmRpY2F0ZSBoaWdoIG9jY3VwYW5jeSBvbiBhNCwgYTUsIGg0LCBhbmQgaDUgc3F1YXJlcyBkdWUgdG8gcG90ZW50aWFsIGNoZWNrcyBhbmQgY2FwdHVyaW5nIHVuZGVmZW5kZWQgcGllY2VzLiBUaGUgb2NjdXBhdGlvbiBvZiBmMyBieSB0aGUgcXVlZW4gbGFja3MgYSBjbGVhciBleHBsYW5hdGlvbiwgcG9zaW5nIGFuIG9wZW4gcHJvYmxlbS5cIlxuICB9KTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb29rXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkKVxuICAgIFxuICAgICAgICAgICAgdmFyIHN2Z0ltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdmdJbWFnZVwiKTtcbiAgICBjb25zb2xlLmxvZyhzdmdJbWFnZS5zcmMpXG4gICAgICAgIHN2Z0ltYWdlLnNyYyA9IHRoaXMuaWQgK1wiLnN2Z1wiO1xuICAgIHZhciBoZWF0bWFwdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGVhdG1hcHRpdGxlXCIpXG4gICAgaGVhdG1hcHRleHQudGV4dENvbnRlbnQgPSBcIlJvb2tzXCJcbiAgICB2YXIgaGVhdG1hcHRtYWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWF0bWFwLW1haW5cIilcbiAgICBoZWF0bWFwdG1haW4udGV4dENvbnRlbnQgPSBcIkNvbm5lY3QgdGhlIHJvb2tzLCBzdXBwb3J0IHRoZSBjZW50ZXIhXCJcbiAgICB2YXIgaGVhdG1hcHRjb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImhlYXRtYXAtY29tbWVudFwiKVxuICAgIGhlYXRtYXB0Y29tLnRleHRDb250ZW50ID1cIlJvb2tzIG9uIGggZmlsZSB0eXBpY2FsbHkgY29tZXMgdG8gZjEgKGY4IGluIGJsYWNrJ3MgcGVyc3BlY3RpdmUpIGFmdGVyIGtpbmdzaWRlIGNhc3RsaW5nLiBUaGF0J3Mgd2h5IGYxIGFuZCBmOCBhcmUgb2NjdXBpZWQgYnkgcm9va3Mgc28gZnJlcXVlbnRseS4gTm93IGxldCB5b3VyIHR3byByb29rcyBkZWZlbmQgZWFjaCBvdGhlciBhbmQgZmlnaHQgZm9yIG9wZW4gZmlsZXMuIEluIGEgbnVtYmVyIG9mIHNpdHVhdGlvbnMsIHJvb2tzIHdhbnQgdG8gc3VwcG9ydCB0aGUgdHdvIGNlbnRlcmVkIGZpbGVzIChkIGFuZCBlIGZpbGVzKS5cIlxuICAgIFxuICB9KTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXduXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkKVxuICAgIFxuICAgICAgICAgICAgdmFyIHN2Z0ltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdmdJbWFnZVwiKTtcbiAgICBjb25zb2xlLmxvZyhzdmdJbWFnZS5zcmMpXG4gICAgICAgIHN2Z0ltYWdlLnNyYyA9IHRoaXMuaWQgK1wiLnN2Z1wiO1xuICAgIHZhciBoZWF0bWFwdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGVhdG1hcHRpdGxlXCIpXG4gICAgaGVhdG1hcHRleHQudGV4dENvbnRlbnQgPSBcIlBhd25zXCJcbiAgICB2YXIgaGVhdG1hcHRtYWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWF0bWFwLW1haW5cIilcbiAgICBoZWF0bWFwdG1haW4udGV4dENvbnRlbnQgPSBcIkNvbnRyb2wgdGhlIGNlbnRlciFcIlxuICAgIHZhciBoZWF0bWFwdGNvbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGVhdG1hcC1jb21tZW50XCIpXG4gICAgaGVhdG1hcHRjb20udGV4dENvbnRlbnQgPVwiQ29udHJvbCB0aGUgY2VudGVyIGJ5IHBsYWNpbmcgYXR0YWNraW5nIHBpZWNlcyBvbiBjZW50cmFsIHNxdWFyZXMuIGU0IGFuZCBkNCAoZTUgYW5kIGQ1IGZvciBibGFjaykgYXJlIGNvbW1vbiBmb3IgdGhpcy4gUHVzaGluZyB0aGUgYyBwYXduIHByb3RlY3RzIHRoZSBjZW50ZXIuIEF2b2lkIHBsYXlpbmcgZjMgKGY2IGZvciBCbGFjaykgYXMgaXQgd2Vha2VucyB0aGUgY2FzdGxlZCBraW5nLlwiXG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImtuaWdodFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5pZClcbiAgICBcbiAgICAgICAgICAgIHZhciBzdmdJbWFnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3ZnSW1hZ2VcIik7XG4gICAgY29uc29sZS5sb2coc3ZnSW1hZ2Uuc3JjKVxuICAgICAgICBzdmdJbWFnZS5zcmMgPSB0aGlzLmlkICtcIi5zdmdcIjtcbiBcdFx0dmFyIGhlYXRtYXB0ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWF0bWFwdGl0bGVcIilcbiAgICBoZWF0bWFwdGV4dC50ZXh0Q29udGVudCA9IFwiS25pZ2h0c1wiXG4gICAgdmFyIGhlYXRtYXB0bWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGVhdG1hcC1tYWluXCIpXG4gICAgaGVhdG1hcHRtYWluLnRleHRDb250ZW50ID0gXCJDb250cm9sIHRoZSBjZW50ZXIhXCJcbiAgICB2YXIgaGVhdG1hcHRjb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImhlYXRtYXAtY29tbWVudFwiKVxuICAgIGhlYXRtYXB0Y29tLnRleHRDb250ZW50ID0gXCJDb250cm9sbGluZyB0aGUgY2VudGVyIGlzIGFuIGltcG9ydGFudCB0aGVtZSBpbiBjaGVzcy4gRGV2ZWxvcCB5b3VyIGtuaWdodCB0byBjMyBhbmQgZjMgc3F1YXJlcyAoYzYgYW5kIGY2IGluIGJsYWNrJ3MgcGVyc3BlY3RpdmUpIGluIHRoZSBiZWdpbm5pbmcgc3RhZ2Ugb2YgdGhlIGdhbWUuIFNvbWV0aW1lcyB0aGV5IGNvbWUgdG8gZDIgb3IgZTIgc3F1YXJlcyAoZDcgb3IgZTcgaW4gYmxhY2sncyBwZXJzcGVjdGl2ZSkgdG8gc3VwcG9ydCBhbm90aGVyIGtuaWdodC5cIlxuICB9KTtcbiAgbGV0IGNsaWNrbW9kZSA9IGZhbHNlXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xpY2ttb2RlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBjbGlja21vZGUgPSBmYWxzZTtcbiAgfSk7XG4gIGxldCBjbGlja21vZGVlbGl0ZSA9IGZhbHNlXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xpY2ttb2RlLWVsaXRlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBjbGlja21vZGVlbGl0ZSA9IGZhbHNlO1xuICB9KTtcbiAgY29uc3QgcGFydGl0aW9uID0gKGRhdGEpID0+XG4gICAgZDNcbiAgICAgIC5wYXJ0aXRpb24oKVxuICAgICAgLnNpemUoWzIgKiBNYXRoLlBJLCByYWRpdXMgKiByYWRpdXNdKShcbiAgICAgIGQzXG4gICAgICAgIC5oaWVyYXJjaHkoZGF0YSlcbiAgICAgICAgLnN1bSgoZCkgPT4gZC52YWx1ZSlcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIudmFsdWUgLSBhLnZhbHVlKVxuICAgICk7XG4gIFxuICAvLyBjb25zdCBsYWJlbCA9IHN2Z1xuICAvLyAgIC5hcHBlbmQoJ3RleHQnKVxuICAvLyAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAvLyAgIC5hdHRyKCdmaWxsJywgJ2JsdWUnKVxuICAvLyAgIC5zdHlsZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgXG4gIC8vIGxhYmVsXG4gIC8vICAgLmFwcGVuZCgndHNwYW4nKVxuICAvLyAgIC5hdHRyKCdjbGFzcycsICdwZXJjZW50YWdlJylcbiAgLy8gICAuYXR0cigneCcsIDApXG4gIC8vICAgLmF0dHIoJ3knLCAwKVxuICAvLyAgIC5hdHRyKCdkeScsICctMC4xZW0nKVxuICAvLyAgIC5hdHRyKCdmb250LXNpemUnLCAnM2VtJylcbiAgLy8gICAudGV4dCgnJyk7XG4gIFxuICAvLyBsYWJlbFxuICAvLyAgIC5hcHBlbmQoJ3RzcGFuJylcbiAgLy8gICAuYXR0cigneCcsIDApXG4gIC8vICAgLmF0dHIoJ3knLCAwKVxuICAvLyAgIC5hdHRyKCdkeScsICcyLjVlbScpXG4gIC8vICAgLnRleHQoJ29mIGNoZXNzIHBsYXllcnMgcGxheWluZyBpbiB0aGlzIHdheScpO1xuICBcbiAgLy8gYWRkaW5nIHNsaWRlclxuICAgIGxldCBzbGlkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICdkYXRlU2xpZGVyMSdcbiAgICApO1xuICAgIGxldCByYXRlc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAncmF0ZVNsaWRlcidcbiAgICApO1xuICAgIGxldCBlbGl0ZXNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgJ3JhdGVTbGlkZXItZWxpdGUnXG4gICAgKTtcbiAgbGV0IHNsaWRlclZhbHVlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzbGlkZXJWYWx1ZVwiKTtcbiAgbGV0IHJhdGVWYWx1ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmF0ZVZhbHVlXCIpO1xuICBsZXQgZWxpdGVWYWx1ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmF0ZVZhbHVlLWVsaXRlXCIpO1xuICBsZXQgbGV2ZWxWYWx1ZSA9IDBcbiAgbGV0IGxldmVsVmFsdWVlbGl0ZSA9IDBcbiAgbGV0IGZpbGVuYW1lID0gJzM1MDAtNDAwMC5jc3YnXG4gIGxldCBmaWxlbmFtZWVsaXRlID0gJ2VsaXRlLmNzdidcbiAgLy9sZXQgZmlsZW5hbWUgPSAnMjAxNS0xMi5jc3YnXG4gIGNvbnNvbGUubG9nKHJhdGVzbGlkZXIpXG4gIHJhdGVzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSBwYXJzZUludCh0aGlzLnZhbHVlKTtcbiAgICBsZXQgdGV4dCA9IFwiXCJcbiAgICBzd2l0Y2ggKGluZGV4KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGxldmVsVmFsdWUgPSAwXG4gICAgICAgIHRleHQgPSBcIlRvcCA1MDBcIlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgbGV2ZWxWYWx1ZSA9IDFcbiAgICAgICAgdGV4dCA9IFwiNTAwLTEwMDBcIlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgbGV2ZWxWYWx1ZSA9IDJcbiAgICAgICAgdGV4dCA9IFwiMTAwMC0xNTAwXCJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGxldmVsVmFsdWUgPSAzXG4gICAgICAgIHRleHQgPSBcIjE1MDAtMjAwMFwiXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICBsZXZlbFZhbHVlID0gNFxuICAgICAgICB0ZXh0ID0gXCIyMDAwLTI1MDBcIlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgbGV2ZWxWYWx1ZSA9IDVcbiAgICAgICAgdGV4dCA9IFwiMjUwMC0zMDAwXCJcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJhdGVWYWx1ZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIHNlbGVjdEFsbCgnLnN1bmJ1cnN0LXBhdGgnKS5yZW1vdmUoKVxuICAgICAgc2VsZWN0QWxsKCcuc3VuYnVyc3QtcGF0aC1tb3VzZScpLnJlbW92ZSgpXG4gICAgICBzZWxlY3RBbGwoJy5wZXJjZW50YWdlJykucmVtb3ZlKClcbiAgICAgIHNlbGVjdEFsbCgnLmdhbWUtdGV4dCcpLnJlbW92ZSgpXG4gICAgICAgICAgICAgIHNlbGVjdEFsbCgnLnN0ZXBzJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuc3RlcHMtY2xpY2snKS5yZW1vdmUoKTtcbiAgICBjbGlja21vZGU9ZmFsc2VcbiAgICBnZW5lcmF0ZVN1bmJ1cnN0KGZpbGVuYW1lLGlucHV0LGxldmVsVmFsdWUpXG4gIH0pXG4gIGVsaXRlc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JyxmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUubG9nKFwiaW4gZWxpdGVcIilcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHBhcnNlSW50KHRoaXMudmFsdWUpO1xuICAgIGxldCB0ZXh0ID0gXCJcIlxuICAgIHN3aXRjaCAoaW5kZXgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgbGV2ZWxWYWx1ZWVsaXRlID0gMFxuICAgICAgICB0ZXh0ID0gXCJUb3AgNTAwXCJcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGxldmVsVmFsdWVlbGl0ZSA9IDFcbiAgICAgICAgdGV4dCA9IFwiNTAwLTEwMDBcIlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgbGV2ZWxWYWx1ZWVsaXRlID0gMlxuICAgICAgICB0ZXh0ID0gXCIxMDAwLTE1MDBcIlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgbGV2ZWxWYWx1ZWVsaXRlID0gM1xuICAgICAgICB0ZXh0ID0gXCIxNTAwLTIwMDBcIlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgbGV2ZWxWYWx1ZWVsaXRlID0gNFxuICAgICAgICB0ZXh0ID0gXCIyMDAwLTIxMDBcIlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgbGV2ZWxWYWx1ZWVsaXRlID0gNVxuICAgICAgICB0ZXh0ID0gXCIyNTAwLTMwMDBcIlxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgZWxpdGVWYWx1ZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIHNlbGVjdEFsbCgnLnN1bmJ1cnN0LXBhdGgtZWxpdGUnKS5yZW1vdmUoKVxuICAgICAgc2VsZWN0QWxsKCcuc3VuYnVyc3QtcGF0aC1tb3VzZS1lbGl0ZScpLnJlbW92ZSgpXG4gICAgICBzZWxlY3RBbGwoJy5wZXJjZW50YWdlLWVsaXRlJykucmVtb3ZlKClcbiAgICAgIHNlbGVjdEFsbCgnLmdhbWUtdGV4dC1lbGl0ZScpLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICBzZWxlY3RBbGwoJy5zdGVwcy1lbGl0ZScpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLnN0ZXBzLWNsaWNrLWVsaXRlJykucmVtb3ZlKCk7XG4gICAgY2xpY2ttb2RlZWxpdGUgPSBmYWxzZVxuICAgIFxuICAgIGdlbmVyYXRlU3VuYnVyc3RFbGl0ZShmaWxlbmFtZWVsaXRlLGlucHV0ZWxpdGUsbGV2ZWxWYWx1ZWVsaXRlKVxuICB9KVxuICAvL2NvbnN0IGlucHV0ID0gXCIxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJjNCBOZjYgNC4gTmc1XCJcbiAgY29uc3QgaW5wdXQgPSBcIlwiXG4gIGNvbnN0IGlucHV0ZWxpdGUgPSBcIlwiXG4gIGdlbmVyYXRlU3VuYnVyc3QoZmlsZW5hbWUsaW5wdXQsMClcblx0Z2VuZXJhdGVTdW5idXJzdEVsaXRlKGZpbGVuYW1lZWxpdGUsaW5wdXQsMClcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXdnYW1lXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICBnYW1lID0gbmV3IENoZXNzKClcbiAgICAgIHNlbGVjdEFsbCgnLnN1bmJ1cnN0LXBhdGgnKS5yZW1vdmUoKVxuICAgICAgc2VsZWN0QWxsKCcuc3VuYnVyc3QtcGF0aC1tb3VzZScpLnJlbW92ZSgpXG4gICAgICBzZWxlY3RBbGwoJy5wZXJjZW50YWdlJykucmVtb3ZlKClcbiAgICAgIHNlbGVjdEFsbCgnLmdhbWUtdGV4dCcpLnJlbW92ZSgpXG4gICAgICAgICAgICAgIHNlbGVjdEFsbCgnLnN0ZXBzJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuc3RlcHMtY2xpY2snKS5yZW1vdmUoKTtcbiAgICBjbGlja21vZGUgPSBmYWxzZVxuICAgIGdlbmVyYXRlU3VuYnVyc3QoZmlsZW5hbWUsaW5wdXQsbGV2ZWxWYWx1ZSlcbiAgfSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3Z2FtZS1lbGl0ZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgZ2FtZSA9IG5ldyBDaGVzcygpXG4gICAgICBzZWxlY3RBbGwoJy5zdW5idXJzdC1wYXRoLWVsaXRlJykucmVtb3ZlKClcbiAgICAgIHNlbGVjdEFsbCgnLnN1bmJ1cnN0LXBhdGgtbW91c2UtZWxpdGUnKS5yZW1vdmUoKVxuICAgICAgc2VsZWN0QWxsKCcucGVyY2VudGFnZS1lbGl0ZScpLnJlbW92ZSgpXG4gICAgICBzZWxlY3RBbGwoJy5nYW1lLXRleHQtZWxpdGUnKS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdEFsbCgnLnN0ZXBzLWVsaXRlJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuc3RlcHMtY2xpY2stZWxpdGUnKS5yZW1vdmUoKTtcbiAgICBjbGlja21vZGVlbGl0ZSA9IGZhbHNlXG4gICAgZ2VuZXJhdGVTdW5idXJzdEVsaXRlKGZpbGVuYW1lZWxpdGUsaW5wdXRlbGl0ZSxsZXZlbFZhbHVlZWxpdGUpXG4gIH0pO1xuICAvL3NlbGVjdEFsbCgnLnN1bmJ1cnN0LWNoZXNzJykucmVtb3ZlKClcbiAgLy9jb25zdCB0YXJnZXRGaWxlcyA9IFsnMjAxNC0wMS5jc3YnLCcyMDE0LTAxLTIuY3N2JywnMjAxNC0wMS0zLmNzdiddXG4gIGNvbnN0IHRhcmdldEZpbGVzID0gWycyMDE1LTEyLTEuY3N2JywgJzIwMTUtMTItMi5jc3YnLCAnMjAxNS0xMi0zLmNzdiddXG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2cobGV2ZWxWYWx1ZSlcbiAgICAgIGNvbnN0IGluZGV4ID0gcGFyc2VJbnQodGhpcy52YWx1ZSk7XG4gICAgICBsZXQgdGV4dCA9IFwiXCI7XG4gICAgc3dpdGNoIChpbmRleCkge1xuICAgICAgY2FzZSAwOlxuICAvLyAgICAgIHRleHQgPSBcIlBvcHVsYXIgR2FtZXNcIjtcbiAgICAgICAgICAgIHRleHQgPSBcIjM1MDAtNDAwMFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgLy8gICAgICB0ZXh0ID0gXCJNZWRpdW0gZnJlcXVlbmN5XCI7XG4gICAgICAgICAgICB0ZXh0ID0gXCIzMDAwLTM1MDBcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gIC8vICAgICAgdGV4dCA9IFwiTmljaGUgR2FtZXNcIjtcbiAgICAgICAgICAgIHRleHQgPSBcIjI1MDAtMzAwMFwiO1xuICAgICAgICBicmVhaztcbiAgICAgY2FzZSAzOlxuICAgICAgICAgICB0ZXh0ID0gXCIyMDAwLTI1MDBcIjtcbiAgICAgICBicmVhaztcbiAgICAgY2FzZSA0OlxuICAgICAgICAgICB0ZXh0ID0gXCIxNTAwLTIwMDBcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgXHRjYXNlIDU6XG4gICAgICAgICAgdGV4dCA9IFwiMTAwMC0xNTAwXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGV4dCA9IFwiXCI7XG4gICAgfVxuICAgICAgY29uc29sZS5sb2codGV4dClcbiAgICAgIHNsaWRlclZhbHVlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgIGNsaWNrbW9kZSA9IGZhbHNlXG4gICAgICBzZWxlY3RBbGwoJy5wZXJjZW50YWdlJykucmVtb3ZlKClcbiAgICAgIHNlbGVjdEFsbCgnLmdhbWUtdGV4dCcpLnJlbW92ZSgpXG4gICAgICAgICAgc2VsZWN0QWxsKCcuc3VuYnVyc3QtcGF0aCcpLnJlbW92ZSgpXG4gICAgICBzZWxlY3RBbGwoJy5zdW5idXJzdC1wYXRoLW1vdXNlJykucmVtb3ZlKClcbiAgICAgICAgICAgICAgICBzZWxlY3RBbGwoJy5zdGVwcycpLnJlbW92ZSgpO1xuICAgICAgICAgIHNlbGVjdEFsbCgnLnN0ZXBzLWNsaWNrJykucmVtb3ZlKCk7XG4gICAgICBjb25zdCBuZXdOYW1lID0gdGFyZ2V0RmlsZXNbaW5kZXhdO1xuICAgICAgLy9maWxlbmFtZSA9IG5ld05hbWU7XG4gICAgICBmaWxlbmFtZSA9IHRleHQrXCIuY3N2XCJcbiAgXG4gICAgICBjb25zb2xlLmxvZyhmaWxlbmFtZSk7XG4gICAgICBnZW5lcmF0ZVN1bmJ1cnN0KGZpbGVuYW1lLGlucHV0LGxldmVsVmFsdWUpXG4gICAgICAgICAgLy8gZGF0ZSB0byBodW1hbiByZWFkYWJsZSBxdWFydGVyXG4gICAgICAvLyBpZiAoXG4gICAgICAvLyAgIHRhcmdldERhdGUuZ2V0VGltZSgpID09PVxuICAgICAgLy8gICB0YXJnZXREYXRlc1swXS5nZXRUaW1lKClcbiAgICAgIC8vICkge1xuICAgICAgLy8gICBzZWFzb24gPSAnT2N0LURlYywgMjAxNic7XG4gICAgICAvLyB9XG4gICAgfSk7XG4gIFxuICAvLyBnZW5lcmF0ZVN1bmJ1cnN0KGZpbGVuYW1lKVxuICBmdW5jdGlvbiBnZW5lcmF0ZVN1bmJ1cnN0KGZpbGVuYW1lLGlucHV0LGxpbmVpbmRleCl7XG4gIGNzdihmaWxlbmFtZSlcbiAgICAudGhlbigocGFyc2VkRGF0YSkgPT4ge1xuICAgICAgY29uc29sZS5sb2cocGFyc2VkRGF0YSk7XG4gICAgICAvL2NvbnNvbGUubG9nKHBhcnNlZERhdGFbMV0ucGduKVxuICAgICAgcmV0dXJuIGJ1aWxkSGllcmFyY2h5KHBhcnNlZERhdGEuc2xpY2UoMCtsaW5laW5kZXgqNTAwLCA1MDArbGluZWluZGV4KjUwMCkpO1xuICAgIC8vcmV0dXJuIGJ1aWxkSGllcmFyY2h5KHBhcnNlZERhdGEpXG4gICAgfSlcbiAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKVxuICAgICAgY29uc3Qgcm9vdCA9IHBhcnRpdGlvbihkYXRhKTtcbiAgLy8gICBjb25zdCBzdmcgPSBzZWxlY3QoJ2JvZHknKVxuICAvLyAgIC5hcHBlbmQoJ3N2ZycpXG4gIC8vICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gIC8vICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbiAgLy8gLy8uYXR0cignY2xhc3MnLCdzdW5idXJzdC1jaGVzcycpXG4gIC8vIFx0LmF0dHIoXG4gIC8vICAgICAndHJhbnNmb3JtJyxcbiAgLy8gICAgIGB0cmFuc2xhdGUoJHtjZW50ZXJYfSwgJHstMjIqY2VudGVyWX0pYFxuICAvLyAgIClcbiAgLy8gXHQuYXR0cihcbiAgLy8gICAgICd2aWV3Qm94JyxcbiAgLy8gICAgIGAkey1yYWRpdXN9ICR7LXJhZGl1c30gJHt3aWR0aH0gJHt3aWR0aH1gXG4gIC8vICAgKTtcbiAgICAvL2NvbnN0IHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VuYnVyc3RcIik7XG4gICAgY29uc3Qgc3ZnID0gc2VsZWN0KFwiI3N1bmJ1cnN0XCIpO1xuICAgICAgY29uc29sZS5sb2coc3ZnKVxuICAgIGNvbnN0IGVsZW1lbnQgPSBzdmcubm9kZSgpO1xuICBlbGVtZW50LnZhbHVlID0geyBzZXF1ZW5jZTogW10sIHBlcmNlbnRhZ2U6IDAuMCB9O1xuICAgIGNvbnN0IGxhYmVsID0gc3ZnXG4gICAgLmFwcGVuZCgndGV4dCcpXG4gICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgLmF0dHIoJ2ZpbGwnLCAnYmx1ZScpXG4gICAgLnN0eWxlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICBcbiAgbGFiZWxcbiAgICAuYXBwZW5kKCd0c3BhbicpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ3BlcmNlbnRhZ2UnKVxuICAgIC5hdHRyKCd4JywgMClcbiAgICAuYXR0cigneScsIDApXG4gICAgLmF0dHIoJ2R5JywgJy0wLjFlbScpXG4gICAgLmF0dHIoJ2ZvbnQtc2l6ZScsICcyZW0nKVxuICAgIC50ZXh0KCcnKTtcbiAgXG4gIGxhYmVsXG4gICAgLmFwcGVuZCgndHNwYW4nKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwnZ2FtZS10ZXh0JylcbiAgICAuYXR0cigneCcsIDApXG4gICAgLmF0dHIoJ3knLCAwKVxuICAgIC5hdHRyKCdkeScsICcyZW0nKVxuICAgIC50ZXh0KCdHYW1lcycpO1xuICAgICAgY29uc3QgcGF0aCA9IHN2Z1xuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLnNlbGVjdEFsbCgncGF0aCcpXG4gICAgICAgIC5kYXRhKFxuICAgICAgICAgIHJvb3QuZGVzY2VuZGFudHMoKS5maWx0ZXIoKGQpID0+IHtcbiAgICAgICAgICAgIC8vIERvbid0IGRyYXcgdGhlIHJvb3Qgbm9kZSwgYW5kIGZvciBlZmZpY2llbmN5LCBmaWx0ZXIgb3V0IG5vZGVzIHRoYXQgd291bGQgYmUgdG9vIHNtYWxsIHRvIHNlZVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgZC5kZXB0aCAmJiBkLngxIC0gZC54MCA+IDAuMDAwMDAxXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgICAgLmpvaW4oJ3BhdGgnKVxuICAgICAgXG4gICAgICAgIHBhdGguYXR0cignZmlsbCcsIChkYXRhKSA9PiB7XG4gICAgICAgICAgbGV0IGggPSBkYXRhLmRlcHRoIC0gMTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGgpXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoOyBpKyspIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coaSk7XG4gICAgICAgICAgICBkYXRhID0gZGF0YS5wYXJlbnQ7XG4gICAgICAgICAgfVxuICAvLyBjb2xvciB0aGUgYmxhY2sgcGxheWVyIGRhcmtlclxuICAgICAgICAgIGlmKGglMiA9PT0wKXtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yKGRhdGEuZGF0YS5uYW1lKyctMCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIHJldHVybiBjb2xvcihkYXRhLmRhdGEubmFtZSsnLTEnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKGRhdGEuZGF0YS5uYW1lKTtcbiAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICAgICAgLy8uYXR0cignZmlsbCcsJ2dvbGQnKVxuICAgICAgICAuYXR0cignZCcsIGFyYylcbiAgICAuYXR0cignY2xhc3MnLCdzdW5idXJzdC1wYXRoJyk7IC8vYnVpbGQgcGF0aCBlbmRcbiAgICAgICAgICBjb25zb2xlLmxvZyhyb290LmRlc2NlbmRhbnRzKCkpXG4gICAgICBzdmdcbiAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdmaWxsJywgJ25vbmUnKVxuICAgICAgICAuYXR0cigncG9pbnRlci1ldmVudHMnLCAnYWxsJylcbiAgICAgICAgLm9uKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICBpZihjbGlja21vZGUgPT09IGZhbHNlKXtcbiAgICAgICAgICBwYXRoLmF0dHIoJ2ZpbGwtb3BhY2l0eScsIDEpO1xuICAgICAgICAgIGxhYmVsLnN0eWxlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgdmFsdWUgb2YgdGhpcyB2aWV3XG4gICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHtcbiAgICAgICAgICAgIHNlcXVlbmNlOiBbXSxcbiAgICAgICAgICAgIHBlcmNlbnRhZ2U6IDAuMCxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudCgnaW5wdXQnKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnNlbGVjdEFsbCgncGF0aCcpXG4gICAgICAgIC5kYXRhKFxuICAgICAgICAgIHJvb3QuZGVzY2VuZGFudHMoKS5maWx0ZXIoKGQpID0+IHtcbiAgICAgICAgICAgIC8vIERvbid0IGRyYXcgdGhlIHJvb3Qgbm9kZSwgYW5kIGZvciBlZmZpY2llbmN5LCBmaWx0ZXIgb3V0IG5vZGVzIHRoYXQgd291bGQgYmUgdG9vIHNtYWxsIHRvIHNlZVxuICAgICAgICAgICAgcmV0dXJuIGQuZGVwdGggJiYgZC54MSAtIGQueDAgPiAwLjAwMTtcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICAgIC5qb2luKCdwYXRoJylcbiAgICAgICAgLmF0dHIoJ2QnLCBtb3VzZWFyYylcbiAgICAgIC5hdHRyKCdjbGFzcycsJ3N1bmJ1cnN0LXBhdGgtbW91c2UnKVxuICAgICAgICAub24oJ2NsaWNrJywgKGV2ZW50LCBkKSA9PiB7XG4gICAgICAgIGNsaWNrbW9kZSA9IHRydWVcbiAgICAgICAgICAvLyBHZXQgdGhlIGFuY2VzdG9ycyBvZiB0aGUgY3VycmVudCBzZWdtZW50LCBtaW51cyB0aGUgcm9vdFxuICAgICAgICAgIHNlbGVjdEFsbCgnLnN0ZXBzLWNsaWNrJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICBzZWxlY3RBbGwoJy5zdGVwcycpLnJlbW92ZSgpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGQpXG4gICAgICAgICAgY29uc3Qgc2VxdWVuY2UgPSBkXG4gICAgICAgICAgICAuYW5jZXN0b3JzKClcbiAgICAgICAgICAgIC5yZXZlcnNlKClcbiAgICAgICAgICAgIC5zbGljZSgxKTtcbiAgICAgICAgICAvLyBIaWdobGlnaHQgdGhlIGFuY2VzdG9yc1xuICAgICAgICBjb25zb2xlLmxvZyhzZXF1ZW5jZSlcbiAgICAgICAgICBwYXRoLmF0dHIoJ2ZpbGwtb3BhY2l0eScsIChub2RlKSA9PlxuICAgICAgICAgICAgc2VxdWVuY2UuaW5kZXhPZihub2RlKSA+PSAwID8gMS4wIDogMC4zXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gKFxuICAgICAgICAgICAgKDEwMCAqIGQudmFsdWUpIC9cbiAgICAgICAgICAgIHJvb3QudmFsdWVcbiAgICAgICAgICApLnRvUHJlY2lzaW9uKDMpO1xuICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAuc3R5bGUoJ3Zpc2liaWxpdHknLCBudWxsKVxuICAgICAgICAgICAgLnNlbGVjdCgnLnBlcmNlbnRhZ2UnKVxuICAgICAgICAgICAgLnRleHQocGVyY2VudGFnZSArICclJyk7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGlzIHZpZXcgd2l0aCB0aGUgY3VycmVudGx5IGhvdmVyZWQgc2VxdWVuY2UgYW5kIHBlcmNlbnRhZ2VcbiAgICAgICAgICBlbGVtZW50LnZhbHVlID0geyBzZXF1ZW5jZSwgcGVyY2VudGFnZSB9O1xuICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudCgnaW5wdXQnKVxuICAgICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICAvLycxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJjNCBCYzUnXG4gICAgICAgICAgbGV0IHN0ciA9IFwiXCI7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyggZWxlbWVudC52YWx1ZS5zZXF1ZW5jZSlcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDtpIDwgZWxlbWVudC52YWx1ZS5zZXF1ZW5jZS5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICBpZihpJTI9PT0wKXtcbiAgICAgICAgICAgICAgdmFyIG51bSA9IGkvMiArMTtcbiAgICAgICAgICAgICAgc3RyID0gc3RyK251bS50b1N0cmluZygpK1wiLiBcIlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyID1zdHIgK2VsZW1lbnQudmFsdWUuc2VxdWVuY2VbaV0uZGF0YS5uYW1lK1wiIFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgbGV0IGxhc3QgPSBlbGVtZW50LnZhbHVlLnNlcXVlbmNlW2VsZW1lbnQudmFsdWUuc2VxdWVuY2UubGVuZ3RoLTFdXG4gICAgICAgIGNvbnNvbGUubG9nKGxhc3QuZGF0YSlcbiAgICAgICAvLzEuIGU0IGU1IDIuIFFoNSBkNiAzLiBCYzQgTmY2IDQuIFF4ZjcjIFxuICAgICAgICAgIGNvbnNvbGUubG9nKHN0cik7XG4gICAgICAgIGlmKHN0ci5pbmNsdWRlcygnUmgnKSl7XG4gICAgICAgICAgICAgICAgZDMuY3N2KFwiMi5jc3ZcIikudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gQ29udmVydCB0aGUgZGF0YSBpbnRvIGEgSmF2YVNjcmlwdCBvYmplY3Qgb3IgbWFwXG4gICAgdmFyIGNzdkRhdGEgPSB7fTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgY3N2RGF0YVtkLnBnbl0gPSBkLmZlbjtcbiAgICB9KTtcbiAgXG4gICAgLy8gU2VhcmNoIGZvciBhIHZhbHVlIHVzaW5nIHRoZSBrZXlcbiAgICB2YXIga2V5ID0gXCJ5b3VyX2tleVwiO1xuICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhzdHIpXG4gICAgdmFyIHZhbHVlID0gY3N2RGF0YVtzdHIuc2xpY2UoMCwgc3RyLmxlbmd0aCAtIDEpXTtcbiAgICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB2YXIgYm9hcmQgPSBDaGVzc2JvYXJkKCdteUJvYXJkJywgdmFsdWUpO1xuICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBsb2FkaW5nIENTViBmaWxlOlwiLCBlcnJvcik7XG4gIH0pO1xuICAgICAgICAgLy8gdmFyIGJvYXJkID0gQ2hlc3Nib2FyZCgnbXlCb2FyZCcsIFwicjFiMWtibnIvcHBwcDFOcHAvOC84LzJCblAzLzgvUFBQUDFQcVAvUk5CUUtSMiBiIFFrcSAtIDEgNlwiKVxuICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2V7XHQvL2JvYXJkLmNsZWFyKGZhbHNlKVxuICAgICAgICBjb25zdCBjaGVzc25vdyA9IG5ldyBDaGVzcygpXG4gICAgICAgIGNoZXNzbm93LmxvYWRfcGduKHN0cilcbiAgICAgICAgY29uc29sZS5sb2coY2hlc3Nub3cuZmVuKCkpXG4gIFxuICAgICAgICB2YXIgYm9hcmQgPSBDaGVzc2JvYXJkKCdteUJvYXJkJywgY2hlc3Nub3cuZmVuKCkpO1xuICB9XG4gICAgICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RzcGFuJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdzdGVwcy1jbGljaycpXG4gICAgICAgICAgICAuYXR0cigneCcsIDApXG4gICAgICAgICAgICAuYXR0cigneScsIDQwMClcbiAgICAgICAgICAgIC5hdHRyKCdkeScsICctMC4xZW0nKVxuICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsICcyZW0nKVxuICAgICAgICAgICAgLnRleHQoc3RyKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdtb3VzZWVudGVyJywgKGV2ZW50LCBkKSA9PiB7XG4gICAgICAgICAgLy8gR2V0IHRoZSBhbmNlc3RvcnMgb2YgdGhlIGN1cnJlbnQgc2VnbWVudCwgbWludXMgdGhlIHJvb3RcbiAgICAgICAgaWYgKGNsaWNrbW9kZSA9PT0gZmFsc2Upe1xuICAgICAgICAgIHNlbGVjdEFsbCgnLnN0ZXBzJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuc3RlcHMtY2xpY2snKS5yZW1vdmUoKTtcbiAgICAgICAgICBjb25zdCBzZXF1ZW5jZSA9IGRcbiAgICAgICAgICAgIC5hbmNlc3RvcnMoKVxuICAgICAgICAgICAgLnJldmVyc2UoKVxuICAgICAgICAgICAgLnNsaWNlKDEpO1xuICAgICAgICAgIC8vIEhpZ2hsaWdodCB0aGUgYW5jZXN0b3JzXG4gICAgICAgICAgcGF0aC5hdHRyKCdmaWxsLW9wYWNpdHknLCAobm9kZSkgPT5cbiAgICAgICAgICAgIHNlcXVlbmNlLmluZGV4T2Yobm9kZSkgPj0gMCA/IDEuMCA6IDAuM1xuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IChcbiAgICAgICAgICAgICgxMDAgKiBkLnZhbHVlKSAvXG4gICAgICAgICAgICByb290LnZhbHVlXG4gICAgICAgICAgKS50b1ByZWNpc2lvbigzKTtcbiAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgLnN0eWxlKCd2aXNpYmlsaXR5JywgbnVsbClcbiAgICAgICAgICAgIC5zZWxlY3QoJy5wZXJjZW50YWdlJylcbiAgICAgICAgICAgIC50ZXh0KHBlcmNlbnRhZ2UgKyAnJScpO1xuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgdmFsdWUgb2YgdGhpcyB2aWV3IHdpdGggdGhlIGN1cnJlbnRseSBob3ZlcmVkIHNlcXVlbmNlIGFuZCBwZXJjZW50YWdlXG4gICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHsgc2VxdWVuY2UsIHBlcmNlbnRhZ2UgfTtcbiAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoJ2lucHV0JylcbiAgICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgLy8nMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYzQgQmM1J1xuICAgICAgICAgIGxldCBzdHIgPSBcIlwiO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coIGVsZW1lbnQudmFsdWUuc2VxdWVuY2UpXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7aSA8IGVsZW1lbnQudmFsdWUuc2VxdWVuY2UubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgaWYoaSUyPT09MCl7XG4gICAgICAgICAgICAgIHZhciBudW0gPSBpLzIgKzE7XG4gICAgICAgICAgICAgIHN0ciA9IHN0citudW0udG9TdHJpbmcoKStcIi4gXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ciA9c3RyICtlbGVtZW50LnZhbHVlLnNlcXVlbmNlW2ldLmRhdGEubmFtZStcIiBcIjtcbiAgICAgICAgICB9XG4gICAgICAgLy8xLiBlNCBlNSAyLiBRaDUgZDYgMy4gQmM0IE5mNiA0LiBReGY3IyBcbiAgICAgICAgICBjb25zb2xlLmxvZyhzdHIpO1xuICAgICAgICBpZihzdHIuaW5jbHVkZXMoJ1JoJykpe1xuICAgICAgICAgICAgICAgIGQzLmNzdihcIjIuY3N2XCIpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vIENvbnZlcnQgdGhlIGRhdGEgaW50byBhIEphdmFTY3JpcHQgb2JqZWN0IG9yIG1hcFxuICAgIHZhciBjc3ZEYXRhID0ge307XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgIGNzdkRhdGFbZC5wZ25dID0gZC5mZW47XG4gICAgfSk7XG4gIFxuICAgIC8vIFNlYXJjaCBmb3IgYSB2YWx1ZSB1c2luZyB0aGUga2V5XG4gICAgdmFyIGtleSA9IFwieW91cl9rZXlcIjtcbiAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coc3RyKVxuICAgIHZhciB2YWx1ZSA9IGNzdkRhdGFbc3RyLnNsaWNlKDAsIHN0ci5sZW5ndGggLSAxKV07XG4gICAgY29uc29sZS5sb2codmFsdWUpO1xuICAgICAgICAgICAgICAgICAgdmFyIGJvYXJkID0gQ2hlc3Nib2FyZCgnbXlCb2FyZCcsIHZhbHVlKTtcbiAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9hZGluZyBDU1YgZmlsZTpcIiwgZXJyb3IpO1xuICB9KTtcbiAgICAgICAgIC8vIHZhciBib2FyZCA9IENoZXNzYm9hcmQoJ215Qm9hcmQnLCBcInIxYjFrYm5yL3BwcHAxTnBwLzgvOC8yQm5QMy84L1BQUFAxUHFQL1JOQlFLUjIgYiBRa3EgLSAxIDZcIilcbiAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNle1x0Ly9ib2FyZC5jbGVhcihmYWxzZSlcbiAgICAgICAgY29uc3QgY2hlc3Nub3cgPSBuZXcgQ2hlc3MoKVxuICAgICAgICBjaGVzc25vdy5sb2FkX3BnbihzdHIpXG4gICAgICAgIGNvbnNvbGUubG9nKGNoZXNzbm93LmZlbigpKVxuICBcbiAgICAgICAgdmFyIGJvYXJkID0gQ2hlc3Nib2FyZCgnbXlCb2FyZCcsIGNoZXNzbm93LmZlbigpKTtcbiAgfVxuICAgICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAuYXBwZW5kKCd0c3BhbicpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnc3RlcHMnKVxuICAgICAgICAgICAgLmF0dHIoJ3gnLCAwKVxuICAgICAgICAgICAgLmF0dHIoJ3knLCA0MDApXG4gICAgICAgICAgICAuYXR0cignZHknLCAnLTAuMWVtJylcbiAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAnMmVtJylcbiAgICAgICAgICAgIC50ZXh0KHN0cik7XG4gICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICBkcmFnZ2FibGU6IHRydWUsXG4gICAgcG9zaXRpb246ICdzdGFydCcsXG4gICAgb25EcmFnU3RhcnQ6IG9uRHJhZ1N0YXJ0LFxuICAgIG9uRHJvcDogb25Ecm9wLFxuICAgIG9uTW91c2VvdXRTcXVhcmU6IG9uTW91c2VvdXRTcXVhcmUsXG4gICAgb25Nb3VzZW92ZXJTcXVhcmU6IG9uTW91c2VvdmVyU3F1YXJlLFxuICAgIG9uU25hcEVuZDogb25TbmFwRW5kXG4gIH1cbiAgYm9hcmQgPSBDaGVzc2JvYXJkKCdteUJvYXJkJywgY29uZmlnKVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyb290LmRlc2NlbmRhbnRzKCkpIC8vaGF2ZSBwYXRoXG4gICAgLy8xLiBlNCBlNSAyLiBRaDVcbiAgICAgICAgICAgIC8vY29uc3QgaW5wdXQgPSBcIjEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmM0IE5mNiA0LiBOZzVcIlxuICAgIGlmKGlucHV0IT09XCJcIil7XG4gICAgICAgICAgICBjb25zdCBvdXRwdXQgPSBpbnB1dC5yZXBsYWNlKC9cXGQrXFwuXFxzL2csIFwiXCIpLnJlcGxhY2UoL1xccy9nLCBcIi1cIik7XG4gICAgICAgICAgICBjb25zdCBzZXF1ZW5jZVN0ciA9IG91dHB1dC5zcGxpdChcIi1cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZXF1ZW5jZVN0cilcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkQXJyID0gc2VxdWVuY2VTdHIubWFwKChuYW1lLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVwdGggPSBpbmRleCArIDE7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5kZXNjZW5kYW50cygpLmZpbmQoaXRlbSA9PiBpdGVtLmRhdGEubmFtZSA9PT0gbmFtZSAmJiBpdGVtLmRlcHRoID09PSBkZXB0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zdCBoaWdoTGlnaHRTdW5idXJzdCA9IGZpbHRlcmVkQXJyXG4gICAgICAgICAgICBjb25zdCBoaWdoTGlnaHRTdW5idXJzdCA9IGZpbHRlcmVkQXJyLmZpbHRlcigoZCkgPT4ge1xuICAgICAgICAgICAgLy8gRG9uJ3QgZHJhdyB0aGUgcm9vdCBub2RlLCBhbmQgZm9yIGVmZmljaWVuY3ksIGZpbHRlciBvdXQgbm9kZXMgdGhhdCB3b3VsZCBiZSB0b28gc21hbGwgdG8gc2VlXG4gICAgICAgICAgICByZXR1cm4gZC5kZXB0aCAmJiBkLngxIC0gZC54MCA+IDAuMDAxO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaGlnaExpZ2h0U3VuYnVyc3QpXG4gICAgICAvL2NoZWNrXG4gICAgICBsZXQgdmFsaWRTdW5idXJzdCA9IHRydWVcbiAgICAgIHZhbGlkU3VuYnVyc3QgPSByb290LmRlc2NlbmRhbnRzKCkuaW5jbHVkZXMoaGlnaExpZ2h0U3VuYnVyc3RbMF0pO1xuICAgICAgY29uc29sZS5sb2codmFsaWRTdW5idXJzdClcbiAgICAgIGZvcihsZXQgaSA9IDE7aTxoaWdoTGlnaHRTdW5idXJzdC5sZW5ndGg7aSsrKXtcbiAgICAgICAgdmFsaWRTdW5idXJzdCA9IGhpZ2hMaWdodFN1bmJ1cnN0W2ktMV0uY2hpbGRyZW4uaW5jbHVkZXMoaGlnaExpZ2h0U3VuYnVyc3RbaV0pXG4gICAgICAgIGlmKHZhbGlkU3VuYnVyc3QgPT09ZmFsc2UpIHticmVhazt9XG4gICAgICAgICAgXG4gICAgICB9XG4gICAgICBpZih2YWxpZFN1bmJ1cnN0KXtcbiAgICAgICAgICAgICAgICAgICAgcGF0aC5hdHRyKCdmaWxsLW9wYWNpdHknLCAobm9kZSkgPT5cbiAgICAgICAgICAgIGhpZ2hMaWdodFN1bmJ1cnN0LmluZGV4T2Yobm9kZSkgPj0gMCA/IDEuMCA6IDAuM1xuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IChcbiAgICAgICAgICAgICgxMDAgKiBoaWdoTGlnaHRTdW5idXJzdFtoaWdoTGlnaHRTdW5idXJzdC5sZW5ndGggLSAxXS52YWx1ZSkgL1xuICAgICAgICAgICAgcm9vdC52YWx1ZVxuICAgICAgICAgICkudG9QcmVjaXNpb24oMyk7XG4gICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgIC5zdHlsZSgndmlzaWJpbGl0eScsIG51bGwpXG4gICAgICAgICAgICAuc2VsZWN0KCcucGVyY2VudGFnZScpXG4gICAgICAgICAgICAudGV4dChwZXJjZW50YWdlICsgJyUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAuc3R5bGUoJ3Zpc2liaWxpdHknLCBudWxsKVxuICAgICAgICAgICAgLnNlbGVjdCgnLnBlcmNlbnRhZ2UnKVxuICAgICAgICAgICAgLnRleHQoXCJObyBHYW1lc1wiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgICAgICAgLy8gLy8gVXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGlzIHZpZXcgd2l0aCB0aGUgY3VycmVudGx5IGhvdmVyZWQgc2VxdWVuY2UgYW5kIHBlcmNlbnRhZ2VcbiAgICAgICAgICAvLyBlbGVtZW50LnZhbHVlID0geyBzZXF1ZW5jZSwgcGVyY2VudGFnZSB9O1xuICAgICAgICAgIC8vIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAvLyAgIG5ldyBDdXN0b21FdmVudCgnaW5wdXQnKVxuICAgICAgICAgIC8vICk7XG4gICAgfSlcbiAgICBcbiAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvcjonLCBlcnJvcik7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gZ2VuZXJhdGVTdW5idXJzdEVsaXRlKGZpbGVuYW1lLGlucHV0LGxpbmVpbmRleCl7XG4gIGNzdihmaWxlbmFtZSlcbiAgICAudGhlbigocGFyc2VkRGF0YSkgPT4ge1xuICAgICAgY29uc29sZS5sb2cocGFyc2VkRGF0YSk7XG4gICAgICAvL2NvbnNvbGUubG9nKHBhcnNlZERhdGFbMV0ucGduKVxuICAgICAgcmV0dXJuIGJ1aWxkSGllcmFyY2h5KHBhcnNlZERhdGEuc2xpY2UoMCtsaW5laW5kZXgqNTAwLCA1MDArbGluZWluZGV4KjUwMCkpO1xuICAgIC8vcmV0dXJuIGJ1aWxkSGllcmFyY2h5KHBhcnNlZERhdGEpXG4gICAgfSlcbiAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKVxuICAgICAgY29uc3Qgcm9vdCA9IHBhcnRpdGlvbihkYXRhKTtcbiAgLy8gICBjb25zdCBzdmcgPSBzZWxlY3QoJ2JvZHknKVxuICAvLyAgIC5hcHBlbmQoJ3N2ZycpXG4gIC8vICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gIC8vICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbiAgLy8gLy8uYXR0cignY2xhc3MnLCdzdW5idXJzdC1jaGVzcycpXG4gIC8vIFx0LmF0dHIoXG4gIC8vICAgICAndHJhbnNmb3JtJyxcbiAgLy8gICAgIGB0cmFuc2xhdGUoJHtjZW50ZXJYfSwgJHstMjIqY2VudGVyWX0pYFxuICAvLyAgIClcbiAgLy8gXHQuYXR0cihcbiAgLy8gICAgICd2aWV3Qm94JyxcbiAgLy8gICAgIGAkey1yYWRpdXN9ICR7LXJhZGl1c30gJHt3aWR0aH0gJHt3aWR0aH1gXG4gIC8vICAgKTtcbiAgICAvL2NvbnN0IHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VuYnVyc3RcIik7XG4gICAgY29uc3Qgc3ZnID0gc2VsZWN0KFwiI3N1bmJ1cnN0LWVsaXRlXCIpO1xuICAgICAgY29uc29sZS5sb2coc3ZnKVxuICAgIGNvbnN0IGVsZW1lbnQgPSBzdmcubm9kZSgpO1xuICBlbGVtZW50LnZhbHVlID0geyBzZXF1ZW5jZTogW10sIHBlcmNlbnRhZ2U6IDAuMCB9O1xuICAgIGNvbnN0IGxhYmVsID0gc3ZnXG4gICAgLmFwcGVuZCgndGV4dCcpXG4gICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgLmF0dHIoJ2ZpbGwnLCAnYmx1ZScpXG4gICAgLnN0eWxlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICBcbiAgbGFiZWxcbiAgICAuYXBwZW5kKCd0c3BhbicpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ3BlcmNlbnRhZ2UtZWxpdGUnKVxuICAgIC5hdHRyKCd4JywgMClcbiAgICAuYXR0cigneScsIDApXG4gICAgLmF0dHIoJ2R5JywgJy0wLjFlbScpXG4gICAgLmF0dHIoJ2ZvbnQtc2l6ZScsICcyZW0nKVxuICAgIC50ZXh0KCcnKTtcbiAgXG4gIGxhYmVsXG4gICAgLmFwcGVuZCgndHNwYW4nKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwnZ2FtZS10ZXh0LWVsaXRlJylcbiAgICAuYXR0cigneCcsIDApXG4gICAgLmF0dHIoJ3knLCAwKVxuICAgIC5hdHRyKCdkeScsICcyZW0nKVxuICAgIC50ZXh0KCdHYW1lcycpO1xuICAgICAgY29uc3QgcGF0aCA9IHN2Z1xuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLnNlbGVjdEFsbCgncGF0aCcpXG4gICAgICAgIC5kYXRhKFxuICAgICAgICAgIHJvb3QuZGVzY2VuZGFudHMoKS5maWx0ZXIoKGQpID0+IHtcbiAgICAgICAgICAgIC8vIERvbid0IGRyYXcgdGhlIHJvb3Qgbm9kZSwgYW5kIGZvciBlZmZpY2llbmN5LCBmaWx0ZXIgb3V0IG5vZGVzIHRoYXQgd291bGQgYmUgdG9vIHNtYWxsIHRvIHNlZVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgZC5kZXB0aCAmJiBkLngxIC0gZC54MCA+IDAuMDAwMDAxXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgICAgLmpvaW4oJ3BhdGgnKVxuICAgICAgXG4gICAgICAgIHBhdGguYXR0cignZmlsbCcsIChkYXRhKSA9PiB7XG4gICAgICAgICAgbGV0IGggPSBkYXRhLmRlcHRoIC0gMTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGgpXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoOyBpKyspIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coaSk7XG4gICAgICAgICAgICBkYXRhID0gZGF0YS5wYXJlbnQ7XG4gICAgICAgICAgfVxuICAvLyBjb2xvciB0aGUgYmxhY2sgcGxheWVyIGRhcmtlclxuICAgICAgICAgIGlmKGglMiA9PT0wKXtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yKGRhdGEuZGF0YS5uYW1lKyctMCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgIHJldHVybiBjb2xvcihkYXRhLmRhdGEubmFtZSsnLTEnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKGRhdGEuZGF0YS5uYW1lKTtcbiAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICAgICAgLy8uYXR0cignZmlsbCcsJ2dvbGQnKVxuICAgICAgICAuYXR0cignZCcsIGFyYylcbiAgICAuYXR0cignY2xhc3MnLCdzdW5idXJzdC1wYXRoLWVsaXRlJyk7IC8vYnVpbGQgcGF0aCBlbmQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJvb3QuZGVzY2VuZGFudHMoKSlcbiAgICAgIHN2Z1xuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAgIC5hdHRyKCdwb2ludGVyLWV2ZW50cycsICdhbGwnKVxuICAgICAgICAub24oJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICAgIGlmKGNsaWNrbW9kZWVsaXRlID09PSBmYWxzZSl7XG4gICAgICAgICAgcGF0aC5hdHRyKCdmaWxsLW9wYWNpdHknLCAxKTtcbiAgICAgICAgICBsYWJlbC5zdHlsZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHZhbHVlIG9mIHRoaXMgdmlld1xuICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSB7XG4gICAgICAgICAgICBzZXF1ZW5jZTogW10sXG4gICAgICAgICAgICBwZXJjZW50YWdlOiAwLjAsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoJ2lucHV0JylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgICAgICAuZGF0YShcbiAgICAgICAgICByb290LmRlc2NlbmRhbnRzKCkuZmlsdGVyKChkKSA9PiB7XG4gICAgICAgICAgICAvLyBEb24ndCBkcmF3IHRoZSByb290IG5vZGUsIGFuZCBmb3IgZWZmaWNpZW5jeSwgZmlsdGVyIG91dCBub2RlcyB0aGF0IHdvdWxkIGJlIHRvbyBzbWFsbCB0byBzZWVcbiAgICAgICAgICAgIHJldHVybiBkLmRlcHRoICYmIGQueDEgLSBkLngwID4gMC4wMDE7XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgICAuam9pbigncGF0aCcpXG4gICAgICAgIC5hdHRyKCdkJywgbW91c2VhcmMpXG4gICAgICAuYXR0cignY2xhc3MnLCdzdW5idXJzdC1wYXRoLW1vdXNlLWVsaXRlJylcbiAgICAgICAgLm9uKCdjbGljaycsIChldmVudCwgZCkgPT4ge1xuICAgICAgICBjbGlja21vZGVlbGl0ZSA9IHRydWVcbiAgICAgICAgICAvLyBHZXQgdGhlIGFuY2VzdG9ycyBvZiB0aGUgY3VycmVudCBzZWdtZW50LCBtaW51cyB0aGUgcm9vdFxuICAgICAgICAgIHNlbGVjdEFsbCgnLnN0ZXBzLWNsaWNrLWVsaXRlJykucmVtb3ZlKCk7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuc3RlcHMtZWxpdGUnKS5yZW1vdmUoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhkKVxuICAgICAgICAgIGNvbnN0IHNlcXVlbmNlID0gZFxuICAgICAgICAgICAgLmFuY2VzdG9ycygpXG4gICAgICAgICAgICAucmV2ZXJzZSgpXG4gICAgICAgICAgICAuc2xpY2UoMSk7XG4gICAgICAgICAgLy8gSGlnaGxpZ2h0IHRoZSBhbmNlc3RvcnNcbiAgICAgICAgY29uc29sZS5sb2coc2VxdWVuY2UpXG4gICAgICAgICAgcGF0aC5hdHRyKCdmaWxsLW9wYWNpdHknLCAobm9kZSkgPT5cbiAgICAgICAgICAgIHNlcXVlbmNlLmluZGV4T2Yobm9kZSkgPj0gMCA/IDEuMCA6IDAuM1xuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IChcbiAgICAgICAgICAgICgxMDAgKiBkLnZhbHVlKSAvXG4gICAgICAgICAgICByb290LnZhbHVlXG4gICAgICAgICAgKS50b1ByZWNpc2lvbigzKTtcbiAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgLnN0eWxlKCd2aXNpYmlsaXR5JywgbnVsbClcbiAgICAgICAgICAgIC5zZWxlY3QoJy5wZXJjZW50YWdlLWVsaXRlJylcbiAgICAgICAgICAgIC50ZXh0KHBlcmNlbnRhZ2UgKyAnJScpO1xuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgdmFsdWUgb2YgdGhpcyB2aWV3IHdpdGggdGhlIGN1cnJlbnRseSBob3ZlcmVkIHNlcXVlbmNlIGFuZCBwZXJjZW50YWdlXG4gICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHsgc2VxdWVuY2UsIHBlcmNlbnRhZ2UgfTtcbiAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoJ2lucHV0JylcbiAgICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgLy8nMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYzQgQmM1J1xuICAgICAgICAgIGxldCBzdHIgPSBcIlwiO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coIGVsZW1lbnQudmFsdWUuc2VxdWVuY2UpXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7aSA8IGVsZW1lbnQudmFsdWUuc2VxdWVuY2UubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgaWYoaSUyPT09MCl7XG4gICAgICAgICAgICAgIHZhciBudW0gPSBpLzIgKzE7XG4gICAgICAgICAgICAgIHN0ciA9IHN0citudW0udG9TdHJpbmcoKStcIi4gXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ciA9c3RyICtlbGVtZW50LnZhbHVlLnNlcXVlbmNlW2ldLmRhdGEubmFtZStcIiBcIjtcbiAgICAgICAgICB9XG4gICAgICAgIGxldCBsYXN0ID0gZWxlbWVudC52YWx1ZS5zZXF1ZW5jZVtlbGVtZW50LnZhbHVlLnNlcXVlbmNlLmxlbmd0aC0xXVxuICAgICAgICBjb25zb2xlLmxvZyhsYXN0LmRhdGEpXG4gICAgICAgLy8xLiBlNCBlNSAyLiBRaDUgZDYgMy4gQmM0IE5mNiA0LiBReGY3IyBcbiAgICAgICAgICBjb25zb2xlLmxvZyhzdHIpO1xuICAgICAgICBpZihzdHIuaW5jbHVkZXMoJ1JoJykpe1xuICAgICAgICAgICAgICAgIGQzLmNzdihcIjIuY3N2XCIpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vIENvbnZlcnQgdGhlIGRhdGEgaW50byBhIEphdmFTY3JpcHQgb2JqZWN0IG9yIG1hcFxuICAgIHZhciBjc3ZEYXRhID0ge307XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgIGNzdkRhdGFbZC5wZ25dID0gZC5mZW47XG4gICAgfSk7XG4gIFxuICAgIC8vIFNlYXJjaCBmb3IgYSB2YWx1ZSB1c2luZyB0aGUga2V5XG4gICAgdmFyIGtleSA9IFwieW91cl9rZXlcIjtcbiAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coc3RyKVxuICAgIHZhciB2YWx1ZSA9IGNzdkRhdGFbc3RyLnNsaWNlKDAsIHN0ci5sZW5ndGggLSAxKV07XG4gICAgY29uc29sZS5sb2codmFsdWUpO1xuICAgICAgICAgICAgICAgICAgdmFyIGJvYXJkZWxpdGUgPSBDaGVzc2JvYXJkKCdteUJvYXJkZWxpdGUnLCB2YWx1ZSk7XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGxvYWRpbmcgQ1NWIGZpbGU6XCIsIGVycm9yKTtcbiAgfSk7XG4gICAgICAgICAvLyB2YXIgYm9hcmQgPSBDaGVzc2JvYXJkKCdteUJvYXJkJywgXCJyMWIxa2Juci9wcHBwMU5wcC84LzgvMkJuUDMvOC9QUFBQMVBxUC9STkJRS1IyIGIgUWtxIC0gMSA2XCIpXG4gICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZXtcdC8vYm9hcmQuY2xlYXIoZmFsc2UpXG4gICAgICAgIGNvbnN0IGNoZXNzbm93ID0gbmV3IENoZXNzKClcbiAgICAgICAgY2hlc3Nub3cubG9hZF9wZ24oc3RyKVxuICAgICAgICBjb25zb2xlLmxvZyhjaGVzc25vdy5mZW4oKSlcbiAgXG4gICAgICAgIHZhciBib2FyZGVsaXRlID0gQ2hlc3Nib2FyZCgnbXlCb2FyZGVsaXRlJywgY2hlc3Nub3cuZmVuKCkpO1xuICB9XG4gICAgICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RzcGFuJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdzdGVwcy1jbGljay1lbGl0ZScpXG4gICAgICAgICAgICAuYXR0cigneCcsIDApXG4gICAgICAgICAgICAuYXR0cigneScsIDQwMClcbiAgICAgICAgICAgIC5hdHRyKCdkeScsICctMC4xZW0nKVxuICAgICAgICAgICAgLmF0dHIoJ2ZvbnQtc2l6ZScsICcyZW0nKVxuICAgICAgICAgICAgLnRleHQoc3RyKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdtb3VzZWVudGVyJywgKGV2ZW50LCBkKSA9PiB7XG4gICAgICAgICAgLy8gR2V0IHRoZSBhbmNlc3RvcnMgb2YgdGhlIGN1cnJlbnQgc2VnbWVudCwgbWludXMgdGhlIHJvb3RcbiAgICAgICAgaWYgKGNsaWNrbW9kZWVsaXRlID09PSBmYWxzZSl7XG4gICAgICAgICAgc2VsZWN0QWxsKCcuc3RlcHMtZWxpdGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICBzZWxlY3RBbGwoJy5zdGVwcy1jbGljay1lbGl0ZScpLnJlbW92ZSgpO1xuICAgICAgICAgIGNvbnN0IHNlcXVlbmNlID0gZFxuICAgICAgICAgICAgLmFuY2VzdG9ycygpXG4gICAgICAgICAgICAucmV2ZXJzZSgpXG4gICAgICAgICAgICAuc2xpY2UoMSk7XG4gICAgICAgICAgLy8gSGlnaGxpZ2h0IHRoZSBhbmNlc3RvcnNcbiAgICAgICAgICBwYXRoLmF0dHIoJ2ZpbGwtb3BhY2l0eScsIChub2RlKSA9PlxuICAgICAgICAgICAgc2VxdWVuY2UuaW5kZXhPZihub2RlKSA+PSAwID8gMS4wIDogMC4zXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gKFxuICAgICAgICAgICAgKDEwMCAqIGQudmFsdWUpIC9cbiAgICAgICAgICAgIHJvb3QudmFsdWVcbiAgICAgICAgICApLnRvUHJlY2lzaW9uKDMpO1xuICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAuc3R5bGUoJ3Zpc2liaWxpdHknLCBudWxsKVxuICAgICAgICAgICAgLnNlbGVjdCgnLnBlcmNlbnRhZ2UtZWxpdGUnKVxuICAgICAgICAgICAgLnRleHQocGVyY2VudGFnZSArICclJyk7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGlzIHZpZXcgd2l0aCB0aGUgY3VycmVudGx5IGhvdmVyZWQgc2VxdWVuY2UgYW5kIHBlcmNlbnRhZ2VcbiAgICAgICAgICBlbGVtZW50LnZhbHVlID0geyBzZXF1ZW5jZSwgcGVyY2VudGFnZSB9O1xuICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudCgnaW5wdXQnKVxuICAgICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICAvLycxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJjNCBCYzUnXG4gICAgICAgICAgbGV0IHN0ciA9IFwiXCI7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyggZWxlbWVudC52YWx1ZS5zZXF1ZW5jZSlcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDtpIDwgZWxlbWVudC52YWx1ZS5zZXF1ZW5jZS5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICBpZihpJTI9PT0wKXtcbiAgICAgICAgICAgICAgdmFyIG51bSA9IGkvMiArMTtcbiAgICAgICAgICAgICAgc3RyID0gc3RyK251bS50b1N0cmluZygpK1wiLiBcIlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyID1zdHIgK2VsZW1lbnQudmFsdWUuc2VxdWVuY2VbaV0uZGF0YS5uYW1lK1wiIFwiO1xuICAgICAgICAgIH1cbiAgICAgICAvLzEuIGU0IGU1IDIuIFFoNSBkNiAzLiBCYzQgTmY2IDQuIFF4ZjcjIFxuICAgICAgICAgIGNvbnNvbGUubG9nKHN0cik7XG4gICAgICAgIGlmKHN0ci5pbmNsdWRlcygnUmgnKSl7XG4gICAgICAgICAgICAgICAgZDMuY3N2KFwiMi5jc3ZcIikudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gQ29udmVydCB0aGUgZGF0YSBpbnRvIGEgSmF2YVNjcmlwdCBvYmplY3Qgb3IgbWFwXG4gICAgdmFyIGNzdkRhdGEgPSB7fTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgY3N2RGF0YVtkLnBnbl0gPSBkLmZlbjtcbiAgICB9KTtcbiAgXG4gICAgLy8gU2VhcmNoIGZvciBhIHZhbHVlIHVzaW5nIHRoZSBrZXlcbiAgICB2YXIga2V5ID0gXCJ5b3VyX2tleVwiO1xuICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhzdHIpXG4gICAgdmFyIHZhbHVlID0gY3N2RGF0YVtzdHIuc2xpY2UoMCwgc3RyLmxlbmd0aCAtIDEpXTtcbiAgICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB2YXIgYm9hcmRlbGl0ZSA9IENoZXNzYm9hcmQoJ215Qm9hcmRlbGl0ZScsIHZhbHVlKTtcbiAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9hZGluZyBDU1YgZmlsZTpcIiwgZXJyb3IpO1xuICB9KTtcbiAgICAgICAgIC8vIHZhciBib2FyZCA9IENoZXNzYm9hcmQoJ215Qm9hcmQnLCBcInIxYjFrYm5yL3BwcHAxTnBwLzgvOC8yQm5QMy84L1BQUFAxUHFQL1JOQlFLUjIgYiBRa3EgLSAxIDZcIilcbiAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNle1x0Ly9ib2FyZC5jbGVhcihmYWxzZSlcbiAgICAgICAgY29uc3QgY2hlc3Nub3cgPSBuZXcgQ2hlc3MoKVxuICAgICAgICBjaGVzc25vdy5sb2FkX3BnbihzdHIpXG4gICAgICAgIGNvbnNvbGUubG9nKGNoZXNzbm93LmZlbigpKVxuICBcbiAgICAgICAgdmFyIGJvYXJkZWxpdGUgPSBDaGVzc2JvYXJkKCdteUJvYXJkZWxpdGUnLCBjaGVzc25vdy5mZW4oKSk7XG4gIH1cbiAgICAgICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgLmFwcGVuZCgndHNwYW4nKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ3N0ZXBzLWVsaXRlJylcbiAgICAgICAgICAgIC5hdHRyKCd4JywgMClcbiAgICAgICAgICAgIC5hdHRyKCd5JywgNDAwKVxuICAgICAgICAgICAgLmF0dHIoJ2R5JywgJy0wLjFlbScpXG4gICAgICAgICAgICAuYXR0cignZm9udC1zaXplJywgJzJlbScpXG4gICAgICAgICAgICAudGV4dChzdHIpO1xuICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgIHBvc2l0aW9uOiAnc3RhcnQnLFxuICAgIG9uRHJhZ1N0YXJ0OiBvbkRyYWdTdGFydEVsaXRlLFxuICAgIG9uRHJvcDogb25Ecm9wRWxpdGUsXG4gICAgb25Nb3VzZW91dFNxdWFyZTogb25Nb3VzZW91dFNxdWFyZUVsaXRlLFxuICAgIG9uTW91c2VvdmVyU3F1YXJlOiBvbk1vdXNlb3ZlclNxdWFyZUVsaXRlLFxuICAgIG9uU25hcEVuZDogb25TbmFwRW5kRWxpdGVcbiAgfVxuICBib2FyZGVsaXRlID0gQ2hlc3Nib2FyZCgnbXlCb2FyZGVsaXRlJywgY29uZmlnKVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyb290LmRlc2NlbmRhbnRzKCkpIC8vaGF2ZSBwYXRoXG4gICAgLy8xLiBlNCBlNSAyLiBRaDVcbiAgICAgICAgICAgIC8vY29uc3QgaW5wdXQgPSBcIjEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmM0IE5mNiA0LiBOZzVcIlxuICAgIGlmKGlucHV0IT09XCJcIil7XG4gICAgICAgICAgICBjb25zdCBvdXRwdXQgPSBpbnB1dC5yZXBsYWNlKC9cXGQrXFwuXFxzL2csIFwiXCIpLnJlcGxhY2UoL1xccy9nLCBcIi1cIik7XG4gICAgICAgICAgICBjb25zdCBzZXF1ZW5jZVN0ciA9IG91dHB1dC5zcGxpdChcIi1cIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZXF1ZW5jZVN0cilcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkQXJyID0gc2VxdWVuY2VTdHIubWFwKChuYW1lLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVwdGggPSBpbmRleCArIDE7XG4gICAgICAgICAgICByZXR1cm4gcm9vdC5kZXNjZW5kYW50cygpLmZpbmQoaXRlbSA9PiBpdGVtLmRhdGEubmFtZSA9PT0gbmFtZSAmJiBpdGVtLmRlcHRoID09PSBkZXB0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zdCBoaWdoTGlnaHRTdW5idXJzdCA9IGZpbHRlcmVkQXJyXG4gICAgICAgICAgICBjb25zdCBoaWdoTGlnaHRTdW5idXJzdCA9IGZpbHRlcmVkQXJyLmZpbHRlcigoZCkgPT4ge1xuICAgICAgICAgICAgLy8gRG9uJ3QgZHJhdyB0aGUgcm9vdCBub2RlLCBhbmQgZm9yIGVmZmljaWVuY3ksIGZpbHRlciBvdXQgbm9kZXMgdGhhdCB3b3VsZCBiZSB0b28gc21hbGwgdG8gc2VlXG4gICAgICAgICAgICByZXR1cm4gZC5kZXB0aCAmJiBkLngxIC0gZC54MCA+IDAuMDAxO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaGlnaExpZ2h0U3VuYnVyc3QpXG4gICAgICAvL2NoZWNrXG4gICAgICBsZXQgdmFsaWRTdW5idXJzdCA9IHRydWVcbiAgICAgIHZhbGlkU3VuYnVyc3QgPSByb290LmRlc2NlbmRhbnRzKCkuaW5jbHVkZXMoaGlnaExpZ2h0U3VuYnVyc3RbMF0pO1xuICAgICAgY29uc29sZS5sb2codmFsaWRTdW5idXJzdClcbiAgICAgIGZvcihsZXQgaSA9IDE7aTxoaWdoTGlnaHRTdW5idXJzdC5sZW5ndGg7aSsrKXtcbiAgICAgICAgdmFsaWRTdW5idXJzdCA9IGhpZ2hMaWdodFN1bmJ1cnN0W2ktMV0uY2hpbGRyZW4uaW5jbHVkZXMoaGlnaExpZ2h0U3VuYnVyc3RbaV0pXG4gICAgICAgIGlmKHZhbGlkU3VuYnVyc3QgPT09ZmFsc2UpIHticmVhazt9XG4gICAgICAgICAgXG4gICAgICB9XG4gICAgICBpZih2YWxpZFN1bmJ1cnN0KXtcbiAgICAgICAgICAgICAgICAgICAgcGF0aC5hdHRyKCdmaWxsLW9wYWNpdHknLCAobm9kZSkgPT5cbiAgICAgICAgICAgIGhpZ2hMaWdodFN1bmJ1cnN0LmluZGV4T2Yobm9kZSkgPj0gMCA/IDEuMCA6IDAuM1xuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IChcbiAgICAgICAgICAgICgxMDAgKiBoaWdoTGlnaHRTdW5idXJzdFtoaWdoTGlnaHRTdW5idXJzdC5sZW5ndGggLSAxXS52YWx1ZSkgL1xuICAgICAgICAgICAgcm9vdC52YWx1ZVxuICAgICAgICAgICkudG9QcmVjaXNpb24oMyk7XG4gICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgIC5zdHlsZSgndmlzaWJpbGl0eScsIG51bGwpXG4gICAgICAgICAgICAuc2VsZWN0KCcucGVyY2VudGFnZS1lbGl0ZScpXG4gICAgICAgICAgICAudGV4dChwZXJjZW50YWdlICsgJyUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAuc3R5bGUoJ3Zpc2liaWxpdHknLCBudWxsKVxuICAgICAgICAgICAgLnNlbGVjdCgnLnBlcmNlbnRhZ2UtZWxpdGUnKVxuICAgICAgICAgICAgLnRleHQoXCJObyBHYW1lc1wiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgICAgICAgLy8gLy8gVXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGlzIHZpZXcgd2l0aCB0aGUgY3VycmVudGx5IGhvdmVyZWQgc2VxdWVuY2UgYW5kIHBlcmNlbnRhZ2VcbiAgICAgICAgICAvLyBlbGVtZW50LnZhbHVlID0geyBzZXF1ZW5jZSwgcGVyY2VudGFnZSB9O1xuICAgICAgICAgIC8vIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAvLyAgIG5ldyBDdXN0b21FdmVudCgnaW5wdXQnKVxuICAgICAgICAgIC8vICk7XG4gICAgfSlcbiAgICBcbiAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvcjonLCBlcnJvcik7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gYnVpbGRIaWVyYXJjaHkoY3N2KSB7XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9uIHRoYXQgdHJhbnNmb3JtcyB0aGUgZ2l2ZW4gQ1NWIGludG8gYSBoaWVyYXJjaGljYWwgZm9ybWF0LlxuICAgIGNvbnN0IHJvb3QgPSB7IG5hbWU6ICdyb290JywgY2hpbGRyZW46IFtdIH07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjc3YubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHNlcXVlbmNlID0gY3N2W2ldLnBnbjtcbiAgICAgIGNvbnN0IHNpemUgPSArY3N2W2ldLmZyZXE7XG4gICAgICBpZiAoaXNOYU4oc2l6ZSkpIHtcbiAgICAgICAgLy8gZS5nLiBpZiB0aGlzIGlzIGEgaGVhZGVyIHJvd1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBhcnRzID0gc2VxdWVuY2Uuc3BsaXQoJz0nKTtcbiAgICAgLy8gY29uc29sZS5sb2cocGFydHMubGVuZ3RoKVxuICAgICAgbGV0IGN1cnJlbnROb2RlID0gcm9vdDtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coY3VycmVudE5vZGUpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHBhcnRzW2pdKVxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGN1cnJlbnROb2RlWydjaGlsZHJlbiddO1xuICAgICAgICBjb25zdCBub2RlTmFtZSA9IHBhcnRzW2pdO1xuICAgICAgICBsZXQgY2hpbGROb2RlID0gbnVsbDtcbiAgICAgICAgaWYgKGogKyAxIDwgcGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gTm90IHlldCBhdCB0aGUgZW5kIG9mIHRoZSBzZXF1ZW5jZTsgbW92ZSBkb3duIHRoZSB0cmVlLlxuICAgICAgICAgIGxldCBmb3VuZENoaWxkID0gZmFsc2U7XG4gICAgICAgICAgZm9yIChsZXQgayA9IDA7ayA8IGNoaWxkcmVuLmxlbmd0aDtrKyspIHtcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbltrXVsnbmFtZSddID09IG5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2tdO1xuICAgICAgICAgICAgICBmb3VuZENoaWxkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIHdlIGRvbid0IGFscmVhZHkgaGF2ZSBhIGNoaWxkIG5vZGUgZm9yIHRoaXMgYnJhbmNoLCBjcmVhdGUgaXQuXG4gICAgICAgICAgaWYgKCFmb3VuZENoaWxkKSB7XG4gICAgICAgICAgICBjaGlsZE5vZGUgPSB7XG4gICAgICAgICAgICAgIG5hbWU6IG5vZGVOYW1lLFxuICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZE5vZGUpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImFkZG5ld1wiKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJyZW50Tm9kZSA9IGNoaWxkTm9kZTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGN1cnJlbnROb2RlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgc2VxdWVuY2U7IGNyZWF0ZSBhIGxlYWYgbm9kZS5cbiAgICAgICAgICBjaGlsZE5vZGUgPSB7XG4gICAgICAgICAgICBuYW1lOiBub2RlTmFtZSxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICAgIHZhbHVlOiBzaXplLFxuICAgICAgICAgIH07XG4gICAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZE5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByb290O1xuICB9XG4gIC8vIEdlbmVyYXRlIGEgc3RyaW5nIHRoYXQgZGVzY3JpYmVzIHRoZSBwb2ludHMgb2YgYSBicmVhZGNydW1iIFNWRyBwb2x5Z29uLlxuICBmdW5jdGlvbiBicmVhZGNydW1iUG9pbnRzKGQsIGkpIHtcbiAgICBjb25zdCB0aXBXaWR0aCA9IDEwO1xuICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgIHBvaW50cy5wdXNoKCcwLDAnKTtcbiAgICBwb2ludHMucHVzaChgJHticmVhZGNydW1iV2lkdGh9LDBgKTtcbiAgICBwb2ludHMucHVzaChcbiAgICAgIGAke2JyZWFkY3J1bWJXaWR0aCArIHRpcFdpZHRofSwke1xuICAgICAgICBicmVhZGNydW1iSGVpZ2h0IC8gMlxuICAgICAgfWBcbiAgICApO1xuICAgIHBvaW50cy5wdXNoKFxuICAgICAgYCR7YnJlYWRjcnVtYldpZHRofSwke2JyZWFkY3J1bWJIZWlnaHR9YFxuICAgICk7XG4gICAgcG9pbnRzLnB1c2goYDAsJHticmVhZGNydW1iSGVpZ2h0fWApO1xuICAgIGlmIChpID4gMCkge1xuICAgICAgLy8gTGVmdG1vc3QgYnJlYWRjcnVtYjsgZG9uJ3QgaW5jbHVkZSA2dGggdmVydGV4LlxuICAgICAgcG9pbnRzLnB1c2goXG4gICAgICAgIGAke3RpcFdpZHRofSwke2JyZWFkY3J1bWJIZWlnaHQgLyAyfWBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBwb2ludHMuam9pbignICcpO1xuICB9XG4gIFxuICBcbiAgXG4gIFxuICBmdW5jdGlvbiBoaWdobGlnaHRTdW5idXJzdChwZ25zdHIpe1xuICBcbiAgXG4gIH1cbiAgZnVuY3Rpb24gaGlnaGxpZ2h0U3VuYnVyc3RFbGl0ZShwZ25zdHIpe1xuICBcbiAgXG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlR3JleVNxdWFyZXMgKCkge1xuICAgICQoJyNteUJvYXJkIC5zcXVhcmUtNTVkNjMnKS5jc3MoJ2JhY2tncm91bmQnLCAnJylcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVHcmV5U3F1YXJlc0VsaXRlICgpIHtcbiAgICAkKCcjbXlCb2FyZGVsaXRlIC5zcXVhcmUtNTVkNjMnKS5jc3MoJ2JhY2tncm91bmQnLCAnJylcbiAgfVxuICBmdW5jdGlvbiBncmV5U3F1YXJlIChzcXVhcmUpIHtcbiAgICB2YXIgJHNxdWFyZSA9ICQoJyNteUJvYXJkIC5zcXVhcmUtJyArIHNxdWFyZSlcbiAgICAgIGNvbnNvbGUubG9nKHNxdWFyZSlcbiAgICB2YXIgYmFja2dyb3VuZCA9IHdoaXRlU3F1YXJlR3JleVxuICAgIGlmICgkc3F1YXJlLmhhc0NsYXNzKCdibGFjay0zYzg1ZCcpKSB7XG4gICAgICBiYWNrZ3JvdW5kID0gYmxhY2tTcXVhcmVHcmV5XG4gICAgfVxuICBcbiAgICAkc3F1YXJlLmNzcygnYmFja2dyb3VuZCcsIGJhY2tncm91bmQpXG4gIH1cbiAgZnVuY3Rpb24gZ3JleVNxdWFyZUVsaXRlIChzcXVhcmUpIHtcbiAgICB2YXIgJHNxdWFyZSA9ICQoJyNteUJvYXJkZWxpdGUgLnNxdWFyZS0nICsgc3F1YXJlKVxuICAgICAgY29uc29sZS5sb2coc3F1YXJlKVxuICAgIHZhciBiYWNrZ3JvdW5kID0gd2hpdGVTcXVhcmVHcmV5XG4gICAgaWYgKCRzcXVhcmUuaGFzQ2xhc3MoJ2JsYWNrLTNjODVkJykpIHtcbiAgICAgIGJhY2tncm91bmQgPSBibGFja1NxdWFyZUdyZXlcbiAgICB9XG4gIFxuICAgICRzcXVhcmUuY3NzKCdiYWNrZ3JvdW5kJywgYmFja2dyb3VuZClcbiAgfVxuICBcbiAgZnVuY3Rpb24gb25EcmFnU3RhcnQgKHNvdXJjZSwgcGllY2UpIHtcbiAgICAvLyBkbyBub3QgcGljayB1cCBwaWVjZXMgaWYgdGhlIGdhbWUgaXMgb3ZlclxuICAgIGlmIChnYW1lLmdhbWVfb3ZlcigpKSByZXR1cm4gZmFsc2VcbiAgXG4gICAgLy8gb3IgaWYgaXQncyBub3QgdGhhdCBzaWRlJ3MgdHVyblxuICAgIGlmICgoZ2FtZS50dXJuKCkgPT09ICd3JyAmJiBwaWVjZS5zZWFyY2goL15iLykgIT09IC0xKSB8fFxuICAgICAgICAoZ2FtZS50dXJuKCkgPT09ICdiJyAmJiBwaWVjZS5zZWFyY2goL153LykgIT09IC0xKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG9uRHJhZ1N0YXJ0RWxpdGUgKHNvdXJjZSwgcGllY2UpIHtcbiAgICAvLyBkbyBub3QgcGljayB1cCBwaWVjZXMgaWYgdGhlIGdhbWUgaXMgb3ZlclxuICAgIGlmIChnYW1lZWxpdGUuZ2FtZV9vdmVyKCkpIHJldHVybiBmYWxzZVxuICBcbiAgICAvLyBvciBpZiBpdCdzIG5vdCB0aGF0IHNpZGUncyB0dXJuXG4gICAgaWYgKChnYW1lZWxpdGUudHVybigpID09PSAndycgJiYgcGllY2Uuc2VhcmNoKC9eYi8pICE9PSAtMSkgfHxcbiAgICAgICAgKGdhbWVlbGl0ZS50dXJuKCkgPT09ICdiJyAmJiBwaWVjZS5zZWFyY2goL153LykgIT09IC0xKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIFxuICBmdW5jdGlvbiBvbkRyb3AgKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgcmVtb3ZlR3JleVNxdWFyZXMoKVxuICBcbiAgICAvLyBzZWUgaWYgdGhlIG1vdmUgaXMgbGVnYWxcbiAgICB2YXIgbW92ZSA9IGdhbWUubW92ZSh7XG4gICAgICBmcm9tOiBzb3VyY2UsXG4gICAgICB0bzogdGFyZ2V0LFxuICAgICAgcHJvbW90aW9uOiAncScgLy8gTk9URTogYWx3YXlzIHByb21vdGUgdG8gYSBxdWVlbiBmb3IgZXhhbXBsZSBzaW1wbGljaXR5XG4gICAgfSlcbiAgXG4gICAgLy8gaWxsZWdhbCBtb3ZlXG4gICAgaWYgKG1vdmUgPT09IG51bGwpIHJldHVybiAnc25hcGJhY2snXG4gICAgY29uc29sZS5sb2coZ2FtZS5wZ24oKSlcbiAgICBzZWxlY3RBbGwoJy5zdW5idXJzdC1wYXRoJykucmVtb3ZlKClcbiAgICAgIHNlbGVjdEFsbCgnLnN1bmJ1cnN0LXBhdGgtbW91c2UnKS5yZW1vdmUoKVxuICAgICAgc2VsZWN0QWxsKCcucGVyY2VudGFnZScpLnJlbW92ZSgpXG4gICAgICBzZWxlY3RBbGwoJy5nYW1lLXRleHQnKS5yZW1vdmUoKVxuICBcbiAgICAgIGdlbmVyYXRlU3VuYnVyc3QoZmlsZW5hbWUsZ2FtZS5wZ24oKSxsZXZlbFZhbHVlKVxuICB9XG4gIGZ1bmN0aW9uIG9uRHJvcEVsaXRlIChzb3VyY2UsIHRhcmdldCkge1xuICAgIHJlbW92ZUdyZXlTcXVhcmVzRWxpdGUoKVxuICBcbiAgICAvLyBzZWUgaWYgdGhlIG1vdmUgaXMgbGVnYWxcbiAgICB2YXIgbW92ZSA9IGdhbWVlbGl0ZS5tb3ZlKHtcbiAgICAgIGZyb206IHNvdXJjZSxcbiAgICAgIHRvOiB0YXJnZXQsXG4gICAgICBwcm9tb3Rpb246ICdxJyAvLyBOT1RFOiBhbHdheXMgcHJvbW90ZSB0byBhIHF1ZWVuIGZvciBleGFtcGxlIHNpbXBsaWNpdHlcbiAgICB9KVxuICBcbiAgICAvLyBpbGxlZ2FsIG1vdmVcbiAgICBpZiAobW92ZSA9PT0gbnVsbCkgcmV0dXJuICdzbmFwYmFjaydcbiAgICBjb25zb2xlLmxvZyhnYW1lZWxpdGUucGduKCkpXG4gICAgc2VsZWN0QWxsKCcuc3VuYnVyc3QtcGF0aC1lbGl0ZScpLnJlbW92ZSgpXG4gICAgICBzZWxlY3RBbGwoJy5zdW5idXJzdC1wYXRoLW1vdXNlLWVsaXRlJykucmVtb3ZlKClcbiAgICAgIHNlbGVjdEFsbCgnLnBlcmNlbnRhZ2UtZWxpdGUnKS5yZW1vdmUoKVxuICAgICAgc2VsZWN0QWxsKCcuZ2FtZS10ZXh0LWVsaXRlJykucmVtb3ZlKClcbiAgXG4gICAgICBnZW5lcmF0ZVN1bmJ1cnN0RWxpdGUoZmlsZW5hbWVlbGl0ZSxnYW1lZWxpdGUucGduKCksbGV2ZWxWYWx1ZWVsaXRlKVxuICB9XG4gIGZ1bmN0aW9uIG9uTW91c2VvdmVyU3F1YXJlIChzcXVhcmUsIHBpZWNlKSB7XG4gICAgLy8gZ2V0IGxpc3Qgb2YgcG9zc2libGUgbW92ZXMgZm9yIHRoaXMgc3F1YXJlXG4gICAgdmFyIG1vdmVzID0gZ2FtZS5tb3Zlcyh7XG4gICAgICBzcXVhcmU6IHNxdWFyZSxcbiAgICAgIHZlcmJvc2U6IHRydWVcbiAgICB9KVxuICBcbiAgICAvLyBleGl0IGlmIHRoZXJlIGFyZSBubyBtb3ZlcyBhdmFpbGFibGUgZm9yIHRoaXMgc3F1YXJlXG4gICAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG4gIFxuICAgIC8vIGhpZ2hsaWdodCB0aGUgc3F1YXJlIHRoZXkgbW91c2VkIG92ZXJcbiAgICBjb25zb2xlLmxvZyh0eXBlb2Ygc3F1YXJlKTtcbiAgICBjb25zb2xlLmxvZyhzcXVhcmUpXG4gICAgZ3JleVNxdWFyZShzcXVhcmUpXG4gIFxuICAgIC8vIGhpZ2hsaWdodCB0aGUgcG9zc2libGUgc3F1YXJlcyBmb3IgdGhpcyBwaWVjZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGdyZXlTcXVhcmUobW92ZXNbaV0udG8pXG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG9uTW91c2VvdmVyU3F1YXJlRWxpdGUgKHNxdWFyZSwgcGllY2UpIHtcbiAgICAvLyBnZXQgbGlzdCBvZiBwb3NzaWJsZSBtb3ZlcyBmb3IgdGhpcyBzcXVhcmVcbiAgICB2YXIgbW92ZXMgPSBnYW1lZWxpdGUubW92ZXMoe1xuICAgICAgc3F1YXJlOiBzcXVhcmUsXG4gICAgICB2ZXJib3NlOiB0cnVlXG4gICAgfSlcbiAgXG4gICAgLy8gZXhpdCBpZiB0aGVyZSBhcmUgbm8gbW92ZXMgYXZhaWxhYmxlIGZvciB0aGlzIHNxdWFyZVxuICAgIGlmIChtb3Zlcy5sZW5ndGggPT09IDApIHJldHVyblxuICBcbiAgICAvLyBoaWdobGlnaHQgdGhlIHNxdWFyZSB0aGV5IG1vdXNlZCBvdmVyXG4gICAgY29uc29sZS5sb2codHlwZW9mIHNxdWFyZSk7XG4gICAgY29uc29sZS5sb2coc3F1YXJlKVxuICAgIGdyZXlTcXVhcmVFbGl0ZShzcXVhcmUpXG4gIFxuICAgIC8vIGhpZ2hsaWdodCB0aGUgcG9zc2libGUgc3F1YXJlcyBmb3IgdGhpcyBwaWVjZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGdyZXlTcXVhcmVFbGl0ZShtb3Zlc1tpXS50bylcbiAgICB9XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIG9uTW91c2VvdXRTcXVhcmUgKHNxdWFyZSwgcGllY2UpIHtcbiAgICByZW1vdmVHcmV5U3F1YXJlcygpXG4gIH1cbiAgZnVuY3Rpb24gb25Nb3VzZW91dFNxdWFyZUVsaXRlIChzcXVhcmUsIHBpZWNlKSB7XG4gICAgcmVtb3ZlR3JleVNxdWFyZXNFbGl0ZSgpXG4gIH1cbiAgZnVuY3Rpb24gb25TbmFwRW5kICgpIHtcbiAgICBib2FyZC5wb3NpdGlvbihnYW1lLmZlbigpKVxuICB9XG4gIGZ1bmN0aW9uIG9uU25hcEVuZEVsaXRlICgpIHtcbiAgICBib2FyZGVsaXRlLnBvc2l0aW9uKGdhbWVlbGl0ZS5mZW4oKSlcbiAgfVxuICAiXSwibmFtZXMiOlsic2NhbGVPcmRpbmFsIiwic2VsZWN0QWxsIiwiY3N2Iiwic2VsZWN0Il0sIm1hcHBpbmdzIjoiOzs7RUFBQSxNQUFNLE9BQU8sR0FBRyxlQUFjO0FBQzlCO0VBQ0EsTUFBTSxnQkFBZ0I7RUFDdEIsRUFBRSwyREFBMEQ7QUFDNUQ7RUFDQSxNQUFNLG1CQUFtQixHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFDO0FBQzFEO0VBQ0EsTUFBTSxZQUFZLEdBQUc7RUFDckIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7RUFDckIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUN6QixFQUFDO0FBQ0Q7RUFDQSxNQUFNLGFBQWEsR0FBRztFQUN0QixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztFQUN6QyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7RUFDdkIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3JCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3ZDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3ZDLEVBQUM7QUFDRDtFQUNBO0VBQ0EsTUFBTSxPQUFPLEdBQUc7RUFDaEIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ25ELEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztFQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUNuRCxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDbkQsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ25ELEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztFQUNuRCxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtFQUNoRCxDQUFDLENBQUM7QUFDRjtFQUNBO0VBQ0EsTUFBTSxJQUFJLEdBQUc7RUFDYixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7RUFDaEUsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7RUFDaEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7RUFDaEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7RUFDaEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7RUFDaEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0VBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNoRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7RUFDaEUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDN0QsQ0FBQyxDQUFDO0FBQ0Y7RUFDQSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFFO0FBQ3JEO0VBQ0EsTUFBTSxJQUFJLEdBQUc7RUFDYixFQUFFLE1BQU0sRUFBRSxDQUFDO0VBQ1gsRUFBRSxPQUFPLEVBQUUsQ0FBQztFQUNaLEVBQUUsUUFBUSxFQUFFLENBQUM7RUFDYixFQUFFLFVBQVUsRUFBRSxDQUFDO0VBQ2YsRUFBRSxTQUFTLEVBQUUsRUFBRTtFQUNmLEVBQUUsWUFBWSxFQUFFLEVBQUU7RUFDbEIsRUFBRSxZQUFZLEVBQUUsRUFBRTtFQUNsQixFQUFDO0FBQ0Q7RUFDQSxNQUFNLE1BQU0sR0FBRyxFQUFDO0VBQ2hCLE1BQU0sTUFBTSxHQUFHLEVBQUM7RUFLaEIsTUFBTSxNQUFNLEdBQUcsRUFBQztFQUNoQixNQUFNLE1BQU0sR0FBRyxFQUFDO0FBQ2hCO0VBQ0E7RUFDQSxNQUFNLFVBQVUsR0FBRztFQUNuQixFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUM7RUFDeEUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFO0VBQ3hFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtFQUN4RSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUU7RUFDeEUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFO0VBQ3hFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtFQUN4RSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUc7RUFDeEUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHO0VBQ3hFLENBQUMsQ0FBQztBQUNGO0VBQ0EsTUFBTSxLQUFLLEdBQUc7RUFDZCxFQUFFLENBQUMsRUFBRTtFQUNMLElBQUksRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEVB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TUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2hFLEtBQUs7QUFDTDtFQUNBO0VBQ0EsSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtFQUMxRCxNQUFNLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNoRSxLQUFLO0FBQ0w7RUFDQTtFQUNBLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUU7RUFDekQsTUFBTSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEUsS0FBSztBQUNMO0VBQ0E7RUFDQSxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDakQsTUFBTSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEUsS0FBSztBQUNMO0VBQ0E7RUFDQSxJQUFJLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDdEQsTUFBTSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEUsS0FBSztBQUNMO0VBQ0E7RUFDQSxJQUFJLElB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T0FBTztBQUNQO0VBQ0EsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxLQUFLLFVBQVUsS0FBSyxJQUFJLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxFQUFFO0VBQy9FO0VBQ0EsUUFBUSxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQztFQUM1QyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtFQUNuQyxVQUFVLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQztBQUN4RDtFQUNBO0VBQ0EsVUFBVSxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQztFQUM5QyxVQUFVLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFO0VBQ3BFLFlBQVksUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDO0VBQzVELFdBQVc7RUFDWCxTQUFTO0FBQ1Q7RUFDQTtFQUNBLFFBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDaEMsVUFBVSxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQztFQUM5QyxVQUFVLElBQUksTUFBTSxHQUFHLElBQUksRUFBRSxRQUFRO0FBQ3JDO0VBQ0EsVUFBVSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7RUFDckUsWUFBWSxRQUFR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