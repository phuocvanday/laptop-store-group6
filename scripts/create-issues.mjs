// Tạo issue #1..#31 từ docs/ASSIGNMENT.md (mục 7). Chạy 1 lần, trong thư mục repo:
//   node scripts/create-issues.mjs --dry-run   (xem trước)
//   node scripts/create-issues.mjs             (tạo thật)
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// ====== CẤU HÌNH: username GitHub thật của nhóm ======
const USERS = {
  A: 'phuocvanday',       // Phước (Leader)
  B: 'quyvan21012005',    // Quý
  C: 'nhan2005mk',        // Nhân
};
// =====================================================

const DRY = process.argv.includes('--dry-run');
const md = readFileSync(new URL('../docs/ASSIGNMENT.md', import.meta.url), 'utf8');
const tmp = mkdtempSync(join(tmpdir(), 'issues-'));
const cell = (block, name) =>
  block.match(new RegExp(`\\|\\s*\\*\\*${name}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|`))?.[1] ?? '';

const blocks = md.split(/^### Issue /m).slice(1);
let expect = 1;

for (const block of blocks) {
  const no = Number(block.match(/^(\d+)/)[1]);
  const title = cell(block, 'Title').replace(/`/g, '');
  const assignee = USERS[cell(block, 'Assignees').trim()[0]];
  const labels = [...cell(block, 'Labels').matchAll(/`([^`]+)`/g)].map((m) => m[1]).join(',');
  const project = cell(block, 'Projects').replace(/`/g, '');
  // Đề dùng gạch dài "—"; nếu trên GitHub tạo nhầm bằng "-" vẫn khớp được
  const milestone = cell(block, 'Milestone')
    .replace(/`/g, '')
    .replace(/\s*[\u2013\u2014\-]\s*/g, ' — ');
  const body = block.match(/`{3}markdown\n([\s\S]*?)\n`{3}/)[1];

  const file = join(tmp, `issue-${no}.md`);
  writeFileSync(file, body, 'utf8');
  const args = [
    'issue',
    'create',
    '--title',
    title,
    '--body-file',
    file,
    '--label',
    labels,
    '--milestone',
    milestone,
    '--assignee',
    assignee,
    '--project',
    project,
  ];

  if (DRY) {
    console.log(`#${no}`, args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(' '));
    continue;
  }
  const url = execFileSync('gh', args, { encoding: 'utf8' }).trim();
  const num = Number(url.split('/').pop());
  console.log(`✔ #${num}  ${title}`);
  if (num !== expect) {
    console.log(`⚠ Số issue là #${num}, dự kiến #${expect} — dùng số THẬT trong tên nhánh/commit`);
  }
  expect = num + 1;
}
console.log('Hoàn tất. Kiểm tra: gh issue list --limit 40');
