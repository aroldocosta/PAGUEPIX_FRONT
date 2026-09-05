import { Component } from '@angular/core';
import { SalesComponent } from '../sales/sales.component';

@Component({
    selector: 'app-vac',
    standalone: true,
    imports: [SalesComponent],
    template: `<app-sales forcedType="VACUUM"></app-sales>`
})
export class VacComponent {}
