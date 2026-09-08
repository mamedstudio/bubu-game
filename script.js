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
// PLAYER DE ÁUDIO
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
            console.log('🎵 Abertura terminou, iniciando trilha...');
            this.startBackground();
        });
        
        this.openingMusic.addEventListener('error', (e) => {
            console.error('❌ Erro ao carregar abertura:', e);
        });
        
        this.backgroundMusic.addEventListener('error', (e) => {
            console.error('❌ Erro ao carregar trilha:', e);
        });
    },
    
    playOpening() {
        if (!this.isMuted) {
            this.openingMusic.currentTime = 0;
            this.openingMusic.play()
                .then(() => console.log('🎵 Música de abertura tocando!'))
                .catch(err => {
                    console.warn('⚠️ Autoplay bloqueado:', err);
                    console.log(' Aguardando interação do usuário...');
                });
        }
    },
    
    startBackground() {
        if (!this.isMuted) {
            this.openingMusic.pause();
            this.openingMusic.currentTime = 0;
            
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play()
                .then(() => console.log('🎵 Trilha de fundo tocando!'))
                .catch(err => console.warn('⚠️ Trilha bloqueada:', err));
        }
    },
    
    stopAll() {
        this.openingMusic.pause();
        this.backgroundMusic.pause();
    },
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.openingMusic.pause();
            this.backgroundMusic.pause();
        } else {
            if (gameScreen.classList.contains('active')) {
                this.startBackground();
            } else {
                this.playOpening();
            }
        }
        return this.isMuted;
    }
};

audioPlayer.init();

// ============================================
// SEQUÊNCIA DA CAPA
// ============================================
window.addEventListener('load', () => {
    console.log('🎮 Jogo carregado, iniciando sequência...');
    
    setTimeout(() => {
        audioPlayer.playOpening();
    }, 500);
    
    setTimeout(() => {
        setTimeout(() => {
            document.querySelector('.speech-bubble').classList.add('show');
            speak("Hi! I'm BUBU!", () => {
                setTimeout(() => {
                    document.getElementById('speechText').textContent = "Let's play!";
                    speak("Let's play!");
                }, 2000);
            });
        }, 3500);
    }, 500);
    
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
    console.log('⏭️ Pulando abertura...');
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
    
    setTimeout(() => {
        speak(`Let's play ${level.name}!`, () => {
            setTimeout(() => {
                loadRound();
            }, 2000);
        });
    }, 500);
}

// ============================================
// CARREGAR RODADA
// ============================================
function loadRound() {
    isAnswering = true;
    cardsContainer.innerHTML = '';
    currentCards = [];
    
    const level = levels[currentLevel];
    const shuffled = [...level.items].sort(() => Math.random() - 0.5);
    const roundItems = shuffled.slice(0, 3);
    currentItem = roundItems[Math.floor(Math.random() * 3)];
    
    bubuSpeech.textContent = `Where is the ${currentItem.word}?`;
    
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
    
    setTimeout(() => {
        speak(`Where is the ${currentItem.word}?`, () => {
            setTimeout(() => {
                pronounceItems(roundItems);
            }, 2000);
        });
    }, 500);
}

// ============================================
// PRONUNCIAR ITENS COM ZOOM
// ============================================
function pronounceItems(items) {
    items.forEach((item, index) => {
        setTimeout(() => {
            const card = currentCards[index];
            if (card) {
                card.classList.add('speaking');
                
                speak(item.word, () => {
                    setTimeout(() => {
                        speak(item.word, () => {
                            setTimeout(() => {
                                card.classList.remove('speaking');
                            }, 600);
                        });
                    }, 500);
                });
            }
        }, index * 3000);
    });
}

// ============================================
// VERIFICAR RESPOSTA
// ============================================
function handleAnswer(selected, card, event) {
    if (!isAnswering) return;
    
    if (selected.word === currentItem.word) {
        isAnswering = false;
        card.classList.add('correct');
        bubuGame.classList.add('celebrate');
        
        bubuSpeech.textContent = `${selected.word}! Great job!`;
        
        speak(`${selected.word}! ${selected.word}! Great job!`, () => {
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
                speak(`Where is the ${currentItem.word}?`, () => {
                    setTimeout(() => {
                        pronounceItems([currentItem]);
                    }, 2000);
                });
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
    speak('Congratulations! Congratulations!');
}

// ============================================
// PRÓXIMA FASE
// ============================================
nextLevelBtn.addEventListener('click', () => {
    congratsScreen.classList.remove('active');
    bubuGame.classList.remove('celebrate');
    
    if (currentLevel < levels.length - 1) {
        loadLevel(currentLevel + 1);
    } else {
        congratsText.textContent = 'You completed all levels! ';
        congratsScreen.classList.add('active');
        speak('You completed all levels! Amazing! Amazing!');
        
        setTimeout(() => {
            location.reload();
        }, 3000);
    }
});

// ============================================
// CONTROLES
// ============================================
soundBtn.addEventListener('click', () => {
    if (currentItem) {
        speak(`Where is the ${currentItem.word}?`, () => {
            setTimeout(() => {
                pronounceItems(currentCards.map(card => ({
                    word: card.dataset.word
                })));
            }, 2000);
        });
    }
});

homeBtn.addEventListener('click', () => {
    if (confirm('Go back to start?')) {
        location.reload();
    }
});

// ============================================
// ÁUDIO (Text-to-Speech)
// ============================================
function speak(text, callback) {
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.3;
    
    if (callback) {
        utterance.onend = callback;
    }
    
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
