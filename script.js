// ===================================
// FRUIT SMASH
// ===================================


// URL GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwAkJKKfYmcufMuWYR29r776O-dQM5Np_Ku14UK0dfW3cTvhBOVB5gMhCRSiaa8SnTj/exec";


// ELEMENT
const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const leaderboardScreen = document.getElementById("leaderboardScreen");

const usernameInput = document.getElementById("username");
const phoneInput = document.getElementById("phone");

const gameArea = document.getElementById("gameArea");

const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const comboElement = document.getElementById("combo");

const finalScoreElement = document.getElementById("finalScore");
const gameMessage = document.getElementById("gameMessage");

const leaderboardList = document.getElementById("leaderboardList");

const comboText = document.getElementById("comboText");


// GAME DATA

const fruits = [
    "🍎",
    "🍉",
    "🍊",
    "🍇",
    "🍓",
    "🍍",
    "🥝",
    "🍒"
];


let playerName = "";
let playerPhone = "";

let score = 0;
let combo = 0;
let time = 60;

let gameRunning = false;

let spawnInterval;
let timerInterval;


// ===================================
// SCREEN
// ===================================

function showScreen(screen) {

    document.querySelectorAll(".screen")
        .forEach(function(item) {

            item.classList.remove("active");

        });

    screen.classList.add("active");

}


// ===================================
// START GAME
// ===================================

function startGame() {

    playerName =
        usernameInput.value.trim();

    playerPhone =
        phoneInput.value.trim();


    if (playerName.length < 3) {

        alert("Username minimal 3 karakter!");
        return;

    }


    if (playerPhone.length < 8) {

        alert("Nomor WhatsApp tidak valid!");
        return;

    }


    showScreen(gameScreen);

    resetGame();

}


// ===================================
// RESET GAME
// ===================================

function resetGame() {

    score = 0;
    combo = 0;
    time = 60;

    gameRunning = true;

    gameArea
        .querySelectorAll(".game-object")
        .forEach(function(item) {

            item.remove();

        });


    updateUI();


    clearInterval(spawnInterval);
    clearInterval(timerInterval);


    // Spawn object
    spawnInterval =
        setInterval(function() {

            if (gameRunning) {

                spawnObject();

            }

        }, 750);


    // Timer
    timerInterval =
        setInterval(function() {

            if (!gameRunning) return;

            time--;

            updateUI();


            if (time <= 0) {

                endGame();

            }

        }, 1000);

}


// ===================================
// SPAWN
// ===================================

function spawnObject() {

    const random =
        Math.random();


    if (random < 0.18) {

        createObject(
            "💣",
            "bomb"
        );

    }

    else {

        const fruit =
            fruits[
                Math.floor(
                    Math.random()
                    * fruits.length
                )
            ];


        createObject(
            fruit,
            "fruit"
        );

    }

}


// ===================================
// CREATE OBJECT
// ===================================

function createObject(icon, type) {

    const object =
        document.createElement("div");


    object.className =
        "game-object " + type;


    object.textContent =
        icon;


    const width =
        gameArea.clientWidth;

    const height =
        gameArea.clientHeight;


    const x =
        Math.random() *
        (width - 80);


    const y =
        80 +
        Math.random() *
        (height - 180);


    object.style.left =
        x + "px";

    object.style.top =
        y + "px";


    gameArea.appendChild(object);


    object.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();

            if (!gameRunning) return;


            if (type === "bomb") {

                hitBomb(object);

            }

            else {

                hitFruit(
                    object,
                    icon
                );

            }

        }
    );


    setTimeout(function() {

        if (object.parentNode) {

            object.remove();

            combo = 0;

            updateUI();

        }

    }, 2500);

}


// ===================================
// HIT FRUIT
// ===================================

function hitFruit(object, icon) {

    if (!object.parentNode) return;


    combo++;


    let points = 10;


    if (combo >= 5) {

        points = 15;

    }


    if (combo >= 10) {

        points = 20;

    }


    score += points;


    object.classList.add("smash");


    createParticles(
        object.offsetLeft,
        object.offsetTop,
        icon
    );


    createPopup(
        object.offsetLeft,
        object.offsetTop,
        "+" + points,
        false
    );


    playFruitSound();


    showCombo();


    setTimeout(function() {

        object.remove();

    }, 300);


    updateUI();

}


// ===================================
// BOMB
// ===================================

function hitBomb(object) {

    if (!object.parentNode) return;


    score -= 30;


    if (score < 0) {

        score = 0;

    }


    combo = 0;


    createPopup(
        object.offsetLeft,
        object.offsetTop,
        "-30",
        true
    );


    playBombSound();


    object.textContent = "💥";


    object.classList.add("smash");


    setTimeout(function() {

        object.remove();

    }, 300);


    updateUI();

}


// ===================================
// PARTICLES
// ===================================

function createParticles(
    x,
    y,
    icon
) {

    for (let i = 0; i < 8; i++) {

        const particle =
            document.createElement("div");


        particle.className =
            "particle";


        particle.textContent =
            icon;


        particle.style.left =
            x + "px";


        particle.style.top =
            y + "px";


        particle.style.setProperty(
            "--x",
            ((Math.random() - .5) * 160)
            + "px"
        );


        particle.style.setProperty(
            "--y",
            ((Math.random() - .5) * 160)
            + "px"
        );


        gameArea.appendChild(particle);


        setTimeout(function() {

            particle.remove();

        }, 700);

    }

}


