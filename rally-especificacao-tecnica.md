# Especificação Técnica — Sistema Rally

> Documento de referência para implementação por IA agêntica. Contém regras de negócio, modelo de dados, arquitetura e estrutura de código completos. Qualquer ambiguidade não coberta aqui deve ser sinalizada antes de assumir um comportamento.

---

## 1. Visão geral

Sistema de pontuação para a competição **Rally**, composta por **nações** (equipes) divididas em **tribos** (subequipes). O sistema contabiliza pontuação no nível da tribo e da nação, com controle de acesso por papel, criação dinâmica de missões pontuáveis, confrontos entre tribos/nações e um painel público opcional de resultados.

### 1.1 Stack

| Camada | Tecnologia |
|---|---|
| Frontend / PWA | Next.js (App Router), TypeScript |
| Hospedagem frontend | Vercel (plano Hobby) |
| Banco de dados | PostgreSQL via Supabase |
| Autenticação | Supabase Auth |
| Autorização em nível de linha | Postgres Row Level Security (RLS) |
| Estilo de arquitetura | Clean Architecture |

### 1.2 Papéis de usuário

| Papel | Descrição |
|---|---|
| `admin` | Acesso total: gerencia missões, lançamentos, tribos, nações, confrontos, exibição pública |
| `lider_tribo` | Acesso restrito à própria tribo: registra lançamentos, consulta pontuação da própria tribo |
| Visitante (sem login) | Acesso somente ao painel público, se estiver habilitado pelo admin |

Pode existir mais de um usuário `admin`.

---

## 2. Regras de negócio (autoritativas)

Estas regras foram levantadas diretamente com o dono do produto e têm precedência sobre qualquer suposição de implementação.

### 2.1 Estrutura e pontuação

1. Uma **nação** é composta por uma ou mais **tribos**.
2. A pontuação da nação é **sempre** a soma das pontuações de suas tribos. A nação não possui pontuação própria independente.
3. A pontuação da tribo é a soma de todos os `lancamentos` **não removidos** vinculados a ela.

### 2.2 Missões

4. Existem dois tipos de missão:
   - **Booleana**: valor verdadeiro/falso. Se verdadeiro, aplica `pontos_base × 1`; se falso, `0` (nenhum lançamento deve ser criado para o caso falso — ver seção 4.3).
   - **Contagem**: o líder da tribo informa manualmente uma quantidade inteira (ex: número de pessoas). Pontuação = `pontos_base × quantidade`.
5. Toda missão tem uma pontuação base definida pelo admin no momento da criação.
6. Missões podem ser desativadas (`ativa = false`) pelo admin, o que as remove da lista de missões disponíveis para lançamento, mas **não apaga o histórico de lançamentos já feitos** com ela.

### 2.3 Lançamentos

7. Um líder de tribo só pode criar lançamentos vinculados à **própria tribo** (`tribo_id` do usuário autenticado). Esta regra deve ser garantida no banco via RLS, não apenas na aplicação.
8. O admin pode remover um lançamento específico pontualmente. Remoção de lançamento é **soft delete** (`removido = true`), preservando o registro para auditoria.

### 2.4 Zerar pontuações

9. Ação restrita ao papel `admin`.
10. Antes de zerar, o sistema **obrigatoriamente** cria um snapshot com o estado completo das pontuações (por tribo e por nação) no momento da ação, incluindo autor e timestamp.
11. "Zerar" é implementado como soft delete em massa (marcar todos os lançamentos ativos como `removido = true` associados a um `snapshot_id`), nunca como `DELETE` físico.
12. A UI deve exigir confirmação explícita (ex: digitar o nome da competição) antes de executar esta ação — é irreversível do ponto de vista de exibição, ainda que o dado permaneça no snapshot.

### 2.5 Cadastro de tribos e nações

13. Tribos e nações podem ser criadas e removidas durante a competição, por admins.
14. **Diferente da regra de "zerar pontuações"**: remover uma tribo ou nação é **exclusão real (hard delete)**. O histórico de pontos daquela tribo/nação deve sumir do ranking.
15. Remover uma nação deve remover em cascata todas as tribos vinculadas a ela (e, por consequência, os lançamentos dessas tribos).
16. A UI deve exigir confirmação explícita antes desta ação, dado que é irreversível.

