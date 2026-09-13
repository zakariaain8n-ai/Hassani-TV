require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zikopato2010@tv';
const ADSENSE_PUB_ID = 'ca-pub-6541657840288379';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 📚 DATABASE OF FULL ARTICLES (SEO ENHANCED)
// ==========================================
const ARTICLES_DB = {
    "1": {
        id: "1",
        slug: "real-madrid-midfield-analysis",
        tag: "دوري أبطال أوروبا",
        title: "ريال مدريد وسط الميدان: قراءة تكتيكية شاملة قبل مواجهات دوري الأبطال",
        description: "تحليل تكتيكي شامل لخط وسط ريال مدريد قبل مباريات دوري أبطال أوروبا، وكيف يؤثر التوازن الفني على حسم البطولات القارية.",
        img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
        alt: "لاعبو خط وسط ريال مدريد في دوري أبطال أوروبا",
        date: "2026-09-10",
        readTime: "10 دقائق قراءة",
        content: `
            <p>يمثل خط الوسط في كرة القدم الحديثة العمود الفقري لأي مشروع فني ناجح، ويدرك النادي الملكي هذه المعادلة أكثر من غيره، حيث بُنيت أمجاده الأوروبية خلال العقد الأخير على قاعدة صلبة في المنطقة الوسطى من الملعب. اليوم، ومع دخول ريال مدريد مرحلة جديدة من مشروعه، يبرز خط الوسط كنقطة يجب مراقبتها بعمق قبل مواجهات دوري أبطال أوروبا الحاسمة.</p>
            <h2>لماذا يعتبر وسط الميدان مفتاح الليالي الأوروبية؟</h2>
            <p>على عكس البطولات المحلية التي يمكن فيها الاعتماد على الجودة الفردية لحسم المباريات، تفرض المواجهات القارية على الفرق التحكم في الإيقاع وإدارة اللحظات الحاسمة بذكاء بالغ. في هذا السياق، يصبح وسط الميدان هو المنطقة التي يُقرر فيها من يفرض إيقاعه، ومن يُجبر على اللعب بأسلوب الخصم.</p>
            <p>ريال مدريد، عبر تاريخه الحديث، أثبت أن السيطرة على الوسط لا تعني بالضرورة الاستحواذ الكمي على الكرة، بل القدرة على استرجاعها بسرعة في المناطق المتقدمة، والتحول اللحظي بين الدفاع والهجوم بأقل عدد من التمريرات.</p>
            <div class="ad-box"><ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="${ADSENSE_PUB_ID}" data-ad-slot="1234567895"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>
            <h2>البنية المثالية للثلاثي الوسط</h2>
            <p>تعتمد المدرسة الحديثة في بناء خط الوسط على مبدأ التكامل بين ثلاثة أدوار جوهرية:</p>
            <ul>
                <li><strong>لاعب الارتكاز الدفاعي:</strong> مسؤول عن حماية المنطقة أمام الدفاع، وقطع التمريرات، وبدء الهجمات من العمق.</li>
                <li><strong>الوسط المتحكم في الإيقاع:</strong> يمتلك رؤية عالية وقدرة على توزيع اللعب بذكاء، مع الحفاظ على التوازن بين التمرير الآمن والتمريرات الحاسمة.</li>
                <li><strong>الوسط الصانع أو المهاجم:</strong> يوفر الحلقة الأخيرة قبل الهجوم، سواء عبر التمريرات المفتاحية أو التسديدات من خارج المنطقة.</li>
            </ul>
            <blockquote>القوة الحقيقية لخط الوسط ليست في جودة كل لاعب على حدة، بل في الطريقة التي يكمل بها الثلاثي بعضهم البعض داخل المستطيل الأخضر.</blockquote>
            <h2>التحديات الحالية أمام النادي الملكي</h2>
            <p>يواجه ريال مدريد في المرحلة الحالية عدة تحديات مرتبطة بخط الوسط، أبرزها إعادة بناء الهوية الفنية بعد رحيل عناصر أساسية شكلت الذاكرة الجماعية للفريق. الانتقال من جيل إلى آخر لا يتم بمجرد التعاقدات، بل يحتاج وقتا لبناء التفاهم والانسجام.</p>
            <h3>1. إدارة الأحمال البدنية</h3>
            <p>مع كثافة المباريات بين الليغا ودوري الأبطال وكأس الملك، يصبح توزيع الدقائق بين لاعبي الوسط عاملا حاسما لتفادي الإرهاق أو الإصابات. الجهاز الفني مطالب بإيجاد التوازن بين الاعتماد على الأساسيين وإشراك البدلاء في المباريات المناسبة.</p>
            <h3>2. الانتقال من الدفاع إلى الهجوم</h3>
            <p>في المباريات الأوروبية، تُحسم الأمور غالبا في اللحظات الأولى بعد استرجاع الكرة. لاعبو الوسط في ريال مدريد مطالبون بتنفيذ التحولات السريعة بدقة عالية، وتزويد المهاجمين بالكرات في التوقيت المناسب.</p>
            <h3>3. الضغط العالي وتحمل المسؤولية</h3>
            <p>الفرق الأوروبية الكبرى تعتمد على الضغط في نصف الملعب الهجومي، مما يفرض على وسط ريال مدريد إيجاد حلول ذكية للخروج بالكرة تحت الضغط، سواء عبر التمريرات القصيرة أو التحرك بدون كرة لخلق زوايا التمرير.</p>
            <h2>ما الذي يجب مراقبته في المباريات القادمة؟</h2>
            <p>هناك عدة مؤشرات تكشف مستوى خط الوسط في أي مباراة كبرى:</p>
            <ul>
                <li>عدد الاستخلاصات الناجحة في المناطق المتقدمة.</li>
                <li>نسبة نجاح التمريرات في الثلث الأخير من الملعب.</li>
                <li>سرعة التحول من الدفاع إلى الهجوم بعد استرجاع الكرة.</li>
                <li>عدد التدخلات التي أدت إلى إيقاف هجمات خطيرة للخصم.</li>
            </ul>
            <p>في النهاية، تبقى قوة ريال مدريد الحقيقية في قدرته التاريخية على الظهور في اللحظات الحاسمة. لكن هذا الظهور لا يأتي من فراغ، بل يبنى على أساس متين في وسط الميدان، حيث تبدأ فكرة اللقب وتنتهي في الوقت نفسه.</p>
        `
    },
    "2": {
        id: "2",
        slug: "derby-casablanca-wydad-raja",
        tag: "البطولة الاحترافية",
        title: "الديربي البيضاوي بين الوداد والرجاء: تحليل تاريخي ورياضي شامل",
        description: "تحليل شامل للديربي البيضاوي بين الوداد والرجاء، الأبعاد التاريخية والتكتيكية، وتأثير المواجهة على سباق لقب البطولة الاحترافية المغربية.",
        img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
        alt: "جماهير الوداد والرجاء في الديربي البيضاوي",
        date: "2026-09-09",
        readTime: "9 دقائق قراءة",
        content: `
            <p>يعتبر الديربي البيضاوي بين الوداد الرياضي والرجاء البيضاوي واحدا من أعرق المواجهات في كرة القدم الإفريقية والعربية، وليس مجرد مباراة تنافسية في البطولة الاحترافية المغربية. هذه المواجهة تحمل بعدا تاريخيا واجتماعيا وثقافيا يتجاوز حدود الملعب.</p>
            <h2>البعد التاريخي للديربي</h2>
            <p>تعود جذور المنافسة بين الفريقين إلى عقود من الزمن، حيث نشأ كل نادٍ في سياق اجتماعي ورياضي خاص، ليصبح مع مرور الوقت أكثر من مجرد كيان رياضي: كل فريق يمثل هوية ومدرسة كروية وقاعدة جماهيرية عريضة داخل المغرب وخارجه.</p>
            <p>هذا التراكم التاريخي هو ما يمنح كل مواجهة بين الوداد والرجاء طابعا خاصا، حيث يتجاوز التنافس النقاط الثلاث ليصبح صراعا على الرمزية والمكانة.</p>
            <div class="ad-box"><ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="${ADSENSE_PUB_ID}" data-ad-slot="1234567895"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>
            <h2>الأبعاد الرياضية للمواجهة</h2>
            <p>على المستوى الفني، يعرف الديربي البيضاوي مستويات عالية من التنافسية، خاصة في المواسم التي يتقارب فيها الفريقان في سباق اللقب. عندما تتقلص الفوارق بين المرشحين، تصبح كل نقطة حاسمة، ويكتسب الديربي وزنا مضاعفا في تحديد مسار الموسم.</p>
            <h3>1. الضغط النفسي والذهني</h3>
            <p>لاعبو الفريقين يدخلون هذه المواجهة تحت ضغط جماهيري وإعلامي كبير. القدرة على التعامل مع هذا الضغط والتركيز على الجانب الفني هي أحد أهم مفاتيح الفوز.</p>
            <h3>2. القراءة التكتيكية للمدربين</h3>
            <p>الديربي غالبا ما يكون مباراة تكتيكية بامتياز. المدرب الذي يقرأ نقاط قوة خصمه ويوظف نقاط ضعفه يمتلك أفضلية واضحة. اختيار التشكيلة، طريقة اللعب، والتغييرات في الشوط الثاني، كلها عوامل حاسمة.</p>
            <h3>3. اللحظات الحاسمة</h3>
            <p>في هذا النوع من المباريات، لحظة واحدة قد تحدد النتيجة: كرة ثابتة، خطأ فردي، أو لمسة عبقرية من لاعب مبدع. لذلك، يعتمد النجاح في الديربي على التركيز طوال 90 دقيقة دون أي هفوة.</p>
            <h2>تأثير الديربي على سباق اللقب</h2>
            <p>عندما يكون الفريقان في سباق مباشر على البطولة، يصبح الديربي أكثر من مجرد مباراة عادية:</p>
            <ul>
                <li>الفوز يعطي دفعة معنوية هائلة للفريق الفائز في باقي مباريات الموسم.</li>
                <li>الخسارة قد تدخل الفريق في دوامة نفسية صعبة.</li>
                <li>التعادل يترك الأمور مفتوحة، لكنه غالبا يخدم الفريق الملاحق.</li>
            </ul>
            <h2>البعد الجماهيري</h2>
            <p>لا يمكن الحديث عن الديربي البيضاوي دون الإشارة إلى الجماهير، التي تعتبر عنصرا أساسيا في صناعة أجواء هذه المباراة. حضور الجماهير في المدرجات يخلق طاقة استثنائية تؤثر مباشرة على أداء اللاعبين.</p>
        `
    },
    "3": {
        id: "3",
        slug: "manchester-city-defensive-balance",
        tag: "بريميرليغ",
        title: "مانشستر سيتي وضبط الإيقاع الدفاعي: قراءة في تفاصيل التوازن التكتيكي",
        description: "دراسة تكتيكية لأسلوب مانشستر سيتي الدفاعي وكيف يحافظ غوارديولا على التوازن بين الاستحواذ الهجومي والصلابة أمام المرتدات.",
        img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
        alt: "تكتيك مانشستر سيتي في الدوري الإنجليزي الممتاز",
        date: "2026-09-08",
        readTime: "9 دقائق قراءة",
        content: `
            <p>لطالما اشتهر مانشستر سيتي بأسلوبه الهجومي الجميل والسيطرة الكاملة على المباريات عبر الاستحواذ العالي والتمرير المستمر. لكن خلف هذا الأسلوب الهجومي المميز، يكمن سر النجاح الحقيقي في التوازن الدفاعي المدروس بعناية فائقة.</p>
            <h2>الأسلوب الهجومي وتحدياته الدفاعية</h2>
            <p>الفرق التي تعتمد على الاستحواذ العالي والدفاع المتقدم في نصف الملعب المنافس، تواجه دائما تحديا مزدوجا: كيف تحافظ على الضغط الهجومي دون أن تترك مساحات خلفها يمكن للخصوم استغلالها في الهجمات المرتدة؟</p>
            <p>مانشستر سيتي، على مدار المواسم الأخيرة، طور منظومة دفاعية معقدة تعتمد على عدة مبادئ متكاملة:</p>
            <div class="ad-box"><ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="${ADSENSE_PUB_ID}" data-ad-slot="1234567895"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>
            <h3>1. الضغط المنسق (Coordinated Pressing)</h3>
            <p>عندما يفقد الفريق الكرة، لا يتراجع اللاعبون فورا إلى الخلف، بل يبدؤون في الضغط الجماعي على حامل الكرة والخيارات القريبة منه. هذا الضغط يهدف إلى استرجاع الكرة في أقصر وقت ممكن.</p>
            <h3>2. التمركز الذكي للخط الخلفي</h3>
            <p>المدافعون في سيتي يتموقعون بشكل ذكي لتغطية المساحات وليس فقط لمتابعة اللاعبين. هذا يتطلب قراءة ممتازة للعبة وتفاهما عاليا بين المدافعين وحارس المرمى.</p>
            <h3>3. دور لاعب الارتكاز</h3>
            <p>يلعب لاعب الارتكاز دورا محوريا في حماية المنطقة أمام الدفاع، خاصة عندما يتقدم الظهيران للمشاركة في الهجوم. غيابه أو ضعف أدائه يترك ثغرة كبيرة يمكن أن تكون قاتلة.</p>
        `
    },
    "4": {
        id: "4",
        slug: "transfer-market-strategies",
        tag: "سوق الانتقالات",
        title: "كيف تبني الأندية الكبرى استراتيجيات التعاقدات؟ دليل شامل",
        meta: "مقال معمق · 11 دقائق قراءة",
        description: "دليل شامل يشرح كيف تخطط الأندية العالمية لصفقات الانتقالات عبر التحليل الإحصائي، الكشافة، والتقييم المالي والتكتيكي للاعبين.",
        img: "https://images.unsplash.com/photo-1431324155629-1a6deb1deb8d?auto=format&fit=crop&w=1200&q=80",
        alt: "استراتيجيات سوق الانتقالات والتعاقدات في كرة القدم",
        date: "2026-09-07",
        readTime: "11 دقيقة قراءة",
        content: `
            <p>لم يعد سوق الانتقالات في كرة القدم الحديثة مجرد عمليات بيع وشراء عشوائية، بل تحول إلى علم قائم بذاته يعتمد على البيانات والتحليل العميق والتخطيط طويل المدى. الأندية الكبرى في العالم تستثمر ملايين اليوروهات ليس فقط في التعاقدات، بل في المنظومات التي تحدد هذه التعاقدات.</p>
            <h2>المرحلة الأولى: تحديد الاحتياجات</h2>
            <p>قبل الحديث عن أسماء لاعبين، تبدأ الأندية الكبرى بتحليل شامل لتشكيلتها الحالية: المراكز التي تعاني من ضعف، الأعمار، والقدرات المفقودة.</p>
            <div class="ad-box"><ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="${ADSENSE_PUB_ID}" data-ad-slot="1234567895"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>
            <h2>المرحلة الثانية: البيانات المتطورة والأرقام</h2>
            <p>الأندية الكبرى تعتمد اليوم على مقاييس متطورة مثل xG (الأهداف المتوقعة) وxA (التمريرات الحاسمة المتوقعة) لمراقبة القيمة الحقيقية لكل لاعب قبل تقديم أي عرض رسمي.</p>
        `
    },
    "5": {
        id: "5",
        slug: "psg-champions-league-ambition",
        tag: "ليغ 1",
        title: "باريس سان جيرمان بين السيطرة المحلية والطموح الأوروبي",
        description: "قراءة في مشروع باريس سان جيرمان بين التفوق المحلي في الدوري الفرنسي والتحديات الذهنية والتكتيكية في دوري أبطال أوروبا.",
        img: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80",
        alt: "نادي باريس سان جيرمان ودوري أبطال أوروبا",
        date: "2026-09-06",
        readTime: "8 دقائق قراءة",
        content: `
            <p>يمثل باريس سان جيرمان حالة فريدة في كرة القدم الأوروبية، فهو الفريق الذي يهيمن بشكل شبه مطلق على البطولة المحلية، لكنه يعاني من صعوبة في تحويل هذه الهيمنة إلى ألقاب قارية كبرى.</p>
            <h2>الهيمنة على ليغ 1 والتحدي القاري</h2>
            <p>الفارق الكبير في الميزانية والعمق التكتيكي يجعل الفريق يسيطر محلياً، غير أن أبطال أوروبا يتطلب انضباطاً جماعياً وعقلية رابحة تحت أقصى درجات الضغط.</p>
        `
    },
    "6": {
        id: "6",
        slug: "bayern-munich-sustainability",
        tag: "بوندسليغا",
        title: "بايرن ميونخ: قوة الاستمرارية في وجه التحديات الجديدة",
        description: "كيف يحافظ بايرن ميونخ على هيمنته واستقراره الرياضي في الدوري الألماني مع استمرار المنافسة الأوروبية الصارمة.",
        img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
        alt: "بايرن ميونخ والدوري الألماني",
        date: "2026-09-05",
        readTime: "8 دقائق قراءة",
        content: `
            <p>يظل بايرن ميونخ رمزا للاستمرارية والنجاح في كرة القدم الأوروبية. النادي البافاري بنى إمبراطورية كروية على مدى عقود عبر مزج ذكي بين التقاليد والحداثة والسياسة المالية الصارمة.</p>
            <h2>عوامل التميز البافاري</h2>
            <p>إدارة رياضية محترفة، أكاديمية شبان قوية، وتوازن مالي يضمن الاستقرار والقدرة على تجديد الدماء دون ديون ضخمة.</p>
        `
    },
    "7": {
        id: "7",
        slug: "mohammed-vi-academy-moroccan-football",
        tag: "الكرة المغربية",
        title: "أكاديمية محمد السادس: كيف تحولت إلى مصنع للنجوم ومستقبل الكرة المغربية؟",
        description: "تقرير خاص حول دور أكاديمية محمد السادس لكرة القدم فـ صناعة نجوم المنتخب المغربي وتطوير مستوى البطولة الاحترافية والمواهب الشابة.",
        img: "https://images.unsplash.com/photo-1518605368461-1eb25bc4390b?auto=format&fit=crop&w=1200&q=80",
        alt: "أكاديمية محمد السادس لكرة القدم المغرب",
        date: "2026-09-04",
        readTime: "12 دقيقة قراءة",
        content: `
            <p>عندما نتحدث عن الإنجاز التاريخي للمنتخب المغربي في كأس العالم 2022، لا يمكننا أن نتجاهل الأساس المتين الذي بُني عليه هذا النجاح. أكاديمية محمد السادس لكرة القدم لم تعد مجرد مشروع رياضي محلي، بل أصبحت اليوم واحدة من أبرز المدارس الكروية في القارة الإفريقية.</p>
            <h2>رؤية ملكية لبناء جيل ذهبي</h2>
            <p>تأسست الأكاديمية بهدف واضح: اكتشاف المواهب الشابة في مختلف ربوع المملكة، وتوفير بيئة احترافية تضاهي المعايير الأوروبية من حيث البنية التحتية والـتأطير المزدوج (الرياضي والدراسي).</p>
            <p>نجوم مثل النصيري، أكرد، وأوناحي خرجوا من هذا الصرح ليتألقوا فـ أكبر الدوريات الأوروبية.</p>
        `
    },
    "8": {
        id: "8",
        slug: "fullback-revolution-modern-football",
        tag: "تحليل تكتيكي",
        title: "ثورة الأظهرة في كرة القدم: من مدافعين تقليديين إلى صناع لعب حاسمين",
        description: "تحليل تكتيكي يوضح كيف تطور دور الظهير العصري فـ كرة القدم من التغطية الدفاعية إلى صناعة اللعب وبناء الهجمات.",
        img: "https://images.unsplash.com/photo-1553775282-20af80779df7?auto=format&fit=crop&w=1200&q=80",
        alt: "تطور مركز الظهير في كرة القدم الحديثة",
        date: "2026-09-03",
        readTime: "10 دقائق قراءة",
        content: `
            <p>إذا عدنا بالزمن إلى الوراء لعشرين عاماً، كان الدور الأساسي للظهير هو الدفاع بحت. لكن اليوم فـ أندية مثل ليفربول ومانشستر سيتي، تجد أن الظهير هو المحرك الأساسي وصانع الألعاب الرئيسي.</p>
            <h2>الظهير الوهمي والظهير الجناح</h2>
            <p>تنوعت الأدوار بين الدخول إلى عمق الوسط كـ Inverted Fullback أو قطع الخط الجانبي كـ Wing-back لتقديم العرضيات التكتيكية المتقنة.</p>
        `
    },
    "9": {
        id: "9",
        slug: "var-technology-football-impact",
        tag: "قضايا رياضية",
        title: "تقنية الـ VAR بعد سنوات من التطبيق: هل أنقذت العدالة أم قتلت متعة الاحتفال؟",
        description: "مقال نقدي يناقش تقنية حكم الفيديو المساعد VAR، تأثيرها على العدالة الكروية وقرارات الحكام، وإلغاء الاحتفالات العفوية بالأهداف.",
        img: "https://images.unsplash.com/photo-1521579450373-c40ec4640103?auto=format&fit=crop&w=1200&q=80",
        alt: "تقنية الفار VAR في المباريات",
        date: "2026-09-02",
        readTime: "9 دقائق قراءة",
        content: `
            <p>عندما تم الإعلان عن إدخال تقنية VAR، قيل لنا إن الأخطاء الفادحة ستختفي. ورغم ارتفاع نسبة القرارات الصحيحة إلى 98%، إلا أن الجدل يزداد حول توقف اللعب وضياع شغف الفرحة الفورية بالهدف.</p>
            <h2>تطوير التسلل شبه الآلي SAOT</h2>
            <p>التقنيات المتقدمة تسعى لتسريع اتخاذ القرار والحد من التوقفات الطويلة التي تزعج الجماهير واللاعبين فـ الملعب.</p>
        `
    },
    "10": {
        id: "10",
        slug: "number-6-midfielder-tactics",
        tag: "تحليل فني",
        title: "الرقم 6 المعاصر: الجندي المجهول الذي تُبنى عليه خطط كبار أوروبا",
        description: "قراءة فنية فـ أهمية لاعب الارتكاز الدفاعي الرقم 6، وكيف يحدد توازن الفرق واستخلاص الكرات وبناء الهجمات تحت الضغط.",
        img: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1200&q=80",
        alt: "لاعب الارتكاز الرقم 6 في كرة القدم",
        date: "2026-09-01",
        readTime: "11 دقيقة قراءة",
        content: `
            <p>يقف لاعب الارتكاز الدفاعي فـ الظل بعيداً عن الأضواء، لكنه القطعة المحورية فـ رقعة الشطرنج التكتيكية لأي مدرب عصري. السيطرة على المباريات تبدأ من أقدام الرقم 6.</p>
            <h2>الربط بين الخطوط والمسح الميداني</h2>
            <p>القدرة على المسح المستمر (Scanning) ومقاومة الضغط هي الخصائص التي تصنع فارق الأسعار الخيالية فـ سوق الانتقالات لهذا المركز.</p>
        `
    }
};

