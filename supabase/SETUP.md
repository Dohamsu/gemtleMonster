# Supabase 데이터베이스 설정 가이드

## 1단계: 스키마 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **SQL Editor** 메뉴 선택
4. `supabase/schema.sql` 파일의 내용을 복사하여 붙여넣기
5. **Run** 버튼 클릭

## 2단계: SERVICE_ROLE_KEY 설정

1. Supabase Dashboard > **Project Settings** > **API**
2. `service_role` 키 복사 (secret 표시)
3. `.env` 파일을 열고 다음 줄의 주석을 해제하고 키를 붙여넣기:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=<여기에_service_role_키_붙여넣기>
   ```

## 3단계: 시설 데이터 시딩

터미널에서 다음 명령어 실행:

```bash
npm run seed:facilities
```

성공하면 다음과 같은 메시지가 표시됩니다:
```
=== Facility: herb_farm (허브 농장) ===
  - facility upsert 완료
  - unlock conditions 2개 insert 완료
  - facility_level 5개 insert 완료
...
✅ 모든 facility 시드 완료
```

## 4단계: 데이터 확인

1. Supabase Dashboard > **Table Editor**
2. 다음 테이블들을 확인:
   - `facility`: 5개 시설 데이터
   - `facility_level`: 각 시설의 레벨별 설정
   - `facility_unlock_condition`: 해금 조건

## 참고사항

- **RLS (Row Level Security)** 가 활성화되어 있습니다. 플레이어는 자신의 데이터만 접근할 수 있습니다.
- **자동 타임스탬프**: `created_at`, `updated_at` 필드는 자동으로 관리됩니다.
