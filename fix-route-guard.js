const fs = require('fs');
let code = fs.readFileSync('src/components/auth/route-guard.tsx', 'utf8');

const replacement = `export function RouteGuard({ 
  children,
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isAuthenticated, isLoading, isInitialized, fetchUser } = useAuthStore()`;

code = code.replace(
  'export function RouteGuard({ children }: { children: React.ReactNode }) {\n  const { isAuthenticated, isLoading, isInitialized, fetchUser } = useAuthStore()',
  replacement
);

const redirectLogic = `
  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        if (pathname?.startsWith("/dashboard")) {
          router.replace(\`/login?redirect=\${encodeURIComponent(pathname)}\`)
        }
      } else if (allowedRoles && user && !allowedRoles.includes(user.roleId)) {
        router.replace("/unauthorized")
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, user, allowedRoles, router, pathname])`;

code = code.replace(
  /  useEffect\(\(\) => \{\n    \/\/ Only redirect once initialization is complete and we know they aren't authenticated\n    if \(isInitialized && !isLoading && !isAuthenticated\) \{\n      \/\/ Protect dashboard routes\n      if \(pathname\?\.startsWith\("\/dashboard"\)\) \{\n        router\.replace\(`\/login\?redirect=\$\{encodeURIComponent\(pathname\)\}`\)\n      \}\n    \}\n  \}, \[isInitialized, isLoading, isAuthenticated, router, pathname\]\)/,
  redirectLogic
);

const renderLogic = `
  // If authenticated but unauthorized, render nothing while redirect happens
  if (isAuthenticated && user && allowedRoles && !allowedRoles.includes(user.roleId)) {
    return null
  }`;

code = code.replace(
  '  // If authenticated or not on a protected route, render the content\n  return <>{children}</>',
  renderLogic + '\n\n  // If authenticated or not on a protected route, render the content\n  return <>{children}</>'
);

fs.writeFileSync('src/components/auth/route-guard.tsx', code);
