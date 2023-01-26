export class ValidateLoginResponseDto {
  accessToken: string;
  id: number;
  name: string;
  email: string;
  emailVerify: boolean;
  phoneVerify: boolean;
  phoneNumber?: string;
}
