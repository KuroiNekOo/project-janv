export interface User {
  id: number,
  email: string,
  salt: string,
  hashPassword: string,
  role: string,
}
