// ==========================================
// FRUIT SMASH - SCRIPT.JS
// ==========================================

// ==========================================
// KONFIGURASI GOOGLE SHEETS
// ==========================================

const SPREADSHEET_ID = "AKfycbw6eFta0ekjdH3Y9ljjb2UmVzvrD-AOmOGl7zgCm6DQzGmWuQ46wH40CewrMuRtpJXAOA";


// ==========================================
// AMBIL ELEMENT HTML
// ==========================================

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


// ==========================================
// DATA BUAH
// ==========================================

const fruits = [
    "🍎",
    "🍉",
    "🍊",
    "🍇",
    "🍓",
    "🍍",
    "🥝",
    "🍒",
    "🍑",
    "🍋"
];


// ==========================================
// VARIABEL GAME
// ==========================================

let playerName = "";
let playerPhone = "";

let score = 0;
let combo = 0;
let time = 60;

let gameRunning = false;

let spawnInterval = null;
let timerInterval = null;


// ==========================================
// GANTI HALAMAN
// ==========================================

function showScreen(screen) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(function(item) {
        item.classList.remove("active");
    });

    screen.classList.add("active");
}


// ==========================================
// MULAI GAME
// ==========================================

function startGame() {

    playerName = usernameInput.value.trim();
    playerPhone = phoneInput.value.trim();


    // VALIDASI USERNAME
    if (playerName.length < 3) {

        alert("Username minimal 3 karakter!");
        return;
    }


    // VALIDASI NOMOR WA
    if (playerPhone.length < 8) {

        alert("Masukkan nomor WhatsApp yang valid!");
        return;
    }


    // SIMPAN DATA PLAYER
    localStorage.setItem("fruitSmashUsername", playerName);
    localStorage.setItem("fruitSmashPhone", playerPhone);


    showScreen(gameScreen);

    resetGame();
}


// ==========================================
// RESET GAME
// ==========================================

function resetGame() {

    score = 0;
    combo = 0;
    time = 60;

    gameRunning = true;


    // HAPUS OBJECT LAMA
    const objects = gameArea.querySelectorAll(".game-object");

    objects.forEach(function(object) {
        object.remove();
    });


    // HAPUS PARTICLE
    const particles = gameArea.querySelectorAll(".particle");

    particles.forEach(function(particle) {
        particle.remove();
    });


    // HAPUS POPUP
    const popups = gameArea.querySelectorAll(".score-popup");

    popups.forEach(function(popup) {
        popup.remove();
    });


    updateUI();


    // HENTIKAN INTERVAL LAMA
    clearInterval(spawnInterval);
    clearInterval(timerInterval);


    // SPAWN BUAH
    spawnInterval = setInterval(function() {

        if (gameRunning) {

            spawnObject();
        }

    }, 700);


    // TIMER
    timerInterval = setInterval(function() {

        if (!gameRunning) return;


        time--;

        updateUI();


        if (time <= 0) {

            endGame();
        }

    }, 1000);


    // SPAWN PERTAMA
    setTimeout(function() {

        if (gameRunning) {

            spawnObject();
        }

    }, 300);
}


// ==========================================
// SPAWN OBJECT
// ==========================================

function spawnObject() {

    if (!gameRunning) return;


    const random = Math.random();


    // 18% KEMUNGKINAN BOM
    if (random < 0.18) {

        createObject("💣", "bomb");

    } else {

        const randomFruit =
            fruits[
                Math.floor(
                    Math.random() * fruits.length
                )
            ];

        createObject(randomFruit, "fruit");
    }
}


// ==========================================
// MEMBUAT OBJECT
// ==========================================

