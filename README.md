# Patricia Renovation App

Aplicação MVP para gerir a renovação de uma casa pequena: checklist mobile, kanban desktop, plano de ataque por pessoa, custos, dependências e definições.

## Stack

- Next.js `16.2.4`
- React `19.2.5`
- TypeScript strict
- Tailwind CSS `4.2.4`
- Convex `1.36.0`
- dnd-kit core `6.3.1`

## Instalação

```bash
npm install
```

## Ambiente Convex

Criar ou confirmar `.env.local`:

```env
CONVEX_DEPLOYMENT=dev/maria-martins
NEXT_PUBLIC_CONVEX_URL=https://capable-goldfinch-663.eu-west-1.convex.cloud
```

Este projeto usa o deployment Convex existente. Não usa Supabase nem outro backend.

## Desenvolvimento local

Num terminal, sincronizar funções Convex:

```bash
npx convex dev
```

Noutro terminal, arrancar a app:

```bash
npm run dev
```

## Seed inicial

Depois do Convex estar sincronizado:

```bash
npx convex run seed:seedInitialData
```

O seed cria/garante apenas pessoas e áreas. Para limpar tarefas, anexos e atividade e deixar a app pronta para dados novos:

```bash
npx convex run seed:seedInitialData '{"resetTasks": true}'
```

## Build

```bash
npm run build
```

## Deploy

Deploy recomendado no Vercel ou equivalente. Configurar no hosting:

- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`

Antes de publicar, correr `npx convex dev` ou o fluxo Convex de deploy usado pelo projeto para garantir que schema e funções estão sincronizados.

## Assunções do MVP

- Sem autenticação: a pessoa “eu” é escolhida localmente no browser.
- Categorias de custo são fixas no código.
- `ownerDecisionDone` existe para separar “precisa decisão” de “decisão tomada”.
- A ordem dos cartões dentro de uma coluna kanban não é persistida; a mudança de estado é persistida.
- A UI está em português e otimizada para checklist em telemóvel e planeamento em desktop.
