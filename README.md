# Sogrinha Desktop

## Introdução

Sogrinha Desktop é uma aplicação desktop de gestão imobiliária para sistemas Windows, criada com Electron e React. O software permite o cadastro, consulta e edição de proprietários, locatários, imóveis e contratos, além de gerar documentos (DOCX/PDF) e gerenciar anexos locais em PDF.

### Principais Funcionalidades

- CRUD de **Proprietários**, **Locatários**, **Imóveis** e **Contratos**
- Geração de contratos em formatos **DOCX** e **PDF** com dados dinâmicos
- Upload, listagem, download e exclusão de anexos em PDF, salvos localmente em pastas específicas
- Notificações desktop e exibição da versão do aplicativo
- Autenticação básica via contexto (Firebase / AuthContext)

### Público-Alvo

Corretores, imobiliárias e gestores que precisam de uma solução leve para administrar contratos e cadastros de imóveis em ambiente Windows.

---

## Tecnologias Utilizadas

- **Electron** (>= 34.x) – empacotamento como app desktop
- **React** (>= 19.x) com **TypeScript** – render process
- **Firebase Firestore** – banco de dados NoSQL na nuvem
- **docx** e **pdf-lib** – geração de documentos
- **React-Select**, **Lucide-React**, **React-Toastify** – componentes UI e notificações
- **Tailwind CSS** – estilização utilitária
- **Redux** e **React-Redux** – gerenciamento de estado
- **Electron-Builder** – criação do installer (.exe)
- **dotenv**, **concurrently**, **wait-on**, **eslint**, **prettier** – scripts e ferramentas de desenvolvimento

**Versões recomendadas**:
- Node.js >= 16.x
- npm >= 8.x
- Windows 10 ou superior

---

## Estrutura de Pastas

```
/ (raiz)
├── electron.js            # Main process do Electron
├── preload.js             # Preload script (contextBridge)
├── package.json           # Configuração root (scripts Electron)
├── tsconfig.json          # Configurações TypeScript
├── .env                   # Variáveis de ambiente (não versionar)
├── dist/                  # Saída de build do Electron
└── frontend/              # Aplicação React
    ├── package.json       # Dependências do front-end
    ├── tailwind.config.js # Tema e cores do Tailwind
    ├── public/            # Arquivos estáticos (index.html, ícones)
    └── src/               # Código-fonte React
        ├── index.tsx      # Ponto de entrada
        ├── components/    # Componentes reutilizáveis (Layout, TopBar, AttachmentsManager)
        ├── pages/         # Páginas de cadastro e listagem
        ├── services/      # Lógica de comunicação (Firestore, arquivos locais)
        ├── models/        # Interfaces de dados (Owner, Lessee, RealEstate, Contract)
        ├── context/       # Contextos (AuthContext)
        └── assets/        # Imagens e logos
```

- **Main Process**: `electron.js`
- **Preload Script**: `preload.js`
- **Render Process**: `frontend/src`

---

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js >= 16.x e npm (ou Yarn)
- Git
- Windows 10+ (para teste do executável)

### Instalação de Dependências

```bash
# No diretório raiz:
npm install
# Instalar dependências do front-end:
npm run postinstall
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz com (exemplo):

```dotenv
NODE_ENV=development
# GOOGLE_SERVICE_ACCOUNT_KEY_FILE=drive-credentials.json  (se aplicável)
# DRIVE_ROOT_FOLDER_ID=abcdef123456                  (se aplicável)
``` 

### Iniciando em Modo Desenvolvimento

```bash
npm run electron-dev
```

- Executa simultaneamente o servidor React e o Electron com hot reload.

---

## Build e Geração do Executável (.exe)

1. **Build da aplicação React**
   ```bash
   npm run build
   ```
2. **Empacotar com Electron-Builder**
   ```bash
   npm run electron-pack
   ```
3. O instalador Windows (`.exe`) será gerado na pasta `dist/`.

> **Obs.**: Não há assinatura digital configurada por padrão. Atualizações automáticas não foram implementadas.

---

## Requisitos Funcionais

1. CRUD de Proprietários, Locatários, Imóveis e Contratos.
2. Geração de contratos em DOCX e PDF.
3. Upload e gerenciamento local de anexos em PDF.
4. Notificações desktop e exibição da versão do app.

## Requisitos Não Funcionais

- UI responsiva com Tailwind CSS.
- Compatibilidade com Windows 10 ou superior.
- Segurança via `contextIsolation` no preload.
- Modularização e código organizado.

---

## Modelos de Dados

As entidades principais possuem interfaces em `frontend/src/models`:

- **Owner**: `id`, `fullName`, `cpf`, `rg`, ...
- **Lessee**: `id`, `fullName`, `cpf`, `rg`, ...
- **RealEstate**: `id`, `street`, `number`, `city`, ...
- **Contract**: `id`, `userId`, `contractKind`, `startDate`, `endDate`, `owner`, `lessee?`, `realEstate?`

### Armazenamento

- **Firestore**: dados de cadastro.
- **Sistema de arquivos local**: anexos em `userData/attachments/<entidade>/<identificador>/<id>`.

---

## Testes

Não há suítes de testes automatizadas neste MVP.

---

## Distribuição e Atualizações

- **Instalador Windows**: gerado em `dist/` via Electron-Builder.
- **Atualização**: processo manual (download do novo instalador).

---

## Melhores Práticas e Convenções

- **Isolamento de Processos**: `contextIsolation` e `preload.js` para expor APIs seguras.
- **Modularização**: separação clara entre componentes, páginas e serviços.
- **Estilização**: Tailwind CSS com tema customizado.
- **Naming**: PascalCase para componentes, camelCase para funções/variáveis.
- **Tratamento de Erros**: uso de `try/catch` e `console.error`.
