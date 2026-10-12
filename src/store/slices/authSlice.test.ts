import { describe, it, expect } from 'vitest';
import authReducer, { setActiveRole, login, logout } from './authSlice';

describe('AuthSlice Reducer and Actions', () => {
  const initialAuthState = authReducer(undefined, { type: '@@INIT' });

  it('initializes with default role and user', () => {
    expect(initialAuthState.isAuthenticated).toBe(true);
    expect(initialAuthState.activeRole).toBeDefined();
    expect(initialAuthState.currentUser).toBeDefined();
  });

  it('switches role and updates currentUser cleanly', () => {
    const doctorState = authReducer(initialAuthState, setActiveRole('DOCTOR'));
    expect(doctorState.activeRole).toBe('DOCTOR');
    expect(doctorState.currentUser.role).toBe('DOCTOR');
    expect(doctorState.currentUser.name).toBe('Dr. Ananya Roy');

    const adminState = authReducer(doctorState, setActiveRole('ADMIN'));
    expect(adminState.activeRole).toBe('ADMIN');
    expect(adminState.currentUser.name).toBe('Dr. Vikramaditya Sen');

    const superAdminState = authReducer(adminState, setActiveRole('SUPER_ADMIN'));
    expect(superAdminState.activeRole).toBe('SUPER_ADMIN');
    // Ensure Super Admin does not contain bracket annotations
    expect(superAdminState.currentUser.name).toBe('Dr. Vikramaditya Sen');
  });

  it('handles login with role and custom email', () => {
    const loggedInState = authReducer(
      initialAuthState,
      login({ role: 'NURSE', email: 'custom.nurse@hospital.in' })
    );
    expect(loggedInState.isAuthenticated).toBe(true);
    expect(loggedInState.activeRole).toBe('NURSE');
    expect(loggedInState.currentUser.email).toBe('custom.nurse@hospital.in');
  });

  it('handles logout', () => {
    const loggedOutState = authReducer(initialAuthState, logout());
    expect(loggedOutState.isAuthenticated).toBe(false);
  });
});
