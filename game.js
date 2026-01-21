const logos = [
  'assets/logos/bandeira.svg',
  'assets/logos/cavalo.svg',
  'assets/logos/campina_grill.svg',
  'assets/logos/gourmet.svg',
  'assets/logos/concept.svg',
  'assets/logos/denim.svg',
];

let gameStarted = false;
const winModal = document.getElementById('win-modal');
const restartBtn = document.getElementById('restart-btn');
const loseModal = document.getElementById('lose-modal');
const loseRestartBtn = document.getElementById('lose-restart-btn');
let gameEnded = false;
const pizzaTimer = document.getElementById('pizza-timer');
const pizzaFill = document.getElementById('pizza-fill');
const pizzaHand = document.getElementById('pizza-hand');
let startTime = 0;
let totalDuration = 0;




const board = document.getElementById('board');
let cards = [];
let firstCard = null;
let lockBoard = false;

// duplica + embaralha
function shuffleCards() {
  cards = [...logos, ...logos]
    .sort(() => Math.random() - 0.5);
}
const timerEl = document.getElementById("game-timer");
const timeValueEl = document.getElementById("time-value");


let timerInterval = null;

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function describeSector(cx, cy, r, angle) {
  if (angle <= 0) return '';

  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, angle);
  const largeArc = angle > 180 ? 1 : 0;

  return `
    M ${cx} ${cy}
    L ${start.x} ${start.y}
    A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}
    Z
  `;
}

function startGameTimer(duration = 20) { // Garanta que a duração aqui seja 20
    clearInterval(timerInterval);

    totalDuration = duration * 1000;
    startTime = performance.now();

    pizzaTimer.classList.remove('hidden', 'danger');
    timerEl.classList.remove('hidden', 'danger');

    // Reset imediato para o topo (0 graus)
    pizzaHand.style.transform = `rotate(0deg)`;

    timerInterval = setInterval(() => {
        if (gameEnded) {
            clearInterval(timerInterval);
            return;
        }

        const elapsed = performance.now() - startTime;
        let remaining = totalDuration - elapsed;

        if (remaining < 0) remaining = 0;

        // Atualiza texto do cronômetro
        const seconds = Math.floor(remaining / 1000);
        const cents = Math.floor((remaining % 1000) / 10);
        document.getElementById('time-seconds').textContent = seconds;
        document.getElementById('time-cents').textContent = String(cents).padStart(2, '0');

        // CÁLCULO DO ÂNGULO
        // Progress vai de 0 a 1 em 20 segundos
        const progress = Math.min(elapsed / totalDuration, 1);
        const angle = 360 * progress; 

        // Aplica a rotação. 
        // Agora o 0deg é o topo, então o ponteiro seguirá o sentido horário corretamente.
        pizzaHand.style.transform = `rotate(${angle}deg)`;

        if (remaining <= 5000) { // Alerta nos últimos 5 segundos
            pizzaTimer.classList.add('danger');
            timerEl.classList.add('danger');
        }

        if (remaining <= 0) {
            clearInterval(timerInterval);
            handleGameOver();
        }
    }, 40); 
}



function handleGameOver() {
  if (gameEnded) return;

  gameEnded = true;
  gameStarted = false;
  lockBoard = true;

  clearInterval(timerInterval);
  pizzaTimer.classList.add('hidden'); // ✅ ESCONDE
  timerEl.classList.add('hidden');

  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#e74c3c', '#922b21']
  });

  setTimeout(() => {
    loseModal.classList.add('active');
  }, 600);
}




