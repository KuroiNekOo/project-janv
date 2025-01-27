export interface User {
  email: string,
  salt: string,
  hashPassword: string,
  role: string,
}
