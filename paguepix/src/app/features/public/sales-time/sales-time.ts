import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DurationOption {
    minutes: number;
    label: string;
    description: string;
    price: number;
    icon: string;
}

export type PurchaseState = 'IDLE' | 'PROCESSING' | 'READY' | 'SUCCESS' | 'ERROR';
export type PaymentType = 'PIX' | 'LINK';

@Component({
    selector: 'app-sales-time',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sales-time.html',
    styleUrl: './sales-time.scss'
})
export class SalesTimeComponent {
    selectedDuration = signal<DurationOption | null>(null);
    pixKey = signal('00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913PaguePix Inc 6009SAO PAULO62070503***6304ABCD');
    paymentLink = signal('https://link.mercadopago.com.br/paguepix_exemplo');
    paymentType = signal<PaymentType>('PIX');
    currentState = signal<PurchaseState>('IDLE');
    productName = signal('Banho Quente');
    errorMessage = signal('');

    durationOptions: DurationOption[] = [
        { minutes: 1, label: '1 minuto', description: 'Banho ultra-rápido', price: 1.0, icon: 'timer' },
        { minutes: 3, label: '3 minutos', description: 'O mais popular', price: 3.0, icon: 'timer' },
        { minutes: 5, label: '5 minutos', description: 'Banho completo', price: 5.0, icon: 'timer' },
        { minutes: 10, label: '10 minutos', description: 'Banho relaxante', price: 10.0, icon: 'timer' }
    ];

    constructor() {
        this.selectedDuration.set(this.durationOptions[1]); // Default to 3 minutes (index 1)
    }

    selectDuration(option: DurationOption) {
        if (this.currentState() === 'IDLE') {
            this.selectedDuration.set(option);
            this.productName.set(option.label);
        }
    }

    handlePrimaryAction() {
        const state = this.currentState();

        if (state === 'IDLE') {
            this.currentState.set('PROCESSING');
            // Simulate API call to fetch Pix Key or Payment Link
            setTimeout(() => {
                const rand = Math.random();
                if (rand < 0.1) { // 10% chance of immediate error for simulation
                    this.errorMessage.set('Falha na conexão com o provedor de pagamento.');
                    this.currentState.set('ERROR');
                } else {
                    const simulatedType: PaymentType = rand > 0.5 ? 'PIX' : 'LINK';
                    this.paymentType.set(simulatedType);
                    this.currentState.set('READY');
                }
            }, 2000);
        } else if (state === 'READY') {
            if (this.paymentType() === 'PIX') {
                this.copyPixKey();
            } else {
                this.openPaymentLink();
            }

            // Simulate payment verification after a delay
            this.simulatePaymentConfirmation();
        } else if (state === 'SUCCESS' || state === 'ERROR') {
            this.reset();
        }
    }

    simulatePaymentConfirmation() {
        setTimeout(() => {
            const rand = Math.random();
            if (rand > 0.3) {
                this.currentState.set('SUCCESS');
            } else {
                this.errorMessage.set('O pagamento não foi detectado. Tente novamente.');
                this.currentState.set('ERROR');
            }
        }, 3000);
    }

    reset() {
        this.currentState.set('IDLE');
        this.errorMessage.set('');
    }

    copyPixKey() {
        navigator.clipboard.writeText(this.pixKey()).then(() => {
            console.log('Chave Pix copiada!');
        });
    }

    openPaymentLink() {
        window.open(this.paymentLink(), '_blank');
    }
}
