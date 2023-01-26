# JWT 토큰기반 인증 학습

학습목표
- [x] passport를 활용한 JWT 토큰 기반의 인증로직 구현하기
- [x] Refresh 토큰인증 로직 구현하기
- [x] 쿠키에 저장하여 토큰 인증하기

  

## [v1.0.1](https://github.com/loveAlakazam/Jwt-Nest-Sample/tree/product.v1.0.1) 


- 학습목표
  - [x] passport를 활용한 JWT 토큰 기반의 인증로직 구현하기
  - [x] Refresh 토큰인증 로직 구현하기
  - [x] 저장된 access/refresh 토큰을 쿠키에 저장하여 토큰인증하기
  - [x] 소셜로그인
    - [x] 구글
    - [x] 네이버
    - [x] 카카오
  - [x] CSRF 공격을 대비하기 위한 CSRF 토큰 생성과 검증 모듈구현하기    
  - [] nodemailer를 이용하여 메일인증하기
  - [] AWS SES를 활용해보기
  - [] SMS를 이용하여 문자인증하기


<details>
<summary>참고자료</summary>

- [Leo.log - Auth 인증구현](https://velog.io/@algo2000/pj01-05)
- [sinf.log - Nest.js에서 Google Oauth 적용하기](https://velog.io/@sinf/Nest.js%EC%97%90%EC%84%9C-Goolge-Oauth-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0)
- [찐찐.log - Nest 카카오 로그인 API 사용하기](https://velog.io/@dldmswjd322/Nest-%EC%B9%B4%EC%B9%B4%EC%98%A4-%EB%A1%9C%EA%B7%B8%EC%9D%B8-API-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)
- [Elvis Duru - NESTJS JWT Authentication with Refresh Tokens Complete Guide](https://www.elvisduru.com/blog/nestjs-jwt-authentication-refresh-token)
- [Dev-Hudi - OAuth2.0 동작 메커니즘](https://hudi.blog/oauth-2.0/)
- [Hocaron - NestJS JWT/RefreshToken/Oauth social Login 예제 래포지토리](https://github.com/hocaron/social-login)
- [Charming-kyu - NestJS JWT 로그인 구현예제](https://charming-kyu.tistory.com/39)


</details>


## v1.0.2

| API URI | 설명 | 작업 진행 |
|:-------:|:---:|:-------:|
| /auth/register| 회원가입|✅|
| /auth/login| 일반회원 로그인(local-strategy)| ✅|
| /auth/logout| 일반회원 로그아웃<br>쿠키에 저장된 액세스 토큰과 리프래시 토큰을 만료시킨다. |✅|
| /auth/google | 구글 OAuth 연동로그인 요청 |✅|
| /auth/naver | 네이버 OAuth 연동로그인 요청 |✅|
| /auth/kakao | 카카오 OAuth 연동로그인 요청 |✅|
| /auth/refresh | 액세스 토큰 갱신 |✅|
| /auth/csrf | CSRF 토큰 요청 |✅|


## 보완할점 

### 1. 유저 id 의 타입을 number(int) 로 했다.

> - 서비스의 유저가 많아지것을 고려하면 userId가 number 로 설계하는 것은 좋지 않다.
> - number 타입은 int타입과 같으며 최대 `2,147,483,647` 의 값을 갖는다. 그 이상의 유저가 생성되면 더이상 서비스를 이용할 수 없다.

즉 그러면 앞으로는 어떻게 하는게 좋을까?

> - 현재날짜(년도/월/일/시/분/초/ms) 단위로 쪼개서 랜덤한 값으로 유저 id를 설정하거나 (예: mongodb의 _id 필드)
> - big-int 타입으로 계속 무한히 값을 갖도록 하는 타입으로 한다.


### 2. 로그인한 유저 환경(접속 시각/기기/국가)을 파악하고, 본인 인증 재확인 모듈이 필요
