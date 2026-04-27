import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { ConfigService } from 'src/app/services/config.service';
import { Incidente } from 'src/app/models/emergencias/incidente.model';
import { Evidencia } from 'src/app/models/emergencias/evidencia.model';
import { Analisis } from 'src/app/models/ia/analisis.model';
import { Pagination } from 'src/app/models/pagination.model';

interface IncidenteDetalleDialogData {
  incidenteId: number;
}

@Component({
  selector: 'app-incidente-detalle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './incidente-detalle-dialog.html',
  styleUrl: './incidente-detalle-dialog.scss',
})
export class IncidenteDetalleDialogComponent implements OnInit, OnDestroy {
  isLoading = true;
  errorMessage = '';

  incidente: Incidente | null = null;
  evidencias: Evidencia[] = [];
  analisis: Analisis | null = null;
  mapaEmbedUrl: SafeResourceUrl | null = null;

  get evidenciasFoto(): Evidencia[] {
    return this.filtrarPorTipo('Foto');
  }

  get evidenciasAudio(): Evidencia[] {
    return this.filtrarPorTipo('Audio');
  }

  get evidenciasTexto(): Evidencia[] {
    return this.filtrarPorTipo('Texto');
  }

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    private sanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<IncidenteDetalleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncidenteDetalleDialogData
  ) {}

  ngOnInit(): void {
    this.cargarDetalle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDetalle(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.mapaEmbedUrl = null;

    forkJoin({
      incidente: this.obtenerIncidentePorId(this.data.incidenteId),
      evidenciasPage: this.obtenerEvidenciasPorIncidente(this.data.incidenteId, 1, 50),
      analisis: this.obtenerAnalisisPorIncidente(this.data.incidenteId).pipe(catchError(() => of(null))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ incidente, evidenciasPage, analisis }) => {
          this.incidente = incidente;
          this.evidencias = evidenciasPage.datos;
          this.analisis = analisis;
          this.mapaEmbedUrl = this.construirMapaEmbedUrl(
            incidente.latitud,
            incidente.longitud
          );
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.detail || 'No se pudo cargar el incidente';
          this.isLoading = false;
        },
      });
  }

  abrirMapa(): void {
    if (!this.incidente) return;
    const { latitud, longitud } = this.incidente;
    const url = `https://www.google.com/maps?q=${latitud},${longitud}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private obtenerIncidentePorId(incidenteId: number): Observable<Incidente> {
    const url = this.configService.getApiUrl('incidentes');
    return this.apiService.getById<Incidente>(url, incidenteId);
  }

  private obtenerEvidenciasPorIncidente(
    incidenteId: number,
    pagina: number,
    limite: number
  ): Observable<Pagination<Evidencia>> {
    const url = this.configService.getApiUrl(`evidencias/incidente/${incidenteId}`);
    return this.apiService.getWithPagination<Evidencia>(url, pagina, limite);
  }

  private obtenerAnalisisPorIncidente(incidenteId: number): Observable<Analisis> {
    const url = this.configService.getApiUrl(`ia/analisis/incidente`);
    return this.apiService.getById<Analisis>(url, incidenteId);
  }

  private construirMapaEmbedUrl(latitud: number, longitud: number): SafeResourceUrl {
    const coords = `${latitud},${longitud}`;
    const embedUrl = `https://maps.google.com/maps?q=${coords}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  claseEstado(estado: string): string {
    return estado.toLowerCase().replace(/\s+/g, '-');
  }

  tieneUrl(evidencia: Evidencia): boolean {
    return typeof evidencia.url === 'string' && evidencia.url.trim().length > 0;
  }

  trackByEvidenciaId(_: number, evidencia: Evidencia): number {
    return evidencia.id;
  }

  private filtrarPorTipo(tipo: Evidencia['tipo']): Evidencia[] {
    return this.evidencias.filter(evidencia => evidencia.tipo === tipo);
  }
}
