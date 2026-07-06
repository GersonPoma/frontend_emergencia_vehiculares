import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { ConfigService } from '../../../../services/config.service';
import { MapPickerComponent } from '../map-picker/map-picker';
import { TallerActualizar, TallerSalida } from '../../../../models/perfiles/taller.model';

@Component({
  selector: 'app-configuracion-taller',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './configuracion-taller.html',
  styleUrl: './configuracion-taller.scss',
})
export class ConfiguracionTallerComponent implements OnInit, OnDestroy {
  isLoading = false;
  isSaving = false;
  ubicacionObtenida = false;

  tallerId: number | null = null;

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    telefono: new FormControl('', [Validators.required]),
    direccion: new FormControl('', [Validators.required]),
    hora_apertura: new FormControl('', [Validators.required]),
    hora_cierre: new FormControl('', [Validators.required]),
    latitud: new FormControl<number | null>(null, [Validators.required]),
    longitud: new FormControl<number | null>(null, [Validators.required]),
    disponible: new FormControl(true, [Validators.required]),
  });

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private configService: ConfigService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.tallerId = this.authService.getCurrentAuthState().id_taller;

    if (!this.tallerId) {
      this.snackBar.open('No tienes un taller asignado', 'Cerrar', { duration: 5000 });
      return;
    }

    this.cargarTaller();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() {
    return this.form.controls;
  }

  cargarTaller(): void {
    if (!this.tallerId) return;

    this.isLoading = true;
    const url = this.configService.getApiUrl('talleres');

    this.apiService.getById<TallerSalida>(url, this.tallerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (taller) => {
          this.form.patchValue({
            nombre: taller.nombre,
            telefono: taller.telefono,
            direccion: taller.direccion,
            hora_apertura: this.normalizarHora(taller.hora_apertura),
            hora_cierre: this.normalizarHora(taller.hora_cierre),
            latitud: taller.latitud,
            longitud: taller.longitud,
            disponible: taller.disponible,
          });
          this.ubicacionObtenida = true;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('No se pudo cargar la configuracion del taller', 'Cerrar', { duration: 5000 });
        }
      });
  }

  abrirMapa(): void {
    const dialogRef = this.dialog.open(MapPickerComponent, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        lat: this.f['latitud'].value,
        lng: this.f['longitud'].value,
      }
    });

    dialogRef.afterClosed().subscribe((result: { lat: number; lng: number } | undefined) => {
      if (result) {
        this.form.patchValue({ latitud: result.lat, longitud: result.lng });
        this.ubicacionObtenida = true;
      }
    });
  }

  guardar(): void {
    if (this.form.invalid || !this.tallerId) return;

    this.isSaving = true;
    const data: TallerActualizar = {
      nombre: this.form.value.nombre!,
      telefono: this.form.value.telefono!,
      direccion: this.form.value.direccion!,
      hora_apertura: this.form.value.hora_apertura!,
      hora_cierre: this.form.value.hora_cierre!,
      latitud: this.form.value.latitud!,
      longitud: this.form.value.longitud!,
      disponible: this.form.value.disponible!,
    };

    const url = this.configService.getApiUrl('talleres');

    this.apiService.update<TallerSalida>(url, this.tallerId, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.snackBar.open('Taller actualizado exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          this.isSaving = false;
          const msg = error.error?.detail || 'Error al actualizar el taller';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        }
      });
  }

  private normalizarHora(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.length >= 5 ? value.substring(0, 5) : value;
  }
}
