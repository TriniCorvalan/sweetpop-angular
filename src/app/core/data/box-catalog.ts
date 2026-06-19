import { Box } from '../models/box.model';

export const BOX_CATALOG: Box[] = [
  {
    id: 'box-simple',
    name: 'Caja simple',
    wallsCount: 4,
    boxPrice: 4990,
    discount: 0.1,
    image: 'assets/img/boxes/level-1.jpg',
    description: '1 nivel, 4 paredes personalizables.',
  },
  {
    id: 'box-double',
    name: 'Caja doble',
    wallsCount: 8,
    boxPrice: 9990,
    discount: 0.15,
    image: 'assets/img/boxes/level-2.jpg',
    description: '2 niveles anidados, 8 paredes en total.',
  },
  {
    id: 'box-triple',
    name: 'Caja triple',
    wallsCount: 12,
    boxPrice: 11990,
    discount: 0.2,
    image: 'assets/img/boxes/level-3.jpg',
    description: '3 niveles anidados, experiencia completa de 12 paredes.',
  },
];
