import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { PaymentsManagement } from './features/admin/payments/payments';
import { UserManagement } from './features/admin/users/users';
import { UserDashboard } from './features/user/dashboard/dashboard';
import { TransferRequest } from './features/user/transfer/transfer';
import { PaymentsHistory } from './features/user/history/history';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'admin/dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'admin/payments', component: PaymentsManagement, canActivate: [authGuard] },
    { path: 'admin/users', component: UserManagement, canActivate: [authGuard] },
    { path: 'user/dashboard', component: UserDashboard, canActivate: [authGuard] },
    { path: 'user/transfer', component: TransferRequest, canActivate: [authGuard] },
    { path: 'user/history', component: PaymentsHistory, canActivate: [authGuard] },
];
