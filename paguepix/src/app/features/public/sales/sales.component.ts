import { Component, signal, inject, computed, HostListener, effect, Input, OnInit, OnDestroy, Type } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { DeviceService } from '../../../core/services/device.service';
import { CryptoService } from '../../../core/services/crypto.service';
import { ChargeResponse, Payment } from '../../../core/models/payment.model';
import { SealedPaymentRequest, SealedStatusRequest } from '../../../core/models/sealed-payment.model';
import { environment } from '../../../../environments/environment';
import { getProductTheme, SalesProductTheme } from './sales-theme.config';
import { resolveSalesLayout } from './sales-layout.registry';
import { DurationOption, PaymentType, PurchaseState, SalesLayoutProps } from './sales-layout.types';

// MercadoPago type declaration
declare var MercadoPago: any;

@Component({
    selector: 'app-sales',
    standalone: true,
    imports: [CommonModule, NgComponentOutlet],
    templateUrl: './sales.html',
    styleUrl: './sales.scss'
})
export class SalesComponent implements OnInit, OnDestroy {
    @Input() forcedType: string | null = null;

    selectedDuration = signal<DurationOption | null>(null);
    pixKey = signal('00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913PaguePix Inc 6009SAO PAULO62070503***6304ABCD');
    paymentLink = signal('');
    paymentType = signal<PaymentType>('PIX');
    currentState = signal<PurchaseState>('IDLE');
    errorMessage = signal('');
    showCopySuccess = signal(false);

    deviceId = signal<string | null>(null);
    deviceInfo = signal<any | null>(null);
    lastChargeResponse = signal<ChargeResponse | null>(null);

    private pollingInterval: any = null;
    private pollingStartTime: number = 0;
    private mp: any;

    remainingTimeText = signal<string>('00:00');
    remainingSeconds = signal<number | null>(null);
    private localTimerInterval: any = null;

    private paymentService = inject(PaymentService);
    private deviceService = inject(DeviceService);
    private cryptoService = inject(CryptoService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    durationOptions: DurationOption[] = [];
    detectedRouteType = signal<string | null>(null);

    theme = computed<SalesProductTheme>(() => {
        const type = this.forcedType || this.deviceInfo()?.type || this.detectedRouteType();
        return getProductTheme(type);
    });

    productName = computed(() => {
        const duration = this.selectedDuration();
        const prefix = this.theme().productUnitLabel;
        return duration ? `${prefix}: ${duration.minutes}min` : prefix;
    });

    currentLayoutComponent = computed<Type<any>>(() => {
        const type = this.forcedType || this.deviceInfo()?.type || this.detectedRouteType();
        return resolveSalesLayout(type);
    });

    layoutProps = computed<SalesLayoutProps>(() => ({
        currentState: this.currentState(),
        deviceInfo: this.deviceInfo(),
        durationOptions: this.durationOptions,
        selectedDuration: this.selectedDuration(),
        paymentType: this.paymentType(),
        pixKey: this.pixKey(),
        paymentLink: this.paymentLink(),
        remainingTimeText: this.remainingTimeText(),
        remainingSeconds: this.remainingSeconds(),
        productName: this.productName(),
        errorMessage: this.errorMessage(),
        showCopySuccess: this.showCopySuccess(),
        onSelectDuration: (option: DurationOption) => this.selectDuration(option),
        onPrimaryAction: () => this.handlePrimaryAction(),
        onOpenPaymentLink: () => this.openPaymentLink(),
        onCopyPixKey: () => this.copyPixKey(),
        onFinishAndReturn: () => this.finishAndReturn()
    }));

    layoutInputs = computed(() => ({
        props: this.layoutProps()
    }));

    constructor() {
        effect(() => {
            const token = this.deviceId();
            const state = this.currentState();
            const charge = this.lastChargeResponse();
            const key = this.pixKey();
            const link = this.paymentLink();
            const type = this.paymentType();
            const duration = this.selectedDuration();

            if (token) {
                if (state === 'READY' || state === 'PENDING' || state === 'PROCESSING' || state === 'SUCCESS') {
                    const stateToSave = {
                        currentState: state,
                        lastChargeResponse: charge,
                        pixKey: key,
                        paymentLink: link,
                        paymentType: type,
                        pollingStartTime: this.pollingStartTime,
                        selectedDuration: duration,
                        timestamp: Date.now()
                    };
                    this.saveStateToStorage(token, stateToSave);
                } else if (state === 'IDLE' || state === 'ERROR') {
                    this.removeStateFromStorage(token);
                }
            }
        });
    }

    ngOnInit() {
        const urlSegments = this.route.snapshot.url;
        if (urlSegments.length > 0) {
            const firstSegment = urlSegments[0].path.toUpperCase();
            this.detectedRouteType.set(firstSegment);
        }

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

            const restored = this.restoreStateFromStorage(token);

            const paymentId = queryParams.get('payment_id');
            const status = queryParams.get('status');
            const preferenceId = queryParams.get('preference_id');

            if (paymentId || preferenceId) {
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
            } else if (!restored) {
                this.validateDevice(token);
            } else {
                this.validateDevice(token, true);
            }
        } else {
            this.currentState.set('ERROR');
            this.errorMessage.set('Identificador do dispositivo inválido.');
        }
    }