function createObject(icon, type) {

    const object = document.createElement("div");

    object.className = "game-object " + type;

    object.textContent = icon;


    // UKURAN GAME AREA
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;


    // POSISI RANDOM
    const x = Math.random() * (areaWidth - 80);

    const y = 70 + Math.random() * (areaHeight - 180);


    object.style.left = Math.max(5, x) + "px";
    object.style.top = Math.max(50, y) + "px";


    gameArea.appendChild(object);


    // EVENT KLIK / TOUCH
    object.addEventListener("pointerdown", function(event) {

        event.preventDefault();
        event.stopPropagation();

        if (!gameRunning) return;


        if (type === "bomb") {

            hitBomb(object);

        } else {

            hitFruit(object, icon);
        }

    });


    // OBJECT HILANG OTOMATIS
    setTimeout(function() {

        if (object.parentNode) {

            object.remove();


            // COMBO RESET JIKA BUAH TIDAK DIKLIK
            if (gameRunning && type === "fruit") {

                combo = 0;

                updateUI();
            }
        }

    }, 2200);
}


// ==========================================
// KLIK BUAH
// ==========================================

function hitFruit(object, icon) {

    if (!object.parentNode) return;


    combo++;


    let points = 10;


    // BONUS COMBO
    if (combo >= 10) {

        points = 25;

    } else if (combo >= 5) {

        points = 15;
    }


    score += points;


    // POSISI
    const x = object.offsetLeft;
    const y = object.offsetTop;


    // ANIMASI
    object.classList.add("smash");


    // PARTICLE
    createParticles(x, y, icon);


    // POPUP SKOR
    createPopup(x, y, "+" + points, false);


    // SOUND
    playFruitSound();


    // COMBO
    showCombo();


    // HAPUS BUAH
    setTimeout(function() {

        if (object.parentNode) {

            object.remove();
        }

    }, 250);


    updateUI();
}


// ==========================================
// KLIK BOM
// ==========================================

function hitBomb(object) {

    if (!object.parentNode) return;


    score -= 30;


    // SKOR TIDAK BOLEH MINUS
    if (score < 0) {

        score = 0;
    }


    combo = 0;


    const x = object.offsetLeft;
    const y = object.offsetTop;


    // UBAH JADI LEDAKAN
    object.textContent = "💥";

    object.classList.add("smash");


    createPopup(x, y, "-30", true);


    createExplosion(x, y);


    playBombSound();


    setTimeout(function() {

        if (object.parentNode) {

            object.remove();
        }

    }, 300);


    updateUI();
}


// ==========================================
// PARTICLE BUAH
// ==========================================

function createParticles(x, y, icon) {

    for (let i = 0; i < 10; i++) {

        const particle = document.createElement("div");

        particle.className = "particle";

        particle.textContent = icon;


        particle.style.left = x + 25 + "px";
        particle.style.top = y + 25 + "px";


        const moveX =
            (Math.random() - 0.5) * 200;

        const moveY =
            (Math.random() - 0.5) * 200;


        particle.style.setProperty(
            "--x",
            moveX + "px"
        );

        particle.style.setProperty(
            "--y",
            moveY + "px"
        );


        gameArea.appendChild(particle);


        setTimeout(function() {

            if (particle.parentNode) {

                particle.remove();
            }

        }, 700);
    }
}


// ==========================================
// EFEK LEDAKAN BOM
// ==========================================

function createExplosion(x, y) {

    for (let i = 0; i < 15; i++) {

        const particle = document.createElement("div");

        particle.className = "particle";

        particle.textContent =
            i % 2 === 0 ? "💥" : "🔥";


        particle.style.left = x + 20 + "px";
        particle.style.top = y + 20 + "px";


        const moveX =
            (Math.random() - 0.5) * 250;

        const moveY =
            (Math.random() - 0.5) * 250;


        particle.style.setProperty(
            "--x",
            moveX + "px"
        );

        particle.style.setProperty(
            "--y",
            moveY + "px"
        );


        gameArea.appendChild(particle);


        setTimeout(function() {

            if (particle.parentNode) {

                particle.remove();
            }

        }, 700);
    }
}


// ==========================================
// POPUP SKOR
// ==========================================

