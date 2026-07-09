// ============================================================
// ALL SHOOP — renderização de produtos e artigos
// Lê products.json / articles.json (atualizados pelo workflow n8n)
// ============================================================

function euro(v) {
  const n = parseFloat(v || 0);
  return n.toFixed(2).replace('.', ',') + '€';
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function renderProducts() {
  const grid = document.getElementById('product-grid');
  const heroSlot = document.getElementById('hero-stamp-data');
  if (!grid) return;

  try {
    const res = await fetch('products.json?t=' + Date.now());
    if (!res.ok) throw new Error('sem products.json');
    const data = await res.json();
    const produtos = data.produtos || [];

    if (produtos.length === 0) {
      grid.innerHTML = '<div class="empty">Ainda sem achados publicados. Volta em breve — atualizamos várias vezes por dia.</div>';
      return;
    }

    // Preenche o selo do hero com o melhor desconto do momento
    if (heroSlot) {
      const melhor = [...produtos].sort((a, b) => (b.desconto || 0) - (a.desconto || 0))[0];
      if (melhor) {
        document.getElementById('stamp-pct').textContent = (melhor.desconto || 0) + '%';
        document.getElementById('stamp-link').href = melhor.linkAfiliado || '#';
      }
    }

    grid.innerHTML = produtos.map(p => `
      <div class="tag-card">
        <a href="${p.linkAfiliado}" target="_blank" rel="nofollow sponsored noopener" class="thumb-link">
          <div class="thumb">
            <img src="${p.imagem}" alt="${escapeHtml(p.titulo)}" loading="lazy">
            ${p.desconto ? `<span class="badge-off">-${p.desconto}%</span>` : ''}
          </div>
        </a>
        <div class="body">
          <div class="title">${escapeHtml(p.titulo)}</div>
          <div class="price-row">
            <span class="price-now">${euro(p.preco)}</span>
            ${p.precoOriginal ? `<span class="price-was">${euro(p.precoOriginal)}</span>` : ''}
          </div>
          <div class="meta-row">
            ${p.avaliacao ? `<span>★ ${p.avaliacao}</span>` : ''}
            ${p.categoria ? `<span>${escapeHtml(p.categoria)}</span>` : ''}
          </div>
          <a class="cta" href="${p.linkAfiliado}" target="_blank" rel="nofollow sponsored noopener">Ver oferta →</a>
        </div>
      </div>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<div class="empty">Ainda sem achados publicados. Volta em breve.</div>';
  }
}

async function renderBlog(limit) {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  try {
    const res = await fetch((grid.dataset.base || '') + 'articles.json?t=' + Date.now());
    if (!res.ok) throw new Error('sem articles.json');
    const data = await res.json();
    let artigos = data.artigos || [];
    if (limit) artigos = artigos.slice(0, limit);

    if (artigos.length === 0) {
      grid.innerHTML = '<div class="empty">Ainda sem artigos publicados.</div>';
      return;
    }

    grid.innerHTML = artigos.map(a => `
      <a class="blog-card" href="${(grid.dataset.base || '')}blog/${a.slug}.html">
        <span class="kicker">${escapeHtml(a.categoria || 'Guia de compras')}</span>
        <h3>${escapeHtml(a.titulo)}</h3>
        <p>${escapeHtml(a.resumo)}</p>
        <span class="read">Ler artigo</span>
      </a>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<div class="empty">Ainda sem artigos publicados.</div>';
  }
}

// ── Efeito 3D tilt nos cartões de produto (mouse-tracking) ────────
// Inclina o cartão consoante a posição do rato, com a imagem e o
// badge de desconto a "flutuarem" acima do plano (translateZ no CSS).
function ativarTilt3D() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (reduceMotion || isTouch) return; // respeita acessibilidade e não atrapalha em ecrãs táteis

  const MAX_TILT = 10; // graus

  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest && e.target.closest('.tag-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;

    const rotateY = px * MAX_TILT * 2;
    const rotateX = py * -MAX_TILT * 2;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  }, { passive: true });

  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest && e.target.closest('.tag-card');
    if (card) card.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest && e.target.closest('.tag-card');
    const toCard = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.tag-card');
    if (card && card !== toCard) {
      card.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts().then(ativarTilt3D);
  renderBlog(document.body.dataset.blogLimit ? parseInt(document.body.dataset.blogLimit) : null);
});
