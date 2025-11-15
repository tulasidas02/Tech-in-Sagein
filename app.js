const toggle = document.getElementById("modeToggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const storedTheme = localStorage.getItem("techInSageinTheme");
const body = document.body;
const icon = toggle?.querySelector(".mode-icon");
const loader = document.getElementById("pageLoader");

function showLoader() {
  loader?.classList.add("active");
}

function hideLoader() {
  loader?.classList.remove("active");
}

function setTheme(mode) {
  body.classList.remove("light-mode", "dark-mode");
  body.classList.add(mode);
  localStorage.setItem("techInSageinTheme", mode);
  if (icon) icon.textContent = mode === "dark-mode" ? "☀️" : "🌙";
}

if (storedTheme) {
  setTheme(storedTheme);
} else if (prefersDark.matches) {
  setTheme("dark-mode");
} else {
  setTheme("light-mode");
}

toggle?.addEventListener("click", () => {
  const current = body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";
  setTheme(current === "dark-mode" ? "light-mode" : "dark-mode");
});

const navLinks = document.querySelectorAll('a[data-refresh="hard"]');
navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const href = link.getAttribute("href");
    if (!href) return;
    const section = href.startsWith("#") ? href.slice(1) : href;
    showLoader();
    setTimeout(() => {
      const targetUrl = `${window.location.pathname}?section=${encodeURIComponent(section || "top")}`;
      window.location.assign(targetUrl);
    }, 120);
  });
});

