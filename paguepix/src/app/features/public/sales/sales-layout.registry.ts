import { Type } from '@angular/core';
import { ShowerLayoutComponent } from './layouts/shower-layout.component';
import { VacuumLayoutComponent } from './layouts/vacuum-layout.component';
import { ChafarizLayoutComponent } from './layouts/chafariz-layout.component';
import { DefaultTimerLayoutComponent } from './layouts/default-timer-layout.component';

export const SALES_LAYOUT_REGISTRY: Record<string, Type<any>> = {
    SHOWER: ShowerLayoutComponent,
    VACUUM: VacuumLayoutComponent,
    VAC: VacuumLayoutComponent,
    SMARTVAC: VacuumLayoutComponent,
    CHAFARIZ: ChafarizLayoutComponent,
    DEFAULT: DefaultTimerLayoutComponent
};

export function resolveSalesLayout(typeOrRoute?: string | null): Type<any> {
    if (!typeOrRoute) {
        return SALES_LAYOUT_REGISTRY['DEFAULT'];
    }
    const key = typeOrRoute.toUpperCase().trim();
    return SALES_LAYOUT_REGISTRY[key] || SALES_LAYOUT_REGISTRY['DEFAULT'];
}
