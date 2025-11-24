# Supabase 인증 설정 가이드

## 문제 상황
현재 앱이 로딩 화면에서 멈춰있고, 콘솔에 이메일 유효성 검증 에러가 발생하고있습니다.

## 해결 방법

### 1단계: Supabase Dashboard 접속
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 (`zcqejdvtwubaodfpjvbm`)

### 2단계: 이메일 인증 비활성화
1. 좌측 메뉴에서 **Authentication** 클릭
2. **Providers** 탭 클릭
3. **Email** provider 찾기
4. **Confirm email** 옵션을 **OFF(비활성화)** 로 설정
5. 저장

### 3단계: 페이지 새로고침
브라우저에서 `http://localhost:5173` 페이지를 새로고침하면 자동으로 테스트 계정(`test@example.com`)이 생성되고 로그인됩니다.

## 예상 결과

성공적으로 로그인하면 다음과 같이 표시됩니다:
- 좌측 상단: 플레이어 ID와 Gold 1000 표시
- 우측: "허브 농장" 시설 Lv.1 표시
- 업그레이드 버튼으로 시설 레벨업 가능

## 참고사항
- `test@example.com` / `testpassword123` 계정이 자동으로 생성됩니다
- 이메일 확인 없이 바로 로그인됩니다
- 모든 게임 데이터는 Supabase DB에 저장됩니다
