import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Tecnico } from '../../../models/perfiles/tecnico.model';
import { Pagination } from '../../../models/pagination.model';
import { ApiService } from '../../../services/api.service';
import { ConfigService } from '../../../services/config.service';
import { AuthService } from '../../../services/auth.service';
import { CrearTecnicoComponent } from './crear-tecnico/crear-tecnico';
import { EliminarTecnicoComponent } from './eliminar-tecnico/eliminar-tecnico';

@Component({
  selector: 'app-tecnico',
  standalone: true,
  imports: [
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
  templateUrl: './tecnico.html',
  styleUrl: './tecnico.scss'
})
export class TecnicoComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['id', 'nombre', 'apellido', 'telefono', 'acciones'];
  dataSource: Tecnico[] = [];
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

    this.apiUrl = this.configService.getApiUrl(`tecnicos/taller/${this.tallerId}`);

    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        this.displayedColumns = result.matches
          ? ['nombre', 'apellido', 'acciones']
          : ['id', 'nombre', 'apellido', 'telefono', 'acciones'];
      });

    this.loadTecnicos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTecnicos(): void {
    if (!this.tallerId) return;
    this.isLoading = true;

    this.apiService.getWithPagination<Tecnico>(this.apiUrl, this.currentPage + 1, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Pagination<Tecnico>) => {
          this.dataSource = data.datos;
          this.totalItems = data.total;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Error al cargar los técnicos', 'Cerrar', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTecnicos();
  }

  crearTecnico(): void {
    const dialogRef = this.dialog.open(CrearTecnicoComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { tallerId: this.tallerId }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.snackBar.open('Técnico creado exitosamente', 'OK', { duration: 3000 });
        this.currentPage = 0;
        this.loadTecnicos();
      }
    });
  }

  editarTecnico(tecnico: Tecnico): void {
    const dialogRef = this.dialog.open(CrearTecnicoComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { tallerId: this.tallerId, tecnico }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.snackBar.open('Técnico actualizado exitosamente', 'OK', { duration: 3000 });
        this.loadTecnicos();
      }
    });
  }

  eliminarTecnico(tecnico: Tecnico): void {
    const dialogRef = this.dialog.open(EliminarTecnicoComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: { tecnico }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.currentPage = 0;
        this.loadTecnicos();
      }
    });
  }
}
