import { Component, Inject, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { ConfigService } from '../../../../services/config.service';
import { Tecnico } from '../../../../models/perfiles/tecnico.model';

@Component({
  selector: 'app-eliminar-tecnico',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Eliminar Técnico</h2>
    <mat-dialog-content>
      <p>¿Estás seguro de que deseas eliminar al técnico
        <strong>{{ data.tecnico.nombre }} {{ data.tecnico.apellido }}</strong>?
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
export class EliminarTecnicoComponent implements OnDestroy {
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    public dialogRef: MatDialogRef<EliminarTecnicoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tecnico: Tecnico }
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  confirmar(): void {
    this.isLoading = true;
    const url = this.configService.getApiUrl('tecnicos');
    this.apiService.delete(url, this.data.tecnico.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.isLoading = false; this.dialogRef.close(true); },
        error: () => { this.isLoading = false; this.dialogRef.close(); }
      });
  }

  cancelar(): void { this.dialogRef.close(); }
}
