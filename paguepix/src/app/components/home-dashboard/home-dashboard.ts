import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboard {
  private authService = inject(AuthService);
  userName = signal('Aroldo Costa (Admin)');
  availableBalance = signal(125430.0);

  logout() {
    this.authService.logout();
  }
}
