import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import * as ingresoEgresoActions from '../ingreso-egreso/ingreso-egreso.action';

import { IngresoEgresoService } from '../services/ingreso-egreso.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit, OnDestroy {

  userSubs: Subscription;
  ingresosSubs: Subscription;

  constructor(private store: Store<AppState>, private ingresoEgreso: IngresoEgresoService) { }

  ngOnInit(): void {
    this.userSubs = this.store.select('user')
    .pipe(
      filter(auth => auth.user != null)
    )
    .subscribe( ({user}) => {
 
      this.ingresosSubs = this.ingresoEgreso.initIngresosEgresosListener(user.uid)
        .subscribe(ingresosEgresosFB => {
          this.store.dispatch(ingresoEgresoActions.setItems({ items: ingresosEgresosFB}));
        });
    });
  }

  ngOnDestroy() {
    this.ingresosSubs.unsubscribe();
    this.userSubs.unsubscribe();
  }
}
