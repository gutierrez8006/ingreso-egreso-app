import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';

import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import * as authActions from '../auth/auth.actions';

import { Subscription } from 'rxjs';
import * as ingresoEgresoActions from '../ingreso-egreso/ingreso-egreso.action';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userSubscription: Subscription;
  private _user: Usuario;

  get user() {
    // return {... this._user}; // Para evitar mutaciones
    return this._user;
  }

  constructor(public auth: AngularFireAuth, public firestore: AngularFirestore, private store: Store<AppState>) { }

  initAuthListener() {
    this.auth.authState.subscribe(fuser => {
      if (fuser) {
        this.userSubscription = this.firestore.doc(`${ fuser.uid }/usuario`).valueChanges()
        .subscribe(firestoreUser => {

          const user = Usuario.fromFirebase(firestoreUser);
          this._user = user;
          this.store.dispatch(authActions.setUser({user}));
        });
      } else {
        this._user = null;
        this.store.dispatch(ingresoEgresoActions.unSetItems());
        this.userSubscription.unsubscribe();
        this.store.dispatch(authActions.unSetUser());
      }
    });
  }

  crearUsuario(nombre: string, email: string, password: string) {
    // console.log({ nombre, email, password});
    return this.auth.createUserWithEmailAndPassword(email, password).then(({ user } ) => {
      const newUser = new Usuario(user.uid, nombre, user.email);
      return this.firestore.doc(`${ user.uid }/usuario`).set({...newUser});
    });
  }

  loginUsuario(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  isAuth() {
    return this.auth.authState.pipe(
      map(fbUser => fbUser != null)
    );
  }
}
