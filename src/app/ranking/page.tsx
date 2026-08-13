import { createClient } from '@/shared/infrastructure/supabase/server';
import { makeAppServices } from '@/shared/infrastructure/factories';
import { RankingTable } from '@/presentation/components/RankingTable';
import Image from 'next/image';
import Link from 'next/link';
import './ranking.css';

// Revalidar a cada 60 segundos para dados quase em tempo real
export const revalidate = 60;

export default async function RankingPublicoPage() {
  // Inicializando cliente Supabase e serviços da aplicação
  const supabase = await createClient();
  const services = makeAppServices(supabase);

  // Consultando o ranking público (nações + tribos)
  const res = await services.ranking.consultarPublico.execute();

  return (
    <div className="ranking-page">
      <div className="ranking-wrapper">

        {/* =====================================================
            HEADER — Título principal + botão de acesso restrito
            ===================================================== */}
        <header className="ranking-header">
          <div className="ranking-header-left">
            <div>
              <h1 className="ranking-main-title">🏆 Ranking Geral — Rally</h1>
              <p className="ranking-main-subtitle">
                Classificação em tempo real das Nações e Tribos
              </p>
            </div>
          </div>
          <Link href="/login" className="ranking-btn-restricted">
            🔐 Acesso Restrito
          </Link>
        </header>

        {/* =====================================================
            CONTEÚDO — Tabelas ou estado desativado
            ===================================================== */}
        {!res.ok ? (
          <div className="ranking-disabled">
            <div className="ranking-disabled-icon">🔒</div>
            <h2 className="ranking-disabled-title">Exibição Pública Desativada</h2>
            <p className="ranking-disabled-text">{res.error.message}</p>
          </div>
        ) : (
          <div>
            {/* Classificação por Nações */}
            <RankingTable titulo="Classificação por Nações" nacoes={res.value.nacoes} />

            {/* Classificação por Tribos */}
            <RankingTable titulo="Classificação por Tribos" tribos={res.value.tribos} />
          </div>
        )}

        {/* =====================================================
            FOOTER — Logo FJU Sorocaba SP
            ===================================================== */}
        <footer className="ranking-footer">
          <Image
            src="/fju_sorocaba_logo.png"
            alt="FJU Sorocaba SP"
            width={120}
            height={24}
            className="ranking-footer-logo"
            unoptimized
            style={{ width: 'auto', height: '24px' }}
          />
        </footer>
      </div>
    </div>
  );
}
