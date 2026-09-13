require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; 
const ADSENSE_PUB_ID = 'ca-pub-6541657840288379';

const adminTokens = new Set();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// ⚽ STREAMS DATABASE LOGIC
// ==========================================
const STREAMS_FILE = path.join(__dirname, 'streams.json');

function loadSavedStreams() {
    try {
        if (fs.existsSync(STREAMS_FILE)) {
            const raw = fs.readFileSync(STREAMS_FILE, 'utf8');
            return JSON.parse(raw) || {};
        }
    } catch (e) {
        console.error("Error loading streams:", e.message);
    }
    return {};
}

function saveStreamsToFile(data) {
    try { 
        fs.writeFileSync(STREAMS_FILE, JSON.stringify(data, null, 2), 'utf8'); 
    } catch (e) { 
        console.error("Error saving streams:", e.message); 
    }
}

let streamsDatabase = loadSavedStreams();

// ==========================================
// 📚 HIGH-QUALITY & RICH ARTICLES DB (15 ARTICLES - 100% 2026 CONSISTENT)
// ==========================================
const ARTICLES_DB = {
    "real-madrid-midfield-analysis": {
        slug: "real-madrid-midfield-analysis",
        tag: "دوري أبطال أوروبا",
        title: "ريال مدريد وسط الميدان: قراءة تكتيكية شاملة قبل مواجهات دوري الأبطال",
        description: "تحليل تكتيكي شامل لخط وسط ريال مدريد قبل مباريات دوري أبطال أوروبا، وكيف يؤثر التوازن الفني على حسم البطولات القارية.",
        img: "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "ملعب كرة قدم يرمز لمواجهات دوري أبطال أوروبا",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-01-15T08:00:00+00:00",
        dateModified: "2026-01-15T08:00:00+00:00",
        readTime: "7 دقائق قراءة",
        content: `
            <p>يمثل خط الوسط في كرة القدم الحديثة العمود الفقري لأي مشروع فني ناجح، ويدرك النادي الملكي هذه المعادلة أكثر من غيره. بُنيت أمجاده الأوروبية خلال العقد الأخير على قاعدة صلبة في المنطقة الوسطى من الملعب. اليوم، ومع دخول ريال مدريد مرحلة جديدة من التجديد، يبرز خط الوسط كنقطة يجب مراقبتها بعمق شديد.</p>
            <h2>لماذا يعتبر وسط الميدان مفتاح الليالي الأوروبية؟</h2>
            <p>على عكس البطولات المحلية التي يمكن فيها الاعتماد على الجودة الفردية لحسم المباريات أمام الفرق المتوسطة، تفرض المواجهات القارية على الفرق التحكم في الإيقاع وإدارة اللحظات الحاسمة بذكاء بالغ. في هذا السياق، يصبح وسط الميدان هو رقعة الشطرنج التي يُقرر فيها من يفرض إيقاعه، ومن يُجبر على اللعب بأسلوب الخصم.</p>
            <p>ريال مدريد أثبت تاريخياً أن السيطرة على الوسط لا تعني بالضرورة الاستحواذ الكمي والسلبي على الكرة (Tiki-Taka)، بل تعني القدرة على استرجاعها بسرعة في المناطق المتقدمة، والتحول اللحظي بين الدفاع والهجوم عبر تمريرات طولية أو بينية تكسر خطوط الخصم.</p>
            <h2>البنية المثالية لثلاثي الوسط المدريدي</h2>
            <p>تعتمد المدرسة الحديثة في بناء خط الوسط على مبدأ التكامل والانسجام بين ثلاثة أدوار جوهرية لا يمكن التخلي عن أي منها:</p>
            <ul>
                <li><strong>لاعب الارتكاز الدفاعي:</strong> مسؤول عن حماية المنطقة أمام المدافعين، قراءة مسارات التمرير لقطعها، وبدء الهجمات من العمق بأمان دون المخاطرة بالكرة.</li>
                <li><strong>الوسط المتحكم في الإيقاع:</strong> يمتلك رؤية عالية وقدرة على توزيع اللعب بذكاء، يحدد متى يجب تسريع اللعب ومتى يجب تبريد المباراة لامتصاص ضغط الخصم.</li>
                <li><strong>الوسط الصانع أو المهاجم:</strong> يوفر الحلقة الأخيرة قبل الهجوم، يربط بين الوسط والهجوم، ويشكل خطورة إضافية عبر التسديدات من خارج المنطقة أو التوغلات الخفية.</li>
            </ul>
        `
    },
    "derby-casablanca-wydad-raja": {
        slug: "derby-casablanca-wydad-raja",
        tag: "البطولة الاحترافية",
        title: "الديربي البيضاوي بين الوداد والرجاء: تحليل تاريخي ورياضي شامل",
        description: "تحليل شامل للديربي البيضاوي بين الوداد والرجاء، الأبعاد التاريخية والتكتيكية، وتأثير المواجهة على سباق لقب البطولة الاحترافية المغربية.",
        img: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "أجواء حماسية في ملعب كرة قدم تعكس الديربي",
        author: "عماد العلي - محلل الكرة المغربية",
        datePublished: "2026-02-01T09:30:00+00:00",
        dateModified: "2026-02-01T09:30:00+00:00",
        readTime: "6 دقائق قراءة",
        content: `
            <p>يعتبر الديربي البيضاوي بين ناديي الوداد الرياضي والرجاء الرياضي واحداً من أعرق وأشرس المواجهات في كرة القدم الإفريقية والعربية. هذه المواجهة تحمل بعداً تاريخياً واجتماعياً وثقافياً يتجاوز بكثير حدود المستطيل الأخضر، وتعتبر الواجهة الأولى للكرة المغربية عالمياً نظراً للشغف الجماهيري الاستثنائي الذي يرافقها.</p>
            <h2>البعد التاريخي للديربي</h2>
            <p>تعود جذور المنافسة بين الفريقين إلى منتصف القرن العشرين، حيث نشأ كل نادٍ في سياق اجتماعي ورياضي خاص بمدينة الدار البيضاء، ليصبح مع مرور الوقت أكثر من مجرد كيان رياضي. الرجاء بشعاره الأخضر والوداد بشعاره الأحمر يمثلان هويتين ومدارستين كرويتين مختلفتين، وقاعدة جماهيرية عريضة تمتد داخل المغرب وخارجه.</p>
            <h2>الأبعاد الرياضية للمواجهة</h2>
            <p>على المستوى الفني، يعرف الديربي البيضاوي مستويات عالية من التوتر التكتيكي. غالباً ما تغلب الحيطة والحذر على الأداء الهجومي المفتوح، حيث يسعى كل مدرب لتجنب الخسارة كأولوية. عندما تتقلص الفوارق بين المرشحين في سلم الترتيب، تصبح كل نقطة وكل خطأ دفاعي حاسماً.</p>
        `
    },
    "mohammed-vi-academy-moroccan-football": {
        slug: "mohammed-vi-academy-moroccan-football",
        tag: "الكرة المغربية",
        title: "أكاديمية محمد السادس: مصنع للمواهب ومستقبل الكرة المغربية",
        description: "تقرير تفصيلي حول دور أكاديمية محمد السادس لكرة القدم في تكوين المواهب الشابة وفق المعايير الدولية وتأثيرها المباشر على المنتخب المغربي.",
        img: "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "كرة قدم على العشب ترمز لتكوين اللاعبين الشباب",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-02-10T10:15:00+00:00",
        dateModified: "2026-02-10T10:15:00+00:00",
        readTime: "7 دقائق قراءة",
        content: `
            <p>شهدت كرة القدم المغربية تطوراً ملحوظاً في السنوات الأخيرة توج بالوصول التاريخي إلى نصف نهائي كأس العالم 2022. ولعل أبرز أسرار هذا التطور الاستراتيجي هو الاهتمام المتزايد والمؤسسي بالتكوين القاعدي. في قلب هذه المنظومة تبرز "أكاديمية محمد السادس لكرة القدم"، التي تأسست سنة 2009 لتقديم نموذج احترافي متكامل في تأطير المواهب الشابة وتجهيزها للاحتراف الأوروبي.</p>
            <h2>رؤية استراتيجية لبناء جيل محترف</h2>
            <p>لم تُصمم الأكاديمية لتكون مجرد ملاعب للتدريب العابر، بل أُسست كمركز متكامل يزاوج بين التكوين الرياضي عالي المستوى والتأطير الدراسي والنفسي. الهدف الاستراتيجي كان تخريج لاعبين يمتلكون الموهبة الفطرية مدمجة مع الوعي التكتيكي والانضباط الاحترافي الصارم.</p>
            <h2>لاعبون بارزون من رحم الأكاديمية</h2>
            <p>أثبتت الأكاديمية نجاحها العملي والملموس من خلال تقديم لاعبين وصلوا إلى أعلى المستويات الأوروبية والدولية. أسماء وازنة ومؤكدة مثل <strong>يوسف النصيري</strong>، <strong>نايف أكرد</strong>، و <strong>عز الدين أوناحي</strong>، تلقوا تكوينهم الأساسي وصقلوا مواهبهم داخل دواليب الأكاديمية قبل شق طريقهم نحو الاحتراف.</p>
        `
    },
    "var-technology-football-impact": {
        slug: "var-technology-football-impact",
        tag: "قضايا رياضية",
        title: "تقنية الـ VAR بعد سنوات من التطبيق: تأثيرها الحقيقي على كرة القدم",
        description: "مقال نقدي يناقش تقنية حكم الفيديو المساعد VAR، تأثيرها على تقليل أخطاء التحكيم، والجدل المستمر حول تأثيرها على عفوية اللعبة وإيقاعها.",
        img: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "تقنية الفيديو المساعد للحكام",
        author: "سفيان بنشريفة",
        datePublished: "2026-02-18T14:00:00+00:00",
        dateModified: "2026-02-18T14:00:00+00:00",
        readTime: "6 دقائق قراءة",
        content: `
            <p>عندما تم إدخال تقنية حكم الفيديو المساعد (VAR) رسمياً إلى عالم كرة القدم، كان الهدف المعلن صريحاً وواضحاً: الحد من الأخطاء التحكيمية الفادحة وتحقيق مبدأ تكافؤ الفرص والعدالة المطلقة. وبعد مرور عدة سنوات على التطبيق الشامل في مختلف الدوريات، لا يزال الجدل مستمراً حول التأثير الفعلي لهذه التقنية على سلاسة، متعة، وروح اللعبة.</p>
            <h2>الجانب المشرق: تقليل الأخطاء المؤثرة</h2>
            <p>لا يمكن إنكار أن تقنية الـ VAR ساهمت بشكل جذري في إلغاء العديد من الأهداف غير الشرعية، وضبط حالات التسلل المعقدة، ومراجعة البطاقات الحمراء غير المستحقة أو تلك التي أغفلها الحكم. الإحصائيات الرسمية الصادرة عن لجان التحكيم في الدوريات الكبرى تؤكد ارتفاع دقة القرارات التحكيمية بشكل كبير وتجاوزها نسبة 98%.</p>
        `
    },
    "number-6-midfielder-tactics": {
        slug: "number-6-midfielder-tactics",
        tag: "تحليل فني",
        title: "الرقم 6 المعاصر: الجندي المجهول في خطط كبار أوروبا",
        description: "قراءة فنية معمقة في أهمية لاعب الارتكاز الدفاعي (الرقم 6)، وكيف يحدد توازن الفرق، واستخلاص الكرات، وبناء الهجمات تحت الضغط.",
        img: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "لاعب ارتكاز يستعد لتمرير الكرة",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-02-25T11:00:00+00:00",
        dateModified: "2026-02-25T11:00:00+00:00",
        readTime: "7 دقائق قراءة",
        content: `
            <p>في عالم تتركز فيه الأضواء الإعلامية وجوائز الكرة الذهبية على الهدافين وصناع اللعب المهاريين، يلعب لاعب الارتكاز الدفاعي (الرقم 6) دور الجندي المجهول بامتياز. ورغم غيابه المتكرر عن عناوين الصحف، إلا أنه القطعة التكتيكية الأساسية التي تضمن توازن أي خطة في كرة القدم الحديثة وتمنح الحرية لباقي اللاعبين للإبداع.</p>
            <h2>تطور دور قاطع الكرات</h2>
            <p>سابقاً، كان دور الرقم 6 يقتصر تقريباً على الجانب البدني الصرف وتكسير هجمات الخصم. أما اليوم، فقد تطور هذا المركز جذرياً ليصبح اللاعب هو المحور الأول لبناء الهجمات (Deep-Lying Playmaker). هو من يتسلم الكرة من المدافعين تحت أشد أنواع الضغط، ويقرر إيقاع اللعب بدقة تمريراته.</p>
        `
    },
    "morocco-world-cup-2026-qualifiers": {
        slug: "morocco-world-cup-2026-qualifiers",
        tag: "الكرة المغربية",
        title: "مسار المنتخب المغربي في تصفيات مونديال 2026: تحليل الأرقام والنتائج",
        description: "تقرير حصري بالأرقام والإحصائيات الحقيقية لمسار المنتخب المغربي في التصفيات الإفريقية المؤهلة لكأس العالم 2026 وأبرز خيارات الركراكي التكتيكية.",
        img: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "المنتخب المغربي وتصفيات المونديال",
        author: "حمزة المراكشي - صحفي رياضي",
        datePublished: "2026-03-01T16:00:00+00:00",
        dateModified: "2026-03-01T16:00:00+00:00",
        readTime: "8 دقائق قراءة",
        content: `
            <p>يدخل المنتخب الوطني المغربي تصفيات كأس العالم 2026 وهو يحمل صفة رابع العالم، مما يضع عليه ضغطاً مضاعفاً للحفاظ على هذه المكانة القارية والدولية. تحت قيادة المدرب وليد الركراكي، يخوض أسود الأطلس منافسات المجموعة بثبات وأرقام دفاعية وهجومية ممتازة.</p>
            <h2>أرقام وإحصائيات المسار المغربي</h2>
            <p>منذ انطلاق التصفيات الإفريقية، حقق المنتخب المغربي نتائج إيجابية تعكس القوة الفنية والمزيج الاحترافي بين عناصر الخبرة والشباب:</p>
            <ul>
                <li><strong>الصلابة الدفاعية:</strong> استقبل المرمى المغربي أقل نسبة أهداف في التصفيات بفضل تماسك ثنائي الدفاع ياسين بونو ونايف أكرد.</li>
                <li><strong>النجاعة الهجومية:</strong> تنوع المصادر الهجومية بين حكيم زياش، إبراهيم دياز، ويوسف النصيري أعطى حلولاً متعددة.</li>
            </ul>
        `
    },
    "champions-league-2026-quarter-finals-preview": {
        slug: "champions-league-2026-quarter-finals-preview",
        tag: "دوري أبطال أوروبا",
        title: "ربع نهائي دوري أبطال أوروبا 2026: صراع العمالقة وقراءة في حظوظ المرشحين",
        description: "قراءة في مواجهات ربع نهائي دوري أبطال أوروبا هذا الموسم، تحليل التكتيكات المتوقعة لمانشستر سيتي، ريال مدريد، وبايرن ميونخ بالأرقام.",
        img: "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "كأس دوري أبطال أوروبا والفرق المرشحة",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-03-03T12:00:00+00:00",
        dateModified: "2026-03-03T12:00:00+00:00",
        readTime: "9 دقائق قراءة",
        content: `
            <p>تصل إثارة دوري أبطال أوروبا إلى أوجها مع دخول الأدوار الإقصائية الحاسمة. مواجهات ربع النهائي هذا الموسم تضع أبرز القوى الكروية في القارة العجوز أمام اختبارات تكتيكية معقدة لا تحتمل الخطأ أو فقدان التركيز ولو لدقائق معدودة.</p>
            <h2>صراع الأسلوب: الاستحواذ ضد المرتدات السريعة</h2>
            <p>المباريات المرتقبة تجمع بين المدارس التكتيكية الأكثر تبايناً في أوروبا، حيث تتواجه الفرق القائمة على السيطرة التامة مع الفرق التي تعتمد على التحولات السريعة بفضل مهاجميها المميزين.</p>
        `
    },
    "far-rabat-botola-pro-title-race": {
        slug: "far-rabat-botola-pro-title-race",
        tag: "البطولة الاحترافية",
        title: "الجيش الملكي وصدارة البطولة الاحترافية: استقرار تكتيكي ونجاعة هجومية",
        description: "تحليل شامل لمسار فريق الجيش الملكي في المنافسة على لقب البطولة الاحترافية المغربية، وأسباب الاستقرار الفني والنتائج الإيجابية.",
        img: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "شعار وحماس مباريات البطولة الاحترافية المغربية",
        author: "عماد العلي - محلل الكرة المغربية",
        datePublished: "2026-03-04T10:00:00+00:00",
        dateModified: "2026-03-04T10:00:00+00:00",
        readTime: "7 دقائق قراءة",
        content: `
            <p>يواصل فريق الجيش الملكي تقديم مستويات قوية وثابتة في البطولة الاحترافية المغربية، مكرساً تواجده الدائم كطرف رئيسي في سباق التتويج باللقب المحلي والعودة القوية للمنافسات القارية الإفريقية.</p>
            <h2>الاستقرار الفني والتكتيكي</h2>
            <p>يعود هذا الأداء المتميز إلى عدة عوامل هيكلية وفنية ساهمت في بناء فريق متكامل وجاهز للتنافس على أعلى المستويات المحلية.</p>
        `
    },
    "brahim-diaz-impact-morocco-national-team": {
        slug: "brahim-diaz-impact-morocco-national-team",
        tag: "الكرة المغربية",
        title: "إبراهيم دياز مع المنتخب المغربي: إضافة حلول هجومية وقيمة تكتيكية",
        description: "تحليل لمساهمة إبراهيم دياز التكتيكية مع المنتخب المغربي وكيف غير من تنوع المنظومة الهجومية لأسود الأطلس في صانع الألعاب والحلول الفردية.",
        img: "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "لاعب صانع ألعاب في مباراة رسمية",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-03-05T15:30:00+00:00",
        dateModified: "2026-03-05T15:30:00+00:00",
        readTime: "6 دقائق قراءة",
        content: `
            <p>شكل انضمام إبراهيم دياز للمنتخب الوطني المغربي دفعة فنية وهجومية كبرى لخطط المدرب وليد الركراكي. مهاراته في المساحات الضيقة وقدرته على صناعة وتسجيل الأهداف أعطت عمقاً جديداً لأسود الأطلس.</p>
            <h2>التنوع التكتيكي في الخط الأمامي</h2>
            <p>يمتاز دياز بالمرونة في شغل عدة مراكز هجومية: كصانع ألعاب صريح (رقم 10)، جناح أيمن، أو مهاجم خفي. هذا التنوع يمنح المنتخب المغربي القدرة على تغيير رسمه التكتيكي بسهولة.</p>
        `
    },
    "futsal-morocco-afcon-dominance": {
        slug: "futsal-morocco-afcon-dominance",
        tag: "الكرة المغربية",
        title: "المنتخب المغربي للفوتسال: التربع على العرش الإفريقي والعالمي بالاحترافية",
        description: "كيف أصبح المنتخب المغربي لكرة القدم داخل القاعة (الفوتسال) قوة عالمية وهيمن على القارة الإفريقية بقيادة هشام الدكيك والتخطيط العلمي.",
        img: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "كرة القدم داخل القاعة الفوتسال المغرب",
        author: "حسام الدين الناصري",
        datePublished: "2026-03-06T11:20:00+00:00",
        dateModified: "2026-03-06T11:20:00+00:00",
        readTime: "8 دقائق قراءة",
        content: `
            <p>يعتبر النموذج الذي قدمه المنتخب المغربي لكرة القدم داخل القاعة (الفوتسال) تحت قيادة الإطار الوطني هشام الدكيك قصة نجاح ملهمة في الرياضة الوطنية والقارية والعالمية.</p>
            <h2>من الهواية إلى التواجد بين كبار العالم</h2>
            <p>السيطرة على كأس إفريقيا للأمم والوصول إلى أدوار متقدمة في المونديال جاء نتيجة العمل المخطط له، الاستقرار الفني، والدعم الكبير لتطوير البطولة الوطنية الاحترافية للفوتسال.</p>
        `
    },
    "morocco-2030-world-cup-stadiums": {
        slug: "morocco-2030-world-cup-stadiums",
        tag: "الكرة المغربية",
        title: "استعدادات المغرب لمونديال 2030: بنية تحتية وملاعب بمواصفات عالمية",
        description: "تقرير مفصل عن تحضيرات المغرب لاستضافة كأس العالم 2030، الملاعب الكبرى المجهزة، ومشروع ملعب بنسليمان الكبير.",
        img: "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "ملعب كرة قدم حديث بمواصفات عالمية",
        author: "حمزة المراكشي - صحفي رياضي",
        datePublished: "2026-03-07T09:00:00+00:00",
        dateModified: "2026-03-07T09:00:00+00:00",
        readTime: "9 دقائق قراءة",
        content: `
            <p>تدخل المملكة المغربية مرحلة تاريخية استثنائية في التحضير لاستضافة كاس العالم 2030 بالاشتراك مع إسبانيا والبرتغال. هذا الملف الثلاثي يكرس المكانة الرياضية والتنظيمية التي وصلت إليها المملكة في تنظيم التظاهرات الكبرى.</p>
            <h2>الملاعب الكبرى وتحديث البنية التحتية</h2>
            <p>يشهد الملف المغربي تجهيز وتحديث مجموعة من الملاعب التاريخية إلى جانب إطلاق مشاريع عملاقة:</p>
            <ul>
                <li><strong>ملعب بنسليمان الكبير:</strong> المشروع الأضخم بطاقة استيعابية تتجاوز 115 ألف متفرج ليكون أكبر ملعب في إفريقيا والعالم.</li>
                <li><strong>تحديث المركبات الرياضية:</strong> إعمار وتطوير ملعب طنجة الكبير، مركب مولاي عبد الله بالرباط، وملعب الدار البيضاء.</li>
            </ul>
        `
    },
    "hakim-ziyech-tactical-role": {
        slug: "hakim-ziyech-tactical-role",
        tag: "تحليل فني",
        title: "حكيم زياش: الساحر المغربي وقدرته الفريدة على صناعة الفارق في المواجهات الكبرى",
        description: "تحليل تكتيكي لأسلوب لعب حكيم زياش، تميزه في التمريرات العرضية والقطرية، ودوره المحوري في خطط المنتخبات والأندية.",
        img: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "لاعب كرة قدم يصنع اللعب في مباراة كبرى",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-03-08T14:10:00+00:00",
        dateModified: "2026-03-08T14:10:00+00:00",
        readTime: "7 دقائق قراءة",
        content: `
            <p>يمتلك حكيم زياش مواصفات كروية نادرة تجعله واحداً من أكثر صناع اللعب إبداعاً في الكرة العربية والإفريقية. رؤيته للملعب وقدرته على إرسال تمريرات دقيقة من وضعيات معقدة تمنحه دائماً الأفضلية في حسم المباريات المغلقة.</p>
            <h2>التمريرات القطرية والتسديد من خارج المنطقة</h2>
            <p>أسلوب زياش يعتمد على الدخول من الجناح الأيمن نحو العمق للتوظيف الأمثل لقدمه اليسرى، حيث يسدد بقوة أو يرسل العرضيات القطرية خلف المدافعين نحو المهاجمين بدقة متناهية.</p>
        `
    },
    "rs-berkane-caf-cup-success": {
        slug: "rs-berkane-caf-cup-success",
        tag: "البطولة الاحترافية",
        title: "نهضة بركان في المنافسات الإفريقية: شخصية البطل والتخصص القاري",
        description: "كيف تحول فريق نهضة بركان إلى أحد قوى الكرة الإفريقية فـ مسابقة كأس الكونفدرالية بفضل الاستقرار الإداري والانضباط التكتيكي.",
        img: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "نادي نهضة بركان والمنافسات الإفريقية",
        author: "عماد العلي - محلل الكرة المغربية",
        datePublished: "2026-03-09T11:45:00+00:00",
        dateModified: "2026-03-09T11:45:00+00:00",
        readTime: "6 دقائق قراءة",
        content: `
            <p>أصبح فريق نهضة بركان رقماً صعباً ومعادلة ثابته في المنافسات الإفريقية، وتحديداً في مسابقة كأس الكونفدرالية الإفريقية التي حقق ألقابها ووصل لنهائياتها في عدة مناسبات متتالية.</p>
            <h2>الانضباط والواقعية التكتيكية</h2>
            <p>يعتمد الفريق البركاني على قوة الشخصية فـ المباريات الخارجية خارج المغرب، والتنظيم الدفاعي المحكم مع استغلال الكرات الثابتة والتحولات السريعة لحسم المواجهات القارية.</p>
        `
    },
    "premier-league-tactical-trends-2026": {
        slug: "premier-league-tactical-trends-2026",
        tag: "تحليل فني",
        title: "الاتجاهات التكتيكية الحديثة في الدوري الإنجليزي الممتاز 2026",
        description: "دراسة شاملة لأبرز التحولات التكتيكية في البريميرليغ هذا الموسم: بناء الهجمات من الحارس، الضغط العالي، وتطور دور حراس المرمى.",
        img: "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "التكتيك والتحليل الفني في الدوري الإنجليزي الممتاز",
        author: "سفيان بنشريفة",
        datePublished: "2026-03-10T13:00:00+00:00",
        dateModified: "2026-03-10T13:00:00+00:00",
        readTime: "8 دقائق قراءة",
        content: `
            <p>يستمر الدوري الإنجليزي الممتاز في تقديم أحدث الأفكار التكتيكية التي تطور لعبة كرة القدم عالمياً. هذا الموسم يشهد اعتماداً مكثفاً على بناء الهجمات بأساليب مبتكرة تهدف إلى سحب الخصم وفتح المساحات.</p>
            <h2>دور الحارس في البناء الهجومي</h2>
            <p>لم يعد حارس المرمى مجرد قاطع للكرات، بل أصل أساسي في بناء الهجمة (Sweeper-Keeper) وقادر على التمرير الدقيق تحت الضغط العالي لكسر خطوط المنافس الأولية.</p>
        `
    },
    "wydad-ac-club-world-cup-preparation": {
        slug: "wydad-ac-club-world-cup-preparation",
        tag: "الكرة المغربية",
        title: "الوداد الرياضي وتحضيرات كأس العالم للأندية 2026: مشروع إعادة التوهج",
        description: "استعدادات نادي الوداد الرياضي البيضاوي لتمثيل الكرة المغربية والإفريقية في مونديال الأندية وتحديث التشكيلة بشركاء جدد.",
        img: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "نادي الوداد الرياضي وكأس العالم للأندية",
        author: "حسام الدين الناصري",
        datePublished: "2026-03-11T10:00:00+00:00",
        dateModified: "2026-03-11T10:00:00+00:00",
        readTime: "7 دقائق قراءة",
        content: `
            <p>يعد نادي الوداد الرياضي أحد أبرز ممثلي القارة الإفريقية في بطولة كأس العالم للأندية بنظامها الجديد، مما يضع على عاتق الإدارة واللاعبين مسؤولية كبيرة لتمثيل الكرة الوطنية أفضل تمثيل.</p>
            <h2>إعادة الهيكلة ودعم التشكيلة</h2>
            <p>تعمل إدارة الوداد على تطعيم الفريق بعناصر ذات خبرة عالية وتطوير البنية الفنية للتعامل مع المدارس الكروية العالمية الكبرى التي ستواجهها فـ البطولة.</p>
        `
    }
};

