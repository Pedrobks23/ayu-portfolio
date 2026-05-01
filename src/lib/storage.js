const OBRAS_KEY = 'ayume:obras';
const AUTH_KEY  = 'ayume:auth';

export const storage = {
  getObras() {
    try {
      const raw = localStorage.getItem(OBRAS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setObras(obras) {
    localStorage.setItem(OBRAS_KEY, JSON.stringify(obras));
  },
  getAuth() {
    return localStorage.getItem(AUTH_KEY) === 'true';
  },
  setAuth(val) {
    if (val) {
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  },
};
