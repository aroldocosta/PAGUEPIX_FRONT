export interface LeadSummary {
    id: string | number;
    name: string;
    barraca: string;
    whatsapp: string;
}

export interface LeadDetail {
    id: string | number;
    name: string;
    email: string;
    barraca: string;
    whatsapp: string;
    createdAt?: string;
}

export interface Lead extends LeadDetail {}
