// 💾 script.js (Koreksi Utama)

// Mengambil seluruh elemen penting dari HTML
const cells = document.querySelectorAll('#board .cell') // Perbaikan: lebih spesifik ke board cells
const titleHeader = document.querySelector('#titleHeader')
const xPlayerDisplay = document.querySelector('#xPlayerDisplay') 
const oPlayerDisplay = document.querySelector('#oPlayerDisplay')
const restartBtn = document.querySelector('#restartBtn')
const difficultyButtons = document.querySelectorAll('#difficulty .cell')// Mengambil tombol difficulty

// ====== INICIALISASI VARIABEL ======
let player = 'X'
let isPauseGame = false
let isGameStart = false
let difficulty = 'keroco' 

// Penyimpanan isi papan (9 kotak)
const inputCells = ['', '', '',
                    '', '', '',
                    '', '', '']

// Kombinasi angka index yang bisa menghasilkan kemenangan
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertikal
    [0, 4, 8], [2, 4, 6]             // Diagonal
]

// Menambahkan event klik ke setiap cell board
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => tapCell(cell, index))
})

// Event klik difficulty
difficultyButtons.forEach(btn => {
    // Set 'keroco' sebagai default aktif (sesuai HTML)
    if (btn.textContent.toLowerCase() === difficulty) {
        btn.classList.add('player-active')
    }

    btn.addEventListener('click', () => {
        // PERBAIKAN: Tidak boleh ganti saat game jalan
        if (isGameStart) return 

        // Reset highlight
        difficultyButtons.forEach(b => b.classList.remove('player-active'))

        // Set difficulty berdasarkan teks
        // PERBAIKAN: Konversi nama ke 'easy', 'medium', 'hard' untuk logika AI
        const diffText = btn.textContent.toLowerCase()
        if (diffText === 'keroco') {
            difficulty = 'easy'
        } else if (diffText === 'Pengalaman') {
            difficulty = 'medium'
        } else {
            difficulty = 'hard'
        }
        
        btn.classList.add('player-active')
    })
})


// USER TAP PADA CELL
function tapCell(cell, index) {

    // Hanya bisa ditekan kalau cell kosong dan game tidak pause
    if (cell.textContent === '' && !isPauseGame) {

        isGameStart = true // Now player cannot change token (X/O)

        // 1. Player X/O mengisi cell
        updateCell(cell, index)  

        // 2. Cek pemenang setelah player isi
        if (checkWinner()) return
        
        // 3. Pindah ke giliran AI (player sekarang adalah AI)
        changePlayer()   

        // 4. AI bergerak
        aiMove()     
    }
}


// MENGISI CELL
function updateCell(cell, index) {
    cell.textContent = player            
    inputCells[index] = player           
    cell.style.color = player === 'X' ? '#1892EA' : '#A737FF'  
}


// GANTI PLAYER
function changePlayer() {
    player = player === 'X' ? 'O' : 'X'
    // Update display header player
    if (player === 'X') {
        xPlayerDisplay.classList.add('player-active')
        oPlayerDisplay.classList.remove('player-active')
    } else {
        xPlayerDisplay.classList.remove('player-active')
        oPlayerDisplay.classList.add('player-active')
    }
}


// ====== AI CONTROLLER ======
function aiMove() {
    isPauseGame = true // Pause agar user tidak bisa klik saat AI berpikir

    setTimeout(() => {
        let index

        // PERBAIKAN: Gunakan difficulty yang sudah di-map ke 'easy', 'medium', 'hard'
        if (difficulty === 'easy') {
            index = aiRandom()
        } 
        else if (difficulty === 'medium') {
            index = aiDefensive()
        } 
        else {
            // PERBAIKAN: AI Minimax hanya bekerja jika inputCells direset ke kondisi awal
            index = aiMinimax() 
        }
        
        // Pastikan ada langkah yang bisa diambil (untuk jaga-jaga)
        if (index !== undefined) {
            updateCell(cells[index], index)
            
            // Cek pemenang setelah AI mengisi
            if (!checkWinner()) {
                changePlayer() // Pindah ke giliran user
            }
        }

        isPauseGame = false
    }, 600)
}

// AI EASY: asal pilih
function aiRandom() {
    let index
    const availableCells = inputCells.map((val, idx) => val === '' ? idx : null).filter(idx => idx !== null)

    if (availableCells.length > 0) {
        // PERBAIKAN: Pilih index dari list yang tersedia
        const randomIndex = Math.floor(Math.random() * availableCells.length)
        return availableCells[randomIndex]
    }
    return undefined // Tidak ada cell kosong
}

// AI MEDIUM: blokir lawan jika hampir menang (atau menang jika bisa)
function aiDefensive() {
    const opponent = player === 'X' ? 'O' : 'X'
    
    // Fungsi bantu untuk mencari langkah kemenangan atau blokir
    function findWinningOrBlockingMove(targetPlayer) {
        for (const [a, b, c] of winConditions) {
            const line = [inputCells[a], inputCells[b], inputCells[c]]
            
            // Cek jika 2 dari 3 cell diisi oleh 'targetPlayer' (AI atau Opponent)
            if (line.filter(i => i === targetPlayer).length === 2 &&
                line.includes('')) {

                // Ambil index cell yang kosong
                return [a, b, c][line.indexOf('')]
            }
        }
        return undefined
    }

    // 1. Cek jika AI (player saat ini) bisa menang
    let winningMove = findWinningOrBlockingMove(player)
    if (winningMove !== undefined) {
        return winningMove
    }

    // 2. Cek jika Opponent bisa menang (blokir)
    let blockingMove = findWinningOrBlockingMove(opponent)
    if (blockingMove !== undefined) {
        return blockingMove
    }
    
    // 3. Kalau tidak ada ancaman/kemenangan → random
    return aiRandom()
}

