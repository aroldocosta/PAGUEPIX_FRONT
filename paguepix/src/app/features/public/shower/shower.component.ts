import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { DeviceService } from '../../../core/services/device.service';
import { CryptoService } from '../../../core/services/crypto.service';
import { ChargeResponse, Payment } from '../../../core/models/payment.model';
import { SealedPaymentRequest, SealedStatusRequest } from '../../../core/models/sealed-payment.model';
import { OnDestroy } from '@angular/core';
import { environment } from '../../../../environments/environment';

// MercadoPago type declaration
declare var MercadoPago: any;

interface DurationOption {
    id: number;
    minutes: number;
    label: string;
    description: string;
    price: number;
    icon: string;
}

export type PurchaseState = 'VALIDATING' | 'IDLE' | 'PROCESSING' | 'READY' | 'PENDING' | 'SUCCESS' | 'ERROR';
export type PaymentType = 'PIX' | 'LINK';

@Component({
    selector: 'app-shower',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './shower.html',
    styleUrl: './shower.scss'
})
export class ShowerComponent implements OnDestroy {
    selectedDuration = signal<DurationOption | null>(null);
    pixKey = signal('00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913PaguePix Inc 6009SAO PAULO62070503***6304ABCD');
    paymentLink = signal('');
    paymentType = signal<PaymentType>('PIX');
    currentState = signal<PurchaseState>('IDLE');
    productName = computed(() => {
        const duration = this.selectedDuration();
        return duration ? `Tempo de Banho: ${duration.minutes}min` : 'Tempo de Banho';
    });
    errorMessage = signal('');
    showCopySuccess = signal(false);

    deviceId = signal<string | null>(null);
    deviceInfo = signal<any | null>(null);
    lastChargeResponse = signal<ChargeResponse | null>(null);

    private pollingInterval: any = null;
    private pollingStartTime: number = 0;
    private mp: any;

