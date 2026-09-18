/* ============================================
   Morocco.com — Product Search AI Engine (15+ Items)
   ============================================ */

// Groq API Key Pre-filled
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-20b';

// ============================================
// HELPERS
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function getQualityBadgeClass(quality) {
    const q = String(quality || '').toLowerCase();
    if (q.includes('ممتاز') || q.includes('premium')) return 'quality-premium';
    if (q.includes('جيد') || q.includes('good')) return 'quality-good';
    return 'quality-normal';
}

function quickSearch(query) {
    const input = document.getElementById('searchInput');
    if (input) input.value = query;
    searchProducts();
}

// ============================================
// MAIN HYBRID SEARCH ENGINE
// ============================================

async function searchProducts() {
    const queryInput = document.getElementById('searchInput');
    const query = queryInput ? queryInput.value.trim() : '';
    const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || 999999;

    if (!query) {
        showError('اكتب اسم المنتج أو الماركة أولاً');
        return;
    }

    hideAllStates();
    document.getElementById('loadingState').style.display = 'block';

    // 1️⃣ STEP 1: Search in Local Verified DB
    const localResults = searchLocalDatabase(query, minPrice, maxPrice);

    if (localResults.length >= 10) {
        console.log(`✅ [LOCAL DB] Found ${localResults.length} verified item(s)`);
        showResults(query, localResults, 'verified');
        return;
    }

    // 2️⃣ STEP 2: Fallback to AI for 15+ rich results
    console.log('🔍 Querying AI for 15+ products...');
    try {
        const aiResults = await fetchProductsFromAI(query, minPrice, maxPrice);
        showResults(query, aiResults, 'ai');
    } catch (error) {
        console.error('❌ Search error:', error);
        showError(error.message || 'وقع مشكل فـ البحث، حاول مرة أخرى');
    }
}

// ============================================
// LOCAL DB SEARCH
// ============================================

function searchLocalDatabase(query, minPrice, maxPrice) {
    if (typeof LOCAL_PRODUCTS_DB === 'undefined' || !Array.isArray(LOCAL_PRODUCTS_DB)) {
        return [];
    }

    const cleanQuery = query.toLowerCase().trim();
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);

    return LOCAL_PRODUCTS_DB.filter(product => {
        const fullProductText = (
            (product.name || '') + ' ' + 
            (product.brand || '') + ' ' + 
            (product.model || '') + ' ' + 
            (product.keywords ? product.keywords.join(' ') : '')
        ).toLowerCase();

        const matchesAllWords = queryWords.every(word => fullProductText.includes(word));
        const inPriceRange = (product.retail_min <= maxPrice) && (product.retail_max >= minPrice);

        return matchesAllWords && inPriceRange;
    });
}

// ============================================
// GROQ AI FETCH (FORCED 15-18 PRODUCTS)
// ============================================

