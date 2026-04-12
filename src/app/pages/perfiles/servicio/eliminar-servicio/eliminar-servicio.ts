import { Component, Inject, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { ConfigService } from '../../../../services/config.service';
import { Servicio } from '../../../../models/perfiles/servicio.model';

@Component({
  selector: 'app-eliminar-servicio',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Eliminar Servicio</h2>
    <mat-dialog-content>
      <p>¿Estás seguro de que deseas eliminar el servicio
        <strong>{{ data.servicio.tipo_servicio }}</strong>?
      </p>
      <p style="color:#999; font-size:13px;">Esta acción no se puede deshacer.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-flat-button color="warn" (click)="confirmar()" [disabled]="isLoading">
        @if (isLoading) {
          <mat-spinner diameter="18" style="display:inline-block; margin-right:6px;"></mat-spinner>
        }
        Eliminar
      </button>
    </mat-dialog-actions>
  `
})
export class EliminarServicioComponent implements OnDestroy {
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    public dialogRef: MatDialogRef<EliminarServicioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { servicio: Servicio }
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  confirmar(): void {
    this.isLoading = true;
    const url = this.configService.getApiUrl('servicios-taller');
    this.apiService.delete(url, this.data.servicio.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.isLoading = false; this.dialogRef.close(true); },
        error: () => { this.isLoading = false; this.dialogRef.close(); }
      });
  }

  cancelar(): void { this.dialogRef.close(); }
}
