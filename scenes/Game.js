// URL to explicar PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.gameOver = false;
    this.puntos = 0;
    this.puedeGenerar = false;
    this.generandoMisiles = false;
    this.velocidadBaseMisil = 120;
    this.nextVelocidadAumento = 300;
    this.misilesPorRafaga = 2;
    this.frecuenciaMisiles = 500;
    this.tieneEscudo = false;
    this.siguienteEscudo = 1000;
    this.siguientePowerUp = 1000;
    this.powerUpActivo = false; // true si hay uno en pantalla o activo
    this.slowMotionActivo = false;
  }

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

  create() {
    this.add.image(1800 / 2, 750 / 2, "fondo").setDisplaySize(1800, 750);

    this.puntosText = this.add.text(16, 16, `Puntos: ${this.puntos}`, {
      fontSize: "32px",
      fill: "#000",
      fontFamily: "'Changa One'",
    });

    this.time.addEvent({
      callback: () => {
        this.puntosText.setText(`Puntos: ${this.puntos}`);
      },
      loop: true,
      delay: 10,
    });

    this.player = this.physics.add.sprite(50, 650, "logo");
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);

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
      frames: [{ key: "logo", frame: 0 }],
      frameRate: 1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.plataformas = this.physics.add.staticGroup();
    this.plataformas.create(700, 800, "ground").setScale(6).refreshBody();
    this.plataformas.create(400, 400, "ground").setScale(1.5).refreshBody();
    this.plataformas.create(400, 150, "ground").setScale(1.5).refreshBody();
    this.plataformas.create(1400, 350, "ground").setScale(1.5).refreshBody();
    this.plataformas.create(1400, 150, "ground").setScale(1.5).refreshBody();
    this.plataformas.create(1300, 550, "ground").setScale(2).refreshBody();
    this.physics.add.collider(this.player, this.plataformas);

    this.misiles = this.physics.add.group();
    this.superMisiles = this.physics.add.group();

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

    this.time.delayedCall(2000, () => {
      this.puedeGenerar = true;
      this.crearMisiles();
    });

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

    this.isSliding = false;
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: () => {
        this.puntos += 50;
      },
    });

    // Grupo de power-ups
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

    this.escudoVisual = this.add.image(this.player.x, this.player.y, "escudo").setScale(0.25);
    this.escudoVisual.setVisible(false);

    // Grupo de power-ups de tiempo (puedes usar el mismo grupo si quieres)
    this.powerupsTiempo = this.physics.add.group();

    // Función para crear el power-up de tiempo
    this.crearPowerUpTiempo = () => {
      this.powerupsTiempo.clear(true, true); // Elimina cualquier reloj anterior
      const x = Phaser.Math.Between(100, 1700);
      const y = Phaser.Math.Between(100, 700);
      const reloj = this.powerupsTiempo.create(x, y, "reloj").setScale(0.15);
      reloj.body.allowGravity = false;
    };

    // Colisión entre jugador y reloj
    this.physics.add.overlap(this.player, this.powerupsTiempo, (player, reloj) => {
      reloj.destroy();
      this.slowMotionActivo = true;
      this.powerUpActivo = false; // Permite que vuelva a aparecer uno cuando termine slow motion
      this.activarSlowMotion();
    });
  }

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

  update() {
    if (
      Phaser.Input.Keyboard.JustDown(this.shiftKey) &&
      !this.isSliding &&
      this.player.body.touching.down
    ) {
      this.isSliding = true;

      this.player.setTexture("slide");
      this.player.setScale(0.3);
      this.player.body.setSize(200, 80).setOffset(20, 210);

      // Guardamos la dirección actual
      this.slideDirection =
        this.cursors.left.isDown ? -1 :
        this.cursors.right.isDown ? 1 :
        (this.player.flipX ? -1 : 1);

      const slideVel = 600;
      this.player.setVelocityX(this.slideDirection * slideVel);
      this.player.flipX = this.slideDirection < 0;

      this.time.delayedCall(800, () => {
        this.isSliding = false;
        this.player.setTexture("logo");
        this.player.setScale(0.3);
        this.player.body.setSize(150, 250).setOffset(40, 30);
      });
    }

    // Movimiento si no está deslizando
    if (!this.isSliding) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-300);
        this.player.flipX = true;
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(300);
        this.player.flipX = false;
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-500);
      }

      if (this.cursors.down.isDown) {
        this.player.setVelocityY(200);
      }

      // Animaciones solo si no está en slide
      if (!this.player.body.touching.down) {
        this.player.anims.play("jump", true);
      } else if (this.player.body.velocity.x !== 0) {
        this.player.anims.play("run", true);
      } else {
        this.player.anims.play("idle", true);
      }
    } else {
      // Si está deslizando, mantenemos la velocidad constante
      const slideVel = 600;
      this.player.setVelocityX(this.slideDirection * slideVel);
    }

    // Misiles
    this.misiles.children.iterate((misil) => {
      if (!misil || !misil.active || !this.player) return;

      const targetAngle = Phaser.Math.Angle.Between(misil.x, misil.y, this.player.x, this.player.y);
      const diff = Phaser.Math.Angle.Wrap(targetAngle - misil.rotation);
      misil.rotation += diff * misil.rotationSpeed;

      this.physics.velocityFromRotation(misil.rotation, misil.speed, misil.body.velocity);
    });

    if (this.puedeGenerar && this.misiles.countActive(true) === 0 && !this.generandoMisiles) {
      this.generandoMisiles = true;
      this.time.delayedCall(this.frecuenciaMisiles, () => {
        this.crearMisiles();
        this.generandoMisiles = false;
      });
    }

    if (this.puntos >= this.nextVelocidadAumento) {
      this.velocidadBaseMisil += 40;
      this.nextVelocidadAumento += 300;
      this.misilesPorRafaga += 2;
    }

    if (this.misilesPorRafaga > 10) {
      this.misilesPorRafaga = 10;
    }

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

    if (!this.nextSuperMisil) this.nextSuperMisil = 1000;
    if (this.puntos >= this.nextSuperMisil) {
      this.lanzarSuperMisil();
      this.nextSuperMisil += 1000;
    }

    if (this.escudoVisual) {
      this.escudoVisual.setPosition(this.player.x, this.player.y);
      this.escudoVisual.setVisible(this.tieneEscudo);
    }

    this.superMisiles.children.iterate((superMisil) => {
      if (superMisil && superMisil.update) superMisil.update();
    });
  }
}