// AI HARD: minimax algorithm
// PERBAIKAN KRITIS: Minimax membutuhkan array board (inputCells) sebagai parameter,
// dan perlu menghitung skor berdasarkan AI (Maximizer) dan Opponent (Minimizer).
const scores = {
    // Skor AI (Maximizing Player)
    [player === 'X' ? 'X' : 'O']: 10, 
    // Skor Opponent (Minimizing Player)
    [player === 'X' ? 'O' : 'X']: -10,
    'draw': 0
}

function aiMinimax() {
    let bestScore = -Infinity
    let move
    
    // Ambil player AI yang sedang jalan
    const maximizingPlayer = player 

    inputCells.forEach((cell, index) => {
        if (cell === '') {
            inputCells[index] = maximizingPlayer // Simulasikan langkah AI
            let score = minimax(inputCells, 0, false, maximizingPlayer) // isMaximizing = false (giliran lawan)
            inputCells[index] = '' // Reset board
            
            if (score > bestScore) {
                bestScore = score
                move = index
            }
        }
    })

    return move
}

function minimax(board, depth, isMaximizing, aiToken) {
    let result = evaluateWinnerMinimax(board, aiToken)
    if (result !== null) {
        // Gunakan skor dari objek 'scores'
        return result 
    }

    // Pemain yang ingin memaksimalkan skor (AI)
    if (isMaximizing) {
        let best = -Infinity
        const currentToken = aiToken
        
        board.forEach((cell, i) => {
            if (cell === '') {
                board[i] = currentToken
                best = Math.max(best, minimax(board, depth + 1, false, aiToken))
                board[i] = ''
            }
        })
        return best
    } 
    // Pemain yang ingin meminimalkan skor (Opponent)
    else { 
        let best = Infinity
        // PERBAIKAN: Tentukan token lawan dengan benar
        const opponent = aiToken === 'X' ? 'O' : 'X' 

        board.forEach((cell, i) => {
            if (cell === '') {
                board[i] = opponent
                best = Math.min(best, minimax(board, depth + 1, true, aiToken))
                board[i] = ''
            }
        })
        return best
    }
}

// Evaluasi skor minimax (TERPISAH dari evaluateWinner biasa)
function evaluateWinnerMinimax(board, aiToken) {
    for (const [a, b, c] of winConditions) {
        if (board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]) {
            
            // PERBAIKAN: Gunakan nilai 10/-10/0 secara langsung
            return board[a] === aiToken ? 10 : -10 
        }
    }

    if (board.every(c => c !== '')) return 0 // Draw
    return null
}


// CEK KEMENANGAN (untuk game utama)
function checkWinner() {
    
    // Cek semua kombinasi winCondition
    for (const [a, b, c] of winConditions) {

        // Kalau semua 3 cell sesuai player yang sedang jalan → menang
        if (inputCells[a] === player &&
            inputCells[b] === player &&
            inputCells[c] === player) {

            declareWinner([a, b, c])
            return true
        }
    }

    // Jika semua cell terisi → draw
    if (inputCells.every(i => i !== '')) {
        declareDraw()
        return true
    }

    return false 
}


// TAMPILKAN PEMENANG
function declareWinner(indices) {
    titleHeader.textContent = `${player} Win`
    isPauseGame = true
    
    // Beri highlight ke cell yang menang
    indices.forEach(i => {
        cells[i].style.background = '#2A2343'
    })

    restartBtn.style.visibility = 'visible'
}


// TAMPILKAN DRAW
function declareDraw() {
    titleHeader.textContent = 'Draw!'
    isPauseGame = true
    restartBtn.style.visibility = 'visible'
}


// PILIH PLAYER X / O DIAWAL GAME
function choosePlayer(p) {

    // Tidak boleh ganti player kalau game sudah dimulai
    if (isGameStart) return

    player = p
    // Reset teks header saat memilih player
    titleHeader.textContent = 'Mulai' 

    // Highlight UI player yang dipilih
    if (p === 'X') {
        xPlayerDisplay.classList.add('player-active')
        oPlayerDisplay.classList.remove('player-active')
    } else {
        xPlayerDisplay.classList.remove('player-active')
        oPlayerDisplay.classList.add('player-active')
    }
}


// RESTART GAME
restartBtn.addEventListener('click', () => {

    restartBtn.style.visibility = 'hidden'

    // Reset logika
    inputCells.fill('')
    player = 'X'
    isPauseGame = false
    isGameStart = false

    // Reset tampilan board
    cells.forEach(cell => {
        cell.textContent = ''
        cell.style.background = ''
    })

    // Reset teks header & player aktif
    titleHeader.textContent = 'Pilih'
    xPlayerDisplay.classList.add('player-active')
    oPlayerDisplay.classList.remove('player-active')
})