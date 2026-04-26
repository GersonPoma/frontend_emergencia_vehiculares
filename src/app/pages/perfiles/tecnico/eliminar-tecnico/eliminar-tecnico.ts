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
  templateUrl: './eliminar-tecnico.html',
  styleUrl: './eliminar-tecnico.scss',
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
