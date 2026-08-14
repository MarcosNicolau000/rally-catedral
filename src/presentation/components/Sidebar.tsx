'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  papel: 'admin' | 'lider_tribo' | 'visitante';
  onLogout?: () => void;
}

export function Sidebar({ papel, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  const linksAdmin = [
    { href: '/admin/dashboard', label: '🏆 Dashboard', icon: '📊' },
    { href: '/admin/nacoes', label: '🏴 Nações', icon: '🏴' },
    { href: '/admin/tribos', label: '🛡️ Tribos', icon: '🛡️' },
    { href: '/admin/missoes', label: '🎯 Missões', icon: '🎯' },
    { href: '/admin/lancamentos', label: '📋 Lançamentos', icon: '📋' },
    { href: '/admin/confrontos', label: '⚔️ Confrontos', icon: '⚔️' },
    { href: '/admin/usuarios', label: '👥 Usuários', icon: '👥' },
    { href: '/admin/configuracoes', label: '⚙️ Configurações', icon: '⚙️' },
  ];

  const linksLider = [
    { href: '/lider/lancamentos', label: '➕ Novo Lançamento', icon: '➕' },
    { href: '/lider/pontuacao', label: '📊 Minha Tribo', icon: '📊' },
  ];

  const linksPublicos = [
    { href: '/ranking', label: '🏆 Ranking Público', icon: '🏆' },
  ];

  const navItems =
    papel === 'admin'
      ? linksAdmin
      : papel === 'lider_tribo'
      ? linksLider
      : linksPublicos;

  return (
    <>
      {/* Botão de Toggle para Telas Mobile */}
      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => setMenuAberto(!menuAberto)}
        aria-label="Abrir menu de navegação"
      >
        {menuAberto ? '✕' : '☰'}
      </button>

      <aside className={`sidebar ${menuAberto ? 'mobile-open' : ''}`}>
        <div className="brand-logo">
          <span>⚡ RALLY</span>
        </div>

        <nav style={{ flex: 1 }}>
          <ul className="nav-list">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuAberto(false)}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    aria-label={item.label}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {onLogout && papel !== 'visitante' && (
          <button
            onClick={onLogout}
            className="btn btn-secondary sidebar-logout"
            style={{ width: '100%' }}
            aria-label="Sair da conta"
          >
            🚪 Sair
          </button>
        )}
      </aside>
    </>
  );
}

