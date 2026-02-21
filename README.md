# Sabor Express - Plataforma de Delivery

Plataforma completa de e-commerce para delivery de comida, com loja online, painel administrativo e API RESTful. Construida como monorepo com NestJS, Next.js e TypeScript.

---

## Funcionalidades

### Loja (Cliente)
- Catalogo de produtos com categorias e busca
- Pagina de detalhes do produto com opcoes e complementos
- Carrinho de compras persistente
- Checkout com selecao de endereco e agendamento de entrega
- Historico de pedidos com timeline de status
- Cadastro e login com JWT (access + refresh tokens)
- Gerenciamento de enderecos de entrega
- Banner promocional customizavel
- Tema dinamico (cores, fontes, logo) aplicado em tempo real

### Painel Admin
- Dashboard com metricas e visao geral
- CRUD completo de produtos com upload de imagens
- Gerenciamento de categorias
- Controle de estoque/inventario
- Gerenciamento de pedidos com atualizacao de status
- Sistema de cupons de desconto
- Gerenciamento de usuarios
- Configuracao de zonas e horarios de entrega
- Logs de auditoria
- **Design da Loja** — editor visual completo:
  - Cores do tema (7 variaveis: fundo, cards, botoes, destaque, textos)
  - Fontes do corpo e titulos (12 opcoes do Google Fonts)
  - Logo com upload drag & drop e controle de tamanho
  - Banner promocional com texto colorido por palavra, imagem de fundo, foto lateral, opacidade e fonte customizaveis
  - Imagem/textura de fundo do site com controle de opacidade
  - Toggle de exibicao do nome da marca
  - Preview ao vivo de todas as alteracoes

### API
- 18 modulos de dominio (auth, catalog, cart, checkout, orders, payments, delivery, etc.)
- Autenticacao JWT com refresh token automatico
- Controle de acesso por roles (admin/customer)
- Rate limiting (100 req/min)
- Upload de imagens (base64 data URLs)
- Documentacao Swagger em `/api/v1/docs`
- Protecao contra brute force
- Global exception handling

---

## Screenshots

| Loja - Home | Loja - Cardapio | Loja - Produto |
|:-----------:|:---------------:|:--------------:|
| ![Home](docs/screenshots/storefront-home.png) | ![Menu](docs/screenshots/storefront-menu.png) | ![Product](docs/screenshots/storefront-product.png) |

| Loja - Carrinho | Loja - Checkout | Admin - Dashboard |
|:---------------:|:---------------:|:-----------------:|
| ![Cart](docs/screenshots/storefront-cart.png) | ![Checkout](docs/screenshots/storefront-checkout.png) | ![Dashboard](docs/screenshots/admin-dashboard.png) |

| Admin - Produtos | Admin - Pedidos |
|:-----------------:|:---------------:|
| ![Products](docs/screenshots/admin-products.png) | ![Orders](docs/screenshots/admin-orders.png) |

---

## Arquitetura

```
E-commerce/
├── src/                         # NestJS 11 — API Backend (porta 3000)
│   ├── modules/                 # 18 modulos de dominio
│   │   ├── auth/                # Login, registro, refresh, logout
│   │   ├── catalog/             # Produtos + upload de imagens
│   │   ├── categories/          # Categorias de produtos
│   │   ├── cart/                # Carrinho de compras
│   │   ├── checkout/            # Finalizacao de pedido
│   │   ├── orders/              # Pedidos + timeline de status
│   │   ├── payments/            # Processamento de pagamentos
│   │   ├── delivery/            # Zonas, bairros, horarios de entrega
│   │   ├── addresses/           # Enderecos do usuario
│   │   ├── coupons/             # Cupons de desconto
│   │   ├── inventory/           # Controle de estoque
│   │   ├── users/               # Gerenciamento de usuarios
│   │   ├── settings/            # Configuracoes da loja (tema, logo, fontes)
│   │   ├── files/               # Upload de arquivos
│   │   ├── health/              # Health check
│   │   ├── metrics/             # Metricas Prometheus
│   │   └── audit-log/           # Logs de auditoria
│   ├── common/                  # Guards, filters, decorators, middleware
│   └── shared/store/            # StoreService (dados in-memory)
│
├── apps/
│   ├── web/                     # Next.js 14 — Loja do cliente (porta 3001)
│   │   ├── app/                 # App Router (paginas)
│   │   ├── components/          # Navbar, Footer, PromoBanner, ProductCard, ThemeProvider
│   │   └── store/               # Zustand (auth, cart)
│   │
│   └── admin/                   # Next.js 14 — Painel admin (porta 3002)
│       ├── app/                 # App Router (paginas)
│       ├── components/          # AdminShell, tabelas, formularios
│       └── store/               # Zustand (admin-auth)
│
├── packages/
│   └── shared/                  # @pizza/shared — pacote compartilhado
│       ├── src/api/             # Clients HTTP (auth, catalog, cart, settings, etc.)
│       ├── src/types/           # Interfaces TypeScript
│       ├── src/schemas/         # Validacao Zod
│       └── src/utils/           # Utilitarios (money, pagination)
│
└── docs/screenshots/            # Screenshots da aplicacao
```

