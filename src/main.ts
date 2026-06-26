/**
 * @fileoverview Punto de entrada de la aplicación Angular.
 * Arranca el componente raíz con la configuración definida en app.config.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/** Inicializa la aplicación SweetPop en el navegador. */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
