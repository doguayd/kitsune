/**
 * Kitsune — Placement Test Question Bank
 * 5 questions per CEFR level (A1→C2) × 9 languages = 270 questions
 * Format: { id, level, q, opts:[4], c:correctIndex }
 */

export const QUESTIONS = {

  // ─── English ─────────────────────────────────────────────────────────────
  en: [
    // A1
    { id:'en_a1_1', level:'A1', q:'Which article is correct? ___ apple.', opts:['a','an','the','—'], c:1 },
    { id:'en_a1_2', level:'A1', q:'She ___ a doctor.', opts:['am','is','are','be'], c:1 },
    { id:'en_a1_3', level:'A1', q:'How do you say "merhaba" in English?', opts:['Goodbye','Hello','Please','Thank you'], c:1 },
    { id:'en_a1_4', level:'A1', q:'I have ___ brothers: Ali and Veli.', opts:['one','two','three','four'], c:1 },
    { id:'en_a1_5', level:'A1', q:'What is the opposite of "big"?', opts:['tall','fast','small','old'], c:2 },
    // A2
    { id:'en_a2_1', level:'A2', q:'Yesterday she ___ to the market.', opts:['go','goes','went','gone'], c:2 },
    { id:'en_a2_2', level:'A2', q:'He is ___ than his sister.', opts:['tall','taller','tallest','more tall'], c:1 },
    { id:'en_a2_3', level:'A2', q:'___ you like tea or coffee?', opts:['Do','Does','Are','Is'], c:0 },
    { id:'en_a2_4', level:'A2', q:'I usually ___ breakfast at 7 am.', opts:['have','has','had','having'], c:0 },
    { id:'en_a2_5', level:'A2', q:'There ___ a lot of people in the park.', opts:['is','am','are','were'], c:2 },
    // B1
    { id:'en_b1_1', level:'B1', q:'I ___ in this city since 2015.', opts:['live','lived','have lived','am living'], c:2 },
    { id:'en_b1_2', level:'B1', q:'If it rains tomorrow, we ___ stay home.', opts:['will','would','should','must'], c:0 },
    { id:'en_b1_3', level:'B1', q:'The report ___ by the manager last week.', opts:['wrote','is written','was written','has written'], c:2 },
    { id:'en_b1_4', level:'B1', q:'She asked me where I ___.',  opts:['live','lived','am living','was living'], c:1 },
    { id:'en_b1_5', level:'B1', q:'Which word means "to look for"?', opts:['seek','keep','leap','reap'], c:0 },
    // B2
    { id:'en_b2_1', level:'B2', q:'Had she studied harder, she ___ the exam.', opts:['would pass','will have passed','would have passed','had passed'], c:2 },
    { id:'en_b2_2', level:'B2', q:'The committee ___ the proposal after lengthy debate.', opts:['ratified','notified','fortified','certified'], c:0 },
    { id:'en_b2_3', level:'B2', q:'___ the bad weather, the event was a success.', opts:['Despite','Although','However','Nevertheless'], c:0 },
    { id:'en_b2_4', level:'B2', q:'What does "ambiguous" mean?', opts:['certain','unclear','honest','complex'], c:1 },
    { id:'en_b2_5', level:'B2', q:'It\'s high time we ___ a decision.', opts:['make','made','have made','are making'], c:1 },
    // C1
    { id:'en_c1_1', level:'C1', q:'The minister\'s speech was replete with ___.',  opts:['platitudes','attitudes','altitudes','latitudes'], c:0 },
    { id:'en_c1_2', level:'C1', q:'Choose the correct form: "I wish I ___ there."', opts:['was','were','had been','am'], c:1 },
    { id:'en_c1_3', level:'C1', q:'The CEO\'s decision was met with ___ (= quiet disapproval).', opts:['opprobrium','equilibrium','compendium','consortium'], c:0 },
    { id:'en_c1_4', level:'C1', q:'"Notwithstanding" is closest in meaning to:', opts:['because of','in spite of','in addition to','as a result of'], c:1 },
    { id:'en_c1_5', level:'C1', q:'Which sentence is grammatically correct?', opts:['Scarcely had he arrived when the meeting started.','Scarcely he had arrived when the meeting started.','Scarcely had he arrived when did the meeting start.','Scarcely he arrived when the meeting started.'], c:0 },
    // C2
    { id:'en_c2_1', level:'C2', q:'"The bill was ___ through parliament" (passed quickly and quietly).', opts:['railroaded','bulldozed','steamrolled','shoehorned'], c:0 },
    { id:'en_c2_2', level:'C2', q:'Which word fits? "A ___ of experts reviewed the evidence."', opts:['panel','batch','cluster','heap'], c:0 },
    { id:'en_c2_3', level:'C2', q:'"Sanguine" means:', opts:['pessimistic','optimistic','aggressive','indifferent'], c:1 },
    { id:'en_c2_4', level:'C2', q:'Identify the subjunctive: "The judge ordered that he ___ silent."', opts:['remain','remains','remained','remaining'], c:0 },
    { id:'en_c2_5', level:'C2', q:'"Polysemous" refers to a word that:', opts:['sounds like another','has many meanings','is borrowed from another language','is no longer used'], c:1 },
  ],

  // ─── German ──────────────────────────────────────────────────────────────
  de: [
    // A1
    { id:'de_a1_1', level:'A1', q:'Wie sagt man "merhaba" auf Deutsch?', opts:['Tschüss','Hallo','Bitte','Danke'], c:1 },
    { id:'de_a1_2', level:'A1', q:'Das ist ___ Buch. (ein/eine/einen)', opts:['ein','eine','einen','einem'], c:0 },
    { id:'de_a1_3', level:'A1', q:'Ich ___ Student.', opts:['bin','bist','ist','sind'], c:0 },
    { id:'de_a1_4', level:'A1', q:'Wie viele Tage hat eine Woche?', opts:['5','6','7','8'], c:2 },
    { id:'de_a1_5', level:'A1', q:'Was ist das Gegenteil von "groß"?', opts:['alt','klein','schnell','jung'], c:1 },
    // A2
    { id:'de_a2_1', level:'A2', q:'Gestern ___ ich ins Kino gegangen.', opts:['habe','bin','war','hatte'], c:1 },
    { id:'de_a2_2', level:'A2', q:'Er ist ___ als sein Bruder.', opts:['groß','größer','am größten','größte'], c:1 },
    { id:'de_a2_3', level:'A2', q:'___ gehst du morgen? (Wann/Wo/Wie)', opts:['Wann','Wo','Wie','Was'], c:0 },
    { id:'de_a2_4', level:'A2', q:'Ich ___ jeden Tag Kaffee. (trinken)', opts:['trinke','trinkt','trinkst','trinken'], c:0 },
    { id:'de_a2_5', level:'A2', q:'Das Buch gehört ___ Lehrerin.', opts:['der','die','das','den'], c:0 },
    // B1
    { id:'de_b1_1', level:'B1', q:'Wenn es morgen regnet, ___ wir zu Hause bleiben.', opts:['werden','würden','wären','hätten'], c:0 },
    { id:'de_b1_2', level:'B1', q:'Er sagte, er ___ müde.', opts:['ist','war','sei','wäre'], c:2 },
    { id:'de_b1_3', level:'B1', q:'Das Buch ___ von Goethe geschrieben.', opts:['hat','wurde','ist','wird'], c:1 },
    { id:'de_b1_4', level:'B1', q:'Ich wohne hier, ___ ich Kind war.', opts:['seit','als','wenn','während'], c:1 },
    { id:'de_b1_5', level:'B1', q:'Was bedeutet "jedoch"?', opts:['also','aber','denn','weil'], c:1 },
    // B2
    { id:'de_b2_1', level:'B2', q:'Wenn er fleißiger gewesen wäre, ___ er die Prüfung bestanden.', opts:['hätte','würde','wäre','hatte'], c:0 },
    { id:'de_b2_2', level:'B2', q:'Was bedeutet "dennoch"?', opts:['deshalb','trotzdem','obwohl','damit'], c:1 },
    { id:'de_b2_3', level:'B2', q:'Der Vertrag ___ von beiden Seiten unterzeichnet werden.', opts:['muss','soll','kann','darf'], c:0 },
    { id:'de_b2_4', level:'B2', q:'"Angesichts" entspricht:', opts:['wegen','trotz','angesichts','statt'], c:2 },
    { id:'de_b2_5', level:'B2', q:'Er ___ lieber zu Hause geblieben. (Konjunktiv II)', opts:['ist','wäre','hätte','würde'], c:1 },
    // C1
    { id:'de_c1_1', level:'C1', q:'Welche Form ist korrekt? "Er tat so, als ___ er krank."', opts:['wäre','ist','war','sei'], c:0 },
    { id:'de_c1_2', level:'C1', q:'Was bedeutet "gleichwohl"?', opts:['genauso','trotzdem','desgleichen','ähnlich'], c:1 },
    { id:'de_c1_3', level:'C1', q:'"Die Maßnahme zeitigt erste Erfolge" – "zeitigt" bedeutet:', opts:['zeigt','bremst','erzeugt','verzögert'], c:2 },
    { id:'de_c1_4', level:'C1', q:'Welche Konstruktion ist ein Genitivattribut?', opts:['das Buch des Lehrers','das Buch dem Lehrer','das Buch den Lehrer','das Buch ein Lehrer'], c:0 },
    { id:'de_c1_5', level:'C1', q:'"Lapidar" bedeutet:', opts:['ausführlich','knapp und treffend','unsicher','feierlich'], c:1 },
    // C2
    { id:'de_c2_1', level:'C2', q:'"Sophismus" bezeichnet:', opts:['einen logischen Trugschluss','eine Redeform','ein Stilmittel','einen philosophischen Beweis'], c:0 },
    { id:'de_c2_2', level:'C2', q:'Welches Wort passt? "Eine ___ Argumentation überzeugte das Gericht."', opts:['stringente','stabile','steinerne','sterile'], c:0 },
    { id:'de_c2_3', level:'C2', q:'"Inkommensurabel" bedeutet:', opts:['unmessbar/unvergleichbar','unverständlich','unvermeidbar','unentbehrlich'], c:0 },
    { id:'de_c2_4', level:'C2', q:'Welche Konstruktion ist korrekt?', opts:['Es sei denn, dass er käme.','Es sei denn, er käme.','Es sei denn, er kommen würde.','Es sei denn, dass er kommen würde.'], c:1 },
    { id:'de_c2_5', level:'C2', q:'"Apodiktisch" bedeutet:', opts:['zweifelhaft','unbedingt gültig/absolut','vorläufig','rhetorisch'], c:1 },
  ],

  // ─── Chinese ─────────────────────────────────────────────────────────────
  zh: [
    // A1
    { id:'zh_a1_1', level:'A1', q:'"你好" ne anlama gelir?', opts:['Güle güle','Merhaba','Teşekkürler','Lütfen'], c:1 },
    { id:'zh_a1_2', level:'A1', q:'"一、二、三" — bunlar ne?', opts:['Renkler','Sayılar','Günler','Aylar'], c:1 },
    { id:'zh_a1_3', level:'A1', q:'Aşağıdakilerden hangisi "su" demektir?', opts:['火','水','木','土'], c:1 },
    { id:'zh_a1_4', level:'A1', q:'"我叫___。" — Bu cümlede boşluğa ne gelir?', opts:['İsim','Yaş','Meslek','Şehir'], c:0 },
    { id:'zh_a1_5', level:'A1', q:'"谢谢" nasıl söylenir?', opts:['Nǐ hǎo','Zàijiàn','Xièxie','Duìbuqǐ'], c:2 },
    // A2
    { id:'zh_a2_1', level:'A2', q:'"我昨天___了一本书。" Boşluğa ne gelir?', opts:['吃','买','喝','走'], c:1 },
    { id:'zh_a2_2', level:'A2', q:'"一杯咖啡" ifadesinde "杯" ne işlev görür?', opts:['Fiil','Ölçü birimi (量词)','Sıfat','Zarf'], c:1 },
    { id:'zh_a2_3', level:'A2', q:'"现在几点？" sorusunun anlamı:', opts:['Bugün hava nasıl?','Nerelisin?','Saat kaç?','Adın ne?'], c:2 },
    { id:'zh_a2_4', level:'A2', q:'"他比我___。" — "更高" ifadesinin anlamı:', opts:['Daha genç','Daha uzun boylu','Daha çalışkan','Daha zeki'], c:1 },
    { id:'zh_a2_5', level:'A2', q:'"不" ve "没" arasındaki temel fark:', opts:['"不" geçmişi reddeder, "没" şimdiyi','Fark yok','\"不\" iradeyi reddeder, "没" gerçekleşmemiş eylemi','Sadece resmiyet farkı'], c:2 },
    // B1
    { id:'zh_b1_1', level:'B1', q:'"把" yapısı hangi amaçla kullanılır?', opts:['Edilgen anlam','Nesneyi öne almak','Zaman belirtmek','Soru oluşturmak'], c:1 },
    { id:'zh_b1_2', level:'B1', q:'"他吃得很快" — "得" burada ne işlev görür?', opts:['Tamamlama belirteci','Sonuç tamamlayıcısı bağlacı','Sahiplik belirteci','Edilgen yapı'], c:1 },
    { id:'zh_b1_3', level:'B1', q:'"虽然…但是…" yapısı neyi ifade eder?', opts:['Koşul','Karşıtlık (Her ne kadar…ama…)','Neden-sonuç','Zaman sırası'], c:1 },
    { id:'zh_b1_4', level:'B1', q:'"被" ile kurulan cümle hangi anlama gelir?', opts:['Aktif eylem','Edilgen yapı','Sahiplik','Rica'], c:1 },
    { id:'zh_b1_5', level:'B1', q:'"渐渐" kelimesinin anlamı:', opts:['Aniden','Yavaş yavaş','Çok hızlı','Zaman zaman'], c:1 },
    // B2
    { id:'zh_b2_1', level:'B2', q:'"如果…就…" ile "要是…的话" arasındaki fark:', opts:['Anlam farklıdır','Kayıt/resmiyet farkı vardır','Tamamen aynıdır','Zaman farkı vardır'], c:1 },
    { id:'zh_b2_2', level:'B2', q:'"一石二鸟" hangi Türkçe deyime eşdeğerdir?', opts:['Taşı gediğine koymak','Bir taşla iki kuş vurmak','Balığı başından kokutmak','Su testisi su yolunda kırılır'], c:1 },
    { id:'zh_b2_3', level:'B2', q:'"尽管如此" ifadesinin anlamı:', opts:['Bu yüzden','Buna rağmen','Bunun yanı sıra','Özellikle'], c:1 },
    { id:'zh_b2_4', level:'B2', q:'"连…都/也…" yapısı neyi vurgular?', opts:['Karşılaştırma','Olumsuzlama','Pekiştirme/şaşırma','Zaman'], c:2 },
    { id:'zh_b2_5', level:'B2', q:'"模棱两可" ifadesinin anlamı:', opts:['Çok açık','Belirsiz/muğlak','Çok karmaşık','Tartışmalı'], c:1 },
    // C1
    { id:'zh_c1_1', level:'C1', q:'"愁眉苦脸" hangi ruh halini tanımlar?', opts:['Mutluluk','Şaşkınlık','Kaygı/mutsuzluk','Öfke'], c:2 },
    { id:'zh_c1_2', level:'C1', q:'"不以为然" ne anlama gelir?', opts:['Aynı fikirde olmamak','Önem vermemek','Beğenmemek','Anlamak istememek'], c:0 },
    { id:'zh_c1_3', level:'C1', q:'"固然…但是…" yapısının işlevi:', opts:['Bir gerçeği kabul edip karşı argüman sunmak','Neden-sonuç belirtmek','Şart koşmak','Zaman ilişkisi kurmak'], c:0 },
    { id:'zh_c1_4', level:'C1', q:'"付诸实施" fiil öbeğinin anlamı:', opts:['Planı ertelemek','Hayata geçirmek','Tartışmaya açmak','Vazgeçmek'], c:1 },
    { id:'zh_c1_5', level:'C1', q:'"欲盖弥彰" hangi durumu anlatır?', opts:['Başarılı gizleme','Gizlemeye çalışırken daha çok açığa çıkma','Açık sözlülük','Utangaçlık'], c:1 },
    // C2
    { id:'zh_c2_1', level:'C2', q:'"振聋发聩" (zhèn lóng fā kuì) ne anlama gelir?', opts:['Uyuşukları uyandıracak kadar etkili söz','Gürültülü bir ortam','Sağır biri','Şiddetli bir sarsıntı'], c:0 },
    { id:'zh_c2_2', level:'C2', q:'"殚精竭虑" ifadesi neyi tanımlar?', opts:['Dinlenmek','Tüm zihin ve enerjisini harcamak','Kararlılık','Hayal kırıklığı'], c:1 },
    { id:'zh_c2_3', level:'C2', q:'"差强人意" ifadesinin doğru anlamı:', opts:['Harika','Kabul edilebilir/tatmin edici sayılır','Çok kötü','Hiç beklenmedik'], c:1 },
    { id:'zh_c2_4', level:'C2', q:'"文言文" ile "白话文" arasındaki temel ayrım:', opts:['Bölgesel ağız farkı','Klasik yazı dili ve modern konuşma dili','Resmiyet farkı','Dönem farkı yok'], c:1 },
    { id:'zh_c2_5', level:'C2', q:'"不置可否" ne anlama gelir?', opts:['Kesinlikle reddetmek','Ne evet ne hayır demek (tarafsız kalmak)','Kabul etmek','Şiddetle karşı çıkmak'], c:1 },
  ],

  // ─── Japanese ────────────────────────────────────────────────────────────
  ja: [
    // A1
    { id:'ja_a1_1', level:'A1', q:'"ありがとう" ne anlama gelir?', opts:['Merhaba','Güle güle','Teşekkürler','Özür dilerim'], c:2 },
    { id:'ja_a1_2', level:'A1', q:'"わたし は がくせい です。" — "です" ne işlev görür?', opts:['Fiil','Yüklem bağlacı (to be)','Soru eki','Olumsuzluk'], c:1 },
    { id:'ja_a1_3', level:'A1', q:'"いち、に、さん" — bunlar ne?', opts:['Renkler','Sayılar (1,2,3)','Günler','Hayvanlar'], c:1 },
    { id:'ja_a1_4', level:'A1', q:'"ねこ" ne anlama gelir?', opts:['Köpek','Kedi','Kuş','Balık'], c:1 },
    { id:'ja_a1_5', level:'A1', q:'Japonca\'da soru cümlesi nasıl yapılır?', opts:['Cümle başına "か" eklenir','Cümle sonuna "か" eklenir','Fiil değiştirilir','İntonasyon değişir'], c:1 },
    // A2
    { id:'ja_a2_1', level:'A2', q:'"食べて ください" ne anlama gelir?', opts:['Yeme lütfen','Yemiş','Lütfen ye','Yiyecek misin?'], c:2 },
    { id:'ja_a2_2', level:'A2', q:'"～ました" eki ne anlatır?', opts:['Gelecek zaman','Geçmiş zaman (kibar)','Şimdiki zaman','Koşul'], c:1 },
    { id:'ja_a2_3', level:'A2', q:'"この 本 は たかい です" — "たかい" ne demek?', opts:['Ucuz','Pahalı/yüksek','Büyük','Güzel'], c:1 },
    { id:'ja_a2_4', level:'A2', q:'"～てから" yapısı neyi anlatır?', opts:['... yaparken','... yaptıktan sonra','... yapmadan önce','... yapsa bile'], c:1 },
    { id:'ja_a2_5', level:'A2', q:'"いくら ですか" sorusu ne sorar?', opts:['Nasılsın?','Ne kadar? (fiyat)','Nerede?','Ne zaman?'], c:1 },
    // B1
    { id:'ja_b1_1', level:'B1', q:'"～たら" koşul ekinin kullanımı:', opts:['Süregelen eylem','Bir eylem tamamlandığında','Rica','Tahmin'], c:1 },
    { id:'ja_b1_2', level:'B1', q:'"先生に ほめられた" cümlesinde ne var?', opts:['Aktif çatı','Edilgen çatı (受身形)','Rica','Koşul'], c:1 },
    { id:'ja_b1_3', level:'B1', q:'"～ようになった" ne ifade eder?', opts:['Ani değişim','Kademeli değişim / alışkanlık','Rica','Yasak'], c:1 },
    { id:'ja_b1_4', level:'B1', q:'"丁寧語" (teineigo) ne demektir?', opts:['Düz konuşma','Kibar konuşma','Çok resmi konuşma','Argoda konuşma'], c:1 },
    { id:'ja_b1_5', level:'B1', q:'"なかなか ～ない" yapısı ne anlatır?', opts:['Kolaylıkla yapamamak','Hiçbir zaman yapmamak','Çok hızlı yapmak','Sık sık yapmak'], c:0 },
    // B2
    { id:'ja_b2_1', level:'B2', q:'"～にもかかわらず" ifadesi:', opts:['...yüzünden','...rağmen','...için','...göre'], c:1 },
    { id:'ja_b2_2', level:'B2', q:'"使役受身形" (shieki ukemi) ne anlama gelir?', opts:['Aktif fakat zoraki yapılan eylem','Yaptırılıp da maruz kalmak','Serbest irade','Kendiliğinden olma'], c:1 },
    { id:'ja_b2_3', level:'B2', q:'"おっしゃる" hangi kelimenin 敬語 (keigo) karşılığıdır?', opts:['聞く (kiku)','言う (iu)','見る (miru)','行く (iku)'], c:1 },
    { id:'ja_b2_4', level:'B2', q:'"七転び八起き" (nana korobi ya oki) ne demektir?', opts:['Şans eseri kazanmak','Defalarca düşüp kalkmak (azim)','Çabuk pes etmek','Başkasına güvenmek'], c:1 },
    { id:'ja_b2_5', level:'B2', q:'"～はずだ" ne anlatır?', opts:['Kesin emir','Makul beklenti/olması gereken','Rica','Yasak'], c:1 },
    // C1
    { id:'ja_c1_1', level:'C1', q:'"謙譲語" (kenjōgo) ne amaçla kullanılır?', opts:['Karşıdakini yüceltmek','Kendi eylemini alçaltarak saygı göstermek','Emir vermek','Kibarca reddetmek'], c:1 },
    { id:'ja_c1_2', level:'C1', q:'"一期一会" (ichi-go ichi-e) ne demektir?', opts:['Birlikte büyümek','Bir kez oluşan, tekrarlanmaz an','Rekabet ruhu','Alçakgönüllülük'], c:1 },
    { id:'ja_c1_3', level:'C1', q:'"～に相違ない" ifadesi:', opts:['Şüpheli','Kesinlikle öyle','Muhtemelen değil','Olası'], c:1 },
    { id:'ja_c1_4', level:'C1', q:'"木漏れ日" (komorebi) ifadesinin tanımı:', opts:['Yaprak gölgesi','Ağaç yaprakları arasından süzülen güneş ışığı','Sabah çiği','Orman sisi'], c:1 },
    { id:'ja_c1_5', level:'C1', q:'"～を余儀なくされる" ne anlatır?', opts:['İsteyerek yapmak','Zorunda bırakılmak','Yapmayı önermek','Reddetmek'], c:1 },
    // C2
    { id:'ja_c2_1', level:'C2', q:'"侘び寂び" (wabi-sabi) hangi estetiği tanımlar?', opts:['Mükemmel simetri','Eksik ve geçici güzellikteki derin estetik','Parlak ve süslü sanat','Modern minimalizm'], c:1 },
    { id:'ja_c2_2', level:'C2', q:'"由無し事" (yosunashi-goto) ne demektir?', opts:['Önemli mesele','Anlamsız/boş söz','Felsefi düşünce','Resmi bildiri'], c:1 },
    { id:'ja_c2_3', level:'C2', q:'Klasik Japonca "已然形" (izenkei) hangi modern ekle ilişkilidir?', opts:['～ば','～て','～た','～ない'], c:0 },
    { id:'ja_c2_4', level:'C2', q:'"物の哀れ" (mono no aware) kavramı:', opts:['Doğanın güzelliği','Geçiciliğin dokunduğu hüzün duygusu','Doğa ile uyum','Dini arınma'], c:1 },
    { id:'ja_c2_5', level:'C2', q:'"徒然草" (Tsurezuregusa) eserinin yazarı kimdir?', opts:['Murasaki Shikibu','Matsuo Bashō','Yoshida Kenkō','Sei Shōnagon'], c:2 },
  ],

  // ─── French ──────────────────────────────────────────────────────────────
  fr: [
    // A1
    { id:'fr_a1_1', level:'A1', q:'Comment dit-on "merhaba" en français ?', opts:['Au revoir','Bonjour','Merci','S\'il vous plaît'], c:1 },
    { id:'fr_a1_2', level:'A1', q:'Je ___ français. (être)', opts:['suis','es','est','sommes'], c:0 },
    { id:'fr_a1_3', level:'A1', q:'Quel article ? ___ livre.', opts:['Un','Une','Des','De'], c:0 },
    { id:'fr_a1_4', level:'A1', q:'Il a ___ ans. (vingt / yirmi)', opts:['vingt','trente','quarante','dix'], c:0 },
    { id:'fr_a1_5', level:'A1', q:'Quelle couleur est le ciel ?', opts:['rouge','vert','bleu','jaune'], c:2 },
    // A2
    { id:'fr_a2_1', level:'A2', q:'Hier, je ___ au cinéma. (aller)', opts:['vais','allais','suis allé','irai'], c:2 },
    { id:'fr_a2_2', level:'A2', q:'Elle est ___ que son frère. (grand)', opts:['grande','plus grande','la plus grande','grandissime'], c:1 },
    { id:'fr_a2_3', level:'A2', q:'___ heures est-il ? (Quelle / Quel)', opts:['Quelle','Quel','Quelles','Quels'], c:0 },
    { id:'fr_a2_4', level:'A2', q:'Nous ___ du café le matin. (boire)', opts:['buvons','boivent','bois','boit'], c:0 },
    { id:'fr_a2_5', level:'A2', q:'Il y ___ beaucoup de monde.', opts:['a','est','ont','sont'], c:0 },
    // B1
    { id:'fr_b1_1', level:'B1', q:'J\'habite ici ___ dix ans. (depuis / il y a)', opts:['depuis','il y a','pendant','pour'], c:0 },
    { id:'fr_b1_2', level:'B1', q:'Si tu travailles bien, tu ___ réussir.', opts:['pourrais','pourras','peux','pouvais'], c:1 },
    { id:'fr_b1_3', level:'B1', q:'Le rapport ___ rédigé hier.', opts:['est','a été','était','a'], c:1 },
    { id:'fr_b1_4', level:'B1', q:'Il faut que tu ___ à l\'heure. (être)', opts:['sois','es','étais','seras'], c:0 },
    { id:'fr_b1_5', level:'B1', q:'Que signifie "néanmoins" ?', opts:['donc','cependant','ainsi','car'], c:1 },
    // B2
    { id:'fr_b2_1', level:'B2', q:'Si elle avait étudié, elle ___ réussi.', opts:['aurait','avait','aura','a'], c:0 },
    { id:'fr_b2_2', level:'B2', q:'Que signifie "nonobstant" ?', opts:['en outre','malgré','ensuite','d\'abord'], c:1 },
    { id:'fr_b2_3', level:'B2', q:'Il convient ___ cette question sérieusement.', opts:['de traiter','traiter','à traiter','qu\'on traite'], c:0 },
    { id:'fr_b2_4', level:'B2', q:'"Épineux" signifie :', opts:['simple','facile','délicat/difficile','évident'], c:2 },
    { id:'fr_b2_5', level:'B2', q:'Quelle phrase est au subjonctif ?', opts:['Bien qu\'il soit malade...','Parce qu\'il est malade...','Quand il est malade...','Comme il est malade...'], c:0 },
    // C1
    { id:'fr_c1_1', level:'C1', q:'Que signifie "circumlocution" ?', opts:['Expression directe','Langage indirect et détourné','Figure de style','Néologisme'], c:1 },
    { id:'fr_c1_2', level:'C1', q:'Quel mode s\'emploie après "à supposer que" ?', opts:['Indicatif','Conditionnel','Subjonctif','Infinitif'], c:2 },
    { id:'fr_c1_3', level:'C1', q:'"Pérégrinations" désigne :', opts:['des décisions','des voyages','des erreurs','des discussions'], c:1 },
    { id:'fr_c1_4', level:'C1', q:'Que signifie "exacerber" ?', opts:['atténuer','aggraver','ignorer','compliquer'], c:1 },
    { id:'fr_c1_5', level:'C1', q:'"L\'oisiveté est mère de tous les vices." — C\'est :', opts:['une métaphore','un proverbe','une périphrase','une antithèse'], c:1 },
    // C2
    { id:'fr_c2_1', level:'C2', q:'"Hapax legomenon" désigne :', opts:['un mot très courant','un mot n\'apparaissant qu\'une fois','un emprunt','un archaïsme'], c:1 },
    { id:'fr_c2_2', level:'C2', q:'"Procrastination" : quel synonyme rare convient ?', opts:['cunctation','rumination','divagation','tergiversation'], c:0 },
    { id:'fr_c2_3', level:'C2', q:'Que signifie "iconoclaste" ?', opts:['Qui brise les idées reçues','Qui admire les icônes','Qui suit la tradition','Qui est prudent'], c:0 },
    { id:'fr_c2_4', level:'C2', q:'Quel auteur a écrit "À la recherche du temps perdu" ?', opts:['Flaubert','Zola','Proust','Balzac'], c:2 },
    { id:'fr_c2_5', level:'C2', q:'"Synecdoque" est une figure par laquelle on désigne :', opts:['le tout par la partie (ou vice versa)','une chose par son contraire','une comparaison explicite','une répétition sonore'], c:0 },
  ],

  // ─── Spanish ─────────────────────────────────────────────────────────────
  es: [
    // A1
    { id:'es_a1_1', level:'A1', q:'¿Cómo se dice "merhaba" en español?', opts:['Adiós','Hola','Gracias','Por favor'], c:1 },
    { id:'es_a1_2', level:'A1', q:'Yo ___ estudiante. (ser)', opts:['soy','eres','es','somos'], c:0 },
    { id:'es_a1_3', level:'A1', q:'¿Qué artículo corresponde? ___ casa.', opts:['El','La','Un','Los'], c:1 },
    { id:'es_a1_4', level:'A1', q:'¿Cuántos días tiene una semana?', opts:['5','6','7','8'], c:2 },
    { id:'es_a1_5', level:'A1', q:'¿Qué color es el cielo?', opts:['rojo','verde','azul','amarillo'], c:2 },
    // A2
    { id:'es_a2_1', level:'A2', q:'Ayer yo ___ al mercado. (ir)', opts:['voy','iba','fui','he ido'], c:2 },
    { id:'es_a2_2', level:'A2', q:'Ella es ___ que su hermano. (alto)', opts:['alta','más alta','la más alta','altísima'], c:1 },
    { id:'es_a2_3', level:'A2', q:'¿___ horas son? (Qué / Cuántas)', opts:['Qué','Cuántas','Cuántos','Cómo'], c:1 },
    { id:'es_a2_4', level:'A2', q:'Nosotros ___ café por las mañanas. (tomar)', opts:['tomamos','toman','tomas','tomo'], c:0 },
    { id:'es_a2_5', level:'A2', q:'Hay ___ personas en el parque.', opts:['muchos','muchas','mucho','mucha'], c:1 },
    // B1
    { id:'es_b1_1', level:'B1', q:'Vivo aquí ___ diez años.', opts:['desde hace','hace','para','por'], c:0 },
    { id:'es_b1_2', level:'B1', q:'Si estudias bien, ___ el examen.', opts:['aprobarías','aprobarás','aprobaras','apruebas'], c:1 },
    { id:'es_b1_3', level:'B1', q:'El informe ___ redactado ayer.', opts:['es','fue','ha sido','había'], c:1 },
    { id:'es_b1_4', level:'B1', q:'Quiero que tú ___ puntual. (ser)', opts:['seas','eres','serías','fueras'], c:0 },
    { id:'es_b1_5', level:'B1', q:'¿Qué significa "sin embargo"?', opts:['por lo tanto','no obstante','además','puesto que'], c:1 },
    // B2
    { id:'es_b2_1', level:'B2', q:'Si hubiera estudiado, ___ aprobado.', opts:['habría','habría','hubiera','hubiese'], c:0 },
    { id:'es_b2_2', level:'B2', q:'¿Qué significa "menoscabar"?', opts:['aumentar','disminuir o dañar','mejorar','ignorar'], c:1 },
    { id:'es_b2_3', level:'B2', q:'Es preciso que ___ este asunto. (abordar)', opts:['abordemos','abordamos','abordaremos','abordáramos'], c:0 },
    { id:'es_b2_4', level:'B2', q:'"Peliagudo" significa:', opts:['sencillo','complicado/delicado','evidente','urgente'], c:1 },
    { id:'es_b2_5', level:'B2', q:'¿Qué frase usa el subjuntivo correctamente?', opts:['Aunque está cansado...','Aunque esté cansado (expresa duda)...','Cuando llegue, le llamo...','Si tengo tiempo, lo haré...'], c:1 },
    // C1
    { id:'es_c1_1', level:'C1', q:'¿Qué significa "circunloquio"?', opts:['Expresión directa','Rodeo de palabras','Figura retórica','Neologismo'], c:1 },
    { id:'es_c1_2', level:'C1', q:'¿Qué modo verbal sigue "a condición de que"?', opts:['Indicativo','Condicional','Subjuntivo','Infinitivo'], c:2 },
    { id:'es_c1_3', level:'C1', q:'"Perogrullada" significa:', opts:['mentira obvia','verdad de perogrullo (obviedad)','argumento sólido','paradoja'], c:1 },
    { id:'es_c1_4', level:'C1', q:'¿Qué significa "exacerbar"?', opts:['atenuar','agravar','ignorar','resolver'], c:1 },
    { id:'es_c1_5', level:'C1', q:'"Quien a buen árbol se arrima, buena sombra le cobija." Es un:', opts:['refrán','oxímoron','hipérbole','eufemismo'], c:0 },
    // C2
    { id:'es_c2_1', level:'C2', q:'"Hápax" en lingüística designa:', opts:['una palabra muy frecuente','una palabra que aparece una sola vez en un corpus','un préstamo léxico','un arcaísmo'], c:1 },
    { id:'es_c2_2', level:'C2', q:'"Cunctación" significa:', opts:['decisión rápida','dilación/retraso deliberado','acumulación','planificación'], c:1 },
    { id:'es_c2_3', level:'C2', q:'"Iconoclasta" se aplica a quien:', opts:['rompe con las ideas establecidas','admira las imágenes','sigue la tradición','actúa con prudencia'], c:0 },
    { id:'es_c2_4', level:'C2', q:'¿Quién escribió "Don Quijote de la Mancha"?', opts:['Lope de Vega','Quevedo','Cervantes','Góngora'], c:2 },
    { id:'es_c2_5', level:'C2', q:'"Sinécdoque" es la figura que nombra algo usando:', opts:['la parte por el todo o viceversa','su contrario','una comparación explícita','la causa por el efecto'], c:0 },
  ],

  // ─── Italian ─────────────────────────────────────────────────────────────
  it: [
    // A1
    { id:'it_a1_1', level:'A1', q:'Come si dice "merhaba" in italiano?', opts:['Arrivederci','Ciao / Buongiorno','Grazie','Per favore'], c:1 },
    { id:'it_a1_2', level:'A1', q:'Io ___ studente. (essere)', opts:['sono','sei','è','siamo'], c:0 },
    { id:'it_a1_3', level:'A1', q:'Quale articolo? ___ libro.', opts:['Un','Una','Il','Lo'], c:0 },
    { id:'it_a1_4', level:'A1', q:'Quanti giorni ha una settimana?', opts:['5','6','7','8'], c:2 },
    { id:'it_a1_5', level:'A1', q:'Di che colore è il cielo?', opts:['rosso','verde','blu','giallo'], c:2 },
    // A2
    { id:'it_a2_1', level:'A2', q:'Ieri io ___ al cinema. (andare)', opts:['vado','andavo','sono andato','andrò'], c:2 },
    { id:'it_a2_2', level:'A2', q:'Lei è ___ di suo fratello. (alto)', opts:['alta','più alta','altissima','la più alta'], c:1 },
    { id:'it_a2_3', level:'A2', q:'___ ore sono? (Che / Quante)', opts:['Che','Quante','Quanto','Come'], c:0 },
    { id:'it_a2_4', level:'A2', q:'Noi ___ caffè ogni mattina. (bere)', opts:['beviamo','bevono','bevi','beve'], c:0 },
    { id:'it_a2_5', level:'A2', q:'C\'___ molte persone al parco.', opts:['è','sono','ha','hanno'], c:0 },
    // B1
    { id:'it_b1_1', level:'B1', q:'Abito qui ___ dieci anni.', opts:['da','per','fa','in'], c:0 },
    { id:'it_b1_2', level:'B1', q:'Se studie bene, ___ l\'esame.', opts:['supereresti','supererai','superassi','superi'], c:1 },
    { id:'it_b1_3', level:'B1', q:'Il rapporto ___ scritto ieri.', opts:['è stato','è','fu','aveva'], c:0 },
    { id:'it_b1_4', level:'B1', q:'Voglio che tu ___ puntuale. (essere)', opts:['sia','sei','saresti','fossi'], c:0 },
    { id:'it_b1_5', level:'B1', q:'Cosa significa "tuttavia"?', opts:['quindi','però/ciononostante','inoltre','poiché'], c:1 },
    // B2
    { id:'it_b2_1', level:'B2', q:'Se avesse studiato, ___ superato l\'esame.', opts:['avrebbe','avesse','avrà','ha'], c:0 },
    { id:'it_b2_2', level:'B2', q:'Cosa significa "esacerbare"?', opts:['attenuare','aggravare','ignorare','risolvere'], c:1 },
    { id:'it_b2_3', level:'B2', q:'È necessario che ___ questo problema. (affrontare)', opts:['affrontiamo','affrontiamo','affronteremo','affrontassimo'], c:0 },
    { id:'it_b2_4', level:'B2', q:'"Spinoso" in senso figurato significa:', opts:['semplice','delicato/difficile','evidente','urgente'], c:1 },
    { id:'it_b2_5', level:'B2', q:'Quale frase usa correttamente il congiuntivo?', opts:['Sebbene è stanco...','Sebbene sia stanco...','Quando arriva, lo chiamo...','Se ho tempo, lo faccio...'], c:1 },
    // C1
    { id:'it_c1_1', level:'C1', q:'Cosa significa "circonlocuzione"?', opts:['Espressione diretta','Giro di parole','Figura retorica','Neologismo'], c:1 },
    { id:'it_c1_2', level:'C1', q:'Quale modo segue "a patto che"?', opts:['Indicativo','Condizionale','Congiuntivo','Infinito'], c:2 },
    { id:'it_c1_3', level:'C1', q:'Cosa significa "esacerbare"?', opts:['calmare','inasprire','ignorare','comprendere'], c:1 },
    { id:'it_c1_4', level:'C1', q:'"Tanto va la gatta al lardo che ci lascia lo zampino." È un:', opts:['proverbio','ossimoro','iperbole','eufemismo'], c:0 },
    { id:'it_c1_5', level:'C1', q:'Cosa significa "oltranzista"?', opts:['moderato','estremista/intransigente','indeciso','neutrale'], c:1 },
    // C2
    { id:'it_c2_1', level:'C2', q:'"Hapax legomenon" in linguistica indica:', opts:['parola frequentissima','parola attestata una sola volta','prestito lessicale','arcaismo'], c:1 },
    { id:'it_c2_2', level:'C2', q:'"Iconoclasta" si riferisce a chi:', opts:['distrugge le idee consolidate','venera le icone','segue la tradizione','agisce con prudenza'], c:0 },
    { id:'it_c2_3', level:'C2', q:'Chi scrisse "La Divina Commedia"?', opts:['Petrarca','Boccaccio','Dante','Ariosto'], c:2 },
    { id:'it_c2_4', level:'C2', q:'"Sineddoche" è la figura che indica qualcosa con:', opts:['la parte per il tutto o viceversa','il suo contrario','un paragone esplicito','la causa per l\'effetto'], c:0 },
    { id:'it_c2_5', level:'C2', q:'"Parossismo" significa:', opts:['punto di minima intensità','massima intensità di un fenomeno','stato di equilibrio','inizio di un processo'], c:1 },
  ],

  // ─── Korean ──────────────────────────────────────────────────────────────
  ko: [
    // A1
    { id:'ko_a1_1', level:'A1', q:'"안녕하세요" ne anlama gelir?', opts:['Güle güle','Merhaba / İyi günler','Teşekkürler','Özür dilerim'], c:1 },
    { id:'ko_a1_2', level:'A1', q:'"저는 학생이에요." — "이에요" ne işlev görür?', opts:['Soru eki','Olumsuzluk','Yüklem (to be — kibar)','Çoğul eki'], c:2 },
    { id:'ko_a1_3', level:'A1', q:'"일, 이, 삼" — bunlar nedir?', opts:['Renkler','Sayılar (1,2,3)','Günler','Hayvanlar'], c:1 },
    { id:'ko_a1_4', level:'A1', q:'"고양이" ne demektir?', opts:['Köpek','Kedi','Kuş','Balık'], c:1 },
    { id:'ko_a1_5', level:'A1', q:'Korece\'de olumsuz cümle nasıl yapılır (basit)?', opts:['"안" + fiil kökü','Fiil sonu değişir','Cümle başına "아니" eklenir','Sadece ton değişir'], c:0 },
    // A2
    { id:'ko_a2_1', level:'A2', q:'"어제 시장에 갔어요." — "갔어요" neyin geçmiş halidir?', opts:['먹다','가다','오다','보다'], c:1 },
    { id:'ko_a2_2', level:'A2', q:'"～(으)면" eki ne anlatır?', opts:['Geçmiş zaman','Koşul (if/when)','Rica','Olumsuzluk'], c:1 },
    { id:'ko_a2_3', level:'A2', q:'"얼마예요?" sorusu ne sorar?', opts:['Nasılsınız?','Ne kadar? (fiyat)','Nerede?','Ne zaman?'], c:1 },
    { id:'ko_a2_4', level:'A2', q:'"보다" parçacığı cümlede ne işlev görür?', opts:['Yönelme','Karşılaştırma (than)','Sahiplik','Konu işaretleyici'], c:1 },
    { id:'ko_a2_5', level:'A2', q:'"～고 싶다" ne anlatır?', opts:['Yapabilmek','İstemek/arzu etmek','Yapmak zorunda olmak','Yapmış olmak'], c:1 },
    // B1
    { id:'ko_b1_1', level:'B1', q:'"～아/어서" ile "～(으)니까" arasındaki temel fark:', opts:['Anlam farklıdır','"-아서" neden-sonuç, "-니까" öznellik/gerekçe','Tamamen aynıdır','Zaman farkı vardır'], c:1 },
    { id:'ko_b1_2', level:'B1', q:'"선생님께서 칭찬하셨어요." — Bu cümlede ne var?', opts:['Sıradan kibar anlatım','Yükseltme (존댓말 for subject)','Edilgen yapı','Rica'], c:1 },
    { id:'ko_b1_3', level:'B1', q:'"～(으)ㄹ 것 같다" ne ifade eder?', opts:['Kesin emir','Tahmini / görünüşe göre','Rica','Mümkün','Alışkanlık'], c:1 },
    { id:'ko_b1_4', level:'B1', q:'"드리다" hangi kelimenin mütevazı (겸양어) karşılığıdır?', opts:['보다','주다','말하다','먹다'], c:1 },
    { id:'ko_b1_5', level:'B1', q:'"비록 … -(으)ㄹ지라도" yapısı ne anlatır?', opts:['Koşul','Her ne kadar … olsa da (양보)','Neden-sonuç','Sıralama'], c:1 },
    // B2
    { id:'ko_b2_1', level:'B2', q:'"～에도 불구하고" ifadesi:', opts:['...yüzünden','...rağmen','...için','...göre'], c:1 },
    { id:'ko_b2_2', level:'B2', q:'"일석이조(一石二鳥)" ne demektir?', opts:['Sabırlı olmak','Bir taşla iki kuş vurmak','Çabuk pes etmek','Başkasına güvenmek'], c:1 },
    { id:'ko_b2_3', level:'B2', q:'"그럼에도 불구하고"\'nun anlamı:', opts:['Bu yüzden','Buna rağmen','Bunun yanı sıra','Özellikle'], c:1 },
    { id:'ko_b2_4', level:'B2', q:'"-(으)ㄹ 뿐만 아니라" yapısı:', opts:['Sadece… değil, aynı zamanda…','Ya… ya da…','Ne… ne de…','Her ne kadar… ama…'], c:0 },
    { id:'ko_b2_5', level:'B2', q:'"두루뭉술하다"\'nın anlamı:', opts:['Net ve kesin','Muğlak/belirsiz','Çok karmaşık','Tartışmalı'], c:1 },
    // C1
    { id:'ko_c1_1', level:'C1', q:'"사필귀정(事必歸正)"\'ın anlamı:', opts:['Her işin başı sabır','Her şey sonunda doğruya kavuşur','Geçmişe takılmamak','Hızlı hareket etmek'], c:1 },
    { id:'ko_c1_2', level:'C1', q:'"부지불식간(不知不識間)"\'ın anlamı:', opts:['Bilerek ve isteyerek','Farkında olmadan/bilmeksizin','Aceleyle','Dikkatle'], c:1 },
    { id:'ko_c1_3', level:'C1', q:'"-(으)ㄹ진대" bağlacının işlevi:', opts:['Koşul öncülü (resmi/edebi)','Zaman sırası','Rica','Olumsuzlama'], c:0 },
    { id:'ko_c1_4', level:'C1', q:'"금상첨화(錦上添花)"\'nın anlamı:', opts:['Zorlu durumda kalmak','İyinin üstüne iyilik katmak','Çaresiz kalmak','Hata yapmak'], c:1 },
    { id:'ko_c1_5', level:'C1', q:'"견강부회(牽强附會)"\'nın anlamı:', opts:['Mantıklı çıkarım','Zorla bağlantı kurmak/çarpıtmak','Sakin kalmak','Alçakgönüllü olmak'], c:1 },
    // C2
    { id:'ko_c2_1', level:'C2', q:'"오리무중(五里霧中)"\'ın anlamı:', opts:['Her şeyin net göründüğü durum','İçinden çıkılamaz, belirsiz durum','Çok hızlı ilerleme','Kesin başarı'], c:1 },
    { id:'ko_c2_2', level:'C2', q:'"함흥차사(咸興差使)"\'nın modern kullanımı:', opts:['Gönderilip geri dönmeyen / haber alınamayan kişi','Hızlı ulak','Güvenilir haberci','Başarılı diplomat'], c:0 },
    { id:'ko_c2_3', level:'C2', q:'"언중유골(言中有骨)"\'ın anlamı:', opts:['Açık söz','Sözün içinde gizli ağır bir anlam var','Anlamsız gevezelik','Teselli edici söz'], c:1 },
    { id:'ko_c2_4', level:'C2', q:'훈민정음을 창제한 왕은?', opts:['태종','세종','성종','중종'], c:1 },
    { id:'ko_c2_5', level:'C2', q:'현대 한국어에서 "-(으)오"체는 어떤 문체인가?', opts:['구어체 반말','공식적·권위적 문어체','친근한 구어','방언'], c:1 },
  ],

  // ─── Swedish ─────────────────────────────────────────────────────────────
  sv: [
    // A1
    { id:'sv_a1_1', level:'A1', q:'Hur säger man "merhaba" på svenska?', opts:['Hejdå','Hej','Tack','Förlåt'], c:1 },
    { id:'sv_a1_2', level:'A1', q:'Jag ___ student. (vara)', opts:['är','är','var','vore'], c:0 },
    { id:'sv_a1_3', level:'A1', q:'Vilket är rätt artikel? ___ bok (en/ett)', opts:['En','Ett','Den','Det'], c:0 },
    { id:'sv_a1_4', level:'A1', q:'Hur många dagar har en vecka?', opts:['5','6','7','8'], c:2 },
    { id:'sv_a1_5', level:'A1', q:'Vad är motsatsen till "stor"?', opts:['gammal','liten','snabb','ung'], c:1 },
    // A2
    { id:'sv_a2_1', level:'A2', q:'Igår ___ jag till affären. (gå)', opts:['går','gick','gått','gå'], c:1 },
    { id:'sv_a2_2', level:'A2', q:'Hon är ___ än sin bror. (lång)', opts:['lång','längre','längst','mest lång'], c:1 },
    { id:'sv_a2_3', level:'A2', q:'___ mycket kostar det? (Hur / Vad)', opts:['Hur','Vad','Vilken','Var'], c:0 },
    { id:'sv_a2_4', level:'A2', q:'Vi ___ kaffe varje morgon. (dricka)', opts:['dricker','drickar','drack','druckit'], c:0 },
    { id:'sv_a2_5', level:'A2', q:'Det finns ___ människor i parken.', opts:['mycket','många','mer','mest'], c:1 },
    // B1
    { id:'sv_b1_1', level:'B1', q:'Jag har bott här ___ tio år.', opts:['sedan','i','för','från'], c:1 },
    { id:'sv_b1_2', level:'B1', q:'Om du studerar, ___ du klara provet.', opts:['skulle','ska','borde','måste'], c:1 },
    { id:'sv_b1_3', level:'B1', q:'Rapporten ___ skriven igår.', opts:['är','var','hade','blev'], c:3 },
    { id:'sv_b1_4', level:'B1', q:'Vad betyder "dock"?', opts:['alltså','men/emellertid','dessutom','eftersom'], c:1 },
    { id:'sv_b1_5', level:'B1', q:'Han frågade mig var jag ___. (bo)', opts:['bor','bodde','bott','bo'], c:1 },
    // B2
    { id:'sv_b2_1', level:'B2', q:'Om hon hade studerat, ___ hon klarat provet.', opts:['hade','skulle ha','har','ska'], c:1 },
    { id:'sv_b2_2', level:'B2', q:'Vad betyder "oaktat"?', opts:['tack vare','trots','dessutom','eftersom'], c:1 },
    { id:'sv_b2_3', level:'B2', q:'Det är nödvändigt att ___ detta. (ta itu med)', opts:['vi tar itu med','vi tar itu','ta itu vi','itu med vi tar'], c:0 },
    { id:'sv_b2_4', level:'B2', q:'"Kinkig" i bildlig bemärkelse betyder:', opts:['enkel','knepig/besvärlig','uppenbar','brådskande'], c:1 },
    { id:'sv_b2_5', level:'B2', q:'Vilket ord passar? "Det är ___ att vi fattar ett beslut."', opts:['hög tid','god tid','lång tid','stor tid'], c:0 },
    // C1
    { id:'sv_c1_1', level:'C1', q:'Vad betyder "omskrivning"?', opts:['Direkt uttryck','Omväg i ord','Stilfigur','Nyord'], c:1 },
    { id:'sv_c1_2', level:'C1', q:'Vad betyder "icke desto mindre"?', opts:['dessutom','trots det','på grund av det','för att'], c:1 },
    { id:'sv_c1_3', level:'C1', q:'"Exacerbera" betyder:', opts:['lindra','förvärra','ignorera','lösa'], c:1 },
    { id:'sv_c1_4', level:'C1', q:'Vad kallas formen "vore" i svenska?', opts:['Presens','Konjunktiv (optativ)','Perfekt','Futurum'], c:1 },
    { id:'sv_c1_5', level:'C1', q:'Vad betyder "dryg" i vardagligt tal?', opts:['generös','arrogant/besvärlig','snål','dum'], c:1 },
    // C2
    { id:'sv_c2_1', level:'C2', q:'Vad kallas ett ord som förekommer bara en gång i en korpus?', opts:['Neologism','Hapax','Arkaism','Lånord'], c:1 },
    { id:'sv_c2_2', level:'C2', q:'"Ikonoklas" syftar på en person som:', opts:['utmanar invanda föreställningar','vördar ikoner','följer traditionen','agerar försiktigt'], c:0 },
    { id:'sv_c2_3', level:'C2', q:'Vem skrev "Röda rummet"?', opts:['Selma Lagerlöf','August Strindberg','Astrid Lindgren','Vilhelm Moberg'], c:1 },
    { id:'sv_c2_4', level:'C2', q:'"Synekdoke" är en figur där man betecknar något med:', opts:['delen för helheten (eller tvärtom)','dess motsats','en explicit jämförelse','orsaken för verkan'], c:0 },
    { id:'sv_c2_5', level:'C2', q:'Vad betyder "parokysm"?', opts:['lägsta intensitet','högsta intensitet av ett fenomen','jämviktstillstånd','processens start'], c:1 },
  ],
}

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export const LEVEL_START = 'B1'  // Adaptive test başlangıç noktası
export const TOTAL_QUESTIONS = 12  // Test başına soru sayısı
