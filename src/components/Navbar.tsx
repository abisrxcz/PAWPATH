import React from 'react';
import {
  HeartHandshake,
  Home,
  LogOut,
  MapPin,
  MessageCircle,
  ShieldPlus,
  ShoppingBag,
  User,
} from 'lucide-react';
import { AppView, UserProfile } from '../types/pawpath';

interface NavbarProps {
  user: UserProfile | null;
  activeView: AppView;
  onNavigate: (view: AppView, sectionId?: string) => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onLogout: () => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  onNavigate,
  onOpenLogin,
  onOpenSignup,
  onLogout,
  cartCount,
}) => {
  return (
    <>
      {/* Desktop & Mobile Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-black/[0.06] pt-safe">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => onNavigate(user ? 'role-hub' : 'landing')}
            className="flex items-center gap-2.5 text-left shrink-0 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2D5A3C] text-white flex items-center justify-center shadow-sm">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-base tracking-tight text-[#1A1A1A] whitespace-nowrap">
                PAWPATH
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#D97736] mt-0.5 whitespace-nowrap">
                MANILA ANIMAL WELFARE
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#414942]">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('landing', 'hero')}
                  className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                    activeView === 'landing'
                      ? 'border-[#2D5A3C] text-[#144226] font-semibold'
                      : 'border-transparent hover:text-[#144226]'
                  }`}
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('landing', 'goals')}
                  className="whitespace-nowrap pb-1 border-b-2 border-transparent hover:text-[#144226] transition-colors"
                >
                  Goals
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('landing', 'about')}
                  className="whitespace-nowrap pb-1 border-b-2 border-transparent hover:text-[#144226] transition-colors"
                >
                  About us
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('landing', 'contact')}
                  className="whitespace-nowrap pb-1 border-b-2 border-transparent hover:text-[#144226] transition-colors"
                >
                  Contact us
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('role-hub')}
                  className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                    activeView === 'role-hub'
                      ? 'border-[#2D5A3C] text-[#144226] font-semibold'
                      : 'border-transparent hover:text-[#144226]'
                  }`}
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('adoption-map')}
                  className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                    activeView === 'adoption-map'
                      ? 'border-[#2D5A3C] text-[#144226] font-semibold'
                      : 'border-transparent hover:text-[#144226]'
                  }`}
                >
                  Adoption Map
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('health-centers')}
                  className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                    activeView === 'health-centers'
                      ? 'border-[#2D5A3C] text-[#144226] font-semibold'
                      : 'border-transparent hover:text-[#144226]'
                  }`}
                >
                  Health Centers
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('food-shops')}
                  className={`whitespace-nowrap pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeView === 'food-shops'
                      ? 'border-[#2D5A3C] text-[#144226] font-semibold'
                      : 'border-transparent hover:text-[#144226]'
                  }`}
                >
                  <span>Food Shops</span>
                  {cartCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#D97736] text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('chat')}
                  className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                    activeView === 'chat'
                      ? 'border-[#2D5A3C] text-[#144226] font-semibold'
                      : 'border-transparent hover:text-[#144226]'
                  }`}
                >
                  Messages
                </button>
              </>
            )}
          </nav>

          {/* Right Auth / User Profile Zone */}
          <div className="flex items-center gap-2.5 shrink-0">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-4 py-2 rounded-full border border-[#E2E4DE] bg-white text-[#1A1A1A] text-sm font-semibold hover:bg-[#F7F8F4] transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={onOpenSignup}
                  className="px-4 py-2 rounded-full bg-[#2D5A3C] text-white text-sm font-semibold hover:bg-[#21432C] transition-colors shadow-sm whitespace-nowrap"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('role-hub')}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-[#F7F8F4] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#BCEFC7] text-[#144226] flex items-center justify-center font-bold text-xs">
                    {user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#1A1A1A] leading-tight">
                      {user.fullName}
                    </span>
                    <span className="text-[11px] text-[#5A635C] leading-tight">
                      {user.district}, Manila
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  title="Log out"
                  aria-label="Log out"
                  className="w-9 h-9 rounded-full border border-[#E2E4DE] flex items-center justify-center text-[#5A635C] hover:text-[#A50E0E] hover:bg-[#FCE8E6] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Navigation (< 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-black/[0.06] pb-safe shadow-[0_-4px_16px_rgba(26,26,26,0.05)]">
        <div className="h-16 grid grid-cols-5 items-center px-1">
          <button
            type="button"
            onClick={() => onNavigate(user ? 'role-hub' : 'landing')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              activeView === 'landing' || activeView === 'role-hub'
                ? 'text-[#2D5A3C] font-bold'
                : 'text-[#6B7280]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] mt-0.5">Home</span>
          </button>

          <button
            type="button"
            onClick={() => (user ? onNavigate('adoption-map') : onOpenLogin())}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              activeView === 'adoption-map' ? 'text-[#2D5A3C] font-bold' : 'text-[#6B7280]'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[11px] mt-0.5">Map</span>
          </button>

          <button
            type="button"
            onClick={() => (user ? onNavigate('chat') : onOpenLogin())}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              activeView === 'chat' ? 'text-[#2D5A3C] font-bold' : 'text-[#6B7280]'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[11px] mt-0.5">Chat</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('health-centers')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              activeView === 'health-centers' ? 'text-[#2D5A3C] font-bold' : 'text-[#6B7280]'
            }`}
          >
            <ShieldPlus className="w-5 h-5" />
            <span className="text-[11px] mt-0.5">Health</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('food-shops')}
            className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors ${
              activeView === 'food-shops' ? 'text-[#2D5A3C] font-bold' : 'text-[#6B7280]'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-3 w-4 h-4 rounded-full bg-[#D97736] text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-[11px] mt-0.5">Food</span>
          </button>
        </div>
      </nav>
    </>
  );
};
