import { makeAutoObservable } from 'mobx';

class AuthStore {
  isAuthenticated = false;
  accessCode = '';

  constructor() {
    makeAutoObservable(this);
  }

  setAccessCode(code: string) {
    this.accessCode = code;
  }

  authenticate() {
    // temporary access code
    if (this.accessCode === 'secret') {
      this.isAuthenticated = true;
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.accessCode = '';
  }
}

export const authStore = new AuthStore();
