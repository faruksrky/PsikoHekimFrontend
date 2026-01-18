// Cloudflare Pages Functions middleware for SPA routing
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Static assets ve API isteklerini olduğu gibi geçir
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/logo/') ||
    url.pathname.match(/\.(js|css|json|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/) ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/index.html'
  ) {
    return next();
  }
  
  // Diğer tüm path'leri index.html'e rewrite et (SPA routing)
  return next({
    rewrite: new URL('/index.html', request.url)
  });
}
