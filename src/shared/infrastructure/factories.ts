// =====================================================
// Container / Factories de Injeção de Dependência
// =====================================================
// Composition root: conecta repositórios concretos do Supabase
// aos use cases de cada módulo de domínio.
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';

// Repositórios Concretos
import { SupabaseNacaoRepository } from '@/modules/nacao/infrastructure/SupabaseNacaoRepository';
import { SupabaseTriboRepository } from '@/modules/tribo/infrastructure/SupabaseTriboRepository';
import { SupabaseUsuarioRepository } from '@/modules/usuario/infrastructure/SupabaseUsuarioRepository';
import { SupabaseMissaoRepository } from '@/modules/missao/infrastructure/SupabaseMissaoRepository';
import { SupabaseLancamentoRepository } from '@/modules/lancamento/infrastructure/SupabaseLancamentoRepository';
import { SupabaseSnapshotRepository } from '@/modules/snapshot/infrastructure/SupabaseSnapshotRepository';
import { SupabaseConfrontoRepository } from '@/modules/confronto/infrastructure/SupabaseConfrontoRepository';
import { SupabaseRankingRepository } from '@/modules/ranking/infrastructure/SupabaseRankingRepository';
import { SupabaseConfiguracaoRepository } from '@/modules/configuracao/infrastructure/SupabaseConfiguracaoRepository';

// Use Cases — Nação
import { CriarNacaoUseCase } from '@/modules/nacao/application/use-cases/CriarNacaoUseCase';
import { RemoverNacaoUseCase } from '@/modules/nacao/application/use-cases/RemoverNacaoUseCase';
import { ListarNacoesUseCase } from '@/modules/nacao/application/use-cases/ListarNacoesUseCase';

// Use Cases — Tribo
import { CriarTriboUseCase } from '@/modules/tribo/application/use-cases/CriarTriboUseCase';
import { RemoverTriboUseCase } from '@/modules/tribo/application/use-cases/RemoverTriboUseCase';
import { ListarTribosUseCase } from '@/modules/tribo/application/use-cases/ListarTribosUseCase';

// Use Cases — Usuário
import { ObterUsuarioLogadoUseCase } from '@/modules/usuario/application/use-cases/ObterUsuarioLogadoUseCase';
import { CriarUsuarioUseCase } from '@/modules/usuario/application/use-cases/CriarUsuarioUseCase';
import { VincularLiderATriboUseCase } from '@/modules/usuario/application/use-cases/VincularLiderATriboUseCase';
import { RemoverUsuarioUseCase } from '@/modules/usuario/application/use-cases/RemoverUsuarioUseCase';

// Use Cases — Missão
import { CriarMissaoUseCase } from '@/modules/missao/application/use-cases/CriarMissaoUseCase';
import { DesativarMissaoUseCase } from '@/modules/missao/application/use-cases/DesativarMissaoUseCase';
import { ListarMissoesAtivasUseCase } from '@/modules/missao/application/use-cases/ListarMissoesAtivasUseCase';

// Use Cases — Lançamento
import { RegistrarLancamentoUseCase } from '@/modules/lancamento/application/use-cases/RegistrarLancamentoUseCase';
import { RemoverLancamentoUseCase } from '@/modules/lancamento/application/use-cases/RemoverLancamentoUseCase';
import { ZerarPontuacoesUseCase } from '@/modules/lancamento/application/use-cases/ZerarPontuacoesUseCase';
import { ListarLancamentosUseCase } from '@/modules/lancamento/application/use-cases/ListarLancamentosUseCase';
import { AjustarPontuacaoManualUseCase } from '@/modules/lancamento/application/use-cases/AjustarPontuacaoManualUseCase';

// Use Cases — Confronto
import { CriarConfrontoUseCase } from '@/modules/confronto/application/use-cases/CriarConfrontoUseCase';
import { FecharConfrontoUseCase } from '@/modules/confronto/application/use-cases/FecharConfrontoUseCase';
import { ListarConfrontosUseCase } from '@/modules/confronto/application/use-cases/ListarConfrontosUseCase';

