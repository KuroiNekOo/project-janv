import { Component } from '@angular/core';
import { UserService } from '../services/users.service';
import { NgForm, FormsModule } from '@angular/forms';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  constructor(private userService: UserService) {}
  errorMessage!: string;
  email!: string;
  confirmPassword!: string;
  againPassword!: string;
  hashPassword!: string;
  role!: string;

  onSubmit = async ({ form }: NgForm) => {

    this.email = form.value.email;
    this.confirmPassword = form.value.confirmPassword;
    this.againPassword = form.value.againPassword;

    if (this.confirmPassword !== this.againPassword)
      return form.reset();

    this.userService.signup({ email: this.email }).subscribe({
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

        this.hashPassword = crypto.SHA256(this.confirmPassword + salt).toString(crypto.enc.Hex);

        this.userService.signupValidate({
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
          complete: () => console.log('Inscription (2)'),
        });

      },
      error: (message) => this.errorMessage = message,
      complete: () => console.log('Inscription (1)'),
    });

    return form.reset();

  };
}
