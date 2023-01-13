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
  - [] 소셜로그인
    - [] 구글
    - [] 네이버
    - [] 카카오
    - [] 깃허브
  - [] nodemailer를 이용하여 메일인증하기


<details>
<summary>참고자료</summary>

- [Leo.log - Auth 인증구현](https://velog.io/@algo2000/pj01-05)
- [sinf.log - Nest.js에서 Google Oauth 적용하기](https://velog.io/@sinf/Nest.js%EC%97%90%EC%84%9C-Goolge-Oauth-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0)

- [찐찐.log - Nest 카카오 로그인 API 사용하기](https://velog.io/@dldmswjd322/Nest-%EC%B9%B4%EC%B9%B4%EC%98%A4-%EB%A1%9C%EA%B7%B8%EC%9D%B8-API-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)
</details>


## v1.0.2

| API URI | 설명 | 작업 진행 |
|:-------:|:---:|:-------:|
| /auth/register| 회원가입|✅|
| /auth/login| 일반회원 로그인(local-strategy)| ✅|
| /auth/logout| 일반회원 로그아웃<br>쿠키에 저장된 액세스 토큰과 리프래시 토큰을 만료시킨다. |✅|
| /auth/refresh | 액세스 토큰 갱신 | |
