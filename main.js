
import GameOverScene from "./scenes/GameOverScene.js";
import Game from "./scenes/Game.js";
import MainMenu from "./scenes/MainMenu.js";
import { HowToPlay } from './scenes/HowToPlay.js';


// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 1800,
  height: 750,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 600,
    },
    max: {
      width: 1600,
      height: 1200,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 400 },
      debug: false, // Set to true to see physics debug info
    },
  },
  // List of scenes to load
  // Only the first scene will be shown
  // Remember to import the scene before adding it to the list
  scene: [MainMenu, HowToPlay, Game, GameOverScene],
};

// Create a new Phaser game instance
window.game = new Phaser.Game(config);
