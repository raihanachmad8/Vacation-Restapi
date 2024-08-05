import { Paging } from './web-pagging';

// Define a type for response options with generic type T for the data
type WebResponseOptions<T = null> = {
  message: string;
  statusCode: number;
  data?: T; // Use generic type T for data
  errors?: string[];
  paging?: Paging;
};

// Define the WebResponse class with generic type T
export class WebResponse<T = null> {
  timestamp: Date = new Date();
  statusCode: number;
  message: string;
  data?: T;
  errors?: string[];
  paging?: Paging;

  constructor({
    data,
    message,
    statusCode,
    errors,
    paging,
  }: WebResponseOptions<T>) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.paging = paging;
  }
}
