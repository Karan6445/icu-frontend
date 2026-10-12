import { User, UserRole, ShiftType } from '../types/icu';
import { MOCK_USERS } from '../data/mockData';

export class AuthService {
  private static userKey = 'intelligent_icu_active_user';
  private static allUsersKey = 'intelligent_icu_all_users_list';

  static getCurrentUser(): User {
    const saved = localStorage.getItem(this.userKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_USERS[1]; // Default to Dr. Rahul Sharma (Doctor)
      }
    }
    return MOCK_USERS[1];
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  static getAllUsers(): User[] {
    const saved = localStorage.getItem(this.allUsersKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to initial MOCK_USERS
      }
    }
    // Initialize localStorage with mock users if empty
    localStorage.setItem(this.allUsersKey, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }

  static saveAllUsers(users: User[]): void {
    localStorage.setItem(this.allUsersKey, JSON.stringify(users));
  }

  static login(staffId: string): User | null {
    const users = this.getAllUsers();
    const found = users.find(
      u => u.staffId.toLowerCase() === staffId.toLowerCase() || u.id.toLowerCase() === staffId.toLowerCase()
    );
    if (found) {
      this.setCurrentUser(found);
      return found;
    }
    return null;
  }

  static switchRole(role: UserRole): User {
    const users = this.getAllUsers();
    const found = users.find(u => u.role === role) || users[0];
    this.setCurrentUser(found);
    return found;
  }

  static logout(): void {
    localStorage.removeItem(this.userKey);
  }

  static getDoctors(): User[] {
    return this.getAllUsers().filter(u => u.role === 'DOCTOR');
  }

  static getNurses(): User[] {
    return this.getAllUsers().filter(u => u.role === 'RN' || u.role === 'NP' || u.role === 'CCR');
  }

  static addUser(userData: Partial<User>): User {
    const users = this.getAllUsers();
    const idPrefix = userData.role === 'DOCTOR' ? 'DR' : userData.role === 'SYSTEM_ADMIN' ? 'ADM' : 'NUR';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    const newUser: User = {
      id: `${idPrefix}-${randomNum}`,
      staffId: userData.staffId || `${idPrefix}-${randomNum}`,
      name: userData.name || 'Unassigned Staff',
      email: userData.email || 'staff@hospital.org',
      phone: userData.phone || '+91 98000 00000',
      role: userData.role || 'RN',
      subRole: userData.subRole || (userData.role === 'DOCTOR' ? 'Consultant' : 'Registered Nurse (RN)'),
      hospital: 'Central Super-Specialty ICU Center',
      authorizedUnits: userData.authorizedUnits && userData.authorizedUnits.length > 0 ? userData.authorizedUnits : ['MICU-01'],
      status: userData.status || 'ON_DUTY',
      shift: userData.shift || 'MORNING',
      shiftTime: userData.shiftTime || (userData.shift === 'EVENING' ? '15:00 - 23:00' : userData.shift === 'NIGHT' ? '23:00 - 07:00' : '07:00 - 15:00'),
      specialty: userData.specialty || (userData.role === 'DOCTOR' ? 'General Critical Care' : undefined)
    };

    const updatedUsers = [newUser, ...users];
    this.saveAllUsers(updatedUsers);
    return newUser;
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    this.saveAllUsers(users);

    // If active user is updated, sync active user state
    const currentUser = this.getCurrentUser();
    if (currentUser.id === id) {
      this.setCurrentUser(updatedUser);
    }

    return updatedUser;
  }

  static updateUserShift(id: string, shift: ShiftType, shiftTime?: string): User | null {
    const time = shiftTime || (shift === 'EVENING' ? '15:00 - 23:00' : shift === 'NIGHT' ? '23:00 - 07:00' : '07:00 - 15:00');
    return this.updateUser(id, { shift, shiftTime: time });
  }

  static updateUserStatus(id: string, status: 'ON_DUTY' | 'OFF_DUTY' | 'ON_CALL'): User | null {
    return this.updateUser(id, { status });
  }

  static deleteUser(id: string): void {
    const users = this.getAllUsers();
    const filtered = users.filter(u => u.id !== id);
    this.saveAllUsers(filtered);
  }
}
