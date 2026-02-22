import { Routes } from '@angular/router';
import { Login } from './features/auth/login';
import { Dashboard } from './features/admin/dashboard';
import { PaymentsManagement } from './features/admin/payments-management';
import { UserManagement } from './features/admin/user-management/user-management';
import { UserDashboard } from './features/user/dashboard';
import { TransferRequest } from './features/user/transfer-request';
import { PaymentsHistory } from './features/user/payments-history/payments-history';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'admin/dashboard', component: Dashboard },
    { path: 'admin/payments', component: PaymentsManagement },
    { path: 'admin/users', component: UserManagement },
    { path: 'user/dashboard', component: UserDashboard },
    { path: 'user/transfer', component: TransferRequest },
    { path: 'user/history', component: PaymentsHistory },
];
