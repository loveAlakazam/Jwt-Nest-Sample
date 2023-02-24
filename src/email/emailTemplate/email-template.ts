export const EmailTemplate = {
  GREET_NEWBIE: (name: string) => {
    return {
      title: `[ek-project] ${name}님 환영합니다!`,
      content: `${name}님, 안녕하세요! 저희 서비스에 회원가입을 해주셔서 감사합니다!`,
    };
  },
};
