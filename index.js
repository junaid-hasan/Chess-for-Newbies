import {
    csv,
    select,
    selectAll,
    scaleLinear,
    scaleOrdinal,
    json,
  } from 'd3';
  import { Chess } from './chess.js'
  
  // Load the CSV file
  var whiteSquareGrey = '#a9a9a9'
  var blackSquareGrey = '#696969'
  const chess1 = new Chess()
  var game = new Chess()
  
  //chess1.load_pgn("1. d4 d5 2. c4 e5 3. dxe5 d4 4. e3 Bb4+ 5. Bd2 dxe3 6. Bxb4 exf2+ 7. Ke2 fxg1=N+ 8. Rhxg1")
  //1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rhf1
  //r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4
  //r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R
  //e4-e5-Nf3-Nc6-Bc4-Nd4-Nxe5-Qg5-Nxf7-Qxg2-Rhf1
  chess1.move("e4")
  chess1.move("e5")
  chess1.move("Nf3")
  chess1.move("Nc6")
  chess1.move("Bc4")
  chess1.move("Nd4")
  chess1.move("Nxe5")
  chess1.move("Qg5")
  chess1.move("Nxf7")
  chess1.move("Qxg2")
  console.log(chess1.pgn())
  chess1.move("Rhf1")
  console.log(chess1.fen())
  var ruyLopez =
    'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R';
  var board = Chessboard('myBoard', "start");
  
  
  //chessboard and graphic dimensions
  const chessboardwidth = 250
