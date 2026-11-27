import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/Users`;

  /**
   * Perfil carregado, compartilhado entre a tela de Perfil e a sidebar.
   * Quem escreve aqui e o proprio service, para que uma alteracao de nome
   * apareca nos dois lugares sem precisar recarregar a pagina.
   */
  readonly profile = signal<UserProfile | null>(null);

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      tap(profile => this.profile.set(profile))
    );
  }

  updateName(name: string): Observable<void> {
    const trimmed = name.trim();

    return this.http.put<void>(`${this.apiUrl}/profile`, { name: trimmed }).pipe(
      tap(() => {
        const current = this.profile();
        if (current) {
          this.profile.set({ ...current, name: trimmed });
        }
      })
    );
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/password`, payload);
  }
}

/**
 * Iniciais para o avatar: primeira letra do primeiro e do ultimo nome.
 * Nome com uma palavra so usa as duas primeiras letras dela.
 */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(part => part.length > 0);
  if (parts.length === 0) return '--';

  const first = parts[0].charAt(0);
  const second = parts.length > 1
    ? parts[parts.length - 1].charAt(0)
    : parts[0].charAt(1);

  return (first + second).toUpperCase();
}
