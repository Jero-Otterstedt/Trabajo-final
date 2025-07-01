// URL to explicar PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

// Escena principal del juego
export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  // Inicialización de variables del juego
  init() {
    this.gameOver = false;
    this.puntos = 0; // Puntos del jugador
    this.puedeGenerar = false; // Controla si se pueden generar misiles
    this.generandoMisiles = false; // Evita doble generación de misiles
    this.velocidadBaseMisil = 120; // Velocidad inicial de los misiles
    this.nextVelocidadAumento = 300; // Próximo umbral para aumentar dificultad
    this.misilesPorRafaga = 2; // Cantidad de misiles por ráfaga
    this.frecuenciaMisiles = 500; // Frecuencia de aparición de misiles
    this.tieneEscudo = false; // Si el jugador tiene escudo
    this.siguienteEscudo = 1000; // Umbral de puntos para escudo
    this.siguientePowerUp = 1000; // Próximo umbral para power-up
    this.powerUpActivo = false; // Si hay un power-up en pantalla o activo
    this.slowMotionActivo = false; // Si está activo el slow motion
  }

  // Precarga de assets
  preload() {
    this.load.image("fondo", "./public/assets/fondo_2.jpg");
    this.load.image("logo", "./public/assets/Ninja.png");
    this.load.image("ground", "./public/assets/platform.png");
    this.load.image("triangle", "./public/assets/triangle.png");
    this.load.image("slide", "./public/assets/slide-.png");
    this.load.image("escudo", "./public/assets/Escudo.png");
    this.load.image("reloj", "./public/assets/Reloj.png");
    this.load.image("explosion", "./public/assets/explosion.png");

    this.load.spritesheet("correr", "./public/assets/correr.png", {
      frameWidth: 235,
      frameHeight: 294,
    });

    this.load.spritesheet("saltar", "./public/assets/saltar.png", {
      frameWidth: 235,
      frameHeight: 294,
    });
  }

  // Creación de la escena y objetos principales
  create() {
    // Fondo del juego
    this.add.image(1800 / 2, 750 / 2, "fondo").setDisplaySize(1800, 750);

    // Texto de puntos
    this.puntosText = this.add.text(16, 16, `Puntos: ${this.puntos}`, {
      fontSize: "32px",
      fill: "#000",
      fontFamily: "'Changa One'",
    });

    // Actualiza el texto de puntos constantemente
    this.time.addEvent({
      callback: () => {
        this.puntosText.setText(`Puntos: ${this.puntos}`);
      },
      loop: true,
      delay: 10,
    });

    // Jugador
    this.player = this.physics.add.sprite(50, 650, "logo");
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);

    // Animaciones del jugador
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("correr", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("saltar", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: 0,
    });

    this.anims.create({
      key: "idle",
      frames: [{ key: "correr", frame: 8 }],
      frameRate: 1,
    });

    // Evento al terminar la animación de salto
    this.player.on("animationcomplete", (anim) => {
      if (anim.key === "jump") {
        this.player.anims.stop();
        this.player.setTexture("saltar");
        this.player.setFrame(2); // Usa el frame del slide
      }
    });

    // Controles de teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // Plataformas del escenario
    this.plataformas = this.physics.add.staticGroup();
    this.plataformas.create(700, 800, "ground").setScale(6).refreshBody();
    this.plataformas.create(400, 400, "ground").setScale(1.5).refreshBody();
    this.plataformas.create(400, 150, "ground").setScale(1.5).refreshBody();
    this.plataformas.create(1400, 350, "ground").setScale(1.5).refreshBody();
    this.plataformas.create(1400, 150, "ground").setScale(1.5).refreshBody();
    this.plataformas.create(1300, 550, "ground").setScale(2).refreshBody();
    this.physics.add.collider(this.player, this.plataformas);

    // Grupos de misiles normales y super misiles
    this.misiles = this.physics.add.group();
    this.superMisiles = this.physics.add.group();

    // Colisión entre jugador y misiles normales
    this.physics.add.overlap(this.player, this.misiles, (player, misil) => {
      if (this.tieneEscudo) {
        this.tieneEscudo = false;
        misil.destroy();

        // Crear un nuevo misil para mantener la cantidad par
        const width = this.scale.width;
        const height = this.scale.height;
        const borde = Phaser.Math.Between(0, 2);
        let x, y;
        switch (borde) {
          case 0:
            x = Phaser.Math.Between(0, width);
            y = 0;
            break;
          case 1:
            x = width;
            y = Phaser.Math.Between(0, height);
            break;
          case 2:
            x = 0;
            y = Phaser.Math.Between(0, height);
            break;
        }
        const nuevoMisil = this.physics.add.sprite(x, y, "triangle").setScale(0.4);
        nuevoMisil.speed = this.velocidadBaseMisil;
        nuevoMisil.rotationSpeed = 0.05;
        nuevoMisil.body.allowGravity = false;
        nuevoMisil.setCollideWorldBounds(false);
        this.misiles.add(nuevoMisil);
      } else {
        this.scene.start("gameOver", { puntos: this.puntos });
      }
    });

    // Colisión entre misiles normales (explosión y suma de puntos)
    this.physics.add.collider(this.misiles, this.misiles, (m1, m2) => {
      if (m1 !== m2) {
        const explosion1 = this.add.image(m1.x, m1.y, "explosion").setScale(0.25);
        const explosion2 = this.add.image(m2.x, m2.y, "explosion").setScale(0.25);
        this.time.delayedCall(300, () => {
          explosion1.destroy();
          explosion2.destroy();
        });
        m1.destroy();
        m2.destroy();
        this.puntos += 100;
      }
    });

    // Primeros misiles tras 2 segundos
    this.time.delayedCall(2000, () => {
      this.puedeGenerar = true;
      this.crearMisiles();
    });

    // Función para crear una ráfaga de misiles normales
    this.crearMisiles = () => {
      const width = this.scale.width;
      const height = this.scale.height;

      for (let i = 0; i < this.misilesPorRafaga; i++) {
        const borde = Phaser.Math.Between(0, 2);
        let x, y;

        switch (borde) {
          case 0:
            x = Phaser.Math.Between(0, width);
            y = 0;
            break;
          case 1:
            x = width;
            y = Phaser.Math.Between(0, height);
            break;
          case 2:
            x = 0;
            y = Phaser.Math.Between(0, height);
            break;
        }

        const misil = this.physics.add.sprite(x, y, "triangle").setScale(0.4);
        misil.speed = this.velocidadBaseMisil;
        misil.rotationSpeed = 0.05;
        misil.body.allowGravity = false;
        misil.setCollideWorldBounds(false);
        this.misiles.add(misil);
      }
    };

    // Variables y controles para el slide (deslizamiento)
    this.isSliding = false;
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // Evento para sumar puntos automáticamente cada 10 segundos
    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: () => {
        this.puntos += 50;
      },
    });

    // Grupo de power-ups de escudo
    this.powerups = this.physics.add.group();

    // Función para crear el power-up de escudo
    this.crearPowerUpEscudo = () => {
      this.powerups.clear(true, true); // Elimina cualquier escudo anterior
      const x = Phaser.Math.Between(100, 1700);
      const y = Phaser.Math.Between(100, 700);
      const escudo = this.powerups.create(x, y, "escudo").setScale(0.2);
      escudo.body.allowGravity = false;
    };

    // Colisión entre jugador y escudo
    this.physics.add.overlap(this.player, this.powerups, (player, escudo) => {
      escudo.destroy();
      this.tieneEscudo = true;
      this.powerUpActivo = false; // Permite que vuelva a aparecer uno cuando se termine el escudo
    });

    // Sprite visual del escudo sobre el jugador
    this.escudoVisual = this.add.image(this.player.x, this.player.y, "escudo").setScale(0.25);
    this.escudoVisual.setVisible(false);

    // Grupo de power-ups de tiempo (slow motion)
    this.powerupsTiempo = this.physics.add.group();

    // Función para crear el power-up de tiempo
    this.crearPowerUpTiempo = () => {
      this.powerupsTiempo.clear(true, true); // Elimina cualquier reloj anterior
      const x = Phaser.Math.Between(100, 1700);
      const y = Phaser.Math.Between(100, 700);
      const reloj = this.powerupsTiempo.create(x, y, "reloj").setScale(0.15);
      reloj.body.allowGravity = false;
    };

    // Colisión entre jugador y reloj (slow motion)
    this.physics.add.overlap(this.player, this.powerupsTiempo, (player, reloj) => {
      reloj.destroy();
      this.slowMotionActivo = true;
      this.powerUpActivo = false; // Permite que vuelva a aparecer uno cuando termine slow motion
      this.activarSlowMotion();
    });
  }

  // Activa el slow motion por 5 segundos
  activarSlowMotion() {
    this.time.timeScale = 0.5;
    this.misiles.children.iterate((misil) => {
      if (misil) misil.speed *= 0.5;
    });

    this.time.delayedCall(5000, () => {
      this.time.timeScale = 1;
      this.misiles.children.iterate((misil) => {
        if (misil) misil.speed *= 2;
      });
      this.slowMotionActivo = false; // Permite que vuelva a aparecer un power-up
    });
  }

  // Lanza un super misil rápido y en línea recta hacia el jugador
  lanzarSuperMisil() {
    const width = 1800;
    const height = 750;
    const offset = 20;

    // Elige un borde aleatorio (0: arriba, 1: derecha, 2: izquierda)
    const borde = Phaser.Math.Between(0, 2);
    let x, y, angle;

    switch (borde) {
      case 0: // arriba
        x = Phaser.Math.Between(offset, width - offset);
        y = offset;
        break;
      case 1: // derecha
        x = width - offset;
        y = Phaser.Math.Between(offset, height - offset);
        break;
      case 2: // izquierda
        x = offset;
        y = Phaser.Math.Between(offset, height - offset);
        break;
    }
    angle = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);

    const superMisil = this.physics.add.sprite(x, y, "triangle").setScale(0.7);
    superMisil.speed = 400;
    superMisil.rotation = angle;
    superMisil.body.allowGravity = false;
    superMisil.setCollideWorldBounds(false);
    superMisil.body.checkCollision.none = true; // No colisiona con otros misiles

    this.physics.velocityFromRotation(angle, superMisil.speed, superMisil.body.velocity);

    this.superMisiles.add(superMisil);

    // Explota al salir de pantalla
    superMisil.update = () => {
      if (
        superMisil.x < 0 || superMisil.x > width ||
        superMisil.y < 0 || superMisil.y > height
      ) {
        const explosion = this.add.image(superMisil.x, superMisil.y, "explosion").setScale(0.25);
        this.time.delayedCall(300, () => explosion.destroy());
        superMisil.destroy();
      }
    };

    // Si toca al jugador, game over
    this.physics.add.overlap(superMisil, this.player, () => {
      this.scene.start("gameOver", { puntos: this.puntos });
    });
  }

  // Lógica principal del juego, se ejecuta en cada frame
  update() {
    // Detectar inicio de slide (deslizamiento)
    if (
      Phaser.Input.Keyboard.JustDown(this.shiftKey) &&
      (this.cursors.left.isDown || this.cursors.right.isDown) &&
      this.player.body.touching.down &&
      !this.isSliding
    ) {
      this.isSliding = true;

      this.player.anims.stop();
      this.player.setTexture("correr");
      this.player.setFrame(9); 

      this.player.setScale(0.3);
      this.player.body.setSize(200, 80).setOffset(20, 210);

      // Dirección del slide
      this.slideDirection =
        this.cursors.left.isDown ? -1 :
        this.cursors.right.isDown ? 1 :
        (this.player.flipX ? -1 : 1);

      const slideVel = 600;
      this.player.setVelocityX(this.slideDirection * slideVel);
      this.player.flipX = this.slideDirection < 0;

    
      this.time.delayedCall(800, () => {
        this.isSliding = false;
        this.player.setScale(0.3);
        this.player.body.setSize(150, 250).setOffset(40, 30);
      });
    }

    // Movimiento y animaciones normales solo si no está deslizando
    if (!this.isSliding) {
      // Movimiento horizontal
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-300);
        this.player.flipX = true;
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(300);
        this.player.flipX = false;
      } else {
        this.player.setVelocityX(0);
      }

      // Salto
      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-500);
      }

      // Bajada rápida
      if (this.cursors.down.isDown) {
        this.player.setVelocityY(200);
      }

      // Animaciones según el estado del jugador
      if (!this.player.body.onFloor()) {
        if (this.player.anims.currentAnim?.key !== "jump" && !this.isSliding) {
          this.player.anims.play("jump", true);
        }
      } else if (this.player.body.velocity.x === 0) {
        if (this.player.anims.currentAnim?.key !== "idle") {
          this.player.anims.play("idle", true);
        }
      } else {
        if (this.player.anims.currentAnim?.key !== "run") {
          this.player.anims.play("run", true);
        }
      }
    }

    // Misiles normales: siguen al jugador
    this.misiles.children.iterate((misil) => {
      if (!misil || !misil.active || !this.player) return;

      const targetAngle = Phaser.Math.Angle.Between(misil.x, misil.y, this.player.x, this.player.y);
      const diff = Phaser.Math.Angle.Wrap(targetAngle - misil.rotation);
      misil.rotation += diff * misil.rotationSpeed;

      this.physics.velocityFromRotation(misil.rotation, misil.speed, misil.body.velocity);
    });

    // Generar nueva ráfaga de misiles si no hay activos
    if (this.puedeGenerar && this.misiles.countActive(true) === 0 && !this.generandoMisiles) {
      this.generandoMisiles = true;
      this.time.delayedCall(this.frecuenciaMisiles, () => {
        this.crearMisiles();
        this.generandoMisiles = false;
      });
    }

    // Aumentar dificultad cada cierto puntaje
    if (this.puntos >= this.nextVelocidadAumento) {
      this.velocidadBaseMisil += 40;
      this.nextVelocidadAumento += 300;
      this.misilesPorRafaga += 2;
    }

    // Limitar la cantidad máxima de misiles por ráfaga
    if (this.misilesPorRafaga > 10) {
      this.misilesPorRafaga = 10;
    }

    // Aparición de power-ups cada 1000 puntos, solo si no hay uno activo
    if (
      this.puntos >= this.siguientePowerUp &&
      !this.powerUpActivo &&
      !this.tieneEscudo &&
      !this.slowMotionActivo
    ) {
      // Elegir aleatoriamente: 0 = escudo, 1 = reloj
      const tipo = Phaser.Math.Between(0, 1);
      if (tipo === 0) {
        this.crearPowerUpEscudo();
      } else {
        this.crearPowerUpTiempo();
      }
      this.powerUpActivo = true;
      this.siguientePowerUp += 1000;
    }

    // Lanzar super misil cada 1000 puntos
    if (!this.nextSuperMisil) this.nextSuperMisil = 1000;
    if (this.puntos >= this.nextSuperMisil) {
      this.lanzarSuperMisil();
      this.nextSuperMisil += 1000;
    }

    // Mantener el escudo visual sobre el jugador
    if (this.escudoVisual) {
      this.escudoVisual.setPosition(this.player.x, this.player.y);
      this.escudoVisual.setVisible(this.tieneEscudo);
    }

    // Actualizar super misiles (explosión al salir de pantalla)
    this.superMisiles.children.iterate((superMisil) => {
      if (superMisil && superMisil.update) superMisil.update();
    });
  }
}