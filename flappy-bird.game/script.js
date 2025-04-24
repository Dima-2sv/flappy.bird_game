// Доска
let board;
let boardWidth = 450;
let boardHeight = 700;
let context;

// Птица
let birdWidth = 35;
let birdHeight = 30;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Трубы
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Физика
let velocityX = -1.5;
let velocityY = -1;
let gravity = 0.1;

let gameOver = false;
let score = 0;
let highScore = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Загрузка изображений
    birdImg = new Image();
    birdImg.src = "./Images/flappybird.png"; 

    topPipeImg = new Image();
    topPipeImg.src = "./Images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./Images/bottompipe.png"; 

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);

    // Создание кнопки перезапуска
    createRestartButton();

    // Добавить обработчики событий для фокуса и потери фокуса
    window.addEventListener("blur", pauseGame);
    window.addEventListener("focus", resumeGame);
};

// Функция для создания кнопки перезапуска
function createRestartButton() {
    const restartButton = document.createElement("button");
    restartButton.id = "restart-button";
    restartButton.innerText = "Перезапуск";

    class RestartButton {
        constructor() {
            this.button = document.createElement("button");
            this.button.innerText = "Перезапустить игру"; // Текст на кнопке

            // Стилизация кнопки
            this.button.style.display = "none"; // Скрыть кнопку по умолчанию
            this.button.style.padding = "10px 20px";
            this.button.style.fontSize = "20px";
            this.button.style.color = "white";
            this.button.style.backgroundColor = "#ff4757"; // Красный цвет
            this.button.style.border = "none";
            this.button.style.borderRadius = "5px";
            this.button.style.cursor = "pointer";

            // Позиционирование кнопки
            this.button.style.position = "absolute";
            this.button.style.top = "50%";
            this.button.style.left = "50%";
            this.button.style.transform = "translate(-50%, -50%)";

            // Эффект при наведении на кнопку
            this.button.onmouseover = () => {
                this.button.style.backgroundColor = "#ff6b81"; // Более светлый красный при наведении 
            };

            this.button.onmouseout = () => {
                this.button.style.backgroundColor = "#ff4757"; // Вернуть цвет при уходе курсора 
            };

            // Добавляем кнопку на страницу
            document.body.appendChild(this.button);

            // Привязываем обработчик события нажатия на кнопку
            this.button.addEventListener("click", () => {
                restartGame();
                this.hide(); // Скрыть кнопку после нажатия
            });
        }

        show() {
            this.button.style.display = "block"; // Показать кнопку
        }

        hide() {
            this.button.style.display = "none"; // Скрыть кнопку
        }
    }

    // Добавляем кнопку на страницу
    document.body.appendChild(restartButton);

    // Привязываем обработчик события нажатия на кнопку
    restartButton.addEventListener("click", restartGame);
}

// Обновление игры
function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Птица
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        document.getElementById("restart-button").style.display = "block"; // Показать кнопку при падении
        return;
    }

    // Трубы
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            document.getElementById("restart-button").style.display = "block"; // Показать кнопку при столкновении
        }
    }

    // Очистка труб
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Счёт
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("ИГРА ОКОНЧЕНА", 5, 90);

        if (score > highScore) {
            highScore = score;
        }
        context.fillText(`Рекорд: ${highScore}`, 5, 140);

        document.getElementById("restart-button").style.display = "block"; // Показать кнопку перезапуска 
    }
}

// Размещение труб
function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 5;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    pipeArray.push(topPipe);
    pipeArray.push(bottomPipe);
}

// Движение птицы
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -4;

        if (gameOver) {
            restartGame();
        }
    }
}

// Перезапуск игры
function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0;

    document.getElementById("restart-button").style.display = "none"; // Скрыть кнопку перезапуска
}

// Проверка на столкновение между птицей и трубами
function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Пауза игры
function pauseGame() { gameOver = true; }

// Возобновление игры
function resumeGame() { if (gameOver) { restartGame(); } }
