-- Seed Kurdish and Arabic CMS blocks for FAQ, steps, features, and testimonials.
-- Hero was already seeded for all locales in the initial admin CMS migration.

-- FAQ — Kurdish
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('faq', 'ku', '{"question":"ئامرازەکە سەلامەتە بۆ بەکارهێنان؟","answer":"هەموو ئامرازەکان لەگەڵ تەکنەلۆژیای دژە دۆزینەوە دەگەیەنرێن و پێش بڵاوکردنەوە تاقی دەکرێنەوە."}'::jsonb, 0, true),
    ('faq', 'ku', '{"question":"چۆن ئامرازەکە دامەزرێنم؟","answer":"دوای کڕین بەستەری داگرتن و ڕێنمایی هەنگاو بە هەنگاو وەردەگریت. زۆربەی بەکارهێنەران لە ٥ خولەکدا دەست دەکەن."}'::jsonb, 1, true),
    ('faq', 'ku', '{"question":"چ ڕێگایەکی پارەدان قبوڵ دەکەن؟","answer":"پارەدان بە دیناری عێراقی، کریپتۆ، پەیپاڵ و کارت قبوڵ دەکرێت. لە ڕێگەی واتساپ یان دیسکۆرد پەیوەندیمان پێوە بکە."}'::jsonb, 2, true),
    ('faq', 'ku', '{"question":"گەڕاندنەوەی پارە هەیە؟","answer":"ئەگەر بەرهەمەکە وەک ڕاگەیاندراو کار نەکرد و پشتگیری چارەسەر نەکرد، گەڕاندنەوەی تەواو یان جێگرتنەوە دەدەین."}'::jsonb, 3, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'faq' AND locale = 'ku' LIMIT 1);

-- FAQ — Arabic
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('faq', 'ar', '{"question":"هل البرنامج آمن للاستخدام؟","answer":"كل أداة تأتي بتقنية مكافحة الكشف ويتم اختبارها قبل الإصدار."}'::jsonb, 0, true),
    ('faq', 'ar', '{"question":"كيف أثبت البرنامج؟","answer":"بعد الشراء تحصل على رابط تحميل فوري ودليل خطوة بخطوة. معظم المستخدمين يبدأون خلال 5 دقائق."}'::jsonb, 1, true),
    ('faq', 'ar', '{"question":"ما طرق الدفع المقبولة؟","answer":"نقبل الدينار العراقي والعملات الرقمية وباي بال والبطاقات. تواصل معنا عبر واتساب أو ديسكورد."}'::jsonb, 2, true),
    ('faq', 'ar', '{"question":"هل تقدمون استرداداً؟","answer":"إذا لم يعمل المنتج كما هو موصوف ولم نتمكن من حله، نقدم استرداداً كاملاً أو بديلاً."}'::jsonb, 3, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'faq' AND locale = 'ar' LIMIT 1);

-- Steps — Kurdish
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('step', 'ku', '{"number":"01","title":"بەرهەم بگەڕێ","description":"پۆلەکان بگەڕێ — بایپاسی PUBG، یاری ستێم، پاکێج و زیاتر."}'::jsonb, 0, true),
    ('step', 'ku', '{"number":"02","title":"داواکاری بنێرە","description":"بەرهەم هەڵبژێرە و بە پارێزراوی لە ڕێگەی واتساپ یان دیسکۆرد پارە بدە."}'::jsonb, 1, true),
    ('step', 'ku', '{"number":"03","title":"گەیاندنی خێرا","description":"بەرهەمەکەت دەستبەجێ دوای پشتڕاستکردنەوەی پارە وەربگرە."}'::jsonb, 2, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'step' AND locale = 'ku' LIMIT 1);

-- Steps — Arabic
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('step', 'ar', '{"number":"01","title":"تصفح المنتجات","description":"استكشف الفئات — تجاوز PUBG، ألعاب ستيم، الحزم والمزيد."}'::jsonb, 0, true),
    ('step', 'ar', '{"number":"02","title":"قدّم طلبك","description":"اختر منتجك وادفع بأمان عبر واتساب أو ديسكورد."}'::jsonb, 1, true),
    ('step', 'ar', '{"number":"03","title":"توصيل فوري","description":"استلم منتجك فوراً بعد تأكيد الدفع."}'::jsonb, 2, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'step' AND locale = 'ar' LIMIT 1);

-- Features — Kurdish
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('feature', 'ku', '{"icon":"Zap","title":"گەیاندنی خێرا","description":"بەرهەمەکانت دەستبەجێ دوای کڕین وەربگرە."}'::jsonb, 0, true),
    ('feature', 'ku', '{"icon":"Shield","title":"کوالیتی پێشکەوتوو","description":"هەموو بەرهەمەکان پێش گەیاندن تاقی دەکرێنەوە."}'::jsonb, 1, true),
    ('feature', 'ku', '{"icon":"Headphones","title":"پشتگیری ٢٤/٧","description":"تیمی پشتگیریمان بەردەستە لە ڕێگەی دیسکۆرد و واتساپ."}'::jsonb, 2, true),
    ('feature', 'ku', '{"icon":"Sliders","title":"پارەدان بە دیناری عێراقی","description":"بە دیناری عێراقی پارە بدە بە ڕێگاکانی پارەدانی پارێزراو."}'::jsonb, 3, true),
    ('feature', 'ku', '{"icon":"RefreshCw","title":"هەژمارە پشتڕاستکراوەکان","description":"هەژمارەکانی ستیم پێش گەیاندن پشکنین دەکرێن."}'::jsonb, 4, true),
    ('feature', 'ku', '{"icon":"Layers","title":"هەڵبژاردەی فراوان","description":"لە بایپاسی PUBG تا هەژماری ستیم و پاکێجی داشکاندراو."}'::jsonb, 5, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'feature' AND locale = 'ku' LIMIT 1);

