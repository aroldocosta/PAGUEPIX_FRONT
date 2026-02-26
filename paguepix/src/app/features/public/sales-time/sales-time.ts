import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { CryptoService } from '../../../core/services/crypto.service';
import { ChargeResponse, Payment } from '../../../core/models/payment.model';
import { SealedPaymentRequest, SealedStatusRequest } from '../../../core/models/sealed-payment.model';
import { OnDestroy } from '@angular/core';

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
export class SalesTimeComponent implements OnDestroy {
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
    lastChargeResponse = signal<ChargeResponse | null>(null);

    private pollingInterval: any = null;
    private pollingStartTime: number = 0;

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

                        this.lastChargeResponse.set(response);

                        // Business Logic: 
                        // 1 - If qrCode is null, it's a payment link
                        // 2 - If qrCode is present, it's a PIX payment
                        if (response.qrCode) {
                            this.paymentType.set('PIX');
                            this.pixKey.set(response.qrCode);
                        } else {
                            this.paymentType.set('LINK');
                            this.paymentLink.set(response.paymentLink);
                        }

                        this.currentState.set('READY');
                    },
                    error: (err) => {
                        console.error('Error creating charge:', err);
                        this.errorMessage.set('Falha na comunicação com o servidor. Tente novamente.');
                        this.currentState.set('ERROR');
                    }
                });
            }).catch(err => {
                console.error('Encryption failed:', err);
                this.errorMessage.set('Falha ao processar segurança da transação.');
                this.currentState.set('ERROR');
            });
        } else if (state === 'READY') {
            if (this.paymentType() === 'PIX') {
                this.copyPixKey();
            } else {
                this.openPaymentLink();
            }

            // Start polling for payment status
            this.startStatusPolling();
        } else if (state === 'SUCCESS' || state === 'ERROR') {
            this.reset();
        }
    }

    startStatusPolling() {
        if (this.pollingInterval) return;

        this.pollingStartTime = Date.now();
        console.log('Iniciando monitoramento do pagamento...');

        this.pollingInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - this.pollingStartTime) / 1000);
            console.log(`Verificando status do pagamento... [${elapsedSeconds}s]`);

            // Check for timeout (2 minutes = 120 seconds)
            if (elapsedSeconds >= 120) {
                this.stopPolling();
                this.errorMessage.set('Ah, o tempo para este pagamento expirou! 🕒 Por favor, volte e gere um novo código Pix para continuar. Estamos aqui se precisar de ajuda!');
                this.currentState.set('ERROR');
                return;
            }

            const charge = this.lastChargeResponse();
            if (!charge) {
                this.stopPolling();
                return;
            }

            const statusRequest: SealedStatusRequest = {
                deviceId: this.deviceId() || '',
                partnerId: this.partnerId() || '',
                externalId: charge.externalId,
                timestamp: new Date().toISOString()
            };

            const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2n4/Bt6wtRWJId7AOVtx
VHDrHxuwnFcP4H6K7I4tpbcEtejVvztwqwJ3zis6J0g7h7han0M24YZoUmpYE7ot
X1TSSErJC6x0XkciVmnpJa3YUkhYBYsAHsQ8jGeZEiqCKbF2XaplppdpilSyuN2W
RHgDgtilv+/9LuVDDp/jlFG+XMs30dPO8RdC9lXPwTfg/r1zqdsH6xNxH1yxgEXr
YMpwSCCBuWr9sPZUI75FF6WSUE0mkQCWzn9awLKzhEbguTCuVIjr+nMFLTDH6sB5
sy6q5O6rDBrDn2QuyXV03HOZ7BIFzvpiUmE5gKtyu11Nvv882hmIWRA4LzsT4rPc
twIDAQAB
-----END PUBLIC KEY-----`;

            this.cryptoService.encrypt(statusRequest, publicKeyPem).then(encryptedPayload => {
                this.paymentService.getPaymentStatus({ payload: encryptedPayload }).subscribe({
                    next: (response) => {
                        console.log('Status do pagamento recebido:', response.state);
                        if (response.state === 'PAID' || response.state === 'SUCCESS') {
                            this.stopPolling();
                            this.currentState.set('SUCCESS');
                        } else if (response.state === 'ERROR' || response.state === 'REJECTED') {
                            this.stopPolling();
                            this.errorMessage.set('O pagamento não foi autorizado. Por favor, tente novamente ou use outra forma de pagamento.');
                            this.currentState.set('ERROR');
                        }
                    },
                    error: (err) => {
                        console.error('Erro ao consultar status:', err);
                    }
                });
            }).catch(err => {
                console.error('Falha na criptografia do status:', err);
                this.stopPolling();
            });
        }, 1000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('Monitoramento de pagamento interrompido.');
        }
    }

    ngOnDestroy() {
        this.stopPolling();
    }

    reset() {
        this.stopPolling();
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
