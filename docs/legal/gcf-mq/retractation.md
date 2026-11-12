# Rétractation : kontra a distans ou lakay kliyan-an

*Tradiksyon vèsyon fransé fich-la di 04/11/2026 ; sé vèsyon fransé-a ki ka fè fwa. Tèks ofisyèl-la sité an fransé.*

*Dènié vérifikasyon : 04/11/2026 (tèks ofisyèl : [textes/code-consommation.md](../fr/textes/code-consommation.md)). Sous : fich DGCCRF « Dépannage à domicile » (ofisyèl) ; INC ;
sous ségondè asou L221-25. Atik Code de la consommation pou rilì adan vèsyon
konsolidé yo (gadé [sous-la](../sources.md)).*

## Prensip

An devis kliyan-an aksèpté **an liy** (kontra a distans) ou **siyé lakay** kliyan-an (kontra *hors
établissement*) ka ba kliyan patikilié-a an **délè *rétractation* 14 jou** (tan pou i chanjé lidé épi kasé kontra-a, C. consom.
L221-18). Pwofesyonèl-la dwèt di'y sa avan kontra-a fèt, épi ba'y :

> « un exemplaire du contrat au consommateur sur papier signé par les parties ou avec accord du
> consommateur sur support durable. Ce contrat doit être accompagné du formulaire type de rétractation et
> comprendre sous peine de nullité les informations des articles L. 111-1 et L. 111-2 du Code de la
> consommation. » (fiche DGCCRF)

Esplikasyon (tradiksyon ki pa ofisyèl) : an légzanplè kontra-a asou papié siyé pa lé dé moun-lan, ou
asou an *support durable* (sipò ki ka rété, kon an imèl) si kliyan-an dakò ; épi fòmilè-tip rétractation-an
épi, si-pa sa kontra-a nil, tout enfòmasyon atik L. 111-1 épi L. 111-2.

Si enfòmasyon asou rétractation-an manké, délè-a ka alonjé di douz mwa (L221-20, konfirmé).

## Èksèpsyon : ijans

Pa ni rétractation pou « travaux d'entretien ou de réparation à réaliser en urgence au domicile du
consommateur et expressément sollicités par lui » (L221-28, 8°, sité pa INC) — sa vlé di travay antretyen ou réparasyon an ijans lakay kliyan-an, kliyan-an menm ki mandé'y klè —, **sèlman pou pyès
épi travay ki rèd nésésè pou réponn ijans-lan** (fich
DGCCRF). Ijans sé « la nécessité de faire cesser un danger pour la sécurité des personnes
ou l'intégrité des locaux » (fok arété an danjé pou sékirité moun ou pou lokal-la).

Tout travay **an plis** ki pwopozé asou plas toujou ni délè 14 jou-a.

## Koumansé avan délè-a fini

Dapré L221-25 (tèks ofisyèl anlè-a) : pwofesyonèl-la pé koumansé avan délè-a fini
sèlman si kliyan-an **mandé'y klè** (*demande expresse*) ; si kliyan-an rétracté apré, i ka dwè an lajan ki pwopòsyonèl
a sa ki ja fèt. San demande expresse ki anrèjistré, kliyan-an pa dwè ayen.

## Sa tèks ofisyèl-la ka di (vérifié 04/11/2026)

Tèks konplè : [textes/code-consommation.md](../fr/textes/code-consommation.md).

- **Définisyon** (L221-1) : kontra **a distans** = kontra ki fèt san lé dé moun-lan pa la ansanm, sèlman
  pa kominikasyon a distans jiska kontra-a fèt ; kontra **hors
  établissement** = kontra ki fèt lé dé moun-lan la ansanm, déwò koté pwofesyonèl-la ka travay abitid, **menm lè
  sé kliyan-an ki kriyé'y** (devis siyé lakay kliyan-an), ou a distans
  tousuit apré pwofesyonèl-la vin wè'y pèsonèlman déwò koté-tala. An kontra ki ka bay pwopriyété an byen **épi**
  ki ka ba an prèstasyon **sé kon an vant** (II) : véyé sa pou
  liy « fourniture revendue » (founiti révann) (délè-a ka koumansé lè kliyan-an risivwè byen-an).
