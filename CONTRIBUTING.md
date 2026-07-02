# Guia básico pra contribuir:

### Sumário

1. Requisitos
2. Arquivos-chave
3. Fluxo de desenvolvimento

## 1. Requisitos:

- Node.js
- Navegador
- Terminal     
- Visual Studio Code e extensão Live Server, ou ferramentas equivalentes (opcional, mas recomendado)

## 2. Arquivos chave

### src/build-site.js

- Script que gera cards de links para materiais automaticamente.
- Alterar ```EXTERNAL_LINK_CARDS``` para adicionar links externos que são transformados em cards. Útil pra vídeos no YouTube, conteúdo no Drive, etc.
- Alterar ```ICON_BY_EXTENSION``` para mudar qual imagem é usada pra gerar o card do link de materiais de determinada extensão, ou para adicionar relações novas entre **tipo de extensão - imagem do ícone**.
- Alterar ```TYPE_LABEL_BY_EXTENSION``` para adicionar relações entre extensões e como elas devem ser referidas por leitores de tela.

### src/template.html

- HTML usado no processamento do script **build-site.js** para formular o HTML final (versão de release), com os cards de links de material inseridos. Mexa como preferir pra moldar o site.
- Não remover de maneira alguma o texto **{{MATERIAL_CARDS}}**, pois ele é usado pelo script para identificar onde os cards precisam ser inseridos.

### dist/index.html

- HTML final gerado. **Não mexer nele diretamente**, pois ao buildar o projeto novamente, o script vai reescrever este arquivo com base no template e nos materiais.
- Este arquivo que deve ser aberto no navegador para testes, apresentação, etc.

### recursos/icones

- Ícones usados para cards dos materiais.
- Por exemplo, um ícone nomeado de "video.png" pode ser usado pra materiais de extensão .mp4, .mkv, .webm, etc.

### recursos/materiais

- Materiais usados pra criar os cards no site.
- Podem ser de qualquer extensão, mas nem todas terão compatibilidade. Se encontrar problemas de compatibilidade ou comportamento inesperado ao tentar abrir uma extensão, o script provavelmente precisará de modificação.
- **Evitar adicionar arquivos muito grandes.** Se precisar, considere colocar o arquivo no Drive, YouTube ou outro serviço do tipo, e colocar o link de acesso em ```EXTERNAL_LINK_CARDS```.

## 3. Fluxo de desenvolvimento

1. **Não precisa baixar node package modules**, pois o projeto não possui nenhuma dependência.
2. Rode ```npm run build``` no terminal uma vez para gerar **dist/index.html**.
3. Entre em /dist e abra **index.html** no navegador ou hospede com alguma extensão, como o **Live Server** do VS Code (altamente recomendado, pois incorpora reload automático da página no navegador).
4. Faça alterações no projeto como quiser, e execute ```npm run build``` no terminal na raiz do projeto para atualizar o **index.html**.
5. Se o **index.html** estiver hospedado e com Live Reload, ele automaticamente atualizará no navegador.