    private getFallbackDescription(minutes: number): string {
        const fallbacks = this.theme().fallbackDescriptions;
        return fallbacks[minutes] || `${this.theme().productUnitLabel}`;
    }

    private validateDevice(token: string, background: boolean = false) {
        if (!background) {
            this.currentState.set('VALIDATING');
        }
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

                if (!background && this.currentState() === 'VALIDATING') {
                    this.currentState.set('IDLE');
                }
            },
            error: (err) => {
                console.error('Error validating device:', err);
                if (!background) {
                    const backendMessage = err.error?.message;
                    this.errorMessage.set(backendMessage || 'Dispositivo não reconhecido ou inativo. Por favor, leia novamente o QR Code.');
                    this.currentState.set('ERROR');
                }
            }
        });
    }

    private saveStateToStorage(token: string, stateToSave: any) {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                localStorage.setItem(`paguepix_payment_state_${token}`, JSON.stringify(stateToSave));
            } catch (e) {
                console.error('Error saving state to localStorage', e);
            }
        }
    }

    private removeStateFromStorage(token: string) {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                localStorage.removeItem(`paguepix_payment_state_${token}`);
            } catch (e) {
                console.error('Error removing state from localStorage', e);
            }
        }
    }

    private restoreStateFromStorage(token: string): boolean {
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const savedStr = localStorage.getItem(`paguepix_payment_state_${token}`);
                if (!savedStr) return false;

                const saved = JSON.parse(savedStr);
                if (Date.now() - saved.timestamp > 900000) {
                    localStorage.removeItem(`paguepix_payment_state_${token}`);
                    return false;
                }

                this.pollingStartTime = saved.pollingStartTime || 0;
                this.selectedDuration.set(saved.selectedDuration);
                this.pixKey.set(saved.pixKey);
                this.paymentLink.set(saved.paymentLink);
                this.paymentType.set(saved.paymentType);
                this.lastChargeResponse.set(saved.lastChargeResponse);
                this.currentState.set(saved.currentState);

                if (saved.currentState === 'READY' || saved.currentState === 'PENDING' || saved.currentState === 'SUCCESS') {
                    this.startStatusPolling(true);
                }

                return true;
            } catch (e) {
                console.error('Failed to restore state from localStorage:', e);
                return false;
            }
        }
        return false;
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
            this.pollingStartTime = 0;

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
                        this.startStatusPolling();
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

    startStatusPolling(immediate: boolean = false) {
        if (this.pollingInterval) return;

        if (!this.pollingStartTime || this.pollingStartTime === 0) {
            this.pollingStartTime = Date.now();
        }

        const pollAction = () => {
            const elapsedSeconds = Math.floor((Date.now() - this.pollingStartTime) / 1000);

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
                        const provider = this.deviceInfo()?.partner?.bankProvider || response.provider;
                        if (provider === 'MERCADO_PAGO') {
                            const modalExists = !!document.querySelector('.mp-mercadopago-checkout-wrapper') ||
                                !!document.querySelector('#mercadopago-checkout');

                            if (!modalExists && this.currentState() === 'READY') {
                                this.currentState.set('PENDING');
                            }
                        }

                        if (response.paid) {
                            this.closeMercadoPagoModal();
                            this.currentState.set('SUCCESS');
                            if (response.approvedTime && response.usageTime && response.serverTime) {
                                this.startLocalCountdown(response.approvedTime, response.usageTime, response.serverTime);
                            }
                            if (this.pollingInterval) {
                                clearTimeout(this.pollingInterval);
                            }
                            this.pollingInterval = setTimeout(pollAction, 15000);
                        } else if (response.qrCode) {
                            if (this.pixKey() !== response.qrCode) {
                                this.pixKey.set(response.qrCode);
                                this.paymentType.set('PIX');
                                this.currentState.set('PENDING');
                                this.closeMercadoPagoModal();
                            }
                            if (this.pollingInterval) {
                                this.pollingInterval = setTimeout(pollAction, 1500);
                            }
                        } else if (response.status === 'rejected' || response.status === 'cancelled') {
                            this.stopPolling();
                            this.closeMercadoPagoModal();
                            this.errorMessage.set('O pagamento não foi autorizado. Por favor, tente novamente ou use outra forma de pagamento.');
                            this.currentState.set('ERROR');
                        } else {
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
        this.stopLocalTimer();
    }

    stopLocalTimer() {
        if (this.localTimerInterval) {
            clearInterval(this.localTimerInterval);
            this.localTimerInterval = null;
        }
    }

    startLocalCountdown(approvedTime: any, usageTimeSeconds: any, serverTime: any) {
        this.stopLocalTimer();
        const appTime = Number(approvedTime);
        const useTime = Number(usageTimeSeconds);
        const srvTime = Number(serverTime);
        const serverOffset = srvTime - Date.now();
        const endTime = appTime + (useTime * 1000);

        const updateTimer = () => {
            const nowAdjusted = Date.now() + serverOffset;
            const remainingMs = endTime - nowAdjusted;
            const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
            
            this.remainingSeconds.set(remainingSec);

            if (remainingSec <= 0) {
                this.remainingTimeText.set('00:00');
                this.stopLocalTimer();
                this.stopPolling();
            } else {
                const minutes = Math.floor(remainingSec / 60);
                const seconds = remainingSec % 60;
                const minStr = minutes.toString().padStart(2, '0');
                const secStr = seconds.toString().padStart(2, '0');
                this.remainingTimeText.set(`${minStr}:${secStr}`);
            }
        };

        updateTimer();
        this.localTimerInterval = setInterval(updateTimer, 1000);
    }

    ngOnDestroy() {
        this.stopPolling();
    }

    @HostListener('document:visibilitychange', [])
    onVisibilityChange() {
        if (document.visibilityState === 'visible') {
            if (this.pollingInterval || this.currentState() === 'PENDING' || this.currentState() === 'SUCCESS') {
                this.stopPolling();
                this.startStatusPolling(true);
            }
        }
    }

    reset() {
        this.stopPolling();
        this.pollingStartTime = 0;
        this.currentState.set('IDLE');
        this.errorMessage.set('');
    }

    private getBaseApiUrl(): string {
        if (environment.production) {
            return 'https://api.paguepix.oficinabr.com';
        }

        const origin = window.location.origin;
        if (origin.includes('paguepix.oficinabr.com')) {
            return 'https://api.paguepix.oficinabr.com';
        }

        return environment.apiUrl;
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
        } else {
            console.error('No payment link available for redirection');
        }
    }
}
