import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { CryptoService } from '../../../core/services/crypto.service';
import { ChargeResponse, Payment } from '../../../core/models/payment.model';
import { SealedPaymentRequest } from '../../../core/models/sealed-payment.model';

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
    paymentLink = signal('/paguepix_exemplo');
    paymentType = signal<PaymentType>('PIX');
    currentState = signal<PurchaseState>('IDLE');
    productName = signal('Banho Quente');
    errorMessage = signal('');
    showCopySuccess = signal(false);

    deviceId = signal<string | null>(null);
    partnerId = signal<string | null>(null);

    private paymentService = inject(PaymentService);
    private cryptoService = inject(CryptoService);

    durationOptions: DurationOption[] = [
        { minutes: 1, label: '1 minuto', description: 'Banho ultra-rápido', price: 1.0, icon: 'timer' },
        { minutes: 3, label: '3 minutos', description: 'O mais popular', price: 3.0, icon: 'timer' },
        { minutes: 5, label: '5 minutos', description: 'Banho completo', price: 5.0, icon: 'timer' },
        { minutes: 10, label: '10 minutos', description: 'Banho relaxante', price: 10.0, icon: 'timer' }
    ];

    constructor() {
        this.selectedDuration.set(this.durationOptions[1]); // Default to 3 minutes (index 1)

        // Handle result from simulation redirect
        const route = inject(ActivatedRoute);
        const params = route.snapshot.queryParamMap;

        const result = params.get('result');
        if (result === 'success') {
            this.currentState.set('SUCCESS');
        } else if (result === 'error') {
            this.errorMessage.set('O pagamento não foi autorizado pelo Mercado Pago. Tente novamente.');
            this.currentState.set('ERROR');
        }

        // Capture device and partner IDs from URL token (Suggestion 5 refined)
        const pathParams = route.snapshot.paramMap;
        const queryParams = route.snapshot.queryParamMap;

        // Try path param first, then query param
        const token = pathParams.get('token') || queryParams.get('token');

        console.log("============================");
        console.log("Token from URL:", token);
        console.log("Token length:", token?.length);
        console.log("============================");

        if (token && token.length >= 36) {
            // TSID Numeric representation is 18 digits each
            this.deviceId.set(token.substring(0, 18));
            this.partnerId.set(token.substring(18, 36));

            console.log("Parsed from Token:");
            console.log("Device ID:", this.deviceId());
            console.log("Partner ID:", this.partnerId());
            console.log("============================");
        } else {
            // Fallback for individual query params
            const dId = queryParams.get('deviceId');
            const pId = queryParams.get('partnerId');

            if (dId || pId) {
                this.deviceId.set(dId);
                this.partnerId.set(pId);
                console.log("Parsed from individual params:");
                console.log("Device ID:", this.deviceId());
                console.log("Partner ID:", this.partnerId());
            } else {
                console.log("No identification tokens found in URL");
            }
            console.log("============================");
        }
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

            // Call backend createCharge
            const duration = this.selectedDuration();
            const deviceId = this.deviceId();
            const partnerId = this.partnerId();

            // Suggestion 5: form "HASH_UNICO" (deviceToken)
            const deviceToken = deviceId && partnerId ? `${deviceId}${partnerId}` : null;

            alert(deviceToken);

            // Secure Sealed Envelope Flow
            const sealedRequest: SealedPaymentRequest = {
                deviceToken: deviceToken || '',
                duration: duration?.minutes || 0,
                timestamp: new Date().toISOString()
            };

            // Using a real Public Key
            const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2n4/Bt6wtRWJId7AOVtx
VHDrHxuwnFcP4H6K7I4tpbcEtejVvztwqwJ3zis6J0g7h7han0M24YZoUmpYE7ot
X1TSSErJC6x0XkciVmnpJa3YUkhYBYsAHsQ8jGeZEiqCKbF2XaplppdpilSyuN2W
RHgDgtilv+/9LuVDDp/jlFG+XMs30dPO8RdC9lXPwTfg/r1zqdsH6xNxH1yxgEXr
YMpwSCCBuWr9sPZUI75FF6WSUE0mkQCWzn9awLKzhEbguTCuVIjr+nMFLTDH6sB5
sy6q5O6rDBrDn2QuyXV03HOZ7BIFzvpiUmE5gKtyu11Nvv882hmIWRA4LzsT4rPc
twIDAQAB
-----END PUBLIC KEY-----`;

            this.cryptoService.encrypt(sealedRequest, publicKeyPem).then(encryptedPayload => {
                console.log('Encrypted Payload:', encryptedPayload);

                // Construct the final request for the backend
                // The backend will receive the encrypted string and decrypt it to get the details
                const finalRequest = {
                    payload: encryptedPayload
                };

                this.paymentService.createCharge(finalRequest).subscribe({
                    next: (response: ChargeResponse) => {
                        console.log('ChargeResponse received:', response);
                    },
                    error: (err) => {
                        console.error('Error creating charge:', err);
                    }
                });
            }).catch(err => {
                console.error('Encryption failed:', err);
                this.errorMessage.set('Falha ao processar segurança da transação.');
                this.currentState.set('ERROR');
            });

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

            // Simulate payment verification after a delay (only for PIX)
            if (this.paymentType() === 'PIX') {
                this.simulatePaymentConfirmation();
            }
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
            // alert('Chave Pix copiada para a área de transferência!');
            this.showCopySuccess.set(true);
            setTimeout(() => this.showCopySuccess.set(false), 3000);
        });
    }

    openPaymentLink() {
        window.open(this.paymentLink(), '_blank');
    }
}
