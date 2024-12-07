// Setup canvas and game variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scale = 20;  // Size of each block in the grid
const rows = 30;   // Number of rows (increased for larger game area)
const cols = 30;   // Number of columns (increased for larger game area)
canvas.width = scale * cols;
canvas.height = scale * rows;

// Game control variables
let isGameRunning = false;
let isGamePaused = false;

// Snake initial state
let snake = [
    { x: 15 * scale, y: 15 * scale }
];
let directionAngle = 0;  // Snake's movement direction in radians (0 to 2π)
let food = generateFood();
let score = 0;
let speed = 150;  // Initial game speed (in ms)
let minSpeed = 60; // Minimum speed limit (ms)
let speedIncrement = 10;  // Speed increase interval (ms)
let scoreToIncreaseSpeed = 100;  // Number of points before speed increases

let lastFrameTime = 0; // To track the time elapsed between frames for FPS control

// Listen to arrow keys
document.addEventListener("keydown", changeDirection);

// Mouse event listeners for mouse control
canvas.addEventListener("mousemove", onMouseMove);
let mousePosition = { x: 0, y: 0 }; // To store the mouse position

// Function to change direction using keyboard
function changeDirection(event) {
    if (event.keyCode === 37) {  // Left arrow
        directionAngle -= Math.PI / 2;  // Turn left by 90 degrees (π/2)
    } else if (event.keyCode === 38) {  // Up arrow
        directionAngle -= Math.PI;  // Turn up by 180 degrees (π)
    } else if (event.keyCode === 39) {  // Right arrow
        directionAngle += Math.PI / 2;  // Turn right by 90 degrees (π/2)
    } else if (event.keyCode === 40) {  // Down arrow
        directionAngle += Math.PI;  // Turn down by 180 degrees (π)
    }
}

// Function to update the mouse position
function onMouseMove(event) {
    // Get mouse position relative to the canvas
    mousePosition.x = event.offsetX;
    mousePosition.y = event.offsetY;
}

// Function to generate food at random position
function generateFood() {
    let foodX = Math.floor(Math.random() * cols) * scale;
    let foodY = Math.floor(Math.random() * rows) * scale;
    return { x: foodX, y: foodY };
}

// Start the game
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);

// Game update loop
function gameLoop(currentTime) {
    if (!isGameRunning || isGamePaused) return;  // Stop if game is paused or not running

    // Calculate the time difference between frames to control FPS
    let deltaTime = currentTime - lastFrameTime;
    if (deltaTime < speed) {
        requestAnimationFrame(gameLoop);
        return;
    }

    lastFrameTime = currentTime;

    // Clear canvas and update game state
    clearCanvas();
    moveSnake();
    drawFood();
    drawSnake();
    checkCollisions();
    updateScore();
    increaseSpeed();

    // Request next animation frame
    requestAnimationFrame(gameLoop);
}

// Clear canvas for next frame
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw the food (circle)
function drawFood() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(food.x + scale / 2, food.y + scale / 2, scale / 2, 0, Math.PI * 2);  // Draw food as a circle
    ctx.fill();
}

// Draw the snake
function drawSnake() {
    // Draw the body segments using the Kurdistan flag colors
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Snake head - Kurdistan flag colors (red, yellow, green)
            drawSnakeHead(segment);
        } else {
            // Snake body - use red color
            ctx.fillStyle = "red";
            ctx.fillRect(segment.x, segment.y, scale, scale);
        }
    });
}

// Function to draw the snake's head with a face
function drawSnakeHead(segment) {
    ctx.fillStyle = "red";  // Head is red
    ctx.fillRect(segment.x, segment.y, scale, scale);  // Draw the head

    // Eyes (white circles)
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(segment.x + scale / 4, segment.y + scale / 4, scale / 6, 0, Math.PI * 2);  // Left eye
    ctx.arc(segment.x + 3 * scale / 4, segment.y + scale / 4, scale / 6, 0, Math.PI * 2);  // Right eye
    ctx.fill();

    // Pupils (black circles)
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(segment.x + scale / 4, segment.y + scale / 4, scale / 12, 0, Math.PI * 2);  // Left pupil
    ctx.arc(segment.x + 3 * scale / 4, segment.y + scale / 4, scale / 12, 0, Math.PI * 2);  // Right pupil
    ctx.fill();

    // Smile (yellow arc)
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(segment.x + scale / 2, segment.y + scale / 2, scale / 4, 0, Math.PI);  // Smile (half circle)
    ctx.stroke();
}

// Move the snake based on current direction
function moveSnake() {
    let head = { ...snake[0] };

    // Always calculate the direction towards the mouse
    if (mousePosition.x !== 0 && mousePosition.y !== 0) {
        const dx = mousePosition.x - head.x;
        const dy = mousePosition.y - head.y;
        directionAngle = Math.atan2(dy, dx);  // Calculate angle to mouse position
    }

    // Move the snake based on the calculated direction angle
    head.x += Math.cos(directionAngle) * scale;
    head.y += Math.sin(directionAngle) * scale;

    snake.unshift(head);

    // Check if snake eats the food
    if (Math.abs(head.x - food.x) < scale && Math.abs(head.y - food.y) < scale) {
        food = generateFood();
        score += 10;
    } else {
        snake.pop();
    }
}

// Check for collisions with walls (self-collision removed)
function checkCollisions() {
    let head = snake[0];

    // Collision with walls
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        resetGame();
    }
}

// Update the score
function updateScore() {
    document.getElementById("score").textContent = "Score: " + score;
}

// Increase snake speed based on score, with a limit
function increaseSpeed() {
    if (score >= scoreToIncreaseSpeed) {
        // Increase speed only when the score is a multiple of scoreToIncreaseSpeed
        if (score % scoreToIncreaseSpeed === 0) {
            speed = Math.max(minSpeed, speed - speedIncrement);  // Gradually increase speed
        }
    }
}

// Reset game when collision occurs
function resetGame() {
    isGameRunning = false;
    isGamePaused = false;
    clearCanvas();
    snake = [{ x: 15 * scale, y: 15 * scale }];  // Reset snake
    directionAngle = 0;  // Reset direction
    food = generateFood();  // Generate new food
    score = 0;  // Reset score
    speed = 150;  // Reset speed
    document.getElementById("score").textContent = "Score: 0";
    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("pauseBtn").textContent = "Pause";
}

// Start the game
function startGame() {
    isGameRunning = true;
    document.getElementById("startBtn").disabled = true;
    document.getElementById("pauseBtn").disabled = false;
    requestAnimationFrame(gameLoop);  // Start the game loop using requestAnimationFrame
}

// Pause the game
function togglePause() {
    isGamePaused = !isGamePaused;
    if (isGamePaused) {
        document.getElementById("pauseBtn").textContent = "Resume";
    } else {
        document.getElementById("pauseBtn").textContent = "Pause";
        requestAnimationFrame(gameLoop);  // Resume the game loop
    }
}
