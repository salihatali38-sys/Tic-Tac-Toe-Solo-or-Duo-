document.addEventListener('DOMContentLoaded', ()=>{
  const twoBtn = document.getElementById('twoPlayerBtn');
  const singleBtn = document.getElementById('singlePlayerBtn');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const resetBtn = document.getElementById('resetBtn');
  const msgEl = document.getElementById('message');
  const boardEl = document.getElementById('board');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreDrawEl = document.getElementById('scoreDraw');
  const nameX = document.getElementById('playerXName');
  const nameO = document.getElementById('playerOName');

  const WIN_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  let board = Array(9).fill('');
  let current = 'X';
  let playing = false;
  let gameMode = null; // 'single' or 'two'
  let scores = {X:0,O:0,draw:0};

  function setMode(mode){
    gameMode = mode;
    twoBtn.classList.toggle('active', mode==='two');
    singleBtn.classList.toggle('active', mode==='single');
    msg(`${mode==='single' ? 'Single Player' : 'Two Player'} selected. Set names and click Start.`);
  }

  function msg(text){ msgEl.textContent = text; }

  function startGame(){
    board.fill(''); cells.forEach(c=>{c.className='cell'; c.textContent='';});
    current = 'X'; playing = true; msg(`${getCurrentName()}'s turn (${current})`);
    if(gameMode==='single' && current==='O') triggerComputer();
  }

  function restartRound(){ startGame(); }
  function resetAll(){ scores={X:0,O:0,draw:0}; updateScores(); startGame(); }

  function updateScores(){ scoreXEl.textContent = scores.X; scoreOEl.textContent = scores.O; scoreDrawEl.textContent = scores.draw; }

  function getCurrentName(){ return current==='X' ? (nameX.value || 'Player X') : (nameO.value || (gameMode==='single' ? 'Computer' : 'Player O')); }

  function handleCellClick(e){
    if(!playing) return flashCell(e.currentTarget);
    const idx = Number(e.currentTarget.dataset.index);
    if(board[idx]) return flashCell(e.currentTarget);
    placeMove(idx, current);
    if(checkEnd()) return;
    switchPlayer();
    if(gameMode==='single' && current==='O') triggerComputer();
  }

  function flashCell(cell){ cell.classList.add('invalid'); setTimeout(()=>cell.classList.remove('invalid'),350); }

  function placeMove(i, symbol){ board[i]=symbol; const el=cells[i]; el.textContent=symbol; el.classList.add(symbol.toLowerCase()); }

  function switchPlayer(){ current = current==='X' ? 'O' : 'X'; msg(`${getCurrentName()}'s turn (${current})`); }

  function checkEnd(){
    const winner = checkWinner(board);
    if(winner){ playing=false; highlightWin(winner.combo); scores[winner.player]++; updateScores(); msg(`${getNameFor(winner.player)} wins!`); return true; }
    if(board.every(Boolean)){ playing=false; scores.draw++; updateScores(); msg('Draw!'); return true; }
    return false;
  }

  function getNameFor(sym){ return sym==='X' ? (nameX.value||'Player X') : (nameO.value || (gameMode==='single' ? 'Computer' : 'Player O')); }

  function checkWinner(b){
    for(const combo of WIN_COMBOS){
      const [a,b1,c] = combo;
      if(board[a] && board[a]===board[b1] && board[a]===board[c]) return {player:board[a], combo};
    }
    return null;
  }

  function highlightWin(combo){ combo.forEach(i=>cells[i].classList.add('win')); }

  function triggerComputer(){
    msg('Computer is thinking...');
    setTimeout(()=>{
      const move = getComputerMove();
      placeMove(move,'O');
      if(checkEnd()) return;
      switchPlayer();
    }, 450);
  }

  // AI: win -> block -> center -> corners -> sides
  function getComputerMove(){
    // winning move
    let move = findWinningMove('O'); if(move!==-1) return move;
    // block
    move = findWinningMove('X'); if(move!==-1) return move;
    // center
    if(!board[4]) return 4;
    // corners then sides
    const priority = [0,2,6,8,1,3,5,7];
    for(const i of priority) if(!board[i]) return i;
    return board.findIndex(c=>!c);
  }

  function findWinningMove(sym){
    for(let i=0;i<9;i++){
      if(board[i]) continue;
      const copy = board.slice(); copy[i]=sym;
      if(checkSimWin(copy,sym)) return i;
    }
    return -1;
  }

  function checkSimWin(simBoard, sym){
    return WIN_COMBOS.some(c=> simBoard[c[0]]===sym && simBoard[c[1]]===sym && simBoard[c[2]]===sym);
  }

  // Wire events
  twoBtn.addEventListener('click', ()=>setMode('two'));
  singleBtn.addEventListener('click', ()=>setMode('single'));
  startBtn.addEventListener('click', ()=>{ if(!gameMode) return msg('Choose a mode first.'); startGame(); updateScores(); });
  restartBtn.addEventListener('click', ()=>restartRound());
  resetBtn.addEventListener('click', ()=>resetAll());
  cells.forEach(c=>c.addEventListener('click', handleCellClick));

  // default
  setMode('two');
});
