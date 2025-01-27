import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Observable } from "rxjs";

import { User } from "../interfaces/user.interface";
import { Signup } from "../interfaces/signup.interface";
import { signupValidate } from "../interfaces/signupValidate.interface";
import { Signin } from "../interfaces/signin.interface";
import { SigninValidate } from "../interfaces/signinValidate.interface";
import { ChangePassword } from "../interfaces/changePassword.interface";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly url = 'http://localhost:3000/api/v1/auth';
  private user = signal<User | null>(null);
  constructor(private http: HttpClient) {}

  getUser(): User | null {
    return this.user();
  }

  setUser(user: User | null): void {
    this.user.set(user);
  }

  signup(signup: Signup): Observable<any> {
    return this.http.post<any>(`${this.url}/signup`, signup);
  }

  signupValidate(signupValidate: signupValidate): Observable<any> {
    return this.http.post<any>(`${this.url}/signupValidate`, signupValidate);
  }

  signin(signin: Signin): Observable<any> {
    return this.http.post<any>(`${this.url}/signin`, signin);
  }

  signout(): Observable<any> {
    return this.http.get<any>(`${this.url}/logout`);
  }

  signinValidate(signinValidate: SigninValidate): Observable<any> {
    return this.http.post<any>(`${this.url}/signinValidate`, signinValidate);
  }

  changePassword(changePassword: ChangePassword): Observable<any> {
    return this.http.post<any>(`${this.url}/changePassword`, changePassword);
  }

};
