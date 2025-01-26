import { Component } from '@angular/core';

@Component({
  selector: 'app-history',
  imports: [],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {
  currentScene: string = 'scene1'; // Escena inicial

  // Método para cambiar de escena
  nextScene(scene: string) {
    this.currentScene = scene;
  }
}
