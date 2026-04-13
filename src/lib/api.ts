export const api = {
  async handleResponse(res: Response) {
    const contentType = res.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = { error: await res.text() };
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || 'Erro na requisição');
    }
    return data;
  },

  async register(data: any) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  },

  async login(data: any) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  },

  async getMe() {
    const res = await fetch('/api/me');
    return this.handleResponse(res);
  },

  async logout() {
    const res = await fetch('/api/logout', { method: 'POST' });
    return this.handleResponse(res);
  }
};
