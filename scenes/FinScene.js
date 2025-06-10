export default class FinScene extends Phaser.Scene {
    constructor() {
      super("fin");
    }
  
    init(data) {
      // Recibimos los datos de la escena anterior (puntos, tiempoRestante, victoria)
      this.puntos = data.puntos;
      this.tiempoRestante = data.tiempoRestante;
      this.victoria = data.victoria;
    }
  
    preload() {
      this.load.image("sky", "./public/assets/FondoMenu.jpg");
    }
  
    create() {
      // Fondo
      this.add.image(400, 300, "sky");

        // Obtener dimensiones de la cámara
  const { width, height } = this.cameras.main;
  
      // Mostrar mensaje de victoria o game over
  let mensaje = this.victoria ? "¡Victoria!" : "Game Over";
  let colorMensaje = this.victoria ? "green" : "red";

  this.add.text(width / 2, height / 2 - 100, mensaje, {
    fontSize: "64px",
    fill: colorMensaje,
  }).setOrigin(0.5); // Centrar el texto

  // Mostrar puntos y tiempo restante
  this.add.text(width / 2, height / 2, `Puntos: ${this.puntos}`, {
    fontSize: "32px",
    fill: "#000",
  }).setOrigin(0.5); // Centrar el texto

  this.add.text(width / 2, height / 2 + 50, `Tiempo Restante: ${this.tiempoRestante}s`, {
    fontSize: "32px",
    fill: "#000",
  }).setOrigin(0.5); // Centrar el texto

  // Mostrar opción de reiniciar
  this.add.text(width / 2, height / 2 + 150, "Presiona 'R' para reiniciar", {
    fontSize: "32px",
    fill: "#000",
  }).setOrigin(0.5); // Centrar el texto

  // Controlar la tecla 'R' para reiniciar
  this.input.keyboard.on("keydown-R", () => {
    this.scene.start("hello-world");
  });
}
}