<?php
/**
 * SimplePdf — Générateur de PDF minimal, sans bibliothèque ni extension optionnelle (offre Starter :
 * PHP natif, mbstring seulement). Pages A4, texte en Helvetica (encodage WinAnsi), retour à la ligne,
 * traits, et **champs de formulaire remplissables** (AcroForm) pour le formulaire de rétractation.
 *
 * Coordonnées en points depuis le **coin supérieur gauche** (converties pour le PDF).
 */

class SimplePdf
{
    public const WIDTH = 595.28;
    public const HEIGHT = 841.89;
    public const MARGIN = 56.0;

    /** Largeurs Helvetica (1/1000 em), caractères 32 à 126 ; les autres prennent la largeur de leur lettre de base. */
    private const W = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,
        556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,
        667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,
        556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
    private const WB = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,
        556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,
        667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,
        611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];

    /** @var array<int, string> Flux de contenu par page */
    private array $pages = [];
    /** @var array<int, array<int, array{name: string, rect: float[], value: string, multiline: bool}>> */
    private array $fields = [];
    private float $y = self::MARGIN;

    public function __construct(private string $title = '')
    {
        $this->addPage();
    }

    public function addPage(): void
    {
        $this->pages[] = '';
        $this->fields[] = [];
        $this->y = self::MARGIN;
    }

    public function y(): float
    {
        return $this->y;
    }

    public function moveDown(float $points): void
    {
        $this->y += $points;
    }

    /** Largeur d'un texte (UTF-8) en points. */
    public function textWidth(string $text, float $size, bool $bold = false): float
    {
        $widths = $bold ? self::WB : self::W;
        $total = 0;
        foreach (mb_str_split(self::ascii($text)) as $char) {
            $code = ord($char);
            $total += $widths[$code - 32] ?? 556;
        }
        return $total * $size / 1000;
    }

    /**
     * Paragraphe avec retour à la ligne automatique et saut de page ; avance le curseur.
     * `$indent` décale le bloc vers la droite (listes).
     */
    public function paragraph(string $text, float $size = 10, bool $bold = false, float $after = 6, float $indent = 0): void
    {
        $width = self::WIDTH - 2 * self::MARGIN - $indent;
        $leading = $size * 1.35;
        foreach (preg_split("/\n/", $text) as $source) {
            $line = '';
            foreach (preg_split('/\s+/', trim($source)) as $word) {
                $candidate = $line === '' ? $word : "$line $word";
                if ($line !== '' && $this->textWidth($candidate, $size, $bold) > $width) {
                    $this->writeLine($line, $size, $bold, $leading, $indent);
                    $line = $word;
                } else {
                    $line = $candidate;
                }
            }
            $this->writeLine($line, $size, $bold, $leading, $indent);
        }
        $this->y += $after;
    }

    /** Trait horizontal sur toute la largeur utile. */
    public function rule(float $after = 10): void
    {
        $this->ensureSpace(4);
        $y = self::HEIGHT - $this->y;
        $this->pages[count($this->pages) - 1] .= sprintf("0.6 w %.2F %.2F m %.2F %.2F l S\n", self::MARGIN, $y, self::WIDTH - self::MARGIN, $y);
        $this->y += $after;
    }

    /**
     * Champ remplissable (AcroForm) précédé de son libellé, sur toute la largeur utile ; `$value` le
     * préremplit. Hauteur plus grande pour un champ sur plusieurs lignes (adresse, signature).
     */
    public function field(string $name, string $label, string $value = '', float $height = 20, bool $multiline = false): void
    {
        $this->paragraph($label, 10, false, 2);
        $this->ensureSpace($height + 8);
        $top = $this->y;
        $rect = [self::MARGIN, self::HEIGHT - $top - $height, self::WIDTH - self::MARGIN, self::HEIGHT - $top];
        $this->pages[count($this->pages) - 1] .= sprintf(
            "0.75 0.75 0.75 RG 0.5 w %.2F %.2F %.2F %.2F re S 0 0 0 RG\n",
            $rect[0], $rect[1], $rect[2] - $rect[0], $rect[3] - $rect[1]
        );
        $this->fields[count($this->pages) - 1][] = ['name' => $name, 'rect' => $rect, 'value' => $value, 'multiline' => $multiline];
        $this->y += $height + 10;
    }

    /** Document PDF complet. */
    public function output(): string
    {
        $objects = [];
        $add = function (string $body) use (&$objects): int {
            $objects[] = $body;
            return count($objects);
        };
        $catalogId = $add('');
        $pagesId = $add('');
        $fontId = $add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        $boldId = $add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

        $pageIds = [];
        $fieldIds = [];
        foreach ($this->pages as $index => $content) {
            $streamId = $add(sprintf("<< /Length %d >>\nstream\n%s\nendstream", strlen($content), $content));
            $annots = [];
            foreach ($this->fields[$index] as $field) {
                $flags = $field['multiline'] ? 4096 : 0;
                // Apparence de la valeur préremplie : affichée même par les lecteurs qui ne la génèrent pas
                [$x1, $y1, $x2, $y2] = $field['rect'];
                $w = $x2 - $x1;
                $h = $y2 - $y1;
                $text = $field['value'] === '' ? '' : sprintf('BT /Helv 10 Tf 0 g 3 %.2F Td %s Tj ET', $h - 13, self::string($field['value']));
                $appearance = "/Tx BMC q $text Q EMC";
                $apId = $add(sprintf(
                    "<< /Type /XObject /Subtype /Form /BBox [0 0 %.2F %.2F] /Resources << /Font << /Helv %d 0 R >> >> /Length %d >>\nstream\n%s\nendstream",
                    $w, $h, $fontId, strlen($appearance), $appearance
                ));
                $id = $add(sprintf(
                    '<< /Type /Annot /Subtype /Widget /FT /Tx /F 4 /T %s /V %s /Ff %d /Rect [%.2F %.2F %.2F %.2F] /DA (/Helv 10 Tf 0 g) /MK << /BC [0.75 0.75 0.75] >> /AP << /N %d 0 R >> >>',
                    self::string($field['name']), self::string($field['value']), $flags, ...[...$field['rect'], $apId]
                ));
                $annots[] = "$id 0 R";
                $fieldIds[] = "$id 0 R";
            }
            $pageIds[] = $add(sprintf(
                '<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %.2F %.2F] /Resources << /Font << /F1 %d 0 R /F2 %d 0 R >> >> /Contents %d 0 R%s >>',
                $pagesId, self::WIDTH, self::HEIGHT, $fontId, $boldId, $streamId,
                $annots ? ' /Annots [' . implode(' ', $annots) . ']' : ''
            ));
        }
        $objects[$pagesId - 1] = sprintf('<< /Type /Pages /Kids [%s] /Count %d >>', implode(' ', array_map(fn($id) => "$id 0 R", $pageIds)), count($pageIds));
        $acroForm = $fieldIds
            ? sprintf(' /AcroForm << /Fields [%s] /NeedAppearances true /DA (/Helv 10 Tf 0 g) /DR << /Font << /Helv %d 0 R >> >> >>', implode(' ', $fieldIds), $fontId)
            : '';
        $objects[$catalogId - 1] = sprintf('<< /Type /Catalog /Pages %d 0 R%s >>', $pagesId, $acroForm);
        $infoId = $add(sprintf('<< /Title %s /Producer (Crenelio) >>', self::string($this->title)));

        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [];
        foreach ($objects as $i => $body) {
            $offsets[] = strlen($pdf);
            $pdf .= ($i + 1) . " 0 obj\n$body\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= 'xref' . "\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }
        return $pdf . sprintf("trailer\n<< /Size %d /Root %d 0 R /Info %d 0 R >>\nstartxref\n%d\n%%%%EOF\n", count($objects) + 1, $catalogId, $infoId, $xref);
    }

    private function writeLine(string $line, float $size, bool $bold, float $leading, float $indent): void
    {
        $this->ensureSpace($leading);
        $this->y += $size;
        $this->pages[count($this->pages) - 1] .= sprintf(
            "BT /%s %.1F Tf %.2F %.2F Td %s Tj ET\n",
            $bold ? 'F2' : 'F1', $size, self::MARGIN + $indent, self::HEIGHT - $this->y, self::string($line)
        );
        $this->y += $leading - $size;
    }

    private function ensureSpace(float $height): void
    {
        if ($this->y + $height > self::HEIGHT - self::MARGIN) {
            $this->addPage();
        }
    }

    /** Chaîne PDF littérale en WinAnsi, caractères spéciaux échappés. */
    private static function string(string $text): string
    {
        $encoded = mb_convert_encoding($text, 'Windows-1252', 'UTF-8');
        return '(' . strtr($encoded, ['\\' => '\\\\', '(' => '\\(', ')' => '\\)', "\r" => '', "\n" => '\\n']) . ')';
    }

    /** Lettre de base d'un caractère accentué (calcul des largeurs). */
    private static function ascii(string $text): string
    {
        $plain = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        return $plain === false ? $text : $plain;
    }
}
