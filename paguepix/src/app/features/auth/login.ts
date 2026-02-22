import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { LoginResponse } from '../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');

  onLogin() {
    const loginData = {
      login: this.email(),
      password: this.password()
    };

    console.log('Enviando requisição de login para API...');

    this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginData)
      .subscribe({
        next: (response) => {
          console.log('Login realizado com sucesso!');
          this.authService.setSession({
            userId: response.userId,
            token: response.token,
            role: response.role
          });

          if (response.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        },
        error: (error) => {
          console.error('Erro na autenticação:', error);
          alert('Falha no login. Verifique suas credenciais.');
        }
      });
  }
}
