import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService, UserProfile, initialsOf } from '../../services/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  /** Mesmos limites validados no backend, para avisar antes de enviar. */
  readonly nameMaxLength = 100;
  readonly passwordMinLength = 6;

  profile: UserProfile | null = null;
  loading = true;
  loadError = '';

  // Informacoes pessoais
  name = '';
  savingName = false;
  nameError = '';
  nameSuccess = '';

  // Troca de senha
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showPasswords = false;
  savingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.loadError = '';

    this.userService.getProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.name = profile.name;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loadError = this.messageFrom(err, 'Não foi possível carregar seu perfil.');
        this.loading = false;
      }
    });
  }

  get initials(): string {
    return initialsOf(this.profile?.name ?? '');
  }

  get trimmedName(): string {
    return this.name.trim();
  }

  get nameChanged(): boolean {
    return this.trimmedName !== (this.profile?.name ?? '');
  }

  get canSaveName(): boolean {
    return !this.savingName
      && this.nameChanged
      && this.trimmedName.length > 0
      && this.trimmedName.length <= this.nameMaxLength;
  }

  saveName() {
    if (!this.canSaveName) return;

    this.savingName = true;
    this.nameError = '';
    this.nameSuccess = '';

    this.userService.updateName(this.name).subscribe({
      next: () => {
        this.profile = this.userService.profile();
        this.name = this.profile?.name ?? this.trimmedName;
        this.nameSuccess = 'Nome atualizado.';
        this.savingName = false;
      },
      error: (err: HttpErrorResponse) => {
        this.nameError = this.messageFrom(err, 'Não foi possível salvar o nome.');
        this.savingName = false;
      }
    });
  }

  resetName() {
    this.name = this.profile?.name ?? '';
    this.nameError = '';
    this.nameSuccess = '';
  }

  /** Vazio ainda nao e erro: so avisa quando o usuario ja digitou algo. */
  get passwordsMatch(): boolean {
    return this.confirmPassword.length === 0 || this.newPassword === this.confirmPassword;
  }

  get canSavePassword(): boolean {
    return !this.savingPassword
      && this.currentPassword.length > 0
      && this.newPassword.length >= this.passwordMinLength
      && this.newPassword === this.confirmPassword;
  }

  savePassword() {
    if (!this.canSavePassword) return;

    this.savingPassword = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    this.userService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.passwordSuccess = 'Senha alterada. Use a nova senha no próximo login.';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.showPasswords = false;
        this.savingPassword = false;
      },
      error: (err: HttpErrorResponse) => {
        this.passwordError = this.messageFrom(err, 'Não foi possível alterar a senha.');
        this.savingPassword = false;
      }
    });
  }

  /**
   * A API devolve ProblemDetails: a mensagem util para o usuario vem em
   * `detail` (ex.: "Senha atual incorreta."). O fallback cobre falha de
   * rede, em que nao ha corpo na resposta.
   */
  private messageFrom(err: HttpErrorResponse, fallback: string): string {
    return err.error?.detail || err.error?.title || fallback;
  }
}
