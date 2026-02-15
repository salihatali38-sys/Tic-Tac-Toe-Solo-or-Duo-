document.addEventListener('DOMContentLoaded', ()=>{
  //  SETUP OVERLAY ELEMENTS 
  const setupOverlay = document.getElementById('setupOverlay');
  const appContainer = document.querySelector('.app');
  const twoBtn = document.getElementById('twoPlayerBtn');
  const singleBtn = document.getElementById('singlePlayerBtn');
  const startBtn = document.getElementById('startBtn');
  const setupMsgEl = document.getElementById('setupMessage');
  
  // GAME ELEMENTS 
  const restartBtn = document.getElementById('restartBtn');
  const msgEl = document.getElementById('message');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreDrawEl = document.getElementById('scoreDraw');
  const nameX = document.getElementById('playerXName');
  const nameO = document.getElementById('playerOName');


    // Victory Modal Elements
  const victoryModal = document.getElementById('victoryModal');
  const victoryTitle = document.getElementById('victoryTitle');
  const victoryMessage = document.getElementById('victoryMessage');
  const modalScoreX = document.getElementById('modalScoreX');
  const modalScoreO = document.getElementById('modalScoreO');
  const modalScoreDraw = document.getElementById('modalScoreDraw');
  const nextRoundBtn = document.getElementById('nextRoundBtn');
  const newGameBtn = document.getElementById('newGameBtn');
  const WIN_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  //before the game starts or ends
  let board = Array(9).fill('');
  let current = 'X';
  let playing = false;
  let gameMode = null; //current game mode
  let scores = {X:0,O:0,draw:0};
  let lastWinner = null;
  let victoryIcon = document.querySelector('.victory-icon'); // For emoji changes

  // ===== SETUP OVERLAY FUNCTIONS 
  function setupMsg(text){
    setupMsgEl.textContent = text;
  }

  function hideSetupOverlay(){
    setupOverlay.classList.add('fade-out');
    setTimeout(()=>{
      setupOverlay.classList.add('hidden');
      appContainer.classList.remove('hidden');
    }, 400);
  }

  // ===== MODE SELECTION =====
  function setMode(mode){
    gameMode = mode;
    twoBtn.classList.toggle('active', mode==='two');
    singleBtn.classList.toggle('active', mode==='single');
    
    // Show/hide Player O input based on mode
    if(mode === 'single'){
      setupOverlay.classList.add('single-player');
      setupMsg('Single Player selected. Enter your name and click Start.');
    } else {
      setupOverlay.classList.remove('single-player');
      setupMsg('Two Player selected. Enter both player names and click Start.');
    }
  }

  // ===== GAME FUNCTIONS =====
  function msg(text){ 
    msgEl.textContent = text; 
  }

  function startGame(){
  board.fill(''); 
  cells.forEach(c=>{c.className='cell'; c.textContent='';});
  current = 'X'; 
  playing = true; 
  lastWinner = null; // ← RESET WINNER TRACKER
  msg(`${getCurrentName()}'s turn (${current})`);
  
  // NEW: Update restart button state
  updateRestartButtonState();
  
  if(gameMode==='single' && current==='O') triggerComputer();
  }


  function showVictoryModal(winnerSymbol) {
  // Update scores in modal
    modalScoreX.textContent = scores.X;
    modalScoreO.textContent = scores.O;
    modalScoreDraw.textContent = scores.draw;
  
  // Show different messages based on result
  if(winnerSymbol === 'X') {
    victoryTitle.textContent = '🏆 X Wins! 🏆';
    victoryTitle.className = 'victory-title x-wins';
    victoryMessage.textContent = `${getNameFor('X')} is the champion!`;
    victoryIcon.textContent = '👑';
  } else if(winnerSymbol === 'O') {
    victoryTitle.textContent = '🏆 O Wins! 🏆';
    victoryTitle.className = 'victory-title o-wins';
    victoryMessage.textContent = `${getNameFor('O')} takes the victory!`;
    victoryIcon.textContent = '👑';
  } else {
    // Draw
    victoryTitle.textContent = '🤝 It\'s a Draw! 🤝';
    victoryTitle.className = 'victory-title draw';
    victoryMessage.textContent = 'No winner this time!';
    victoryIcon.textContent = '🤝';
  }
  
  // Show modal
  victoryModal.classList.remove('hidden');
  
  // Disable game board while modal is open
  playing = false;
  }
  // NEW: Restarts round without resetting scores
 function restartRound(){
  // Just restart the round, keep scores
  board.fill('');
  cells.forEach(c=>{
    c.className='cell';
    c.textContent='';
  });
  
  // Winner starts next round, or X if draw
  current = lastWinner || 'X';
  
  playing = true;
  msg(`${getCurrentName()}'s turn (${current})`);
  
  // Update restart button state after restart
  updateRestartButtonState();
  
  // If it's single-player and O's turn, trigger computer
  if(gameMode==='single' && current==='O') {
    triggerComputer();
  }
  }

  function updateScores(){
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreDrawEl.textContent = scores.draw;
  }
  function updateRestartButtonState() {
  // Disable restart in single-player mode WHILE playing
  restartBtn.disabled = (gameMode === 'single' && playing);
  
  // Visual feedback: add/remove disabled class
  restartBtn.classList.toggle('disabled', restartBtn.disabled);
  }
  function getCurrentName(){
    return current==='X' ? (nameX.value || 'Player X') : (nameO.value || (gameMode==='single' ? 'Computer' : 'Player O'));
  }

  function handleCellClick(e){
    if(!playing) return flashCell(e.currentTarget);
    const idx = Number(e.currentTarget.dataset.index);
    if(board[idx]) return flashCell(e.currentTarget);
    placeMove(idx, current);
    if(checkEnd()) return;
    switchPlayer();
    if(gameMode==='single' && current==='O') triggerComputer();
  }

  function flashCell(cell){
    cell.classList.add('invalid');
    setTimeout(()=>cell.classList.remove('invalid'),350);
  }

  function placeMove(i, symbol){
    board[i]=symbol;
    const el=cells[i];
    el.textContent=symbol;
    el.classList.add(symbol.toLowerCase());
  }

  function switchPlayer(){
    current = current==='X' ? 'O' : 'X';
    msg(`${getCurrentName()}'s turn (${current})`);
  }


  //checks if there's a winner or draw after each move
  function checkEnd(){
  const winner = checkWinner(board);
  if(winner){ 
    playing=false; 
    lastWinner = winner.player;
    updateRestartButtonState();
    highlightWin(winner.combo); 
    scores[winner.player]++; 
    updateScores(); 
    showVictoryModal(winner.player); // SHOW MODAL INSTEAD OF msg()
    return true; 
  }
  if(board.every(Boolean)){ 
    playing=false; 
    lastWinner = null;
    updateRestartButtonState();
    scores.draw++; 
    updateScores(); 
    showVictoryModal('draw'); // SHOW DRAW MODAL
    return true; 
  }
  return false;
  }

  function getNameFor(sym){
    return sym==='X' ? (nameX.value||'Player X') : (nameO.value || (gameMode==='single' ? 'Computer' : 'Player O'));
  }

  function checkWinner(b){
    for(const combo of WIN_COMBOS){
      const [a,b1,c] = combo;
      if(board[a] && board[a]===board[b1] && board[a]===board[c]){
        return {player:board[a], combo};
      }
    }
    return null;
  }

  function highlightWin(combo){
    combo.forEach(i=>cells[i].classList.add('win'));
  }

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

  //  EVENT LISTENERS 
  
  // Setup overlay buttons
  twoBtn.addEventListener('click', ()=>setMode('two'));
  singleBtn.addEventListener('click', ()=>setMode('single'));
  

  // Victory Modal Buttons
  nextRoundBtn.addEventListener('click', () => {
  victoryModal.classList.add('hidden');
  restartRound();
  });

  newGameBtn.addEventListener('click', () => {
  victoryModal.classList.add('hidden');
  // Return to setup overlay
  appContainer.classList.add('hidden');
  setupOverlay.classList.remove('hidden');
  setupOverlay.classList.remove('fade-out');
  });
  // Start button - hides overlay and starts game
  startBtn.addEventListener('click', ()=>{
    if(!gameMode){
      setupMsg('⚠️ Please choose a game mode first!');
      return;
    }
    
    // Hide setup overlay, show game
    hideSetupOverlay();
    
    // Start the game
    startGame();
  });
  
  // Restart button
  restartBtn.addEventListener('click', ()=>restartRound());
  
  // Cell click handlers
  cells.forEach(c=>c.addEventListener('click', handleCellClick));

  //  DEFAULT STATE =====
  // Show setup overlay by default, app is hidden
  setMode('two'); // Default to two-player mode
});