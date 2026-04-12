import { Component, OnDestroy, Inject, ElementRef, ViewChild, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleMapsModule } from '@angular/google-maps';
import { environment } from '../../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    GoogleMapsModule
  ],
  template: `
    <h2 mat-dialog-title>Seleccionar ubicación del taller</h2>

    <mat-dialog-content>
      <input
        #searchInput
        type="text"
        placeholder="Buscar dirección o lugar..."
        style="width:100%; box-sizing:border-box; padding:10px 14px; font-size:14px;
               border:1px solid #ccc; border-radius:4px; margin-bottom:12px;
               outline:none; font-family:Roboto,sans-serif;"
      />

      @if (mapsLoaded) {
        <google-map
          width="100%"
          height="380px"
          [center]="center"
          [zoom]="zoom"
          [options]="mapOptions"
          (mapClick)="onMapClick($event)">
          @if (markerPosition) {
            <map-marker [position]="markerPosition" [options]="markerOptions"></map-marker>
          }
        </google-map>
      } @else {
        <div style="width:100%; height:380px; display:flex; align-items:center; justify-content:center; background:#f5f5f5; border-radius:4px;">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      @if (lat !== null && lng !== null) {
        <p style="margin:8px 0 0; font-size:13px; color:#555; text-align:center;">
          <mat-icon style="font-size:16px; vertical-align:middle; color:#1976d2;">location_on</mat-icon>
          {{ lat.toFixed(6) }}, {{ lng.toFixed(6) }}
        </p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="lat === null" (click)="confirmar()">
        Confirmar ubicación
      </button>
    </mat-dialog-actions>
  `
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  mapsLoaded = false;
  lat: number | null = null;
  lng: number | null = null;
  markerPosition: google.maps.LatLngLiteral | null = null;
  center: google.maps.LatLngLiteral = { lat: -16.5000, lng: -68.1500 };
  zoom = 13;

  mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  };

  markerOptions: google.maps.MarkerOptions = { draggable: true };

  private searchBox: any;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<MapPickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lat?: number; lng?: number }
  ) {}

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined') { resolve(); return; }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  ngAfterViewInit(): void {
    this.loadGoogleMapsScript().then(() => {
      this.mapsLoaded = true;
      this.cdr.detectChanges();
      this.initMap();
    });
  }

  private initMap(): void {
    // Si ya hay coordenadas, centrar ahí
    if (this.data?.lat && this.data?.lng) {
      this.lat = this.data.lat;
      this.lng = this.data.lng;
      this.center = { lat: this.lat, lng: this.lng };
      this.markerPosition = { lat: this.lat, lng: this.lng };
      this.cdr.detectChanges();
    } else {
      // Centrar en la ubicación actual del dispositivo
      navigator.geolocation?.getCurrentPosition(
        (pos) => this.ngZone.run(() => {
          this.center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          this.zoom = 15;
          this.cdr.detectChanges();
        }),
        () => {} // Si falla, queda en La Paz
      );
    }

    // Inicializar SearchBox (más simple y confiable que Autocomplete)
    setTimeout(() => {
      this.searchBox = new google.maps.places.SearchBox(
        this.searchInput.nativeElement
      );

      this.searchBox.addListener('places_changed', () => {
        this.ngZone.run(() => {
          const places = this.searchBox.getPlaces();
          if (!places || places.length === 0) return;

          const place = places[0];
          if (!place.geometry?.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          this.lat = lat;
          this.lng = lng;
          this.center = { lat, lng };
          this.zoom = 16;
          this.markerPosition = { lat, lng };
          this.cdr.detectChanges();
        });
      });
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.searchBox) {
      google.maps.event.clearInstanceListeners(this.searchBox);
    }
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) return;
    this.lat = event.latLng.lat();
    this.lng = event.latLng.lng();
    this.markerPosition = { lat: this.lat, lng: this.lng };
  }

  confirmar(): void {
    this.dialogRef.close({ lat: this.lat, lng: this.lng });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