-- Features — Arabic
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('feature', 'ar', '{"icon":"Zap","title":"توصيل فوري","description":"احصل على منتجاتك فوراً بعد الشراء."}'::jsonb, 0, true),
    ('feature', 'ar', '{"icon":"Shield","title":"جودة مميزة","description":"جميع المنتجات مختبرة وموثقة قبل التوصيل."}'::jsonb, 1, true),
    ('feature', 'ar', '{"icon":"Headphones","title":"دعم ٢٤/٧","description":"فريق الدعم متاح على مدار الساعة عبر ديسكورد وواتساب."}'::jsonb, 2, true),
    ('feature', 'ar', '{"icon":"Sliders","title":"الدفع بالدينار العراقي","description":"ادفع بالدينار العراقي بخيارات دفع محلية آمنة."}'::jsonb, 3, true),
    ('feature', 'ar', '{"icon":"RefreshCw","title":"حسابات موثقة","description":"حسابات ستيم وحزم الألعاب تُفحص قبل التسليم."}'::jsonb, 4, true),
    ('feature', 'ar', '{"icon":"Layers","title":"تشكيلة واسعة","description":"من أدوات تجاوز PUBG إلى حسابات ستيم وحزم مخفضة."}'::jsonb, 5, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'feature' AND locale = 'ar' LIMIT 1);

-- Testimonials — Kurdish
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('testimonial', 'ku', '{"name":"Ahmed J.","handle":"کڕیاری پشتڕاستکراو","quote":"باشترین شوێن بۆ کڕینی ئامرازی یاری لە عێراق. گەیاندنی خێرا و پشتگیری زۆر یارمەتیدەر بوو.","initials":"AJ","tag":"کار دەکات لە نوێترین پەڕە","hasVideo":true}'::jsonb, 0, true),
    ('testimonial', 'ku', '{"name":"Sara M.","handle":"ئەندامی ئێلیت","quote":"هەژمارەکەم لە ٥ خولەکدا وەرگرت. کێشەی قفڵی ناوچەیی نەبوو و نرخەکە بێ ڕقیب بوو.","initials":"SM","tag":"کڕینی پشتڕاستکراو","hasVideo":false}'::jsonb, 1, true),
    ('testimonial', 'ku', '{"name":"Omar K.","handle":"کڕیاری پشتڕاستکراو","quote":"بایپاسی PUBG بە بێ کێشە کار دەکات. بۆ مانگێک بەکاری دەهێنم بە بێ هیچ کێشەیەک. پێشنیاری BEST STORE دەکەم.","initials":"OK","tag":"کار دەکات لە نوێترین پەڕە","hasVideo":true}'::jsonb, 2, true),
    ('testimonial', 'ku', '{"name":"Layla H.","handle":"کڕیاری پشتڕاستکراو","quote":"داشکاندنی نایاب لە پاکێجی یاری. زۆر پاشەکەوتم کرد بەراورد بە فرۆشگاکانی تر. پشتگیری دەستبەجێ وەڵامی دا لە واتساپ.","initials":"LH","tag":"کڕینی پشتڕاستکراو","hasVideo":false}'::jsonb, 3, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'testimonial' AND locale = 'ku' LIMIT 1);

-- Testimonials — Arabic
INSERT INTO public.cms_blocks (section, locale, payload, sort_order, active)
SELECT * FROM (
  VALUES
    ('testimonial', 'ar', '{"name":"Ahmed J.","handle":"عميل موثق","quote":"أفضل مكان لشراء أدوات الألعاب في العراق. توصيل سريع ودعم مفيد جداً.","initials":"AJ","tag":"يعمل على أحدث تحديث","hasVideo":true}'::jsonb, 0, true),
    ('testimonial', 'ar', '{"name":"Sara M.","handle":"عضو مميز","quote":"حصلت على حساب ستيم خلال 5 دقائق. لا مشاكل في القفل الإقليمي والسعر لا يُنافس.","initials":"SM","tag":"شراء موثق","hasVideo":false}'::jsonb, 1, true),
    ('testimonial', 'ar', '{"name":"Omar K.","handle":"عميل موثق","quote":"تجاوز PUBG يعمل بسلاسة. أستخدمه منذ شهر بدون أي مشاكل. أنصح بشدة بـ BEST STORE.","initials":"OK","tag":"يعمل على أحدث تحديث","hasVideo":true}'::jsonb, 2, true),
    ('testimonial', 'ar', '{"name":"Layla H.","handle":"عميل موثق","quote":"عروض رائعة على حزم الألعاب. وفرت الكثير مقارنة بالمتاجر الأخرى. الدعم رد فوراً على واتساب.","initials":"LH","tag":"شراء موثق","hasVideo":false}'::jsonb, 3, true)
) AS v(section, locale, payload, sort_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.cms_blocks WHERE section = 'testimonial' AND locale = 'ar' LIMIT 1);
