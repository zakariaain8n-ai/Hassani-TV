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
// 📚 DATABASE CONTAINING ALL 35 ARTICLES
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
        readTime: "15 دقيقة قراءة",
        content: `<h2>مقدمة: لماذا يبقى وسط الميدان عنصراً حاسماً في هوية ريال مدريد؟</h2><p>وسط الميدان هو المنطقة التي تبدأ منها معظم التحولات المهمة في كرة القدم الحديثة. الفريق الذي يسيطر على هذه المنطقة يستطيع غالباً التحكم في إيقاع المباراة.</p>`
    },
    "derby-casablanca-wydad-raja": {
        slug: "derby-casablanca-wydad-raja",
        tag: "البطولة الاحترافية",
        title: "الديربي البيضاوي بين الوداد والرجاء: تحليل تاريخي ورياضي شامل",
        description: "تحليل شامل للديربي البيضاوي بين الوداد والرجاء، الأبعاد التاريخية والتكتيكية، وتأثير المواجهة على سباق لقب البطولة الاحترافية المغربية.",
        img: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "أجواء حماسية في ملعب كرة قدم تعكس الديربي البيضاوي",
        author: "عماد العلي - محلل الكرة المغربية",
        datePublished: "2026-02-01T09:30:00+00:00",
        dateModified: "2026-02-01T09:30:00+00:00",
        readTime: "18 دقيقة قراءة",
        content: `<h2>الديربي البيضاوي بين الوداد والرجاء</h2><p>تحليل تاريخي ورياضي للمواجهة بين القطبين البيضاوين.</p>`
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
        readTime: "20 دقيقة قراءة",
        content: `<h2>أكاديمية محمد السادس لكرة القدم</h2><p>مصنع المواهب المغربية الشابة وركيزة المنتخب الوطني.</p>`
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
        readTime: "15 دقيقة قراءة",
        content: `<h2>تقنية الـ VAR في كرة القدم</h2><p>مقال نقدي يناقش تقنية الفيديو المساعد وتأثيرها على اللعبة.</p>`
    },
    "number-6-midfielder-tactics": {
        slug: "number-6-midfielder-tactics",
        tag: "تحليل فني",
        title: "الرقم 6 المعاصر: الجندي المجهول في خطط كبار أوروبا",
        description: "قراءة فنية معمقة في أهمية لاعب الارتكاز الدفاعي (الرقم 6)، وكيف يحدد توازن الفرق، واستخلاص الكرات، وبناء الهجمات تحت الضغط.",
        img: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "لاعب ارتكاز يستعد لتمرير الكرة",
        author: "عماد العلي",
        datePublished: "2026-02-25T11:00:00+00:00",
        dateModified: "2026-02-25T11:00:00+00:00",
        readTime: "15 دقيقة قراءة",
        content: `<h2>الرقم 6 المعاصر في كرة القدم</h2><p>قراءة فنية في أهمية لاعب الارتكاز الدفاعي وتكتيك بناء الهجمة.</p>`
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
        readTime: "15 دقيقة قراءة",
        content: `<h2>تصفيات كأس العالم 2026</h2><p>تحليل لأداء وأرقام أسود الأطلس في التصفيات المونديالية.</p>`
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
        readTime: "15 دقيقة قراءة",
        content: `<h2>دوري أبطال أوروبا 2026</h2><p>قراءة تكتيكية في مواجهات الدور ربع النهائي للبطولة الأوروبية.</p>`
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
        readTime: "12 دقيقة قراءة",
        content: `<h2>مسار الجيش الملكي في البطولة</h2><p>تحليل النجاعة الهجومية والاستقرار الفني للفريق العسكري.</p>`
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
        readTime: "12 دقيقة قراءة",
        content: `<h2>إبراهيم دياز واسود الأطلس</h2><p>تحليل للقيمة التكتيكية والحلول المهارية المقدمة للمنتخب.</p>`
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
        readTime: "14 دقيقة قراءة",
        content: `<h2>إنجازات الفوتسال المغربي</h2><p>قصة نجاح كرة القدم داخل القاعة بقيادة الإطار الوطني هشام الدكيك.</p>`
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
        readTime: "15 دقيقة قراءة",
        content: `<h2>جاهزية المغرب لكأس العالم 2030</h2><p>استعراض لأبرز مشاريع البنية التحتية والملاعب الرياضية.</p>`
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
        readTime: "12 دقيقة قراءة",
        content: `<h2>أسلوب حكيم زياش التكتيكي</h2><p>تحليل للتمريرات الدقيقة والحلول الهجومية التي يقدمها زياش.</p>`
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
        readTime: "12 دقيقة قراءة",
        content: `<h2>نهضة بركان والتوهج القاري</h2><p>شخصية البطل والانضباط التكتيكي في البطولة الإفريقية.</p>`
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
        readTime: "15 دقيقة قراءة",
        content: `<h2>تكتيكات الدوري الإنجليزي الممتاز</h2><p>دراسة حديثة في اتجاهات الضغط العالي وبناء اللعب.</p>`
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
        readTime: "14 دقيقة قراءة",
        content: `<h2>الوداد في مونديال الأندية</h2><p>تحضيرات الفريق الأحمر لاستحقاقات كأس العالم للأندية.</p>`
    },
    "barcelona-la-masia-new-generation": {
        slug: "barcelona-la-masia-new-generation",
        tag: "الدوري الإسباني",
        title: "لاماسيا برشلونة: كيف يعيد الجيل الجديد بناء الهوية الكتالونية؟",
        description: "قراءة في أكاديمية لاماسيا والدور الذي تلعبه الجواهر الشابة في استعادة التوازن الاقتصادي والفني لنادي برشلونة.",
        img: "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "موهبة كروية من أكاديمية لاماسيا",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-03-12T08:30:00+00:00",
        dateModified: "2026-03-12T08:30:00+00:00",
        readTime: "12 دقيقة قراءة",
        content: `<h2>مواهب لاماسيا برشلونة</h2><p>كيف يعتمد الفريق الكتالوني على شبابه لاستعادة المجد الفني.</p>`
    },
    "yassine-bounou-goalkeeping-masterclass": {
        slug: "yassine-bounou-goalkeeping-masterclass",
        tag: "الكرة المغربية",
        title: "ياسين بونو: أسرار الثبات الذهني ورد الفعل الاستثنائي لحارس حفر اسمه عالمياً",
        description: "دراسة تحليلية في أسلوب ياسين بونو، التصدي لضربات الجزاء، ودوره كصمام أمان للمنتخب المغربي والأندية.",
        img: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "حارس مرمى في تصدي حاسم",
        author: "عماد العلي - محلل الكرة المغربية",
        datePublished: "2026-03-13T11:00:00+00:00",
        dateModified: "2026-03-13T11:00:00+00:00",
        readTime: "14 دقيقة قراءة",
        content: `<h2>براعة ياسين بونو ف الحراسة</h2><p>تحليل لثبات بونو الذهني وردة فعله السريعة ف المواجهات الحسم.</p>`
    },
    "achraf-hakimi-modern-right-back": {
        slug: "achraf-hakimi-modern-right-back",
        tag: "الكرة المغربية",
        title: "أشرف حكيمي: القوة البدنية والسرعة في خدمة الظهير العصري المتكامل",
        description: "تحليل شامل لأرقام وأداء أشرف حكيمي على الجهة اليمنى، المساهمات الهجومية والتحول التكتيكي الخاطف.",
        img: "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "انطلاقة ظهير أيمن على الخط الجانبي",
        author: "حمزة المراكشي",
        datePublished: "2026-03-14T09:15:00+00:00",
        dateModified: "2026-03-14T09:15:00+00:00",
        readTime: "12 دقيقة قراءة",
        content: `<h2>حكيمي والظهير العصري</h2><p>تحليل هجومي ودفاعي لأسرع ظهير أيمن ف العالم.</p>`
    },
    "bayern-munich-bundesliga-tactics": {
        slug: "bayern-munich-bundesliga-tactics",
        tag: "البوندسليغا",
        title: "بايرن ميونخ والضغط المكثف: تكتيك استعادة الهيمنة في ألمانيا",
        description: "تحليل أسلوب بايرن ميونخ التكتيكي في الضغط العالي والتحولات السريعة لحسم ألقاب الدوري الألماني.",
        img: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "شعار وحماس منافسات البوندسليغا",
        author: "سفيان بنشريفة",
        datePublished: "2026-03-15T14:20:00+00:00",
        dateModified: "2026-03-15T14:20:00+00:00",
        readTime: "11 دقيقة قراءة",
        content: `<h2>تكتيك بايرن ميونخ</h2><p>دراسة في أسلوب الضغط العكسي والسيطرة ف البوندسليغا.</p>`
    },
    "manchester-city-possession-football": {
        slug: "manchester-city-possession-football",
        tag: "البريميرليغ",
        title: "مانشستر سيتي وهندسة الاستحواذ: كيف يفكك غوارديولا التكتلات الدفاعية؟",
        description: "قراءة في تكتيك التمرير القصير والتدوير التكتيكي لمانشستر سيتي تحت قيادة غوارديولا للوصول لمرمى الخصوم.",
        img: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "تنسيق تكتيكي واستحواذ على الكرة في الملعب",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-03-16T10:00:00+00:00",
        dateModified: "2026-03-16T10:00:00+00:00",
        readTime: "15 دقيقة قراءة",
        content: `<h2>استحواذ مانشستر سيتي</h2><p>كيف يفكك غوارديولا أعتى الدفاعات الأوروبية للتسجيل.</p>`
    },
    "arsenal-title-challenge-arteta": {
        slug: "arsenal-title-challenge-arteta",
        tag: "البريميرليغ",
        title: "مشروع ميكيل أرتيتا في أرسنال: الصلابة الدفاعية والانضباط التكتيكي",
        description: "تحليل بناء فريق أرسنال الحديث وكيف حول أرتيتا الفريق لنادٍ منافس بقوة على الألقاب المحلية والقارية.",
        img: "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "تكتيك فريق أرسنال في الدوري الإنجليزي",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-03-17T12:00:00+00:00",
        dateModified: "2026-03-17T12:00:00+00:00",
        readTime: "13 دقيقة قراءة",
        content: `<h2>تطور أرسنال مع أرتيتا</h2><p>الصلابة الدفاعية والالتزام التكتيكي سر المنافسة على البريميرليغ.</p>`
    },
    "inter-milan-3-5-2-system": {
        slug: "inter-milan-3-5-2-system",
        tag: "الدوري الإيطالي",
        title: "إنتر ميلان ورسم 3-5-2: المدرسة الإيطالية في أعلى درجات الفعالية",
        description: "قراءة تكتيكية في تطبيق إنتر ميلان لخطة 3-5-2 والتحولات الهجومية والدفاعية المنظمة في السيريا أي.",
        img: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "تكتيك كرة القدم في الدوري الإيطالي",
        author: "حسام الدين الناصري",
        datePublished: "2026-03-18T15:40:00+00:00",
        dateModified: "2026-03-18T15:40:00+00:00",
        readTime: "12 دقيقة قراءة",
        content: `<h2>خطة 3-5-2 لإنتر ميلان</h2><p>كيف تفوق النادي الإيطالي تكتيكياً فـ الكالتشيو وأوروبا.</p>`
    },
    "psg-post-mbappe-era": {
        slug: "psg-post-mbappe-era",
        tag: "الدوري الفرنسي",
        title: "باريس سان جيرمان والكرة الجماعية: إعادة بناء الفريق بعيداً عن النجومية",
        description: "تحليل فلسفة باريس سان جيرمان الجديدة القائمة على التضامن الجماعي والشباب والتنظيم التكتيكي.",
        img: "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "ملعب باريس سان جيرمان والمشروع الجديد",
        author: "سفيان بنشريفة",
        datePublished: "2026-03-19T09:00:00+00:00",
        dateModified: "2026-03-19T09:00:00+00:00",
        readTime: "11 دقيقة قراءة",
        content: `<h2>المشروع الجديد لباريس</h2><p>فلسفة الاعتماد على المجموعة واللعب التكتيكي الجماعي.</p>`
    },
    "saudi-pro-league-global-impact": {
        slug: "saudi-pro-league-global-impact",
        tag: "كرة قدم عربية",
        title: "دوري روشن السعودي: تحول هيكلي يجذب أنظار الإعلام الكروي العالمي",
        description: "تقرير حول استراتيجية دوري روشن السعودي في جلب النجوم العالمية وتطوير البنية التحتية والمستوى الفني.",
        img: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "شعار منافسات الدوري السعودي للمحترفين",
        author: "حمزة المراكشي",
        datePublished: "2026-03-20T16:10:00+00:00",
        dateModified: "2026-03-20T16:10:00+00:00",
        readTime: "14 دقيقة قراءة",
        content: `<h2>تطور دوري روشن العالمي</h2><p>استقطاب النجوم وتطوير القيمة التنافسية والإعلامية للدوري.</p>`
    },
    "african-cup-of-nations-2025-morocco": {
        slug: "african-cup-of-nations-2025-morocco",
        tag: "الكرة المغربية",
        title: "كأس أمم إفريقيا بالمغرب: جاهزية شاملة لتنظيم نسخة استثنائية تاريخياً",
        description: "استعدادات المغرب لتنظيم كان الكبار: الملاعب المجهزة، المواصلات، والتطلعات الوطنية للتتويج باللقب القاري.",
        img: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "كأس أمم إفريقيا لكرة القدم والملاعب المغربية",
        author: "عماد العلي - محلل الكرة المغربية",
        datePublished: "2026-03-21T11:00:00+00:00",
        dateModified: "2026-03-21T11:00:00+00:00",
        readTime: "15 دقيقة قراءة",
        content: `<h2>كان المغرب 2025</h2><p>استعدادات وتنظيم استثنائي لكأس الأمم الإفريقية بالمغرب.</p>`
    },
    "raja-casablanca-tactical-identity": {
        slug: "raja-casablanca-tactical-identity",
        tag: "البطولة الاحترافية",
        title: "الهوية الكروية للرجاء الرياضي: بناء اللعب والفرجة التكتيكية المميزة",
        description: "دراسة في الفلسفة الكروية لنادي الرجاء البيضاوي والاعتماد التاريخي على الاستحواذ والتمرير القصير السريع.",
        img: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "جماهير ولعب الرجاء الرياضي",
        author: "عماد العلي",
        datePublished: "2026-03-22T13:30:00+00:00",
        dateModified: "2026-03-22T13:30:00+00:00",
        readTime: "12 دقيقة قراءة",
        content: `<h2>هوية الرجاء الكروية</h2><p>التمرير القصير، اللعب الجمالي والفرجة التكتيكية الأخضراء.</p>`
    },
    "soufiane-rahimi-asian-champions-league": {
        slug: "soufiane-rahimi-asian-champions-league",
        tag: "الكرة المغربية",
        title: "سفيان رحيمي: التألق القاري وهداف المواعيد الكبرى في آسيا والمونديال",
        description: "تحليل لأرقام وأداء النجم المغربي سفيان رحيمي وقدرته الاستثنائية على حسم المباريات الكبرى بالسرعة والنجاعة.",
        img: "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "سفيان رحيمي والمباريات الكبرى",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-03-23T10:20:00+00:00",
        dateModified: "2026-03-23T10:20:00+00:00",
        readTime: "10 دقائق قراءة",
        content: `<h2>نجاعة سفيان رحيمي</h2><p>حسم المباريات الحاسمة والقتالية الهجومية المتميزة.</p>`
    },
    "football-nutrition-and-recovery-methods": {
        slug: "football-nutrition-and-recovery-methods",
        tag: "علوم الرياضة",
        title: "الاستشفاء والتغذية الرياضية: العلم الخفي خلف الاستمرارية البدنية للاعبين",
        description: "دليل شامل يوضح كيف تعتمد الأندية الكبرى على علوم التغذية والأنظمة التقنية لتفادي الإصابات وسرعة الاستشفاء.",
        img: "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "التجهيز البدني والاستشفاء للاعبي كرة القدم",
        author: "حسام الدين الناصري",
        datePublished: "2026-03-24T08:00:00+00:00",
        dateModified: "2026-03-24T08:00:00+00:00",
        readTime: "14 دقيقة قراءة",
        content: `<h2>التغذية والاستشفاء فـ كرة القدم</h2><p>دور التكنولوجيا والأنظمة الغذائية الحديثة فـ تجهيز اللاعبين.</p>`
    },
    "data-analytics-in-modern-football": {
        slug: "data-analytics-in-modern-football",
        tag: "علوم الرياضة",
        title: "البيانات والإحصائيات الحديثة: كيف تعيد الخوارزميات تشكيل التكتيك الكروي؟",
        description: "شرح لمفاهيم الأهداف المتوقعة xG والتحليل الرقمي الذي تعتمد عليه برامج الكشافة وإعداد الخطط الرياضية.",
        img: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "تحليل البيانات والإحصائيات في كرة القدم",
        author: "سفيان بنشريفة",
        datePublished: "2026-03-25T14:00:00+00:00",
        dateModified: "2026-03-25T14:00:00+00:00",
        readTime: "13 دقيقة قراءة",
        content: `<h2>تحليل البيانات الرقمية xG</h2><p>كيف غيّرت الإحصائيات الدقيقة قرارات المدربين والكشافين.</p>`
    },
    "false-nine-role-evolution": {
        slug: "false-nine-role-evolution",
        tag: "تحليل فني",
        title: "المهاجم الوهمي (False 9): تاريخ وتطور التكتيك الذي يربك خطوط الدفاع",
        description: "قراءة في تاريخ مركز المهاجم الوهمي من ميسي مع غوارديولا إلى التطبيقات العصرية في كبار أوروبا.",
        img: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "تكتيك المهاجم الوهمي في الملعب",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-03-26T12:00:00+00:00",
        dateModified: "2026-03-26T12:00:00+00:00",
        readTime: "12 دقيقة قراءة",
        content: `<h2>المهاجم الوهمي False 9</h2><p>تكتيك سحب المدافعين وفتح المساحات القادمة من الخلف.</p>`
    },
    "counter-pressing-gegenpressing-explained": {
        slug: "counter-pressing-gegenpressing-explained",
        tag: "تحليل فني",
        title: "الضغط العكسي (Gegenpressing): كيف تحول فقدان الكرة إلى فرصة تسجيل فورية؟",
        description: "شرح مفصل لفلسفة الضغط العكسي الخاطف، قواعد الثواني الست، وتطبيقها في المدرسة الألمانية والكرة الحديثة.",
        img: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "الضغط العكسي وافتكاك الكرة في الملعب",
        author: "سفيان بنشريفة",
        datePublished: "2026-03-27T09:30:00+00:00",
        dateModified: "2026-03-27T09:30:00+00:00",
        readTime: "14 دقيقة قراءة",
        content: `<h2>أسلوب الضغط العكسي Gegenpressing</h2><p>السيطرة واستعادة الكرة فوراً فـ الثلث الأخير من ملعب الخصم.</p>`
    },
    "youth-scouting-in-north-africa": {
        slug: "youth-scouting-in-north-africa",
        tag: "قضايا رياضية",
        title: "التنقيب عن المواهب في شمال إفريقيا: استراتيجيات الكشافة والأكاديميات الحديثة",
        description: "تقرير حول كيفية اكتشاف المواهب الشابة في المغرب وشمال إفريقيا وتأطيرها وفق الشروط الاحترافية الدولية.",
        img: "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "مواهب شابة في التكوين الكروي",
        author: "حمزة المراكشي",
        datePublished: "2026-03-28T11:15:00+00:00",
        dateModified: "2026-03-28T11:15:00+00:00",
        readTime: "13 دقيقة قراءة",
        content: `<h2>اكتشاف المواهب فـ شمال إفريقيا</h2><p>دور الأكاديميات والكشافة فـ تقديم مواهب صاعدة للاحتراف.</p>`
    },
    "caf-champions-league-tactical-evolution": {
        slug: "caf-champions-league-tactical-evolution",
        tag: "الكرة الإفريقية",
        title: "دوري أبطال إفريقيا: التطور التكتيكي والشغف الجماهيري في أعرق مسابقات القارة",
        description: "تحليل لمستوى المنافسة التكتيكية والندية البدنية في دوري أبطال إفريقيا وسيطرة الأندية الشمال إفريقية.",
        img: "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "منافسات ودوري أبطال إفريقيا",
        author: "عماد العلي - محلل الكرة المغربية",
        datePublished: "2026-03-29T15:00:00+00:00",
        dateModified: "2026-03-29T15:00:00+00:00",
        readTime: "15 دقيقة قراءة",
        content: `<h2>عراقة دوري أبطال إفريقيا</h2><p>الندية التكتيكية والشغف الجماهيري فـ مسابقة عصبة الأبطال.</p>`
    },
    "football-psychology-under-pressure": {
        slug: "football-psychology-under-pressure",
        tag: "علوم الرياضة",
        title: "الإعداد النفسي للاعبين: كيف يتم التعامل مع ضغط الجماهير واللحظات الحاسمة؟",
        description: "دراسة في علم النفس الرياضي ودوره في ثبات اللاعبين عند تسديد ضربات الجزاء والمباريات الإقصائية الكبرى.",
        img: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "تركيز ذهني للاعب كرة قدم قبل ضربة حاسمة",
        author: "حسام الدين الناصري",
        datePublished: "2026-03-30T10:00:00+00:00",
        dateModified: "2026-03-30T10:00:00+00:00",
        readTime: "12 دقيقة قراءة",
        content: `<h2>علم النفس الرياضي فـ كرة القدم</h2><p>التهيؤ الذهني والتعامل مع ضغط القمم الرياضية الكبرى.</p>`
    },
    "set-pieces-tactics-in-elite-football": {
        slug: "set-pieces-tactics-in-elite-football",
        tag: "تحليل فني",
        title: "الكرات الثابتة في كرة القدم الحديثة: السلاح السري لحسم البطولات المغلقة",
        description: "تحليل كروي يوضح كيف أصبحت الركنيات والضربات الحرة تُصمم بتكتيكات معقدة من قبل مدربين متخصصين.",
        img: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200",
        alt: "تنفيذ ضربة حرة مباشرة في مباراة كرة قدم",
        author: "فريق التحرير الرياضي",
        datePublished: "2026-03-31T14:30:00+00:00",
        dateModified: "2026-03-31T14:30:00+00:00",
        readTime: "13 دقيقة قراءة",
        content: `<h2>تكتيك الكرات الثابتة</h2><p>استغلال الركنيات والخطط التكتيكية المسبقة لحسم المباريات المغلقة.</p>`
    }
};

