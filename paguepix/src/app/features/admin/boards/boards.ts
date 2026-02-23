import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
    selector: 'app-board-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './boards.html',
    styleUrl: './boards.scss'
})
export class BoardManagement {
    boards = signal([
        { model: 'ESP32-DevKit', serial: 'EXP-9921-A', firmware: 'v2.4.1', status: 'Active', uptime: '12 days', storage: '85%' },
        { model: 'ESP32-WROOM', serial: 'EXP-9921-B', firmware: 'v2.4.0', status: 'Active', uptime: '4 hours', storage: '92%' },
        { model: 'STM32-H7', serial: 'STM-4402-X', firmware: 'v1.0.5', status: 'Maintenance', uptime: '0s', storage: '100%' },
        { model: 'ESP32-S3', serial: 'EXP-9950-C', firmware: 'v2.5.0-beta', status: 'Active', uptime: '45 days', storage: '40%' },
        { model: 'ESP32-DevKit', serial: 'EXP-9921-D', firmware: 'v2.4.1', status: 'Offline', uptime: 'N/A', storage: 'N/A' },
    ]);
}
