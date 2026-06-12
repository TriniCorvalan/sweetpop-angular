import { Component } from '@angular/core';

import { CategoryProducts } from '../../shared/category-products/category-products';

@Component({
  selector: 'app-chocolates',
  imports: [CategoryProducts],
  templateUrl: './chocolates.html',
})
export class Chocolates {}
