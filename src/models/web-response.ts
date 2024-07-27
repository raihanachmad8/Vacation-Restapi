import { Paging } from './web-pagging';

type WebResponseOptions<T = null> = {
  message: string,
  statusCode: number,
  data?: any,
  errors?: string[],
  paging?: Paging
}
export class WebResponse<T = null> {
  timestamp: Date = new Date();
  statusCode: number;
  message: string;
  data?: T;
  errors?: string[];
  paging?: Paging;

  constructor(
    { data, message, statusCode, errors, paging }: WebResponseOptions<T>
  ) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.paging = paging;
  }
}
