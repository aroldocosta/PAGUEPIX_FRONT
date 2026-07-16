import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/auth.models';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.navigateToDashboard();
    }
  }

  onLogin() {
    const loginData = {
      login: this.email(),
      password: this.password()
    };


    this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginData)
      .subscribe({
        next: (response) => {
          this.authService.setSession({
            userId: response.userId,
            token: response.token,
            role: response.role,
            name: response.name,
            partnerId: response.partnerId,
            partnerName: response.partnerName,
            partnerLogo: response.partnerLogo,
            paymentWorkflowMode: response.paymentWorkflowMode
          });

          this.authService.navigateToDashboard();
        },
        error: (error) => {
          console.error('Erro na autenticação:', error);
          alert('Falha no login. Verifique suas credenciais.');
        }
      });
  }
}
