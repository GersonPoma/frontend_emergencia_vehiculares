import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../../../services/api.service';
import { ConfigService } from '../../../../services/config.service';
import { Rol } from '../../../../models/cuentas/rol.model';
import { Pagination } from '../../../../models/pagination.model';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.scss'
})
export class CrearUsuarioComponent implements OnInit, OnDestroy {
  form: FormGroup;
  roles: Rol[] = [];
  isLoading = false;
  isSaving = false;
  isEditMode = false;

  rolesPagina = 1;
  rolesTotalPaginas = 1;
  rolesTotalItems = 0;
  rolesLimite = 10;

  Math = Math;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CrearUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.usuario;

    this.form = this.formBuilder.group({
      username: [
        data?.usuario?.username || '',
        [Validators.required, Validators.minLength(3)]
      ],
      password: [
        '',
        this.isEditMode
          ? [Validators.minLength(6)]
          : [Validators.required, Validators.minLength(6)]
      ],
      rol_id: [data?.usuario?.rol_id || null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarRoles(): void {
    this.isLoading = true;
    const url = this.configService.getApiUrl('roles');

    this.apiService.getWithPagination<Rol>(url, this.rolesPagina, this.rolesLimite)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Pagination<Rol>) => {
          this.roles = data.datos;
          this.rolesTotalItems = data.total;
          this.rolesTotalPaginas = data.total_paginas;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Error al cargar los roles', 'Cerrar', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  nextRolesPage(): void {
    if (this.rolesPagina >= this.rolesTotalPaginas) return;
    this.rolesPagina++;
    this.cargarRoles();
  }

  previousRolesPage(): void {
    if (this.rolesPagina <= 1) return;
    this.rolesPagina--;
    this.cargarRoles();
  }

  onRolSelected(event: MatSelectionListChange): void {
    if (event.options.length > 0) {
      this.form.patchValue({ rol_id: event.options[0].value });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.snackBar.open('Por favor completa todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const url = this.configService.getApiUrl('usuarios');
    const formValues = this.form.getRawValue();

    const datos: any = {
      username: formValues.username,
      rol_id: formValues.rol_id
    };

    if (!this.isEditMode || formValues.password) {
      datos.password = formValues.password;
    }

    const request$ = this.isEditMode
      ? this.apiService.update(url, this.data.usuario.id, datos)
      : this.apiService.create(url, datos);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        this.isSaving = false;
        const msg = error.error?.detail || `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el usuario`;
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
