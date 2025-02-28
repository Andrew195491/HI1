import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-history',
  imports: [ FormsModule, CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class HistoryComponent {
  currentScene: string = ''; // Escena inicial
  selectedButton: string = '';
  narrative: string = 'Era una vez...';
  dudar: boolean = false;
  preguntar: boolean = false; 
  inputName: string = "";
  contador: number = 0;
  escenasSiguientes: string[] = ['scene7-1-1', 'scene7-1-2', 'scene7-1-3'];
  private apiUrl = 'http://localhost:4200/save-scene';
  private apiUrllast = 'http://localhost:4200/last-scene';
  private summaryApiUrl = 'http://localhost:4000/save-summary';

    
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
  nextScene(scene: string, event?: Event) {
    this.currentScene = scene;
    this.saveScene(scene);

    const historiaElemento = document.querySelector('.story-text') as HTMLElement;
    const textoHistoria = historiaElemento ? historiaElemento.innerText.trim() : "No se pudo obtener la historia.";

    let eleccion = "Elección desconocida";
    if (event) {
      const botonClicado = event.target as HTMLElement;
      eleccion = botonClicado.innerText.trim();
    }

    console.log("📖 Historia detectada:", textoHistoria);
    console.log("🎭 Opción seleccionada:", eleccion);

    const textoFinal = `${textoHistoria}\n- \t${eleccion}\n\n`;

    // 📝 Guardar la historia en el resumen si no está vacía
    this.guardarResumen(textoFinal);
  }

  guardarResumen(texto: string): void {
    if (!texto.trim()) {
      console.warn("❌ No se guardó porque el texto está vacío.");
      return;
    }

    this.http.post(this.summaryApiUrl, { text: texto }).subscribe({
      next: () => console.log("✅ Resumen guardado en summary.txt"),
      error: (err) => console.error("❌ Error al guardar el resumen:", err)
    });
  }

  preguntarYAvanzar(event: Event) {
    this.preguntar = true;
    this.nextScene('scene5-2', event);
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

  dudarYAvanzar(event: Event) {
    this.dudar = true;
    this.nextScene('scene5-3', event);
  }
  
  trackByFn(index: number, item: string): string {
    return item;
  }

  saveScene(scene: string) {
    if (!scene || scene.trim() === '') {
      console.warn('❌ No se guardó porque la escena está vacía.');
      return;
    }
  
    this.http.post(this.apiUrl, { scene }).subscribe(
      response => console.log('✅ Escena guardada:', response),
      error => console.error('❌ Error al guardar la escena:', error)
    );
  }
}
