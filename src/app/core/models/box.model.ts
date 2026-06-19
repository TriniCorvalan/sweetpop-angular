export type BoxId = 'box-simple' | 'box-double' | 'box-triple';

export interface Box {
  id: BoxId;
  name: string;
  wallsCount: number;
  boxPrice: number;
  discount: number;
  image: string;
  description: string;
}
