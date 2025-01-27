import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, effect } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../services/users.service';
import { User } from '../interfaces/user.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blogs',
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
    effect(() => {
      this.user = this.userService.getUser();
      console.log('Utilisateur mis à jour :', this.user);
    });
  }

  user: User | null = null;
  readonly url = 'http://localhost:3000/api/v1/blogs';
  blogs!: Array<{ content: string }>;

  getAllBlogs(): Observable<any> {
    return this.http.get<any>(`${this.url}/`);
  }

  ngOnInit() {

    this.getAllBlogs().subscribe({
      next: (blogs) => this.blogs = blogs,
      error: (message) => console.error(message),
      complete: () => console.log('Blogs récupérés'),
    });

  }

}
