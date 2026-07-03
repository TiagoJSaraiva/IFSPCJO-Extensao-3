const fs = require("fs");
const path = require("path");

const ROOT_DIR = __dirname;

const TEMPLATE_PATH = path.join(ROOT_DIR, "template.html");

const PUBLIC_DIR = path.join(ROOT_DIR, "../recursos");
const MATERIAIS_DIR = path.join(PUBLIC_DIR, "materiais");

const DIST_DIR = path.join(ROOT_DIR, "../dist");
const DIST_HTML_PATH = path.join(DIST_DIR, "index.html");

const ICON_BY_EXTENSION = {

  /**
   *  @description
   *  Objeto literal responsável por relacionar a extensão dos arquivos em /recursos/materiais
   *  com os ícones em /recursos/icones.
   * 
   *  Esse objeto é usado pra cada link, para que cada material seja renderizado no HTML final
   *  com o ícone correto tendo como base a extensão.
   * 
   *  A princípio, todas as extensões estão cobertas (talvez até mais do que o essencial),
   *  então só mexa se for absolutamente necessário.
   */

  ".pdf": "pdf.png",

  ".mp4": "video.png",
  ".webm": "video.png",
  ".mov": "video.png",
  ".avi": "video.png",
  ".mkv": "video.png",

  ".html": "html.png",
  ".htm": "html.png",

  ".png": "image.png",
  ".jpg": "image.png",
  ".jpeg": "image.png",
  ".webp": "image.png",
  ".gif": "image.png",

  ".doc": "document.png",
  ".docx": "document.png",

  ".ppt": "presentation.png",
  ".pptx": "presentation.png",

  ".xls": "spreadsheet.png",
  ".xlsx": "spreadsheet.png",

  ".zip": "zip.png",
  ".rar": "zip.png",
  ".7z": "zip.png"
};

const EXTERNAL_LINK_CARDS = [

  /**
   *  @description
   *  Array de objetos representando cards de materiais acessíveis via links externos.
   */

];

const EMBEDDED_YOUTUBE_VIDEOS = [

  /**
   *  @description
   *  Array de objetos representando vídeos do YouTube que serão incorporados na página.
   */

  {
    label: "YouTube",
    href: "https://youtu.be/tXLCOGXfd7o",
    icon: "youtube.png",
    typeLabel: "link para página com vídeo"
  },
]

const TYPE_LABEL_BY_EXTENSION = {
  /**
   *  @description 
   *  Mapeia extensões de arquivo para descrições legíveis usadas em textos acessíveis,
   *  principalmente no aria-label dos cards.
   *
   *  Essa constante NÃO define o ícone do card. Para isso, use ICON_BY_EXTENSION.
   * 
   *  Exemplo:
   *  arquivo "apostila.pdf" + tipo "PDF"
   *  gera um aria-label como:
   *  "Abrir material Apostila em PDF, abre em nova aba"
   *
   *  Prefira descrições compreensíveis para o usuário, como "vídeo", "imagem",
   *  "planilha" ou "arquivo compactado", em vez de apenas repetir a extensão,
   *  especialmente quando a extensão for pouco clara.
   *
   *  Se uma extensão não estiver listada aqui, o script usa "arquivo" como fallback.
   */
  ".pdf": "PDF",

  ".mp4": "vídeo",
  ".webm": "vídeo",
  ".mov": "vídeo",
  ".avi": "vídeo",
  ".mkv": "vídeo",

  ".html": "página HTML",
  ".htm": "página HTML",

  ".png": "imagem",
  ".jpg": "imagem",
  ".jpeg": "imagem",
  ".webp": "imagem",
  ".gif": "imagem",

  ".doc": "documento",
  ".docx": "documento",

  ".ppt": "apresentação",
  ".pptx": "apresentação",

  ".xls": "planilha",
  ".xlsx": "planilha",

  ".zip": "arquivo compactado",
  ".rar": "arquivo compactado",
  ".7z": "arquivo compactado"
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }

  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }

  ensureDir(destination);

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function listFilesRecursively(dirPath, baseDir = dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files;
}

function normalizeLabel(filePath) {
  const parsedPath = path.parse(filePath);

  return parsedPath.name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function encodePathForHref(filePath) {
  return filePath
    .split(path.sep)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function getIconForFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  return ICON_BY_EXTENSION[extension] ?? "file.png";
}

function getTypeLabelForFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  return TYPE_LABEL_BY_EXTENSION[extension] ?? "arquivo";
}

function getExternalLinkCards() {
  return EXTERNAL_LINK_CARDS.map((linkCard) => {
    return {
      label: linkCard.label,
      typeLabel: linkCard.typeLabel,
      href: linkCard.href,
      iconSrc: `./icones/${encodeURIComponent(linkCard.icon)}`,
      ariaPrefix: "Abrir link"
    };
  });
}

function getMaterialCards() {
  if (!fs.existsSync(MATERIAIS_DIR)) {
    throw new Error(`Pasta de materiais não encontrada: ${MATERIAIS_DIR}`);
  }

  return listFilesRecursively(MATERIAIS_DIR)
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((filePath) => {
      const label = normalizeLabel(filePath);
      const typeLabel = getTypeLabelForFile(filePath);
      const icon = getIconForFile(filePath);

      return {
        label,
        typeLabel,
        href: `./materiais/${encodePathForHref(filePath)}`,
        iconSrc: `./icones/${encodeURIComponent(icon)}`,
        ariaPrefix: "Abrir material"
      };
    });
}

function renderCard(card) {
  const escapedLabel = escapeHtml(card.label);
  const escapedTypeLabel = escapeHtml(card.typeLabel);
  const escapedHref = escapeHtml(card.href);
  const escapedIconSrc = escapeHtml(card.iconSrc);
  const escapedAriaPrefix = escapeHtml(card.ariaPrefix);

  return `
          <li class="material-item">
            <a
              class="material-card"
              href="${escapedHref}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="${escapedAriaPrefix} ${escapedLabel} em ${escapedTypeLabel}, abre em nova aba"
            >
              <img
                class="material-icon"
                src="${escapedIconSrc}"
                alt=""
                aria-hidden="true"
                loading="lazy"
              />
              <span class="material-label">${escapedLabel}</span>
            </a>
          </li>`;
}

function renderEmptyMaterialsMessage() {
  return `
          <li class="empty-materials">
            Nenhum material foi encontrado.
          </li>`;
}

function renderCards(cards) {
  if (cards.length === 0) {
    return renderEmptyMaterialsMessage();
  }

  return cards.map(renderCard).join("\n");
}

function build() {
  cleanDir(DIST_DIR);

  copyDir(PUBLIC_DIR, DIST_DIR);

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  const materialCards = getMaterialCards();
  const externalLinkCards = getExternalLinkCards();

  const allCards = [
    ...materialCards,
    ...externalLinkCards
  ];

  const cardsHtml = renderCards(allCards);

  const finalHtml = template.replaceAll("{{MATERIAL_CARDS}}", cardsHtml);

  fs.writeFileSync(DIST_HTML_PATH, finalHtml, "utf8");

  console.log("Build concluído.");
  console.log(`Materiais encontrados: ${materialCards.length}`);
  console.log(`Links externos encontrados: ${externalLinkCards.length}`);
  console.log(`Cards gerados: ${allCards.length}`);
  console.log(`Arquivo gerado: ${DIST_HTML_PATH}`);
}

build();