    private paymentService = inject(PaymentService);
    private deviceService = inject(DeviceService);
    private cryptoService = inject(CryptoService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    durationOptions: DurationOption[] = [];

    constructor() {
        this.route.paramMap.subscribe(params => {
            const token = params.get('token');
            if (token) {
                this.handleInitialization(token, this.route.snapshot.queryParamMap);
            } else {
                const dId = this.route.snapshot.queryParamMap.get('deviceId');
                if (dId) {
                    this.handleInitialization(dId, this.route.snapshot.queryParamMap);
                } else {
                    this.currentState.set('ERROR');
                    this.errorMessage.set('Identificador do dispositivo não fornecido.');
                }
            }
        });
    }

    private handleInitialization(token: string, queryParams: any) {
        if (token && token.length >= 10) {
            this.deviceId.set(token);
            this.validateDevice(token);

            // Check if returning from a payment
            const paymentId = queryParams.get('payment_id');
            const status = queryParams.get('status');
            const preferenceId = queryParams.get('preference_id');

            if (paymentId || preferenceId) {
                // Initialize state to check status securely via polling
                // We don't trust the 'status=approved' param from the URL
                this.currentState.set('PENDING');
                this.lastChargeResponse.set({
                    externalId: paymentId || preferenceId || '',
                    paymentLink: '',
                    qrCode: null,
                    status: status || 'pending',
                    externalReference: queryParams.get('external_reference') || ''
                });

                this.closeMercadoPagoModal();
                setTimeout(() => this.startStatusPolling(true), 500);
            }
        } else {
            this.currentState.set('ERROR');
            this.errorMessage.set('Identificador do dispositivo inválido.');
        }
    }

    private getFallbackDescription(minutes: number): string {
        switch (minutes) {
            case 1: return 'Banho ultra-rápido';
            case 3: return 'O mais popular';
            case 5: return 'Banho completo';
            case 10: return 'Para toda a familia';
            default: return `Tempo de banho`;
        }
    }

    private validateDevice(token: string) {
        this.currentState.set('VALIDATING');
        this.deviceService.getInfoByToken(token).subscribe({
            next: (info) => {
                this.deviceInfo.set(info);

                if (info.productList && info.productList.length > 0) {
                    const mappedOptions = info.productList
                        .filter((p: any) => p.active !== false)
                        .map((p: any) => ({
                            id: p.id,
                            minutes: p.duration,
                            label: p.name,
                            description: p.subtitle || this.getFallbackDescription(p.duration),
                            price: p.price,
                            icon: 'timer'
                        }))
                        .sort((a: any, b: any) => a.price - b.price);

                    this.durationOptions = mappedOptions;

                    if (this.durationOptions.length > 0) {
                        this.selectedDuration.set(this.durationOptions[0]);
                    }
                }

                // If we were validating and everything is fine, go to IDLE
                if (this.currentState() === 'VALIDATING') {
                    this.currentState.set('IDLE');
                }
            },
            error: (err) => {
                console.error('Error validating device:', err);
                const backendMessage = err.error?.message;
                this.errorMessage.set(backendMessage || 'Dispositivo não reconhecido ou inativo. Por favor, leia novamente o QR Code.');
                this.currentState.set('ERROR');
            }
        });
    }

    selectDuration(option: DurationOption) {
        if (this.currentState() === 'IDLE') {
            this.selectedDuration.set(option);
        }
    }

    handlePrimaryAction() {
        const state = this.currentState();

        if (state === 'IDLE') {
            this.currentState.set('PROCESSING');

            // Call backend createCharge
            const duration = this.selectedDuration();
            const deviceId = this.deviceId();

            // Suggestion 5: form "HASH_UNICO" (deviceToken)
            const deviceToken = deviceId;

            // Secure Sealed Envelope Flow
            const sealedRequest: SealedPaymentRequest = {
                deviceToken: deviceToken || '',
                productId: duration?.id || 0,
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

                // Construct the final request for the backend
                // The backend will receive the encrypted string and decrypt it to get the details
                const finalRequest = {
                    payload: encryptedPayload
                };

                this.paymentService.createChargeRsa(finalRequest).subscribe({
                    next: (response: ChargeResponse) => {

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
                        const backendMessage = err.error?.message;
                        this.errorMessage.set(backendMessage || 'Falha na comunicação com o servidor. Tente novamente.');
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

    startStatusPolling(immediate: boolean = false) {
        if (this.pollingInterval) return;

        console.log('Starting status polling...');

        this.pollingStartTime = Date.now();

        const pollAction = () => {
            const elapsedSeconds = Math.floor((Date.now() - this.pollingStartTime) / 1000);

            console.log('Elapsed seconds:', elapsedSeconds);

            // Check for timeout (5 minutes = 300 seconds)
            if (elapsedSeconds >= 300) {
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
                this.paymentService.getPaymentStatusRsa({ payload: encryptedPayload }).subscribe({
                    next: (response) => {
                        // If Mercado Pago, check if modal was closed manually by user (element removed from DOM)
                        const provider = this.deviceInfo()?.partner?.bankProvider || response.provider;
                        if (provider === 'MERCADO_PAGO') {
                            const modalExists = !!document.querySelector('.mp-mercadopago-checkout-wrapper') ||
                                !!document.querySelector('#mercadopago-checkout');

                            // If we were READY (modal open) and now it's gone, move to PENDING
                            if (!modalExists && this.currentState() === 'READY') {
                                console.log('Modal closed manually or by SDK - moving to PENDING');
                                this.currentState.set('PENDING');
                            }
                        }

                        // Check for success using 'paid' boolean flag from backend ChargeStatus
                        if (response.paid) {
                            this.stopPolling();
                            this.closeMercadoPagoModal();
                            this.currentState.set('SUCCESS');
                        }
                        // If pending but has QR Code (user selected Pix in modal OR it's a direct charge)
                        else if (response.qrCode) {
                            if (this.pixKey() !== response.qrCode) {
                                console.log('Pix QR Code detected via polling - Closing modal and showing PENDING');
                                this.pixKey.set(response.qrCode);
                                this.paymentType.set('PIX');
                                this.currentState.set('PENDING');
                                this.closeMercadoPagoModal();
                            }
                            if (this.pollingInterval) {
                                this.pollingInterval = setTimeout(pollAction, 1500);
                            }
                        }
                        // Check for specific rejection/failure states in 'status'
                        else if (response.status === 'rejected' || response.status === 'cancelled') {
                            this.stopPolling();
                            this.closeMercadoPagoModal();
                            this.errorMessage.set('O pagamento não foi autorizado. Por favor, tente novamente ou use outra forma de pagamento.');
                            this.currentState.set('ERROR');
                        }
                        else {
                            if (this.pollingInterval) {
                                this.pollingInterval = setTimeout(pollAction, 1500);
                            }
                        }
                    },
                    error: (err) => {
                        console.error('Erro ao consultar status:', err);
                        if (this.pollingInterval) {
                            this.pollingInterval = setTimeout(pollAction, 2000);
                        }
                    }
                });
            }).catch(err => {
                console.error('Falha na criptografia do status:', err);
                this.stopPolling();
            });
        };

        this.pollingInterval = setTimeout(pollAction, immediate ? 0 : 5000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearTimeout(this.pollingInterval);
            this.pollingInterval = null;
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

    private getBaseApiUrl(): string {
        if (environment.production) {
            return 'https://api.paguepix.oficinabr.com';
        }

        // Fallback/Dynamic detection if production flag is not enough
        const origin = window.location.origin;
        if (origin.includes('paguepix.oficinabr.com')) {
            return 'https://api.paguepix.oficinabr.com';
        }

        return environment.apiUrl; // Default to localhost:8083 in dev
    }

    finishAndReturn() {
        this.stopPolling();
        const device = this.deviceInfo();

        if (device && device.id) {
            const baseUrl = this.getBaseApiUrl();
            window.location.href = `${baseUrl}/devices/qr/${device.id}`;
        } else {
            this.reset();
        }
    }

    copyPixKey() {
        navigator.clipboard.writeText(this.pixKey()).then(() => {
            this.showCopySuccess.set(true);
            // Close the modal upon copying the Pix key requested by user
            this.closeMercadoPagoModal();
            setTimeout(() => this.showCopySuccess.set(false), 3000);
        });
    }

    private loadMercadoPagoSDK(): Promise<void> {
        return new Promise((resolve, reject) => {
            if ((window as any).MercadoPago) {
                resolve();
                return;
            }
            console.log('Loading Mercado Pago SDK dynamically...');
            const script = document.createElement('script');
            script.src = 'https://sdk.mercadopago.com/js/v2';
            script.async = true;
            script.onload = () => {
                console.log('Mercado Pago SDK loaded successfully');
                resolve();
            };
            script.onerror = (e) => {
                console.error('Failed to load Mercado Pago SDK', e);
                reject(e);
            };
            document.head.appendChild(script);
        });
    }

    // New method to force close Mercado Pago Modal/Overlay
    private closeMercadoPagoModal() {
        console.log('closeMercadoPagoModal called - Cleaning up DOM');
        const selectors = [
            '.mp-checkout-modal',
            '.mp-checkout-iframe-container',
            '#mp-checkout-container',
            '.mercadopago-checkout-iframe',
            '.mp-mercadopago-checkout-wrapper',
            '#mercadopago-checkout',
            'iframe[src*="mercadopago"]',
            'div[class*="mercadopago"]',
            'div[id*="mercadopago"]'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Also ensure body scrolling is restored if the SDK blocked it
        document.body.style.overflow = 'auto';
    }

    private async getMpInstance() {
        if (this.mp) return this.mp;
        try {
            await this.loadMercadoPagoSDK();
            const mpGlobal = (window as any).MercadoPago;
            if (typeof mpGlobal !== 'undefined') {
                console.log('Initializing MercadoPago with Public Key');
                this.mp = new mpGlobal('APP_USR-04a454cf-9abf-4086-b9e2-3ef546f33a94', {
                    locale: 'pt-BR'
                });
                return this.mp;
            } else {
                console.warn('MercadoPago global object not found after loading script');
            }
        } catch (e) {
            console.error('MercadoPago SDK initialization failed:', e);
        }
        return null;
    }

    async openPaymentLink() {
        const charge = this.lastChargeResponse();
        const link = this.paymentLink();
        const provider = this.deviceInfo()?.partner?.bankProvider || charge?.provider;

        if (provider === 'MERCADO_PAGO') {
            const mpInstance = await this.getMpInstance();
            if (mpInstance && charge && charge.externalId) {
                try {
                    console.log('Attempting to open MP Checkout Pro Modal...');
                    mpInstance.checkout({
                        preference: {
                            id: charge.externalId
                        },
                        autoOpen: true
                    });

                    console.log('MP instance.checkout called with autoOpen: true');
                    return;
                } catch (e) {
                    console.error('Error opening MP checkout modal:', e);
                }
            }
        }

        // For PAGARME or other providers, or if MP modal fails, use direct redirection
        if (link) {
            window.location.href = link;
        } else if (provider === 'MERCADO_PAGO' && charge?.externalId) {
            // Final Fallback for Mercado Pago
            const manualLink = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${charge.externalId}`;
            window.location.href = manualLink;
        } else {
            console.error('No payment link available for redirection');
        }
    }
}