// ==========================================
// 🏠 HOMEPAGE SSR ENGINE (رندر جميع المقالات الـ 35)
// ==========================================
function renderHomePage() {
    const articlesList = Object.values(ARTICLES_DB).sort((a, b) => {
        return new Date(b.datePublished) - new Date(a.datePublished);
    });

    let articlesCardsHtml = '';
    articlesList.forEach(article => {
        articlesCardsHtml += `
        <article class="card">
            <img class="card-img" src="${article.img}" alt="${article.alt || article.title}" loading="lazy">
            <div class="card-body">
                <span class="tag">${article.tag}</span>
                <h2><a href="/article/${article.slug}">${article.title}</a></h2>
                <p>${article.description}</p>
                <a href="/article/${article.slug}" class="read-more">اقرأ المقال كاملاً ←</a>
            </div>
        </article>
        `;
    });

    let sidebarLatestHtml = '';
    articlesList.slice(0, 5).forEach(article => {
        sidebarLatestHtml += `<li><a href="/article/${article.slug}">${article.title}</a></li>`;
    });

    const uniqueTags = [...new Set(articlesList.map(a => a.tag))];
    let categoriesHtml = '';
    uniqueTags.forEach(tag => {
        categoriesHtml += `<li>${tag}</li>`;
    });

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hassani TV | أخبار وتحليلات كرة القدم العالمية والعربية</title>
    <meta name="description" content="Hassani TV - موقع رياضي متخصص في أخبار كرة القدم، الدوريات الأوروبية، البطولة المغربية، وتحليلات المباريات.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://hassani-tv.site/">

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6541657840288379" crossorigin="anonymous"></script>

    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0b1220;
            --card: #121a2b;
            --text: #f8fafc;
            --muted: #94a3b8;
            --primary: #00c853;
            --border: rgba(255,255,255,0.08);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Tajawal', sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.8;
        }
        a { color: inherit; text-decoration: none; }
        .container { width: min(1100px, 92%); margin: 0 auto; }

        /* Unified Navigation */
        header {
            position: sticky; top: 0; z-index: 50;
            background: rgba(11,18,32,0.92);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
        }
        .nav {
            display: flex; align-items: center; justify-content: space-between;
            min-height: 72px; flex-wrap: wrap; padding: 10px 0;
        }
        .logo { font-size: 24px; font-weight: 900; }
        .logo span { color: var(--primary); }
        .menu { display: flex; gap: 14px; flex-wrap: wrap; }
        .menu a { color: var(--muted); font-weight: 700; font-size: 14px; padding: 4px 0; transition: color 0.3s; }
        .menu a:hover, .menu a.active { color: var(--primary); }

        /* Hero Section */
        .hero {
            padding: 48px 0 32px;
            border-bottom: 1px solid var(--border);
            text-align: center;
        }
        .hero h1 { font-size: clamp(28px, 4vw, 42px); font-weight: 900; margin-bottom: 14px; color: #fff; }
        .hero p { color: var(--muted); max-width: 700px; margin: 0 auto; font-size: 18px; }

        /* Grid Layout */
        .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 32px 0 50px;
        }
        @media (min-width: 900px) {
            .grid { grid-template-columns: 1.8fr 1fr; }
        }

        /* Article Cards */
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 24px;
            transition: transform 0.3s, border-color 0.3s;
            display: flex;
            flex-direction: column;
        }
        @media (min-width: 600px) {
            .card { flex-direction: row; align-items: stretch; }
        }
        .card:hover { transform: translateY(-4px); border-color: rgba(0,200,83,.4); }
        
        .card-img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: #0f172a;
        }
        @media (min-width: 600px) {
            .card-img { width: 40%; height: auto; min-height: 200px; }
        }
        
        .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .tag {
            display: inline-block;
            background: rgba(0,200,83,.12);
            color: var(--primary);
            border: 1px solid rgba(0,200,83,.25);
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 800;
            margin-bottom: 12px;
            align-self: flex-start;
        }
        .card h2 { font-size: 20px; line-height: 1.5; margin-bottom: 10px; color: #fff; }
        .card p { color: var(--muted); font-size: 15px; margin-bottom: 14px; line-height: 1.6; }
        .read-more { color: var(--primary); font-weight: 700; font-size: 14px; margin-top: auto; }

        /* Sidebar */
        .side-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }
        .side-card h3 { margin-bottom: 16px; font-size: 18px; color: #fff; border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 6px; }
        .side-card ul { list-style: none; }
        .side-card li { padding: 12px 0; border-bottom: 1px solid var(--border); color: var(--muted); font-weight: 700; font-size: 15px; }
        .side-card li a { color: var(--muted); font-weight: 700; font-size: 15px; transition: color 0.2s; }
        .side-card li a:hover { color: var(--primary); }
        .side-card li:last-child { border-bottom: none; }

        /* Footer */
        footer {
            border-top: 1px solid var(--border);
            padding: 32px 0;
            color: var(--muted);
            text-align: center;
        }
        footer .links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }
        footer a { color: var(--muted); font-weight: 700; font-size: 14px; transition: color 0.2s; }
        footer a:hover { color: var(--primary); }

        /* Mobile Adjustments */
        @media (max-width: 700px) {
            .nav { flex-direction: column; gap: 12px; justify-content: center; }
            .menu { justify-content: center; gap: 12px; font-size: 13px; }
        }
    </style>
