const fs = require("fs");
const path = require("path");

const ROOT_DIR = __dirname;

const TEMPLATE_PATH = path.join(ROOT_DIR, "template.html");
const YOUTUBE_TEMPLATE_PATH = path.join(ROOT_DIR, "embbeded-youtube-page-template.html");
const SOURCE_CSS_PATH = path.join(ROOT_DIR, "styles.css");
const SOURCE_LOGO_PATH = path.join(ROOT_DIR, "logo.png");

const PUBLIC_DIR = path.join(ROOT_DIR, "../recursos");
const MATERIAIS_DIR = path.join(PUBLIC_DIR, "materiais");

const MATERIAL_LABELS = {
  "pdf1.pdf": "Material 1",
  "pdf2.pdf": "Material 2",
  "pdf3.pdf": "Mapa Mental",
  "pdf4.pdf": "Exercícios",
  "quiz1.quiz.pdf": "Quiz 1",
  "quiz2.quiz.pdf": "Quiz 2"
};

const DIST_DIR = path.join(ROOT_DIR, "../app");
const DIST_HTML_PATH = path.join(DIST_DIR, "index.html");
const DIST_CSS_PATH = path.join(DIST_DIR, "styles.css");
const DIST_LOGO_PATH = path.join(DIST_DIR, "logo.png");
const DIST_VIDEOS_DIR = path.join(DIST_DIR, "videos");

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
  ".quiz.pdf": "quiz.png",

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
  ".7z": "zip.png",
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
    label: "Vídeo",
    href: "tXLCOGXfd7o",
    icon: "youtube.png",
    typeLabel: "link para página com vídeo"
  },
];

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
  ".quiz.pdf": "quiz",
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
  const baseName = parsedPath.name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const spacedName = baseName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2");

  return spacedName
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      if (/^\d+$/.test(word)) {
        return word;
      }

      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      return word.toLowerCase();
    })
    .join(" ");
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

function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getUniqueSlug(baseSlug, usedSlugs) {
  let suffix = 2;
  let slug = baseSlug;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);

  return slug;
}

function getConfiguredExtension(filePath, extensionMap) {
  const normalizedPath = filePath.toLowerCase();
  const configuredExtensions = Object.keys(extensionMap).sort((a, b) => b.length - a.length);

  return configuredExtensions.find((extension) => normalizedPath.endsWith(extension))
    ?? path.extname(filePath).toLowerCase();
}

function getIconForFile(filePath) {
  const extension = getConfiguredExtension(filePath, ICON_BY_EXTENSION);

  return ICON_BY_EXTENSION[extension] ?? "file.png";
}

function getTypeLabelForFile(filePath) {
  const extension = getConfiguredExtension(filePath, TYPE_LABEL_BY_EXTENSION);

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

function getEmbeddedYoutubeEntries() {
  const usedSlugs = new Set();

  return EMBEDDED_YOUTUBE_VIDEOS.map((youtubeVideo, index) => {
    if (!youtubeVideo.href) {
      throw new Error(`Video do YouTube sem href no indice ${index}.`);
    }

    const baseSlug = slugify(youtubeVideo.label) || `video-${index + 1}`;
    const slug = getUniqueSlug(baseSlug, usedSlugs);

    return {
      ...youtubeVideo,
      slug,
      pageHref: `./videos/${slug}.html`
    };
  });
}

function getEmbeddedYoutubeCards(youtubeEntries) {
  return youtubeEntries.map((youtubeVideo) => {
    return {
      label: youtubeVideo.label,
      typeLabel: youtubeVideo.typeLabel,
      href: youtubeVideo.pageHref,
      iconSrc: `./icones/${encodeURIComponent(youtubeVideo.icon)}`,
      ariaPrefix: "Abrir video"
    };
  });
}

function getMaterialLabel(filePath) {
  const normalizedPath = filePath.replace(/\\/g, "/");

  return MATERIAL_LABELS[normalizedPath] ?? normalizeLabel(filePath);
}

function getMaterialCards() {
  if (!fs.existsSync(MATERIAIS_DIR)) {
    throw new Error(`Pasta de materiais não encontrada: ${MATERIAIS_DIR}`);
  }

  return listFilesRecursively(MATERIAIS_DIR)
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((filePath) => {
      const label = getMaterialLabel(filePath);
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

function buildEmbeddedYoutubePages(youtubeEntries) {
  ensureDir(DIST_VIDEOS_DIR);

  const template = fs.readFileSync(YOUTUBE_TEMPLATE_PATH, "utf8");

  for (const youtubeVideo of youtubeEntries) {
    const videoId = escapeHtml(youtubeVideo.href);
    const finalHtml = template.replaceAll("{ID_DO_VIDEO}", videoId);
    const outputPath = path.join(DIST_VIDEOS_DIR, `${youtubeVideo.slug}.html`);

    fs.writeFileSync(outputPath, finalHtml, "utf8");
  }
}

function build() {
  cleanDir(DIST_DIR);

  copyDir(PUBLIC_DIR, DIST_DIR);
  fs.copyFileSync(SOURCE_CSS_PATH, DIST_CSS_PATH);
  fs.copyFileSync(SOURCE_LOGO_PATH, DIST_LOGO_PATH);

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  const materialCards = getMaterialCards();
  const externalLinkCards = getExternalLinkCards();
  const embeddedYoutubeEntries = getEmbeddedYoutubeEntries();
  const embeddedYoutubeCards = getEmbeddedYoutubeCards(embeddedYoutubeEntries);

  const allCards = [
    ...materialCards,
    ...externalLinkCards,
    ...embeddedYoutubeCards
  ];

  const cardsHtml = renderCards(allCards);

  const finalHtml = template.replaceAll("{{MATERIAL_CARDS}}", cardsHtml);

  fs.writeFileSync(DIST_HTML_PATH, finalHtml, "utf8");
  buildEmbeddedYoutubePages(embeddedYoutubeEntries);

  console.log("Build concluído.");
  console.log(`Materiais encontrados: ${materialCards.length}`);
  console.log(`Links externos encontrados: ${externalLinkCards.length}`);
  console.log(`Videos do YouTube encontrados: ${embeddedYoutubeCards.length}`);
  console.log(`Cards gerados: ${allCards.length}`);
  console.log(`Arquivo gerado: ${DIST_HTML_PATH}`);
}

build();
