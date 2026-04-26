import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificacionService } from './notificacion.service';

@Injectable({ providedIn: 'root' })
export class FirebaseMessagingService {
  private readonly messaging = (() => {
    const app = getApps().length ? getApps()[0] : initializeApp(environment.firebaseConfig);
    return getMessaging(app);
  })();
  private audioContext: AudioContext | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private notificacionService: NotificacionService,
    private router: Router
  ) {
    this.inicializarUnlockDeAudio();
  }

  async solicitarPermisoYRegistrarToken(usuarioId: number): Promise<void> {
    try {
      if (!('Notification' in window) || Notification.permission === 'denied') return;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: swReg,
      });

      if (token) {
        this.notificacionService.registrarFcmToken(usuarioId, token).subscribe();
      }
    } catch (err) {
      console.error('FCM setup error:', err);
    }
  }

  // Retorna la función de unsubscribe para llamar en ngOnDestroy
  escucharMensajesForeground(tallerId: number): () => void {
    return onMessage(this.messaging, payload => {
      this.reproducirSonidoForeground();
      const incidenteId = this.extraerIncidenteId(payload);
      const title = payload.data?.['titulo'] ?? 'Nueva emergencia';
      const body = payload.data?.['cuerpo'] ?? '';
      const message = body ? `${title}: ${body}` : title;
      this.snackBar.open(message, 'Ver incidente', {
        duration: 6000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['fcm-snackbar']
      }).onAction().pipe(take(1)).subscribe(() => {
        if (incidenteId) {
          void this.router.navigate(['/notificaciones'], {
            queryParams: { incidente: incidenteId }
          });
          return;
        }

        void this.router.navigate(['/notificaciones']);
      });
      this.notificacionService.cargarPendientes(tallerId).subscribe();
    });
  }

  private extraerIncidenteId(payload: MessagePayload): number | null {
    const rawId =
      payload.data?.['incidente_id'] ??
      payload.data?.['incidenteId'] ??
      payload.data?.['id_incidente'];

    if (!rawId) return null;

    const incidenteId = Number(rawId);
    if (!Number.isInteger(incidenteId) || incidenteId <= 0) return null;

    return incidenteId;
  }

  private inicializarUnlockDeAudio(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      void this.intentarActivarAudio();
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  private obtenerAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.audioContext) return this.audioContext;

    const windowWithWebkit = window as Window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const globalWithAudio = globalThis as typeof globalThis & {
      AudioContext?: typeof AudioContext;
    };
    const AudioContextCtor = globalWithAudio.AudioContext ?? windowWithWebkit.webkitAudioContext;

    if (!AudioContextCtor) return null;

    this.audioContext = new AudioContextCtor();
    return this.audioContext;
  }

  private async intentarActivarAudio(): Promise<void> {
    const ctx = this.obtenerAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Ignorar bloqueos del navegador; se reintentara al llegar una notificacion.
      }
    }
  }

  private reproducirSonidoForeground(): void {
    const ctx = this.obtenerAudioContext();
    if (!ctx) return;

    const beep = () => {
      // Beep corto y limpio para alertar sin ser invasivo.
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.26);
    };

    if (ctx.state === 'suspended') {
      void ctx.resume().then(beep).catch(() => {});
      return;
    }

    beep();
  }
}
