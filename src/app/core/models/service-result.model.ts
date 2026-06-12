import { BoxId } from './box.model';

export interface ServiceResult {
  success: boolean;
  message: string;
  redirect?: string;
  needsConfirm?: boolean;
  boxId?: BoxId;
  filled?: number;
  complete?: boolean;
}
