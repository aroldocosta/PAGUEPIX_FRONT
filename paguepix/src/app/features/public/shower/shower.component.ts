import { Component } from '@angular/core';
import { SalesComponent } from '../sales/sales.component';

@Component({
    selector: 'app-shower',
    standalone: true,
    imports: [SalesComponent],
    template: `<app-sales forcedType="SHOWER"></app-sales>`
})
export class ShowerComponent {}
