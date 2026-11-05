# نموذج الإعلام بحق العدول (ملحق المادة R221-3)

*ترجمة للنسخة الفرنسية المؤرخة في 02/11/2026؛ النسخة الفرنسية هي المعتمدة. النصوص الرسمية مقتبسة بالفرنسية.*

*نص رسمي (Code de la consommation، قانون الاستهلاك الفرنسي)، النسخة السارية منذ 19 juin 2026، المعدلة بالمرسوم
(*décret*) n° 2026-3 المؤرخ في 5 janvier 2026، المادة 7. المصدر: [Légifrance](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053303407).
نُقل في 02/11/2026 انطلاقا من النص الذي قدمه المشرف على المشروع.*

## التطبيق في Crénelio (عرض الأسعار = عقد خدمة أُبرم عبر الإنترنت)

يُنتج `src/utils/withdrawalNotice.ts` النص المكمَّل على النحو التالي:

| التعليمة | الاختيار | السبب |
|---|---|---|
| (1) | a) « de la conclusion du contrat. »؛ b) « où vous-même […] prend physiquement possession du bien. » إذا تضمن عرض الأسعار توريدا مُعاد بيعه | عقد خدمة: يسري الأجل من قبول عرض الأسعار. التوريد المُعاد بيعه: عقد يُعتبر بيعا (L221-1، II)، والأجل يسري من الحيازة الفعلية (L221-18، 2°)، وتاريخ التسليم يُدخله المهني |
| (2) | المقاولة: الاسم، العنوان، الهاتف، البريد الإلكتروني (`company_name`، `legal_adresse` أو المقر، `pro_phone`، `pro_email`) | التعليمة (2) |
| (3) | النص الأول (وظيفة العدول عبر الإنترنت)، مع عنوان صفحة عرض الأسعار | وظيفة إلزامية لعقد أُبرم عبر الإنترنت |
| (4) | محذوف | البيع: لا محل له، فالمهني يقترح استرجاع السلعة ((5) a) |
| (5) | الخدمة: محذوف (قطع مشتراة باسم الزبون، *débours*). البيع: a) « Nous récupérerons le bien »، b) « Nous prendrons en charge les frais de renvoi du bien. »، c) النص المتعلق بانخفاض القيمة | الخيار الأكثر حماية، معتمد افتراضيا في 05/11/2026؛ يُجعل قابلا للضبط إذا فضّل مهني أن يعيد الزبون السلعة |
| (6) | نص تقديم الخدمات (« la prestation de services ») | تنفيذ مسبق بناء على طلب صريح |

تُنقل فقرة « Effets de rétractation » (آثار العدول) كما هي، بما في ذلك الإشارة إلى مصاريف
التوصيل: فالنموذج تنظيمي ولا تُعاد صياغته.

## نص الملحق

> **INFORMATIONS CONCERNANT L'EXERCICE DU DROIT DE RÉTRACTATION**
>
> **Droit de rétractation**
>
> Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de
> quatorze jours.
>
> Le délai de rétractation expire quatorze jours après le jour (1).
>
> Pour exercer le droit de rétractation, vous devez nous notifier (2) votre décision de rétractation du
> présent contrat au moyen d'une déclaration dénuée d'ambiguïté (par exemple, lettre envoyée par la
> poste ou courrier électronique). Vous pouvez utiliser le modèle de formulaire de rétractation mais ce
> n'est pas obligatoire (3).
>
> Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication
> relative à l'exercice du droit de rétractation avant l'expiration du délai de rétractation.
>
> **Effets de rétractation**
>
> En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements
> reçus de vous, y compris les frais de livraison (à l'exception des frais supplémentaires découlant du
> fait que vous avez choisi, le cas échéant, un mode de livraison autre que le mode moins coûteux de
> livraison standard proposé par nous) sans retard excessif et, en tout état de cause, au plus tard
> quatorze jours à compter du jour où nous sommes informés de votre décision de rétractation du présent
> contrat. Nous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous
> aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d'un moyen différent ;
> en tout état de cause, ce remboursement n'occasionnera pas de frais pour vous (4).
>
> (5)
>
> (6)

