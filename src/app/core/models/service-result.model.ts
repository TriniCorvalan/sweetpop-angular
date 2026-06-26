import { BoxId } from './box.model';

/**
 * Resultado estándar devuelto por servicios de negocio.
 * @usageNotes Campos opcionales (`redirect`, `needsConfirm`, etc.) según la operación.
 */
export interface ServiceResult {
  success: boolean;
  message: string;
  redirect?: string;
  needsConfirm?: boolean;
  boxId?: BoxId;
  filled?: number;
  complete?: boolean;
}
