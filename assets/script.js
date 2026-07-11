/* ============================================================
   ALL SHOOP — script.js
   Carrega products.json e articles.json e preenche a página.
   ============================================================ */

(function () {
  'use strict';

  const fmtPreco = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return '—';
    return n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  };

  // ---------------------------------------------------------
  // PRODUTOS
  // ---------------------------------------------------------
  function renderProdutos(produtos) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (!produtos || produtos.length === 0) {
      grid.innerHTML = '<div class="empty">Sem achados disponíveis neste momento — volta já já.</div>';
      return;
    }

    grid.innerHTML = produtos.map((p) => {
      const titulo = p.titulo || p.title || 'Produto';
      const imagem = p.imagem || p.image || '';
      const preco = p.preco != null ? p.preco : p.price;
      const precoOriginal = p.precoOriginal != null ? p.precoOriginal : p.originalPrice;
      const desconto = p.desconto != null ? p.desconto : p.discount;
      const avaliacao = p.avaliacao || p.rating || null;
      const link = p.linkAfiliado || p.link || p.shop_url || '#';

      return `
        <div class="tag-card">
          ${desconto ? `<span class="badge-off">-${desconto}%</span>` : ''}
          <a href="${link}" target="_blank" rel="noopener sponsored nofollow" class="thumb">
            <img src="${imagem}" alt="${escapeHtml(titulo)}" loading="lazy">
          </a>
          <div class="body">
            <div class="title">${escapeHtml(titulo)}</div>
            <div class="price-row">
              <span class="price-now">${fmtPreco(preco)}</span>
              ${precoOriginal && precoOriginal > preco ? `<span class="price-was">${fmtPreco(precoOriginal)}</span>` : ''}
            </div>
            <div class="meta-row">
              ${avaliacao ? `<span>★ ${avaliacao}</span>` : ''}
              ${p.categoria ? `<span>${escapeHtml(p.categoria)}</span>` : ''}
            </div>
            <a href="${link}" target="_blank" rel="noopener sponsored nofollow" class="cta">Ver na AliExpress</a>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderStamp(produtos) {
    const pctEl = document.getElementById('stamp-pct');
    const linkEl = document.getElementById('stamp-link');
    if (!pctEl || !produtos || produtos.length === 0) return;

    // Escolhe o produto com maior desconto para o "achado do dia"
    const melhor = [...produtos].sort((a, b) => {
      const da = a.desconto != null ? a.desconto : a.discount || 0;
      const db = b.desconto != null ? b.desconto : b.discount || 0;
      return db - da;
    })[0];

    const desconto = melhor.desconto != null ? melhor.desconto : melhor.discount;
    if (desconto) pctEl.innerHTML = `${desconto}<small>%</small>`;

    if (linkEl) {
      const link = melhor.linkAfiliado || melhor.link || melhor.shop_url;
      if (link) linkEl.href = link;
    }
  }

  // ---------------------------------------------------------
  // BLOG / ARTIGOS
  // ---------------------------------------------------------
  function renderArtigos(artigos) {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    const limite = parseInt(document.body.getAttribute('data-blog-limit'), 10) || artigos.length;
    const lista = artigos.slice(0, limite);

    if (!lista || lista.length === 0) {
      grid.innerHTML = '<div class="empty">Ainda sem artigos publicados.</div>';
      return;
    }

    grid.innerHTML = lista.map((a) => {
      const titulo = a.titulo || a.title || 'Artigo';
      const resumo = a.resumo || a.excerto || a.excerpt || a.descricao || '';
      const categoria = a.categoria || a.kicker || 'All Shoop';
      const link = a.link || a.slug || a.url || 'blog.html';
      const href = link.endsWith('.html') || link.startsWith('http') ? link : `${link}.html`;

      return `
        <a href="${href}" class="blog-card">
          <span class="kicker">${escapeHtml(categoria)}</span>
          <h3>${escapeHtml(titulo)}</h3>
          <p>${escapeHtml(resumo)}</p>
          <span class="read">Ler artigo</span>
        </a>
      `;
    }).join('');
  }

  // ---------------------------------------------------------
  // Utilitário — evita HTML injection nos dados vindos do JSON
  // ---------------------------------------------------------
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------------------------------------------------------
  // Carregamento
  // ---------------------------------------------------------
  fetch('products.json', { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) throw new Error('products.json — HTTP ' + res.status);
      return res.json();
    })
    .then((data) => {
      const produtos = data.produtos || data.products || [];
      renderProdutos(produtos);
      renderStamp(produtos);
    })
    .catch((err) => {
      console.error('❌ Erro a carregar products.json:', err);
      const grid = document.getElementById('product-grid');
      if (grid) grid.innerHTML = '<div class="empty">Não foi possível carregar os achados agora. Tenta recarregar a página.</div>';
    });

  // articles.json é opcional — só corre se existir o grid de blog na página
  if (document.getElementById('blog-grid')) {
    fetch('articles.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('articles.json — HTTP ' + res.status);
        return res.json();
      })
      .then((data) => {
        const artigos = data.artigos || data.articles || (Array.isArray(data) ? data : []);
        renderArtigos(artigos);
      })
      .catch((err) => {
        console.error('❌ Erro a carregar articles.json:', err);
        const grid = document.getElementById('blog-grid');
        if (grid) grid.innerHTML = '<div class="empty">Ainda sem artigos publicados.</div>';
      });
  }
})();
