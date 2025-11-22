import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { RegistrationComponent } from "./registration/registration.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";

export const AUTHENTICATION_ROUTES: Routes = [

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: RegistrationComponent
  },

  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },

  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  }

];