export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, data: Record<string, unknown>) {
    super(`API Error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401, { non_field_errors: ['Session expired'] });
    this.name = 'UnauthorizedError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Unable to connect to server') {
    super(message);
    this.name = 'NetworkError';
  }
}
