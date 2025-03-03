import { Component } from '@angular/core';
import { DiaryComponent } from './diary/diary.component';
import { SummaryComponent } from './summary/summary.component';
import { HistoryComponent } from './history/history.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [DiaryComponent, SummaryComponent, HistoryComponent, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Historia';
  showDiary = false;
  showSummary = false;
  isMenuOpen = false;
}
