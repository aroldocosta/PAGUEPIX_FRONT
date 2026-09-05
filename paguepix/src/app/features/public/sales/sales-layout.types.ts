export interface DurationOption {
    id: number;
    minutes: number;
    label: string;
    description: string;
    price: number;
    icon: string;
}

export type PurchaseState = 'VALIDATING' | 'IDLE' | 'PROCESSING' | 'READY' | 'PENDING' | 'SUCCESS' | 'ERROR';
export type PaymentType = 'PIX' | 'LINK';

export interface SalesLayoutProps {
    currentState: PurchaseState;
    deviceInfo: any;
    durationOptions: DurationOption[];
    selectedDuration: DurationOption | null;
    paymentType: PaymentType;
    pixKey: string;
    paymentLink: string;
    remainingTimeText: string;
    remainingSeconds: number | null;
    productName: string;
    errorMessage: string;
    showCopySuccess: boolean;
    onSelectDuration: (option: DurationOption) => void;
    onPrimaryAction: () => void;
    onOpenPaymentLink: () => void;
    onCopyPixKey: () => void;
    onFinishAndReturn: () => void;
}