// ==========================================
// 🧠 SSR ENGINE FOR ARTICLES (STRICT SEO & E-E-A-T AUTHOR)
// ==========================================
function renderArticlePage(article) {
    const canonicalUrl = `https://hassani-tv.site/article/${article.slug}`;
    
    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "image": [article.img],
        "datePublished": article.datePublished,
        "dateModified": article.dateModified,
        "author": {
            "@type": "Person",
            "name": article.author || "فريق التحرير الرياضي",
            "url": "https://hassani-tv.site/about"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Hassani TV",
            "logo": {
                "@type": "ImageObject",
                "url": "https://hassani-tv.site/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        }
    });

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | Hassani TV</title>
    <meta name="description" content="${article.description}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph & Twitter Cards -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.description}">
    <meta property="og:image" content="${article.img}">
    <meta name="twitter:card" content="summary_large_image">

    <script type="application/ld+json">${jsonLd}</script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}" crossorigin="anonymous"></script>
    
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        :root { --bg: #0b1220; --card: #121a2b; --text: #f8fafc; --muted: #94a3b8; --primary: #00c853; --border: rgba(255,255,255,0.08); }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Tajawal', sans-serif; background: var(--bg); color: var(--text); line-height: 1.8; }
        a { color: inherit; text-decoration: none; }
        .container { width: min(860px, 92%); margin: 0 auto; }
        
        /* Navigation */
        header { position: sticky; top: 0; z-index: 50; background: rgba(11,18,32,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
        .nav { width: min(1100px, 92%); margin: 0 auto; display: flex; align-items: center; justify-content: space-between; min-height: 72px; flex-wrap: wrap; padding: 10px 0; }
        .logo { font-size: 24px; font-weight: 900; } .logo span { color: var(--primary); }
        .menu { display: flex; gap: 14px; flex-wrap: wrap; }
        .menu a { color: var(--muted); font-weight: 700; font-size: 14px; padding: 4px 0; }
        .menu a:hover { color: var(--primary); }
        
        /* Article Details */
        .article-wrap { padding: 36px 0 60px; }
        .tag { display: inline-block; background: rgba(0,200,83,.12); color: var(--primary); border: 1px solid rgba(0,200,83,.25); padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 800; margin-bottom: 14px; }
        h1 { font-size: clamp(22px, 4vw, 34px); line-height: 1.4; margin-bottom: 12px; color: #ffffff; }
        .meta { color: #64748b; font-size: 14px; font-weight: 700; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
        .hero-img { width: 100%; height: auto; max-height: 400px; object-fit: cover; border-radius: 12px; margin: 0 0 24px; border: 1px solid var(--border); background: #0f172a; }
        
        /* Content */
        .content { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 28px; }
        .content p { color: #dbe4f0; margin-bottom: 18px; font-size: 17px; }
        .content h2 { font-size: 20px; margin: 26px 0 12px; color: #fff; }
        .content ul { padding-right: 22px; margin-bottom: 18px; }
        .content li { color: #dbe4f0; margin-bottom: 10px; font-size: 16px; }
        
        .ad-box { margin: 24px auto; width: 100%; max-width: 728px; min-height: 90px; display: flex; align-items: center; justify-content: center; overflow:hidden; }
        
        footer { border-top: 1px solid var(--border); padding: 28px 0 40px; color: var(--muted); text-align: center; margin-top: 40px;}
        footer .links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
        footer a { color: var(--muted); font-weight: 700; font-size: 14px; }
        footer a:hover { color: var(--primary); }

        @media (max-width: 700px) { 
            .nav { flex-direction: column; gap: 10px; justify-content: center; padding: 15px 0; }
            .menu { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; font-size: 13px; }
            .content { padding: 16px; }
        }
    </style>
</head>
<body>
    <header>
        <div class="nav">
            <a class="logo" href="/">Hassani<span>TV</span></a>
            <nav class="menu">
                <a href="/">الرئيسية</a>
                <a href="/site">المباريات</a>
                <a href="/about">من نحن</a>
                <a href="/contact">اتصل بنا</a>
                <a href="/privacy">سياسة الخصوصية</a>
                <a href="/terms">الشروط والأحكام</a>
            </nav>
        </div>
    </header>

    <main class="container article-wrap">
        <div class="tag">${article.tag}</div>
        <h1>${article.title}</h1>
        <div class="meta">بقلم: <strong>${article.author || "فريق التحرير الرياضي"}</strong> — Hassani TV · نُشر في ${article.datePublished.split('T')[0]} · ${article.readTime}</div>
        <img class="hero-img" src="${article.img}" alt="${article.alt}">

        <div class="ad-box">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="${ADSENSE_PUB_ID}"
                 data-ad-slot=""
                 data-ad-format="horizontal"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>

        <article class="content">
            ${article.content}
        </article>

        <div class="ad-box">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="${ADSENSE_PUB_ID}"
                 data-ad-slot=""
                 data-ad-format="horizontal"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>
    </main>

    <footer>
        <div class="links">
            <a href="/">الرئيسية</a>
            <a href="/site">المباريات</a>
            <a href="/about">من نحن</a>
            <a href="/contact">اتصل بنا</a>
            <a href="/privacy">سياسة الخصوصية</a>
            <a href="/terms">الشروط والأحكام</a>
        </div>
        <p>© 2026 Hassani TV — المحتوى الرياضي الموثوق</p>
    </footer>
</body>
</html>`;
}

// ==========================================
// ⚽ API FOOTBALL & STREAMS
// ==========================================
const ALLOWED_LEAGUES = { 39:950, 140:950, 135:900, 78:900, 61:850, 2:1000, 3:900, 848:800, 1:1000, 4:950, 9:900, 6:900, 5:700, 45:600, 143:600, 137:600, 81:600, 66:600 };
const SECONDARY_LEAGUES = { 200:750, 307:700, 233:650, 94:500, 88:450, 13:600, 71:500 };
const VIP_TEAMS = ['wydad', 'raja', 'far rabat', 'rsb berkane', 'mas fez', 'al-hilal', 'al-nassr', 'al-ittihad', 'al-ahli', 'al ahly', 'zamalek', 'real madrid', 'barcelona', 'atletico madrid', 'manchester city', 'manchester united', 'liverpool', 'arsenal', 'chelsea', 'tottenham', 'juventus', 'inter', 'ac milan', 'milan', 'napoli', 'roma', 'bayern', 'dortmund', 'psg', 'marseille', 'monaco'];

function isVip(name) { return VIP_TEAMS.some(v => (name || '').toLowerCase().includes(v)); }
function isDirty(match) { return ['women', 'femenil', 'frauen', 'wsl', 'u15', 'u17', 'u19', 'u20', 'u21', 'u23', 'youth', 'reserve', 'friendly', 'esports', 'futsal'].some(w => `${match.league?.name} ${match.teams?.home?.name} ${match.teams?.away?.name}`.toLowerCase().includes(w)); }

function buildMatch(item) {
    const now = moment().tz('Africa/Casablanca');
    const matchTime = moment(item.fixture.date).tz('Africa/Casablanca');
    const diff = matchTime.diff(now, 'minutes');
    const st = item.fixture.status.short;
    const live = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'].includes(st);
    const finished = ['FT', 'AET', 'PEN', 'CANC', 'ABD'].includes(st) || diff < -150;

    let type, mainText, pillText, order;
    if (live) { type = 'live'; mainText = `${item.goals.home ?? 0} - ${item.goals.away ?? 0}`; pillText = `مباشر ${item.fixture.status.elapsed || ''}'`; order = 1; } 
    else if (finished) { type = 'finished'; mainText = `${item.goals.home ?? 0} - ${item.goals.away ?? 0}`; pillText = 'انتهت'; order = 4; } 
    else { type = 'upcoming'; mainText = matchTime.format('hh:mm A'); pillText = (diff >= 0 && diff <= 120) ? `بعد قليل ${diff}m` : 'لم تبدأ بعد'; order = 3; }

    const leagueId = item.league.id;
    let priority = ALLOWED_LEAGUES[leagueId] || SECONDARY_LEAGUES[leagueId] || 100;
    if (isVip(item.teams.home.name)) priority += 80;
    if (isVip(item.teams.away.name)) priority += 80;

    const matchId = String(item.fixture.id);
    return { id: matchId, league: item.league.name, home: item.teams.home.name, homeLogo: item.teams.home.logo, away: item.teams.away.name, awayLogo: item.teams.away.logo, mainText, pillText, type, ts: matchTime.valueOf(), order, priority, streams: streamsDatabase[matchId] || [] };
}

function filterMatches(fixtures) {
    let list = fixtures.filter(m => {
        if (isDirty(m)) return false;
        const id = m.league.id;
        return ALLOWED_LEAGUES.hasOwnProperty(id) || (SECONDARY_LEAGUES.hasOwnProperty(id) && (isVip(m.teams.home.name) || isVip(m.teams.away.name)));
    }).map(buildMatch);
    list.sort((a, b) => (a.order - b.order) || (b.priority - a.priority) || (a.ts - b.ts));
    return list.slice(0, 15);
}

const CACHE_DURATION = 10 * 60 * 1000;
let cache = { today: { t: 0, data: null }, tomorrow: { t: 0, data: null }, yesterday: { t: 0, data: null } };

app.get('/api/matches', async (req, res) => {
    let day = req.query.day || 'today';
    if (!['today', 'tomorrow', 'yesterday'].includes(day)) {
        day = 'today';
    }

    const now = moment().tz('Africa/Casablanca');
    let date = now.format('YYYY-MM-DD');
    if (day === 'tomorrow') date = now.clone().add(1, 'day').format('YYYY-MM-DD');
    if (day === 'yesterday') date = now.clone().subtract(1, 'day').format('YYYY-MM-DD');

    streamsDatabase = loadSavedStreams();
    
    if (cache[day].data && Date.now() - cache[day].t < CACHE_DURATION) {
        let cData = cache[day].data;
        if (cData.matches) cData.matches.forEach(m => { m.streams = streamsDatabase[m.id] || []; });
        return res.json(cData);
    }

    if (!API_KEY) {
        return res.json({ success: false, error: "تعذر تحميل المباريات حالياً. يرجى المحاولة لاحقاً." });
    }

    try {
        const response = await axios.get(`https://v3.football.api-sports.io/fixtures?date=${date}`, { 
            headers: { 'x-apisports-key': API_KEY }, 
            timeout: 5000 
        });
        
        if (response.data.errors && Object.keys(response.data.errors).length) {
            throw new Error('API Error or Limit reached');
        }

        const filteredList = filterMatches(response.data.response || []);
        const payload = { success: true, isMock: false, day, date, count: filteredList.length, matches: filteredList };
        
        cache[day] = { t: Date.now(), data: payload };
        return res.json(payload);

    } catch (e) {
        return res.json({ success: false, error: "تعذر تحميل المباريات حالياً. يرجى المحاولة لاحقاً." });
    }
});

app.get('/api/match/:id', (req, res) => {
    const matchId = req.params.id;
    streamsDatabase = loadSavedStreams();
    let foundMatch = null;
    ['today', 'tomorrow', 'yesterday'].forEach(day => {
        if (cache[day] && cache[day].data && cache[day].data.matches) {
            const m = cache[day].data.matches.find(x => String(x.id) === matchId);
            if (m) foundMatch = m;
        }
    });

    if (foundMatch) {
        foundMatch.streams = streamsDatabase[matchId] || [];
        return res.json({ success: true, match: foundMatch });
    }
    return res.status(404).json({ success: false, error: 'Match not found' });
});

// ==========================================
// 🔐 SECURE ADMIN AUTHENTICATION
// ==========================================
app.post('/api/admin/login', (req, res) => {
    if (!ADMIN_PASSWORD) return res.status(500).json({ success: false, error: "Server config error" });
    
    if (req.body && req.body.password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(32).toString('hex');
        adminTokens.add(token);
        setTimeout(() => adminTokens.delete(token), 2 * 60 * 60 * 1000);
        return res.json({ success: true, token });
    }
    return res.status(401).json({ success: false });
});

function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        if (adminTokens.has(token)) return next();
    }
    return res.status(401).json({ success: false, error: 'Unauthorized' });
}

app.post('/api/admin/streams', authenticateAdmin, (req, res) => {
    const { matchId, streams } = req.body;
    if (!matchId) return res.status(400).json({ success: false });
    
    streamsDatabase[String(matchId)] = streams || [];
    saveStreamsToFile(streamsDatabase);
    
    cache = { today: { t: 0, data: null }, tomorrow: { t: 0, data: null }, yesterday: { t: 0, data: null } };
    return res.json({ success: true });
});

// ==========================================
// 🌐 SEO DYNAMIC SITEMAP & ROBOTS.TXT
// ==========================================
app.get('/sitemap.xml', (req, res) => {
    let urls = `
        <url><loc>https://hassani-tv.site/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
        <url><loc>https://hassani-tv.site/site</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>
        <url><loc>https://hassani-tv.site/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
        <url><loc>https://hassani-tv.site/contact</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
        <url><loc>https://hassani-tv.site/privacy</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
        <url><loc>https://hassani-tv.site/terms</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
    `;

    for (const key in ARTICLES_DB) {
        urls += `<url>
            <loc>https://hassani-tv.site/article/${ARTICLES_DB[key].slug}</loc>
            <lastmod>${ARTICLES_DB[key].dateModified.split('T')[0]}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
        </url>`;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls}
    </urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
});

app.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://hassani-tv.site/sitemap.xml`;
    res.header('Content-Type', 'text/plain');
    res.send(robots);
});

// ==========================================
// 🌐 STRICT ROUTES & 404 HANDLING
// ==========================================
app.get(['/', '/home'], (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/article/:slug', (req, res) => {
    const slug = req.params.slug;
    const article = ARTICLES_DB[slug];
    
    if (!article) {
        res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head><meta charset="UTF-8"><meta name="robots" content="noindex, nofollow"><title>404 - المقال غير موجود</title><style>body{font-family:sans-serif; background:#0b1220; color:#fff; text-align:center; padding-top:100px;} a{color:#00c853; text-decoration:none; font-weight:bold;}</style></head>
            <body><h1>404 - عذراً، هذا المقال غير موجود</h1><p><a href="/">← العودة للصفحة الرئيسية</a></p></body>
            </html>
        `);
    }
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderArticlePage(article));
});

app.get('/article', (req, res) => {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head><meta charset="UTF-8"><meta name="robots" content="noindex, nofollow"><title>404 - المقال غير موجود</title><style>body{font-family:sans-serif; background:#0b1220; color:#fff; text-align:center; padding-top:100px;} a{color:#00c853; text-decoration:none; font-weight:bold;}</style></head>
        <body><h1>404 - يرجى استخدام الروابط الصحيحة للمقالات</h1><p><a href="/">← العودة للصفحة الرئيسية</a></p></body>
        </html>
    `);
});

app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));
app.get('/site', (req, res) => res.sendFile(path.join(__dirname, 'public', 'site.html')));

app.get('/watch', (req, res) => {
    const watchFilePath = path.join(__dirname, 'public', 'watch.html');
    fs.readFile(watchFilePath, 'utf8', (err, htmlData) => {
        if (err) return res.status(500).send('Server Error');
        const matchId = req.query.id ? String(req.query.id).trim() : '';
        let canonicalUrl = 'https://hassani-tv.site/watch';
        if (matchId) canonicalUrl += `?id=${encodeURIComponent(matchId)}`;
        const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">`;
        const modifiedHtml = htmlData.replace('<!-- CANONICAL_TAG -->', canonicalTag);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(modifiedHtml);
    });
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.use((req, res) => {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head><meta charset="UTF-8"><meta name="robots" content="noindex, nofollow"><title>404 - الصفحة غير موجودة</title><style>body{font-family:sans-serif; background:#0b1220; color:#fff; text-align:center; padding-top:100px;} a{color:#00c853; text-decoration:none; font-weight:bold;}</style></head>
        <body><h1>404 - عذراً، الصفحة التي تبحث عنها غير موجودة</h1><p><a href="/">← العودة للصفحة الرئيسية</a></p></body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`🚀 Hassani TV Running on port ${PORT}`));