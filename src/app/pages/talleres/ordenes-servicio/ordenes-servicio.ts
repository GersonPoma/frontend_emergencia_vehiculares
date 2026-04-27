import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, LowerCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { ConfigService } from '../../../services/config.service';
import { GenerarOrdenPagoDialogComponent } from './generar-orden-pago-dialog/generar-orden-pago-dialog';

export interface OrdenServicio {
  id: number;
  fecha_hora: string;
  tiempo_estimado_llegada_segundos: number;
  tiempo_estimado_llegada: string;
  estado: string;
  asignacion_candidato_id: number;
  incidente_id: number;
  nombre_cliente: string;
}

@Component({
  selector: 'app-ordenes-servicio',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    LowerCasePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './ordenes-servicio.html',
  styleUrl: './ordenes-servicio.scss',
})
export class OrdenesServicioComponent implements OnInit, OnDestroy {
  readonly ESTADO_FINALIZADO = 'Finalizado';

  displayedColumns = ['id', 'incidente_id', 'nombre_cliente', 'fecha_hora', 'tiempo_estimado_llegada', 'estado', 'acciones'];

  ordenes: OrdenServicio[] = [];
  isLoading = false;
  totalRegistros = 0;
  paginaActual = 0;
  readonly limite = 10;

  private tallerId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
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
      `ordenes-servicio/taller/${this.tallerId}`
    );
    this.apiService
      .getWithPagination<OrdenServicio>(url, this.paginaActual + 1, this.limite)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pag) => {
          this.ordenes = pag.datos;
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

  generarOrdenPago(orden: OrdenServicio): void {
    const ref = this.dialog.open(GenerarOrdenPagoDialogComponent, {
      width: '580px',
      maxWidth: '95vw',
      data: { ordenId: orden.id, tallerId: this.tallerId },
    });

    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((ok) => {
      if (ok) {
        this.snackBar.open('Orden de pago generada correctamente', 'Cerrar', { duration: 3000 });
        this.cargar();
      }
    });
  }
}
