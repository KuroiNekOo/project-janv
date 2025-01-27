export interface SigninValidate {
  email: string;
  hashPassword: string;
  challenge: string;
  proof: number;
  signature: string;
}
