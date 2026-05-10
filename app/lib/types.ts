export interface Unit {
  m2: number | null;
  precio_total: number | null;
  precio_m2: number | null;
  recamaras: number | null;
  forma_de_entrega: string | null;
}

export interface Project {
  proyecto: string;
  lat: number;
  lng: number;
  municipio: string | null;
  zona: string | null;
  zona_ciudad: string;
  tipo_de_proyecto: string | null;
  recamaras: number[];
  precio_desde: number | null;
  precio_hasta: number | null;
  fecha_de_entrega: string | null;
  acepta_airbnb: boolean;
  amenidades: string[];
  units: Unit[];
  investment_score?: number;
}
