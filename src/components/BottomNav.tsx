"use client";

/**
 * BottomNav — Navigation mobile en bas pour pages publiques
 * Immo West Afro Bénin
 *
 * Usage dans le layout public :
 *   <BottomNav />
 *
 * Visible uniquement sur mobile (< md).
 * Ajouter padding-bottom: 64px au main content quand visible.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  activeIcon: React.FC<{ className?: string }>;
  badge?: number;
}

// ── Icônes SVG inline (pas de dépendance externe) ──────────

const HomeIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const HomeIconFilled = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const SearchIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SearchIconFilled = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const HeartIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const HeartIconFilled = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const MapIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const MapIconFilled = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
  </svg>
);

const PlusIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

// ── Composant principal ─────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname();
  const [favCount, setFavCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Compte les favoris depuis localStorage
  useEffect(() => {
    const updateFavCount = () => {
      try {
        const favs = JSON.parse(localStorage.getItem("immo_favorites") || "[]");
        setFavCount(Array.isArray(favs) ? favs.length : 0);
      } catch {
        setFavCount(0);
      }
    };
    updateFavCount();
    window.addEventListener("storage", updateFavCount);
    // Custom event pour mise à jour synchrone
    window.addEventListener("favoritesUpdated", updateFavCount);
    return () => {
      window.removeEventListener("storage", updateFavCount);
      window.removeEventListener("favoritesUpdated", updateFavCount);
    };
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Masquer dans les dashboards
  const isDashboard =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/client");

  if (isDashboard) return null;

  const navItems: NavItem[] = [
    {
      href: "/",
      label: "Accueil",
      icon: HomeIcon,
      activeIcon: HomeIconFilled,
    },
    {
      href: "/recherche",
      label: "Recherche",
      icon: SearchIcon,
      activeIcon: SearchIconFilled,
    },
    {
      href: "/carte",
      label: "Carte",
      icon: MapIcon,
      activeIcon: MapIconFilled,
    },
    {
      href: "/favoris",
      label: "Favoris",
      icon: HeartIcon,
      activeIcon: HeartIconFilled,
      badge: favCount,
    },
  ];

  return (
    <>
      {/* Spacer pour éviter que le contenu soit caché sous la nav */}
      <div className="h-16 md:hidden" aria-hidden="true" />

      {/* Bottom Navigation */}
      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-50
          md:hidden
          bg-white dark:bg-gray-900
          border-t border-gray-200 dark:border-gray-800
          safe-bottom
          transition-transform duration-300 ease-in-out
          ${visible ? "translate-y-0" : "translate-y-full"}
        `}
        aria-label="Navigation principale"
        role="navigation"
      >
        <div className="flex items-stretch h-16">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = isActive ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-1
                  relative select-none
                  transition-all duration-150 active:scale-95
                  min-w-[44px] min-h-[44px]
                  ${isActive
                    ? "text-emerald-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }
                `}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isActive ? "text-emerald-500" : ""
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Bouton central Publier (CTA flottant intégré) */}
          <Link
            href="/publier"
            className="
              flex-1 flex flex-col items-center justify-center gap-1
              min-w-[44px] min-h-[44px]
              relative select-none active:scale-95 transition-transform duration-150
            "
            aria-label="Publier une annonce"
          >
            <div className="
              w-10 h-10 rounded-full
              bg-gradient-to-br from-emerald-400 to-emerald-600
              flex items-center justify-center
              shadow-lg shadow-emerald-500/40
              -mt-4
            ">
              <PlusIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-medium text-emerald-500 leading-none">
              Publier
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
