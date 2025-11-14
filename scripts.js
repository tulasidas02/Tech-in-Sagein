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
  const placeholder = (topic) => `https://source.unsplash.com/800x500?${encodeURIComponent(topic || "technology")}`;
  document.querySelectorAll('.article-hero img, .card-media img').forEach((img) => {
    img.addEventListener('error', () => {
      img.src = placeholder(img.alt || 'technology');
    }, { once: true });
  });
});

window.addEventListener("pageshow", () => {
  hideLoader();
});

// Inline Reader: open article inside overlay on homepage
(function(){
  const overlay = document.getElementById('inlineReader');
  const content = document.getElementById('inlineReaderContent');
  const closeBtn = document.getElementById('inlineReaderClose');
  if (!overlay || !content) return;

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

  // Allow Contact/Disclaimer/Privacy to navigate normally (no interception)

  closeBtn?.addEventListener('click', () => {
    overlay.hidden = true;
    content.innerHTML = '';
    document.body.style.overflow = '';
  });
})();

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

    if (articleOnly) {
      slotContent.innerHTML = articleOnly.innerHTML;
    } else {
      // Fallback: still try main but remove any aside elements
      const mainLike = tmp.querySelector('.article-main') || tmp.querySelector('main') || tmp.body || tmp;
      mainLike.querySelectorAll('aside').forEach(a => a.remove());
      slotContent.innerHTML = mainLike.innerHTML;
    }

    // Append 'Continue browsing' links
    const continueBlock = document.createElement('div');
    continueBlock.className = 'inline-continue';
    continueBlock.innerHTML = `
      <hr>
      <h3>Continue browsing</h3>
      <ul class="continue-links">
        <li><a href="#trending-heading">Trending Now</a></li>
        <li><a href="#latest-heading">Latest</a> <a class="section-link" href="#latest-heading">View all</a></li>
        <li><a href="#popular-heading">⭐ Popular Posts</a> <a class="section-link" href="#popular-heading">View all</a></li>
        <li><a href="#tech-heading">Tech</a> <a class="section-link" href="#tech">More Tech</a></li>
        <li><a href="#howto-heading">How‑To</a> <a class="section-link" href="#how-to">More Guides</a></li>
        <li><a href="#ai-heading">AI Insights</a> <a class="section-link" href="#ai">More AI</a></li>
        <li><a href="#reviews-heading">Reviews</a> <a class="section-link" href="#reviews">More Reviews</a></li>
        <li><a href="#gadgets-heading">Gadgets &amp; Gear</a> <a class="section-link" href="#gadgets">More Gadgets</a></li>
      </ul>
    `;
    slotContent.appendChild(continueBlock);

    slot.hidden = false;
    // Scroll the inline section into view
    slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  } catch (err) {
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