*شرح (ترجمة غير رسمية):* يحق للمستهلك العدول عن العقد دون ذكر سبب داخل أجل أربعة عشر يوما، يبدأ من اليوم المحدد في (1). ولممارسة هذا الحق، يبلغ المهني (2) بتصريح لا لبس فيه (رسالة بريدية أو بريد إلكتروني)، ويمكنه استعمال الاستمارة النموذجية دون إلزام (3). ويكفي إرسال الإبلاغ قبل انتهاء الأجل. وفي حالة العدول، يرد المهني جميع المبالغ المقبوضة، بما فيها مصاريف التوصيل العادية، دون تأخير مفرط، وفي أجل أقصاه أربعة عشر يوما من إبلاغه، بنفس وسيلة الأداء ودون مصاريف على المستهلك (4). أما (5) و(6) فتُملآن حسب التعليمات أدناه.

### التعليمات الواجب اتباعها لملء المعلومات

> (1) Insérez l'un des passages suivants entre guillemets :
>
> a) S'il s'agit d'un contrat de service ou d'un contrat portant sur la fourniture d'eau, de gaz ou
> d'électricité lorsqu'ils ne sont pas conditionnés dans un volume délimité ou en quantité déterminée,
> de chauffage urbain ou d'un contenu numérique non fourni sur un support matériel : " de la conclusion
> du contrat. " ;
>
> b) S'il s'agit d'un contrat de vente : " où vous-même, ou un tiers autre que le transporteur et
> désigné par vous, prend physiquement possession du bien. " ;
>
> c) S'il s'agit d'un contrat portant sur plusieurs biens commandés par le consommateur au moyen d'une
> seule commande et si ces biens sont livrés séparément : " où vous-même, ou un tiers autre que le
> transporteur et désigné par vous, prend physiquement possession du dernier bien. " ;
>
> d) S'il s'agit d'un contrat portant sur la livraison d'un bien en plusieurs lots ou pièces : " où
> vous-même, ou un tiers autre que le transporteur et désigné par vous, prend physiquement possession du
> dernier lot ou de la dernière pièce. " ;
>
> e) S'il s'agit d'un contrat portant sur la livraison régulière de biens pendant une période de temps
> déterminée : " où vous-même, ou un tiers autre que le transporteur et désigné par vous, prend
> physiquement possession du premier bien. " ;
>
> (2) Insérez votre nom, votre adresse géographique, votre numéro de téléphone et votre adresse
> électronique.
>
> (3) Si vous êtes tenu de prévoir une fonctionnalité permettant au consommateur de se rétracter du
> contrat conclu en ligne, insérez le texte suivant : “Vous pouvez également exercer votre droit de
> rétractation en ligne sur [insérer l'adresse du site internet ou une autre référence adéquate indiquant
> où se trouve la fonctionnalité de rétractation]. Si vous utilisez cette fonctionnalité en ligne, nous
> vous enverrons, dans les meilleurs délais, un accusé de réception de la rétractation sur un support
> durable (par exemple, par courriel), y compris son contenu ainsi que la date et l'heure de sa
> soumission.”. Si vous offrez au consommateur la faculté de remplir et de transmettre électroniquement
> sa rétractation du contrat sur votre site internet, insérez le texte suivant : “Vous pouvez également
> remplir et transmettre le modèle de formulaire de rétractation ou toute autre déclaration dénuée
> d'ambiguïté sur notre site internet [insérer l'adresse du site internet]. Si vous utilisez cette
> option, nous vous enverrons dans les meilleurs délais un accusé de réception de la rétractation sur un
> support durable (par exemple, par courriel).”
>
> (4) S'il s'agit d'un contrat de vente dans le cadre duquel vous n'avez pas proposé de récupérer le
> bien en cas de rétractation, insérez le texte suivant : " Nous pouvons différer le remboursement
> jusqu'à ce que nous ayons reçu le bien ou jusqu'à ce que vous ayez fourni une preuve d'expédition du
> bien, la date retenue étant celle du premier de ces faits. "
>
> (5) Si le consommateur a reçu des biens dans le cadre du contrat :
>
> a) Insérez : " Nous récupérerons le bien " ; ou " Vous devrez renvoyer ou rendre le bien, à
> nous-mêmes ou à ... [insérer le nom et l'adresse géographique, le cas échéant, de la personne habilitée
> par vous à réceptionner le bien] sans retard excessif et, en tout état de cause, au plus tard quatorze
> jours après que vous nous aurez communiqué votre décision de rétractation du présent contrat. Ce délai
> est réputé respecté si vous renvoyez le bien avant l'expiration du délai de quatorze jours. "
>
> b) Insérez : " Nous prendrons en charge les frais de renvoi du bien. " ; " Vous devrez prendre en
> charge les frais directs de renvoi du bien. " ; Si, dans le cas d'un contrat à distance, vous ne
> proposez pas de prendre en charge les frais de renvoi du bien et que le bien, en raison de sa nature,
> ne peut normalement être renvoyé par la poste : " Vous devrez prendre en charge les frais directs de
> renvoi du bien, ... EUR [insérer le montant]. " ; ou, si le coût de renvoi du bien ne peut
> raisonnablement être calculé à l'avance : " Vous devrez prendre en charge les frais directs de renvoi
> du bien. Ces frais sont estimés à un maximum d'environ ... EUR [insérer le montant]. " ; ou Si, dans le
> cas d'un contrat hors établissement, le bien, en raison de sa nature, ne peut normalement être renvoyé
> par la poste et a été livré au domicile du consommateur au moment de la conclusion du contrat : " Nous
> récupérerons le bien à nos propres frais. " et
>
> c) Insérez : " Votre responsabilité n'est engagée qu'à l'égard de la dépréciation du bien résultant de
> manipulations autres que celles nécessaires pour établir la nature, les caractéristiques et le bon
> fonctionnement de ce bien. "
>
> (6) Dans le cas d'un contrat de prestation de services ou de fourniture d'eau, de gaz ou d'électricité
> lorsqu'ils ne sont pas conditionnés dans un volume délimité ou en quantité déterminée, ou de chauffage
> urbain, insérez le texte suivant : " Si vous avez demandé de commencer la prestation de services ou la
> fourniture d'eau/de gaz/d'électricité/de chauffage urbain [supprimer les mentions inutiles] pendant le
> délai de rétractation, vous devrez nous payer un montant proportionnel à ce qui vous a été fourni
> jusqu'au moment où vous nous avez informé de votre rétractation du présent contrat, par rapport à
> l'ensemble des prestations prévues par le contrat. "
>
> Conformément au I de l'article 20 du décret n° 2026-3 du 5 janvier 2026, ces dispositions, dans leur
> rédaction issue dudit décret, entrent en vigueur le 19 juin 2026.
>
> Conformément au II du même article, les contrats en cours au 19 juin 2026 restent régis par les
> dispositions pertinentes du code des assurances, du code de la consommation, du code monétaire et
> financier, du code de la mutualité et du code de la sécurité sociale, dans leur rédaction antérieure à
> l'entrée en vigueur du présent décret.

