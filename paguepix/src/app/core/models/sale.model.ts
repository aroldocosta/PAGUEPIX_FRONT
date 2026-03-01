import { Payment } from './payment.model';

/**
 * Sale represents a Payment from the Partner's (Lojista) perspective.
 * Following DDD principles, this is a domain-specific extension 
 * of the core Payment entity.
 */
export interface Sale extends Payment {
    // We can add partner-specific fields here in the future
    // For now, it serves as a semantic alias for Payment
}
