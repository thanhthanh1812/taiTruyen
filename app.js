import * as docx from 'https://cdn.jsdelivr.net/npm/docx@8.5.0/+esm';

// Cloudflare Worker code for the display and copy button
const WORKER_CODE = `/**
 * Cloudflare Worker CORS Proxy with Custom Cookie Support
 * 
 * This worker acts as a proxy between your frontend web application and truyenhdc.com.
 * It bypasses browser CORS restrictions and attaches the required session cookies.
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Cookie',
    'Access-Control-Max-Age': '86400',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  const requestUrl = new URL(request.url);
  const targetUrl = requestUrl.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing target "url" parameter.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const parsedTarget = new URL(targetUrl);
    if (parsedTarget.hostname !== 'truyenhdc.com' && parsedTarget.hostname !== 'www.truyenhdc.com') {
      return new Response(JSON.stringify({ error: 'Only requests to truyenhdc.com are allowed.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const xCookie = request.headers.get('X-Cookie');
    const headers = new Headers();
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8');
    
    if (xCookie) {
      headers.set('Cookie', xCookie.trim());
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method === 'POST' ? await request.blob() : null,
      redirect: 'follow'
    });

    const responseText = await response.text();

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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}`;

document.addEventListener('DOMContentLoaded', () => {
  // Load UI elements
  const cookieNameInput = document.getElementById('cookieName');
  const cookieValueInput = document.getElementById('cookieValue');
  const storyIdInput = document.getElementById('storyId');
  const totalPagesInput = document.getElementById('totalPages');
  const fileNameInput = document.getElementById('fileName');
  const useProxyCheckbox = document.getElementById('useProxy');
  const proxyUrlGroup = document.getElementById('proxyUrlGroup');
  const proxyUrlInput = document.getElementById('proxyUrl');
  
  const downloadBtn = document.getElementById('downloadBtn');
  const btnText = document.getElementById('btnText');
  const clearConsoleBtn = document.getElementById('clearConsoleBtn');
  const consoleBody = document.getElementById('consoleBody');
  const consoleStatusDot = document.getElementById('consoleStatusDot');
  
  const accordion = document.getElementById('instructionAccordion');
  const copyWorkerCodeBtn = document.getElementById('copyWorkerCodeBtn');
  const workerCodeBlock = document.getElementById('workerCodeBlock');

  // Load Cloudflare Worker code into instruction block
  if (workerCodeBlock) {
    workerCodeBlock.textContent = WORKER_CODE;
  }

  // Load configuration from localStorage
  const savedConfig = {
    cookieName: localStorage.getItem('tr_cookieName') || '',
    cookieValue: localStorage.getItem('tr_cookieValue') || '',
    storyId: localStorage.getItem('tr_storyId') || '',
    totalPages: localStorage.getItem('tr_totalPages') || '2',
    fileName: localStorage.getItem('tr_fileName') || '',
    useProxy: localStorage.getItem('tr_useProxy') === 'true',
    proxyUrl: localStorage.getItem('tr_proxyUrl') || ''
  };

  cookieNameInput.value = savedConfig.cookieName;
  cookieValueInput.value = savedConfig.cookieValue;
  storyIdInput.value = savedConfig.storyId;
  totalPagesInput.value = savedConfig.totalPages;
  fileNameInput.value = savedConfig.fileName;
  useProxyCheckbox.checked = savedConfig.useProxy;
  proxyUrlInput.value = savedConfig.proxyUrl;

  // Toggle Proxy URL field visibility based on checkbox
  const toggleProxyVisibility = () => {
    if (useProxyCheckbox.checked) {
      proxyUrlGroup.style.display = 'block';
    } else {
      proxyUrlGroup.style.display = 'none';
    }
  };
  toggleProxyVisibility();
  useProxyCheckbox.addEventListener('change', toggleProxyVisibility);

  // Toggle Accordion Instructions
  accordion.querySelector('.accordion-header').addEventListener('click', () => {
    accordion.classList.toggle('open');
  });

  // Copy Worker Code Button
  copyWorkerCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(WORKER_CODE).then(() => {
      const originalText = copyWorkerCodeBtn.textContent;
      copyWorkerCodeBtn.textContent = 'Đã copy!';
      copyWorkerCodeBtn.style.backgroundColor = '#10b981';
      setTimeout(() => {
        copyWorkerCodeBtn.textContent = originalText;
        copyWorkerCodeBtn.style.backgroundColor = '';
      }, 2000);
    }).catch(err => {
      log('Lỗi copy: ' + err, 'error');
    });
  });

  // Clear Console Button
  clearConsoleBtn.addEventListener('click', () => {
    consoleBody.innerHTML = '';
    log('Đã xóa log.', 'debug');
  });

  // Log helper function
  function log(message, type = 'info') {
    const line = document.createElement('span');
    line.className = `console-line ${type}`;
    
    // Add timestamp
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    line.textContent = `[${timeStr}] ${message}\n`;
    consoleBody.appendChild(line);
    consoleBody.scrollTop = consoleBody.scrollHeight;
  }

  // Sleep helper function
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Main download click handler
  downloadBtn.addEventListener('click', async () => {
    // Validate inputs
    const cookieName = cookieNameInput.value.trim();
    const cookieValue = cookieValueInput.value.trim();
    const storyId = storyIdInput.value.trim();
    const totalPages = parseInt(totalPagesInput.value.trim(), 10);
    let fileName = fileNameInput.value.trim();
    const useProxy = useProxyCheckbox.checked;
    let proxyUrl = useProxy ? proxyUrlInput.value.trim() : '';

    if (!cookieName || !cookieValue || !storyId || isNaN(totalPages) || !fileName) {
      log('Vui lòng điền đầy đủ thông tin Cookie, ID truyện, Số trang và Tên file!', 'error');
      return;
    }

    if (useProxy && !proxyUrl) {
      log('Vui lòng điền địa chỉ CORS Proxy!', 'error');
      return;
    }

    // Standardize file name
    if (!fileName.endsWith('.docx')) {
      fileName += '.docx';
    }
    // Remove slash characters from file name for browser download security
    fileName = fileName.replace(/[\/\\]/g, '_');

    // Standardize proxy URL (remove trailing slash)
    if (proxyUrl && proxyUrl.endsWith('/')) {
      proxyUrl = proxyUrl.slice(0, -1);
    }

    // Warn about cors-anywhere.herokuapp.com limitations
    if (proxyUrl && proxyUrl.includes('cors-anywhere.herokuapp.com')) {
      log('[Cảnh báo] Proxy công cộng cors-anywhere.herokuapp.com không hỗ trợ chuyển tiếp Cookie đăng nhập và sẽ bị lỗi 403. Vui lòng tự tạo Cloudflare Worker cá nhân (Cách 2) hoặc dùng Extension CORS trên Chrome và ĐỂ TRỐNG ô này (Cách 1)!', 'error');
      downloadBtn.disabled = false;
      downloadBtn.classList.remove('loading');
      btnText.textContent = 'Tải Truyện và Xuất Word';
      consoleStatusDot.className = 'console-dot error';
      return;
    }

    // Save configurations to localStorage
    localStorage.setItem('tr_cookieName', cookieName);
    localStorage.setItem('tr_cookieValue', cookieValue);
    localStorage.setItem('tr_storyId', storyId);
    localStorage.setItem('tr_totalPages', totalPages.toString());
    localStorage.setItem('tr_fileName', fileName);
    localStorage.setItem('tr_useProxy', useProxy.toString());
    localStorage.setItem('tr_proxyUrl', proxyUrl);

    // Update UI to loading state
    downloadBtn.disabled = true;
    downloadBtn.classList.add('loading');
    btnText.textContent = 'Đang tải truyện...';
    consoleStatusDot.className = 'console-dot'; // Green pulsating state (default success-color class is active)
    
    log(`Bắt đầu quá trình tải truyện (ID: ${storyId}, Tổng số trang: ${totalPages}) | Phiên bản Tool: v1.0.6 - ESM...`, 'info');

    try {
      // Setup fetch options depending on whether Proxy is used or not
      const getFetchOptions = () => {
        if (proxyUrl) {
          return {
            headers: {
              'X-Cookie': `${cookieName}=${cookieValue}`
            }
          };
        } else {
          // When sending directly, use include credentials to send browser session cookies
          // This requires user to enable a browser CORS extension
          return {
            credentials: 'include'
          };
        }
      };

      // --- BƯỚC 1: Lấy danh sách ID chương ---
      const chapterIds = [];
      log('Đang quét danh sách chương từ trang quản lý...', 'info');

      for (let page = 1; page <= totalPages; page++) {
        log(`Đang quét trang ${page}/${totalPages}...`, 'info');
        
        const targetUrl = `https://truyenhdc.com/user/quan-ly-truyen/dsc/?id=${storyId}&n=${page}`;
        const requestUrl = proxyUrl ? `${proxyUrl}?url=${encodeURIComponent(targetUrl)}` : targetUrl;

        try {
          const res = await fetch(requestUrl, getFetchOptions());
          if (!res.ok) {
            throw new Error(`Mã lỗi HTTP: ${res.status}`);
          }
          const htmlText = await res.text();
          
          // Parse HTML content
          const parser = new DOMParser();
          const docHTML = parser.parseFromString(htmlText, 'text/html');
          
          const listGroup = docHTML.getElementById('dsc');
          if (!listGroup) {
            const pageTitle = docHTML.title || 'Không có tiêu đề';
            // Extract a clean text preview from body
            let bodyText = '';
            if (docHTML.body) {
              bodyText = docHTML.body.innerText || docHTML.body.textContent || '';
              bodyText = bodyText.replace(/\s+/g, ' ').trim().substring(0, 200);
            } else {
              bodyText = 'Không tìm thấy thẻ body';
            }
            
            log(`[Lỗi] Không tìm thấy danh sách chương (#dsc) tại trang ${page}.`, 'error');
            log(`[Chi tiết phản hồi] HTTP: ${res.status} | Tiêu đề trang: "${pageTitle}" | Độ dài HTML: ${htmlText.length} ký tự.`, 'warning');
            log(`[Xem trước nội dung]: "${bodyText}..."`, 'warning');
            log(`Gợi ý: Nếu trang yêu cầu đăng nhập, có thể Cookie của bạn đã hết hạn hoặc sai định dạng. Nếu gặp lỗi Access Denied, vui lòng bật extension CORS.`, 'info');
            break;
          }

          const items = listGroup.querySelectorAll('.list-group-item');
          let foundInPage = 0;

          items.forEach(item => {
            const editBtn = item.querySelector('a[href*="edit-chuong"]');
            if (editBtn) {
              const href = editBtn.getAttribute('href');
              const urlParams = new URLSearchParams(href.split('?')[1]);
              const cId = urlParams.get('id');
              if (cId) {
                chapterIds.push(cId);
                foundInPage++;
              }
            }
          });

          log(`Trang ${page}: Tìm thấy ${foundInPage} chương.`, 'debug');
          
        } catch (err) {
          log(`Lỗi khi quét trang ${page}: ${err.message}`, 'error');
        }

        // Sleep to avoid rate limiting
        await sleep(300);
      }

      if (chapterIds.length === 0) {
        throw new Error('Không tìm thấy chương nào. Quá trình tải thất bại.');
      }

      // Reverse list to get chronological order (oldest first), matching main.py logic
      chapterIds.reverse();
      log(`Tìm thấy tổng cộng ${chapterIds.length} chương. Bắt đầu tải chi tiết từng chương...`, 'success');

      // --- BƯỚC 2: Tải nội dung từng chương ---
      const chaptersData = [];

      for (let i = 0; i < chapterIds.length; i++) {
        const cId = chapterIds[i];
        const currentIdx = i + 1;
        
        log(`[${currentIdx}/${chapterIds.length}] Đang tải chương ID: ${cId}...`, 'info');

        const targetUrl = `https://truyenhdc.com/user/quan-ly-truyen/edit-chuong/?id=${cId}`;
        const requestUrl = proxyUrl ? `${proxyUrl}?url=${encodeURIComponent(targetUrl)}` : targetUrl;

        try {
          const res = await fetch(requestUrl, getFetchOptions());
          if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
          }
          const htmlText = await res.text();

          const parser = new DOMParser();
          const docHTML = parser.parseFromString(htmlText, 'text/html');

          // Extract Chapter Title
          const titleInput = docHTML.getElementById('ten_chuong');
          const title = titleInput ? titleInput.value : `Chương ${cId}`;

          // Extract Rich Content
          const contentDiv = docHTML.getElementById('richeditor');
          let content = '';

          if (contentDiv) {
            const clone = contentDiv.cloneNode(true);
            
            // Replace <br> with newlines
            clone.querySelectorAll('br').forEach(br => {
              br.replaceWith('\n');
            });
            
            // Add newline after paragraphs
            clone.querySelectorAll('p').forEach(p => {
              p.appendChild(document.createTextNode('\n'));
            });

            content = clone.textContent || '';
            content = content.replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n\n').trim();
          } else {
            content = '[Không lấy được nội dung chương]';
          }

          chaptersData.push({ title, content });
          log(`[${currentIdx}/${chapterIds.length}] Đã tải thành công: ${title}`, 'success');

        } catch (err) {
          log(`[${currentIdx}/${chapterIds.length}] Lỗi khi tải chương ID ${cId}: ${err.message}`, 'error');
          chaptersData.push({ 
            title: `Chương ID ${cId} (Lỗi)`, 
            content: `[Gặp lỗi trong quá trình tải chương này: ${err.message}]` 
          });
        }

        // Sleep to avoid rate limiting
        await sleep(500);
      }

      // --- BƯỚC 3: Tạo và xuất file Word .docx ---
      log('Đang khởi tạo cấu trúc tài liệu Word...', 'info');
      
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
      const docElements = [];

      chaptersData.forEach((chap, idx) => {
        // Add Title Header
        docElements.push(
          new Paragraph({
            text: chap.title.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            pageBreakBefore: idx > 0, // Page break before every chapter except the first
            spacing: {
              before: 240, // 12pt
              after: 240,  // 12pt
            }
          })
        );

        // Add Chapter Content paragraph by paragraph
        const lines = chap.content.split('\n');
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.length > 0) {
            docElements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: trimmed,
                    size: 26, // 13pt
                    font: 'Times New Roman'
                  })
                ],
                spacing: {
                  after: 120, // 6pt space after paragraph
                  line: 360,  // 1.5 line spacing
                },
                indent: {
                  firstLine: 720, // 0.5 inch indent
                }
              })
            );
          }
        });
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: docElements
        }]
      });

      log('Đang kết xuất và đóng gói file Word...', 'info');
      
      const blob = await Packer.toBlob(doc);
      
      log(`Chuẩn bị tải xuống file: ${fileName}`, 'info');

      // Trigger browser download
      const downloadUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.download = fileName;
      document.body.appendChild(tempLink);
      tempLink.click();
      
      // Cleanup
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(downloadUrl);

      log(`Đã hoàn thành! File "${fileName}" đã được tải xuống tự động.`, 'success');

    } catch (error) {
      log(`Lỗi nghiêm trọng: ${error.message}`, 'error');
      consoleStatusDot.className = 'console-dot error';
    } finally {
      // Restore UI elements
      downloadBtn.disabled = false;
      downloadBtn.classList.remove('loading');
      btnText.textContent = 'Tải Truyện và Xuất Word';
      if (consoleStatusDot.className !== 'console-dot error') {
        consoleStatusDot.className = 'console-dot idle';
      }
    }
  });
});
