# NODE 국가개발고용기구

미래에 생길지도 모를 가상의 국가기관에 무작위로 발령받는 웹 서비스입니다.
기관, 부서, 직급, 연봉과 수당이 정해지고, 기관 등급과 특수보직으로 희소성이 붙습니다.

## 구성

- `src/lib/node-data.ts`: 기관·등급·직급·특수보직 목록과 확률
- `src/lib/draw.ts`: 시드 기반 뽑기 (공유 링크로 같은 결과 재현)
- `src/components/`: 화면, 로고 배너, 기관 관인, 픽셀 아이콘


글꼴: [Galmuri](https://github.com/quiple/galmuri) (SIL Open Font License 1.1)

모든 기관은 가상이며 실제 정부기관과 관계가 없습니다.
