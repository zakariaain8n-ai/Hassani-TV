/* ============================================
   Morocco.com — COD Profit Calculator
   ============================================ */

// Return rate slider sync
function syncReturnRate() {
    const input = document.getElementById('returnRate');
    const slider = document.getElementById('returnSlider');
    if (slider && input) {
        let val = parseFloat(input.value) || 0;
        if (val > 100) val = 100;
        if (val < 0) val = 0;
        slider.value = val;
        input.value = val;
    }
}

function syncReturnInput() {
    const input = document.getElementById('returnRate');
    const slider = document.getElementById('returnSlider');
    if (slider && input) {
        input.value = slider.value;
    }
}

// Format number to DH
function formatDH(value) {
    if (value === 0) return '0 DH';
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    if (abs >= 1000) {
        return sign + abs.toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' DH';
    }
    return sign + abs.toFixed(2) + ' DH';
}

// Show/hide results
function showResults() {
    const waiting = document.getElementById('resultsWaiting');
    const content = document.getElementById('resultsContent');
    if (waiting) waiting.style.display = 'none';
    if (content) content.style.display = 'block';
}

function showWaiting() {
    const waiting = document.getElementById('resultsWaiting');
    const content = document.getElementById('resultsContent');
    if (waiting) waiting.style.display = 'block';
    if (content) content.style.display = 'none';
}

// Main calculator function
function calculate() {
    // Get inputs
    const stock = parseInt(document.getElementById('stockQuantity')?.value) || 0;
    const sellingPrice = parseFloat(document.getElementById('sellingPrice')?.value) || 0;
    const purchasePrice = parseFloat(document.getElementById('purchasePrice')?.value) || 0;
    const shippingCost = parseFloat(document.getElementById('shippingCost')?.value) || 0;
    const packagingCost = parseFloat(document.getElementById('packagingCost')?.value) || 0;
    const adsTotalCost = parseFloat(document.getElementById('adsCost')?.value) || 0;
    const returnRate = parseFloat(document.getElementById('returnRate')?.value) || 0;

    // Validation
    if (stock <= 0 || sellingPrice <= 0) {
        showWaiting();
        return;
    }

    // Calculations
    const returnRateDecimal = returnRate / 100;
    const deliveredUnits = Math.round(stock * (1 - returnRateDecimal));
    const returnedUnits = stock - deliveredUnits;

    // Total costs
    const totalPurchase = stock * purchasePrice;
    const totalShipping = stock * shippingCost;
    const totalPackaging = deliveredUnits * packagingCost;
    const totalAds = adsTotalCost;
    const totalCosts = totalPurchase + totalShipping + totalPackaging + totalAds;

    // Revenue (only from delivered)
    const totalRevenue = deliveredUnits * sellingPrice;

    // Net profit
    const netProfit = totalRevenue - totalCosts;

    // Per unit
    const profitPerUnit = stock > 0 ? netProfit / stock : 0;
    const adsPerUnit = stock > 0 ? adsTotalCost / stock : 0;
    const costPerUnit = purchasePrice + shippingCost + packagingCost + adsPerUnit;

    // Margin
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Return loss
    const returnLoss = returnedUnits * (shippingCost + adsPerUnit);

    // Show results
    showResults();

    // Update main profit
    const mainProfitEl = document.getElementById('mainProfit');
    const mainProfitLabel = document.getElementById('mainProfitLabel');
    const profitStatus = document.getElementById('profitStatus');
    const mainCard = document.getElementById('mainProfitCard');

    if (mainProfitEl) mainProfitEl.textContent = formatDH(netProfit);
    if (mainProfitLabel) mainProfitLabel.textContent = `💰 الربح الصافي من بيع ${stock} وحدة`;

    // Status color
    if (netProfit > 0) {
        if (mainCard) mainCard.classList.remove('negative');
        if (profitStatus) {
            profitStatus.textContent = `✅ ستربح ${formatDH(netProfit)}`;
            profitStatus.className = 'result-status positive';
        }
    } else if (netProfit === 0) {
        if (mainCard) mainCard.classList.remove('negative');
        if (profitStatus) {
            profitStatus.textContent = '⚠️ نقطة التعادل';
            profitStatus.className = 'result-status warning';
        }
    } else {
        if (mainCard) mainCard.classList.add('negative');
        if (profitStatus) {
            profitStatus.textContent = `❌ ستخسر ${formatDH(Math.abs(netProfit))}`;
            profitStatus.className = 'result-status negative';
        }
    }

    // Metrics
    document.getElementById('totalRevenue').textContent = formatDH(totalRevenue);
    document.getElementById('marginPercent').textContent = margin.toFixed(1) + '%';
    document.getElementById('totalCosts').textContent = formatDH(totalCosts);
    document.getElementById('profitPerUnit').textContent = formatDH(profitPerUnit);

    // Returns
    document.getElementById('deliveredUnits').textContent = deliveredUnits + ' وحدة';
    document.getElementById('returnedUnits').textContent = returnedUnits + ' وحدة';
    document.getElementById('returnLoss').textContent = formatDH(returnLoss);

    // Cost breakdown
    document.getElementById('costPurchase').textContent = formatDH(totalPurchase);
    document.getElementById('costShipping').textContent = formatDH(totalShipping);
    document.getElementById('costPackaging').textContent = formatDH(totalPackaging);
    document.getElementById('costAds').textContent = formatDH(totalAds);

    // Per unit analysis
    document.getElementById('unitSelling').textContent = formatDH(sellingPrice);
    document.getElementById('unitCost').textContent = formatDH(costPerUnit);
    document.getElementById('unitProfit').textContent = formatDH(profitPerUnit);

    // Cost breakdown bars
    renderCostBars(totalPurchase, totalShipping, totalPackaging, totalAds, returnLoss);

    // Tips
    renderTips(netProfit, margin, returnRate, adsTotalCost, sellingPrice, stock, deliveredUnits, returnedUnits);
}

