import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { UserService } from '../services/users.service';
import { RouterLink } from '@angular/router';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-signin',
  imports: [FormsModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  constructor(private userService: UserService) {}
  errorMessage!: string;
  email!: string;
  password!: string;
  hashPassword!: string;
  role!: string;

  onSubmit = async ({ form }: NgForm) => {

    this.email = form.value.email;
    this.password = form.value.password;

    this.userService.signin({ email: this.email }).subscribe({
      next: ({ salt, pow }) => {

        const proof = (() => {
          let proof = 0;
          const prefix = "0".repeat(Number.parseInt(pow.difficulty));
          while (true) {
            const hash = crypto.SHA256(pow.challenge + proof).toString(crypto.enc.Hex);
            if (hash.startsWith(prefix)) {
                return proof;
            }
            proof++;
          }
        })();

        this.hashPassword = crypto.SHA256(this.password + salt).toString(crypto.enc.Hex);

        this.userService.signinValidate({
          email: this.email,
          hashPassword: this.hashPassword,
          challenge: pow.challenge,
          signature: pow.signature,
          proof,
        }).subscribe({
          next: ({ userFoundAgain: { role: { name: roleName } } }) => this.userService.setUser({
            email: this.email,
            salt,
            hashPassword: this.hashPassword,
            role: roleName,
          }),
          error: (message) => this.errorMessage = message,
          complete: () => console.log('Connexion (2)'),
        });

      },
      error: (message) => this.errorMessage = message,
      complete: () => console.log('Connexion (1)'),
    });

    return form.reset();

  };
}

