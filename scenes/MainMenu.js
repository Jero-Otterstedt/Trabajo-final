export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  preload() {
    this.load.image("sky", "./public/assets/Fondo_menu.png");
    this.load.image("btnPlay", "./public/assets/logo-play.png");
    this.load.image("btnPlay_hover", "./public/assets/logo-play-seleccionado.png");
    this.load.audio("musicaFondo", "./public/assets/musica.mp3"); 
  }

  create() {
    // Fondo del juego
    this.add.image(1800 / 2, 750 / 2, "sky").setDisplaySize(1800, 750);

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.playButton = this.add.image(centerX, 500, "btnPlay").setScale(0.5).setInteractive();

    this.playButton.on("pointerover", () => {
      this.playButton.setTexture("btnPlay_hover");
    });

    this.playButton.on("pointerout", () => {
      this.playButton.setTexture("btnPlay");
    });

    this.playButton.on("pointerdown", () => {
      this.scene.start("HowToPlay");
    });

    this.input.keyboard.on("keydown-ENTER", () => {
      this.scene.start("HowToPlay");
    });

    if (!this.sound.get("musicaFondo")) {
      this.musica = this.sound.add("musicaFondo", { loop: true, volume: 0.5 });
      this.musica.play();
    } else {
      this.musica = this.sound.get("musicaFondo");
      if (!this.musica.isPlaying) this.musica.play();
    }
    this.musica.setLoop(true);
  }
}