function createPopup(x, y, text, minus) {

    const popup = document.createElement("div");

    popup.className = "score-popup";


    if (minus) {

        popup.classList.add("minus");
    }


    popup.textContent = text;

    popup.style.left = x + "px";
    popup.style.top = y + "px";


    gameArea.appendChild(popup);


    setTimeout(function() {

        if (popup.parentNode) {

            popup.remove();
        }

    }, 800);
}


// ==========================================
// COMBO TEXT
// ==========================================

function showCombo() {

    if (!comboText) return;


    let message = "";


    if (combo === 5) {

        message = "🔥 NICE COMBO!";

    } else if (combo === 10) {

        message = "⚡ SUPER COMBO!";

    } else if (combo === 20) {

        message = "👑 LEGENDARY!";
    }


    if (message !== "") {

        comboText.textContent = message;

        comboText.classList.remove("combo-animation");

        void comboText.offsetWidth;

        comboText.classList.add("combo-animation");
    }
}


// ==========================================
// UPDATE UI
// ==========================================

function updateUI() {

    scoreElement.textContent = score;
    timeElement.textContent = time;
    comboElement.textContent = combo;
}


// ==========================================
// GAME SELESAI
// ==========================================

async function endGame() {

    if (!gameRunning) return;


    gameRunning = false;


    clearInterval(spawnInterval);
    clearInterval(timerInterval);


    // HAPUS BUAH TERSISA
    const objects = gameArea.querySelectorAll(".game-object");

    objects.forEach(function(object) {

        object.remove();
    });


    finalScoreElement.textContent = score;


    // PESAN BERDASARKAN SKOR
    if (score >= 500) {

        gameMessage.textContent =
            "👑 LUAR BIASA! Kamu adalah Fruit Master!";

    } else if (score >= 300) {

        gameMessage.textContent =
            "🔥 HEBAT! Kamu sangat jago!";

    } else if (score >= 100) {

        gameMessage.textContent =
            "⭐ BAGUS! Terus tingkatkan skormu!";

    } else {

        gameMessage.textContent =
            "💪 Jangan menyerah! Coba lagi!";
    }


    // TAMPILKAN GAME OVER
    showScreen(gameOverScreen);


    // SIMPAN SKOR KE GOOGLE SHEETS
    await saveScore();
}


// ==========================================
// SIMPAN SKOR KE GOOGLE SHEETS
// ==========================================

async function saveScore() {

    // CEK URL
    if (
        GOOGLE_SCRIPT_URL ===
        "PASTE_URL_GOOGLE_APPS_SCRIPT_DI_SINI"
    ) {

        console.warn(
            "Google Apps Script URL belum dimasukkan!"
        );

        return;
    }


    try {

        const url =
            GOOGLE_SCRIPT_URL +
            "?action=save" +
            "&username=" +
            encodeURIComponent(playerName) +
            "&phone=" +
            encodeURIComponent(playerPhone) +
            "&score=" +
            encodeURIComponent(score);


        const response = await fetch(
            url,
            {
                method: "GET",
                mode: "cors"
            }
        );


        console.log(
            "Skor berhasil dikirim!"
        );

    }

    catch (error) {

        console.error(
            "ERROR SIMPAN SKOR:",
            error
        );
    }
}


// ==========================================
// TAMPILKAN LEADERBOARD
// ==========================================

