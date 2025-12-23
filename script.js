// ================================
// TIC TAC TOE by Riyan 
// ================================

// ---------- UI ----------
const cells = document.querySelectorAll('#board .cell')
const titleHeader = document.querySelector('#titleHeader')
const xPlayerDisplay = document.querySelector('#xPlayerDisplay')
const oPlayerDisplay = document.querySelector('#oPlayerDisplay')
const restartBtn = document.querySelector('#restartBtn')
const difficultyButtons = document.querySelectorAll('#difficulty .cell')

// ---------- GAME STATE ----------
let board = Array(9).fill('')
let HUMAN = 'X'
let AI = 'O'
let currentTurn = null
let gameActive = false
let difficulty = 'easy'

// ---------- CONSTANTS ----------
const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
]

// ---------- UTILS ----------
const emptyCells = b =>
  b.map((v,i)=>v===''?i:null).filter(i=>i!==null)

const winFor = (b,t) =>
  winConditions.some(([a,b1,c]) =>
    b[a]===t && b[b1]===t && b[c]===t
  )

// ---------- INITIAL UX LOCK ----------
cells.forEach(c => c.style.pointerEvents = 'none')

// ---------- UI ----------
function render() {
  cells.forEach((c,i)=>{
    c.textContent = board[i]
    c.style.color = board[i]==='X' ? '#1892EA' : '#A737FF'
  })
}

function setTurnUI() {
  xPlayerDisplay.classList.toggle('player-active', currentTurn==='X')
  oPlayerDisplay.classList.toggle('player-active', currentTurn==='O')
}

// ---------- GAME FLOW ----------
function startGame() {
  gameActive = true
  titleHeader.textContent = 'Main'
  cells.forEach(c => c.style.pointerEvents = 'auto')
  setTurnUI()

  if (currentTurn === AI) {
    aiTurn()
  }
}

function endGame(text) {
  gameActive = false
  titleHeader.textContent = text
  restartBtn.style.visibility = 'visible'
  cells.forEach(c => c.style.pointerEvents = 'none')
}

// ---------- HUMAN ----------
function humanMove(index) {
  if (!gameActive) return
  if (currentTurn !== HUMAN) return
  if (board[index] !== '') return

  board[index] = HUMAN
  render()

  if (winFor(board, HUMAN)) {
    endGame(`${HUMAN} Win`)
    return
  }

  if (emptyCells(board).length === 0) {
    endGame('Draw!')
    return
  }

  currentTurn = AI
  setTurnUI()
  aiTurn()
}

// ---------- AI ----------
function aiTurn() {
  if (!gameActive) return
  if (currentTurn !== AI) return

  setTimeout(() => {
    let move =
      difficulty === 'easy' ? aiEasy(board) :
      difficulty === 'medium' ? aiMedium(board) :
      aiHard(board)

    if (move === undefined) return

    board[move] = AI
    render()

    if (winFor(board, AI)) {
      endGame(`${AI} Win`)
      return
    }

    if (emptyCells(board).length === 0) {
      endGame('Draw!')
      return
    }

    currentTurn = HUMAN
    setTurnUI()
  }, 400)
}

// ---------- AI LEVELS ----------
function aiEasy(b) {
  const e = emptyCells(b)
  return e[Math.floor(Math.random() * e.length)]
}

function aiMedium(b) {
  const e = emptyCells(b)

  // blok ancaman
  for (const i of e) {
    b[i] = HUMAN
    if (winFor(b, HUMAN)) {
      b[i] = ''
      return i
    }
    b[i] = ''
  }

  if (e.includes(4)) return 4

  const corners = [0,2,6,8].filter(i => e.includes(i))
  if (corners.length) {
    return corners[Math.floor(Math.random() * corners.length)]
  }

  return e[Math.floor(Math.random() * e.length)]
}

function aiHard(b) {
  let bestScore = -Infinity
  let move

  for (const i of emptyCells(b)) {
    b[i] = AI
    const score = minimax(b, false, 0)
    b[i] = ''
    if (score > bestScore) {
      bestScore = score
      move = i
    }
  }
  return move
}

function minimax(b, isMax, depth) {
  if (winFor(b, AI)) return 10 - depth
  if (winFor(b, HUMAN)) return depth - 10
  if (emptyCells(b).length === 0) return 0

  if (isMax) {
    let best = -Infinity
    for (const i of emptyCells(b)) {
      b[i] = AI
      best = Math.max(best, minimax(b, false, depth + 1))
      b[i] = ''
    }
    return best
  } else {
    let best = Infinity
    for (const i of emptyCells(b)) {
      b[i] = HUMAN
      best = Math.min(best, minimax(b, true, depth + 1))
      b[i] = ''
    }
    return best
  }
}

// ---------- EVENTS ----------
cells.forEach((cell, i) =>
  cell.addEventListener('click', () => humanMove(i))
)

function choosePlayer() {
  if (gameActive) return

  // AI memilih simbol secara acak
  if (Math.random() < 0.5) {
    AI = 'X'
    HUMAN = 'O'
  } else {
    AI = 'O'
    HUMAN = 'X'
  }

  // Player SELALU mulai
  currentTurn = HUMAN

  startGame()
}


restartBtn.addEventListener('click', () => {
  board.fill('')
  gameActive = false
  currentTurn = null
  restartBtn.style.visibility = 'hidden'
  titleHeader.textContent = 'Pilih'
  cells.forEach(c => c.style.pointerEvents = 'none')
  render()
})

difficultyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (gameActive) return
    difficultyButtons.forEach(b => b.classList.remove('player-active'))
    btn.classList.add('player-active')

    const t = btn.textContent.toLowerCase()
    difficulty =
      t === 'pemula' ? 'easy' :
      t === 'pengalaman' ? 'medium' : 'hard'
  })
})


