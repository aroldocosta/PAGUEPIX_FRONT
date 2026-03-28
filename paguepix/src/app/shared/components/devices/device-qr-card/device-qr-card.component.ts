import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxKjuaComponent } from 'ngx-kjua';

@Component({
    selector: 'app-device-qr-card',
    standalone: true,
    imports: [CommonModule, NgxKjuaComponent],
    templateUrl: './device-qr-card.component.html',
    styles: [`
        :host { display: block; }
    `]
})
export class DeviceQrCardComponent {
    @Input({ required: true }) qrUrl!: string;
    @Input({ required: true }) name!: string;
    @Input({ required: true }) model!: string;
    @Input({ required: true }) id!: string;
    @Input() showTip: boolean = true;

    showTipModal = false;

    toggleTipModal() {
        this.showTipModal = !this.showTipModal;
    }

    printQr() {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const qrElement = document.querySelector('app-device-qr-card ngx-kjua svg');
        if (!qrElement) {
            alert('Erro ao gerar código para impressão.');
            return;
        }

        const qrHtml = qrElement.outerHTML;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Impressão QR Code - ${this.name}</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                        .container { text-align: center; border: 2px dashed #ccc; padding: 20px; border-radius: 10px; }
                        svg { width: 250px; height: 250px; }
                        h2 { margin-top: 15px; color: #333; }
                        p { color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        ${qrHtml}
                        <h2>${this.name}</h2>
                        <p>ID: ${this.id}</p>
                        <p>PaguePix Payments</p>
                    </div>
                    <script>
                        setTimeout(() => { window.print(); window.close(); }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
}