### 2.6 Exibição pública

17. Existe uma configuração global (não por usuário) `exibicao_publica_ativa: boolean`, controlada apenas por admins em uma tela de configurações.
18. Quando ativa, uma rota pública **sem autenticação** expõe:
    - Ranking de nações (agregado)
    - Ranking de tribos
    - Pontuação da tribo na semana corrente
    - Pontuação da nação na semana corrente
19. Quando inativa, a rota pública deve responder de forma a não revelar nenhum dado de pontuação (ex: página informando que a exibição está desativada, sem vazar dados via API).
20. A rota pública **não deve expor** lançamentos individuais, nomes de quem lançou, ou dados de missões específicas — apenas totais agregados, salvo decisão futura em contrário (ver seção 8, itens em aberto).

### 2.7 Confrontos

21. Um confronto é uma disputa entre dois participantes (tribo vs. tribo, ou nação vs. nação — não misturar níveis), criado pelo admin para um período específico (ex: uma semana). Não é obrigatório existir um confronto toda semana.
22. Ao criar um confronto, o admin escolhe um de dois formatos:
    - **`pontuacao_normal`**: o vencedor é definido comparando a pontuação normal que cada participante já fez no período do confronto (reaproveita os lançamentos normais existentes, sem duplicar dado).
    - **`missoes_exclusivas`**: o confronto tem um conjunto de missões vinculadas exclusivamente a ele (tabela `missao_confronto`). Essas missões **não contam para o placar geral**, apenas para o resultado do confronto.
23. Ao criar o confronto, o admin também define `da_bonus: boolean`. Se `true`, define também `pontos_bonus: integer`.
24. Ao fechar/finalizar um confronto com `da_bonus = true`, o sistema deve gerar automaticamente um lançamento especial (`origem = 'bonus_confronto'`) de `pontos_bonus` pontos para o participante vencedor, para que o bônus apareça normalmente no histórico e no ranking geral, sem exigir lógica de cálculo separada em outros lugares do sistema.
25. Se `da_bonus = false`, o confronto é apenas exibido (placar de confronto à parte), sem gerar nenhum lançamento.

---

## 3. Arquitetura — Clean Architecture

O código deve ser organizado por **módulo de negócio** (feature), e dentro de cada módulo as camadas concêntricas de sempre — domínio no centro, aplicação em volta, infraestrutura implementando as portas do domínio. A regra de dependência entre camadas continua valendo *dentro* de cada módulo:

```
módulo/
  ┌───────────────────────────────────────┐
  │  infrastructure (implementações,       │
  │  Supabase, adapters)                   │
  │  ┌─────────────────────────────────┐   │
  │  │  application (use cases, DTOs)   │   │
  │  │  ┌───────────────────────────┐   │   │
  │  │  │  domain (entidades, regras │   │   │
  │  │  │  de negócio, interfaces de │   │   │
  │  │  │  repositório)              │   │   │
  │  │  └───────────────────────────┘   │   │
  │  └─────────────────────────────────┘   │
  └───────────────────────────────────────┘
```

Regras de dependência:
- Dentro de um módulo, `domain/` não importa nada de `application/` ou `infrastructure/`.
- `application/` de um módulo importa apenas do `domain/` do **mesmo** módulo.
- `infrastructure/` implementa as interfaces definidas no `domain/repositories/` do mesmo módulo.
- Um módulo pode depender do `domain/` (entidades e tipos) de outro módulo quando isso for uma relação de negócio real (ex: `lancamento` depende de `Tribo` e `Missao`) — mas **nunca** do `application/` ou `infrastructure/` de outro módulo. Comunicação entre módulos acontece via `presentation/` orquestrando use cases de módulos diferentes, ou via um módulo explicitamente de leitura agregada (`ranking/`) que consulta repositórios de vários módulos.
- `presentation/` chama `application/use-cases/` dos módulos, nunca acessa `infrastructure/` diretamente nem fala com Supabase sem passar pelos use cases.
- Injeção de dependência: as implementações concretas de repositório (Supabase) são instanciadas em `infrastructure/` de cada módulo e injetadas nos use cases via composição (factory/container simples), não via import direto dentro do use case.

