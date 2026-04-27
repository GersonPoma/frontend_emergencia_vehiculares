import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { ConfigService } from '../../../../services/config.service';
import { Servicio } from '../../../../models/perfiles/servicio.model';

export interface GenerarOrdenPagoDialogData {
  ordenId: number;
  tallerId: number;
}

interface ServicioFila {
  servicio: Servicio;
  seleccionado: boolean;
  comentario: string;
}

@Component({
  selector: 'app-generar-orden-pago-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
      MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './generar-orden-pago-dialog.html',
  styleUrl: './generar-orden-pago-dialog.scss',
})
export class GenerarOrdenPagoDialogComponent implements OnInit, OnDestroy {
  filas: ServicioFila[] = [];
  isLoadingServicios = false;
  isSubmitting = false;
  errorCarga: string | null = null;
  errorSubmit: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    public dialogRef: MatDialogRef<GenerarOrdenPagoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GenerarOrdenPagoDialogData,
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarServicios(): void {
    this.isLoadingServicios = true;
    this.errorCarga = null;
    const url = this.configService.getApiUrl(`servicios-taller/taller/${this.data.tallerId}`);
    this.apiService
      .getWithPagination<Servicio>(url, 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pag) => {
          this.filas = pag.datos.map((s) => ({ servicio: s, seleccionado: false, comentario: '' }));
          this.isLoadingServicios = false;
        },
        error: () => {
          this.errorCarga = 'No se pudieron cargar los servicios del taller.';
          this.isLoadingServicios = false;
        },
      });
  }

  get seleccionados(): ServicioFila[] {
    return this.filas.filter((f) => f.seleccionado);
  }

  get total(): number {
    return this.seleccionados.reduce((acc, f) => acc + f.servicio.precio, 0);
  }

  get puedeEnviar(): boolean {
    return this.seleccionados.length > 0 && !this.isSubmitting;
  }

  generar(): void {
    if (!this.puedeEnviar) return;
    this.isSubmitting = true;
    this.errorSubmit = null;

    const body = {
      orden_servicio_id: this.data.ordenId,
      servicios: this.seleccionados.map((f) => ({
        servicio_taller_id: f.servicio.id,
        ...(f.comentario.trim() ? { comentario: f.comentario.trim() } : {}),
      })),
    };

    const url = this.configService.getApiUrl('transacciones/generar-pago');
    this.apiService
      .create<any>(url, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.dialogRef.close(true);
        },
        error: () => {
          this.errorSubmit = 'Error al generar la orden de pago. Intenta nuevamente.';
          this.isSubmitting = false;
        },
      });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
