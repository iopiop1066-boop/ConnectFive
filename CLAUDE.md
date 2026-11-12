# CLAUDE.md

오목(15x15, 자유룰: 금수 없음, 5목 이상이면 승리) 웹 게임. 순수 HTML/CSS/JS, 빌드·의존성 없음.
상위 폴더의 `../CLAUDE.md`(행동 지침, 커밋 규칙)도 함께 적용된다.

## 실행
- 게임: 정적 서버로 연다. `python3 -m http.server 8765` 후 http://localhost:8765 (file://로 열어도 동작하나 일부 미리보기 도구는 외부 파일을 못 읽는다)
- 규칙 테스트: `node test/rules.test.js`
- AI 강함 검증: `node test/selfplay.js [판수] [레벨A] [레벨B]` (인자 없으면 2v1, 3v2, 4v3, 5v4, 5v1)

## 구조
- `core.js` — 규칙(보드 `Int8Array(225)`, 인덱스 `y*15+x`, 0=빈칸 1=흑 2=백), `isWin`, `candidates`. 브라우저(`window.GomokuCore`)·Node 겸용(UMD 스타일).
- `ai.js` — `chooseMove(board, player, level)` → 칸 인덱스. 호출 중 보드를 임시 수정하지만 복구한다.
- `game.js` — UI/상태(캔버스 렌더링, 클릭, 모드·난이도·돌 색 선택, AI 착수는 300ms `setTimeout`).
- `index.html`, `style.css` — 화면.

## AI 레벨 (클수록 강함)
1 랜덤(이길 수 있으면 둠) / 2 즉시 승리·즉시 방어 후 랜덤 / 3 패턴 점수 1수 평가(20%는 차선) /
4 2수 탐색(폭 12) / 5 알파-베타 4수 탐색(폭 14). 평가는 연속 길이×열린 끝 수 패턴 점수.
레벨을 바꿀 때는 `test/selfplay.js`로 5>4>3>2>1 순서가 유지되는지 확인할 것.

## 범위 밖
렌주룰(금수), 무르기, 온라인 대전.
