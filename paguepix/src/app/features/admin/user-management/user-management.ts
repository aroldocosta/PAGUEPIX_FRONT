import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent, FooterComponent],
    templateUrl: './user-management.html',
    styleUrl: './user-management.scss'
})
export class UserManagement {
    users = signal([
        { name: 'Aroldo Costa', email: 'aroldo@paguepix.com', role: 'Super Admin', active: true, lastLogin: '2 hours ago', department: 'Executive' },
        { name: 'Mariana Silva', email: 'mariana@paguepix.com', role: 'Admin', active: true, lastLogin: 'Yesterday', department: 'Operations' },
        { name: 'Ricardo Dias', email: 'ricardo@paguepix.com', role: 'Viewer', active: false, lastLogin: '3 days ago', department: 'Audit' },
        { name: 'Juliana Mendes', email: 'juliana@paguepix.com', role: 'Admin', active: true, lastLogin: '5 hours ago', department: 'Support' },
        { name: 'Felipe Rocha', email: 'felipe@paguepix.com', role: 'Editor', active: true, lastLogin: 'Today, 09:00', department: 'Marketing' },
    ]);
}
