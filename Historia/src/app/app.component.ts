import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DiaryComponent } from './diary/diary.component';
import { SummaryComponent } from './summary/summary.component';
import { HistoryComponent } from './history/history.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DiaryComponent, SummaryComponent, HistoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Historia';
  showDiary = false;
  showSummary = false;
  isMenuOpen = false;

}
