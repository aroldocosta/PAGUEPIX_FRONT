export interface SalesProductTheme {
    brandPrefix: string;
    brandSuffix: string;
    icon: string;
    iconFamily: 'material' | 'font-awesome';
    productUnitLabel: string;
    activeMessage: string;
    endingMessage: string;
    completedMessage: string;
    thankYouMessage: string;
    fallbackDescriptions: Record<number, string>;
}

export const PRODUCT_THEMES: Record<string, SalesProductTheme> = {
    VAC: {
        brandPrefix: 'Smart',
        brandSuffix: 'Vac',
        icon: 'vacuum',
        iconFamily: 'material',
        productUnitLabel: 'Tempo de Aspiração',
        activeMessage: 'Aproveite seu tempo de uso!',
        endingMessage: 'Seu tempo está acabando!',
        completedMessage: 'Aspiração Finalizada',
        thankYouMessage: 'Obrigado por usar o SmartVac.',
        fallbackDescriptions: {
            1: 'Aspiração ultra-rápida',
            3: 'O mais popular',
            5: 'Aspiração completa',
            10: 'Limpeza detalhada'
        }
    },
    SHOWER: {
        brandPrefix: 'Smart',
        brandSuffix: 'Shower',
        icon: 'fa-umbrella-beach',
        iconFamily: 'font-awesome',
        productUnitLabel: 'Tempo de Banho',
        activeMessage: 'Aproveite seu banho!',
        endingMessage: 'Seu tempo está acabando!',
        completedMessage: 'Banho Finalizado',
        thankYouMessage: 'Obrigado por usar o SmartShower.',
        fallbackDescriptions: {
            1: 'Banho ultra-rápido',
            3: 'O mais popular',
            5: 'Banho completo',
            10: 'Para toda a família'
        }
    },
    VACUUM: {
        brandPrefix: 'Smart',
        brandSuffix: 'Vac',
        icon: 'vacuum',
        iconFamily: 'material',
        productUnitLabel: 'Tempo de Aspiração',
        activeMessage: 'Aproveite seu tempo de uso!',
        endingMessage: 'Seu tempo está acabando!',
        completedMessage: 'Aspiração Finalizada',
        thankYouMessage: 'Obrigado por usar o SmartVac.',
        fallbackDescriptions: {
            1: 'Aspiração ultra-rápida',
            3: 'O mais popular',
            5: 'Aspiração completa',
            10: 'Limpeza detalhada'
        }
    },
    SMARTVAC: {
        brandPrefix: 'Smart',
        brandSuffix: 'Vac',
        icon: 'vacuum',
        iconFamily: 'material',
        productUnitLabel: 'Tempo de Aspiração',
        activeMessage: 'Aproveite seu tempo de uso!',
        endingMessage: 'Seu tempo está acabando!',
        completedMessage: 'Aspiração Finalizada',
        thankYouMessage: 'Obrigado por usar o SmartVac.',
        fallbackDescriptions: {
            1: 'Aspiração ultra-rápida',
            3: 'O mais popular',
            5: 'Aspiração completa',
            10: 'Limpeza detalhada'
        }
    },
    CHAFARIZ: {
        brandPrefix: 'Chafariz',
        brandSuffix: 'PaguePix',
        icon: 'water_drop',
        iconFamily: 'material',
        productUnitLabel: 'Tempo de Uso',
        activeMessage: 'Chafariz acionado!',
        endingMessage: 'Seu tempo está acabando!',
        completedMessage: 'Acionamento Finalizado',
        thankYouMessage: 'Obrigado por utilizar.',
        fallbackDescriptions: {
            1: 'Acionamento rápido',
            3: 'Uso padrão',
            5: 'Uso prolongado',
            10: 'Uso completo'
        }
    },
    DEFAULT: {
        brandPrefix: 'Pague',
        brandSuffix: 'Pix',
        icon: 'timer',
        iconFamily: 'material',
        productUnitLabel: 'Tempo de Uso',
        activeMessage: 'Equipamento liberado para uso!',
        endingMessage: 'Seu tempo está acabando!',
        completedMessage: 'Tempo Finalizado',
        thankYouMessage: 'Obrigado pela sua compra.',
        fallbackDescriptions: {
            1: 'Uso rápido',
            3: 'Mais popular',
            5: 'Uso completo',
            10: 'Uso prolongado'
        }
    }
};

export function getProductTheme(typeOrRoute?: string | null): SalesProductTheme {
    if (!typeOrRoute) {
        return PRODUCT_THEMES['DEFAULT'];
    }
    const key = typeOrRoute.toUpperCase().trim();
    return PRODUCT_THEMES[key] || PRODUCT_THEMES['DEFAULT'];
}
