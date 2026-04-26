import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { NotificacionService } from './notificacion.service';

@Injectable({ providedIn: 'root' })
export class FirebaseMessagingService {
  private readonly messaging = (() => {
    const app = getApps().length ? getApps()[0] : initializeApp(environment.firebaseConfig);
    return getMessaging(app);
  })();

  constructor(
    private snackBar: MatSnackBar,
    private notificacionService: NotificacionService
  ) {}

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
      const title = payload.notification?.title ?? 'Nueva emergencia';
      const body = payload.notification?.body ?? '';
      this.snackBar.open(`${title}: ${body}`, 'Ver', { duration: 5000 });
      this.notificacionService.cargarPendientes(tallerId).subscribe();
    });
  }
}
