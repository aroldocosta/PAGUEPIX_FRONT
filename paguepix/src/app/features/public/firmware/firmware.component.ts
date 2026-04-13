import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { DeviceService } from '../../../core/services/device.service';
import { CryptoService } from '../../../core/services/crypto.service';
import { ChargeResponse, Payment } from '../../../core/models/payment.model';
import { SealedPaymentRequest, SealedStatusRequest } from '../../../core/models/sealed-payment.model';
import { OnDestroy } from '@angular/core';

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
    selector: 'app-firmware',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './firmware.html',
    styleUrl: './firmware.scss'
})
export class FirmwareComponent implements OnDestroy {
    selectedDuration = signal<DurationOption | null>(null);
    pixKey = signal('');
    paymentLink = signal('');
    paymentType = signal<PaymentType>('PIX');
    currentState = signal<PurchaseState>('IDLE');
    productName = computed(() => {
        const duration = this.selectedDuration();
        return duration ? `${duration.label}` : 'Selecionar Item';
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
                setTimeout(() => this.startStatusPolling(), 500);
            }
        } else {
            this.currentState.set('ERROR');
            this.errorMessage.set('Identificador do dispositivo inválido.');
        }
    }

    private getFallbackDescription(minutes: number): string {
        return 'Ativação de licença/firmware';
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
                            icon: 'settings'
                        }))
                        .sort((a: any, b: any) => a.price - b.price);

                    this.durationOptions = mappedOptions;

                    if (this.durationOptions.length > 0) {
                        this.selectedDuration.set(this.durationOptions[0]);
                    }
                }

                if (this.currentState() === 'VALIDATING') {
                    this.currentState.set('IDLE');
                }
            },
            error: (err) => {
                console.error('Error validating device:', err);
                const backendMessage = err.error?.message;
                this.errorMessage.set(backendMessage || 'Dispositivo não reconhecido ou inativo.');
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

            const duration = this.selectedDuration();
            const deviceId = this.deviceId();
            const deviceToken = deviceId;

            const sealedRequest: SealedPaymentRequest = {
                deviceToken: deviceToken || '',
                productId: duration?.id || 0,
                duration: duration?.minutes || 0,
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

            this.cryptoService.encrypt(sealedRequest, publicKeyPem).then(encryptedPayload => {
                const finalRequest = {
                    payload: encryptedPayload
                };

                this.paymentService.createChargeRsa(finalRequest).subscribe({
                    next: (response: ChargeResponse) => {
                        this.lastChargeResponse.set(response);
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
            this.startStatusPolling();
        } else if (state === 'SUCCESS' || state === 'ERROR') {
            this.reset();
        }
    }

    startStatusPolling() {
        if (this.pollingInterval) return;

        this.pollingStartTime = Date.now();

        this.pollingInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - this.pollingStartTime) / 1000);

            if (elapsedSeconds >= 300) {
                this.stopPolling();
                this.errorMessage.set('O tempo para este pagamento expirou. Por favor, tente novamente.');
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
                        const provider = this.deviceInfo()?.partner?.bankProvider || response.provider;
                        if (provider === 'MERCADO_PAGO') {
                            const modalExists = !!document.querySelector('.mp-mercadopago-checkout-wrapper') ||
                                !!document.querySelector('#mercadopago-checkout');

                            if (!modalExists && this.currentState() === 'READY') {
                                this.currentState.set('PENDING');
                            }
                        }

                        if (response.paid) {
                            this.stopPolling();
                            this.closeMercadoPagoModal();
                            this.currentState.set('SUCCESS');
                        }
                        else if (response.qrCode) {
                            if (this.pixKey() !== response.qrCode) {
                                this.pixKey.set(response.qrCode);
                                this.paymentType.set('PIX');
                                this.currentState.set('PENDING');
                                this.closeMercadoPagoModal();
                            }
                        }
                        else if (response.status === 'rejected' || response.status === 'cancelled') {
                            this.stopPolling();
                            this.closeMercadoPagoModal();
                            this.errorMessage.set('O pagamento não foi autorizado. Por favor, tente novamente.');
                            this.currentState.set('ERROR');
                        }
                    },
                    error: (err) => {
                        console.error('Erro ao consultar status:', err);
                    }
                });
            }).catch(err => {
                console.error('Encryption failed:', err);
                this.stopPolling();
            });
        }, 3000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
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

    copyPixKey() {
        navigator.clipboard.writeText(this.pixKey()).then(() => {
            this.showCopySuccess.set(true);
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
            const script = document.createElement('script');
            script.src = 'https://sdk.mercadopago.com/js/v2';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = (e) => reject(e);
            document.head.appendChild(script);
        });
    }

    private closeMercadoPagoModal() {
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
        document.body.style.overflow = 'auto';
    }

    private async getMpInstance() {
        if (this.mp) return this.mp;
        try {
            await this.loadMercadoPagoSDK();
            const mpGlobal = (window as any).MercadoPago;
            if (typeof mpGlobal !== 'undefined') {
                this.mp = new mpGlobal('APP_USR-04a454cf-9abf-4086-b9e2-3ef546f33a94', {
                    locale: 'pt-BR'
                });
                return this.mp;
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
                    mpInstance.checkout({
                        preference: {
                            id: charge.externalId
                        },
                        autoOpen: true
                    });
                    return;
                } catch (e) {
                    console.error('Error opening MP checkout modal:', e);
                }
            }
        }

        if (link) {
            window.location.href = link;
        } else if (provider === 'MERCADO_PAGO' && charge?.externalId) {
            const manualLink = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${charge.externalId}`;
            window.location.href = manualLink;
        }
    }
}
