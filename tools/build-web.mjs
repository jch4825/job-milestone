/**
 * 웹판 배포용 폴더 만들기 → dist/job-milestone/   (npm run build:web)
 *  - 게임에 필요한 파일만 모읍니다: index.html · css · js · assets
 *    (원본 그림·영상 assets/_src, 문서 *.md 는 뺌. 도구 tools · 문서 docs · 이전 판 legacy · 원본 소리는 넣지 않음)
 *  - 폴더 이름이 Vercel 프로젝트 이름(job-milestone)이 됩니다. GitHub Pages 에도 쓸 수 있게 .nojekyll 을 넣습니다.
 *  - 웹판에서는 로컬 AI 면접관을 찾지 않습니다(js/game/llm.js localPage). 저장은 그 브라우저에만 남습니다.
 *  - Vercel 미리 보기 배포: npx vercel@64.5.0 deploy dist/job-milestone --scope jch4825s-projects
 *    (첫 배포는 Vercel 이 정식 배포로 올려 공개 주소를 붙였음 → 2026-10-17 공개 주소를 떼어 냄. 공개는 사용자 허락 뒤에만 --prod)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'dist', 'job-milestone');
const PARTS = ['index.html', 'css', 'js', 'assets'];
const skip = (rel) => rel.startsWith('assets/_src/') || rel.endsWith('.md') || path.basename(rel) === '.DS_Store' || path.basename(rel) === 'Thumbs.db';

// Vercel 프로젝트 연결 정보(.vercel)는 남겨 두고 나머지만 지움 → 다음 배포도 같은 프로젝트(job-milestone)로
if (fs.existsSync(OUT)) for (const f of fs.readdirSync(OUT)) if (f !== '.vercel') fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
let files = 0;
let bytes = 0;
function copy(rel) {
  const src = path.join(root, rel);
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    for (const f of fs.readdirSync(src)) copy(`${rel}/${f}`);
    return;
  }
  if (skip(rel)) return;
  const dst = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  files += 1;
  bytes += st.size;
}
for (const p of PARTS) copy(p);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
// Vercel 캐시 설정(2026-10-26, 웹판에서 그림이 한 템포 늦게 뜨던 문제): 그림·소리·글꼴은 한 시간 동안 서버에 다시 묻지 않고,
// 그 뒤에는 받아 둔 것을 먼저 쓰면서 뒤에서 새로 확인(다음에 열 때 바뀐 그림). 목록 JSON 은 게임이 늘 새로 받으므로(cache: 'no-store')
// 이 설정과 상관없이 바로 바뀜. html·js·css 는 기본값(매번 확인) 그대로
const CACHE = 'public, max-age=3600, stale-while-revalidate=604800';
fs.writeFileSync(path.join(OUT, 'vercel.json'), `${JSON.stringify({ headers: [{ source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: CACHE }] }] }, null, 2)}\n`);
console.log(`웹판 → dist/job-milestone/ (파일 ${files}개, ${(bytes / 1024 / 1024).toFixed(1)}MB)`);
