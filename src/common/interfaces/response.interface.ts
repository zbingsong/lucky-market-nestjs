/**
 * Standard response interface if response is not a redirect
 */
export class IResponse {
  data: any;
  code: number;
  error: string;
}