//  const width = window.innerWidth -5 - chessboardwidth;
  const width = window.innerWidth/2;
	console.log(window.innerWidth);
  console.log(window.innerHeight);
  const height = window.innerHeight - 5;
  const breadcrumbWidth = 75;
  const breadcrumbHeight = 30;
  const radius = width / 2;
  const centerX = width / 16 + chessboardwidth; // X-coordinate of the desired center position
  const centerY = height/30;
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
  const color = scaleOrdinal()
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
  
  let clickmode = false
  document.getElementById("clickmode").addEventListener("click", function() {
    clickmode = false;
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
  let sliderValue = document.getElementById("sliderValue");
  let rateValue = document.getElementById("rateValue");
  let levelValue = 0
  let filename = '3500-4000.csv'
  //let filename = '2015-12.csv'
  console.log(rateslider)
  rateslider.addEventListener('input',function(){
          const index = parseInt(this.value);
    let text = ""
    switch (index) {
      case 0:
        levelValue = 0
        text = "Top 500"
        break;
      case 1:
        levelValue = 1
        text = "500-1000"
        break;
      case 2:
        levelValue = 2
        text = "1000-1500"
        break;
      case 3:
        levelValue = 3
        text = "1500-2000"
        break;
      case 4:
        levelValue = 4
        text = "2000-2500"
        break;
      case 5:
        levelValue = 5
        text = "2500-3000"
        break;
    }
    rateValue.textContent = text;
        selectAll('.sunburst-path').remove()
      selectAll('.sunburst-path-mouse').remove()
      selectAll('.percentage').remove()
      selectAll('.game-text').remove()
    generateSunburst(filename,input,levelValue)
  })
  //const input = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5"
  const input = ""
  generateSunburst(filename,input,0)
  document.getElementById("newgame").addEventListener("click", function() {
    game = new Chess()
      selectAll('.sunburst-path').remove()
      selectAll('.sunburst-path-mouse').remove()
      selectAll('.percentage').remove()
      selectAll('.game-text').remove()
    generateSunburst(filename,input,levelValue)
  });
  //selectAll('.sunburst-chess').remove()
  //const targetFiles = ['2014-01.csv','2014-01-2.csv','2014-01-3.csv']
  const targetFiles = ['2015-12-1.csv', '2015-12-2.csv', '2015-12-3.csv']
    slider.addEventListener('input', function () {
      console.log(levelValue)
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
      console.log(text)
      sliderValue.textContent = text;
      clickmode = false
      selectAll('.percentage').remove()
      selectAll('.game-text').remove()
          selectAll('.sunburst-path').remove()
      selectAll('.sunburst-path-mouse').remove()
      const newName = targetFiles[index];
      //filename = newName;
      filename = text+".csv"
  
      console.log(filename);
      generateSunburst(filename,input,levelValue)
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
  csv(filename)
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
    const svg = select("#sunburst");
      console.log(svg)
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
        .join('path')
      
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
          console.log(root.descendants())
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
        clickmode = true
          // Get the ancestors of the current segment, minus the root
          selectAll('.steps-click').remove();
        console.log(d)
          const sequence = d
            .ancestors()
            .reverse()
            .slice(1);
          // Highlight the ancestors
        console.log(sequence)
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
              str = str+num.toString()+". "
            }
            str =str +element.value.sequence[i].data.name+" ";
          }
        let last = element.value.sequence[element.value.sequence.length-1]
        console.log(last.data)
       //1. e4 e5 2. Qh5 d6 3. Bc4 Nf6 4. Qxf7# 
          console.log(str);
        if(str.includes('Rh')){
                d3.csv("2.csv").then(function(data) {
    // Convert the data into a JavaScript object or map
    var csvData = {};
    data.forEach(function(d) {
      csvData[d.pgn] = d.fen;
    });
  
    // Search for a value using the key
    var key = "your_key";
                  //console.log(str)
    var value = csvData[str.slice(0, str.length - 1)];
    console.log(value);
                  var board = Chessboard('myBoard', value);
  }).catch(function(error) {
    console.error("Error loading CSV file:", error);
  });
         // var board = Chessboard('myBoard', "r1b1kbnr/pppp1Npp/8/8/2BnP3/8/PPPP1PqP/RNBQKR2 b Qkq - 1 6")
        }
              else{	//board.clear(false)
        const chessnow = new Chess()
        chessnow.load_pgn(str)
        console.log(chessnow.fen())
  
        var board = Chessboard('myBoard', chessnow.fen());
  }
                label
            .append('tspan')
            .attr('class', 'steps-click')
            .attr('x', 0)
            .attr('y', 300)
            .attr('dy', '-0.1em')
            .attr('font-size', '2em')
            .text(str);
        })
        .on('mouseenter', (event, d) => {
          // Get the ancestors of the current segment, minus the root
        if (clickmode === false){
          selectAll('.steps').remove();
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
              str = str+num.toString()+". "
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
  
    // Search for a value using the key
    var key = "your_key";
                  //console.log(str)
    var value = csvData[str.slice(0, str.length - 1)];
    console.log(value);
                  var board = Chessboard('myBoard', value);
  }).catch(function(error) {
    console.error("Error loading CSV file:", error);
  });
         // var board = Chessboard('myBoard', "r1b1kbnr/pppp1Npp/8/8/2BnP3/8/PPPP1PqP/RNBQKR2 b Qkq - 1 6")
        }
              else{	//board.clear(false)
        const chessnow = new Chess()
        chessnow.load_pgn(str)
        console.log(chessnow.fen())
  
        var board = Chessboard('myBoard', chessnow.fen());
  }
                label
            .append('tspan')
            .attr('class', 'steps')
            .attr('x', 0)
            .attr('y', 300)
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
  }
  board = Chessboard('myBoard', config)
              console.log(root.descendants()) //have path
    //1. e4 e5 2. Qh5
            //const input = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5"
    if(input!==""){
            const output = input.replace(/\d+\.\s/g, "").replace(/\s/g, "-");
            const sequenceStr = output.split("-");
            console.log(sequenceStr)
            const filteredArr = sequenceStr.map((name, index) => {
            const depth = index + 1;
            return root.descendants().find(item => item.data.name === name && item.depth === depth);
            });
                    //const highLightSunburst = filteredArr
            const highLightSunburst = filteredArr.filter((d) => {
            // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
            return d.depth && d.x1 - d.x0 > 0.001;
          })
                      console.log(highLightSunburst)
      //check
      let validSunburst = true
      validSunburst = root.descendants().includes(highLightSunburst[0]);
      console.log(validSunburst)
      for(let i = 1;i<highLightSunburst.length;i++){
        validSunburst = highLightSunburst[i-1].children.includes(highLightSunburst[i])
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
            .text("Very Few");
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
  // Generate a string that describes the points of a breadcrumb SVG polygon.
  function breadcrumbPoints(d, i) {
    const tipWidth = 10;
    const points = [];
    points.push('0,0');
    points.push(`${breadcrumbWidth},0`);
    points.push(
      `${breadcrumbWidth + tipWidth},${
        breadcrumbHeight / 2
      }`
    );
    points.push(
      `${breadcrumbWidth},${breadcrumbHeight}`
    );
    points.push(`0,${breadcrumbHeight}`);
    if (i > 0) {
      // Leftmost breadcrumb; don't include 6th vertex.
      points.push(
        `${tipWidth},${breadcrumbHeight / 2}`
      );
    }
    return points.join(' ');
  }
  
  
  
  
  function highlightSunburst(pgnstr){
  
  
  }
  function removeGreySquares () {
    $('#myBoard .square-55d63').css('background', '')
  }
  
  function greySquare (square) {
    var $square = $('#myBoard .square-' + square)
      console.log(square)
    var background = whiteSquareGrey
    if ($square.hasClass('black-3c85d')) {
      background = blackSquareGrey
    }
  
    $square.css('background', background)
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
  
  function onDrop (source, target) {
    removeGreySquares()
  
    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
  
    // illegal move
    if (move === null) return 'snapback'
    console.log(game.pgn())
    selectAll('.sunburst-path').remove()
      selectAll('.sunburst-path-mouse').remove()
      selectAll('.percentage').remove()
      selectAll('.game-text').remove()
  
      generateSunburst(filename,game.pgn(),levelValue)
  }
  
  function onMouseoverSquare (square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
      square: square,
      verbose: true
    })
  
    // exit if there are no moves available for this square
    if (moves.length === 0) return
  
    // highlight the square they moused over
    console.log(typeof square);
    console.log(square)
    greySquare(square)
  
    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to)
    }
  }
  
  function onMouseoutSquare (square, piece) {
    removeGreySquares()
  }
  
  function onSnapEnd () {
    board.position(game.fen())
  }
  