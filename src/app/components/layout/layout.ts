import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent implements OnInit {
  userName = '';
  userEmail = '';

  menuItems = [
    { label: 'Dashboard', icon: 'ti-layout-dashboard', route: '/dashboard' },
    { label: 'Transações', icon: 'ti-arrows-exchange', route: '/transactions' },
    { label: 'Relatórios', icon: 'ti-chart-pie', route: '/reports' },
    { label: 'Perfil', icon: 'ti-user', route: '/profile' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userEmail = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
      this.userName = this.userEmail.split('@')[0];
    }
  }

  getInitials(): string {
    return this.userName.slice(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}