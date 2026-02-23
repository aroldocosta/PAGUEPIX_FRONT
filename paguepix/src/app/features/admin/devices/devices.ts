import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
    selector: 'app-device-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './devices.html',
    styleUrl: './devices.scss'
})
export class DeviceManagement {
    devices = signal([
        { name: 'POS-Terminal-001', serial: 'SN-7890-X1', partner: 'Loja Central', status: 'Online', lastSync: '2 minutes ago', battery: '85%' },
        { name: 'POS-Terminal-002', serial: 'SN-7890-X2', partner: 'Mercado Silva', status: 'Online', lastSync: '15 minutes ago', battery: '42%' },
        { name: 'Mobile-App-User12', serial: 'ID-APP-442', partner: 'Farmácia Viva', status: 'Offline', lastSync: '3 days ago', battery: 'N/A' },
        { name: 'POS-Terminal-003', serial: 'SN-7890-X3', partner: 'Auto Posto Norte', status: 'Online', lastSync: '5 hours ago', battery: '98%' },
        { name: 'Smart-Reader-05', serial: 'SN-2210-B5', partner: 'Padaria Pão Quente', status: 'Issue', lastSync: 'Today, 08:30', battery: '12%' },
    ]);
}
