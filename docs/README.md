# Gemtle Monster Project Documentation

이 문서는 프로젝트의 기획, 시스템 설계, 가이드라인을 모아둔 문서함입니다.

## 📂 Features (기획 및 시스템 설계)

게임의 핵심 시스템과 기획 내용은 `docs/features/`에 정리되어 있습니다.

- **[연금술 시스템 설계](features/alchemy_system.md)** (`alchemy_system.md`)
  - 재료 구조, 몬스터 역할/속성/등급, 기본/특수 레시피 컨셉 등
- **[연금술 UI & 연출](features/alchemy_ui.md)** (`alchemy_ui.md`)
  - 연금술 공방 화면 레이아웃, 인터랙션, 애니메이션 명세
- **[연금술 레시피 규칙](features/alchemy_recipes.md)** (`alchemy_recipes.md`)
  - 조합 로직, 재료 키 생성, 컨텍스트 기반 조건(시간/날씨 등) 처리 방식
- **[몬스터 분해 시스템](features/monster_decompose.md)** (`monster_decompose.md`)
  - 몬스터 분해 보상 테이블, 프로세스, 재료 순환 구조

## 📂 Guides (개발 가이드)

개발자가 컨텐츠를 추가하거나 수정할 때 참고해야 할 가이드입니다.

- **[콘텐츠 추가 가이드](guides/content_addition.md)** (`content_addition.md`)
  - 시설, 재료, 몬스터, 레시피 추가 시 수정해야 할 파일 체크리스트

## 📝 General

- **[게임 기획 요약](game_design_summary.md)** (`game_design_summary.md`)
  - 코어 게임 루프, 방치형 채집 시스템, 던전 전투, 기술 스택 개요

---
> 이 문서는 `docs/` 디렉토리 내의 파일들을 인덱싱합니다. 새로운 문서를 추가하면 이 목록을 업데이트해주세요.
