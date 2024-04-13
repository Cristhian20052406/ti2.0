const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('time-left');
const audioCorrect = document.getElementById('audio-correct');
const audioGame = document.getElementById('audio-game');
const startButton = document.getElementById('start-button');
const buttons = document.querySelectorAll('.button');
let lastKeyPressed = document.getElementById('last-key');
let score = 0;
let isPlaying = false;
let isPaused = false;
let timeLeft = 0;
let noteInterval;
let timerInterval;
let originalNoteInterval = 2000; // Intervalo original de generación de notas
let activeAnimations = [];

document.addEventListener('keydown', e => {
  if (!isPlaying && (e.key === ' ' || e.key === 'Enter')) {
    startGame();
  }
});

function startGame() {
  resetGame(); // Reinicia el juego
  startButton.style.display = 'none'; // Oculta el botón de "Jugar de nuevo"
}

function resetGame() {
  clearInterval(noteInterval);
  clearInterval(timerInterval);
  isPlaying = true;
  isPaused = false; // Asegúrate de que el juego no esté pausado al reiniciar
  score = 0;
  timeLeft = 0;
  scoreDisplay.textContent = score;
  updateTimerDisplay();
  resetButtons(); // Reinicia el estado de los botones
  lastKeyPressed.textContent = ''; // Restablece la última tecla presionada correctamente
  // Eliminar notas restantes
  const notes = document.querySelectorAll('.note');
  notes.forEach(note => gameContainer.removeChild(note));
  // Restaurar intervalo original de generación de notas
  noteInterval = originalNoteInterval;
  // Iniciar generación de notas y temporizador
  generateNotes();
  startTimer();
  audioGame.currentTime = 0; // Reinicia la música
  audioGame.play(); // Reproducir música
}

function resetButtons() {
  buttons.forEach(button => {
    button.classList.remove('pressed');
    button.classList.remove('hit');
  });
}

function generateNotes() {
  let timeElapsed = 0;
  noteInterval = setInterval(() => {
    if (!isPlaying || isPaused) {
      clearInterval(noteInterval);
      return;
    }
    const randomButtonIndex = Math.floor(Math.random() * 6);
    const randomButton = buttons[randomButtonIndex];
    createNote(randomButton);
    timeElapsed++;
    if (timeElapsed % 4 === 0) {
      clearInterval(noteInterval);
      const newInterval = Math.max(900, 1000 - timeElapsed * 100);
      generateNotesWithInterval(newInterval);
    }
  }, originalNoteInterval);
}

function generateNotesWithInterval(interval) {
  noteInterval = setInterval(() => {
    if (!isPlaying || isPaused) {
      clearInterval(noteInterval);
      return;
    }
    const randomButtonIndex = Math.floor(Math.random() * 6);
    const randomButton = buttons[randomButtonIndex];
    createNote(randomButton);
  }, interval);
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (isPaused) {
      return;
    }
    timeLeft++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function createNote(button) {
  const note = document.createElement('div');
  note.classList.add('note');
  note.style.left = `${button.offsetLeft + (button.offsetWidth / 2) - 25}px`;

  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  note.style.backgroundColor = randomColor;

  gameContainer.appendChild(note);

  const animation = note.animate([
    { top: '-50px' },
    { top: `${gameContainer.offsetHeight}px` }
  ], {
    duration: 3000,
    easing: 'linear'
  });

  activeAnimations.push(animation); // Guarda la animación en la lista

  animation.onfinish = () => {
    gameContainer.removeChild(note);
    // No necesitamos finalizar el juego cuando una nota llega al final
  };
}

function checkNote() {
  const notes = document.querySelectorAll('.note');
  notes.forEach(note => {
    const noteBottom = note.offsetTop + note.offsetHeight;
    const buttonIndex = Math.floor((note.offsetLeft + (note.offsetWidth / 2)) / (gameContainer.offsetWidth / buttons.length));
    const button = buttons[buttonIndex];

    if (noteBottom >= gameContainer.offsetHeight && button.classList.contains('pressed')) {
      score++;
      scoreDisplay.textContent = score;
      audioCorrect.currentTime = 0;
      audioCorrect.play();
      gameContainer.removeChild(note); // Eliminar la nota al realizar un acierto
    }
  });
}

gameContainer.addEventListener('click', () => {
  if (isPlaying && !isPaused) {
    pauseGame(); // Pausa el juego si está en ejecución y no está pausado
  } else if (isPaused) {
    resumeGame(); // Reanuda el juego si está pausado y se hace clic en el área del juego
  }
});


buttons.forEach(button => {
  button.addEventListener('mousedown', () => {
    button.classList.add('pressed');
    checkNote();
  });

  button.addEventListener('mouseup', () => {
    button.classList.remove('pressed');
  });

  document.addEventListener('keydown', e => {
    if (!isPlaying) return;
    const key = e.key.toUpperCase();
    const keyCode = parseInt(button.getAttribute('data-key'));
    if (key === button.textContent && e.keyCode === keyCode) {
      button.classList.add('pressed');
      checkNote();
      lastKeyPressed.textContent = key;
    }
  });

  document.addEventListener('keyup', e => {
    if (!isPlaying) return;
    const keyCode = parseInt(button.getAttribute('data-key'));
    if (e.keyCode === keyCode) {
      button.classList.remove('pressed');
    }
  });
});

startButton.addEventListener('click', () => {
  if (!isPlaying) {
    startGame(); // Inicia el juego solo si no está en ejecución
  }
});

function pauseGame() {
  isPaused = true;
  audioGame.pause();
  
  // Pausar todas las animaciones activas
  activeAnimations.forEach(animation => {
    animation.pause(); // Pausar la animación
  });
}

function resumeGame() {
  isPaused = false;
  generateNotes(); // Reanudar la generación de notas
  startTimer(); // Reanudar el temporizador
  audioGame.play(); // Reanudar la música
  
  // Reanudar todas las animaciones activas
  activeAnimations.forEach(animation => {
    animation.play(); // Reanudar la animación
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (isPlaying && !isPaused) {
      pauseGame(); // Pausa el juego si está en ejecución y no está pausado
    } else if (isPaused) {
      resumeGame(); // Reanuda el juego si está pausado
    }
  }
});