- **Délè** (L221-18) : katòz jou dépi **kontra-a fèt** pou an prèstasyon
  sèvis. **Kalkil** (L221-19) : jou kontra-a fèt pa ka konté ; délè-a ka fini a lafen
  dènié jou-a ; si sé an sanmdi, an dimanch ou an jou féryé ou chomé, i ka alonjé jiska
  prèmié jou travay apré. → `Quote::withdrawalDeadline` (jou féryé légal, Pak kalkilé).
- **Enfòmasyon ki manké** (L221-20) : délè-a ka alonjé di douz mwa ; i ka viré katòz jou dépi
  kliyan-an risivwè enfòmasyon-an si yo ba'y li antan-an.
- **Ègzékisyon an avans** (L221-25) : demande expresse ki anrèjistré « par tout moyen » (pa tout mwayen) a distans, « sur
  papier ou sur support durable » (asou papié ou asou sipò ki ka rété) hors établissement ; pwofesyonèl-la **ka mandé kliyan-an
  rikonnèt** ki, lè travay-la fini nèt, i pé pa rétracté ankò. San demande
  expresse ki anrèjistré, ou san enfòmasyon 9° L221-5-la, **kliyan-an pa dwè pyès lajan**.
  → tèks kaz-la konplété (paj, vèsyon pou enprimé, imèl akò).
- **Èksèpsyon** (L221-28) : 1° sèvis fèt nèt avan délè-a fini, épi akò klè kliyan-an épi
  i rikonnèt i pèd dwa-a → `Quote::canWithdraw` ka réfizé rétractation-an lè rendez-vous
  devis-la « terminé » (fini) épi kliyan-an té mandé ègzékisyon an avans ; 8° travay ijan
  kliyan-an mandé klè, sèlman pou sa ki rèd nésésè.
- **Enfòmasyon** (L221-5, 7° épi 10°) : kondisyon, délè, modalité, fòmilè-tip épi koté
  fonksyon rétractation-an yé ; si dwa-a pa ka ègzisté (ijans), fok di kliyan-an i pa ni'y.
- **Hors établissement** (L221-9) : an légzanplè daté kontra-a, papié siyé ou sipò ki ka rété, épi
  tout enfòmasyon L221-5 **épi fòmilè-tip-la**. (L221-10) : **pyès péman ni
  kontrapati avan sèt jou** dépi kontra-a fèt, sòf travay ijan (4°). Kalkil (vérifyé 12/11/2026, C. proc. civ. 641 épi 642, règleman 1182/71 art. 3, ki dakò) : jou akò-a pa ka
  kontè, délè-a ka fini sétyèm jou-a a 24 è, é i ka alonjé jis prèmié jou travay si i tonbé an sanmdi, an
  dimanch ou an jou féryé ; Crénelio ka afiché prèmié jou ou pé fè péyé anlè « Préparer la facture »
  (paré faktiw-la) (jou féryé Lafrans métwopolitèn li asou API Jours fériés). An devis aksèpté **an liy jis
  apré vizit ou** lakay kliyan-an sé osi an kontra hors établissement (L221-1, 2°, b).
- **Fonksyon an liy** (D221-5, kréyé pa décret n° 2026-3) : libèlé « renoncer au contrat ici » (kité kontra-a isi) épi
  « confirmer la rétractation » (konfirmé rétractation-an), déklarasyon (non épi tinon, kontra, mwayen élèktwonik pou akizé risépsyon-an),
  *accusé de réception* (prèv ki ou risivwè) ki ka rété kontni-a, dat-la épi lè-a. Konfòm a sa ki fèt adan Crénelio.
