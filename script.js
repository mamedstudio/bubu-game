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
let isProcessingAudio = false;

// Elementos DOM
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
    
    init() {
        this.openingMusic = new Audio('assets/audio/abertura.mp3');
        this.backgroundMusic = new Audio('assets/audio/trilha.mp3');
        
        this.openingMusic.volume = 0.7;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.loop = true;
        
        this.openingMusic.addEventListener('ended', () => {
            console.log('🎵 Abertura terminou');
            this.startBackground();
        });
    },
    
    playOpening() {
        if (!this.isMuted) {
            this.openingMusic.currentTime = 0;
            this.openingMusic.play()
                .then(() => console.log('🎵 Abertura tocando!'))
                .catch(err => {
                    console.warn('⚠️ Autoplay bloqueado - aguardando interação');
                });
        }
    },
    
    startBackground() {
        if (!this.isMuted) {
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
    }
};

audioPlayer.init();

// ============================================
// SISTEMA DE ÁUDIO SIMPLES E CONFIÁVEL
// ============================================
function speak(text, callback, options = {}) {
    const {
        repeat = false,
        onSpeak = null,
        delay = 0
    } = options;
    
    // Cancela áudio anterior
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.3;
    
    utterance.onstart = () => {
        if (onSpeak) onSpeak();
    };
    
    utterance.onend = () => {
        if (repeat) {
            // Repete uma vez após 500ms
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
    
    setTimeout(() => {
        synth.speak(utterance);
    }, delay);
}

// Fala sequencial com delay garantido
function speakWithDelay(texts, callback, index = 0) {
    if (index >= texts.length) {
        if (callback) callback();
        return;
    }
    
    const current = texts[index];
    speak(current.text, () => {
        setTimeout(() => {
            speakWithDelay(texts, callback, index + 1);
        }, current.delay || 1500);
    }, current.options || {});
}

// ============================================
// SEQUÊNCIA DA CAPA (CORRIGIDA)
// ============================================
window.addEventListener('load', () => {
    console.log('🎮 Jogo carregado!');
    
    // Tenta tocar música após clique em qualquer lugar
    document.addEventListener('click', () => {
        if (audioPlayer.openingMusic.paused && !gameScreen.classList.contains('active')) {
            audioPlayer.playOpening();
        }
    }, { once: true });
    
    // Sequência da animação
    setTimeout(() => {
        // 6.5s: BUBU para e aparece
        setTimeout(() => {
            document.querySelector('.speech-bubble').classList.add('show');
            
            // Fala "Hi! I'm BUBU!" sincronizado com o balão
            setTimeout(() => {
                speak("Hi! I'm BUBU!", () => {
                    // 2 segundos depois, fala "Let's play!"
                    setTimeout(() => {
                        document.getElementById('speechText').textContent = "Let's play!";
                        speak("Let's play!");
                    }, 2000);
                }, { repeat: false });
            }, 300); // Pequeno delay para o balão aparecer
        }, 3500);
    }, 500);
    
    // Auto-pulo após 16s
    setTimeout(() => {
        if (document.querySelector('.logo-screen').style.display !== 'none') {
            document.getElementById('startBtn').click();
        }
    }, 16000);
});

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
    isAnswering = true;
    cardsContainer.innerHTML = '';
    currentCards = [];
    synth.cancel();
    
    const level = levels[currentLevel];
    const shuffled = [...level.items].sort(() => Math.random() - 0.5);
    const roundItems = shuffled.slice(0, 3);
    currentItem = roundItems[Math.floor(Math.random() * 3)];
    
    bubuSpeech.textContent = `Where is the ${currentItem.word}?`;
    
    // Criar cards
    roundItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<img src="${item.image}" alt="${item.word}">`;
        card.dataset.word = item.word;
        
        setTimeout(() => {
            card.classList.add('visible');
            currentCards.push(card);
        }, index * 300);
        
        card.addEventListener('click', (e) => handleAnswer(item, card, e));
        cardsContainer.appendChild(card);
    });
    
    // Falar pergunta
    setTimeout(() => {
        speak(`Where is the ${currentItem.word}?`, () => {
            // Após 2s, pronunciar cada item
            setTimeout(() => {
                pronounceItemsOneByOne(roundItems, 0);
            }, 2000);
        }, { repeat: true });
    }, 500);
}

// ============================================
// PRONUNCIAR ITENS UM POR UM (SIMPLES)
// ============================================
function pronounceItemsOneByOne(items, index) {
    if (index >= items.length) return;
    
    const item = items[index];
    const card = currentCards[index];
    
    if (card) {
        // Zoom quando começa a falar
        card.classList.add('speaking');
        
        speak(item.word, () => {
            // Remove zoom
            setTimeout(() => {
                card.classList.remove('speaking');
                
                // Próximo item após 1.5s
                setTimeout(() => {
                    pronounceItemsOneByOne(items, index + 1);
                }, 1500);
            }, 600);
        }, { repeat: true });
    } else {
        // Pula se não tiver card
        pronounceItemsOneByOne(items, index + 1);
    }
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
        }, { repeat: true });
        
    } else {
        card.classList.add('wrong');
        bubuSpeech.textContent = 'Try again!';
        
        speak('Try again! You can do it!', () => {
            setTimeout(() => {
                // Repete a pergunta
                speak(`Where is the ${currentItem.word}?`, () => {
                    // Destaca o item correto
                    const correctCard = currentCards.find(c => c.dataset.word === currentItem.word);
                    if (correctCard) {
                        correctCard.classList.add('speaking');
                        speak(currentItem.word, () => {
                            setTimeout(() => {
                                correctCard.classList.remove('speaking');
                            }, 600);
                        }, { repeat: true });
                    }
                }, { repeat: true });
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
    
    speak('Congratulations!', null, { repeat: true });
}

// ============================================
// PRÓXIMA FASE
// ============================================
nextLevelBtn.addEventListener('click', () => {
    congratsScreen.classList.remove('active');
    bubuGame.classList.remove('celebrate');
    synth.cancel();
    
    if (currentLevel < levels.length - 1) {
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
    if (currentItem) {
        synth.cancel();
        speak(`Where is the ${currentItem.word}?`, () => {
            setTimeout(() => {
                pronounceItemsOneByOne(currentCards.map(c => ({ word: c.dataset.word })), 0);
            }, 2000);
        }, { repeat: true });
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
