export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── OAuth: Redirect ke GitHub ──
    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: 'repo,user',
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`,
        302
      );
    }

    // ── OAuth: Callback dari GitHub ──
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');

      if (!code) {
        return new Response('Missing code parameter', { status: 400 });
      }

      const tokenResponse = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );

      const data = await tokenResponse.json();

      if (data.error) {
        return new Response(
          `OAuth Error: ${data.error_description || data.error}`,
          { status: 400 }
        );
      }

      const token = data.access_token;
      const encodedToken = encodeURIComponent(token);

      // Kirim token ke jendela CMS melalui postMessage
      const body = `<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<p>Mengautentikasi... Tunggu sebentar.</p>
<script>
(function() {
  var token = decodeURIComponent("${encodedToken}");
  var provider = "github";
  function receiveMessage(e) {
    window.opener.postMessage(
      "authorization:" + provider + ":success:" + JSON.stringify({token: token, provider: provider}),
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:" + provider, "*");
})();
</script>
</body>
</html>`;

      return new Response(body, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    // ── Semua route lain: Sajikan file statis ──
    return env.ASSETS.fetch(request);
  },
};
