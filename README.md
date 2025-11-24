# 🎮 GemtleMonster

몬스터 연금술을 통해 다양한 몬스터를 제작하는 방치형 RPG 게임

## 📋 프로젝트 소개

GemtleMonster는 연금술 시스템을 중심으로 한 방치형 게임입니다. 플레이어는 재료를 수집하고, 레시피를 발견하며, 다양한 몬스터를 제작할 수 있습니다.

## ✨ 주요 기능

### 🧪 연금술 시스템
- **재료 수집**: 23종의 다양한 재료 (식물, 광물, 야수, 슬라임, 정령 계열)
- **레시피 발견**: 10개의 레시피 (기본 7개 + 숨겨진 3개)
- **몬스터 제작**: 성공률 기반 제작 시스템
- **캔버스 UI**: 인터랙티브한 연금술 공방 인터페이스

### 🏭 시설 관리
- **약초 농장**: 기본 약초 생산
- **광산**: 광물 채굴 (업그레이드 가능)
- **연금술 공방**: 몬스터 제작

### 💾 데이터 관리
- Supabase 기반 실시간 데이터베이스
- 자동 저장 시스템
- 플레이어 진행도 추적

## 🛠️ 기술 스택

### Frontend
- **React 18** - UI 프레임워크
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Zustand** - 상태 관리
- **Canvas API** - 게임 렌더링

### Backend
- **Supabase** - 백엔드 서비스
  - PostgreSQL 데이터베이스
  - Row Level Security (RLS)
  - 실시간 데이터 동기화
  - 인증 시스템

### 데이터베이스 구조
```
📦 Alchemy System
├── material (재료 마스터)
├── recipe (레시피 마스터)
├── recipe_ingredient (레시피-재료 관계)
├── recipe_condition (레시피 조건)
├── player_material (플레이어 보유 재료)
├── player_recipe (플레이어 레시피 발견 기록)
├── player_alchemy (플레이어 연금술 정보)
└── alchemy_history (제작 기록)
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Supabase 계정

### 설치

1. 저장소 클론
```bash
git clone https://github.com/yourusername/gemtleMonster.git
cd gemtleMonster
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일 생성:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. 데이터베이스 스키마 생성
```bash
# Supabase SQL Editor에서 실행
# supabase/alchemy_schema.sql 파일 내용 실행
```

5. 초기 데이터 시드
```bash
npm run seed:alchemy
```

6. 개발 서버 실행
```bash
npm run dev
```

## 📖 게임 플레이 가이드

### 1. 시작하기
- 게임 시작 시 자동으로 로그인됩니다
- 맵 화면에서 연금술 공방을 클릭하세요

### 2. 재료 수집
- 시설 관리 탭에서 약초 농장과 광산을 관리하세요
- 일정 시간마다 재료를 수확할 수 있습니다
- 테스트용으로 "테스트 재료 추가" 버튼을 사용할 수 있습니다

### 3. 연금술 제작
1. **레시피 선택**: 왼쪽 레시피 목록에서 선택
2. **재료 배치**: 오른쪽 보유 재료를 클릭하여 추가
3. **제작 시작**: 필요한 재료가 모두 배치되면 "연금술 시작" 버튼 클릭
4. **결과 확인**: 성공률에 따라 몬스터 획득 또는 실패

### 4. 레시피 발견
- 기본 레시피 7개는 처음부터 사용 가능
- 숨겨진 레시피 3개는 특정 조건을 만족해야 발견됩니다
- 도감 탭에서 발견한 레시피를 확인하세요

## 📊 재료 계열

| 계열 | 설명 | 예시 |
|------|------|------|
| 🌿 PLANT | 식물 계열 | 일반 약초, 희귀 약초 |
| 💎 MINERAL | 광물 계열 | 철광석, 마나 수정 |
| 🦴 BEAST | 야수 계열 | 짐승 송곳니 |
| 🟢 SLIME | 슬라임 계열 | 슬라임 코어 |
| ✨ SPIRIT | 정령 계열 | 정령 가루 |

## 🎯 로드맵

- [x] 기본 연금술 시스템
- [x] 캔버스 기반 UI
- [x] 재료 수집 시스템
- [ ] 몬스터 인벤토리
- [ ] 공장 배치 시스템
- [ ] 몬스터 육성 시스템
- [ ] PvP 배틀 시스템
- [ ] 길드 시스템

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m '새로운 기능 추가'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이센스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👨‍💻 개발자

**jwonkim** - [GitHub Profile](https://github.com/yourusername)

## 🙏 감사의 말

- React 팀
- Supabase 팀
- Zustand 개발자들
- 모든 오픈소스 기여자들
