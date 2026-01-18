// Cloudflare Pages middleware for SPA routing
export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Don't rewrite API routes or static assets
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(js|css|json|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/)
  ) {
    return context.next();
  }

  // Rewrite all other requests to index.html for SPA routing
  return context.next({
    rewrite: new URL('/index.html', request.url)
  });
}
