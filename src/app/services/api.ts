import { Injectable, signal } from '@angular/core';

import { environment } from '../../environments/environment';
import { LoginCredentials } from '../components/login/login';

@Injectable({
  providedIn: 'root',
})
export class Api {
  baseUrl = environment.apiUrl;
  isAuthed = signal<string>(localStorage.getItem('isAuthed') ?? '');

  setAuthed(value: string) {
    value
      ? localStorage.setItem('isAuthed', value)
      : localStorage.removeItem('isAuthed');
    this.isAuthed.set(value);
  }

  authHeaders = () => {
    const authToken = localStorage.getItem('isAuthed');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };
  };

  handleError = (res: any, data: any) => {
    throw { status: res.status, ...data };
  };

  handleInvalidResponseAndTokenExpiration(res: any, data: any) {
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('isAuthed');
        this.isAuthed.set('');
      }
      this.handleError(res, data);
    }
  }

  async loginRequest({
    username,
    password,
  }: LoginCredentials): Promise<{ token: string }> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      localStorage.removeItem('isAuthed');
      this.isAuthed.set('');
      this.handleError(response, data);
    }

    return data;
  }

  async getFileList(): Promise<
    {
      url: string;
      type: string;
      key: string;
      lastModified: string;
    }[]
  > {
    const response = await fetch(`${this.baseUrl}/file-list`, {
      method: 'GET',
      headers: this.authHeaders(),
    });
    const data = await response.json();
    this.handleInvalidResponseAndTokenExpiration(response, data);
    return data?.imgList ?? [];
  }

  async upload(uploads: any): Promise<any> {
    const files = uploads?.map((file: File) => ({
      fileType: file.type,
      name: file.name,
    }));
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: JSON.stringify(files),
      headers: this.authHeaders(),
    });
    const data = await response.json();
    this.handleInvalidResponseAndTokenExpiration(response, data);

    await Promise.all(
      data.map((fileUrl: string, idx: number) => {
        return fetch(fileUrl, {
          method: 'PUT',
          body: uploads[idx],
          headers: {
            'Content-Type': uploads[idx].type,
          },
        });
      }),
    );

    return true;
  }

  async deleteFile(fileKey: string) {
    const response = await fetch(`${this.baseUrl}/delete`, {
      method: 'DELETE',
      headers: this.authHeaders(),
      body: JSON.stringify({ fileKey }),
    });
    const data = await response.json();
    this.handleInvalidResponseAndTokenExpiration(response, data);

    return data;
  }
}
