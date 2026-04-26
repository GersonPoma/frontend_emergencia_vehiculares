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
import { AsignacionPendiente } from 'src/app/models/asignacion-pendiente.model';

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
  private destroy$ = new Subject<void>();

  readonly pendientes: Signal<AsignacionPendiente[]>;
  readonly cantidadPendientes: Signal<number>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService
  ) {
    this.pendientes = this.notificacionService.pendientes.asReadonly();
    this.cantidadPendientes = this.notificacionService.cantidadPendientes;
  }

  ngOnInit(): void {
    const state = this.authService.getCurrentAuthState();
    this.currentUsername = state.username || 'Usuario';
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
          this.router.navigate(['/ordenes-servicio']);
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
