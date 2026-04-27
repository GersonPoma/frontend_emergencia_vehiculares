import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { ConfigService } from '../../../../services/config.service';
import { Servicio, ServicioCrear, ServicioActualizar } from '../../../../models/perfiles/servicio.model';

@Component({
  selector: 'app-crear-servicio',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './crear-servicio.html'
})
export class CrearServicioComponent implements OnInit, OnDestroy {
  isLoading = false;
  isEditing: boolean;

  categorias = ['Motor', 'Choque', 'Llanta', 'Bateria', 'Otros'];

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    categoria: new FormControl('', [Validators.required]),
    precio: new FormControl<number | null>(null, [Validators.required, Validators.min(0)])
  });

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    public dialogRef: MatDialogRef<CrearServicioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tallerId: number; servicio?: Servicio }
  ) {
    this.isEditing = !!data.servicio;
  }

  ngOnInit(): void {
    if (this.isEditing && this.data.servicio) {
      this.form.patchValue({
        nombre: this.data.servicio.nombre,
        categoria: this.data.servicio.categoria,
        precio: this.data.servicio.precio
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;

    if (this.isEditing) {
      const data: ServicioActualizar = {
        nombre: this.form.value.nombre!,
        categoria: this.form.value.categoria!,
        precio: this.form.value.precio!
      };
      const url = this.configService.getApiUrl('servicios-taller');
      this.apiService.update<Servicio>(url, this.data.servicio!.id, data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => { this.isLoading = false; this.dialogRef.close(true); },
          error: (err) => { this.isLoading = false; console.error(err); }
        });
    } else {
      const data: ServicioCrear = {
        nombre: this.form.value.nombre!,
        categoria: this.form.value.categoria!,
        precio: this.form.value.precio!,
        taller_id: this.data.tallerId
      };
      const url = this.configService.getApiUrl('servicios-taller');
      console.log('Creando servicio con datos:', data);
      this.apiService.create<Servicio>(url, data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => { this.isLoading = false; this.dialogRef.close(true); },
          error: (err) => { this.isLoading = false; console.error(err); }
        });
    }
  }

  cancelar(): void { this.dialogRef.close(); }
}