// Use Cases — Ranking
import { ConsultarRankingAdminUseCase } from '@/modules/ranking/application/use-cases/ConsultarRankingAdminUseCase';
import { ConsultarRankingPublicoUseCase } from '@/modules/ranking/application/use-cases/ConsultarRankingPublicoUseCase';

// Use Cases — Configuração
import { AlternarExibicaoPublicaUseCase } from '@/modules/configuracao/application/use-cases/AlternarExibicaoPublicaUseCase';
import { ObterConfiguracaoUseCase } from '@/modules/configuracao/application/use-cases/ObterConfiguracaoUseCase';

export function makeAppServices(supabase: SupabaseClient) {
  // Instanciando Repositórios
  const nacaoRepo = new SupabaseNacaoRepository(supabase);
  const triboRepo = new SupabaseTriboRepository(supabase);
  const usuarioRepo = new SupabaseUsuarioRepository(supabase);
  const missaoRepo = new SupabaseMissaoRepository(supabase);
  const lancamentoRepo = new SupabaseLancamentoRepository(supabase);
  const snapshotRepo = new SupabaseSnapshotRepository(supabase);
  const confrontoRepo = new SupabaseConfrontoRepository(supabase);
  const rankingRepo = new SupabaseRankingRepository(supabase);
  const configRepo = new SupabaseConfiguracaoRepository(supabase);

  return {
    // Repositórios expostos se necessário
    repos: {
      nacaoRepo,
      triboRepo,
      usuarioRepo,
      missaoRepo,
      lancamentoRepo,
      snapshotRepo,
      confrontoRepo,
      rankingRepo,
      configRepo,
    },
    // Use Cases — Nação
    nacao: {
      criar: new CriarNacaoUseCase(nacaoRepo),
      remover: new RemoverNacaoUseCase(nacaoRepo, confrontoRepo),
      listar: new ListarNacoesUseCase(nacaoRepo),
    },
    // Use Cases — Tribo
    tribo: {
      criar: new CriarTriboUseCase(triboRepo),
      remover: new RemoverTriboUseCase(triboRepo, confrontoRepo),
      listar: new ListarTribosUseCase(triboRepo),
    },

    // Use Cases — Usuário
    usuario: {
      obterLogado: new ObterUsuarioLogadoUseCase(usuarioRepo),
      criar: new CriarUsuarioUseCase(usuarioRepo),
      vincularLider: new VincularLiderATriboUseCase(usuarioRepo),
      remover: new RemoverUsuarioUseCase(usuarioRepo),
    },
    // Use Cases — Missão
    missao: {
      criar: new CriarMissaoUseCase(missaoRepo),
      desativar: new DesativarMissaoUseCase(missaoRepo),
      listarAtivas: new ListarMissoesAtivasUseCase(missaoRepo),
    },
    // Use Cases — Lançamento
    lancamento: {
      registrar: new RegistrarLancamentoUseCase(lancamentoRepo, missaoRepo, usuarioRepo),
      remover: new RemoverLancamentoUseCase(lancamentoRepo),
      zerar: new ZerarPontuacoesUseCase(lancamentoRepo, rankingRepo, supabase),
      listar: new ListarLancamentosUseCase(lancamentoRepo),
      ajustarManual: new AjustarPontuacaoManualUseCase(lancamentoRepo, usuarioRepo),
    },
    // Use Cases — Confronto
    confronto: {
      criar: new CriarConfrontoUseCase(confrontoRepo),
      fechar: new FecharConfrontoUseCase(confrontoRepo, lancamentoRepo),
      listar: new ListarConfrontosUseCase(confrontoRepo),
    },
    // Use Cases — Ranking
    ranking: {
      consultarAdmin: new ConsultarRankingAdminUseCase(rankingRepo),
      consultarPublico: new ConsultarRankingPublicoUseCase(rankingRepo, configRepo),
    },
    // Use Cases — Configuração
    configuracao: {
      alternarPublico: new AlternarExibicaoPublicaUseCase(configRepo),
      obter: new ObterConfiguracaoUseCase(configRepo),
    },
  };
}
