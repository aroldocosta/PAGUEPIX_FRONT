import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transfer-request',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transfer.html',
  styleUrl: './transfer.scss'
})
export class TransferRequest {
  availableBalance = signal(12430.50);
}
