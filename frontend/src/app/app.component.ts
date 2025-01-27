import { NgIf } from '@angular/common';
import { Component, effect } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { UserService } from './services/users.service';
import { User } from './interfaces/user.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  user: User | null = null;

  constructor(private userService: UserService) {
    effect(() => {
      this.user = this.userService.getUser();
      console.log('Utilisateur mis à jour :', this.user);
    });
  }
}
