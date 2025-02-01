import { Component } from '@angular/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  currentScene: string = 'scene1'; // Escena inicial
  dudar: boolean = false;
  preguntar: boolean = false;
  availableNames: string[] = ['Tomás', 'Juan', 'Pedro', 'Rodrigo', 'Andrés'];
  contador: number = 0;
  escenasSiguientes: string[] = ['scene7-1-1', 'scene7-1-2', 'scene7-1-3'];

  // Método para cambiar de escena
  nextScene(scene: string) {
    this.currentScene = scene;
  }

  preguntarYAvanzar() {
    this.preguntar = true;
    this.nextScene('scene5-2');
  }

  selectName(selectedName: string) {
    // Eliminar el nombre seleccionado de la lista
    this.availableNames = this.availableNames.filter(name => name !== selectedName);

    // Avanzar a la siguiente escena según el contador
    if (this.contador < this.escenasSiguientes.length) {
      this.nextScene(this.escenasSiguientes[this.contador]);
    }

    this.contador++;
  }

  dudarYAvanzar() {
    this.dudar = true;
    this.nextScene('scene5-3');
  }
  trackByFn(index: number, item: string): string {
    return item;
  }  
}
