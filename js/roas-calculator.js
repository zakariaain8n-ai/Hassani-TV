/* ============================================
   Morocco.com — ROAS & Campaign Calculator
   ============================================ */

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

function calculateROAS() {
    // Inputs
    const adBudget = parseFloat(document.getElementById('adBudget')?.value) || 0;
    const totalPurchases = parseInt(document.getElementById('totalPurchases')?.value) || 0;
    const sellingPrice = parseFloat(document.getElementById('sellingPrice')?.value) || 0;
    const cogs = parseFloat(document.getElementById('cogs')?.value) || 0;
    const shippingCost = parseFloat(document.getElementById('shippingCost')?.value) || 0;
    const confirmRate = parseFloat(document.getElementById('confirmRate')?.value) || 80;
    const deliveryRate = parseFloat(document.getElementById('deliveryRate')?.value) || 70;

    // Validation
    if (adBudget <= 0 || totalPurchases <= 0 || sellingPrice <= 0) {
        showWaiting();
        return;
    }

    // Calculations
    const confirmRateDecimal = confirmRate / 100;
    const deliveryRateDecimal = deliveryRate / 100;

    // Funnel counts
    const confirmedCount = Math.round(totalPurchases * confirmRateDecimal);
    const deliveredCount = Math.round(confirmedCount * deliveryRateDecimal);

    // Current CPA on Platform
    const currentCPA = adBudget / totalPurchases;

    // Platform ROAS (What Facebook shows: (Purchases * Price) / AdBudget)
    const platformRevenue = totalPurchases * sellingPrice;
    const platformROAS = adBudget > 0 ? platformRevenue / adBudget : 0;

    // Real COD Financials
    const realDeliveredRevenue = deliveredCount * sellingPrice;
    const totalCogsCost = deliveredCount * cogs; // COGS for delivered items
    const totalShippingCost = confirmedCount * shippingCost; // Shipping paid on confirmed orders
    
    const totalCampaignCost = adBudget + totalCogsCost + totalShippingCost;
    const netProfit = realDeliveredRevenue - totalCampaignCost;

    // Real COD ROAS = Real Delivered Revenue / Ad Budget
    const realCodROAS = adBudget > 0 ? realDeliveredRevenue / adBudget : 0;

    // Break-even CPA Calculation
    // Total Delivered Ratio = confirmRate * deliveryRate
    const overallDeliveredRatio = confirmRateDecimal * deliveryRateDecimal;

    // Margin available per generated conversion before ad spend
    // Revenue Per Conversion Generated = sellingPrice * overallDeliveredRatio
    // Costs Per Conversion Generated = (cogs * overallDeliveredRatio) + (shippingCost * confirmRateDecimal)
    // Break-even CPA = RevenuePerConv - CostsPerConv
    const revenuePerConv = sellingPrice * overallDeliveredRatio;
    const costsPerConv = (cogs * overallDeliveredRatio) + (shippingCost * confirmRateDecimal);
    const breakEvenCPA = Math.max(0, revenuePerConv - costsPerConv);

    // Break-even ROAS = sellingPrice / BreakEvenCPA
    const breakEvenROAS = breakEvenCPA > 0 ? sellingPrice / breakEvenCPA : 0;

    showResults();

    // Render Main ROAS Card
    const realRoasEl = document.getElementById('realRoasVal');
    const roasStatus = document.getElementById('roasStatus');
    const mainCard = document.getElementById('mainProfitCard');

    if (realRoasEl) realRoasEl.textContent = `${realCodROAS.toFixed(2)}x`;

    if (realCodROAS > breakEvenROAS && netProfit > 0) {
        if (mainCard) mainCard.classList.remove('negative');
        if (roasStatus) {
            roasStatus.textContent = `✅ الحملة مربحة! ROAS يتجاوز نقطة التعادل (${breakEvenROAS.toFixed(2)}x)`;
            roasStatus.className = 'result-status positive';
        }
    } else if (Math.abs(realCodROAS - breakEvenROAS) < 0.05) {
        if (mainCard) mainCard.classList.remove('negative');
        if (roasStatus) {
            roasStatus.textContent = `⚠️ نقطة التعادل بالضبط — لا ربح ولا خسارة`;
            roasStatus.className = 'result-status warning';
        }
    } else {
        if (mainCard) mainCard.classList.add('negative');
        if (roasStatus) {
            roasStatus.textContent = `❌ الحملة خاسرة! الـ ROAS المطلوب للتعادل هو (${breakEvenROAS.toFixed(2)}x)`;
            roasStatus.className = 'result-status negative';
        }
    }

    // Render Metrics
    document.getElementById('breakEvenRoasVal').textContent = `${breakEvenROAS.toFixed(2)}x`;
    document.getElementById('netProfitVal').textContent = formatDH(netProfit);
    document.getElementById('currentCpaVal').textContent = formatDH(currentCPA);
    document.getElementById('maxCpaVal').textContent = formatDH(breakEvenCPA);

    document.getElementById('platformRoasVal').textContent = `${platformROAS.toFixed(2)}x (وهمي)`;
    document.getElementById('realRoasUnitVal').textContent = `${realCodROAS.toFixed(2)}x (حقيقي)`;

    document.getElementById('conversionsCount').textContent = `${totalPurchases} طلب`;
    document.getElementById('confirmedCount').textContent = `${confirmedCount} طلب (${confirmRate}%)`;
    document.getElementById('deliveredCount').textContent = `${deliveredCount} طلب (${deliveryRate}%)`;
    document.getElementById('deliveredRevenueVal').textContent = formatDH(realDeliveredRevenue);

    // Render Cost Bars
    renderRoasCostBars(adBudget, totalCogsCost, totalShippingCost, netProfit);

    // Render Tips
    renderRoasTips(currentCPA, breakEvenCPA, realCodROAS, breakEvenROAS, confirmRate, deliveryRate, netProfit);
}

