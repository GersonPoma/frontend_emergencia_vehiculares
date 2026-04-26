import { Component, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Servicio } from '../../../models/perfiles/servicio.model';
import { Pagination } from '../../../models/pagination.model';
import { ApiService } from '../../../services/api.service';
import { ConfigService } from '../../../services/config.service';
import { AuthService } from '../../../services/auth.service';
import { CrearServicioComponent } from './crear-servicio/crear-servicio';
import { EliminarServicioComponent } from './eliminar-servicio/eliminar-servicio';

@Component({
  selector: 'app-servicio',
  standalone: true,
  imports: [
    DecimalPipe,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './servicio.html',
  styleUrl: './servicio.scss'
})
export class ServicioComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['id', 'nombre', 'categoria', 'precio', 'acciones'];
  dataSource: Servicio[] = [];
  isMobile = false;

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;

  private tallerId: number | null = null;
  private apiUrl: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.tallerId = this.authService.getCurrentAuthState().id_taller;

    if (!this.tallerId) {
      this.snackBar.open('No tienes un taller asignado', 'Cerrar', { duration: 5000 });
      return;
    }

    this.apiUrl = this.configService.getApiUrl(`servicios-taller/taller/${this.tallerId}`);

    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        this.displayedColumns = result.matches
          ? ['nombre', 'precio', 'acciones']
          : ['id', 'nombre', 'categoria', 'precio', 'acciones'];
      });

    this.loadServicios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServicios(): void {
    if (!this.tallerId) return;
    this.isLoading = true;

    this.apiService.getWithPagination<Servicio>(this.apiUrl, this.currentPage + 1, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Pagination<Servicio>) => {
          this.dataSource = data.datos;
          this.totalItems = data.total;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Error al cargar los servicios', 'Cerrar', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadServicios();
  }

  crearServicio(): void {
    const dialogRef = this.dialog.open(CrearServicioComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { tallerId: this.tallerId }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.snackBar.open('Servicio creado exitosamente', 'OK', { duration: 3000 });
        this.currentPage = 0;
        this.loadServicios();
      }
    });
  }

  editarServicio(servicio: Servicio): void {
    const dialogRef = this.dialog.open(CrearServicioComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { tallerId: this.tallerId, servicio }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.snackBar.open('Servicio actualizado exitosamente', 'OK', { duration: 3000 });
        this.loadServicios();
      }
    });
  }

  eliminarServicio(servicio: Servicio): void {
    const dialogRef = this.dialog.open(EliminarServicioComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: { servicio }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.snackBar.open('Servicio eliminado exitosamente', 'OK', { duration: 3000 });
        this.currentPage = 0;
        this.loadServicios();
      }
    });
  }
}
