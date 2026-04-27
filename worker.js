export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── Auth popup: tutup otomatis karena sudah login via form ──
    if (url.pathname === '/auth') {
      return new Response(`<!DOCTYPE html><html><body>
        <p>Sudah terautentikasi. Menutup...</p>
        <script>
          if (window.opener) {
            var token = JSON.parse(localStorage.getItem('netlify-cms-user') || '{}').token;
            if (token) {
              window.opener.postMessage(
                'authorization:github:success:' + JSON.stringify({token: token, provider: 'github'}),
                '*'
              );
            }
          }
          window.close();
        </script>
      </body></html>`, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    // ── Admin Login: Verifikasi email + password ──
    if (url.pathname === '/admin/login' && request.method === 'POST') {
      try {
        const { email, password } = await request.json();

        // Cek email dan password
        if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
          return new Response(
            JSON.stringify({
              token: env.GITHUB_PAT,
              login: env.GITHUB_USERNAME || 'admin',
              name: 'Admin Orca',
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',
              },
            }
          );
        }

        return new Response(
          JSON.stringify({ error: 'Email atau password salah' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ error: 'Request tidak valid' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // ── Semua route lain: Sajikan file statis ──
    return env.ASSETS.fetch(request);
  },
};
