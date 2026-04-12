import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ConfigService } from '../../../services/config.service';
import { TallerRegistrar, TallerSalida } from '../../../models/perfiles/taller.model';
import { MapPickerComponent } from './map-picker/map-picker';

@Component({
  selector: 'app-registrar-taller',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './registrar-taller.html',
  styleUrl: './registrar-taller.scss'
})
export class RegistrarTallerComponent implements OnDestroy {
  hidePassword = true;
  isLoading = false;
  ubicacionObtenida = false;

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    telefono: new FormControl('', [Validators.required]),
    direccion: new FormControl('', [Validators.required]),
    latitud: new FormControl<number | null>(null, [Validators.required]),
    longitud: new FormControl<number | null>(null, [Validators.required]),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  abrirMapa(): void {
    const dialogRef = this.dialog.open(MapPickerComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: {
        lat: this.f['latitud'].value,
        lng: this.f['longitud'].value
      }
    });

    dialogRef.afterClosed().subscribe((result: { lat: number; lng: number } | undefined) => {
      if (result) {
        this.form.patchValue({ latitud: result.lat, longitud: result.lng });
        this.ubicacionObtenida = true;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;

    const data: TallerRegistrar = {
      nombre: this.form.value.nombre!,
      telefono: this.form.value.telefono!,
      direccion: this.form.value.direccion!,
      latitud: this.form.value.latitud!,
      longitud: this.form.value.longitud!,
      username: this.form.value.username!,
      password: this.form.value.password!
    };

    const url = this.configService.getApiUrl('talleres/registrar');

    this.apiService.create<TallerSalida>(url, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Taller registrado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          const msg = error.error?.detail || 'Error al registrar el taller';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
  }
}
