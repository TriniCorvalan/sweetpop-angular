/** Identificador de los tipos de caja del catálogo. @usageNotes Valores: box-simple, box-double, box-triple. */
export type BoxId = 'box-simple' | 'box-double' | 'box-triple';

/**
 * Caja del catálogo que el cliente puede personalizar.
 * @usageNotes Cargada desde la API DummyJSON; el descuento aplica al total de la caja completa.
 */
export interface Box {
  id: BoxId;
  name: string;
  wallsCount: number;
  boxPrice: number;
  discount: number;
  image: string;
  description: string;
}
