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
  templateUrl: './eliminar-servicio.html',
  styleUrl: './eliminar-servicio.scss',
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
