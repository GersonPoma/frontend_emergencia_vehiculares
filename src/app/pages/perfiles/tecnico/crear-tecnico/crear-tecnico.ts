import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { ConfigService } from '../../../../services/config.service';
import { Tecnico, TecnicoCrear, TecnicoActualizar } from '../../../../models/perfiles/tecnico.model';

@Component({
  selector: 'app-crear-tecnico',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './crear-tecnico.html'
})
export class CrearTecnicoComponent implements OnInit, OnDestroy {
  isLoading = false;
  hidePassword = true;
  isEditing: boolean;

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellido: new FormControl('', [Validators.required]),
    telefono: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    public dialogRef: MatDialogRef<CrearTecnicoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tallerId: number; tecnico?: Tecnico }
  ) {
    this.isEditing = !!data.tecnico;
  }

  ngOnInit(): void {
    if (this.isEditing && this.data.tecnico) {
      this.form.patchValue({
        nombre: this.data.tecnico.nombre,
        apellido: this.data.tecnico.apellido,
        telefono: this.data.tecnico.telefono
      });
      this.form.get('username')?.disable();
      this.form.get('password')?.disable();
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
      const data: TecnicoActualizar = {
        nombre: this.form.value.nombre!,
        apellido: this.form.value.apellido!,
        telefono: this.form.value.telefono!
      };
      const url = this.configService.getApiUrl('tecnicos');
      this.apiService.update<Tecnico>(url, this.data.tecnico!.id, data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => { this.isLoading = false; this.dialogRef.close(true); },
          error: (err) => { this.isLoading = false; console.error(err); }
        });
    } else {
      const data: TecnicoCrear = {
        nombre: this.form.value.nombre!,
        apellido: this.form.value.apellido!,
        telefono: this.form.value.telefono!,
        taller_id: this.data.tallerId,
        username: this.form.value.username!,
        password: this.form.value.password!
      };
      const url = this.configService.getApiUrl('tecnicos');
      this.apiService.create<Tecnico>(url, data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => { this.isLoading = false; this.dialogRef.close(true); },
          error: (err) => { this.isLoading = false; console.error(err); }
        });
    }
  }

  cancelar(): void { this.dialogRef.close(); }
}