### Armazenamento de dados

O `StoreService` e um singleton NestJS que armazena todos os dados em arrays na memoria (sem banco de dados em runtime). As **configuracoes da loja** (tema, cores, fontes, logo) sao persistidas em arquivo JSON (`data/settings.json`) e sobrevivem a reinicializacoes. Os demais dados (usuarios, produtos, pedidos) sao resetados ao reiniciar o backend.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS 11, TypeScript, JWT, Swagger, Helmet |
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| State | Zustand (persist), TanStack Query |
| Validacao | Zod, class-validator |
| Monorepo | pnpm workspaces |
| Fontes | Google Fonts (Nunito, Oswald + 10 opcoes dinamicas) |

---

## Como executar

### Pre-requisitos

- Node.js 18+
- pnpm 8+

### Instalacao

```bash
git clone https://github.com/CharlesDev32/Pizzaria-ecommerce.git
cd Pizzaria-ecommerce
pnpm install
```

### Executar em desenvolvimento

```bash
# Terminal 1 — Backend (porta 3000)
pnpm start:dev

# Terminal 2 — Web + Admin (portas 3001 e 3002)
pnpm dev
```

Ou separadamente:

```bash
pnpm dev:web       # Somente loja (porta 3001)
pnpm dev:admin     # Somente admin (porta 3002)
```

### Acessar

| Servico | URL |
|---------|-----|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/v1/docs |
| Loja | http://localhost:3001 |
| Admin | http://localhost:3002 |

---

## Credenciais padrao

| Papel | Email | Senha |
|-------|-------|-------|
| Admin | admin@pizzainpizza.local | Admin123! |
| Cliente | cliente@saborexpress.com | Customer123! |

---

## Rotas

### Loja (`localhost:3001`)

| Rota | Descricao |
|------|-----------|
| `/` | Home com banner, categorias e destaques |
| `/menu` | Cardapio completo com filtros |
| `/product/[slug]` | Detalhes do produto |
| `/cart` | Carrinho de compras |
| `/checkout` | Finalizacao do pedido |
| `/orders` | Historico de pedidos |
| `/orders/[id]` | Detalhes e timeline do pedido |
| `/account` | Dados da conta |
| `/account/addresses` | Gerenciar enderecos |
| `/auth/login` | Login |
| `/auth/register` | Cadastro |

### Admin (`localhost:3002`)

| Rota | Descricao |
|------|-----------|
| `/dashboard` | Metricas e visao geral |
| `/products` | Gerenciar produtos |
| `/categories` | Gerenciar categorias |
| `/inventory` | Controle de estoque |
| `/orders` | Gerenciar pedidos |
| `/coupons` | Cupons de desconto |
| `/users` | Gerenciar usuarios |
| `/delivery` | Zonas e horarios de entrega |
| `/settings` | Design da loja (tema, cores, fontes, logo) |
| `/audit-logs` | Logs de auditoria |

---

## API Endpoints

| Modulo | Metodos | Autenticacao |
|--------|---------|-------------|
| Auth | POST login, register, refresh, logout | Publico |
| Settings | GET (publico), PATCH + POST upload | Admin |
| Catalog | GET (publico), POST/PATCH/DELETE + upload | Admin |
| Categories | GET (publico), POST/PATCH/DELETE | Admin |
| Cart | GET, POST, PATCH, DELETE, apply-coupon | Usuario |
| Checkout | POST | Usuario |
| Orders | GET (me/all/id/timeline), PATCH status | Usuario/Admin |
| Delivery | GET zones/neighborhoods/slots, POST | Admin |
| Addresses | CRUD | Usuario |
| Coupons | CRUD | Admin |
| Inventory | GET movements, POST | Admin |
| Users | GET all, PATCH | Admin |

---

## Sistema de temas

O admin pode personalizar todo o visual da loja em tempo real:

1. **Admin salva** alteracoes no `/settings`
2. **Backend persiste** via `PATCH /api/v1/settings` em `data/settings.json`
3. **Loja busca** configuracoes via `GET /api/v1/settings` (polling automatico)
4. **ThemeProvider** injeta CSS custom properties no `:root` e carrega Google Fonts dinamicamente

Personalizaveis: 7 cores, 2 fontes (corpo + titulos), logo com tamanho ajustavel, banner promocional completo (textos, cores por palavra, imagem de fundo, foto lateral, fonte, tamanho), imagem/textura de fundo do site, visibilidade do nome da marca.

---

## Scripts disponiveis

```bash
pnpm start:dev       # Backend com hot reload
pnpm dev             # Web + Admin em paralelo
pnpm dev:web         # Somente loja
pnpm dev:admin       # Somente admin
pnpm build           # Build do backend
pnpm lint            # ESLint
pnpm format          # Prettier
pnpm test            # Jest
pnpm typecheck       # TypeScript check (todos os projetos)
```

---

## Licenca

Projeto privado. Todos os direitos reservados.
