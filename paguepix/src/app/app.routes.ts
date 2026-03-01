import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { PaymentsManagement } from './features/admin/payments/payments';
import { UserManagement } from './features/admin/users/users';
import { DeviceManagement } from './features/admin/devices/devices';
import { BoardManagement } from './features/admin/boards/boards';
import { ScriptsManagement } from './features/admin/scripts/scripts';
import { PartnerManagement } from './features/admin/partners/partners';
import { UserDashboard } from './features/user/dashboard/dashboard';
import { TransferRequest } from './features/user/transfer/transfer';
import { SalesComponent } from './features/user/sales/sales';
import { SalesTimeComponent } from './features/public/sales-time/sales-time';
import { PayoutsManagement } from './features/admin/payouts/payouts';
import { PartnerPayouts } from './features/user/payout/payouts';


import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'sales/:token', component: SalesTimeComponent },

    { path: 'admin/dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'admin/payments', component: PaymentsManagement, canActivate: [authGuard] },
    { path: 'admin/payouts', component: PayoutsManagement, canActivate: [authGuard] },
    { path: 'admin/users', component: UserManagement, canActivate: [authGuard] },
    { path: 'admin/devices', component: DeviceManagement, canActivate: [authGuard] },
    { path: 'admin/boards', component: BoardManagement, canActivate: [authGuard] },
    { path: 'admin/scripts', component: ScriptsManagement, canActivate: [authGuard] },
    { path: 'admin/partners', component: PartnerManagement, canActivate: [authGuard] },
    { path: 'user/dashboard', component: UserDashboard, canActivate: [authGuard] },
    { path: 'user/payout', component: PartnerPayouts, canActivate: [authGuard] },
    { path: 'user/sales', component: SalesComponent, canActivate: [authGuard] },
];
