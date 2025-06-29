class ForestRunner {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameContainer = document.getElementById('gameContainer');

        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.newRecordElement = document.getElementById('newRecord');
        this.restartBtn = document.getElementById('restartBtn');
        this.startScreen = document.getElementById('startScreen');
        this.instructionsElement = document.getElementById('instructions');
        this.currentRecordElement = document.getElementById('currentRecord');

        this.gameRunning = false;
        this.gameStarted = false;
        this.gameReady = false;
        this.animationFrameId = null;
        this.showInstructions = true;
        this.instructionFadeOutScore = 8;

        this.setupCanvas();
        this.loadHighScore();
        this.initGame();
        this.setupEventListeners();

        this.imagesLoaded = {
            player: false,
            obstacle_default: false,
            obstacle_tent: false,
            flying: false
        };
        this.imageLoadCount = 0;
        this.totalImagesToLoad = 4;

        this.loadImages();

        this.render();
    }

    setupCanvas() {
        this.canvas.width = this.gameContainer.offsetWidth;
        this.canvas.height = this.gameContainer.offsetHeight;

        this.ctx.imageSmoothingEnabled = true;
        this.ctx.webkitImageSmoothingEnabled = true;
        this.ctx.mozImageSmoothingEnabled = true;
        this.ctx.msImageSmoothingEnabled = true;

        window.addEventListener('resize', () => {
            this.canvas.width = this.gameContainer.offsetWidth;
            this.canvas.height = this.gameContainer.offsetHeight;
            this.ctx.imageSmoothingEnabled = true;
            this.repositionElements();
        });
    }

    repositionElements() {
        if (this.player.element) {
            this.player.element.style.left = `${this.player.x}px`;
            this.player.element.style.top = `${this.player.y}px`;
        }

        this.flyingEnemies.forEach(enemy => {
            if (enemy.element) {
                enemy.element.style.left = `${enemy.x}px`;
                enemy.element.style.top = `${enemy.y}px`;
            }
        });
    }

    initGame() {
        this.gameRunning = false;
        this.gameStarted = false;
        this.score = 0;
        this.gameSpeed = 4;
        this.gravity = 0.6;
        this.jumpPower = -14;

        this.player = {
            x: 80,
            y: 0,
            width: 48,
            height: 48,
            velocityY: 0,
            jumping: false,
            grounded: true,
            color: '#ff6b6b',
            element: null
        };

        this.groundY = this.canvas.height - 107;

        this.player.y = this.groundY - this.player.height;

        this.obstacles = [];
        this.flyingEnemies = [];
        this.particles = [];

        this.lastObstacleTime = 0;
        this.lastFlyingEnemyTime = 0;
        this.animationFrame = 0;

        this.obstacleImages = {
            'obstacle_default': null,
            'obstacle_tent': null
        };

        this.updateScore();

        this.cleanupElements();

        this.startScreen.style.display = 'flex';
        this.gameOverElement.style.display = 'none';
        this.newRecordElement.style.display = 'none';
        this.instructionsElement.style.opacity = '1';
        this.showInstructions = true;
    }

    cleanupElements() {
        [...this.flyingEnemies].forEach(enemy => {
            if (enemy.element && enemy.element.parentNode === this.gameContainer) {
                this.gameContainer.removeChild(enemy.element);
            }
        });
        this.flyingEnemies = [];
    }


    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('forestRunnerHighScore') || '0');
        this.highScoreElement.textContent = `Best: ${this.highScore}`;
    }

    loadImages() {
        const imageConfigs = [
            { key: 'player', src: 'images/player.gif', animated: true },
            { key: 'obstacle_default', src: 'images/obstacle.png', animated: false, type: 'obstacle' },
            { key: 'obstacle_tent', src: 'images/tenda.png', animated: false, type: 'obstacle' },
            { key: 'flying', src: 'images/flying.gif', animated: true }
        ];

        imageConfigs.forEach(config => {
            const img = new Image();
            img.onload = () => {
                if (!config.animated) {
                    if (config.type === 'obstacle') {
                        this.obstacleImages[config.key] = img;
                    } else {
                        this.images[config.key] = img;
                    }
                }
                this.imagesLoaded[config.key] = true;
                this.imageLoadCount++;

                if (config.animated && config.key === 'player') {
                    const playerImgElement = document.createElement('img');
                    playerImgElement.src = config.src;
                    playerImgElement.style.position = 'absolute';
                    playerImgElement.style.left = `${this.player.x}px`;
                    playerImgElement.style.top = `${this.player.y}px`;
                    playerImgElement.style.width = `${this.player.width}px`;
                    playerImgElement.style.height = `${this.player.height}px`;
                    playerImgElement.style.imageRendering = 'pixelated';
                    playerImgElement.style.zIndex = '20';
                    playerImgElement.style.display = 'none';
                    this.gameContainer.appendChild(playerImgElement);
                    this.player.element = playerImgElement;
                }
                this.checkAllImagesLoaded();
            };

            img.onerror = () => {
                console.warn(`Errore nel caricamento dell'immagine: ${config.src}`);
                this.imagesLoaded[config.key] = false;
                this.imageLoadCount++;
                this.checkAllImagesLoaded();
            };
            img.src = config.src;
        });
    }

    checkAllImagesLoaded() {
        if (this.imageLoadCount >= this.totalImagesToLoad) {
            this.gameReady = true;
            console.log('Caricamento immagini completato. Gioco pronto!');
            if (!this.imagesLoaded.player) {
                console.log('Player GIF non caricata, verrà usata la grafica pixel art.');
            }
            if (!this.imagesLoaded.flying) {
                console.log('Flying GIF non caricata, verranno usati i nemici volanti pixel art.');
            }
            if (!this.imagesLoaded.obstacle_default) {
                console.log('Obstacle (default) PNG non caricata, verrà usata la grafica pixel art.');
            }
            if (!this.imagesLoaded.obstacle_tent) {
                console.log('Tenda PNG non caricata, verrà usata la grafica pixel art.');
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameRunning && (e.code === 'Space' || e.code === 'ArrowUp')) {
                e.preventDefault();
                this.handleInput();
            } else if (!this.gameStarted && this.gameReady && (e.code === 'Space' || e.code === 'ArrowUp')) {
                e.preventDefault();
                this.handleInput();
            }
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if (this.gameRunning) {
                e.preventDefault();
                this.handleInput();
            } else if (!this.gameStarted && this.gameReady) {
                e.preventDefault();
                this.handleInput();
            }
        });
        this.canvas.addEventListener('click', (e) => {
            if (this.gameRunning) {
                e.preventDefault();
                this.handleInput();
            } else if (!this.gameStarted && this.gameReady) {
                e.preventDefault();
                this.handleInput();
            }
        });
        this.startScreen.addEventListener('click', () => {
            if (!this.gameStarted && this.gameReady) {
                this.handleInput();
            }
        });

        this.restartBtn.addEventListener('click', () => {
            console.log('Restart button clicked!');
            this.restart();
        });
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }


    handleInput() {
        if (!this.gameStarted && this.gameReady) {
            console.log('Avvio del gioco!');
            this.startGame();
        } else if (this.gameRunning) {
            this.jump();
        }
    }

    startGame() {
        console.log('Gioco iniziato!');
        this.gameStarted = true;
        this.gameRunning = true;
        this.startScreen.style.display = 'none';

        if (this.player.element) {
            this.player.element.style.display = 'block';
        }

        const animatedBackgroundElements = document.querySelectorAll('.mountains, .ground');
        animatedBackgroundElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            const animationName = computedStyle.animationName;
            const animationDuration = computedStyle.animationDuration;
            const animationTimingFunction = computedStyle.animationTimingFunction;
            const animationIterationCount = computedStyle.animationIterationCount;

            el.style.animation = 'none';
            void el.offsetWidth;
            el.style.animation = `${animationName} ${animationDuration} ${animationTimingFunction} ${animationIterationCount}`;
            el.style.animationPlayState = 'running';
        });

        if (!this.animationFrameId) {
            this.render();
        }
    }

    jump() {
        if (this.player.grounded && this.gameRunning) {
            this.player.velocityY = this.jumpPower;
            this.player.jumping = true;
            this.player.grounded = false;
            this.createJumpParticles();
        }
    }

    createJumpParticles() {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 20,
                y: this.player.y + this.player.height,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: Math.random() * -3 - 1,
                size: Math.random() * 4 + 2,
                life: 1.0,
                color: '#32cd32'
            });
        }
    }

    update() {
        this.updateParticles();
        if (!this.gameRunning) {
            return;
        }

        this.animationFrame++;
        this.score += 0.08;
        this.gameSpeed += 0.002;
        this.updateScore();

        if (this.showInstructions && this.score >= this.instructionFadeOutScore) {
            this.fadeOutInstructions();
        }

        this.updatePlayer();
        this.spawnObstacles();
        this.updateObstacles();
        this.checkCollisions();
    }


    updateScore() {
        this.scoreElement.textContent = `Score: ${Math.floor(this.score)}`;
    }

    fadeOutInstructions() {
        this.showInstructions = false;

        this.instructionsElement.style.transition = 'opacity 1s ease-out';
        this.instructionsElement.style.opacity = '0';
    }


    updatePlayer() {
        if (!this.player.grounded) {
            this.player.velocityY += this.gravity;
        }

        this.player.y += this.player.velocityY;

        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.jumping = false;
            this.player.grounded = true;
        }

        if (this.player.element) {
            this.player.element.style.left = `${this.player.x}px`;
            this.player.element.style.top = `${this.player.y}px`;
        }
    }

    spawnObstacles() {
        if (!this.gameRunning) return;

        const currentTime = Date.now();

        if (currentTime - this.lastObstacleTime > this.getObstacleSpawnRate()) {
            const availableObstacleTypes = [];
            if (this.imagesLoaded.obstacle_default) availableObstacleTypes.push('obstacle_default');
            if (this.imagesLoaded.obstacle_tent) availableObstacleTypes.push('obstacle_tent');

            let selectedObstacleKey;
            if (availableObstacleTypes.length > 0) {
                selectedObstacleKey = availableObstacleTypes[Math.floor(Math.random() * availableObstacleTypes.length)];
            } else {
                selectedObstacleKey = 'fallback_pixel_obstacle';
            }

            let obstacleWidth = 40;
            let obstacleHeight = 50;

            if (selectedObstacleKey === 'obstacle_tent') {
                obstacleWidth = 60;
                obstacleHeight = 40;
            } else {
                obstacleWidth = 40;
                obstacleHeight = 50;
            }

            this.obstacles.push({
                x: this.canvas.width + 20,
                y: this.groundY - obstacleHeight,
                width: obstacleWidth,
                height: obstacleHeight,
                type: 'ground',
                imageKey: selectedObstacleKey,
                color: '#8b4513'
            });
            this.lastObstacleTime = currentTime;
        }

        if (currentTime - this.lastFlyingEnemyTime > this.getFlyingEnemySpawnRate()) {
            const heightFromGround = 60 + Math.random() * 80;
            const enemyY = this.groundY - heightFromGround;

            if (this.imagesLoaded.flying) {
                const flyingEnemyImgElement = document.createElement('img');
                flyingEnemyImgElement.src = 'images/flying.gif';
                flyingEnemyImgElement.style.position = 'absolute';
                flyingEnemyImgElement.style.width = '45px';
                flyingEnemyImgElement.style.height = '30px';
                flyingEnemyImgElement.style.imageRendering = 'pixelated';
                flyingEnemyImgElement.style.zIndex = '20';
                flyingEnemyImgElement.style.display = 'block';
                this.gameContainer.appendChild(flyingEnemyImgElement);

                this.flyingEnemies.push({
                    x: this.canvas.width + 20,
                    y: enemyY,
                    width: 45,
                    height: 30,
                    type: 'flying',
                    color: '#4169e1',
                    wingOffset: Math.random() * Math.PI * 2,
                    element: flyingEnemyImgElement
                });
            } else {
                this.flyingEnemies.push({
                    x: this.canvas.width + 20,
                    y: enemyY,
                    width: 45,
                    height: 30,
                    type: 'flying',
                    color: '#4169e1',
                    wingOffset: Math.random() * Math.PI * 2,
                    element: null
                });
            }
            this.lastFlyingEnemyTime = currentTime;
        }
    }


    getObstacleSpawnRate() {
        return Math.max(1200, 2500 - this.score * 10);
    }

    getFlyingEnemySpawnRate() {
        return Math.max(2000, 4000 - this.score * 8);
    }


    updateObstacles() {
        if (!this.gameRunning) return;

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.gameSpeed;
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }

        for (let i = this.flyingEnemies.length - 1; i >= 0; i--) {
            const enemy = this.flyingEnemies[i];
            enemy.x -= this.gameSpeed;
            if (!enemy.element) {
                enemy.wingOffset += 0.3;
            }

            if (enemy.element) {
                enemy.element.style.left = `${enemy.x}px`;
                enemy.element.style.top = `${enemy.y}px`;
                if (this.gameRunning) {
                    enemy.element.style.display = 'block';
                } else {
                    enemy.element.style.display = 'none';
                }
            }

            if (enemy.x + enemy.width < 0) {
                if (enemy.element && enemy.element.parentNode === this.gameContainer) {
                    this.gameContainer.removeChild(enemy.element);
                }
                this.flyingEnemies.splice(i, 1);
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.2;
            particle.life -= 0.02;
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }


    checkCollisions() {
        if (!this.gameRunning) return;
        for (let obstacle of this.obstacles) {
            if (this.isColliding(this.player, obstacle)) {
                 console.log('Collisione rilevata con ostacolo!');
                this.gameOver();
                return;
            }
        }

        for (let enemy of this.flyingEnemies) {
            if (this.isColliding(this.player, enemy)) {
                 console.log('Collisione rilevata con nemico volante!');
                this.gameOver();
                return;
            }
        }
    }

    isColliding(rect1, rect2) {
        const margin = 4;
        return rect1.x + margin < rect2.x + rect2.width - margin &&
            rect1.x + rect1.width - margin > rect2.x + margin &&
            rect1.y + margin < rect2.y + rect2.height - margin &&
            rect1.y + rect1.height - margin > rect2.y + margin;
    }


    gameOver() {
        if (!this.gameRunning) return;

        this.gameRunning = false;
        console.log('GAME OVER: Funzione chiamata!');

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            console.log('AnimationFrame loop stopped.');
        }

        const animatedElements = document.querySelectorAll('.mountains, .cloud-layer, .ground');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
        console.log('CSS animations paused.');

        this.saveHighScore();
        this.finalScoreElement.textContent = Math.floor(this.score);
        this.gameOverElement.style.display = 'flex';
        this.gameOverElement.style.visibility = 'visible';
        this.gameOverElement.style.opacity = '1';
        this.gameOverElement.style.zIndex = '1000';
    
        console.log('Game Over screen should now be visible');

        this.createExplosionParticles();

        if (this.player.element) {
            this.player.element.style.display = 'none';
        }

        this.flyingEnemies.forEach(enemy => {
            if (enemy.element) {
                enemy.element.style.display = 'none';
            }
        });
    }

    createExplosionParticles() {

        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                velocityX: (Math.random() - 0.5) * 12,
                velocityY: (Math.random() - 0.5) * 12,
                size: Math.random() * 6 + 3,
                life: 1.5,
                color: ['#ff6b6b', '#ffd700', '#ff8c00', '#32cd32'][Math.floor(Math.random() * 4)]
            });
        }
    }

    restart() {
        console.log('Restarting game...');

        this.gameOverElement.style.display = 'none';
        this.newRecordElement.style.display = 'none';
        this.startScreen.style.display = 'flex';

        const animatedBackgroundElements = document.querySelectorAll('.mountains, .ground');
        animatedBackgroundElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            const animationName = computedStyle.animationName;
            const animationDuration = computedStyle.animationDuration;
            const animationTimingFunction = computedStyle.animationTimingFunction;
            const animationIterationCount = computedStyle.animationIterationCount;

            el.style.animation = 'none';
            void el.offsetWidth;
            el.style.animation = `${animationName} ${animationDuration} ${animationTimingFunction} ${animationIterationCount}`;
            el.style.animationPlayState = 'running';
        });

        this.instructionsElement.style.opacity = '1';
        this.instructionsElement.style.transition = '';
        this.showInstructions = true;

        this.gameRunning = false;
        this.gameStarted = false;
        this.score = 0;
        this.gameSpeed = 4;

        this.player.x = 80;
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
        this.player.jumping = false;
        this.player.grounded = true;

        this.obstacles = [];
        [...this.flyingEnemies].forEach(enemy => {
            if (enemy.element && enemy.element.parentNode === this.gameContainer) {
                this.gameContainer.removeChild(enemy.element);
            }
        });
        this.flyingEnemies = [];
        this.particles = [];

        this.lastObstacleTime = 0;
        this.lastFlyingEnemyTime = 0;
        this.animationFrame = 0;

        this.updateScore();

        if (!this.animationFrameId) {
            this.render();
        }
        console.log('Stato del gioco resettato. In attesa di input per avviare.');
    }

    saveHighScore() {
        const currentScore = Math.floor(this.score);
        this.currentRecordElement.textContent = this.highScore;
        
        if (currentScore > this.highScore) {
            this.highScore = currentScore;
            localStorage.setItem('forestRunnerHighScore', this.highScore.toString());
            this.highScoreElement.textContent = `Best: ${this.highScore}`;
            this.currentRecordElement.textContent = this.highScore;

            this.newRecordElement.style.display = 'block';
            console.log('Nuovo record salvato:', this.highScore);
        } else {

            this.newRecordElement.style.display = 'none';
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderObstacles();
        this.renderParticles();
        this.renderFallbacks();
        this.update();

        if (this.gameRunning || this.particles.length > 0) {
            this.animationFrameId = requestAnimationFrame(() => this.render());
        } else {
            this.animationFrameId = null;
            console.log('Render loop fully stopped (no game running and no particles).');
        }
    }


    renderFallbacks() {
        if (this.gameRunning && !this.imagesLoaded.player && !this.player.element) {
            this.renderPixelPlayer();
        }
        
        if (!this.imagesLoaded.obstacle) {
        }

        if (this.gameRunning && !this.imagesLoaded.flying) {
            this.flyingEnemies.forEach(enemy => {
                if (!enemy.element) {
                    this.renderPixelBird(enemy);
                }
            });
        }
    }


    renderPlayer() {
        if (this.gameRunning && !this.imagesLoaded.player && !this.player.element) {
            this.renderPixelPlayer();
        }
    }

    renderPixelPlayer() {
        this.ctx.save();
        const x = this.player.x;
        const y = this.player.y;
        const size = 6;

        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(x + size * 2, y + size * 2, size * 4, size * 5);

        this.ctx.fillStyle = '#ffb3b3';
        this.ctx.fillRect(x + size * 2, y, size * 4, size * 3);

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + size * 3, y + size, size, size);
        this.ctx.fillRect(x + size * 5, y + size, size, size);

        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(x + size, y + size * 3, size, size * 2);
        this.ctx.fillRect(x + size * 6, y + size * 3, size, size * 2);

        this.ctx.fillRect(x + size * 2, y + size * 7, size, size * 2);
        this.ctx.fillRect(x + size * 4, y + size * 7, size, size * 2);

        if (this.player.jumping) {
            this.ctx.fillStyle = '#32cd32';
            this.ctx.fillRect(x + size * 3, y + size * 8, size * 2, size);
        }
        this.ctx.restore();
    }


    renderObstacles() {
        for (let obstacle of this.obstacles) {
            this.ctx.save();
            const obstacleImage = this.obstacleImages[obstacle.imageKey];
            const imageLoadedSuccessfully = obstacleImage && this.imagesLoaded[obstacle.imageKey];

            if (imageLoadedSuccessfully) {
                this.ctx.drawImage(
                    obstacleImage,
                    obstacle.x,
                    obstacle.y,
                    obstacle.width,
                    obstacle.height
                );
            } else {
                this.renderPixelObstacle(obstacle);
            }
            this.ctx.restore();
        }
    }

    renderPixelObstacle(obstacle) {
        this.ctx.save();
        const x = obstacle.x;
        const y = obstacle.y;
        const w = obstacle.width;
        const h = obstacle.height;

        if (obstacle.imageKey === 'obstacle_tent' || obstacle.imageKey === 'fallback_pixel_obstacle_tent') {
            this.ctx.fillStyle = '#A0522D';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + h);
            this.ctx.lineTo(x + w / 2, y);
            this.ctx.lineTo(x + w, y + h);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(x + w / 2 - 1, y, 2, h);

        } else {
            this.ctx.fillStyle = '#8b4513';
            this.ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.7);
            this.ctx.fillStyle = '#228b22';
            this.ctx.fillRect(x, y, w, h * 0.5);
            this.ctx.fillStyle = '#654321';
            for (let i = 0; i < 3; i++) {
                this.ctx.fillRect(x + w * 0.35, y + h * 0.4 + i * (h * 0.7 / 4), w * 0.3, 2);
            }
            this.ctx.fillStyle = '#32cd32';
            this.ctx.fillRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.3);
        }
        this.ctx.restore();
    }


    renderFlyingEnemies() {
        if (!this.gameRunning) return;

        for (let enemy of this.flyingEnemies) {
            if (!enemy.element) {
                this.renderPixelBird(enemy);
            }
        }
    }

    renderPixelBird(enemy) {
        this.ctx.save();
        const x = enemy.x;
        const y = enemy.y;
        const size = 4;
        const wingFlap = Math.sin(enemy.wingOffset) * (size * 2);

        this.ctx.fillStyle = enemy.color;
        this.ctx.fillRect(x + size * 3, y + size * 2, size * 3, size * 2);
        this.ctx.fillStyle = '#1e90ff';
        this.ctx.fillRect(x + size * 5, y + size, size * 2, size * 2);
        this.ctx.fillStyle = '#ffa500';
        this.ctx.fillRect(x + size * 7, y + size * 2, size * 1.5, size);
        this.ctx.fillStyle = '#0000cd';
        this.ctx.fillRect(x + size * 2, y + size * 1.5 + wingFlap, size * 2, size);
        this.ctx.fillRect(x + size * 5, y + size * 1.5 - wingFlap, size * 2, size);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + size * 6, y + size * 1.5, size, size);
        this.ctx.fillStyle = '#191970';
        this.ctx.fillRect(x + size * 1.5, y + size * 3, size * 1.5, size);

        this.ctx.restore();
    }


    renderParticles() {
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
            this.ctx.restore();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ForestRunner();
});
