class ForestRunner {
    constructor() {
        // Canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameContainer = document.getElementById('gameContainer'); // Get container for positioning <img>

        // UI elements
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverElement = document.getElementById('gameOver'); // The Game Over screen element
        this.finalScoreElement = document.getElementById('finalScore');
        this.newRecordElement = document.getElementById('newRecord');
        this.restartBtn = document.getElementById('restartBtn');
        this.startScreen = document.getElementById('startScreen');
        this.instructionsElement = document.getElementById('instructions'); // The instructions box element
        this.currentRecordElement = document.getElementById('currentRecord');

        // Game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.gameReady = false; // Flag to check if initial setup and image loading are done
        this.animationFrameId = null; // To store the ID returned by requestAnimationFrame
        this.showInstructions = true; // Flag to control instruction visibility
        this.instructionFadeOutScore = 8; // Score threshold to start fading instructions (representing 8 meters)

        // Setup
        this.setupCanvas();
        this.loadHighScore();
        this.initGame(); // Initialize game state including player/enemy objects
        this.setupEventListeners();

        // --- MODIFICHE QUI ---
        // Images (will now use this.obstacleImages for ground obstacles)
        // Flags to track successful image loading
        this.imagesLoaded = {
            player: false,
            obstacle_default: false, // Per obstacle.png
            obstacle_tent: false,    // Per tenda.png
            flying: false
        };
        this.imageLoadCount = 0;
        this.totalImagesToLoad = 4; // player, obstacle_default, obstacle_tent, flying
        // --- FINE MODIFICHE ---

        this.loadImages(); // Load images (will now also create <img> elements for GIFs)

        // Start render loop initially
        this.render(); // Call render once to draw the start screen and instructions
    }

    // ... (resto dei metodi della classe)

    setupCanvas() {
        // Canvas dimensions based on container
        this.canvas.width = this.gameContainer.offsetWidth;
        this.canvas.height = this.gameContainer.offsetHeight;

        // Set pixel art rendering for canvas context - but allow smooth rendering for images
        // Note: This setting primarily affects how you draw *to* the canvas.
        // <img> elements handle their own rendering based on CSS image-rendering property.
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.webkitImageSmoothingEnabled = true;
        this.ctx.mozImageSmoothingEnabled = true;
        this.ctx.msImageSmoothingEnabled = true;

        // Responsive canvas
        window.addEventListener('resize', () => {
            this.canvas.width = this.gameContainer.offsetWidth;
            this.canvas.height = this.gameContainer.offsetHeight;
            // Reapply image smoothing setting on resize
            this.ctx.imageSmoothingEnabled = true;
            // Need to also reposition existing <img> elements relative to new container size
            this.repositionElements();
        });
    }

    repositionElements() {
        // Reposition player element if it exists
        if (this.player.element) {
            this.player.element.style.left = `${this.player.x}px`;
            this.player.element.style.top = `${this.player.y}px`;
        }

        // Reposition flying enemy elements
        this.flyingEnemies.forEach(enemy => {
            if (enemy.element) {
                enemy.element.style.left = `${enemy.x}px`;
                enemy.element.style.top = `${enemy.y}px`;
            }
        });
        // Obstacles are drawn on canvas, their position is handled by updateObstacles
    }

    initGame() {
        this.gameRunning = false; // Game is not running initially
        this.gameStarted = false; // Game hasn't started yet
        this.score = 0;
        this.gameSpeed = 4;
        this.gravity = 0.6;
        this.jumpPower = -14;

        // Player properties
        this.player = {
            x: 80,
            y: 0, // Initial Y will be set based on groundY
            width: 48, // Match GIF dimensions if possible
            height: 48, // Match GIF dimensions if possible
            velocityY: 0,
            jumping: false,
            grounded: true,
            color: '#ff6b6b', // Fallback color
            element: null // Will store the <img> element for the player GIF
        };

        // Ground level (adjust based on CSS #ground height)
        this.groundY = this.canvas.height - 107; // Assuming #ground has a height of 60px

        // Set initial player Y based on ground level
        this.player.y = this.groundY - this.player.height;

        // Game objects - obstacles still drawn on canvas, flying enemies will be <img>
        this.obstacles = []; // Ground obstacles drawn on canvas
        this.flyingEnemies = []; // Flying enemies will be <img> elements
        this.particles = []; // Particles drawn on canvas

        // Timing for spawning
        this.lastObstacleTime = 0;
        this.lastFlyingEnemyTime = 0;
        this.animationFrame = 0; // Used for pixel art animations if no images

        // --- MODIFICHE QUI ---
        // Images for ground obstacles - now an object to hold multiple obstacle images
        this.obstacleImages = {
            'obstacle_default': null, // Immagine per obstacle.png
            'obstacle_tent': null     // Immagine per tenda.png
        };
        // --- FINE MODIFICHE ---

        // Update UI
        this.updateScore();

        // Remove old <img> elements if any (from previous game over)
        this.cleanupElements();

        // Ensure screens are in correct initial state
        this.startScreen.style.display = 'flex'; // Show start screen
        this.gameOverElement.style.display = 'none'; // Hide game over screen
        this.newRecordElement.style.display = 'none'; // Hide new record message
        this.instructionsElement.style.opacity = '1'; // Ensure instructions are fully visible initially
        this.showInstructions = true; // Reset instruction visibility flag
    }

