import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../models/Login';
import { Token } from '../models/Token';
//import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) { }

  login(user: Login) {
    return this.httpClient.post<Token>('/api/login', user)
      .pipe(tap(res => this.setSession(res)));
  }

  private setSession(authResult: Token) {
    const expiresAt = Date.now() + authResult.expiresIn * 1000;
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem("expires_at", String(expiresAt));
  }          

  logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
  }

  public isLoggedIn() {
    return Date.now() < this.getExpiration();
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    return Number(localStorage.getItem('expires_at') || '0');
  }    
}
