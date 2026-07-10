/** Alerta temporal de inventario entre navegaciones. */
export type InventoryFlashAlert = {
  type: 'success' | 'danger';
  message: string;
};

const FLASH_KEY = 'sweetpop.inventory.flash';

/**
 * Guarda una alerta para mostrarla tras navegar a otra vista de inventario.
 * @param alert Tipo y mensaje a persistir.
 * @returns void
 */
export function setInventoryFlash(alert: InventoryFlashAlert): void {
  sessionStorage.setItem(FLASH_KEY, JSON.stringify(alert));
}

/**
 * Lee y elimina la alerta flash de inventario, si existe.
 * @returns La alerta guardada, o `null` si no hay ninguna.
 */
export function consumeInventoryFlash(): InventoryFlashAlert | null {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) {
    return null;
  }

  sessionStorage.removeItem(FLASH_KEY);

  try {
    const alert = JSON.parse(raw) as InventoryFlashAlert;
    if (alert?.type && alert?.message) {
      return alert;
    }
  } catch {
    // Ignorar flash inválido.
  }

  return null;
}
