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
    openingMusic: new Audio('assets/audio/abertura.mp3'),
    backgroundMusic: new Audio('assets/audio/trilha.mp3'),
    
    isMuted: false,
    
    init() {
        this.openingMusic.volume = 0.7;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.loop = true;
        
        this.openingMusic.addEventListener('ended', () => {
            this.startBackground();
        });
        
        // Tentar autoplay após interação do usuário
        document.addEventListener('click', () => {
            if (this.openingMusic.paused && this.backgroundMusic.paused) {
                // Já está tocando ou já foi iniciado
            }
        }, { once: true });
    },
    
    playOpening() {
        if (!this.isMuted) {
            this.openingMusic.currentTime = 0;
            this.openingMusic.play().catch(err => {
                console.log('️ Aguardando interação do usuário:', err);
            });
        }
    },
    
    startBackground() {
        if (!this.isMuted) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(err => {
                console.log('⚠️ Background blocked:', err);
            });
        }
    },
    
    stopBackground() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    },
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.openingMusic.pause();
            this.backgroundMusic.pause();
        } else {
            if (!this.openingMusic.paused) this.openingMusic.play();
            else if (!this.backgroundMusic.paused) this.backgroundMusic.play();
        }
        return this.isMuted;
    }
};

audioPlayer.init();

// ============================================
// SEQUÊNCIA DA CAPA (AUTOPLAY)
// ============================================
window.addEventListener('load', () => {
    // Iniciar música automaticamente
    setTimeout(() => {
        audioPlayer.playOpening();
    }, 500);
    
    // Sequência da animação
    setTimeout(() => {
        setTimeout(() => {
            document.querySelector('.speech-bubble').classList.add('show');
            speak("Hi! I'm BUBU!", () => {
                setTimeout(() => {
                    document.getElementById('speechText').textContent = "Let's play!";
                    speak("Let's play!");
                }, 800);
            });
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
    audioPlayer.openingMusic.pause();
    audioPlayer.openingMusic.currentTime = 0;
    
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
    gameScreen.classList.add('active');
    skipBtn.style.display = 'none';
    audioPlayer.stopBackground();
    audioPlayer.startBackground();
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
            }, 500);
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
    
    // Falar a pergunta e depois pronunciar cada item com zoom
    setTimeout(() => {
        speak(`Where is the ${currentItem.word}?`, () => {
            // Pronunciar cada item com zoom sincronizado
            roundItems.forEach((item, index) => {
                setTimeout(() => {
                    const card = currentCards[index];
                    if (card) {
                        // Adicionar classe de zoom
                        card.classList.add('speaking');
                        
                        // Falar a palavra
                        speak(item.word, () => {
                            // Remover classe após animação
                            setTimeout(() => {
                                card.classList.remove('speaking');
                            }, 600);
                        });
                    }
                }, index * 1500); // 1.5s entre cada palavra
            });
        }, true); // Repetir pergunta
    }, 500);
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
        
        // Repetir a palavra correta várias vezes
        speak(`${selected.word}! ${selected.word}! Great job! ${selected.word}!`, () => {
            setTimeout(() => {
                createConfetti();
                
                setTimeout(() => {
                    showCongratulations();
                }, 1500);
            }, 1000);
        }, true); // Repetir
        
    } else {
        card.classList.add('wrong');
        bubuSpeech.textContent = 'Try again!';
        speak('Try again! You can do it!', () => {
            // Repetir a pergunta novamente
            setTimeout(() => {
                speak(`Where is the ${currentItem.word}?`, null, true);
            }, 500);
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
        // Repetir pergunta e itens
        speak(`Where is the ${currentItem.word}?`, () => {
            currentCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('speaking');
                    speak(card.dataset.word, () => {
                        setTimeout(() => {
                            card.classList.remove('speaking');
                        }, 600);
                    });
                }, index * 1500);
            });
        }, true);
    }
});

homeBtn.addEventListener('click', () => {
    if (confirm('Go back to start?')) {
        location.reload();
    }
});

// ============================================
// ÁUDIO (Text-to-Speech) - SEMPRE REPETE
// ============================================
function speak(text, callback, alwaysRepeat = false) {
    synth.cancel();
    
    const repeatText = alwaysRepeat ? `${text} ${text}` : text;
    
    const utterance = new SpeechSynthesisUtterance(repeatText);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Mais lento para crianças
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