### 3.1 Estrutura de pastas proposta

```
src/
├── modules/
│   ├── nacao/
│   │   ├── domain/
│   │   │   ├── entities/Nacao.ts
│   │   │   ├── repositories/NacaoRepository.ts
│   │   │   └── errors/NacaoError.ts
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       ├── CriarNacaoUseCase.ts
│   │   │       └── RemoverNacaoUseCase.ts
│   │   └── infrastructure/
│   │       └── SupabaseNacaoRepository.ts
│   │
│   ├── tribo/
│   │   ├── domain/
│   │   │   ├── entities/Tribo.ts
│   │   │   └── repositories/TriboRepository.ts
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       ├── CriarTriboUseCase.ts
│   │   │       └── RemoverTriboUseCase.ts
│   │   └── infrastructure/
│   │       └── SupabaseTriboRepository.ts
│   │
│   ├── usuario/
│   │   ├── domain/
│   │   │   ├── entities/Usuario.ts
│   │   │   ├── value-objects/PapelUsuario.ts   # 'admin' | 'lider_tribo'
│   │   │   └── repositories/UsuarioRepository.ts
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       └── VincularLiderATriboUseCase.ts
│   │   └── infrastructure/
│   │       ├── SupabaseUsuarioRepository.ts
│   │       └── SupabaseAuthProvider.ts
│   │
│   ├── missao/
│   │   ├── domain/
│   │   │   ├── entities/Missao.ts
│   │   │   ├── value-objects/TipoMissao.ts     # 'booleana' | 'contagem'
│   │   │   └── repositories/MissaoRepository.ts
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       ├── CriarMissaoUseCase.ts
│   │   │       └── DesativarMissaoUseCase.ts
│   │   └── infrastructure/
│   │       └── SupabaseMissaoRepository.ts
│   │
│   ├── lancamento/
│   │   ├── domain/
│   │   │   ├── entities/Lancamento.ts
│   │   │   ├── value-objects/PontuacaoCalculada.ts
│   │   │   └── repositories/LancamentoRepository.ts
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       ├── RegistrarLancamentoUseCase.ts
│   │   │       ├── RemoverLancamentoUseCase.ts
│   │   │       └── ZerarPontuacoesUseCase.ts    # também orquestra o módulo snapshot
│   │   └── infrastructure/
│   │       └── SupabaseLancamentoRepository.ts
│   │
│   ├── snapshot/
│   │   ├── domain/
│   │   │   ├── entities/SnapshotPontuacao.ts
│   │   │   └── repositories/SnapshotRepository.ts
│   │   ├── application/
│   │   │   └── use-cases/CriarSnapshotUseCase.ts
│   │   └── infrastructure/
│   │       └── SupabaseSnapshotRepository.ts
│   │
│   ├── confronto/
│   │   ├── domain/
│   │   │   ├── entities/Confronto.ts
│   │   │   ├── value-objects/TipoConfronto.ts   # 'pontuacao_normal' | 'missoes_exclusivas'
│   │   │   └── repositories/ConfrontoRepository.ts
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       ├── CriarConfrontoUseCase.ts
│   │   │       └── FecharConfrontoUseCase.ts    # orquestra use case do módulo lancamento p/ gerar o bônus
│   │   └── infrastructure/
│   │       └── SupabaseConfrontoRepository.ts
│   │
│   ├── ranking/                                  # módulo de leitura agregada, cruza dados de tribo/nacao/lancamento
│   │   ├── domain/
│   │   │   └── repositories/RankingRepository.ts
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       ├── ConsultarRankingAdminUseCase.ts
│   │   │       └── ConsultarRankingPublicoUseCase.ts
│   │   └── infrastructure/
│   │       └── SupabaseRankingRepository.ts      # lê as views v_pontuacao_tribo / v_pontuacao_nacao
│   │
│   └── configuracao/
│       ├── domain/
│       │   ├── entities/ConfiguracaoSistema.ts
│       │   └── repositories/ConfiguracaoRepository.ts
│       ├── application/
│       │   └── use-cases/AlternarExibicaoPublicaUseCase.ts
│       └── infrastructure/
│           └── SupabaseConfiguracaoRepository.ts
│
├── shared/
│   ├── domain/
│   │   └── errors/DomainError.ts                 # tipo base de erro, reaproveitado por todos os módulos
│   └── infrastructure/
│       └── supabase/client.ts                    # criação do client Supabase (server/browser), único por módulo
│
└── presentation/
    ├── app/                        # Next.js App Router
    │   ├── (admin)/
    │   │   ├── missoes/
    │   │   ├── tribos/
    │   │   ├── nacoes/
    │   │   ├── confrontos/
    │   │   └── configuracoes/
    │   ├── (lider)/
    │   │   └── lancamentos/
    │   ├── (publico)/
    │   │   └── ranking/
    │   └── api/                    # route handlers, se necessário além de server actions
    ├── components/
    └── hooks/
```

