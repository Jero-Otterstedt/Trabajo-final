export class HowToPlay extends Phaser.Scene {
  constructor() {
    super("HowToPlay");
  }

    preload() {
      this.load.image('control', './public/assets/fondo_controles.png');
    this.load.image('Boton', './public/assets/logo-play.png');
    this.load.image('BotonHover', './public/assets/logo-play-seleccionado.png');
  }

    create() {
        // Fondo del juego
    this.add.image(1800 / 2, 750 / 2, "control").setDisplaySize(1800, 750);

  const centerX = this.cameras.main.centerX;
  const centerY = this.cameras.main.centerY;

  // Creamos el botón con la imagen normal
  const playButton = this.add.image(1600, 600, 'Boton').setScale(0.5).setInteractive();

  // Al pasar el mouse por encima → cambiar imagen
  playButton.on('pointerover', () => {
    playButton.setTexture('BotonHover');
  });

  // Al sacar el mouse → volver a la imagen normal
  playButton.on('pointerout', () => {
    playButton.setTexture('Boton');
  });

  // Al hacer click → cambiar de escena
  playButton.on('pointerdown', () => {
   this.scene.start("game");
  });

  // ENTER también inicia
  this.input.keyboard.on('keydown-ENTER', () => {
    this.scene.start("game");
  });
}

}
export default HowToPlay;
