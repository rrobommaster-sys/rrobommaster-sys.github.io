(function () {
  const catalog = window.ROBO_CATALOG;
  if (!catalog) return;

  const grid = document.getElementById('catalog-grid');
  const categoriesRoot = document.getElementById('catalog-categories');
  const search = document.getElementById('catalog-search');
  const summary = document.getElementById('catalog-summary');
  const more = document.getElementById('catalog-more');
  const selected = document.getElementById('selected-product');
  const selectedName = document.getElementById('selected-product-name');
  if (!grid || !categoriesRoot || !search || !summary || !more) return;

  let activeCategory = 'all';
  let visibleCount = 16;
  const categoryMap = new Map(catalog.categories.map(category => [category.id, category]));

  function uniqueProducts(products) {
    const seen = new Set();
    return products.filter(product => {
      if (seen.has(product.slug)) return false;
      seen.add(product.slug);
      return true;
    });
  }

  function filteredProducts() {
    const query = search.value.trim().toLocaleLowerCase('ru');
    const base = activeCategory === 'all'
      ? uniqueProducts(catalog.products)
      : catalog.products.filter(product => product.category === activeCategory);
    if (!query) return base;
    return base.filter(product => `${product.name} ${categoryMap.get(product.category)?.name || ''}`.toLocaleLowerCase('ru').includes(query));
  }

  function placeholder(category) {
    const item = categoryMap.get(category);
    return `<div class="product-placeholder" aria-hidden="true"><span>${item?.icon || 'RM'}</span><strong>${item?.name || 'ROBO MASTER'}</strong></div>`;
  }

  function card(product) {
    const category = categoryMap.get(product.category);
    const media = product.image
      ? `<img src="${product.image}" alt="${product.name.replace(/"/g, '&quot;')}" loading="lazy">`
      : placeholder(product.category);
    return `<article class="product-card">
      <div class="product-image">${media}</div>
      <div class="product-content">
        <span class="product-tag">${category?.name || 'Каталог'}</span>
        <h3>${product.name}</h3>
        <div class="product-price${product.price === 'Цена по запросу' ? ' product-price-request' : ''}">${product.price}</div>
        <button class="button button-primary product-cta" type="button" data-product="${product.name.replace(/"/g, '&quot;')}">Оставить заявку</button>
      </div>
    </article>`;
  }

  function renderCategories() {
    const allCount = uniqueProducts(catalog.products).length;
    const buttons = [
      `<button class="catalog-chip is-active" type="button" data-category="all">Все <span>${allCount}</span></button>`,
      ...catalog.categories.map(category => `<button class="catalog-chip" type="button" data-category="${category.id}">${category.name} <span>${category.count}</span></button>`)
    ];
    categoriesRoot.innerHTML = buttons.join('');
  }

  function render() {
    const products = filteredProducts();
    const current = products.slice(0, visibleCount);
    grid.innerHTML = current.length ? current.map(card).join('') : '<div class="catalog-empty">По вашему запросу ничего не найдено. Попробуйте другое название.</div>';
    const categoryName = activeCategory === 'all' ? 'Все товары' : categoryMap.get(activeCategory)?.name;
    summary.textContent = `${categoryName}: ${products.length}`;
    more.hidden = current.length >= products.length;
    more.textContent = `Показать ещё (${products.length - current.length})`;
  }

  function selectProduct(name) {
    if (selected && selectedName) {
      selectedName.textContent = name;
      selected.hidden = false;
    }
    history.replaceState(null, '', `#order`);
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function applyCatalogHash() {
    if (window.location.hash !== '#fields') return;
    const button = categoriesRoot.querySelector('[data-category="polya"]');
    if (!button) return;
    activeCategory = 'polya';
    visibleCount = 16;
    categoriesRoot.querySelectorAll('.catalog-chip').forEach(chip => chip.classList.toggle('is-active', chip === button));
    render();
    requestAnimationFrame(() => document.getElementById('products')?.scrollIntoView({ block: 'start' }));
  }

  renderCategories();
  render();
  applyCatalogHash();
  window.addEventListener('hashchange', applyCatalogHash);

  categoriesRoot.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    visibleCount = 16;
    categoriesRoot.querySelectorAll('.catalog-chip').forEach(chip => chip.classList.toggle('is-active', chip === button));
    render();
    if (activeCategory === 'polya') {
      history.replaceState(null, '', '#fields');
    }
  });

  search.addEventListener('input', () => {
    visibleCount = 16;
    render();
  });

  more.addEventListener('click', () => {
    visibleCount += 16;
    render();
  });

  grid.addEventListener('click', event => {
    const button = event.target.closest('.product-cta');
    if (button) selectProduct(button.dataset.product);
  });
})();

