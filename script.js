// ============================================
// DADOS DO JOGO
// ============================================
const levels = [
    {
        name: 'Fruits',
        background: 'url("assets/backgrounds/classroom.webp") center/cover',
        items: [
            { word: 'Apple', image: 'assets/fruits/Apple.webp' },
            { word: 'Banana', image: 'assets/fruits/Banana.webp' },
            { word: 'Grape', image: 'assets/fruits/Grape.webp' },
            { word: 'Orange', image: 'assets/fruits/Orange.webp' },
            { word: 'Strawberry', image: 'assets/fruits/Strawberry.webp' }
        ]
    },
    {
        name: 'Animals',
        background: 'url("assets/backgrounds/park.webp") center/cover',
        items: [
            { word: 'Dog', image: 'assets/animals/Dog.webp' },
            { word: 'Cat', image: 'assets/animals/Cat.webp' },
            { word: 'Rabbit', image: 'assets/animals/Rabbit.webp' },
            { word: 'Fish', image: 'assets/animals/Fish.webp' },
            { word: 'Bird', image: 'assets/animals/Bird.webp' }
        ]
    },
    {
        name: 'Objects',
        background: 'url("assets/backgrounds/bedroom.webp") center/cover',
        items: [
            { word: 'Ball', image: 'assets/objects/Ball.webp' },
            { word: 'Book', image: 'assets/objects/Book.webp' },
            { word: 'Car', image: 'assets/objects/Car.webp' },
            { word: 'Star', image: 'assets/objects/Star.webp' },
            { word: 'Lollipop', image: 'assets/objects/Lollipop.webp' }
        ]
    }
];

let currentLevel = 0;
let currentItem = null;
let isAnswering = false;
let synth = window.speechSynthesis;
let currentCards = [];
let roundItems = [];

// Elementos DOM
const playOverlay = document.getElementById('playOverlay');
const playBtn = document.getElementById('playBtn');
const startBtn = document.getElementById('startBtn');
const skipBtn = document.getElementById('skipBtn');
const gameScreen = document.getElementById('gameScreen');
const cardsContainer = document.getElementById('cardsContainer');
const levelIndicator = document.getElementById('levelIndicator');
const bubuGame = document.getElementById('bubuGame');
const bubuSpeech = document.getElementById('bubuSpeech');
const congratsScreen = document.getElementById('congratsScreen');
const congratsText = document.getElementById('congratsText');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const soundBtn = document.getElementById('soundBtn');
const homeBtn = document.getElementById('homeBtn');

// ============================================
// PLAYER DE ÁUDIO (MÚSICAS)
// ============================================
const audioPlayer = {
    openingMusic: null,
    backgroundMusic: null,
    isMuted: false,
    backgroundStarted: false,
    
    init() {
        this.openingMusic = new Audio('assets/audio/abertura.mp3');
        this.backgroundMusic = new Audio('assets/audio/trilha.mp3');
        
        this.openingMusic.volume = 0.7;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.loop = true;
        
        // Quando abertura terminar, iniciar trilha UMA VEZ
        this.openingMusic.addEventListener('ended', () => {
            console.log('🎵 Abertura terminou, iniciando trilha...');
            if (!this.backgroundStarted) {
                this.startBackground();
            }
        });
        
        // Prevenir loop da abertura
        this.openingMusic.loop = false;
    },
    
    playOpening() {
        if (!this.isMuted) {
            this.openingMusic.currentTime = 0;
            this.openingMusic.play()
                .then(() => console.log('🎵 Abertura tocando!'))
                .catch(err => console.warn('⚠️ Autoplay bloqueado:', err));
        }
    },
    
    startBackground() {
        if (!this.isMuted && !this.backgroundStarted) {
            this.backgroundStarted = true;
            this.openingMusic.pause();
            this.openingMusic.currentTime = 0;
            
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play()
                .then(() => console.log('🎵 Trilha tocando!'))
                .catch(err => console.warn('⚠️ Trilha bloqueada:', err));
        }
    },
    
    stopAll() {
        this.openingMusic.pause();
        this.backgroundMusic.pause();
    },
    
    // Reiniciar trilha suavemente
    restartBackground() {
        if (!this.isMuted) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(err => console.warn('️ Trilha:', err));
        }
    }
};

audioPlayer.init();

// ============================================
// BOTÃO PLAY INICIAL
// ============================================
playBtn.addEventListener('click', () => {
    playOverlay.style.display = 'none';
    audioPlayer.playOpening();
    startIntroSequence();
});

