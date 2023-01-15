export class ValidateLocalResponseDto {
  accessToken: string;
  refreshToken: string;
  id: number;
  name: string;
  email: string;
  emailVerify: boolean;
  phoneVerify: boolean;
  phoneNumber?: string;
}
