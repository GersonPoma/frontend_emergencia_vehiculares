import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe, LowerCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { ConfigService } from '../../../services/config.service';
import { AsignacionPendiente } from '../../../models/asignacion-pendiente.model';
import { IncidenteDetalleDialogComponent } from '../../emergencias/incidente-detalle-dialog/incidente-detalle-dialog';

@Component({
  selector: 'app-historial-incidentes',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    LowerCasePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './historial-incidentes.html',
  styleUrl: './historial-incidentes.scss',
})
export class HistorialIncidentesComponent implements OnInit, OnDestroy {
  displayedColumns = ['incidente_id', 'distancia_km', 'estado', 'acciones'];

  aceptadas: AsignacionPendiente[] = [];
  isLoading = false;
  totalRegistros = 0;
  paginaActual = 0;
  readonly limite = 10;

  private tallerId: number | null = null;
  private dialogAbierto = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private configService: ConfigService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const state = this.authService.getCurrentAuthState();
    this.tallerId = state.id_taller;
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(): void {
    if (!this.tallerId) return;
    this.isLoading = true;
    const url = this.configService.getApiUrl(
      `asignaciones/taller/${this.tallerId}/aceptadas`
    );
    this.apiService
      .getWithPagination<AsignacionPendiente>(url, this.paginaActual + 1, this.limite)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pag) => {
          this.aceptadas = pag.datos;
          this.totalRegistros = pag.total;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; },
      });
  }

  onPaginar(event: PageEvent): void {
    this.paginaActual = event.pageIndex;
    this.cargar();
  }

  verIncidente(asig: AsignacionPendiente): void {
    if (this.dialogAbierto) return;
    this.dialogAbierto = true;
    this.dialog
      .open(IncidenteDetalleDialogComponent, {
        width: '780px',
        maxWidth: '95vw',
        data: { incidenteId: asig.incidente_id },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => { this.dialogAbierto = false; });
  }
}
