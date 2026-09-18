/* ============================================
   Morocco.com — Return Rate Impact Calculator
   ============================================ */

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

function calculateReturns() {
    // Inputs
    const totalOrders = parseInt(document.getElementById('totalOrders')?.value) || 0;
    const sellingPrice = parseFloat(document.getElementById('sellingPrice')?.value) || 0;
    const purchasePrice = parseFloat(document.getElementById('purchasePrice')?.value) || 0;
    const shippingOut = parseFloat(document.getElementById('shippingOut')?.value) || 0;
    const shippingReturnFee = parseFloat(document.getElementById('shippingReturnFee')?.value) || 0;
    const adCostPerOrder = parseFloat(document.getElementById('adCostPerOrder')?.value) || 0;
    const packagingCost = parseFloat(document.getElementById('packagingCost')?.value) || 0;
    const returnRate = parseFloat(document.getElementById('returnRate')?.value) || 0;

    // Validation
    if (totalOrders <= 0 || sellingPrice <= 0) {
        showWaiting();
        return;
    }

    const returnRateDecimal = returnRate / 100;
    const deliveredCount = Math.round(totalOrders * (1 - returnRateDecimal));
    const returnedCount = totalOrders - deliveredCount;

    // Unit Economics
    // Successful Delivered Order Profit = SellingPrice - (Purchase + ShippingOut + Packaging + AdCost)
    const profitPerDelivered = sellingPrice - (purchasePrice + shippingOut + packagingCost + adCostPerOrder);

    // Returned Order Financial Loss = ShippingOut + ShippingReturnFee + AdCost + Packaging (Product itself is returned to stock)
    const lossPerReturned = shippingOut + shippingReturnFee + adCostPerOrder + packagingCost;

    // Total Financials
    const totalRevenue = deliveredCount * sellingPrice;
    const totalDeliveredCost = deliveredCount * (purchasePrice + shippingOut + packagingCost + adCostPerOrder);
    const totalReturnLoss = returnedCount * lossPerReturned;

    const netProfit = totalRevenue - (totalDeliveredCost + totalReturnLoss);
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Critical Metric 1: Break-even Return Rate (%)
    // Equation: Delivered Profit == Returned Loss => (1-r)*ProfitDelivered = r*LossReturned
    // r = ProfitDelivered / (ProfitDelivered + LossReturned)
    let breakEvenReturnRate = 0;
    if (sellingPrice > 0 && (profitPerDelivered + lossPerReturned) > 0) {
        const breakEvenRatio = profitPerDelivered / (profitPerDelivered + lossPerReturned);
        breakEvenReturnRate = Math.max(0, Math.min(100, breakEvenRatio * 100));
    }

    // Critical Metric 2: Compensation Ratio
    // How many delivered orders cover 1 returned order
    let compensationRatioText = '—';
    if (profitPerDelivered > 0) {
        const ratio = (lossPerReturned / profitPerDelivered).toFixed(1);
        compensationRatioText = `${ratio} طلبات موصلة لتعويض طرد مرجوع 1`;
    } else {
        compensationRatioText = 'الطلب خاسر أصلاً حتى بدون مرتجعات!';
    }

    showResults();

    // Render Main Net Profit Card
    const mainProfitEl = document.getElementById('netProfitVal');
    const profitStatus = document.getElementById('profitStatus');
    const mainCard = document.getElementById('mainProfitCard');

    if (mainProfitEl) mainProfitEl.textContent = formatDH(netProfit);

    if (netProfit > 0) {
        if (mainCard) mainCard.classList.remove('negative');
        if (profitStatus) {
            profitStatus.textContent = `✅ صافي أرباحك: ${formatDH(netProfit)}`;
            profitStatus.className = 'result-status positive';
        }
    } else if (netProfit === 0) {
        if (mainCard) mainCard.classList.remove('negative');
        if (profitStatus) {
            profitStatus.textContent = '⚠️ نقطة التعادل بالضبط (0 DH ربح)';
            profitStatus.className = 'result-status warning';
        }
    } else {
        if (mainCard) mainCard.classList.add('negative');
        if (profitStatus) {
            profitStatus.textContent = `❌ خسارة صافية قدرها: ${formatDH(Math.abs(netProfit))}`;
            profitStatus.className = 'result-status negative';
        }
    }

    // Render Metrics
    document.getElementById('breakEvenReturnRate').textContent = `${breakEvenReturnRate.toFixed(1)}%`;
    document.getElementById('totalReturnLoss').textContent = formatDH(totalReturnLoss);
    document.getElementById('lossPerReturnedUnit').textContent = formatDH(lossPerReturned);
    document.getElementById('profitPerDeliveredUnit').textContent = formatDH(profitPerDelivered);

    document.getElementById('compensationRatio').textContent = compensationRatioText;

    document.getElementById('deliveredCount').textContent = `${deliveredCount} طلب (${(100 - returnRate).toFixed(0)}%)`;
    document.getElementById('returnedCount').textContent = `${returnedCount} طلب (${returnRate.toFixed(0)}%)`;
    document.getElementById('totalRevenueVal').textContent = formatDH(totalRevenue);
    document.getElementById('profitMarginVal').textContent = `${margin.toFixed(1)}%`;

    // Render Cost Bars
    renderReturnCostBars(
        deliveredCount * purchasePrice,
        totalOrders * shippingOut,
        returnedCount * shippingReturnFee,
        totalOrders * adCostPerOrder,
        totalOrders * packagingCost
    );

    // Render Tips
    renderReturnTips(returnRate, breakEvenReturnRate, netProfit, profitPerDelivered, lossPerReturned);
}

