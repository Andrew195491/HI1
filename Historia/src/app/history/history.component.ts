import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-history',
  imports: [ FormsModule, CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})

export class HistoryComponent {
  currentScene: string = ''; // Escena inicial
  dudar: boolean = false;
  preguntar: boolean = false; 
  inputName: string = "";
  contador: number = 0;
  escenasSiguientes: string[] = ['scene7-1-1', 'scene7-1-2', 'scene7-1-3'];
  private apiUrl = 'http://localhost:4200/save-scene';
  private apiUrllast = 'http://localhost:4200/last-scene';

  constructor(private http: HttpClient) {
    this.saveScene(this.currentScene); // Guardar la escena inicial
  }

  ngOnInit() {
    this.http.get<{ scene: string }>(this.apiUrllast)
      .subscribe({
        next: (data) => {
          console.log('Última escena obtenida:', data);
          this.currentScene = data.scene || 'scene1';
        }
      });
    }

  // Método para cambiar de escena
  nextScene(scene: string) {
    this.currentScene = scene;
    this.saveScene(scene);
  }

  preguntarYAvanzar() {
    this.preguntar = true;
    this.nextScene('scene5-2');
  }

  checkName() {
    if (this.inputName.toLowerCase().trim() === 'el hijo de mi madre') {
      this.currentScene = 'scene10.5';
    } else {
        if(this.contador == 0){
          this.nextScene('scene7-1-1');
        }else if(this.contador == 1){
          this.nextScene('scene7-1-2');
        }
        else{
          this.nextScene('scene7-1-3');
        }
      this.contador++;
    }
  }

  dudarYAvanzar() {
    this.dudar = true;
    this.nextScene('scene5-3');
  }
  
  trackByFn(index: number, item: string): string {
    return item;
  }  

  saveScene(scene: string) {
    this.http.post(this.apiUrl, { scene }).subscribe(
      response => console.log('✅ Escena guardada:', response),
      error => console.error('❌ Error al guardar la escena:', error)
    );
  }
  
}
