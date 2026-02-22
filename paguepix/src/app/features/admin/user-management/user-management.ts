import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-management.html',
    styleUrl: './user-management.scss'
})
export class UserManagement {
    users = signal([
        { name: 'Aroldo Costa', email: 'aroldo@paguepix.com', role: 'Super Admin', active: true, lastLogin: '2 hours ago' },
        { name: 'Mariana Silva', email: 'mariana@paguepix.com', role: 'Admin', active: true, lastLogin: 'Yesterday' },
        { name: 'Ricardo Dias', email: 'ricardo@paguepix.com', role: 'Viewer', active: false, lastLogin: '3 days ago' },
    ]);
}
