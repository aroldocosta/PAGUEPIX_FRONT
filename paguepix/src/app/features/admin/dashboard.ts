import { Component } from '@angular/core';
import { HomeDashboard } from '../../components/home-dashboard/home-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HomeDashboard],
  template: '<app-home-dashboard></app-home-dashboard>',
})
export class Dashboard { }