---

## 4. Modelo de dados (PostgreSQL / Supabase)

### 4.1 Tabelas

```sql
create table nacao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

create table tribo (
  id uuid primary key default gen_random_uuid(),
  nacao_id uuid not null references nacao(id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

create table usuario_perfil (
  id uuid primary key references auth.users(id) on delete cascade,
  papel text not null check (papel in ('admin', 'lider_tribo')),
  tribo_id uuid references tribo(id) on delete set null,
  criado_em timestamptz not null default now(),
  constraint lider_precisa_de_tribo check (
    (papel = 'lider_tribo' and tribo_id is not null) or (papel = 'admin')
  )
);

create table missao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  tipo text not null check (tipo in ('booleana', 'contagem')),
  pontos_base integer not null check (pontos_base >= 0),
  ativa boolean not null default true,
  criado_por uuid not null references usuario_perfil(id),
  criado_em timestamptz not null default now()
);

create table snapshot_pontuacao (
  id uuid primary key default gen_random_uuid(),
  dados jsonb not null,           -- snapshot agregado por tribo/nação no momento do zerar
  criado_por uuid not null references usuario_perfil(id),
  criado_em timestamptz not null default now()
);

create table lancamento (
  id uuid primary key default gen_random_uuid(),
  missao_id uuid not null references missao(id),
  tribo_id uuid not null references tribo(id),
  quantidade integer not null default 1 check (quantidade >= 0),
  pontos_calculados integer not null,
  origem text not null default 'missao' check (origem in ('missao', 'bonus_confronto')),
  confronto_id uuid references confronto(id),
  removido boolean not null default false,
  snapshot_id uuid references snapshot_pontuacao(id),
  registrado_por uuid not null references usuario_perfil(id),
  criado_em timestamptz not null default now()
);

create table confronto (
  id uuid primary key default gen_random_uuid(),
  nivel text not null check (nivel in ('tribo', 'nacao')),
  participante_a_id uuid not null,
  participante_b_id uuid not null,
  periodo_inicio date not null,
  periodo_fim date not null,
  tipo text not null check (tipo in ('pontuacao_normal', 'missoes_exclusivas')),
  da_bonus boolean not null default false,
  pontos_bonus integer,
  vencedor_id uuid,
  finalizado boolean not null default false,
  criado_por uuid not null references usuario_perfil(id),
  criado_em timestamptz not null default now(),
  constraint bonus_precisa_de_pontos check (
    (da_bonus = false) or (da_bonus = true and pontos_bonus is not null)
  )
);

create table missao_confronto (
  id uuid primary key default gen_random_uuid(),
  confronto_id uuid not null references confronto(id) on delete cascade,
  missao_id uuid not null references missao(id)
);

create table configuracao_sistema (
  id boolean primary key default true check (id),  -- garante linha única (singleton)
  exibicao_publica_ativa boolean not null default false,
  atualizado_por uuid references usuario_perfil(id),
  atualizado_em timestamptz not null default now()
);
insert into configuracao_sistema (id, exibicao_publica_ativa) values (true, false);
```

