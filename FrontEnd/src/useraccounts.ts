import { User } from '../../FrontEnd/upload_page/src/account';

// export type User = {
//   Username: string;
//   Email: string;
//   Password: string;
// };

export function loadUsers(): User[] {
  const userJSON = localStorage.getItem('users');
  return userJSON ? JSON.parse(userJSON) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem('users', JSON.stringify(users));
}

export const users: User[] = loadUsers();
