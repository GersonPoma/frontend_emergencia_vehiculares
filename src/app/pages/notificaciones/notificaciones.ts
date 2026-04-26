import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe, LowerCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { AsignacionPendiente } from '../../models/asignacion-pendiente.model';
import { IncidenteDetalleDialogComponent } from '../emergencias/incidente-detalle-dialog/incidente-detalle-dialog';

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
  ],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss',
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  displayedColumns = ['incidente_id', 'distancia_km', 'estado', 'acciones'];

  private tallerId: number | null = null;
  private destroy$ = new Subject<void>();
  private incidenteDialogAbierto = false;

  constructor(
    public notificacionService: NotificacionService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const state = this.authService.getCurrentAuthState();
    this.tallerId = state.id_taller;
    if (this.tallerId) {
      this.notificacionService.cargarPendientes(this.tallerId).subscribe();
    }

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const incidenteParam = params.get('incidente');
        const incidenteId = incidenteParam ? Number(incidenteParam) : NaN;

        if (Number.isInteger(incidenteId) && incidenteId > 0) {
          this.verIncidente(incidenteId, true);
        }
      });
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

  verIncidente(incidenteId: number, desdeQuery: boolean = false): void {
    if (this.incidenteDialogAbierto) return;

    this.incidenteDialogAbierto = true;
    const dialogRef = this.dialog.open(IncidenteDetalleDialogComponent, {
      width: '780px',
      maxWidth: '95vw',
      data: { incidenteId },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        this.incidenteDialogAbierto = false;

        if (!desdeQuery) return;

        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { incidente: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
  }
}
