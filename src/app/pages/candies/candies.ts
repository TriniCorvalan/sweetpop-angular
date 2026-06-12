import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BoxDraftBar } from '../../shared/box-draft-bar/box-draft-bar';

@Component({
  selector: 'app-candies',
  imports: [RouterLink, BoxDraftBar],
  templateUrl: './candies.html',
})
export class Candies {}
