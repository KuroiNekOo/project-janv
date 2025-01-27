import { Component } from '@angular/core';
import { UserService } from '../services/users.service';
import { NgForm, FormsModule } from '@angular/forms';
import * as crypto from 'crypto-js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}
  errorMessage!: string;
  email!: string;
  oldPassword!: string;
  newPassword!: string;
  confirmNewPassword!: string;
  hashOldPassword!: string;
  hashNewPassword!: string;
  hashConfirmNewPassword!: string;
  newSalt!: string;
  role!: string;

  onSubmit = async ({ form }: NgForm) => {

    this.email = form.value.email;
    this.oldPassword = form.value.oldPassword;
    this.newPassword = form.value.newPassword;
    this.confirmNewPassword = form.value.confirmNewPassword;

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

        this.newSalt = crypto.lib.WordArray.random(16).toString(crypto.enc.Hex);
        this.hashOldPassword = crypto.SHA256(this.oldPassword + salt).toString(crypto.enc.Hex);
        this.hashNewPassword = crypto.SHA256(this.newPassword + this.newSalt).toString(crypto.enc.Hex);
        this.hashConfirmNewPassword = crypto.SHA256(this.confirmNewPassword + this.newSalt).toString(crypto.enc.Hex);

        if (this.hashNewPassword !== this.hashConfirmNewPassword)
          return form.reset();

        this.userService.changePassword({
          email: this.email,
          hashOldPassword: this.hashOldPassword,
          hashNewPassword: this.hashNewPassword,
          hashConfirmNewPassword: this.hashConfirmNewPassword,
          newSalt: this.newSalt,
          signature: pow.signature,
          challenge: pow.challenge,
          proof,
        }).subscribe({
          next: ({ userFoundAgain: { id, role: { name: roleName } } }) => this.userService.setUser({
            id,
            email: this.email,
            salt: this.newSalt,
            hashPassword: this.hashNewPassword,
            role: roleName,
          }),
          error: (message) => this.errorMessage = message,
          complete: () => console.log('Changement de mot de passe (2)'),
        });

      },
      error: (message) => this.errorMessage = message,
      complete: () => this.router.navigate(['/']),
    });

    return form.reset();

  };
}