const homeLink = document.querySelector('a[href="#top"]');
homeLink?.addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("DOMContentLoaded", () => {
  hideLoader();

  // Measure fixed header height and set CSS offsets so content isn’t hidden
  const setHeaderOffset = () => {
    const mast = document.querySelector('.site-masthead');
    if (!mast) return;
    const h = mast.offsetHeight;
    document.documentElement.style.setProperty('--header-offset-desktop', `${h}px`);
    document.documentElement.style.setProperty('--header-offset-mobile', `${Math.max(96, h)}px`);
  };
  setHeaderOffset();
  window.addEventListener('resize', () => { requestAnimationFrame(setHeaderOffset); }, { passive: true });

  const params = new URLSearchParams(window.location.search);
  const section = params.get("section");
  if (section) {
    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    history.replaceState(null, "", section === "top" ? "#top" : `#${section}`);
  }
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // Image fallbacks for content images
  const placeholder = () => 'tech in sagein.jpg';
  document.querySelectorAll('.article-hero img, .card-media img').forEach((img) => {
    img.addEventListener('error', () => {
      img.src = placeholder(img.alt || 'technology');
    }, { once: true });
  });
  // Auto-tag existing article links so inline reader always works
  const autoTagInlineLinks = () => {
    const anchors = document.querySelectorAll('.story-card a, a.card-media, .trending-list a, .latest-list a, .popular-list a, .header-quick-links a');
    anchors.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!href) return;
      // Only tag internal article/page html links (exclude hashes and external)
      if (/\.html?$/i.test(href) && !/^https?:/i.test(href) && !a.hasAttribute('data-inline')) {
        a.setAttribute('data-inline', 'reader');
        a.setAttribute('data-url', href);
      }
    });
  };
  autoTagInlineLinks();

  const articles = [
    { title: 'AI Agents Are Creating New Hacking Risks — Experts Warn', url: 'ai-agents-hacking-risks.html', thumb: "article pic/AI agents or hackers' best friends/Generated Image November 15, 2025 - 2_21PM (1).png" },
    { title: 'How to Delete Gmail Account', url: 'delete-gmail-account.html', thumb: 'article pic/How to Permanently Delete Your Gmai/maxresdefault (1).webp' },
    { title: 'Create Jio Gemini Youth Offer', url: 'Create jio-gemini-youth-offer.html', thumb: 'article pic/gemini jio/Jio Google Gemini Offer ಹೇಗೆ ಕ್ಲೈಮ್ ಮಾಡಬೇಕು.png' },
    { title: 'Canara Bank FD Partial Withdrawal', url: 'canara-bank-fd-partial-withdrawal.html', thumb: 'article pic/Canara Bank FD partial withdrawal/VS--YouTube-HowtoWithdrawPartofYourFixedDepositinCanaraBankinkannadaCanaraBankFDPartialRedempti-1’35”.jpg' },
    { title: 'ChatGPT GO Upgrade', url: 'chatgpt-go-upgrade.html', thumb: 'article pic/ow to Use ChatGPT Go for/maxresdefault.webp' }
  ];
  const renderCard = (a) => {
    const src = a.thumb ? encodeURI(a.thumb) : placeholder();
    return `<article class="story-card">
      <a class="card-media" href="${a.url}" data-inline="reader" data-url="${a.url}">
        <img src="${src}" alt="${a.title}" />
      </a>
      <div class="card-content">
        <h3><a href="${a.url}" data-inline="reader" data-url="${a.url}">${a.title}</a></h3>
      </div>
    </article>`;
  };
  const trendingGrid = document.querySelector('.trending .card-grid');
  if (trendingGrid && trendingGrid.children.length === 0) {
    trendingGrid.innerHTML = articles.slice(0, 4).map(renderCard).join('');
  }
  const popularGrid = document.querySelector('.popular .card-grid');
  if (popularGrid && popularGrid.children.length === 0) {
    popularGrid.innerHTML = articles.slice(0, 4).map(renderCard).join('');
  }
  const latestGrid = document.querySelector('.latest .card-grid');
  if (latestGrid && latestGrid.children.length === 0) {
    latestGrid.innerHTML = articles.slice(0, 4).map(renderCard).join('');
  }

  // Auto-show the most recent post inside div.content-stack on homepage
  const inlineSlot = document.getElementById('inlineArticle');
  if (inlineSlot && inlineSlot.hidden !== false) {
    const isHome = /(?:^|\/)index\.html?$/.test(location.pathname) || location.pathname === '/' || location.pathname === '';
    const hasHashNav = !!location.hash;
    if (isHome && !hasHashNav && articles[0]?.url) {
      // Load most recent post without pushing history
      fetchAndShowInlineArticle(articles[0].url);
    }
  }

  const notif = {
    supported: 'Notification' in window,
    button: null,
    init() {
      if (!this.supported) return;
      if (Notification.permission === 'default') this.insertButton();
      if (Notification.permission === 'granted' && !localStorage.getItem('tisNotifWelcomed')) {
        this.welcome();
      }
    },
    insertButton() {
      const host = document.querySelector('.header-quick-links') || document.querySelector('.site-header');
      if (!host) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Enable notifications';
      btn.style.cssText = 'padding:8px 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font-weight:600;cursor:pointer;';
      btn.addEventListener('click', async () => {
        try {
          const res = await Notification.requestPermission();
          if (res === 'granted') {
            this.welcome();
            btn.remove();
          }
        } catch (e) {}
      }, { once: true });
      host.appendChild(btn);
      this.button = btn;
    },
    welcome() {
      try {
        const opts = { body: 'Thanks for subscribing to updates from Tech in Sagein.', icon: 'tech in sagein.jpg', badge: 'tech in sagein.jpg' };
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(r => r?.showNotification ? r.showNotification('Tech in Sagein', opts) : new Notification('Tech in Sagein', opts));
        } else {
          new Notification('Tech in Sagein', opts);
        }
        localStorage.setItem('tisNotifWelcomed', '1');
      } catch (e) {}
    }
  };
  notif.init();
  if (notif.supported && Notification.permission === 'default' && !localStorage.getItem('tisNotifDismissed')) {
    setTimeout(() => {
      const overlay = document.createElement('div');
      overlay.id = 'tisNotifPopup';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);display:grid;place-items:center;';
      const box = document.createElement('div');
      box.style.cssText = 'width:min(420px,92vw);background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow);padding:22px 20px;display:grid;gap:12px;';
      const h = document.createElement('h3');
      h.textContent = 'Enable notifications?';
      h.style.cssText = 'margin:0;font-size:1.1rem;';
      const p = document.createElement('p');
      p.textContent = 'Get alerts when new guides and updates are published.';
      p.style.cssText = 'margin:0;color:var(--muted);line-height:1.6;';
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;margin-top:8px;';
      const later = document.createElement('button');
      later.type = 'button';
      later.textContent = 'Not now';
      later.style.cssText = 'padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface);font-weight:600;cursor:pointer;';
      const allow = document.createElement('button');
      allow.type = 'button';
      allow.textContent = 'Allow';
      allow.style.cssText = 'padding:10px 16px;border-radius:10px;border:1px solid var(--accent);background:var(--accent);color:#fff;font-weight:700;cursor:pointer;';
      later.addEventListener('click', () => { localStorage.setItem('tisNotifDismissed','1'); overlay.remove(); });
      allow.addEventListener('click', async () => {
        try {
          const res = await Notification.requestPermission();
          localStorage.setItem('tisNotifDismissed','1');
          overlay.remove();
          if (res === 'granted') notif.welcome();
        } catch (e) { overlay.remove(); }
      });
      box.append(h,p,row); row.append(later,allow); overlay.appendChild(box);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) { localStorage.setItem('tisNotifDismissed','1'); overlay.remove(); } });
      document.body.appendChild(overlay);
    }, 600);
  }
});

