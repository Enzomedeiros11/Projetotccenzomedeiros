export const api = {
  async register(data: any) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao registrar');
    }
    return res.json();
  },

  async login(data: any) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao entrar');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch('/api/me');
    if (!res.ok) throw new Error('Não autorizado');
    return res.json();
  },

  async logout() {
    await fetch('/api/logout', { method: 'POST' });
  }
};
