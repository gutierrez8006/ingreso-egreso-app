import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.reducer';
import * as ui from '../../shared/ui.actions';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: []
})
export class RegisterComponent implements OnInit, OnDestroy {

  registroForm: FormGroup;
  uiSubscription: Subscription;
  cargando: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router,
              private store: Store<AppState>) { }

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.uiSubscription = this.store.select('ui').subscribe(ui => {
      this.cargando = ui.isLoading;
      console.log('cargando subs');

    });
  }

  ngOnDestroy() {
    this.uiSubscription.unsubscribe();
  }

  crearUsuario() {
    if (this.registroForm.invalid) { return; }

    // Swal.fire({
    //   title: 'Espere porfavor!',
    //   didOpen: () => {
    //     Swal.showLoading();
    //   }
    // });

    this.store.dispatch(ui.isLoading());

    const { nombre, correo, password } = this.registroForm.value;

    this.authService.crearUsuario(nombre, correo, password).then(credenciales => {
      console.log(credenciales);
      // Swal.close();
      this.store.dispatch(ui.stopLoading());

      this.router.navigate(['/']);
    }).catch(error => {
      this.store.dispatch(ui.stopLoading());
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message
      });
    });
  }
}
