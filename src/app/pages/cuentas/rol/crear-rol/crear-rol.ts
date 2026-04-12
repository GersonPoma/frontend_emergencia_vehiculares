import { Component, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../../../services/api.service';
import { ConfigService } from '../../../../services/config.service';

@Component({
  selector: 'app-crear-rol',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './crear-rol.html',
  styleUrl: './crear-rol.scss'
})
export class CrearRolComponent implements OnDestroy {
  form: FormGroup;
  isSaving = false;
  isEditMode = false;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CrearRolComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.rol;
    this.form = this.formBuilder.group({
      nombre: [data?.rol?.nombre || '', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.snackBar.open('Por favor completa todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const url = this.configService.getApiUrl('roles');
    const datos = { nombre: this.form.value.nombre };

    const request$ = this.isEditMode
      ? this.apiService.update(url, this.data.rol.id, datos)
      : this.apiService.create(url, datos);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        this.isSaving = false;
        const msg = error.error?.detail || `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el rol`;
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