window.addEventListener("pageshow", () => {
  hideLoader();
});

// --- Lightweight SPA hash router: #post=..., #page=..., #category=...
function readHashPost() {
  const m = /#.*(?:post|Post)=([^&]+)/.exec(location.hash);
  return m ? decodeURIComponent(m[1]) : null;
}
function readHashPage() {
  const m = /#.*(?:page|Page)=([^&]+)/.exec(location.hash);
  return m ? decodeURIComponent(m[1]) : null;
}
function readHashCategory() {
  const m = /#.*(?:category|Category)=([^&]+)/.exec(location.hash);
  return m ? decodeURIComponent(m[1]) : null;
}

function mapPageToUrl(slug) {
  // About page is article.html in this site
  if (!slug) return null;
  if (/^about$/i.test(slug)) return 'article.html';
  if (/^contact$/i.test(slug)) return 'contact.html';
  if (/^privacy$/i.test(slug)) return 'privacy.html';
  if (/^disclaimer$/i.test(slug)) return 'disclaimer.html';
  return null;
}

function mapPostToUrl(slug) {
  if (!slug) return null;
  // If already ends with .html, use as-is; else append .html
  if (/\.html?$/i.test(slug)) return slug;
  return `${slug}.html`;
}

function scrollToCategory(cat) {
  if (!cat) return false;
  // Try to find an element by id matching the category or known sections
  const idCandidates = [
    cat, cat.toLowerCase(),
    cat.toLowerCase().replace(/\s+/g,'-'),
    `${cat.toLowerCase()}-heading`,
    'latest-heading','trending-heading','popular-heading','tech-heading'
  ];
  for (const id of idCandidates) {
    const node = document.getElementById(id);
    if (node) { node.scrollIntoView({ behavior: 'smooth', block: 'start' }); return true; }
  }
  return false;
}

async function handleHashNavigation() {
  const pageSlug = readHashPage();
  const postSlug = readHashPost();
  const cat = readHashCategory();
  if (pageSlug) {
    const url = mapPageToUrl(pageSlug);
    if (url) await fetchAndShowInlineArticle(url);
    return;
  }
  if (postSlug) {
    const url = mapPostToUrl(postSlug);
    if (url) await fetchAndShowInlineArticle(url);
    return;
  }
  if (cat) {
    scrollToCategory(cat);
    return;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  handleHashNavigation();
});
window.addEventListener('hashchange', () => {
  handleHashNavigation();
});

// Inline Reader: open article inline inside #inlineArticle on homepage (no overlay required)
document.addEventListener('click', async (e) => {
  const a = e.target.closest('a[data-inline="reader"]');
  if (!a) return;
  e.preventDefault();
  const url = a.getAttribute('data-url') || a.getAttribute('href');
  if (!url) return;
  const ok = await fetchAndShowInlineArticle(url);
  if (ok && window.history && window.history.pushState) {
    window.history.pushState({ inlineArticle: true, url }, '', url);
  } else {
    window.location.href = url; // fallback
  }
});

