/**
 * Cloudflare Worker CORS Proxy with Custom Cookie Support
 * 
 * This worker acts as a proxy between your frontend web application and truyenhdc.com.
 * It bypasses browser CORS restrictions and attaches the required session cookies.
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Define CORS headers to allow requests from any origin (e.g. GitHub Pages, localhost)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Cookie',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Parse request URL to extract the target URL from the query parameter
  const requestUrl = new URL(request.url);
  const targetUrl = requestUrl.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing target "url" parameter.' }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Validate target URL is allowed
    const parsedTarget = new URL(targetUrl);
    if (parsedTarget.hostname !== 'truyenhdc.com' && parsedTarget.hostname !== 'www.truyenhdc.com') {
      return new Response(JSON.stringify({ error: 'Only requests to truyenhdc.com are allowed.' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get the cookie string from custom header
    const xCookie = request.headers.get('X-Cookie');

    // Build headers for the target request
    const headers = new Headers();
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8');
    headers.set('Accept-Language', 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7');
    
    if (xCookie) {
      headers.set('Cookie', xCookie.trim());
    }

    // Fetch the target resource
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method === 'POST' ? await request.blob() : null,
      redirect: 'follow'
    });

    // Read the response content
    const responseText = await response.text();

    // Return the response with CORS headers
    return new Response(responseText, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'text/html; charset=utf-8'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
