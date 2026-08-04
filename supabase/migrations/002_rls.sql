-- =====================================================
-- MIGRATION 002: ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Habilita RLS em todas as tabelas e cria as policies
-- de acesso por papel (admin, lider_tribo, público)
-- =====================================================

-- =====================================================
-- Habilitar RLS em todas as tabelas
-- =====================================================
alter table nacao enable row level security;
alter table tribo enable row level security;
alter table usuario_perfil enable row level security;
alter table missao enable row level security;
alter table lancamento enable row level security;
alter table snapshot_pontuacao enable row level security;
alter table confronto enable row level security;
alter table missao_confronto enable row level security;
alter table configuracao_sistema enable row level security;

-- =====================================================
-- HELPER: função para verificar se o usuário é admin
-- =====================================================
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from usuario_perfil
    where id = auth.uid() and papel = 'admin'
  );
$$ language sql security definer;

-- =====================================================
-- HELPER: função para obter o tribo_id do usuário logado
-- =====================================================
create or replace function user_tribo_id()
returns uuid as $$
  select tribo_id from usuario_perfil
  where id = auth.uid();
$$ language sql security definer;

-- =====================================================
-- POLICIES: nacao
-- =====================================================

-- Leitura para qualquer autenticado
create policy "nacao_select_autenticados" on nacao
  for select using (auth.role() = 'authenticated');

-- Escrita apenas para admin
create policy "nacao_insert_admin" on nacao
  for insert with check (is_admin());

create policy "nacao_update_admin" on nacao
  for update using (is_admin());

create policy "nacao_delete_admin" on nacao
  for delete using (is_admin());

-- =====================================================
-- POLICIES: tribo
-- =====================================================

-- Leitura para qualquer autenticado
create policy "tribo_select_autenticados" on tribo
  for select using (auth.role() = 'authenticated');

-- Escrita apenas para admin
create policy "tribo_insert_admin" on tribo
  for insert with check (is_admin());

create policy "tribo_update_admin" on tribo
  for update using (is_admin());

create policy "tribo_delete_admin" on tribo
  for delete using (is_admin());

-- =====================================================
-- POLICIES: usuario_perfil
-- =====================================================

-- Usuário vê seu próprio perfil; admin vê todos
create policy "perfil_select" on usuario_perfil
  for select using (
    auth.uid() = id or is_admin()
  );

-- Apenas admin insere/atualiza/remove perfis
create policy "perfil_insert_admin" on usuario_perfil
  for insert with check (is_admin());

create policy "perfil_update_admin" on usuario_perfil
  for update using (is_admin());

create policy "perfil_delete_admin" on usuario_perfil
  for delete using (is_admin());

-- =====================================================
-- POLICIES: missao
-- =====================================================

-- Leitura para qualquer autenticado
create policy "missao_select_autenticados" on missao
  for select using (auth.role() = 'authenticated');

-- Escrita apenas para admin
create policy "missao_insert_admin" on missao
  for insert with check (is_admin());

create policy "missao_update_admin" on missao
  for update using (is_admin());

create policy "missao_delete_admin" on missao
  for delete using (is_admin());

-- =====================================================
-- POLICIES: lancamento
-- =====================================================

-- Leitura: admin vê tudo, líder vê só da própria tribo
create policy "lancamento_select" on lancamento
  for select using (
    is_admin() or tribo_id = user_tribo_id()
  );

-- Inserção: líder insere apenas na própria tribo
create policy "lancamento_insert_lider" on lancamento
  for insert with check (
    exists (
      select 1 from usuario_perfil up
      where up.id = auth.uid()
        and up.papel = 'lider_tribo'
        and up.tribo_id = lancamento.tribo_id
    )
  );

-- Admin também pode inserir (para bônus de confronto)
create policy "lancamento_insert_admin" on lancamento
  for insert with check (is_admin());

-- Apenas admin pode atualizar (soft delete / zerar)
create policy "lancamento_update_admin" on lancamento
  for update using (is_admin());

-- =====================================================
-- POLICIES: snapshot_pontuacao
-- =====================================================

-- Leitura apenas para admin
create policy "snapshot_select_admin" on snapshot_pontuacao
  for select using (is_admin());

-- Inserção apenas para admin
create policy "snapshot_insert_admin" on snapshot_pontuacao
  for insert with check (is_admin());

-- =====================================================
-- POLICIES: confronto
-- =====================================================

-- Leitura para qualquer autenticado
create policy "confronto_select_autenticados" on confronto
  for select using (auth.role() = 'authenticated');

-- Escrita apenas para admin
create policy "confronto_insert_admin" on confronto
  for insert with check (is_admin());

create policy "confronto_update_admin" on confronto
  for update using (is_admin());

create policy "confronto_delete_admin" on confronto
  for delete using (is_admin());

-- =====================================================
-- POLICIES: missao_confronto
-- =====================================================

-- Leitura para qualquer autenticado
create policy "missao_confronto_select_autenticados" on missao_confronto
  for select using (auth.role() = 'authenticated');

-- Escrita apenas para admin
create policy "missao_confronto_insert_admin" on missao_confronto
  for insert with check (is_admin());

create policy "missao_confronto_delete_admin" on missao_confronto
  for delete using (is_admin());

-- =====================================================
-- POLICIES: configuracao_sistema
-- =====================================================

-- Leitura para qualquer autenticado
create policy "config_select_autenticados" on configuracao_sistema
  for select using (auth.role() = 'authenticated');

-- Atualização apenas para admin
create policy "config_update_admin" on configuracao_sistema
  for update using (is_admin());

-- =====================================================
-- POLICIES PÚBLICAS: Views de ranking
-- Acesso anônimo condicionado à exibição pública ativa
-- =====================================================

-- Permitir acesso anônimo às views quando exibição pública está ativa
-- Nota: Views herdam as policies das tabelas base.
-- Para expor views publicamente, precisamos de policies nas tabelas
-- base que permitam leitura anônima condicionada.

-- Policy para leitura anônima de nacao (ranking público)
create policy "nacao_select_publico" on nacao
  for select using (
    auth.role() = 'anon' and exists (
      select 1 from configuracao_sistema
      where exibicao_publica_ativa = true
    )
  );

-- Policy para leitura anônima de tribo (ranking público)
create policy "tribo_select_publico" on tribo
  for select using (
    auth.role() = 'anon' and exists (
      select 1 from configuracao_sistema
      where exibicao_publica_ativa = true
    )
  );

-- Policy para leitura anônima de lancamento (apenas via views agregadas)
create policy "lancamento_select_publico" on lancamento
  for select using (
    auth.role() = 'anon' and exists (
      select 1 from configuracao_sistema
      where exibicao_publica_ativa = true
    )
  );

-- Policy para leitura anônima de configuracao_sistema
create policy "config_select_publico" on configuracao_sistema
  for select using (auth.role() = 'anon');
