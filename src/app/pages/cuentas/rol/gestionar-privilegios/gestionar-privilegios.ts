import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';

import { ApiService } from '../../../../services/api.service';
import { ConfigService } from '../../../../services/config.service';
import { Privilegio } from '../../../../models/cuentas/privilegio.model';
import { Pagination } from '../../../../models/pagination.model';
import { Rol } from '../../../../models/cuentas/rol.model';

interface PrivilegioItem extends Privilegio {
  asignado: boolean;
  asignadoOriginal: boolean;
}

@Component({
  selector: 'app-gestionar-privilegios',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './gestionar-privilegios.html',
  styleUrl: './gestionar-privilegios.scss'
})
export class GestionarPrivilegiosComponent implements OnInit, OnDestroy {
  privilegios: PrivilegioItem[] = [];
  isLoading = false;
  isSaving = false;

  private destroy$ = new Subject<void>();

  private privilegiosUrl: string;
  private rolPrivilegiosUrl: (rolId: number) => string;

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<GestionarPrivilegiosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rol: Rol }
  ) {
    this.privilegiosUrl = this.configService.getApiUrl('privilegios');
    this.rolPrivilegiosUrl = (rolId: number) => this.configService.getApiUrl(`privilegios/roles/${rolId}/privilegios`);
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarDatos(): void {
    this.isLoading = true;
    const rolId = this.data.rol.id;

    forkJoin({
      todos: this.apiService.getWithPagination<Privilegio>(this.privilegiosUrl, 1, 100),
      asignados: this.apiService.getAll<Privilegio>(this.rolPrivilegiosUrl(rolId))
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ todos, asignados }) => {
          const asignadosIds = new Set(asignados.map(p => p.id));
          this.privilegios = (todos as Pagination<Privilegio>).datos.map(p => ({
            ...p,
            asignado: asignadosIds.has(p.id),
            asignadoOriginal: asignadosIds.has(p.id)
          }));
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Error al cargar los privilegios', 'Cerrar', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  togglePrivilegio(item: PrivilegioItem): void {
    item.asignado = !item.asignado;
  }

  get hayDiferencias(): boolean {
    return this.privilegios.some(p => p.asignado !== p.asignadoOriginal);
  }

  get asignadosCount(): number {
    return this.privilegios.filter(p => p.asignado).length;
  }

  guardar(): void {
    const agregar = this.privilegios.filter(p => p.asignado && !p.asignadoOriginal);
    const quitar = this.privilegios.filter(p => !p.asignado && p.asignadoOriginal);

    if (agregar.length === 0 && quitar.length === 0) {
      this.dialogRef.close();
      return;
    }

    this.isSaving = true;

    const rolId = this.data.rol.id;
    const llamadas = [
      ...agregar.map(p => this.apiService.create(
        this.configService.getApiUrl(`privilegios/roles/${rolId}/privilegios/${p.id}`), {}
      )),
      ...quitar.map(p => this.apiService.delete(
        this.rolPrivilegiosUrl(rolId), p.id
      ))
    ];

    from(llamadas)
      .pipe(
        concatMap(obs => obs),
        toArray(),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.snackBar.open('Privilegios actualizados correctamente', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isSaving = false;
          const msg = error.error?.detail || 'Error al actualizar privilegios';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        }
      });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