// ============================================
// SEQUÊNCIA DA CAPA
// ============================================
function startIntroSequence() {
    console.log('🎬 Iniciando sequência da capa...');
    
    setTimeout(() => {
        document.querySelector('.speech-bubble').classList.add('show');
        
        setTimeout(() => {
            speak("Hi! I'm BUBU!", () => {
                setTimeout(() => {
                    document.getElementById('speechText').textContent = "Let's play!";
                    speak("Let's play!");
                }, 2000);
            });
        }, 3500);
    }, 500);
    
    // Auto-pulo após 16s
    setTimeout(() => {
        if (document.querySelector('.logo-screen').style.display !== 'none') {
            document.getElementById('startBtn').click();
        }
    }, 16000);
}

// ============================================
// BOTÃO SKIP
// ============================================
skipBtn.addEventListener('click', () => {
    console.log('️ Pulando...');
    synth.cancel();
    audioPlayer.stopAll();
    
    document.querySelector('.logo-screen').style.display = 'none';
    document.querySelector('.city-screen').style.display = 'none';
    document.querySelector('.bubu-walking').style.display = 'none';
    document.querySelector('.bubu-standing').style.display = 'none';
    document.querySelector('.speech-bubble').style.display = 'none';
    document.getElementById('startBtn').style.display = 'none';
    skipBtn.style.display = 'none';
    
    gameScreen.classList.add('active');
    audioPlayer.startBackground();
    loadLevel(0);
});

// ============================================
// INICIAR JOGO
// ============================================
startBtn.addEventListener('click', () => {
    console.log('🎮 Iniciando jogo...');
    gameScreen.classList.add('active');
    skipBtn.style.display = 'none';
    
    audioPlayer.stopAll();
    audioPlayer.backgroundStarted = false;
    setTimeout(() => {
        audioPlayer.startBackground();
    }, 300);
    
    loadLevel(0);
});

// ============================================
// CARREGAR FASE - FRASE ÚNICA
// ============================================
function loadLevel(levelIndex) {
    currentLevel = levelIndex;
    const level = levels[levelIndex];
    
    gameScreen.style.background = level.background;
    levelIndicator.textContent = `Level ${levelIndex + 1}: ${level.name}`;
    
    synth.cancel();
    
    // Falar "Let's play..." apenas UMA VEZ (sem repeat)
    speak(`Let's play ${level.name}!`, () => {
        setTimeout(() => {
            loadRound();
        }, 2000);
    }, false); // SEM REPETIÇÃO
}

// ============================================
// CARREGAR RODADA
// ============================================
function loadRound() {
    isAnswering = false;
    cardsContainer.innerHTML = '';
    currentCards = [];
    synth.cancel();
    
    const level = levels[currentLevel];
    const shuffled = [...level.items].sort(() => Math.random() - 0.5);
    roundItems = shuffled.slice(0, 3);
    currentItem = roundItems[Math.floor(Math.random() * 3)];
    
    // "Let's go" apenas UMA VEZ
    speak("Let's go! Let's go!", () => {
        setTimeout(() => {
            showAndPronounceItem(0);
        }, 1500);
    }, false); // SEM REPETIÇÃO
}

// ============================================
// MOSTRAR E PRONUNCIAR ITEM SEQUENCIAL
// ============================================
function showAndPronounceItem(index) {
    if (index >= roundItems.length) {
        setTimeout(() => {
            makeAllCardsClickable();
            askQuestion();
        }, 1500);
        return;
    }
    
    const item = roundItems[index];
    
    const card = document.createElement('div');
    card.className = 'card not-clickable';
    card.innerHTML = `<img src="${item.image}" alt="${item.word}">`;
    card.dataset.word = item.word;
    card.dataset.index = index;
    
    cardsContainer.appendChild(card);
    currentCards.push(card);
    
    setTimeout(() => {
        card.classList.remove('not-clickable');
        card.classList.add('visible');
        
        setTimeout(() => {
            // Pronunciar palavra 2 vezes (COM repetição)
            pronounceWordWithZoom(item.word, card, () => {
                setTimeout(() => {
                    showAndPronounceItem(index + 1);
                }, 1500);
            });
        }, 600);
    }, 100);
}