async function showLeaderboard() {

    showScreen(leaderboardScreen);


    leaderboardList.innerHTML =
        "<p>⏳ Memuat leaderboard...</p>";


    // CEK URL
    if (
        GOOGLE_SCRIPT_URL ===
        "PASTE_URL_GOOGLE_APPS_SCRIPT_DI_SINI"
    ) {

        leaderboardList.innerHTML =
            "<p>⚠️ URL Google Apps Script belum dimasukkan!</p>";

        return;
    }


    try {

        // CACHE BUSTER
        const url =
            GOOGLE_SCRIPT_URL +
            "?action=leaderboard" +
            "&timestamp=" +
            Date.now();


        const response = await fetch(
            url,
            {
                method: "GET",
                mode: "cors"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Server tidak merespon"
            );
        }


        const result =
            await response.json();


        console.log(
            "DATA LEADERBOARD:",
            result
        );


        if (!result.success) {

            throw new Error(
                "Data leaderboard gagal"
            );
        }


        renderLeaderboard(result.data);

    }

    catch (error) {

        console.error(
            "ERROR LEADERBOARD:",
            error
        );


        leaderboardList.innerHTML = `

            <p style="color:red;font-weight:bold">
                ❌ Gagal memuat leaderboard
            </p>

            <br>

            <small>
                Periksa Google Apps Script dan URL API
            </small>

        `;
    }
}


// ==========================================
// RENDER LEADERBOARD
// ==========================================

function renderLeaderboard(data) {

    leaderboardList.innerHTML = "";


    if (!data || data.length === 0) {

        leaderboardList.innerHTML = `
            <p>
                🥺 Belum ada pemain.
                <br>
                Jadilah pemain pertama!
            </p>
        `;

        return;
    }


    data.forEach(function(player, index) {

        const row =
            document.createElement("div");


        row.className = "leader-row";


        let rank = index + 1;


        // MEDALI
        if (index === 0) {

            rank = "🥇";

        } else if (index === 1) {

            rank = "🥈";

        } else if (index === 2) {

            rank = "🥉";
        }


        // USERNAME AMAN
        const username =
            escapeHTML(
                String(player.username || "Player")
            );


        const playerScore =
            Number(player.score || 0);


        row.innerHTML = `
            <span>${rank}</span>
            <span>${username}</span>
            <span>⭐ ${playerScore}</span>
        `;


        leaderboardList.appendChild(row);
    });
}


// ==========================================
// KEAMANAN HTML
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// MAIN LAGI
// ==========================================

function playAgain() {

    showScreen(gameScreen);

    resetGame();
}


// ==========================================
// KEMBALI KE HOME
// ==========================================

function goHome() {

    gameRunning = false;

    clearInterval(spawnInterval);
    clearInterval(timerInterval);


    showScreen(homeScreen);
}


// ==========================================
// AUDIO SYSTEM
// ==========================================

let audioContext = null;


function initAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }


    // RESUME JIKA BROWSER MEMBLOKIR AUDIO
    if (audioContext.state === "suspended") {

        audioContext.resume();
    }
}


// ==========================================
// SOUND BUAH
// ==========================================

function playFruitSound() {

    try {

        initAudio();


        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.type = "sine";


        oscillator.frequency.setValueAtTime(
            500,
            audioContext.currentTime
        );


        oscillator.frequency.exponentialRampToValueAtTime(
            900,
            audioContext.currentTime + 0.12
        );


        gain.gain.setValueAtTime(
            0.15,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.15
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.15
        );

    }

    catch (error) {

        console.log("Audio tidak tersedia");
    }
}


// ==========================================
// SOUND BOM
// ==========================================

function playBombSound() {

    try {

        initAudio();


        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.type = "sawtooth";


        oscillator.frequency.setValueAtTime(
            150,
            audioContext.currentTime
        );


        oscillator.frequency.exponentialRampToValueAtTime(
            40,
            audioContext.currentTime + 0.4
        );


        gain.gain.setValueAtTime(
            0.2,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.4
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.4
        );

    }

    catch (error) {

        console.log("Audio tidak tersedia");
    }
}


// ==========================================
// LOAD DATA PLAYER TERAKHIR
// ==========================================

window.addEventListener("load", function() {

    const savedUsername =
        localStorage.getItem(
            "fruitSmashUsername"
        );


    const savedPhone =
        localStorage.getItem(
            "fruitSmashPhone"
        );


    if (savedUsername) {

        usernameInput.value =
            savedUsername;
    }


    if (savedPhone) {

        phoneInput.value =
            savedPhone;
    }
});