> Nota: a FK de `lancamento.confronto_id` para `confronto(id)` cria dependência circular de criação de tabela na ordem acima — na migração real, criar `confronto` antes de `lancamento`, ou adicionar a FK via `alter table` depois de ambas existirem.

### 4.2 Views agregadas (para ranking, evitando recalcular em toda query)

```sql
create view v_pontuacao_tribo as
select
  t.id as tribo_id,
  t.nacao_id,
  t.nome as tribo_nome,
  coalesce(sum(l.pontos_calculados) filter (where l.removido = false), 0) as pontos_total
from tribo t
left join lancamento l on l.tribo_id = t.id
group by t.id, t.nacao_id, t.nome;

create view v_pontuacao_nacao as
select
  n.id as nacao_id,
  n.nome as nacao_nome,
  coalesce(sum(vpt.pontos_total), 0) as pontos_total
from nacao n
left join v_pontuacao_tribo vpt on vpt.nacao_id = n.id
group by n.id, n.nome;
```

Views equivalentes com filtro de período (semana corrente) devem ser criadas para o painel público — `v_pontuacao_tribo_semana` / `v_pontuacao_nacao_semana`, replicando a lógica acima com `where l.criado_em >= date_trunc('week', now())`.

### 4.3 Regra de implementação — missões booleanas

Quando o líder marca uma missão booleana como **falsa**, **não deve ser criado nenhum lançamento** (em vez de criar um lançamento com `pontos_calculados = 0`). Isso mantém a tabela `lancamento` representando apenas eventos que efetivamente pontuaram, simplificando auditoria e a lógica de "remover lançamento".

### 4.4 Row Level Security (RLS)

RLS deve estar habilitado em `lancamento`, `missao`, `tribo`, `nacao`, `confronto`, `snapshot_pontuacao`, `configuracao_sistema`.

```sql
alter table lancamento enable row level security;

-- Líder só vê/insere lançamentos da própria tribo
create policy lider_select_propria_tribo on lancamento
  for select using (
    exists (
      select 1 from usuario_perfil up
      where up.id = auth.uid()
        and (up.papel = 'admin' or up.tribo_id = lancamento.tribo_id)
    )
  );

create policy lider_insert_propria_tribo on lancamento
  for insert with check (
    exists (
      select 1 from usuario_perfil up
      where up.id = auth.uid()
        and up.papel = 'lider_tribo'
        and up.tribo_id = lancamento.tribo_id
    )
  );

-- Apenas admin remove (update do campo removido) ou zera
create policy admin_update_lancamento on lancamento
  for update using (
    exists (select 1 from usuario_perfil up where up.id = auth.uid() and up.papel = 'admin')
  );

-- Missões, tribos, nações, confrontos: leitura para autenticados, escrita só admin
create policy leitura_autenticados on missao for select using (auth.role() = 'authenticated');
create policy escrita_admin on missao for all using (
  exists (select 1 from usuario_perfil up where up.id = auth.uid() and up.papel = 'admin')
);
-- Repetir padrão análogo para tribo, nacao, confronto, snapshot_pontuacao, configuracao_sistema
```

O acesso público (sem login) deve ser feito **exclusivamente** através das views agregadas (`v_pontuacao_tribo`, `v_pontuacao_nacao`, variantes semanais), expostas com uma policy própria condicionada a `configuracao_sistema.exibicao_publica_ativa = true`, e nunca lendo a tabela `lancamento` diretamente.

---

## 5. Casos de uso (camada de aplicação)

Cada item abaixo deve virar uma classe/função de use case, recebendo as dependências (repositórios) via injeção, e retornando um resultado tipado (nunca lançando exceção genérica — usar um tipo `Result<T, DomainError>` ou equivalente).

