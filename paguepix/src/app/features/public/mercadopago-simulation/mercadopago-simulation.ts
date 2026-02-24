import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-mercadopago-simulation',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mercadopago-simulation.html',
    styleUrls: ['./mercadopago-simulation.scss']
})
export class MercadoPagoSimulationComponent implements OnInit {

    ngOnInit() {
        setTimeout(() => {
            const isSuccess = Math.random() > 0.5;
            const result = isSuccess ? 'success' : 'error';
            // Redirect back to the sales page with the result
            window.location.href = `/sales?result=${result}`;
        }, 3000);
    }
}
