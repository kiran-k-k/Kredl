const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/app/admin/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Revert the bad sed syntax if it's there
  content = content.replace(/\{\* @ts-expect-error Base UI IconButton types do not include children \*\}\n          /g, '');
  
  // Clean up any double expect errors
  content = content.replace(/\{\/\* @ts-expect-error.*?\*\/\}\s*\{\/\* @ts-expect-error.*?\*\/\}/g, '{/* @ts-expect-error Base UI IconButton types do not include children */}');
  
  // Let's just fix IconButton occurrences that don't have the comment right above them
  let lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<IconButton') && !lines[i].includes('//') && !lines[i].includes('/*')) {
      if (i > 0 && !lines[i-1].includes('@ts-expect-error')) {
        let whitespaceMatch = lines[i].match(/^\s*/);
        let whitespace = whitespaceMatch ? whitespaceMatch[0] : '';
        lines.splice(i, 0, `${whitespace}{/* @ts-expect-error Base UI IconButton types do not include children */}`);
        i++; // skip the newly inserted line
      }
    }
  }
  
  fs.writeFileSync(file, lines.join('\n'));
});
