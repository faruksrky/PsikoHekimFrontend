// Cloudflare Pages Functions middleware for SPA routing
export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Static assets ve dosyaları olduğu gibi geçir
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/logo/') ||
    /\.(js|css|json|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/index.html'
  ) {
    return context.next();
  }
  
  // Diğer tüm path'leri index.html'e rewrite et (SPA routing)
  return context.next({
    rewrite: new URL('/index.html', url.origin)
  });
}