// ===================================
// POPUP
// ===================================

function createPopup(
    x,
    y,
    text,
    minus
) {

    const popup =
        document.createElement("div");


    popup.className =
        "score-popup";


    if (minus) {

        popup.classList.add("minus");

    }


    popup.textContent =
        text;


    popup.style.left =
        x + "px";

    popup.style.top =
        y + "px";


    gameArea.appendChild(popup);


    setTimeout(function() {

        popup.remove();

    }, 800);

}


// ===================================
// COMBO
// ===================================

function showCombo() {

    if (combo === 5) {

        comboText.textContent =
            "🔥 NICE COMBO!";

    }

    else if (combo === 10) {

        comboText.textContent =
            "🔥 SUPER COMBO!";

    }

    else {

        return;

    }


    comboText.classList.remove(
        "combo-animation"
    );


    void comboText.offsetWidth;


    comboText.classList.add(
        "combo-animation"
    );

}


// ===================================
// UPDATE UI
// ===================================

function updateUI() {

    scoreElement.textContent =
        score;

    timeElement.textContent =
        time;

    comboElement.textContent =
        combo;

}


// ===================================
// END GAME
// ===================================

function endGame() {

    gameRunning = false;


    clearInterval(spawnInterval);
    clearInterval(timerInterval);


    finalScoreElement.textContent =
        score;


    if (score >= 500) {

        gameMessage.textContent =
            "🔥 LUAR BIASA! Kamu sangat hebat!";

    }

    else if (score >= 200) {

        gameMessage.textContent =
            "⭐ BAGUS! Terus tingkatkan skormu!";

    }

    else {

        gameMessage.textContent =
            "💪 Jangan menyerah, coba lagi!";

    }


    saveScore();


    showScreen(gameOverScreen);

}


// ===================================
// SAVE SCORE GOOGLE SHEET
// ===================================

async function saveScore() {

    if (
        GOOGLE_SCRIPT_URL ===
        "PASTE_URL_GOOGLE_APPS_SCRIPT_DI_SINI"
    ) {

        console.log(
            "Google Sheets belum dikonfigurasi"
        );

        return;

    }


    try {

        await fetch(
            GOOGLE_SCRIPT_URL,
            {

                method: "POST",

                body: JSON.stringify({

                    action: "save",

                    username: playerName,

                    phone: playerPhone,

                    score: score

                })

            }
        );


        console.log(
            "Skor berhasil disimpan"
        );

    }

    catch(error) {

        console.error(
            "Gagal menyimpan:",
            error
        );

    }

}


// ===================================
// LEADERBOARD
// ===================================

async function showLeaderboard() {

    showScreen(
        leaderboardScreen
    );


    leaderboardList.innerHTML =
        "<p>⏳ Memuat data...</p>";


    if (
        GOOGLE_SCRIPT_URL ===
        "PASTE_URL_GOOGLE_APPS_SCRIPT_DI_SINI"
    ) {

        leaderboardList.innerHTML =
            "<p>⚠️ Google Sheets belum dikonfigurasi.</p>";

        return;

    }


    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL +
                "?action=leaderboard"
            );


        const result =
            await response.json();


        renderLeaderboard(
            result.data
        );

    }

    catch(error) {

        console.error(error);


        leaderboardList.innerHTML =
            "<p>❌ Gagal memuat leaderboard.</p>";

    }

}


// ===================================
// RENDER LEADERBOARD
// ===================================

function renderLeaderboard(data) {

    leaderboardList.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        leaderboardList.innerHTML =
            "<p>Belum ada pemain.</p>";

        return;

    }


    data.forEach(function(
        player,
        index
    ) {

        let medal = "🏅";


        if (index === 0) {

            medal = "🥇";

        }

        else if (index === 1) {

            medal = "🥈";

        }

        else if (index === 2) {

            medal = "🥉";

        }


        const row =
            document.createElement("div");


        row.className =
            "leader-row";


        row.innerHTML = `

            <span>
                ${medal}
            </span>

            <span>
                ${escapeHTML(
                    player.username
                )}
            </span>

            <span>
                ⭐ ${player.score}
            </span>

        `;


        leaderboardList.appendChild(
            row
        );

    });

}


// ===================================
// SECURITY
// ===================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ===================================
// PLAY AGAIN
// ===================================

function playAgain() {

    showScreen(gameScreen);

    resetGame();

}


// ===================================
// HOME
// ===================================

function goHome() {

    gameRunning = false;

    clearInterval(spawnInterval);
    clearInterval(timerInterval);

    showScreen(homeScreen);

}


// ===================================
// SOUND EFFECT
// ===================================

let audioContext;


function initAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

}


// SOUND BUAH

function playFruitSound() {

    initAudio();


    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.frequency.value =
        700;


    gain.gain.value =
        0.1;


    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );


    oscillator.start();


    oscillator.stop(
        audioContext.currentTime + .1
    );

}


// SOUND BOM

function playBombSound() {

    initAudio();


    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type =
        "sawtooth";


    oscillator.frequency.value =
        100;


    gain.gain.value =
        0.15;


    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );


    oscillator.start();


    oscillator.stop(
        audioContext.currentTime + .4
    );

          }