// Shared utility: fetch a URL and replace the current page's main content
async function fetchAndReplaceMain(url) {
  const mainTarget = document.querySelector('main.home-main') || document.querySelector('main');
  if (!mainTarget) return false;
  try {
    showLoader();
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    const tmp = document.createElement('html');
    tmp.innerHTML = html;
    const incomingMain = tmp.querySelector('.article-main') || tmp.querySelector('main');
    const incomingTitle = tmp.querySelector('title');
    if (!incomingMain) throw new Error('No <main> found in response');
    mainTarget.innerHTML = incomingMain.innerHTML;
    if (incomingTitle) document.title = incomingTitle.textContent.trim();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  } catch (err) {
    return false;
  } finally {
    hideLoader();
  }
}

// Show article inline inside #inlineArticle (non-popup, keeps rest of page intact)
async function fetchAndShowInlineArticle(url) {
  const slot = document.getElementById('inlineArticle');
  const slotContent = document.getElementById('inlineArticleContent');
  if (!slot || !slotContent) return false;
  try {
    showLoader();
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    const tmp = document.createElement('html');
    tmp.innerHTML = html;

    // Prefer only the main article body, not sidebars
    const articleOnly = tmp.querySelector('.article-main > .article-content')
                      || tmp.querySelector('main .article-content')
                      || tmp.querySelector('article.article-content');

    // Decide rendering mode: static pages full vs article compact
    const isStaticPage = /(?:article|contact|privacy|disclaimer)\.html$/i.test(url);

    // Prepare wrapper with incoming content
    slotContent.innerHTML = '';
    const wrapper = document.createElement('article');
    wrapper.className = 'article-content';

    if (articleOnly) {
      wrapper.innerHTML = articleOnly.innerHTML;
    } else {
      const mainLike = tmp.querySelector('.article-main') || tmp.querySelector('main') || tmp.body || tmp;
      mainLike.querySelectorAll('aside').forEach(a => a.remove());
      wrapper.innerHTML = mainLike.innerHTML;
    }

    if (isStaticPage) {
      // Static pages: render as-is (no truncation, no header/hero removal)
      slotContent.appendChild(wrapper);
      slot.hidden = false;
      slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }

    // Articles: render compact inline preview (shrink header, hide hero)
    // Capture a thumbnail from hero or first image before we prune
    let thumbSrc = '';
    let thumbAlt = '';
    const heroImg = wrapper.querySelector('.article-hero img');
    const anyImg = heroImg || wrapper.querySelector('img');
    // Extract title from existing header/H1 early for alt fallback
    const preTitleNode = wrapper.querySelector('.article-header h1, h1');
    if (anyImg) {
      thumbSrc = anyImg.getAttribute('src') || anyImg.src || '';
      thumbAlt = anyImg.getAttribute('alt') || preTitleNode?.textContent?.trim() || '';
    }

    // Remove big hero in inline preview
    wrapper.querySelectorAll('.article-hero').forEach(el => el.remove());

    // Extract title from existing header/H1
    const titleNode = wrapper.querySelector('.article-header h1, h1');
    const titleText = titleNode ? titleNode.textContent.trim() : '';

    // Remove bulky header block
    const headerBlock = wrapper.querySelector('.article-header');
    if (headerBlock) headerBlock.remove();

    // Demote remaining H1s to H3 inside inline preview
    wrapper.querySelectorAll('h1').forEach(node => {
      const h3 = document.createElement('h3');
      h3.innerHTML = node.innerHTML;
      h3.className = node.className || '';
      node.replaceWith(h3);
    });

    // Insert compact heading at the top if found
    let compactTitle = null;
    if (titleText) {
      compactTitle = document.createElement('h3');
      compactTitle.className = 'inline-article-heading';
      compactTitle.textContent = titleText;
      wrapper.prepend(compactTitle);
    }

    // If we have a thumbnail, insert it under the title
    if (thumbSrc) {
      const thumb = document.createElement('div');
      thumb.className = 'inline-thumb';
      thumb.innerHTML = `<img src="${thumbSrc}" alt="${thumbAlt}">`;
      if (compactTitle) {
        compactTitle.insertAdjacentElement('afterend', thumb);
      } else {
        wrapper.prepend(thumb);
      }
    }

    // Truncate body to first 20 words for inline preview
    const getWords = (str, limit) => {
      const words = (str || '').trim().replace(/\s+/g, ' ').split(' ');
      if (words.length <= limit) return words.join(' ');
      return words.slice(0, limit).join(' ') + '…';
    };
    const firstP = wrapper.querySelector('p');
    const sourceText = firstP ? firstP.textContent : wrapper.textContent;
    const excerpt = getWords(sourceText, 20);

    // Keep only the compact title (if any), then an excerpt paragraph
    Array.from(wrapper.children).forEach((child) => {
      if (!compactTitle || child !== compactTitle) child.remove();
    });
    const previewP = document.createElement('p');
    previewP.textContent = excerpt;
    const insertAfter = wrapper.querySelector('.inline-thumb') || compactTitle;
    if (insertAfter) {
      insertAfter.insertAdjacentElement('afterend', previewP);
    } else {
      wrapper.prepend(previewP);
    }

    // Optional small heading to denote recent inline
    const recentHeading = document.createElement('h2');
    recentHeading.id = 'recent-heading';
    recentHeading.textContent = 'Recent';
    slotContent.appendChild(recentHeading);
    slotContent.appendChild(wrapper);

    // Bottom controls: Continue reading (full article inline) + Close
    const controls = document.createElement('div');
    controls.className = 'inline-continue';
    controls.innerHTML = `
      <p style="margin-top:12px;">
        <a href="#" class="cta" data-inline-full data-url="${url}">Continue reading →</a>
        <button type="button" class="cta" data-inline-close style="margin-left:10px;background:var(--surface);color:var(--accent);border:1px solid var(--accent);">Close</button>
      </p>
    `;
    slotContent.appendChild(controls);

    // Wire close and continue-full
    const doClose = () => {
      slot.hidden = true;
      slotContent.innerHTML = '';
      if (window.history && window.history.pushState) {
        const hash = location.hash || '#top';
        window.history.pushState({}, '', hash);
      }
      document.body.style.overflow = '';
    };
    controls.querySelector('[data-inline-close]')?.addEventListener('click', doClose);
    controls.querySelector('[data-inline-full]')?.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetchAndShowFullInlineArticle(url);
    });

    slot.hidden = false;
    slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  } catch (err) {
    return false;
  } finally {
    hideLoader();
  }
}

