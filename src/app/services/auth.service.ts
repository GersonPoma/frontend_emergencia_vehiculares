import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  id_usuario: number;
  id_perfil: number | null;
  id_taller: number | null;
  rol: string;
  privilegios: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  id_usuario: number | null;
  username: string | null;
  access_token: string | null;
  rol: string | null;
  id_perfil: number | null;
  id_taller: number | null;
  privilegios: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private readonly USUARIO_ID_KEY = 'auth_usuario_id';
  private readonly USERNAME_KEY = 'auth_username';
  private readonly ROL_KEY = 'auth_rol';
  private readonly ID_TALLER_KEY = 'auth_id_taller';
  private readonly ID_PERFIL_KEY = 'auth_id_perfil';

  private authState = new BehaviorSubject<AuthState>(this.getInitialState());
  public authState$ = this.authState.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private router: Router
  ) {
    this.restoreAuthState();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = this.configService.getApiUrl('auth/login');
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap(response => this.saveAuthData(response, credentials.username))
    );
  }

  logout(): Observable<void> {
    this.clearAuthData();
    this.authState.next(this.getInitialState());
    this.router.navigate(['/login']);
    return of(void 0);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getUsuarioId(): number | null {
    const id = localStorage.getItem(this.USUARIO_ID_KEY);
    return id ? parseInt(id) : null;
  }

  getRol(): string | null {
    return localStorage.getItem(this.ROL_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentAuthState(): AuthState {
    return this.authState.value;
  }

  private saveAuthData(response: LoginResponse, username: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.access_token);
    localStorage.setItem(this.USUARIO_ID_KEY, response.id_usuario.toString());
    localStorage.setItem(this.USERNAME_KEY, username);
    localStorage.setItem(this.ROL_KEY, response.rol);
    if (response.id_taller !== null) {
      localStorage.setItem(this.ID_TALLER_KEY, response.id_taller.toString());
    }
    if (response.id_perfil !== null) {
      localStorage.setItem(this.ID_PERFIL_KEY, response.id_perfil.toString());
    }

    this.authState.next({
      isAuthenticated: true,
      id_usuario: response.id_usuario,
      username,
      access_token: response.access_token,
      rol: response.rol,
      id_perfil: response.id_perfil,
      id_taller: response.id_taller,
      privilegios: response.privilegios
    });
  }

  private restoreAuthState(): void {
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const usuarioId = localStorage.getItem(this.USUARIO_ID_KEY);

    if (accessToken && usuarioId) {
      const idTaller = localStorage.getItem(this.ID_TALLER_KEY);
      const idPerfil = localStorage.getItem(this.ID_PERFIL_KEY);
      this.authState.next({
        isAuthenticated: true,
        id_usuario: parseInt(usuarioId),
        username: localStorage.getItem(this.USERNAME_KEY),
        access_token: accessToken,
        rol: localStorage.getItem(this.ROL_KEY),
        id_perfil: idPerfil ? parseInt(idPerfil) : null,
        id_taller: idTaller ? parseInt(idTaller) : null,
        privilegios: []
      });
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_ID_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.ROL_KEY);
    localStorage.removeItem(this.ID_TALLER_KEY);
    localStorage.removeItem(this.ID_PERFIL_KEY);
  }

  private getInitialState(): AuthState {
    return {
      isAuthenticated: false,
      id_usuario: null,
      username: null,
      access_token: null,
      rol: null,
      id_perfil: null,
      id_taller: null,
      privilegios: []
    };
  }
}
