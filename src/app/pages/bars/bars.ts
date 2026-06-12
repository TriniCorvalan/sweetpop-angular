import { Component } from '@angular/core';

import { CategoryProducts } from '../../shared/category-products/category-products';

@Component({
  selector: 'app-bars',
  imports: [CategoryProducts],
  templateUrl: './bars.html',
})
export class Bars {}
