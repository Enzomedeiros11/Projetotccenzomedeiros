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
      const errorMessage = data.error || data.message || `Erro na requisição (Status: ${res.status})`;
      throw new Error(errorMessage);
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

  async getClasses() {
    const res = await fetch('/api/classes');
    return this.handleResponse(res);
  },

  async createClass(data: { name: string; subject: string; grade: string }) {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  },

  async joinClass(code: string) {
    const res = await fetch('/api/classes/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return this.handleResponse(res);
  },

  async logout() {
    const res = await fetch('/api/logout', { method: 'POST' });
    return this.handleResponse(res);
  },

  // Assignments
  async getAssignments(classId: string | number) {
    const res = await fetch(`/api/classes/${classId}/assignments`);
    return this.handleResponse(res);
  },

  async createAssignment(classId: string | number, data: any) {
    const res = await fetch(`/api/classes/${classId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  },

  // Materials
  async getMaterials(classId: string | number) {
    const res = await fetch(`/api/classes/${classId}/materials`);
    return this.handleResponse(res);
  },

  async createMaterial(classId: string | number, data: any) {
    const res = await fetch(`/api/classes/${classId}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  },

  // Submissions
  async submitAssignment(assignmentId: string | number, data: any) {
    const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }
};