</head>
<body>
    <header>
        <div class="container nav">
            <a class="logo" href="/">Hassani<span>TV</span></a>
            <nav class="menu">
                <a class="active" href="/">الرئيسية</a>
                <a href="/site">المباريات</a>
                <a href="/about">من نحن</a>
                <a href="/contact">اتصل بنا</a>
                <a href="/privacy">سياسة الخصوصية</a>
                <a href="/terms">الشروط والأحكام</a>
            </nav>
        </div>
    </header>

    <section class="hero">
        <div class="container">
            <h1>أخبار كرة القدم وتحليلات رياضية معمقة</h1>
            <p>
                تابع آخر أخبار الدوريات الأوروبية، البطولة الاحترافية المغربية، والتحليلات التكتيكية الحصرية عبر محتوى رياضي موثوق ومحدث.
            </p>
        </div>
    </section>

    <main class="container">
        <div class="grid">
            <!-- Dynamic Articles Grid (Displays ALL 35 Articles) -->
            <section>
                ${articlesCardsHtml}
            </section>

            <!-- Dynamic Sidebar -->
            <aside>
                <div class="side-card">
                    <h3>أحدث المقالات</h3>
                    <ul>
                        ${sidebarLatestHtml}
                    </ul>
                </div>

                <div class="side-card">
                    <h3>تصنيفات</h3>
                    <ul>
                        ${categoriesHtml}
                    </ul>
                </div>
            </aside>
        </div>
    </main>

    <footer>
        <div class="container">
            <div class="links">
                <a href="/">الرئيسية</a>
                <a href="/site">المباريات</a>
                <a href="/about">من نحن</a>
                <a href="/contact">اتصل بنا</a>
                <a href="/privacy">سياسة الخصوصية</a>
                <a href="/terms">الشروط والأحكام</a>
            </div>
            <p>© 2026 Hassani TV — المحتوى الرياضي الموثوق</p>
        </div>
    </footer>
</body>
</html>`;
}

// ==========================================
// 🧠 SSR ENGINE FOR SINGLE ARTICLE PAGE
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
// 🌐 STRICT ROUTES & DYNAMIC HOMEPAGE (SSR 35 ARTICLES)
// ==========================================
app.get(['/', '/home'], (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(renderHomePage());
    } catch (e) {
        console.error("Error rendering homepage:", e);
        return res.status(500).send("Server Error");
    }
});

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