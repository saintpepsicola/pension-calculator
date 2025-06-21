const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function walk(dir, exclude = []) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (exclude.includes(p)) return [];
        return walk(p, exclude);
      }
      return p;
    });
}

const componentsDir = path.join(root, 'components');
const libDir = path.join(root, 'lib');
const outPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'code-output.txt');
const out = fs.createWriteStream(outPath);

const files = [
  ...walk(componentsDir, [path.join(componentsDir, 'ui')]),
  ...walk(libDir),
].filter((f) => !f.includes(`${path.sep}components${path.sep}ui${path.sep}`));

for (const file of files) {
  const rel = path.relative(root, file);
  out.write('```\n');
  out.write(rel + '\n');
  out.write(fs.readFileSync(file, 'utf8') + '\n');
  out.write('```\n\n');
}
out.end(() => {
  console.log('Wrote output to ' + outPath);
});
