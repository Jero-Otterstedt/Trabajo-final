export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("gameOver");
  }

  init(data) {
    this.finalPuntos = data.puntos || 0;
  }

  preload() {
    this.load.image("fin", "./public/assets/fondo-fin.png");
  }

  create() {
    this.add.image(900, 375, "fin").setDisplaySize(1800, 750);

    this.add.text(800, 250, "¡Juego Terminado!", {
      fontSize: "64px",
      fill: "#00aaff",
      fontFamily: "'Future Glitch'",
    }).setOrigin(0.5);

    this.add.text(800, 350, `Puntaje final: ${this.finalPuntos}`, {
      fontSize: "48px",
      fill: "#00aaff",
      fontFamily: "'Future Glitch'",
    }).setOrigin(0.5);

    this.add.text(800, 450, "Presioná 'R' para reiniciar", {
      fontSize: "32px",
      fill: "#00aaff",
      fontFamily: "'Future Glitch'",
    }).setOrigin(0.5);

    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.input.keyboard.on("keydown-R", () => {
      const musica = this.sound.get("musicaFondo");
      if (musica) {
        musica.stop();
        musica.play();
      }
      this.scene.start("MainMenu"); 
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.scene.start("MainMenu"); // vuelve a la escena principal
    }
  }
}