// Render the full article inline (no truncation, keep header + hero)
async function fetchAndShowFullInlineArticle(url) {
  const slot = document.getElementById('inlineArticle');
  const slotContent = document.getElementById('inlineArticleContent');
  if (!slot || !slotContent) return false;
  try {
    showLoader();
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    const tmp = document.createElement('html');
    tmp.innerHTML = html;
    const articleOnly = tmp.querySelector('.article-main > .article-content')
                      || tmp.querySelector('main .article-content')
                      || tmp.querySelector('article.article-content');
    slotContent.innerHTML = '';
    const wrapper = document.createElement('article');
    wrapper.className = 'article-content';
    if (articleOnly) {
      wrapper.innerHTML = articleOnly.innerHTML;
    } else {
      const mainLike = tmp.querySelector('.article-main') || tmp.querySelector('main') || tmp.body || tmp;
      mainLike.querySelectorAll('aside').forEach(a => a.remove());
      wrapper.innerHTML = mainLike.innerHTML;
    }
    slotContent.appendChild(wrapper);
    slot.hidden = false;
    slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  } catch (e) {
    return false;
  } finally {
    hideLoader();
  }
}

// Handle back/forward navigation for inline article only
window.addEventListener('popstate', async (e) => {
  if (e.state && e.state.inlineArticle) {
    const ok = await fetchAndShowInlineArticle(location.href);
    if (!ok) window.location.reload();
  }
});