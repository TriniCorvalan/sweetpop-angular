import { HttpErrorResponse } from '@angular/common/http';

import {
  INVENTORY_CONNECTION_ERROR_MESSAGE,
  inventoryHttpErrorMessage,
  isApiConnectionError,
} from './api-connection';

describe('api-connection', () => {
  it('detecta fallo de conexion con status 0', () => {
    const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    expect(isApiConnectionError(error)).toBe(true);
  });

  it('no trata errores HTTP con status como fallo de conexion', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    expect(isApiConnectionError(error)).toBe(false);
    expect(isApiConnectionError(new Error('boom'))).toBe(false);
  });

  it('devuelve mensaje de conexion o el fallback segun el error', () => {
    const connectionError = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    const serverError = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });

    expect(inventoryHttpErrorMessage(connectionError, 'Fallback')).toBe(
      INVENTORY_CONNECTION_ERROR_MESSAGE,
    );
    expect(inventoryHttpErrorMessage(serverError, 'Fallback')).toBe('Fallback');
  });
});
