# SLEEVE ROOM — User Guide / 사용 안내

[한국어](#한국어) · [English](#english)

## 한국어

좋아하는 앨범 커버를 모아 나만의 콜라주 포스터를 만드는 웹사이트입니다.

### 1. 설치 없이 사용하기

[SLEEVE ROOM 열기](https://sleeve-room-garage.mauveiris17.chatgpt.site)

다운로드나 Python 설치 없이 브라우저에서 바로 사용할 수 있습니다.

### 2. GitHub에서 다운로드해 실행하기

**준비물:** Python 3, 최신 웹 브라우저, 인터넷 연결. 별도 API 키나 추가 Python 패키지는 필요하지 않습니다.

1. 이 저장소에서 **Code → Download ZIP**을 선택합니다.
2. ZIP 파일의 압축을 풉니다.
3. 압축을 푼 프로젝트 폴더에서 PowerShell 또는 터미널을 엽니다. 해당 폴더 안에 `dist` 폴더가 있어야 합니다.
4. 운영체제에 맞는 명령을 실행합니다.

**Windows — PowerShell**

```powershell
py -m http.server 8000 --bind 127.0.0.1 --directory dist
```

**macOS / Linux — 터미널**

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

5. 브라우저에서 [http://localhost:8000](http://localhost:8000)을 엽니다.

사용하는 동안 터미널을 열어 두세요. 종료하려면 터미널에서 **Ctrl+C**를 누릅니다. `dist/index.html`을 더블클릭해 여는 방식은 JavaScript 모듈을 불러오지 못할 수 있으므로 위 방법으로 실행해 주세요.

### 3. 콜라주 만들기

1. **아티스트명** 또는 **앨범명**을 입력합니다. 둘 다 입력하면 두 조건을 모두 만족하는 앨범을 검색합니다.
2. 필요하면 **음반 종류**와 **추가 유형**을 선택하고 **조건으로 검색**을 누릅니다. 선택한 조건도 함께 적용됩니다.
3. 검색 결과 왼쪽의 **+**를 눌러 커버를 담습니다. 검색에 없는 커버는 **내 커버 이미지 올리기**로 추가할 수 있습니다.
4. **3×3, 4×4, 5×5, 10×10** 중 그리드를 선택합니다. 10×10은 최대 100장까지 배치할 수 있습니다.
5. 커버를 빈 칸으로 끌면 해당 위치로 이동하고, 다른 커버 위에 놓으면 자리를 바꿉니다.
6. 슬리브 디자인과 제목·색상·간격을 고릅니다. **커버만 · 여백 없이**는 제목과 장식 없이 커버 간격 0으로 저장합니다.
7. **PNG 저장**을 눌러 완성한 이미지를 다운로드합니다.

### 4. 저장과 문제 해결

- 작업은 해당 브라우저의 로컬 저장소에 자동 저장됩니다. 다른 기기·브라우저·사이트 주소 사이에 동기화되지는 않습니다. 브라우저 사이트 데이터를 지우면 저장된 작업도 사라질 수 있습니다.
- 앨범 검색과 온라인 커버를 불러오는 데 인터넷 연결이 필요합니다. MusicBrainz / Cover Art Archive에 등록되지 않은 커버는 직접 업로드해 주세요.
- `py` 또는 `python3`를 찾을 수 없다는 메시지가 나오면 [Python](https://www.python.org/downloads/)을 설치하고 터미널을 다시 엽니다. Windows에서 `py` 대신 `python` 명령으로 설치되어 있다면 `python -m http.server 8000 --bind 127.0.0.1 --directory dist`를 사용합니다.
- 8000번 포트를 사용할 수 없다면 명령의 `8000`을 `8001`로 바꾸고 [http://localhost:8001](http://localhost:8001)을 엽니다.
- 앨범 커버의 권리는 각 권리자에게 있습니다.

---

## English

SLEEVE ROOM is a website for collecting your favorite album covers and arranging them into a personal collage poster.

### 1. Use it without installation

[Open SLEEVE ROOM](https://sleeve-room-garage.mauveiris17.chatgpt.site)

Use the hosted website directly in your browser. No download or Python installation is required.

### 2. Download from GitHub and run locally

**Requirements:** Python 3, a modern web browser, and an internet connection. No API key or additional Python packages are required.

1. On this repository, select **Code → Download ZIP**.
2. Extract the ZIP file.
3. Open PowerShell or a terminal in the extracted project folder. It should contain the `dist` folder.
4. Run the command for your operating system.

**Windows — PowerShell**

```powershell
py -m http.server 8000 --bind 127.0.0.1 --directory dist
```

**macOS / Linux — Terminal**

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

5. Open [http://localhost:8000](http://localhost:8000) in your browser.

Keep the terminal open while using the app. Press **Ctrl+C** in the terminal to stop the server. Opening `dist/index.html` by double-clicking may prevent JavaScript modules from loading, so use the local server above.

### 3. Create a collage

1. Enter an **artist name (아티스트명)** or **album title (앨범명)**. Entering both searches for albums matching both conditions.
2. Optionally select a **release type (음반 종류)** and **secondary type (추가 유형)**, then click **Search with these conditions (조건으로 검색)**. All selected conditions apply together.
3. Click **+** on the left of a search result to add its cover. Use **Upload a cover image (내 커버 이미지 올리기)** if a cover is missing.
4. Choose a **3×3, 4×4, 5×5, or 10×10** grid. The 10×10 grid holds up to 100 covers.
5. Drag a cover onto an empty cell to move it, or onto another cover to swap their positions.
6. Choose a sleeve design and adjust the title, color, and spacing. **Covers only, no gaps (커버만 · 여백 없이)** exports covers with zero spacing and no title or decoration.
7. Click **Save PNG (PNG 저장)** to download your finished image.

The current app interface is in Korean; the labels above help identify its controls.

### 4. Storage and troubleshooting

- Your work is saved automatically in the current browser's local storage. It does not sync across devices, browsers, or different site addresses. Clearing site data may remove saved work.
- Searching albums and loading online covers require an internet connection. Upload your own image when a cover is unavailable from MusicBrainz / Cover Art Archive.
- If `py` or `python3` is not found, install [Python](https://www.python.org/downloads/) and reopen your terminal. On Windows, if your installation provides `python` instead of `py`, use `python -m http.server 8000 --bind 127.0.0.1 --directory dist`.
- If port 8000 is unavailable, replace `8000` with `8001` in the command and open [http://localhost:8001](http://localhost:8001).
- Album artwork belongs to its respective rights holders.
