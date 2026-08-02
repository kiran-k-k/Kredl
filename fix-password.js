const fs = require('fs');
let code = fs.readFileSync('src/components/ui/password-input.tsx', 'utf8');

code = code.replace(
  'export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}',
  'export type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>'
);

fs.writeFileSync('src/components/ui/password-input.tsx', code);