// Helper function to render Server-Side HTML for Article (SSR)
function renderArticlePage(article) {
    const canonicalUrl = `https://hassani-tv.site/article?id=${article.id}`;
    
    // Schema.org Article JSON-LD
    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.description,
        "image": [article.img],
        "datePublished": article.date,
        "dateModified": article.date,
        "author": {
            "@type": "Organization",
            "name": "Hassani TV",
            "url": "https://hassani-tv.site"
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
    <meta name="keywords" content="${article.tag}, كرة القدم, تحليلات رياضية, Hassani TV, اخبار الكرة">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.description}">
    <meta property="og:image" content="${article.img}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${article.title}">
    <meta name="twitter:description" content="${article.description}">
    <meta name="twitter:image" content="${article.img}">

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">${jsonLd}</script>

    <!-- Google AdSense Auto Script -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}" crossorigin="anonymous"></script>

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
        body { font-family: 'Tajawal', sans-serif; background: var(--bg); color: var(--text); line-height: 2; }
        a { color: inherit; text-decoration: none; }
        .container { width: min(860px, 92%); margin: 0 auto; }
        header {
            position: sticky; top: 0; z-index: 50;
            background: rgba(11,18,32,0.92);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
        }
        .nav {
            width: min(1100px, 92%); margin: 0 auto;
            display: flex; align-items: center; justify-content: space-between;
            min-height: 72px;
        }
        .logo { font-size: 24px; font-weight: 900; }
        .logo span { color: var(--primary); }
        .menu { display: flex; gap: 14px; flex-wrap: wrap; }
        .menu a { color: var(--muted); font-weight: 700; font-size: 13px; }
        .menu a:hover, .menu a.active { color: var(--primary); }
        .article-wrap { padding: 36px 0 60px; }
        .tag {
            display: inline-block;
            background: rgba(0,200,83,.12);
            color: var(--primary);
            border: 1px solid rgba(0,200,83,.25);
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 800;
            margin-bottom: 14px;
        }
        h1 { font-size: clamp(24px, 4vw, 38px); line-height: 1.4; margin-bottom: 12px; color: #ffffff; }
        .meta { color: #64748b; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
        .hero-img {
            width: 100%;
            height: 340px;
            object-fit: cover;
            border-radius: 18px;
            margin: 0 0 24px;
            border: 1px solid var(--border);
            background: #0f172a;
        }
        .ad-box {
            margin: 24px 0;
            min-height: 90px;
            border: 1px dashed var(--border);
            border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            color: var(--muted); font-size: 12px; font-weight: 700;
            background: rgba(255,255,255,0.02);
            overflow: hidden;
        }
        .content {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 28px;
        }
        .content p { color: #dbe4f0; margin-bottom: 18px; font-size: 18px; }
        .content h2 { font-size: 24px; margin: 26px 0 12px; color: #ffffff; }
        .content h3 { font-size: 20px; margin: 22px 0 10px; color: #e2e8f0; }
        .content ul { padding-right: 22px; margin-bottom: 18px; }
        .content li { color: #dbe4f0; margin-bottom: 10px; font-size: 17px; }
        .content blockquote {
            border-right: 4px solid var(--primary);
            padding: 14px 20px;
            margin: 20px 0;
            background: rgba(0,200,83,.06);
            border-radius: 8px;
            color: #cfe9d9;
            font-size: 18px;
            font-weight: 700;
        }
        .back { display: inline-block; margin-top: 24px; color: var(--primary); font-weight: 800; font-size: 15px; }
        footer {
            border-top: 1px solid var(--border);
            padding: 28px 0 40px;
            color: var(--muted);
            text-align: center;
        }
        footer .links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
        footer a { color: var(--muted); font-weight: 700; font-size: 14px; }
        footer a:hover { color: var(--primary); }
        @media (max-width: 700px) {
            .menu { display: none; }
            .hero-img { height: 210px; }
        }
    </style>
</head>
<body>
    <header>
        <div class="nav">
            <a class="logo" href="/">Hassani<span>TV</span></a>
            <nav class="menu">
                <a href="/">Home (الرئيسية)</a>
                <a href="/site">Matches (المباريات)</a>
                <a href="/about">About Us</a>
                <a href="/contact">Contact Us</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms & Conditions</a>
            </nav>
        </div>
    </header>

    <main class="container article-wrap">
        <div class="tag">${article.tag}</div>
        <h1>${article.title}</h1>
        <div class="meta">Hassani TV · ${article.date} · ${article.readTime}</div>
        <img class="hero-img" src="${article.img}" alt="${article.alt}">

        <div class="ad-box">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="${ADSENSE_PUB_ID}"
                 data-ad-slot="1234567893"
                 data-ad-format="auto"
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
                 data-ad-slot="1234567894"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>

        <a class="back" href="/">← العودة إلى قائمة الأخبار والمقالات</a>
    </main>

    <footer>
        <div class="links">
            <a href="/">Home</a>
            <a href="/site">Matches</a>
            <a href="/about">About Us</a>
            <a href="/contact">Contact Us</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms & Conditions</a>
        </div>
        <p>© 2026 Hassani TV — كافة الحقوق محفوظة للمحتوى الرياضي العربي</p>
    </footer>
</body>
</html>`;
}

// ==========================================
// ⚽ STREAMS DATABASE & MOCK CACHE
// ==========================================
const STREAMS_FILE = path.join(__dirname, 'streams.json');

function loadSavedStreams() {
    try {
        if (fs.existsSync(STREAMS_FILE)) {
            const raw = fs.readFileSync(STREAMS_FILE, 'utf8');
            return JSON.parse(raw) || {};
        }
    } catch (e) { console.error(e.message); }
    return {};
}

function saveStreamsToFile(data) {
    try { fs.writeFileSync(STREAMS_FILE, JSON.stringify(data, null, 2), 'utf8'); } 
    catch (e) { console.error(e.message); }
}

let streamsDatabase = loadSavedStreams();
const CACHE_DURATION = 10 * 60 * 1000;
let cache = { today: { t: 0, data: null }, tomorrow: { t: 0, data: null }, yesterday: { t: 0, data: null } };
let API_BLOCKED = false;

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

function getMockData() {
    return [
        { id: "101", league: 'Serie A', home: 'Lecce', homeLogo: 'https://media.api-sports.io/football/teams/887.png', away: 'AS Roma', awayLogo: 'https://media.api-sports.io/football/teams/497.png', mainText: '0 - 3', pillText: "مباشر", type: 'live', order: 1, ts: Date.now(), streams: streamsDatabase["101"] || [] },
        { id: "102", league: 'La Liga', home: 'Real Madrid', homeLogo: 'https://media.api-sports.io/football/teams/541.png', away: 'Barcelona', awayLogo: 'https://media.api-sports.io/football/teams/529.png', mainText: '04:00 PM', pillText: 'بعد قليل 25m', type: 'upcoming', order: 2, ts: Date.now() + 1, streams: streamsDatabase["102"] || [] }
    ];
}

// ==========================================
// 📡 API ENDPOINTS
// ==========================================
app.get('/api/matches', async (req, res) => {
    const day = req.query.day || 'today';
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

    if (API_BLOCKED || !API_KEY) {
        const payload = { success: true, isMock: true, day, date, count: getMockData().length, matches: getMockData() };
        cache[day] = { t: Date.now(), data: payload };
        return res.json(payload);
    }

    try {
        const response = await axios.get(`https://v3.football.api-sports.io/fixtures?date=${date}`, { headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }, timeout: 5000 });
        if (response.data.errors && Object.keys(response.data.errors).length) { API_BLOCKED = true; throw new Error('Limit'); }
        let list = filterMatches(response.data.response || []);
        if (!list.length) list = getMockData();
        const payload = { success: true, isMock: false, day, date, count: list.length, matches: list };
        cache[day] = { t: Date.now(), data: payload };
        return res.json(payload);
    } catch (e) {
        API_BLOCKED = true;
        const payload = { success: true, isMock: true, day, date, count: getMockData().length, matches: getMockData() };
        cache[day] = { t: Date.now(), data: payload };
        return res.json(payload);
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

    if (!foundMatch) {
        const mock = getMockData().find(x => String(x.id) === matchId);
        if (mock) foundMatch = mock;
    }

    if (foundMatch) {
        foundMatch.streams = streamsDatabase[matchId] || [];
        return res.json({ success: true, match: foundMatch });
    }
    return res.status(404).json({ success: false, error: 'Match not found' });
});

app.post('/api/admin/streams', (req, res) => {
    const { matchId, streams } = req.body;
    streamsDatabase[String(matchId)] = streams;
    saveStreamsToFile(streamsDatabase);
    cache = { today: { t: 0, data: null }, tomorrow: { t: 0, data: null }, yesterday: { t: 0, data: null } };
    return res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
    if (req.body?.password === ADMIN_PASSWORD) return res.json({ success: true });
    return res.status(401).json({ success: false });
});

// ==========================================
// 🌐 SERVER-RENDERED ROUTES (SSR FOR SEO)
// ==========================================

// Homepage
app.get(['/', '/home'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dynamic Article SSR Engine (Supports /article?id=X and /article/:id)
app.get(['/article', '/article/:id'], (req, res) => {
    const articleId = String(req.params.id || req.query.id || '1');
    const article = ARTICLES_DB[articleId] || ARTICLES_DB['1'];
    
    // Render Pure Dynamic HTML
    const htmlPage = renderArticlePage(article);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(htmlPage);
});

// Legal Pages
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

// Sports Application Routes
app.get('/site', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'site.html'));
});

app.get('/watch', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'watch.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch-all Redirect to Home
app.use((req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => console.log(`🚀 Hassani TV Running on port ${PORT}`));