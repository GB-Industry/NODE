# NODE 국가개발고용기구

미래에 생길지도 모를 가상의 국가기관에 무작위로 "발령"받는 웹 서비스입니다.
기관, 부서, 직급, 연봉과 수당이 정해지고, 기관 등급과 특수보직으로 희소성이 붙습니다.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 구성

- `src/lib/node-data.ts`: 기관·등급·직급·특수보직 목록과 확률
- `src/lib/draw.ts`: 시드 기반 뽑기 (공유 링크로 같은 결과 재현)
- `src/components/`: 화면, 로고 배너, 기관 관인, 픽셀 아이콘

배포 시 `NEXT_PUBLIC_SITE_URL` 환경 변수에 사이트 주소를 넣으면 메타데이터·사이트맵에 반영됩니다.

글꼴: [Galmuri](https://github.com/quiple/galmuri) (SIL Open Font License 1.1)

모든 기관은 가상이며 실제 정부기관과 관계가 없습니다.