// Render cost breakdown bars
function renderCostBars(purchase, shipping, packaging, ads, returnLoss) {
    const container = document.getElementById('costBars');
    if (!container) return;

    const items = [
        { label: 'الشراء', value: purchase, color: '#A78BFA' },
        { label: 'التوصيل', value: shipping, color: '#8B5CF6' },
        { label: 'التغليف', value: packaging, color: '#7C3AED' },
        { label: 'الإعلانات', value: ads, color: '#E8B84E' },
        { label: 'خسارة المرتجعات', value: returnLoss, color: '#EF4444' }
    ].filter(item => item.value > 0);

    const max = Math.max(...items.map(i => i.value), 1);

    container.innerHTML = items.map(item => `
        <div class="cost-bar">
            <div class="cost-bar-label">${item.label}</div>
            <div class="cost-bar-track">
                <div class="cost-bar-fill" style="width: ${(item.value / max) * 100}%; background: ${item.color}; box-shadow: 0 0 15px ${item.color}80;">
                    ${item.value >= max * 0.2 ? formatDH(item.value) : ''}
                </div>
            </div>
            <div class="cost-bar-value">${formatDH(item.value)}</div>
        </div>
    `).join('');
}

// Render smart tips
function renderTips(netProfit, margin, returnRate, adsTotal, sellingPrice, stock, delivered, returned) {
    const container = document.getElementById('tipsContainer');
    if (!container) return;

    const tips = [];

    // Profit tips
    if (netProfit > 20000) {
        tips.push({
            type: 'success',
            icon: '🎉',
            text: `ممتاز! غادي تربح ${formatDH(netProfit)} من بيع ${stock} وحدة.`
        });
    } else if (netProfit > 0) {
        tips.push({
            type: 'success',
            icon: '✅',
            text: `مربح — ${formatDH(netProfit)} ربح إجمالي من ${delivered} وحدة موصلة.`
        });
    } else if (netProfit <= 0) {
        tips.push({
            type: 'danger',
            icon: '🚨',
            text: `خاسر ${formatDH(Math.abs(netProfit))}! خاصك تراجع الأسعار والتكاليف.`
        });
    }

    // Margin tips
    if (margin >= 40) {
        tips.push({
            type: 'success',
            icon: '💎',
            text: `هامش الربح ممتاز (${margin.toFixed(1)}%)! المنتج مربح جداً.`
        });
    } else if (margin >= 25 && margin < 40) {
        tips.push({
            type: 'info',
            icon: '👍',
            text: `هامش الربح جيد (${margin.toFixed(1)}%). استمر!`
        });
    } else if (margin > 0 && margin < 15) {
        tips.push({
            type: 'warning',
            icon: '⚠️',
            text: `هامش الربح ضعيف (${margin.toFixed(1)}%). حاول ترفع السعر أو تنقص التكاليف.`
        });
    }

    // Return tips
    if (returnRate > 30) {
        tips.push({
            type: 'danger',
            icon: '📦',
            text: `${returned} وحدة رجعت! نسبة المرتجعات عالية جداً (${returnRate}%). حسن التأكيد الهاتفي.`
        });
    } else if (returnRate > 20) {
        tips.push({
            type: 'warning',
            icon: '📦',
            text: `${returned} وحدة مرجوعة (${returnRate}%). حاول تنقص المرتجعات.`
        });
    } else if (returnRate > 0 && returnRate <= 15) {
        tips.push({
            type: 'success',
            icon: '📦',
            text: `نسبة المرتجعات جيدة (${returnRate}%). استمر!`
        });
    }

    // Ads tips
    if (adsTotal > 0 && stock > 0) {
        const adsPerUnit = adsTotal / stock;
        const adsRatio = (adsPerUnit / sellingPrice) * 100;
        if (adsRatio > 25) {
            tips.push({
                type: 'warning',
                icon: '📢',
                text: `تكلفة الإعلان لكل وحدة (${adsRatio.toFixed(0)}% من السعر) مرتفعة.`
            });
        } else if (adsRatio > 0 && adsRatio < 15) {
            tips.push({
                type: 'info',
                icon: '📢',
                text: `تكلفة الإعلان معقولة (${adsRatio.toFixed(1)}% من السعر).`
            });
        }
    }

    if (tips.length === 0) {
        tips.push({
            type: 'info',
            icon: '📝',
            text: 'أدخل البيانات باش تحصل على نصائح مخصصة.'
        });
    }

    container.innerHTML = tips.map(tip => `
        <div class="tip tip-${tip.type}">
            <span class="tip-icon">${tip.icon}</span>
            <span class="tip-text">${tip.text}</span>
        </div>
    `).join('');
}

// Reset calculator
function resetCalculator() {
    const inputs = document.querySelectorAll('.calc-form input[type="number"]');
    inputs.forEach(input => input.value = '');
    const slider = document.getElementById('returnSlider');
    if (slider) slider.value = 0;
    showWaiting();
}

// Init
document.addEventListener('DOMContentLoaded', function() {
    // Any initialization if needed
});