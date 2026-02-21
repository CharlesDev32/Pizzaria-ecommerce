# CLAUDE.md — Sabor Express

## Projeto
Monorepo pnpm de e-commerce delivery. Backend NestJS 11, dois frontends Next.js 14 (web + admin), pacote compartilhado `@pizza/shared`.

## Portas
- API: 3000 · Web: 3001 · Admin: 3002

## Comandos
```bash
pnpm start:dev          # Backend com watch
pnpm dev                # Web + Admin
pnpm dev:web            # Só web
pnpm dev:admin          # Só admin
npx tsc --noEmit        # Typecheck backend
cd apps/web && npx tsc --noEmit   # Typecheck web
cd apps/admin && npx tsc --noEmit # Typecheck admin
```

## Estrutura-chave

### Backend (`src/`)
- **17 módulos** em `src/modules/`: auth, users, catalog, categories, inventory, cart, coupons, checkout, orders, payments, delivery, addresses, settings, files, health, metrics, audit-log
- Cada módulo segue: `module.ts` + `application/service.ts` + `presentation/controller.ts`
- **StoreService** (`src/shared/store/store.service.ts`): singleton in-memory, armazena TODOS os dados (users, products, orders, settings, etc.) em arrays. Sem DB em runtime. Settings persistem em arquivo JSON via `persistSettings()` / `loadPersistedSettings()`, demais dados resetam ao reiniciar.
- **Guards**: `JwtAuthGuard` (verifica JWT) + `RolesGuard` (verifica role via decorator `@Roles()`) + `ThrottlerGuard` (global, 100 req/min)
- **GlobalExceptionFilter** (`src/common/errors/`): captura todas exceções, trata erros Express (PayloadTooLargeError etc.)
- **main.ts**: body limit 10mb, CORS via CORS_ALLOWLIST env, helmet, Swagger em `/api/v1/docs`
- JWT secret: `JWT_ACCESS_SECRET` env (default `change_me_access`)

### Frontend Web (`apps/web/`)
- **ThemeProvider** (`components/providers/ThemeProvider.tsx`): busca settings da API, injeta CSS vars `--brand-*` e `--font-body`/`--font-heading` no `:root`, carrega Google Fonts dinamicamente via `resolveFontFamily()`, aplica background image overlay com opacidade dinâmica via `toOverlayOpacity()`
- **Layout**: Poppins (body) + Bebas Neue (heading) via next/font/google, CSS vars `--font-body` / `--font-heading`
- **Tailwind**: cores via `var(--brand-*)`, fontes via `font-body` / `font-heading` classes
- **i18n**: PT-BR hardcoded em `lib/i18n.ts` (sem runtime i18n)
- **Zustand stores**: `auth.store.ts`, `cart.store.ts`

### Frontend Admin (`apps/admin/`)
- **AdminShell** com sidebar + header
- **Auth store**: `store/admin-auth.store.ts` (Zustand persist, tokens em localStorage)
- **Settings page** (`app/settings/page.tsx`): design completo com color pickers, image uploaders (drag & drop), logo size slider (20-120px), show/hide brand name toggle, background image opacity slider (0-100%), font selectors com preview ao vivo. Precarrega todas as Google Fonts.
- Todas as pages usam `style={{ fontFamily: 'var(--font-heading)' }}` para títulos

### Pacote Shared (`packages/shared/`)
- **API clients** em `src/api/`: `client.ts` (base com refresh token 401), auth, catalog, cart, checkout, orders, admin, delivery, addresses, settings
- **Tipos** em `src/types/`: auth, product, order, common, settings (StoreSettings, DEFAULT_SETTINGS, FONT_BODY_OPTIONS, FONT_HEADING_OPTIONS, resolveFontFamily, resolveHeadingFontWeight)
- **Schemas Zod** em `src/schemas/`
- **Utils**: money.ts, pagination.ts
- Tudo exportado via `src/index.ts`

## Padrões importantes

### Cores dinâmicas
Tailwind usa `var(--brand-navy)` etc. ao invés de hex. CSS vars definidas em `globals.css` como fallback, sobrescritas pelo ThemeProvider em runtime.

### Fontes dinâmicas
Layout carrega fonts padrão via `next/font/google` → CSS vars `--font-body` / `--font-heading`. ThemeProvider sobrescreve se admin mudar. Admin settings precarrega todas as 12 fontes para preview. `resolveFontFamily()` resolve aliases (ex: "Montserrat Extra Bold" → "Montserrat"), `resolveHeadingFontWeight()` retorna peso correto (800 para Extra Bold, 700 para demais).

### Visibilidade e opacidade
`showBrandName` (boolean): toggle para esconder/mostrar nome da marca ao lado do logo no Navbar e Footer. `backgroundImageOpacity` (0-100): controla opacidade do overlay de imagem de fundo, convertida para 0-1 via `toOverlayOpacity()` no ThemeProvider.

### Persistência de settings
StoreService persiste settings em arquivo JSON (`data/settings.json`) via `persistSettings()`. Carrega ao iniciar via `loadPersistedSettings()`. Demais dados (users, products, orders) continuam apenas in-memory.

### Upload de imagens
`POST /settings/upload` aceita multipart/form-data, converte para base64 data URL (sem S3 real). `settingsApi.uploadImage()` usa `fetch` direto (não `apiRequest`) porque precisa enviar FormData sem Content-Type: application/json.

### Autenticação
JWT com access + refresh tokens. `apiRequest` no client.ts intercepta 401, tenta refresh automaticamente, faz logout se falhar. Admin persiste tokens via Zustand persist (localStorage).

## Credenciais
- Admin: `admin@pizzainpizza.local` / `Admin123!`
- Cliente: `cliente@saborexpress.com` / `Customer123!`

## Idioma
Interface e código em PT-BR. Variáveis e nomes de arquivo em inglês.

## Convenções
- Sempre rodar typecheck nos 3 projetos após mudanças
- Usar `Edit` para modificar arquivos existentes, não recriar
- Backend auto-reload via `--watch`, matar processo antigo se EADDRINUSE
- Não fazer `git push` sem pedir