function renderRoasCostBars(adBudget, totalCogs, totalShipping, netProfit) {
    const container = document.getElementById('costBars');
    if (!container) return;

    const items = [
        { label: 'ميزانية الإعلانات (Ad Spend)', value: adBudget, color: '#E8B84E' },
        { label: 'شراء السلعة الموصلة (COGS)', value: totalCogs, color: '#A78BFA' },
        { label: 'تكاليف الشحن والتغليف', value: totalShipping, color: '#8B5CF6' }
    ];

    if (netProfit > 0) {
        items.push({ label: 'الربح الصافي المتبقي', value: netProfit, color: '#10B981' });
    }

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

function renderRoasTips(currentCPA, breakEvenCPA, realROAS, breakEvenROAS, confirmRate, deliveryRate, netProfit) {
    const container = document.getElementById('tipsContainer');
    if (!container) return;

    const tips = [];

    // CPA tip
    if (currentCPA > breakEvenCPA) {
        tips.push({
            type: 'danger',
            icon: '🚨',
            text: `الـ CPA الحالي (${formatDH(currentCPA)}) مرتفع جداً مقارنة مع أقصى حد مسموح (${formatDH(breakEvenCPA)}). خاصك تحسن الإعلان أو ترفع ثمن البيع.`
        });
    } else {
        tips.push({
            type: 'success',
            icon: '🎯',
            text: `ممتاز! الـ CPA الحالي (${formatDH(currentCPA)}) فـ المنطقة المربحة مقارنة بالحد الأقصى المسموح (${formatDH(breakEvenCPA)}).`
        });
    }

    // Confirmation / Delivery funnel tip
    if (confirmRate < 75) {
        tips.push({
            type: 'warning',
            icon: '📞',
            text: `نسبة التأكيد (${confirmRate}%) ضعيفة. تحسين سكريبت الاتصال سيزيد أرباحك فوراً بدون زيادة ميزانية الإعلان.`
        });
    }

    if (deliveryRate < 65) {
        tips.push({
            type: 'warning',
            icon: '🚚',
            text: `نسبة التوصيل (${deliveryRate}%) منخفضة. تأكد من سرعة التوصيل مع الشركة لتفادي ضياع أرباح الحملة.`
        });
    }

    if (realROAS >= (breakEvenROAS * 1.3) && netProfit > 0) {
        tips.push({
            type: 'success',
            icon: '🚀',
            text: `الحملة ناجحة ومربحة بشكل ممتاز! يمكنك زيادة الميزانية (Scale) بحذر لمضاعفة الأرباح.`
        });
    }

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
    showWaiting();
}