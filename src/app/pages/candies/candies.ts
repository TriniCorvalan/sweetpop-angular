import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BoxDraftBar } from '../../shared/box-draft-bar/box-draft-bar';
import { CategoryCatalogCards } from '../../shared/category-catalog-cards/category-catalog-cards';

@Component({
  selector: 'app-candies',
  imports: [RouterLink, BoxDraftBar, CategoryCatalogCards],
  templateUrl: './candies.html',
})
export class Candies {}