### 5.1 Admin
- `CriarMissaoUseCase` — valida `pontos_base >= 0`, cria missão.
- `DesativarMissaoUseCase` — marca `ativa = false`; não afeta lançamentos existentes.
- `RemoverLancamentoUseCase` — soft delete de um lançamento específico.
- `ZerarPontuacoesUseCase` — 1) monta snapshot agregado (pontos por tribo/nação no momento), 2) persiste `snapshot_pontuacao`, 3) marca todos os lançamentos ativos como `removido = true` vinculando `snapshot_id`. Deve ser transacional (tudo ou nada).
- `CriarTriboUseCase` / `RemoverTriboUseCase` — remoção é hard delete (cascade nos lançamentos).
- `CriarNacaoUseCase` / `RemoverNacaoUseCase` — remoção de nação faz cascade em tribos e lançamentos.
- `CriarConfrontoUseCase` — valida que os dois participantes são do mesmo nível (`tribo` ou `nacao`), valida `pontos_bonus` presente se `da_bonus = true`.
- `FecharConfrontoUseCase` — calcula o vencedor conforme `tipo` do confronto (soma pontos do período para `pontuacao_normal`, ou soma pontos das missões vinculadas para `missoes_exclusivas`); se `da_bonus = true`, cria um `lancamento` de origem `bonus_confronto` para o vencedor.
- `AlternarExibicaoPublicaUseCase` — liga/desliga `configuracao_sistema.exibicao_publica_ativa`.

### 5.2 Líder de tribo
- `RegistrarLancamentoUseCase` — valida que `tribo_id` do lançamento é igual ao `tribo_id` do usuário autenticado (mesmo com RLS no banco, validar também na aplicação para retornar erro amigável); calcula `pontos_calculados` conforme o tipo da missão (ver 2.2).
- `ConsultarPontuacaoDaPropriaTriboUseCase`.
- `ListarMissoesAtivasUseCase`.

### 5.3 Público
- `ConsultarRankingPublicoUseCase` — retorna `null`/erro tipado se `exibicao_publica_ativa = false`; caso contrário, retorna apenas dados agregados das views.

---

## 6. PWA

- `manifest.json` com ícones, `display: standalone`, cor de tema.
- Service worker apenas para cache de assets estáticos e instalabilidade — **não** implementar escrita offline (lançamentos exigem conexão, dado que a autorização é validada no servidor/banco). Deixar claro na UI quando o usuário está offline.
- Testar instalação "adicionar à tela inicial" em iOS e Android antes de considerar concluído.

---

## 7. Deploy

1. Criar projeto no Supabase, aplicar as migrations da seção 4.
2. Configurar variáveis de ambiente no Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (uso restrito a operações de servidor que precisem bypassar RLS, ex: `ZerarPontuacoesUseCase` se necessário — usar com extremo cuidado e nunca expor ao client).
3. Deploy do repositório no Vercel (plano Hobby, uso não comercial).
4. Configurar um monitor externo (ex: cron do GitHub Actions ou Uptime Robot) fazendo um ping periódico ao projeto Supabase, para evitar a pausa automática por 7 dias de inatividade do plano gratuito.

---

## 8. Itens em aberto (decidir antes ou durante a implementação)

- Limite de lançamentos por missão (ex: só valer 1x por dia/semana por tribo) — não definido ainda; se necessário, adicionar constraint/validação no use case.
- Nível de detalhe da exibição pública além do agregado (hoje definido como só totais, sem lançamentos individuais).
- Se confrontos entre **nações** (não só tribos) devem comparar a soma das tribos ou permitir também missões exclusivas no nível de nação diretamente — o schema atual (`confronto.nivel`) já suporta ambos os níveis, mas a lógica de `FecharConfrontoUseCase` para `nivel = 'nacao'` com `tipo = 'missoes_exclusivas'` precisa definir se as missões exclusivas são lançadas por tribo (e agregadas) ou diretamente no nível da nação — **confirmar com o dono do produto antes de implementar essa combinação específica**.
- Fluxo de convite/criação de usuários líderes (hoje o schema assume que `usuario_perfil` é populado após o cadastro no Supabase Auth, mas o fluxo de "admin convida líder e vincula a uma tribo" não foi detalhado).
