import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegisterUserComponent } from "./component/admin/register-user/register-user.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  //rotected title = 'cbt-standard';
}