async function fetchProductsFromAI(query, minPrice, maxPrice) {
    const cleanKey = String(GROQ_API_KEY || '').trim().replace(/[^\x00-\x7F]/g, "");

    if (!cleanKey) {
        throw new Error('API Key غير صالح');
    }

    const priceFilter = (minPrice > 0 || maxPrice < 999999)
        ? `Prices between ${minPrice} and ${maxPrice} MAD.`
        : '';

    const prompt = `Search: "${query}". ${priceFilter}
TASK: Generate 15 to 18 distinct Moroccan market product items, variants, and models for "${query}".
Include diverse brands (major brand models + generic popular alternatives in Morocco).

STRICT JSON OUTPUT FORMAT ONLY (NO MARKDOWN):
{
  "products": [
    {
      "name": "اسم المنتج بالعربية",
      "brand": "Brand",
      "model": "Model",
      "wholesale_min": 100,
      "wholesale_max": 150,
      "retail_min": 250,
      "retail_max": 400,
      "quality": "ممتاز",
      "notes": "ملاحظة موجزة"
    }
  ]
}`;

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${cleanKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a JSON API for Moroccan e-commerce. You MUST return at least 15 products in valid JSON format. Keep notes short.' 
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2800,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        if (response.status === 429) throw new Error('السيرفر عامر بالطلبات، سني 20 ثانية وعاود جرب');
        if (response.status === 401) throw new Error('API Key غير صالح');
        throw new Error(`خطأ فـ السيرفر: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch (e) {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error('الذكاء الاصطناعي ما رجعش بيانات منظمة، حاول مجدداً');
    }

    const products = parsed.products || parsed.data || [];
    if (!Array.isArray(products) || products.length === 0) {
        throw new Error('ما لقينا حتى منتج بهاد الاسم فـ المغرب');
    }

    return products;
}

// ============================================
// RENDER RESULTS
// ============================================

function showResults(query, products, source = 'verified') {
    hideAllStates();

    const resultsSection = document.getElementById('resultsState');
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');

    if (!resultsSection || !resultsGrid) return;

    if (resultsTitle) {
        resultsTitle.textContent = `نتائج البحث على: "${query}"`;
    }

    if (resultsCount) {
        if (source === 'verified') {
            resultsCount.innerHTML = `<span class="source-badge verified">🟢 مرجع سوق مغربي محقق (${products.length} منتج)</span>`;
        } else {
            resultsCount.innerHTML = `<span class="source-badge ai">🟠 تقديري بالذكاء الاصطناعي (${products.length} منتج)</span>`;
        }
    }

    const disclaimerHTML = source === 'ai' ? `
        <div class="disclaimer-banner ai-notice">
            ⚠️ <strong>تنبيه:</strong> هاد النتائج مولدة بالذكاء الاصطناعي كـ تقدير أولي حيت المنتج ما كاينش فـ قاعدة البيانات المحلية. تأكد دائماً من المورد.
        </div>
    ` : `
        <div class="disclaimer-banner verified-notice">
            ✅ <strong>مرجع معتمد:</strong> أسعار واقعية مبنية على حركة التداول فـ السوق المغربي لـ COD.
        </div>
    `;

    const cardsHTML = products.map((p, i) => {
        const wholesaleAvg = (Number(p.wholesale_min) + Number(p.wholesale_max)) / 2;
        const retailAvg = (Number(p.retail_min) + Number(p.retail_max)) / 2;
        const profit = Math.round(retailAvg - wholesaleAvg);
        const margin = retailAvg > 0 ? Math.round((profit / retailAvg) * 100) : 0;

        return `
            <div class="product-card" style="animation-delay: ${i * 0.03}s">
                <div class="product-card-header">
                    <div class="product-brand">${escapeHtml(p.brand)}</div>
                    <div class="product-quality ${getQualityBadgeClass(p.quality)}">${escapeHtml(p.quality)}</div>
                </div>

                <h3 class="product-name">${escapeHtml(p.name)}</h3>
                ${p.model ? `<p class="product-model">${escapeHtml(p.model)}</p>` : ''}

                <div class="product-prices">
                    <div class="price-item">
                        <div class="price-label">💵 جملة</div>
                        <div class="price-value">${p.wholesale_min}-${p.wholesale_max} <span>DH</span></div>
                    </div>
                    <div class="price-item price-item-gold">
                        <div class="price-label">🏪 بيع فـ المغرب</div>
                        <div class="price-value price-value-gold">${p.retail_min}-${p.retail_max} <span>DH</span></div>
                    </div>
                </div>

                <div class="product-metrics">
                    <div class="product-metric">
                        <span class="metric-lbl">الربح المتوقع</span>
                        <span class="metric-val metric-profit">+${profit} DH</span>
                    </div>
                    <div class="product-metric">
                        <span class="metric-lbl">الهامش</span>
                        <span class="metric-val">${margin}%</span>
                    </div>
                </div>

                ${p.notes ? `<div class="product-note">💡 ${escapeHtml(p.notes)}</div>` : ''}

                <a href="cod-calculator.html" class="product-cta">
                    🧮 احسب أرباح المخزون
                </a>
            </div>
        `;
    }).join('');

    resultsGrid.innerHTML = disclaimerHTML + `<div class="products-grid-inner">${cardsHTML}</div>`;
    resultsSection.style.display = 'block';

    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

function hideAllStates() {
    ['initialState', 'loadingState', 'errorState', 'resultsState'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showError(message) {
    hideAllStates();
    const errorEl = document.getElementById('errorState');
    const errorMsg = document.getElementById('errorMessage');
    if (errorEl) errorEl.style.display = 'block';
    if (errorMsg) errorMsg.textContent = message;
}

function newSearch() {
    const input = document.getElementById('searchInput');
    const minInput = document.getElementById('minPrice');
    const maxInput = document.getElementById('maxPrice');
    if (input) input.value = '';
    if (minInput) minInput.value = '';
    if (maxInput) maxInput.value = '';

    hideAllStates();
    document.getElementById('initialState').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
});