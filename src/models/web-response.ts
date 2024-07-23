import { Paging } from "./web-pagging";

export class WebResponse<T> {
    timestamp: Date = new Date();
    statusCode: number;
    message: string;
    data?: T; 
    errors?: string[];
    pagging?: Paging;
  
    constructor(message: string, statusCode: number, data?: T | null, errors?: string[], pagging?: Paging) {
      this.data = data;
      this.message = message;
      this.statusCode = statusCode;
      this.errors = errors;
      this.pagging = pagging;
    }
  }
  