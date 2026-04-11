const API_BASE = '/api';

type ApiRequestOptions = {
  retryOnUnauthorized?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const { retryOnUnauthorized = true } = options;
  const headers = new Headers(init.headers);
  const body = init.body;

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/signup') &&
    !path.startsWith('/auth/google') &&
    !path.startsWith('/auth/refresh')
  ) {
    const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshResponse.ok) {
      return apiRequest<T>(path, init, { retryOnUnauthorized: false });
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? ((await response.json().catch(() => ({}))) as { message?: string })
      : { message: await response.text().catch(() => '') };
    throw new ApiError(payload.message || `Request failed with status ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as T;
}