*شرح (ترجمة غير رسمية):* (1) يُدرج المقطع المناسب: لعقد الخدمة « de la conclusion du contrat. »، وللبيع تاريخ الحيازة الفعلية للسلعة (أو لآخر سلعة أو آخر دفعة، أو لأول سلعة في التسليم المنتظم). (2) اسم المهني وعنوانه الجغرافي ورقم هاتفه وبريده الإلكتروني. (3) نص وظيفة العدول عبر الإنترنت، أو نص الاستمارة القابلة للملء على الموقع، مع الإشعار بالتوصل على حامل دائم. (4) في البيع دون اقتراح استرجاع السلعة: إمكانية تأجيل الاسترداد إلى حين تسلم السلعة أو إثبات إرسالها. (5) إذا تسلم المستهلك سلعا: من يسترجعها أو يعيدها وفي أي أجل (a)، ومن يتحمل مصاريف الإعادة (b)، والمسؤولية عن انخفاض قيمة السلعة (c). (6) في تقديم الخدمات: إذا طلب المستهلك البدء خلال أجل العدول، يدفع مبلغا متناسبا مع ما قُدم له حتى إبلاغه بالعدول. وحسب المادة 20 من المرسوم n° 2026-3، تسري هذه الأحكام في 19 juin 2026، وتبقى العقود الجارية في هذا التاريخ خاضعة للصيغة السابقة.