    cleanupElements() {
        // Only remove flying enemy elements, keep player element
        [...this.flyingEnemies].forEach(enemy => {
            if (enemy.element && enemy.element.parentNode === this.gameContainer) {
                this.gameContainer.removeChild(enemy.element);
            }
        });
        this.flyingEnemies = [];
        
        // Don't remove player element - keep it for reuse
    }


    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('forestRunnerHighScore') || '0');
        this.highScoreElement.textContent = `Best: ${this.highScore}`;
    }

    loadImages() {
        const imageConfigs = [
            { key: 'player', src: 'images/player.gif', animated: true }, // Modifica percorso
            { key: 'obstacle_default', src: 'images/obstacle.png', animated: false, type: 'obstacle' }, // Modifica percorso
            { key: 'obstacle_tent', src: 'images/tenda.png', animated: false, type: 'obstacle' }, // Modifica percorso
            { key: 'flying', src: 'images/flying.gif', animated: true } // Modifica percorso
        ];

        imageConfigs.forEach(config => {
            const img = new Image();
            img.onload = () => {
                // Store the loaded Image object, useful even if not directly drawn (e.g., for dimensions)
                // For animated GIFs, we will create separate <img> elements later.
                if (!config.animated) {
                    // --- MODIFICHE QUI ---
                    // Se è un'immagine di ostacolo, memorizzala in this.obstacleImages
                    if (config.type === 'obstacle') {
                        this.obstacleImages[config.key] = img;
                    } else {
                        // Per altri tipi di immagini non animate (se ne avessi in futuro)
                        this.images[config.key] = img; // Fallback per altre immagini statiche non ostacoli
                    }
                    // --- FINE MODIFICHE ---
                }
                this.imagesLoaded[config.key] = true;
                this.imageLoadCount++;

                // console.log(`Immagine caricata: ${config.src}`); // Keep for debugging image loading

                // If it's an animated GIF and loaded successfully, create and append the <img> element
                if (config.animated && config.key === 'player') {
                    // Create player <img> element - done only once on initial load
                    const playerImgElement = document.createElement('img');
                    playerImgElement.src = config.src;
                    playerImgElement.style.position = 'absolute';
                    // Set initial position (will be updated in updatePlayer)
                    playerImgElement.style.left = `${this.player.x}px`;
                    playerImgElement.style.top = `${this.player.y}px`;
                    // Set width and height based on player object properties
                    playerImgElement.style.width = `${this.player.width}px`;
                    playerImgElement.style.height = `${this.player.height}px`;
                    // Apply pixel rendering via CSS
                    playerImgElement.style.imageRendering = 'pixelated';
                    playerImgElement.style.zIndex = '20'; // Higher than canvas
                    playerImgElement.style.display = 'none'; // Hide initially until game starts
                    this.gameContainer.appendChild(playerImgElement);
                    this.player.element = playerImgElement; // Store reference
                    // console.log('Player <img> element created and added.'); // Keep for debugging image loading

                    // Note: Flying enemy <img> elements will be created when they are spawned,
                    // as they are generated dynamically during the game.
                }
                this.checkAllImagesLoaded();
            };

            img.onerror = () => {
                console.warn(`Errore nel caricamento dell'immagine: ${config.src}`);
                this.imagesLoaded[config.key] = false; // Mark as failed
                this.imageLoadCount++;
                // Even on error, increment count and check completion
                this.checkAllImagesLoaded();
            };
            img.src = config.src; // Start loading
        });
    }

    checkAllImagesLoaded() {
        if (this.imageLoadCount >= this.totalImagesToLoad) {
            // All initial images (static and animated) have attempted to load
            this.gameReady = true;
            console.log('Caricamento immagini completato. Gioco pronto!');

            // Log fallback status
            if (!this.imagesLoaded.player) {
                console.log('Player GIF non caricata, verrà usata la grafica pixel art.');
            }
            if (!this.imagesLoaded.flying) {
                console.log('Flying GIF non caricata, verranno usati i nemici volanti pixel art.');
            }
            // --- MODIFICHE QUI ---
            // Log for obstacle images (both default and tent)
            if (!this.imagesLoaded.obstacle_default) {
                console.log('Obstacle (default) PNG non caricata, verrà usata la grafica pixel art.');
            }
            if (!this.imagesLoaded.obstacle_tent) {
                console.log('Tenda PNG non caricata, verrà usata la grafica pixel art.');
            }
            // --- FINE MODIFICHE ---

            // If game is ready and input is received, handle input
            // (Input handler checks gameReady, so this just ensures we log readiness)
        }
    }

    setupEventListeners() {
        // We attach listeners once, but their handlers will check the game state (this.gameRunning)
        // to determine if input should be processed.

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            // Check if the game is running before processing input
            if (this.gameRunning && (e.code === 'Space' || e.code === 'ArrowUp')) {
                e.preventDefault();
                this.handleInput();
            } else if (!this.gameStarted && this.gameReady && (e.code === 'Space' || e.code === 'ArrowUp')) {
                // Handle start input only if game hasn't started but is ready
                e.preventDefault();
                this.handleInput();
            }
            // No input processing if game is over or not ready
        });

        // Touch/click controls
        this.canvas.addEventListener('touchstart', (e) => {
            // Check if the game is running before processing input
            if (this.gameRunning) {
                e.preventDefault();
                this.handleInput();
            } else if (!this.gameStarted && this.gameReady) {
                // Handle start input only if game hasn't started but is ready
                e.preventDefault();
                this.handleInput();
            }
        });
        this.canvas.addEventListener('click', (e) => {
            // Check if the game is running before processing input
            if (this.gameRunning) {
                e.preventDefault();
                this.handleInput();
            } else if (!this.gameStarted && this.gameReady) {
                // Handle start input only if game hasn't started but is ready
                e.preventDefault();
                this.handleInput();
            }
        });
        // --- AGGIUNGI QUESTO NUOVO LISTENER PER IL CLICK SULLA SCHERMATA DI AVVIO ---
        this.startScreen.addEventListener('click', () => {
            // Controlla se il gioco non è ancora iniziato e se è pronto (immagini caricate, ecc.)
            if (!this.gameStarted && this.gameReady) {
                this.handleInput(); // Richiama la stessa funzione che gestisce l'input da tastiera/touch
            }
        });
        // --- FINE NUOVO LISTENER ---
        // Restart button - attached once, always active when visible
        this.restartBtn.addEventListener('click', () => {
            console.log('Restart button clicked!'); // Debugging
            this.restart();
        });
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }


    handleInput() {
        // This method is called by event listeners, which now check game state first.
        // This internal check is a fallback/double-check.
        if (!this.gameStarted && this.gameReady) {
            console.log('Avvio del gioco!');
            this.startGame();
        } else if (this.gameRunning) {
            // console.log('Salto!'); // Optional: Keep for debugging
            this.jump();
        }
        // If game is not started/ready and not running, input is ignored.
    }

    startGame() {
        console.log('Gioco iniziato!');
        this.gameStarted = true;
        this.gameRunning = true;
        this.startScreen.style.display = 'none';

        if (this.player.element) {
            this.player.element.style.display = 'block';
        }

        // Reimposta le animazioni CSS per gli elementi di sfondo
        const animatedBackgroundElements = document.querySelectorAll('.mountains, .ground');
        animatedBackgroundElements.forEach(el => {
            // Ottieni lo stile calcolato dell'elemento
            const computedStyle = window.getComputedStyle(el);
            const animationName = computedStyle.animationName;
            const animationDuration = computedStyle.animationDuration;
            const animationTimingFunction = computedStyle.animationTimingFunction;
            const animationIterationCount = computedStyle.animationIterationCount;

            el.style.animation = 'none'; // Rimuovi temporaneamente l'animazione
            void el.offsetWidth; // Forza un reflow per registrare la rimozione
            // Riaggiungi l'animazione con le proprietà originali e assicurati che sia in esecuzione
            el.style.animation = `${animationName} ${animationDuration} ${animationTimingFunction} ${animationIterationCount}`;
            el.style.animationPlayState = 'running';
        });

        if (!this.animationFrameId) {
            this.render();
        }
    }

    jump() {
        if (this.player.grounded && this.gameRunning) { // Only jump if game is running
            this.player.velocityY = this.jumpPower;
            this.player.jumping = true;
            this.player.grounded = false;
            // Add jump particles (drawn on canvas)
            this.createJumpParticles();

            // Optional: Hide player element or change its graphic while jumping if desired
        }
    }

    createJumpParticles() {
        // Particles still drawn on canvas
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
        // Always update particles as they fade out even if game is over
        this.updateParticles();

        // Only update game state if game is running
        if (!this.gameRunning) {
            return; // Stop updating main game logic if not running
        }

        this.animationFrame++; // Still useful for pixel art fallbacks or timing

        // Update score and game speed
        this.score += 0.08; // Score increases every frame
        this.gameSpeed += 0.002;
        this.updateScore();

        // Check if instructions should fade out
        if (this.showInstructions && this.score >= this.instructionFadeOutScore) {
            this.fadeOutInstructions();
        }

        // Update player physics and position
        this.updatePlayer();

        // Spawn and update game objects (obstacles and flying enemies)
        this.spawnObstacles();
        this.updateObstacles(); // This now also updates <img> positions for flying enemies


        // Check collisions
        this.checkCollisions();
    }


    updateScore() {
        this.scoreElement.textContent = `Score: ${Math.floor(this.score)}`;
    }

    fadeOutInstructions() {
        this.showInstructions = false; // Set flag so it only runs once
        // Add transition via CSS property
        this.instructionsElement.style.transition = 'opacity 1s ease-out'; // Match CSS or define here
        this.instructionsElement.style.opacity = '0'; // Start fade out

        // Optional: remove the element from the DOM after the transition
        // setTimeout(() => {
        //     this.instructionsElement.style.display = 'none';
        // }, 1000); // Match transition duration
    }


    updatePlayer() {
        // Apply gravity
        if (!this.player.grounded) {
            this.player.velocityY += this.gravity;
        }

        // Update position
        this.player.y += this.player.velocityY;

        // Ground collision
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.jumping = false;
            this.player.grounded = true;
        }

        // Update the position of the player <img> element
        if (this.player.element) {
            this.player.element.style.left = `${this.player.x}px`;
            this.player.element.style.top = `${this.player.y}px`;
        }
        // The GIF animation is handled automatically by the browser on the <img> element
    }

    spawnObstacles() {
        // Only spawn if game is running
        if (!this.gameRunning) return;

        const currentTime = Date.now();

        // Spawn ground obstacles (drawn on canvas)
        if (currentTime - this.lastObstacleTime > this.getObstacleSpawnRate()) {
            // --- MODIFICHE QUI ---
            // Scegli casualmente l'immagine dell'ostacolo
            const availableObstacleTypes = [];
            if (this.imagesLoaded.obstacle_default) availableObstacleTypes.push('obstacle_default');
            if (this.imagesLoaded.obstacle_tent) availableObstacleTypes.push('obstacle_tent');

            let selectedObstacleKey;
            if (availableObstacleTypes.length > 0) {
                selectedObstacleKey = availableObstacleTypes[Math.floor(Math.random() * availableObstacleTypes.length)];
            } else {
                // Se nessuna immagine è stata caricata, usa un fallback concettuale
                selectedObstacleKey = 'fallback_pixel_obstacle'; // Un nome per il fallback
            }

            let obstacleWidth = 40;
            let obstacleHeight = 50;

            // Puoi definire dimensioni specifiche per ogni tipo di ostacolo qui
            if (selectedObstacleKey === 'obstacle_tent') {
                obstacleWidth = 60; // Esempio: larghezza della tenda
                obstacleHeight = 40; // Esempio: altezza della tenda
            } else { // default obstacle_default
                obstacleWidth = 40;
                obstacleHeight = 50;
            }

            this.obstacles.push({
                x: this.canvas.width + 20,
                y: this.groundY - obstacleHeight, // Posizione sopra il terreno basata sull'altezza dell'ostacolo
                width: obstacleWidth,
                height: obstacleHeight,
                type: 'ground',
                imageKey: selectedObstacleKey, // Memorizza la chiave dell'immagine da usare
                color: '#8b4513' // Fallback color per la pixel art generica
            });
            // --- FINE MODIFICHE ---
            this.lastObstacleTime = currentTime;
        }

        // Spawn flying enemies (as <img> elements or pixel art)
        if (currentTime - this.lastFlyingEnemyTime > this.getFlyingEnemySpawnRate()) {
            const heightFromGround = 60 + Math.random() * 80; // Height above ground
            const enemyY = this.groundY - heightFromGround;

            if (this.imagesLoaded.flying) {
                // Create the <img> element for the flying enemy
                const flyingEnemyImgElement = document.createElement('img');
                flyingEnemyImgElement.src = 'images/flying.gif';
                flyingEnemyImgElement.style.position = 'absolute';
                flyingEnemyImgElement.style.width = '45px'; // Match enemy dimensions
                flyingEnemyImgElement.style.height = '30px'; // Match enemy dimensions
                flyingEnemyImgElement.style.imageRendering = 'pixelated'; // Apply pixel rendering
                flyingEnemyImgElement.style.zIndex = '20'; // Higher than canvas
                flyingEnemyImgElement.style.display = 'block'; // Ensure visibility
                this.gameContainer.appendChild(flyingEnemyImgElement);

                this.flyingEnemies.push({
                    x: this.canvas.width + 20, // Start off-screen right
                    y: enemyY, // Calculated Y position
                    width: 45, // Match img element size
                    height: 30, // Match img element size
                    type: 'flying',
                    color: '#4169e1', // Fallback color (not used for img)
                    wingOffset: Math.random() * Math.PI * 2, // Still useful for pixel art fallback or other effects
                    element: flyingEnemyImgElement // Store the <img> element reference
                });
            } else {
                // Spawn pixel art flying enemies if GIF failed to load
                this.flyingEnemies.push({
                    x: this.canvas.width + 20,
                    y: enemyY,
                    width: 45, // Size for pixel art
                    height: 30, // Size for pixel art
                    type: 'flying',
                    color: '#4169e1',
                    wingOffset: Math.random() * Math.PI * 2,
                    element: null // No <img> element
                });
            }
            this.lastFlyingEnemyTime = currentTime;
        }
    }


    getObstacleSpawnRate() {
        // Adjust spawn rate based on score, ensure a minimum time
        return Math.max(1200, 2500 - this.score * 10); // Example values
    }

    getFlyingEnemySpawnRate() {
        // Adjust spawn rate based on score, ensure a minimum time
        return Math.max(2000, 4000 - this.score * 8); // Example values
    }


    updateObstacles() {
        // Only update if game is running
        if (!this.gameRunning) return;

        // Update ground obstacles (drawn on canvas)
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.gameSpeed;
            // Remove obstacle if it goes off-screen left
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }

        // Update flying enemies (<img> elements or pixel art)
        for (let i = this.flyingEnemies.length - 1; i >= 0; i--) {
            const enemy = this.flyingEnemies[i];
            enemy.x -= this.gameSpeed;
            // Only update wingOffset if using pixel art fallback
            if (!enemy.element) {
                enemy.wingOffset += 0.3;
            }

            // Update the position and display of the enemy <img> element if it exists
            if (enemy.element) {
                enemy.element.style.left = `${enemy.x}px`;
                enemy.element.style.top = `${enemy.y}px`;
                // Ensure the element is visible if the game is running
                if (this.gameRunning) {
                    enemy.element.style.display = 'block';
                } else {
                    // Hide the element if game is not running (e.g., game over)
                    enemy.element.style.display = 'none';
                }
            }

            // Remove flying enemy if it goes off-screen left
            if (enemy.x + enemy.width < 0) {
                // Remove the <img> element from the DOM if it exists
                if (enemy.element && enemy.element.parentNode === this.gameContainer) {
                    this.gameContainer.removeChild(enemy.element);
                }
                this.flyingEnemies.splice(i, 1);
            }
        }
    }

    updateParticles() {
        // Particles still animate and fade out even if game is stopped
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.2; // Gravity for particles
            particle.life -= 0.02; // Fade out
            // Remove particle if its life is over
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }


    checkCollisions() {
        // Only check collisions if game is running
        if (!this.gameRunning) return;

        // Check collision with ground obstacles
        for (let obstacle of this.obstacles) {
            if (this.isColliding(this.player, obstacle)) {
                 console.log('Collisione rilevata con ostacolo!'); // Debugging collision
                this.gameOver();
                return; // Stop checking collisions if game is over
            }
        }

        // Check collision with flying enemies
        for (let enemy of this.flyingEnemies) {
            if (this.isColliding(this.player, enemy)) {
                 console.log('Collisione rilevata con nemico volante!'); // Debugging collision
                this.gameOver();
                return; // Stop checking collisions if game is over
            }
        }
    }

    isColliding(rect1, rect2) {
        // Basic AABB collision detection
        // Smaller hitbox for more forgiving gameplay
        const margin = 4; // Adjust margin as needed
        return rect1.x + margin < rect2.x + rect2.width - margin &&
            rect1.x + rect1.width - margin > rect2.x + margin &&
            rect1.y + margin < rect2.y + rect2.height - margin &&
            rect1.y + rect1.height - margin > rect2.y + margin;
    }


    gameOver() {
        // Check if game is already over to avoid running this multiple times
        if (!this.gameRunning) return;
    
        // Set game state to not running
        this.gameRunning = false;
        console.log('GAME OVER: Funzione chiamata!');
    
        // Stop the requestAnimationFrame loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            console.log('AnimationFrame loop stopped.');
        }
    
        // Stop CSS animations for background and ground
        const animatedElements = document.querySelectorAll('.mountains, .cloud-layer, .ground');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused'; // Ferma tutte le animazioni
        });
        console.log('CSS animations paused.');
    
        // Save score if it's a new high score
        this.saveHighScore();
    
        // Update game over screen and show it
        this.finalScoreElement.textContent = Math.floor(this.score);
    
        // Forza la visualizzazione della schermata di Game Over
        this.gameOverElement.style.display = 'flex';
        this.gameOverElement.style.visibility = 'visible';
        this.gameOverElement.style.opacity = '1';
        this.gameOverElement.style.zIndex = '1000';
    
        console.log('Game Over screen should now be visible');
    
        // Create explosion particles
        this.createExplosionParticles();
    
        // Hide player element during game over screen
        if (this.player.element) {
            this.player.element.style.display = 'none';
        }
    
        // Hide all flying enemy elements during game over screen
        this.flyingEnemies.forEach(enemy => {
            if (enemy.element) {
                enemy.element.style.display = 'none';
            }
        });
    }

    createExplosionParticles() {
        // Particles still drawn on canvas
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                velocityX: (Math.random() - 0.5) * 12,
                velocityY: (Math.random() - 0.5) * 12,
                size: Math.random() * 6 + 3,
                life: 1.5, // Life in seconds or frames, adjust as needed
                color: ['#ff6b6b', '#ffd700', '#ff8c00', '#32cd32'][Math.floor(Math.random() * 4)] // Random color
            });
        }
    }

    restart() {
        console.log('Restarting game...');

        this.gameOverElement.style.display = 'none';
        this.newRecordElement.style.display = 'none';
        this.startScreen.style.display = 'flex';

        // Reimposta le animazioni CSS per gli elementi di sfondo
        const animatedBackgroundElements = document.querySelectorAll('.mountains, .ground');
        animatedBackgroundElements.forEach(el => {
            // Ottieni lo stile calcolato dell'elemento
            const computedStyle = window.getComputedStyle(el);
            const animationName = computedStyle.animationName;
            const animationDuration = computedStyle.animationDuration;
            const animationTimingFunction = computedStyle.animationTimingFunction;
            const animationIterationCount = computedStyle.animationIterationCount;

            el.style.animation = 'none'; // Rimuovi temporaneamente l'animazione
            void el.offsetWidth; // Forza un reflow per registrare la rimozione
            // Riaggiungi l'animazione con le proprietà originali e assicurati che sia in esecuzione
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
        // Mostra sempre il record attuale
        this.currentRecordElement.textContent = this.highScore;
        
        if (currentScore > this.highScore) {
            this.highScore = currentScore;
            localStorage.setItem('forestRunnerHighScore', this.highScore.toString());
            this.highScoreElement.textContent = `Best: ${this.highScore}`;
            this.currentRecordElement.textContent = this.highScore;
            
            // Show new record message
            this.newRecordElement.style.display = 'block';
            console.log('Nuovo record salvato:', this.highScore);
        } else {
            // Hide new record message if not a new record
            this.newRecordElement.style.display = 'none';
        }
    }

    render() {
        // Clear canvas at the beginning of each render frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render game elements that are always drawn on canvas (like obstacles and particles)
        this.renderObstacles();
        this.renderParticles(); // Always render particles as they fade out

        // Render pixel art fallbacks if images didn't load.
        // Note: Fallbacks for player/flying enemies are only rendered if gameRunning is true,
        // as they are replaced by explosion particles/hidden when game is over.
        this.renderFallbacks();

        // Player and flying enemies as <img> are positioned by update() and rendered by browser.
        // Their visibility is controlled by their display style property updated in updateObstacles() and gameOver().


        // Update game logic for the next frame
        // The update() method itself checks `this.gameRunning` to decide what to update.
        this.update();


        // Continue the animation loop ONLY if game is running OR if particles are still visible
        // (Particles fade out even after game over, so we need a few more frames)
        if (this.gameRunning || this.particles.length > 0) {
            this.animationFrameId = requestAnimationFrame(() => this.render());
        } else {
            // If game is not running and no particles are left, stop requesting frames.
            this.animationFrameId = null;
            console.log('Render loop fully stopped (no game running and no particles).'); // Debugging
        }
    }


    renderFallbacks() {
        // Render pixel art player if GIF failed to load AND game is running.
        // When game is not running, the explosion particles are shown instead.
        if (this.gameRunning && !this.imagesLoaded.player && !this.player.element) {
            this.renderPixelPlayer();
        }

        // Render pixel art obstacles if PNG failed to load
        if (!this.imagesLoaded.obstacle) {
            // Obstacles are always drawn on canvas, this ensures the pixel art
            // rendering function is called if the image didn't load.
            // The main renderObstacles checks this.images.obstacle
        }

        // Render pixel art flying enemies if GIF failed to load and no <img> element exists AND game is running.
        if (this.gameRunning && !this.imagesLoaded.flying) {
            this.flyingEnemies.forEach(enemy => {
                if (!enemy.element) { // Check if <img> element was NOT created
                    this.renderPixelBird(enemy);
                }
            });
        }
    }


    renderPlayer() {
        // This method is now only for the pixel art fallback when the game is running.
        // Player <img> is handled by the browser if loaded.
        if (this.gameRunning && !this.imagesLoaded.player && !this.player.element) {
            this.renderPixelPlayer();
        }
    }

    renderPixelPlayer() {
        // Drawing pixel art player on canvas
        this.ctx.save();
        const x = this.player.x;
        const y = this.player.y;
        const size = 6; // Pixel size for fallback graphic

        // Player body (simple pixel character)
        this.ctx.fillStyle = this.player.color; // Use player color property
        this.ctx.fillRect(x + size * 2, y + size * 2, size * 4, size * 5);

        // Head
        this.ctx.fillStyle = '#ffb3b3'; // Skin color example
        this.ctx.fillRect(x + size * 2, y, size * 4, size * 3);

        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + size * 3, y + size, size, size);
        this.ctx.fillRect(x + size * 5, y + size, size, size);

        // Arms
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(x + size, y + size * 3, size, size * 2);
        this.ctx.fillRect(x + size * 6, y + size * 3, size, size * 2);

        // Legs
        this.ctx.fillRect(x + size * 2, y + size * 7, size, size * 2);
        this.ctx.fillRect(x + size * 4, y + size * 7, size, size * 2);

        // Add jumping animation (pixel art specific)
        if (this.player.jumping) {
            this.ctx.fillStyle = '#32cd32'; // Green highlight example
            this.ctx.fillRect(x + size * 3, y + size * 8, size * 2, size);
        }
        this.ctx.restore();
    }


    renderObstacles() {
        // Render ground obstacles (always drawn on canvas)
        for (let obstacle of this.obstacles) {
            this.ctx.save();
            // --- MODIFICHE QUI ---
            // Ottieni l'immagine dell'ostacolo dal suo imageKey
            const obstacleImage = this.obstacleImages[obstacle.imageKey];
            // Controlla se l'immagine specifica per questo ostacolo è stata caricata con successo
            const imageLoadedSuccessfully = obstacleImage && this.imagesLoaded[obstacle.imageKey];

            if (imageLoadedSuccessfully) {
                // Usa l'immagine caricata
                this.ctx.drawImage(
                    obstacleImage,
                    obstacle.x,
                    obstacle.y,
                    obstacle.width,
                    obstacle.height
                );
            } else {
                // Pixel art fallback se l'immagine specifica non è stata caricata
                this.renderPixelObstacle(obstacle);
            }
            // --- FINE MODIFICHE ---
            this.ctx.restore();
        }
    }

    renderPixelObstacle(obstacle) {
        // Drawing pixel art obstacle on canvas
        this.ctx.save();
        const x = obstacle.x;
        const y = obstacle.y;
        const w = obstacle.width;
        const h = obstacle.height;

        // --- MODIFICHE QUI ---
        // Se il fallback è per la tenda, disegna una tenda in pixel art
        if (obstacle.imageKey === 'obstacle_tent' || obstacle.imageKey === 'fallback_pixel_obstacle_tent') {
            // Disegna una rappresentazione pixel art della tenda
            this.ctx.fillStyle = '#A0522D'; // Marrone per la base della tenda
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + h); // Angolo in basso a sinistra
            this.ctx.lineTo(x + w / 2, y); // Vertice centrale
            this.ctx.lineTo(x + w, y + h); // Angolo in basso a destra
            this.ctx.closePath();
            this.ctx.fill();

            // Aggiungi un'asta centrale (opzionale)
            this.ctx.fillStyle = '#8B4513'; // Marrone scuro per l'asta
            this.ctx.fillRect(x + w / 2 - 1, y, 2, h); // Piccola asta verticale

        } else {
            // Altrimenti, disegna l'ostacolo albero predefinito (come il tuo codice originale)
            // Tree trunk (example pixel art)
            this.ctx.fillStyle = '#8b4513';
            this.ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.7);

            // Tree foliage (example pixel art)
            this.ctx.fillStyle = '#228b22';
            this.ctx.fillRect(x, y, w, h * 0.5);

            // Trunk texture (example pixel art)
            this.ctx.fillStyle = '#654321';
            for (let i = 0; i < 3; i++) {
                this.ctx.fillRect(x + w * 0.35, y + h * 0.4 + i * (h * 0.7 / 4), w * 0.3, 2);
            }

            // Leaves detail (example pixel art)
            this.ctx.fillStyle = '#32cd32';
            this.ctx.fillRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.3);
        }
        // --- FINE MODIFICHE ---
        this.ctx.restore();
    }


    renderFlyingEnemies() {
        // This method is now only for rendering pixel art fallbacks if the GIF failed to load
        // The <img> elements for successful GIF loads are handled automatically by the browser.
        // We iterate through the flyingEnemies array, but only render to canvas if no <img> element exists.
        // Only render if game is running
        if (!this.gameRunning) return;

        for (let enemy of this.flyingEnemies) {
            if (!enemy.element) { // Check if <img> element was NOT created
                this.renderPixelBird(enemy);
            }
            // If enemy.element exists, the <img> is visible and positioned, no canvas drawing needed here.
        }
    }

    renderPixelBird(enemy) {
        // Drawing pixel art bird on canvas
        this.ctx.save();
        const x = enemy.x;
        const y = enemy.y;
        const size = 4; // Pixel size for fallback graphic
        const wingFlap = Math.sin(enemy.wingOffset) * (size * 2); // Use wingOffset for animation

        // Bird body (example pixel art)
        this.ctx.fillStyle = enemy.color; // Use enemy color property
        this.ctx.fillRect(x + size * 3, y + size * 2, size * 3, size * 2);

        // Bird head (example pixel art)
        this.ctx.fillStyle = '#1e90ff'; // Lighter color example
        this.ctx.fillRect(x + size * 5, y + size, size * 2, size * 2);

        // Beak (example pixel art)
        this.ctx.fillStyle = '#ffa500'; // Orange example
        this.ctx.fillRect(x + size * 7, y + size * 2, size * 1.5, size);

        // Wings (animated via wingFlap) (example pixel art)
        this.ctx.fillStyle = '#0000cd'; // Dark blue example
        this.ctx.fillRect(x + size * 2, y + size * 1.5 + wingFlap, size * 2, size); // Left wing
        this.ctx.fillRect(x + size * 5, y + size * 1.5 - wingFlap, size * 2, size); // Right wing

        // Eye (example pixel art)
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + size * 6, y + size * 1.5, size, size);

        // Tail (example pixel art)
        this.ctx.fillStyle = '#191970'; // Darker blue example
        this.ctx.fillRect(x + size * 1.5, y + size * 3, size * 1.5, size);

        this.ctx.restore();
    }


    renderParticles() {
        // Particles are still drawn on canvas
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life; // Apply transparency
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

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ForestRunner();
});