// cria cartas
function createBoard() {
  board.innerHTML = '';

  cards.forEach((src, index) => {
    const card = document.createElement('div');
    card.classList.add('card');

    // ... (mantenha suas verificações de classe is-cavalo, etc)
    if (src.includes('cavalo')) card.classList.add('is-cavalo');
    if (src.includes('bandeira')) card.classList.add('is-bandeira');
    if (src.includes('campina_grill')) card.classList.add('is-grill');
    if (src.includes('gourmet')) card.classList.add('is-gourmet');
    if (src.includes('concept')) card.classList.add('is-concept');
    if (src.includes('denim')) card.classList.add('is-denim');


    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">
          <img src="${src}" alt="logo" />
        </div>
      </div>
    `;

    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);

    // 🎬 O segredo: usamos requestAnimationFrame para garantir que o card 
    // já exista no DOM antes de remover o estado inicial de "maço"
    requestAnimationFrame(() => {
      setTimeout(() => {
        card.classList.add('animate-in');
      }, index * 60); // 60ms cria um efeito de cascata fluido
    });
  });
}

function aplicarPremio(remainingSeconds) {
  const premioNome = document.getElementById("premio-nome");
  const video = document.getElementById("copo-video-win");

  if (!video) return;

  if (remainingSeconds <= 15) {
    premioNome.textContent = "Copo Rutra Premium";
    winModal.classList.add("premium-win");
  } else {
    premioNome.textContent = "Copo Rutra";
    winModal.classList.remove("premium-win");
  }

  // reinicia vídeo
  video.currentTime = 0;
  video.muted = true;
  video.play().catch(() => {});
}


function setupVideoOnce(videoId) {
  const video = document.getElementById(videoId);
  if (!video) return;

  video.addEventListener("ended", () => {
    video.pause();
  });
}

// WIN
setupVideoOnce("copo-video-win");

// LOSE
setupVideoOnce("copo-video-lose");


function checkWin() {
  // quantidade de cartas já combinadas
  const matched = document.querySelectorAll('.card.matched').length;

  // condição de vitória
  if (matched !== cards.length || gameEnded) return;

  // trava o jogo
  gameEnded = true;
  gameStarted = false;
  lockBoard = true;

  // para o timer
  clearInterval(timerInterval);

  // calcula tempos
  const now = performance.now();
  elapsedTimeMs = now - startTime;
  remainingTimeMs = Math.max(totalDuration - elapsedTimeMs, 0);

  const elapsedSeconds = Math.round(elapsedTimeMs / 1000);
  const remainingSeconds = Math.floor(remainingTimeMs / 1000);

  // atualiza UI
  document.getElementById("tempo-levado").textContent = elapsedSeconds;

  // define prêmio
  aplicarPremio(remainingSeconds);

  // esconde cronômetros
  pizzaTimer.classList.add('hidden');
  timerEl.classList.add('hidden');

  // confete de vitória
  confetti({
    particleCount: 300,
    spread: 120,
    origin: { y: 0.6 },
    colors: ['#223066', '#ffffff', '#f1c40f']
  });

  // abre modal
setTimeout(() => {
  winModal.classList.add('active');

  // só toca DEPOIS de aparecer
  const video = document.getElementById("copo-video-win");
  if (video) {
    video.currentTime = 0;
    video.muted = true;
    video.play().catch(() => {});
  }
}, 600);

}




function autoFinishLastPair() {
  const unmatched = document.querySelectorAll(
    '.card:not(.matched):not(.flipped)'
  );

  if (unmatched.length === 2) {
    lockBoard = true;

    const [card1, card2] = unmatched;

    // vira as duas
    card1.classList.add('flipped');
    card2.classList.add('flipped');

    setTimeout(() => {
      card1.classList.add('matched', 'celebrate');
      card2.classList.add('matched', 'celebrate');

      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#223066', '#ffffff', '#f1c40f']
      });

      setTimeout(() => {
        card1.classList.remove('celebrate');
        card2.classList.remove('celebrate');
        checkWin();
      }, 600);

    }, 400);
  }
}


function flipCard(card) {
  if (!gameStarted) return;
  if (lockBoard) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  checkMatch(card);
}


function checkMatch(secondCard) {
  const img1 = firstCard.querySelector('img').src;
  const img2 = secondCard.querySelector('img').src;

  if (img1 === img2) {
    firstCard.classList.add('matched', 'celebrate');
    secondCard.classList.add('matched', 'celebrate');

    // confete do match
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#223066', '#ffffff']
    });

    setTimeout(() => {
      firstCard.classList.remove('celebrate');
      secondCard.classList.remove('celebrate');
    }, 600);

    resetTurn();
    autoFinishLastPair();
    checkWin();
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    }, 800);
  }
}


function resetTurn() {
  firstCard = null;
  lockBoard = false;
}


//inicira jogo loop inicial
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
function restartGame() {
  // trava tudo
  gameStarted = false;
  lockBoard = false;
  firstCard = null;

  // fecha modal
  winModal.classList.remove("active");

  // limpa o board (remove cartas antigas)
  board.classList.remove("active");
  board.innerHTML = "";

  // novo shuffle + recria cartas
  setTimeout(() => {
    shuffleCards();
    createBoard();
  }, 200);

  // reativa jogo com animação
  setTimeout(() => {
    gameStarted = true;
    board.classList.add("active");
  }, 600);
}

startButton.addEventListener('click', () => {
  gameEnded = false;
  startScreen.classList.add('hidden');

  setTimeout(() => {
    shuffleCards();
    createBoard();
  }, 200);

  // aguarda a animação completa das cartas
  setTimeout(() => {
    board.classList.add('active');
    gameStarted = true;

    // ⏱️ delay suave antes de iniciar o cronômetro
    setTimeout(() => {
      startGameTimer(100);
    }, 1000);

  }, 200 + cards.length * 60 + 300);

});

restartBtn.addEventListener("click", () => {
  window.location.reload()
});

loseRestartBtn.addEventListener('click', () => {
  loseModal.classList.remove('active');
  window.location.reload();
});


// =========================
// PRELOADER RUTRA
// =========================
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  setTimeout(() => {
    preloader.classList.add("hidden");
  }, 300); // leve delay para suavidade
});
