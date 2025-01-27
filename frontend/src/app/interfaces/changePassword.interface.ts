export interface ChangePassword {
  email: string;
  hashOldPassword: string;
  hashNewPassword: string;
  hashConfirmNewPassword: string;
  newSalt: string;
  signature: string;
  challenge: string;
  proof: number;
}
