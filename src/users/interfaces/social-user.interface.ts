export interface SocialUserDto {
  name: string;
  email: string;
  googleAccount?: string;
  naverAccount?: string;
  emailVerify?: boolean;
  phoneNumber?: string;
  phoneVerify?: boolean;
}
