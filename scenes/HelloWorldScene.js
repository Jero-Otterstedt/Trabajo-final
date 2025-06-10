// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    // key of the scene
    // the key will be used to start the scene by other scenes
    super("hello-world");
  }

  init() {
    // this is called before the scene is created
    // init variables
    // take data passed from other scenes
    // data object param {}

    //----------Game Over----------
    this.gameOver = false;

    //----------Puntos----------
    this.puntos = 0;
  }

  preload() {
    // load assets
    this.load.image("sky", "./public/assets/FondoMenu.jpg");
    this.load.image("logo", "./public/assets/Ninja.png");
    this.load.image("ground", "./public/assets/platform.png");
    this.load.image("diamond", "./public/assets/diamond.png");
    this.load.image("square", "./public/assets/square.png");
    this.load.image("triangle", "./public/assets/triangle.png");
    this.load.image("shuriken", "./public/assets/shuriken.png");
  }

  create() {
    //----------JUEGO----------

    //----------Fondo----------

    this.add.image(400, 300, "sky");

    //----------Puntos----------

    this.puntosText = this.add.text(16, 16, `Puntos: ${this.puntos}`, {
      fontSize: "32px",
      fill: "#000",
    });

    function updatePuntos() {
      this.puntosText.setText(`Puntos: ${this.puntos}`);
    }
    this.time.addEvent({
      callback: updatePuntos.bind(this),
      loop: true,
      delay: 10, // 1000 ms = 1 segundo
    });

    //----------Jugador----------

    this.player = this.physics.add.sprite(50, 543, "logo");

    this.player.setScale(0.1);
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    //----------Plataformas----------

    this.plataformas = this.physics.add.staticGroup();

    this.plataformas.create(400, 600, "ground").setScale(2).refreshBody();
    this.plataformas.create(250, 300, "ground").setScale(0.75).refreshBody();
    this.plataformas.create(750, 150, "ground").setScale(0.5).refreshBody();
    this.plataformas.create(650, 450, "ground").setScale(1).refreshBody();

    this.physics.add.collider(this.player, this.plataformas);

    //----------Formas----------

    this.items = this.physics.add.group();
    this.physics.add.collider(this.items, this.plataformas, (item) => {
      item.puntos -= 5 // Descontar 5 puntos
      if (item.puntos <= 0) {
       item.destroy(); // Destruir el ítem si los puntos llegan a 0
      }
   });

    function crearFormas() {
      const formas = ["diamond", "square", "triangle"];
      const puntosPorForma = {
        diamond: 16, // Valor de puntos para los diamantes
        square: 11, // Valor de puntos para los cuadrados
        triangle: 6, // Valor de puntos para los triángulos
      };

      const randomformas = Phaser.Utils.Array.GetRandom(formas);
      const randomX = Phaser.Math.Between(50, 750);

      // Crear la forma y asignar su valor de puntos
      const item = this.items
        .create(randomX, 25, randomformas)
        .setScale(0.6)
        .setBounce(0.4)
        .refreshBody();
      item.puntos = puntosPorForma[randomformas]; // Asignar puntos como propiedad personalizada
    }

    crearFormas.call(this);
    this.time.addEvent({
      delay: 500, // 500 ms = 0.5 segundos
      callback: crearFormas.bind(this),
      loop: true,
    });

    this.physics.add.overlap(this.player, this.items, (player, item) => {
      this.puntos += item.puntos; // Sumar los puntos del ítem recolectado
      item.destroy(); // Destruir el ítem recolectado
      this.puntosText.setText(`Puntos: ${this.puntos}`); // Actualizar el texto de puntos

      if (this.puntos >= 100 && !this.gameOver) {
        this.gameOver = true;
        this.scene.start("fin", { puntos: this.puntos, tiempoRestante: this.tiempo, victoria: true });
      }
    });

    //----------Shuriken----------

  this.shuriken = this.physics.add.group();
  this.physics.add.collider(this.shuriken, this.plataformas, (shuriken) => {
    // Incrementar el contador de rebotes
    if (!shuriken.rebotes) {
      shuriken.rebotes = 0; // Inicializar el contador si no existe
    }
    shuriken.rebotes++;
    shuriken.setAngularVelocity(200); // Rotación constante (ajusta el valor según la velocidad deseada)

    // Destruir el shuriken si rebota 3 veces
    if (shuriken.rebotes >= 2) {
      shuriken.destroy();
    }
  });

  function crearShuriken() {
    const randomX = Phaser.Math.Between(50, 750);

    // Crear el shuriken
    const shuriken = this.shuriken
      .create(randomX, 25, "shuriken")
      .setScale(0.1)
      .setBounce(0.4)
      .refreshBody();

      shuriken.rebotes = 0; // Inicializar el contador de rebotes
  }

  crearShuriken.call(this);
  this.time.addEvent({
    delay: 1000, // 1000 ms = 1 segundo
    callback: crearShuriken.bind(this),
    loop: true,
  });

  this.physics.add.overlap(this.player, this.shuriken, (player, shuriken) => {
    this.puntos -= 5; // Descontar puntos al recolectar una shuriken
    shuriken.destroy(); // Destruir la shuriken recolectada
    this.puntosText.setText(`Puntos: ${this.puntos}`); // Actualizar el texto de puntos
  });

    //---------Tiempo----------
    this.tiempo = 30;
    this.timeText = this.add.text(600, 16, `Tiempo: ${this.tiempo}`, {
      fontSize: "32px",
      fill: "#000",
    });

    this.time.addEvent({
      delay: 1000, // 1000 ms = 1 segundo
      callback: () => {
        if (this.tiempo > 0 && !this.gameOver) {
          this.tiempo--;
          this.timeText.setText(`Tiempo: ${this.tiempo}`);
        } else if (this.tiempo <= 0 && !this.gameOver) {
          this.timeGO = true;
          this.timeText.setText(`Time's Up!`);
          this.timeText.setColor("red");
          this.gameOver = true;
          this.scene.start("fin", { puntos: this.puntos, tiempoRestante: this.tiempo, victoria: false });
        }
      },
      callbackScope: this,
      loop: true,
    });

    // Partículas
    const emitter = this.add.particles(-15, 0, "red", {
      speed: 5,
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
    });

    emitter.startFollow(this.player, 0, 0, true);
  }

  update() {
    // update s objects

    //----------Controles----------
    
    if (this.cursors.left.isDown) { 
      console.log("Izquierda");
      this.player.setVelocityX(-160);
  } else if (this.cursors.right.isDown) {
      console.log("Derecha");
      this.player.setVelocityX(160);
  } else {
      this.player.setVelocityX(0);
  }
  

    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
    }
  
  
    
    //----------Game Over----------

    if (this.gameOver) {
      this.player.setVelocity(0, 0); // Detiene al jugador
      this.player.setTint(0xff0000); // Cambia el color del jugador a rojo
      this.physics.pause(); // Pausa la física del juego
      this.time.removeAllEvents(); // Detiene el temporizador de creación de objetos
      this.items.children.iterate((item) => {
        item.setVelocity(0, 0); // Detiene la velocidad de los objetos
      });

      this.gameovertext = this.add.text(100, 250, "Game Over", {
        fontSize: "100px",
        fill: "red",
      });
    }
  }
}