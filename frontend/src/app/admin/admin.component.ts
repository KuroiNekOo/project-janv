import { NgFor, NgIf } from '@angular/common';
import { Component, effect } from '@angular/core';
import { UserService } from '../services/users.service';
import { User } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
  ) {
    effect(() => {
      this.user = this.userService.getUser();
      console.log('Utilisateur mis à jour :', this.user);
    });
  }

  user: User | null = null;
  users: User[] = [];
  readonly url = 'http://localhost:3000/api/v1/users';

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.url}/`);
  }

  updateUser(data: { userId: number, role: string }): Observable<any> {
    return this.http.put<any>(`${this.url}/`, data);
  }

  ngOnInit() {

    this.getAllUsers().subscribe({
      next: (users) => this.users = users.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role.name,
      })),
      error: (message) => console.error(message),
      complete: () => console.log('Users récupérés'),
    });

  }

  onSubmit = async ({ form }: NgForm) => {
    const data = {
      userId: form.value.userId,
      role: form.value.role,
    };
    console.log(data);

    this.updateUser(data).subscribe({
      next: (message) => {
        console.log(message);

        this.getAllUsers().subscribe({
          next: (users) => {
            this.users = users.map((user: any) => ({
              id: user.id,
              email: user.email,
              role: user.role.name,
            }));

            this.users.map((u) => {
              if (this.user) {
                if (u.id === this.user.id) {
                  this.userService.setUser(u);
                }
              }
            });
          },
          error: (message) => console.error(message),
          complete: () => console.log('Liste des utilisateurs mise à jour'),
        });
      },
      error: (message) => console.error(message),
      complete: () => this.router.navigate(['/admin']),
    });
  };
}
