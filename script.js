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
const speechText = document.getElementById('speechText');

// ============================================
// PLAYER DE ÁUDIO
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
        this.openingMusic.loop = false;
        
        this.openingMusic.addEventListener('ended', () => {
            if (!this.backgroundStarted) {
                this.startBackground();
            }
        });
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
                .then(() => console.log(' Trilha tocando!'))
                .catch(err => console.warn('⚠️ Trilha bloqueada:', err));
        }
    },
    
    stopAll() {
        this.openingMusic.pause();
        this.backgroundMusic.pause();
    },
    
    restartBackground() {
        if (!this.isMuted) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(err => console.warn('⚠️ Trilha:', err));
        }
    }
};

audioPlayer.init();

// ============================================
// FUNÇÕES DE ÁUDIO
// ============================================

function speak(text, callback) {
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.3;
    
    utterance.onend = () => {
        if (callback) callback();
    };
    
    synth.speak(utterance);
}

function speakObject(word, card, callback) {
    synth.cancel();
    
    card.classList.add('speaking');
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.3;
    
    utterance.onend = () => {
        setTimeout(() => {
            const repeatUtterance = new SpeechSynthesisUtterance(word);
            repeatUtterance.lang = 'en-US';
            repeatUtterance.rate = 0.8;
            repeatUtterance.pitch = 1.3;
            
            repeatUtterance.onend = () => {
                setTimeout(() => {
                    card.classList.remove('speaking');
                    if (callback) callback();
                }, 500);
            };
            
            synth.speak(repeatUtterance);
        }, 500);
    };
    
    synth.speak(utterance);
}

function speakQuestion(text, callback) {
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.3;
    
    utterance.onend = () => {
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
    };
    
    synth.speak(utterance);
}

// ============================================
// BOTÃO PLAY
// ============================================
playBtn.addEventListener('click', () => {
    playOverlay.style.display = 'none';
    audioPlayer.playOpening();
    startIntroSequence();
});

// ============================================
// SEQUÊNCIA DA CAPA - SINCRONIZAÇÃO PERFEITA
// ============================================
function startIntroSequence() {
    console.log('🎬 Iniciando sequência da capa...');
    
    // Timeline:
    // 0s: Play clicado
    // 0.5s: Música começa
    // 2.5s: Logo desaparece
    // 3.5s: BUBU começa a andar
    // 6.5s: BUBU para, balão aparece
    
    setTimeout(() => {
        // 6.5s: Mostra balão
        document.querySelector('.speech-bubble').classList.add('show');
        
        // SINCRONIZAÇÃO PERFEITA:
        // Atualiza legenda E fala no MESMO INSTANTE
        setTimeout(() => {
            // Atualiza texto IMEDIATAMENTE
            speechText.textContent = "Hi! I'm BUBU!";
            
            // Fala IMEDIATAMENTE (mesmo instante - delay 0)
            speak("Hi! I'm BUBU!", () => {
                // Quando termina "Hi! I'm BUBU!"
                setTimeout(() => {
                    // Atualiza legenda IMEDIATAMENTE
                    speechText.textContent = "Let's play!";
                    
                    // Fala IMEDIATAMENTE (mesmo instante)
                    speak("Let's play!");
                }, 1000);
            });
        }, 300); // Pequeno delay para balão aparecer
        
    }, 6500); // 6.5s - quando BUBU para
    
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
    console.log('⏭️ Pulando...');
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
// CARREGAR FASE
// ============================================
function loadLevel(levelIndex) {
    currentLevel = levelIndex;
    const level = levels[levelIndex];
    
    gameScreen.style.background = level.background;
    levelIndicator.textContent = `Level ${levelIndex + 1}: ${level.name}`;
    
    synth.cancel();
    
    speak(`Let's play ${level.name}!`, () => {
        setTimeout(() => {
            loadRound();
        }, 2000);
    });
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
    
    speak("Let's go!", () => {
        setTimeout(() => {
            showAndPronounceItem(0);
        }, 1000);
    });
}

// ============================================
// MOSTRAR E PRONUNCIAR ITEM
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
            speakObject(item.word, card, () => {
                setTimeout(() => {
                    showAndPronounceItem(index + 1);
                }, 1500);
            });
        }, 600);
    }, 100);
}

// ============================================
// DEIXAR CARDS CLICÁVEIS
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
// FAZER PERGUNTA
// ============================================
function askQuestion() {
    isAnswering = true;
    bubuSpeech.textContent = `Where is the ${currentItem.word}?`;
    
    speakQuestion(`Where is the ${currentItem.word}?`);
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
        
        speak(`${selected.word}! Great job!`, () => {
            setTimeout(() => {
                createConfetti();
                
                setTimeout(() => {
                    showCongratulations();
                }, 1500);
            }, 1000);
        });
        
    } else {
        card.classList.add('wrong');
        bubuSpeech.textContent = 'Try again!';
        
        speak('Try again! You can do it!', () => {
            setTimeout(() => {
                speakQuestion(`Where is the ${currentItem.word}?`);
            }, 2000);
        });
        
        setTimeout(() => {
            card.classList.remove('wrong');
        }, 600);
    }
}

// ============================================
// CONGRATULATIONS
// ============================================
function showCongratulations() {
    congratsText.textContent = `You completed Level ${currentLevel + 1}!`;
    congratsScreen.classList.add('active');
    
    speak('Congratulations!');
}

// ============================================
// PRÓXIMA FASE
// ============================================
nextLevelBtn.addEventListener('click', () => {
    congratsScreen.classList.remove('active');
    bubuGame.classList.remove('celebrate');
    synth.cancel();
    
    if (currentLevel < levels.length - 1) {
        audioPlayer.restartBackground();
        loadLevel(currentLevel + 1);
    } else {
        congratsText.textContent = 'You completed all levels!';
        congratsScreen.classList.add('active');
        speak('You completed all levels! Amazing!', () => {
            setTimeout(() => {
                location.reload();
            }, 3000);
        });
    }
});

// ============================================
// CONTROLES
// ============================================
soundBtn.addEventListener('click', () => {
    if (currentItem && isAnswering) {
        synth.cancel();
        speakQuestion(`Where is the ${currentItem.word}?`);
    }
});

homeBtn.addEventListener('click', () => {
    if (confirm('Go back to start?')) {
        location.reload();
    }
});

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
