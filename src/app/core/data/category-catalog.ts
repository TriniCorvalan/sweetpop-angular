import { Category } from '../models/category.model';

export const CATEGORY_CATALOG: Category[] = [
  {
    category: 'gomitas',
    route: '/gomitas',
    image: 'assets/img/categories/gummies/cat-gummies.jpg',
    description: 'Diversas gomitas en forma de ositos, semillas y serpientes.',
    discountLabel: 'hasta 15%',
    linkLabel: 'Ver gomitas',
  },
  {
    category: 'chocolate',
    route: '/chocolates',
    image: 'assets/img/categories/chocolate/cat-chocolate.jpg',
    description: 'Chocolates en forma de besitos, con mantequilla de maní y trufas gourmet.',
    discountLabel: 'hasta 20%',
    linkLabel: 'Ver chocolate',
  },
  {
    category: 'caramelos',
    route: '/caramelos',
    image: 'assets/img/categories/hard-candies/cat-hard-candies.jpg',
    description: 'Caramelos en forma de paletas, masticables y de fruta.',
    discountLabel: 'hasta 10%',
    linkLabel: 'Ver caramelos',
  },
  {
    category: 'barritas',
    route: '/barritas',
    image: 'assets/img/categories/bars/cat-bars.jpg',
    description: 'Barritas en forma de chocolate, nuez y crujientes.',
    discountLabel: 'hasta 15%',
    linkLabel: 'Ver barritas',
  },
];