- **Fòmilè-tip** (annexe à l'article R221-1, décret n° 2022-424) : rété mo pou mo adan
  vèsyon pou enprimé-a.

## Kijan sèvi dwa-a : atik L221-21 (vèsyon 19 juin 2026)

*Tèks ofisyèl, rédaksyon ki sòti adan ordonnance n° 2026-2 du 5 janvier 2026 (art. 26 : an vigè
19 juin 2026 ; kontra ki té ka kouri dat-tala ka rété anba tèks avan-an). Rikopié 02/11/2026
apati tèks mentnè-a bay.*

> Le consommateur exerce son droit de rétractation en informant le professionnel de sa décision de se
> rétracter par l'envoi, avant l'expiration du délai prévu à l'article L. 221-18, du formulaire de
> rétractation mentionné au 7° de l'article L. 221-5 ou de toute autre déclaration, dénuée d'ambiguïté,
> exprimant sa volonté de se rétracter.
>
> Le professionnel peut également permettre au consommateur de remplir et de transmettre en ligne, sur
> son site internet, le formulaire ou la déclaration prévus au premier alinéa. Dans cette hypothèse, le
> professionnel communique, sans délai, au consommateur un accusé de réception de la rétractation sur un
> support durable.
>
> Pour les contrats conclus à distance au moyen d'une interface en ligne, le professionnel met à la
> disposition du consommateur, sans frais pour ce dernier, une fonctionnalité lui permettant d'exercer
> gratuitement son droit de rétractation avant l'expiration du délai prévu à l'article L. 221-18.
>
> Un décret fixe les modalités de présentation et d'utilisation de cette fonctionnalité, de nature à
> garantir un accès facile, direct et permanent du consommateur à celle-ci.

Esplikasyon (tradiksyon ki pa ofisyèl) : kliyan-an ka rétracté lè i voyé ba pwofesyonèl-la, avan délè-a
fini, fòmilè rétractation-an ou nenpòt lòt déklarasyon klè. Pwofesyonèl-la pé osi kité'y ranpli épi voyé'y
an liy ; konsa, i dwèt voyé'y tousuit an akizé risépsyon asou an sipò ki ka rété. Pou kontra ki fèt a
distans pa an entèfas an liy, pwofesyonèl-la dwèt ba kliyan-an, gratis, an fonksyon pou rétracté avan
délè-a fini. An décret ka fiksé kijan fonksyon-tala dwèt prézanté, pou kliyan-an pé jwenn li fasil,
dirèkt épi tout tan.

**Sa ki ka koresponn adan Crénelio**

| Sa L221-21 ka mandé | Sa ki fèt |
|---|---|
| Fòmilè ou nenpòt déklarasyon klè | Fòmilè rétractation pou enprimé ; imèl épi adrès lantrépriz-la adan modèl enfòmasyon-an |
| Voyé avan délè-a fini | Rétractation an liy aksèpté jiska `withdrawal_until` (jou-tala ka konté) ; dat déklarasyon-an anrèjistré |
| Akizé risépsyon tousuit, asou sipò ki ka rété | Imèl ka pati dè ki konfirmasyon-an fèt (`QuoteNotifier::sendWithdrawal`), anrèjistré adan jounal-la |
| Fonksyon gratis pou kontra ki fèt pa an entèfas an liy | Bouton « Renoncer au contrat ici » (kité kontra-a isi) asou paj devis-la, san kont ni frè |
| Fasil, dirèkt épi tout tan (décret) | Menm lien ki ta akò-a (imèl), bouton-an ka parèt pannan tout délè-a |

## Fonksyon rétractation an liy (dépi 19 juin 2026)

Ordonnance n° 2026-2 épi décret n° 2026-3 du 5 janvier 2026 (transpozisyon direktiv (UE)
2023/2673) ka mandé, pou tout kontra a distans ki fèt **pa an entèfas an liy**, an fonksyon
rétractation gratis (**konfirmé pa atik D221-5**, tèks adan [textes/code-consommation.md](../fr/textes/code-consommation.md)) :

- ki ka pòté mo « **renoncer au contrat ici** » (kité kontra-a isi) ou an lòt fòmil klè ;
- ki vizib, ki fasil pou jwenn dirèkman **pannan tout délè** rétractation-an ;
- kliyan-an ka maké ou konfirmé **non épi tinon'y**, **kontra-a** épi **mwayen
  élèktwonik** pou i risivwè akizé risépsyon-an, apré sa i ka validé épi « **confirmer la rétractation** » (konfirmé rétractation-an) ;
- **akizé risépsyon** asou sipò ki ka rété, adan an délè rézonab, ki ka rété kontni
  déklarasyon-an épi **dat épi lè** i voyé ;
- enfòmasyon avan kontra-a ka di koté fonksyon-tala yé ;
- sanksyon : lanmann administratif jiska 15 000 € (moun) ou 75 000 € (sosyété).

Modèl enfòmasyon-an (annexe à l'article R221-3) chanjé pou sa (vèsyon an vigè
19 juin 2026) : tèks ofisyèl épi chwa aplikasyon adan [retractation-modele.md](retractation-modele.md).

## Adan Crénelio

- Kaz « intervention urgente » (entèvansyon ijan) asou devis-la : ni délè ni fonksyon rétractation.
- Si-pa sa, pou aksèpté, kliyan-an ka konfirmé i konnèt dwa'y ; i pé mandé
  ègzékisyon an avans (an lòt kaz) ; lafen délè-a anrèjistré (`withdrawal_until`).
- Paj devis-la (`/devis/:token`) : enfòmasyon asou délè-a épi koté fonksyon-an yé avan
  akò-a ; apré akò-a, bouton « Renoncer au contrat ici » (kité kontra-a isi), déklarasyon (non, imèl pou akizé-a,
  kontra-a rapélé), bouton « Confirmer la rétractation » (konfirmé rétractation-an) ; estati `withdrawn`, déklarasyon-an gadé
  (`withdrawn_at`, `withdrawal_name`, `withdrawal_email`, IP).
- Akizé risépsyon pa imèl ba kliyan-an (kontni, dat épi lè) épi avi ba pwofesyonèl-la (ranbousé
  adan 14 jou) ; imèl akò-a ka rapélé dat limit-la épi koté fonksyon-an yé.
- Lè : koneksyon MySQL-la alinyé asou fizo orè aplikasyon-an.
- Paj devis-la : modèl enfòmasyon réglemantè-a ka parèt mo pou mo (`src/utils/withdrawalNotice.ts`).
- **Fòmilè an liy ki ja ranpli** (`/devis/:token/retractation`) : modèl annexe R221-1-la mo pou
  mo, voyé pa fonksyon rétractation-an ; **PDF pou ranpli** jwenn épi imèl akò-a ;
  déklarasyon validé-a pé téléchajé an PDF épi i jwenn épi akizé-a. Yo ka di kliyan-an i ni
  fasilité-tala (tèks `ONLINE_FORM_NOTICE`, déwò modèl réglemantè-a).
- **Avan kontra-a** (L221-5, 7°, 10/11/2026) : fòmilè tip-la (PDF pou ranpli, san dat dakò ni lyen an liy, pas fonksyon an liy-la ka maché sèlman apré dakò-a) ka jwenn épi imèl ki ka voyé dévi-a, si sé pa an ijans ; i ka rété osi adan vèsyon pou enprimé-a.
- **Légzanplè kontra-a** (L221-9) : imèl ki pati ba kliyan-an apré akò'y ka rété tout
  enfòmasyon kontra-a, modèl enfòmasyon-an épi fòmilè-tip-la (`LegalTexts.php`).
- Vèsyon pou enprimé (`/devis/:token/imprimer`) : modèl enfòmasyon-an adan devis-la ; fòmilè-tip
  annexe atik R221-1-la, **mo pou mo** (konfirmé 04/11/2026).
