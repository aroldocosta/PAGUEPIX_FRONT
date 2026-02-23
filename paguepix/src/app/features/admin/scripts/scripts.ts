import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
    selector: 'app-scripts-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './scripts.html',
    styleUrl: './scripts.scss'
})
export class ScriptsManagement {
    scripts = signal([
        { name: 'Initial-Setup.sh', version: 'v1.2.0', type: 'Bash', lastRun: '2 hours ago', status: 'Stable' },
        { name: 'Update-Firmware.py', version: 'v2.0.1', type: 'Python', lastRun: 'Yesterday', status: 'Beta' },
        { name: 'Network-Config.yaml', version: 'v1.0.0', type: 'Config', lastRun: '5 days ago', status: 'Deprecated' },
        { name: 'Clear-Logs.sh', version: 'v0.9.5', type: 'Bash', lastRun: 'Today, 10:30', status: 'Stable' },
        { name: 'Health-Check.js', version: 'v1.1.2', type: 'NodeJS', lastRun: '1 hour ago', status: 'Stable' },
    ]);
}
