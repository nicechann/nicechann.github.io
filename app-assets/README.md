# Nicechann App Asset Resizer

브라우저에서만 동작하는 이미지 리사이저입니다. 이미지 파일을 서버로 전송하지 않습니다.

## 주요 기능

- App Store Icon 1024×1024
- Apps in Toss 600×600
- iPhone 6.9 / 6.5 / 6.3 App Store 스크린샷 프리셋
- iPad 13인치 프리셋
- Mac 16:10 App Store 스크린샷 프리셋
- Custom 가로/세로 입력
- Cover / Contain / Stretch
- 이미지 드래그 위치 조절 및 확대/축소
- 배경색 합성으로 투명도 제거
- PNG / JPG 저장
- 여러 이미지 순차 저장

## 실행

정적 파일이므로 `index.html`을 직접 열어도 되고, 로컬 서버를 사용하는 편이 권장됩니다.

```bash
cd /Users/nicechann/Dev/nicechann.github.io/app-assets
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속.

GitHub Pages 저장소 안에 배치했다면 커밋/푸시 후 아래 형태로 접근할 수 있습니다.

```text
https://nicechann.github.io/app-assets/
```

## Apple 스크린샷 규격

2026-09-19 Apple App Store Connect 공식 Screenshot specifications 기준으로 프리셋을 구성했습니다.

- iPhone 6.9: 1260×2736, 1290×2796, 1320×2868
- iPhone 6.5: 1242×2688, 1284×2778
- iPhone 6.3: 1179×2556, 1206×2622
- iPad 13: 2048×2732, 2064×2752
- Mac: 1280×800, 1440×900, 2560×1600, 2880×1800
- App Store 스크린샷은 alpha channel / transparency 불가

공식 문서: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
