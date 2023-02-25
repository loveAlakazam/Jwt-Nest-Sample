export class SendSMSRequestDto {
  receiver: string; // 문자 수신자
  sender: string; // 문자 발송자
  content: string; // 문자내용
}
