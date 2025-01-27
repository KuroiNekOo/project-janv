import { HttpClient } from '@angular/common/http';
import { Component, effect } from '@angular/core';
import { UserService } from '../services/users.service';
import { User } from '../interfaces/user.interface';
import { FormsModule, NgForm } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-blog',
  imports: [FormsModule, NgIf],
  templateUrl: './create-blog.component.html',
  styleUrl: './create-blog.component.css'
})
export class CreateBlogComponent {
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

  createBlog(data: { content: string }): Observable<any> {
    return this.http.post<any>(`${this.url}/`, data);
  }

  user: User | null = null;
  content!: string;
  readonly url = 'http://localhost:3000/api/v1/blogs';

  onSubmit = async ({ form }: NgForm) => {

    this.content = form.value.content;
    console.log(this.content);

    const data = {
      userId: this.user?.id,
      content: this.content,
    }

    this.createBlog(data).subscribe({
      next: (message) => console.log(message),
      error: (message) => console.error(message),
      complete: () => this.router.navigate(['/blogs']),
    });

  }
}
