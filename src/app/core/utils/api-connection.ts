import { HttpErrorResponse } from '@angular/common/http';

/** Mensaje cuando no se puede contactar a json-server (inventario). */
export const INVENTORY_CONNECTION_ERROR_MESSAGE =
  'Error de conexión con el servidor de inventario. Verifica que json-server esté en ejecución (npm run api).';

/**
 * Indica si el error HTTP corresponde a un fallo de conexión (API caída o inalcanzable).
 * @param error Error recibido en el callback `error` de una petición HTTP.
 * @returns `true` cuando el status es `0` (sin respuesta del servidor).
 */
export function isApiConnectionError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 0;
}

/**
 * Mensaje de error de inventario: conexión caída o fallback de la operación.
 * @param error Error HTTP recibido.
 * @param fallback Mensaje genérico si no es un fallo de conexión.
 * @returns Texto a mostrar en la alerta.
 */
export function inventoryHttpErrorMessage(error: unknown, fallback: string): string {
  return isApiConnectionError(error) ? INVENTORY_CONNECTION_ERROR_MESSAGE : fallback;
}