// ============================================
// PRONUNCIAR PALAVRA COM ZOOM (REPETE 2X)
// ============================================
function pronounceWordWithZoom(word, card, callback) {
    card.classList.add('speaking');
    
    speak(word, () => {
        setTimeout(() => {
            speak(word, () => {
                setTimeout(() => {
                    card.classList.remove('speaking');
                    if (callback) callback();
                }, 500);
            }, true); // REPETE
        }, 500);
    }, true); // REPETE
}

// ============================================
// DEIXAR TODOS OS CARDS CLICÁVEIS
// ============================================
function makeAllCardsClickable() {
    currentCards.forEach(card => {
        card.classList.remove('not-clickable');
        card.classList.add('clickable');
        card.addEventListener('click', (e) => {
            const item = roundItems[parseInt(card.dataset.index)];
            handleAnswer(item, card, e);
        });
    });
}

// ============================================
// FAZER A PERGUNTA (COM REPETIÇÃO)
// ============================================
function askQuestion() {
    isAnswering = true;
    bubuSpeech.textContent = `Where is the ${currentItem.word}?`;
    
    // Pergunta repete (importante para a criança entender)
    speak(`Where is the ${currentItem.word}?`, null, true); // COM REPETIÇÃO
}

// ============================================
// VERIFICAR RESPOSTA
// ============================================
function handleAnswer(selected, card, event) {
    if (!isAnswering) return;
    
    if (selected.word === currentItem.word) {
        isAnswering = false;
        synth.cancel();
        
        card.classList.add('correct');
        bubuGame.classList.add('celebrate');
        
        bubuSpeech.textContent = `${selected.word}! Great job!`;
        
        // Resposta correta - repete palavra
        speak(`${selected.word}! Great job!`, () => {
            setTimeout(() => {
                createConfetti();
                
                setTimeout(() => {
                    showCongratulations();
                }, 1500);
            }, 1000);
        }, true); // REPETE
        
    } else {
        card.classList.add('wrong');
        bubuSpeech.textContent = 'Try again!';
        
        // Erro - fala "Try again" sem repetir
        speak('Try again! You can do it!', () => {
            setTimeout(() => {
                // Repete apenas a pergunta (COM repetição)
                speak(`Where is the ${currentItem.word}?`, null, true);
            }, 2000);
        }, false); // SEM REPETIÇÃO
        
        setTimeout(() => {
            card.classList.remove('wrong');
        }, 600);
    }
}

// ============================================
// CONGRATULATIONS (SEM REPETIR)
// ============================================
function showCongratulations() {
    congratsText.textContent = `You completed Level ${currentLevel + 1}!`;
    congratsScreen.classList.add('active');
    
    // Congratulations fala apenas uma vez
    speak('Congratulations!', null, false); // SEM REPETIÇÃO
}

// ============================================
// PRÓXIMA FASE
// ============================================
nextLevelBtn.addEventListener('click', () => {
    congratsScreen.classList.remove('active');
    bubuGame.classList.remove('celebrate');
    synth.cancel();
    
    if (currentLevel < levels.length - 1) {
        // Reiniciar trilha suavemente
        audioPlayer.restartBackground();
        loadLevel(currentLevel + 1);
    } else {
        congratsText.textContent = 'You completed all levels!';
        congratsScreen.classList.add('active');
        speak('You completed all levels! Amazing!', () => {
            setTimeout(() => {
                location.reload();
            }, 3000);
        }, false); // SEM REPETIÇÃO
    }
});

// ============================================
// CONTROLES
// ============================================
soundBtn.addEventListener('click', () => {
    if (currentItem && isAnswering) {
        synth.cancel();
        // Botão repete apenas a pergunta
        speak(`Where is the ${currentItem.word}?`, null, true);
    }
});

homeBtn.addEventListener('click', () => {
    if (confirm('Go back to start?')) {
        location.reload();
    }
});

// ============================================
// ÁUDIO (Text-to-Speech) - CONTROLE DE REPETIÇÃO
// ============================================
function speak(text, callback, repeat = false) {
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.3;
    
    utterance.onend = () => {
        if (repeat) {
            setTimeout(() => {
                const repeatUtterance = new SpeechSynthesisUtterance(text);
                repeatUtterance.lang = 'en-US';
                repeatUtterance.rate = 0.8;
                repeatUtterance.pitch = 1.3;
                repeatUtterance.onend = () => {
                    if (callback) callback();
                };
                synth.speak(repeatUtterance);
            }, 500);
        } else {
            if (callback) callback();
        }
    };
    
    synth.speak(utterance);
}

// ============================================
// CONFETES
// ============================================
function createConfetti() {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 40);
    }
}
