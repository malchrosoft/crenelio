# Achat-revente founiti (pyès révann)

*Tradiksyon vèsyon fransé fich-la di 01/11/2026 ; sé vèsyon fransé-a ki ka fè fwa. Tèks ofisyèl-la sité an fransé.*

*Dènié vérifikasyon : 01/11/2026. Sous : Portail auto-entrepreneur (débours épi frè yo ka fè péyé,
rézimé) ; règ rèjim mikwo-antreprenè-a pou rilì asou sit ofisyèl-la (URSSAF, guichet unique)
avan ou aktivé ayen. Gadé [sous-la](../sources.md).*

## Sa sa yé

Pwofesyonèl-la ka achté pyès-la **an non'y**, apré sa i ka fè kliyan-an péyé'y (épi ou san mawj). Sé an
***vente de marchandises*** (vant machandiz), apa di prèstasyon sèvis-la. Pa mélanjé'y épi
[débours](debours.md), koté pyès-la achté an non épi pou kont kliyan-an.

## Sa sa ka fè pou an antreprenè endividyèl (mikwo-antrépriz)

- Montan ki révann-lan **ka rantré adan *chiffre d'affaires*-la** (lajan lantrépriz-la fè) (Portail auto-entrepreneur ka konséyé pa fè
  sa pou rézon-tala : i ka fè kotizasyon-yan monté).
- Vant machandiz ni **pwòp plafon** chiffre d'affaires li épi **pwòp to**
  kotizasyon li ; épi prèstasyon sèvis, aktivité-a ka vin **mixte** (mélanjé) épi dé chif-la
  ka suiv apa (montan an vigè : Item 39, pou vérifyé chak lanné).
- Aktivité vant-lan dwèt **déklaré** (guichet unique) si i pa ja déklaré.
- Pwofesyonèl-la ka vin **vandè** : faktiw achat an non'y, garanti légal i dwè kliyan-an asou
  pyès-la, stòk si ni.

## TVA asou pyès ki posé (pwofesyonèl ki ka péyé TVA)

BOI-TVA-BASE-10-20-40-20, § 140 épi 150 ([textes/bofip.md](../fr/textes/bofip.md)) : ***fournitures***
(matiè yo ka transfòmé ou ka konsonmé) ka suiv pri sèvis-la ; ***pièces détachées*** (pyès
normalizé yo ka senpman posé) sé an **vant épi pwòp to yo**, sòf si valè yo
pli ba pasé valè pòz-la ou si yo té adapté. Senplifikasyon ki aksèpté : pyès épi founiti
ka suiv rèjim prèstasyon-an si valè total yo **pa ka dépasé 50 % kou total-la** ; si-pa sa,
vant pyès-la mansyonné **apa** asou faktiw-la.

Adan Crénelio (devis épi TVA) : éditè-a ka kalkilé pa liy « fourniture revendue » (founiti révann) adan
kou total san tax-la (débours pa ladan, déwò chiffre d'affaires) épi i ka rapélé'y anba liy-yan : jiska 50 %, menm
to ki prèstasyon-an ; pasé sa, pwòp to pyès-la, asou liy apa (sa devis-la ja ka fè). An devis ki ni an founiti révann sé kon an **vant** (C. consom. L221-1, II) : délè
rétractation-an ka koumansé lè yo ba kliyan-an pyès-la (L221-18, 2°), dat pou maké adan devis
ki aksèpté-a ; gadé [retractation-modele.md](retractation-modele.md).

Kontwòl TVA-a sé **pou enfòmasyon** : an prensip yo ka konparé pyès pa pyès, épi sèl
pwofesyonèl-la sav si an pyès té adapté. To-a sé chwa'y, pou validé épi kontab-li.

## Sosyété

Révant-lan dwèt rantré adan ***objet social***-la (sa sosyété-a fèt pou fè) ; pyès-la faktiré épi TVA sosyété-a.

## Adan Crénelio

- API-a ka réfizé liy « fourniture revendue » (founiti révann) toutotan `quote_allow_supply` pa aktivé.
- Aktivasyon-an ka pasé pa an **avètisman** dapré fòm juridik-la (`legal_form`), pou aksèpté
  klè ; rèkòmandasyon pa défo : débours-la.