function renderReturnCostBars(purchaseTotal, shippingOutTotal, returnFeeTotal, adsTotal, packagingTotal) {
    const container = document.getElementById('costBars');
    if (!container) return;

    const items = [
        { label: 'شراء السلعة الموصلة', value: purchaseTotal, color: '#A78BFA' },
        { label: 'الشحن الذهاب (لكل الطلبات)', value: shippingOutTotal, color: '#8B5CF6' },
        { label: 'إعلانات (لكل الطلبات)', value: adsTotal, color: '#E8B84E' },
        { label: 'رسوم إرجاع الطرود المرجوعة', value: returnFeeTotal, color: '#EF4444' },
        { label: 'التغليف (لكل الطلبات)', value: packagingTotal, color: '#6D28D9' }
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

function renderReturnTips(currentReturnRate, breakEvenRate, netProfit, profitPerDelivered, lossPerReturned) {
    const container = document.getElementById('tipsContainer');
    if (!container) return;

    const tips = [];

    // Critical Break-even warning
    if (currentReturnRate >= breakEvenRate) {
        tips.push({
            type: 'danger',
            icon: '🚨',
            text: `نسبة المرتجعات الحالية (${currentReturnRate}%) تجاوزت أقصى نسبة مسموح بها (${breakEvenRate.toFixed(1)}%). أنت فـ الخسارة الآن!`
        });
    } else if (currentReturnRate >= (breakEvenRate - 5)) {
        tips.push({
            type: 'warning',
            icon: '⚠️',
            text: `أنت قريب جداً من نقطة الخطر! أقصى نسبة مرتجعات تتحملها تجارتك هي ${breakEvenRate.toFixed(1)}%.`
        });
    } else {
        tips.push({
            type: 'success',
            icon: '🛡️',
            text: `ممتاز! نسبة المرتجعات فـ المنطقة الآمنة. أقصى نسبة مسموح بها قبل الخسارة هي ${breakEvenRate.toFixed(1)}%.`
        });
    }

    // Advice on confirmation & shipping
    if (lossPerReturned > (profitPerDelivered * 1.5)) {
        tips.push({
            type: 'warning',
            icon: '📞',
            text: `خسارة الطرد المرجوع الواحد كبيرة جداً. ركز فـ التأكيد الهاتفي (Confirmations) الجيد قبل شحن أية طلبية.`
        });
    }

    tips.push({
        type: 'info',
        icon: '💡',
        text: `تأكد من الاتفاق مع شركة الشحن على توصيل سريع (أقل من 48 ساعة) وتقليل رسوم الإرجاع لتخفيض الخسائر.`
    });

    container.innerHTML = tips.map(tip => `
        <div class="tip tip-${tip.type}">
            <span class="tip-icon">${tip.icon}</span>
            <span class="tip-text">${tip.text}</span>
        </div>
    `).join('');
}

function resetCalculator() {
    const inputs = document.querySelectorAll('.calc-form input[type="number"]');
    inputs.forEach(input => input.value = '');
    const slider = document.getElementById('returnSlider');
    if (slider) slider.value = 25;
    showWaiting();
}