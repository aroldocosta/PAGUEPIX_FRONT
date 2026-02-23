import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-transfer-request',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
  templateUrl: './transfer.html',
  styleUrl: './transfer.scss'
})
export class TransferRequest {
  availableBalance = signal(12430.50);
}
