export interface SocialUserDto {
  name: string;
  email: string;
  googleAccount?: string;
  naverAccount?: string;
  kakaoAccount?: string;
  emailVerify?: boolean;
  phoneNumber?: string;
  phoneVerify?: boolean;
}
