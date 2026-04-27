import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from './config.service';
import { AsignacionPendiente } from '../models/asignacion-pendiente.model';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  readonly pendientes = signal<AsignacionPendiente[]>([]);
  readonly cantidadPendientes = computed(() => this.pendientes().length);

  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  cargarPendientes(tallerId: number): Observable<AsignacionPendiente[]> {
    const url = this.configService.getApiUrl(
      `asignaciones/taller/${tallerId}/emergencias-pendientes`
    );
    return this.http.get<AsignacionPendiente[]>(url).pipe(
      tap(data => this.pendientes.set(data))
    );
  }

  iniciarPolling(tallerId: number): void {
    if (this.pollingInterval !== null) return;
    this.cargarPendientes(tallerId).subscribe();
    this.pollingInterval = setInterval(() => {
      this.cargarPendientes(tallerId).subscribe();
    }, 10000);
  }

  detenerPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.pendientes.set([]);
  }

  eliminarLocal(asignacionId: number): void {
    this.pendientes.update(list => list.filter(a => a.id !== asignacionId));
  }

  aceptar(asignacionId: number): Observable<any> {
    const url = this.configService.getApiUrl(
      `asignaciones/asignacion/${asignacionId}/aceptar`
    );
    return this.http.post(url, {});
  }

  rechazar(asignacionId: number): Observable<any> {
    const url = this.configService.getApiUrl(
      `asignaciones/asignacion/${asignacionId}/rechazar`
    );
    return this.http.post(url, {});
  }

  registrarFcmToken(usuarioId: number, token: string): Observable<any> {
    const url = this.configService.getApiUrl(`usuarios/${usuarioId}/fcm-token`);
    return this.http.patch(url, { fcm_token: token });
  }
}
