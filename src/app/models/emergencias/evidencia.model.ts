export type TipoEvidencia = 'Foto' | 'Audio' | 'Texto';

export interface Evidencia {
  id: number;
  tipo: TipoEvidencia;
  url: string | null;
  fecha: string;
  incidente_id: number;
}
