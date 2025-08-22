// Simple local authentication fallback
const LOCAL_STORAGE_KEY = 'local_auth_user';

export class LocalAuth {
  static users = JSON.parse(localStorage.getItem('local_users') || '[]');

  static register(email, password) {
    // Check if user already exists
    if (this.users.find(user => user.email === email)) {
      throw new Error('User already exists with this email');
    }

    // Add new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In a real app, this should be hashed
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    localStorage.setItem('local_users', JSON.stringify(this.users));
    
    // Auto login
    this.login(email, password);
    return newUser;
  }

  static login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  static logout() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static isLoggedIn() {
    return !!this.getCurrentUser();
  }
}
