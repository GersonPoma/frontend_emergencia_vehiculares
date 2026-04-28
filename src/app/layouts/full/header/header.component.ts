import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  Signal,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { ApiService } from 'src/app/services/api.service';
import { ConfigService } from 'src/app/services/config.service';
import { AsignacionPendiente } from 'src/app/models/asignacion-pendiente.model';
import { TallerSalida } from 'src/app/models/perfiles/taller.model';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    DecimalPipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();

  currentUsername = '';
  esAdminTaller = false;
  tallerDisponible: boolean | null = null;
  isToggling = false;
  private idTaller: number | null = null;
  private destroy$ = new Subject<void>();

  readonly pendientes: Signal<AsignacionPendiente[]>;
  readonly cantidadPendientes: Signal<number>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService,
    private apiService: ApiService,
    private configService: ConfigService,
  ) {
    this.pendientes = this.notificacionService.pendientes.asReadonly();
    this.cantidadPendientes = this.notificacionService.cantidadPendientes;
  }

  ngOnInit(): void {
    const state = this.authService.getCurrentAuthState();
    this.currentUsername = state.username || 'Usuario';

    if (state.rol === 'admin_taller' && state.id_taller) {
      this.esAdminTaller = true;
      this.idTaller = state.id_taller;
      this.cargarEstadoTaller();
    }
  }

  cargarEstadoTaller(): void {
    if (!this.idTaller) return;
    const url = this.configService.getApiUrl('talleres');
    this.apiService.getById<TallerSalida>(url, this.idTaller)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (t) => (this.tallerDisponible = t.disponible) });
  }

  toggleDisponibilidad(): void {
    if (!this.idTaller || this.isToggling) return;
    this.isToggling = true;
    const action = this.tallerDisponible ? 'desactivar' : 'activar';
    const url = this.configService.getApiUrl('talleres');
    this.apiService.patch<TallerSalida>(url, `${this.idTaller}/${action}`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (t) => {
          this.tallerDisponible = t.disponible;
          this.isToggling = false;
        },
        error: () => (this.isToggling = false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  aceptar(asig: AsignacionPendiente, event: Event): void {
    event.stopPropagation();
    this.notificacionService
      .aceptar(asig.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificacionService.eliminarLocal(asig.id);
          this.router.navigate(['/talleres/historial']);
        },
        error: () => {},
      });
  }

  rechazar(asig: AsignacionPendiente, event: Event): void {
    event.stopPropagation();
    this.notificacionService
      .rechazar(asig.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.notificacionService.eliminarLocal(asig.id),
        error: () => {},
      });
  }

  verIncidente(asig: AsignacionPendiente, event: Event): void {
    event.stopPropagation();
    void this.router.navigate(['/notificaciones'], {
      queryParams: { incidente: asig.incidente_id },
    });
  }

  cerrarSesion(): void {
    this.notificacionService.detenerPolling();
    this.authService
      .logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => this.router.navigate(['/login']),
      });
  }
}
