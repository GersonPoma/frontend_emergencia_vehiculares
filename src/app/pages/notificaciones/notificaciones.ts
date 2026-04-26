import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe, LowerCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { AsignacionPendiente } from '../../models/asignacion-pendiente.model';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    LowerCasePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss',
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  displayedColumns = ['incidente_id', 'distancia_km', 'estado', 'acciones'];

  private tallerId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public notificacionService: NotificacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const state = this.authService.getCurrentAuthState();
    this.tallerId = state.id_taller;
    if (this.tallerId) {
      this.notificacionService.cargarPendientes(this.tallerId).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  aceptar(asig: AsignacionPendiente): void {
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

  rechazar(asig: AsignacionPendiente): void {
    this.notificacionService
      .rechazar(asig.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.notificacionService.eliminarLocal(asig.id),
        error: () => {},
      });
  }
}
