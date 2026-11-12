import React from 'react';
import {
  ArrowUpRight,
  Building2,
  HeartHandshake,
  Home,
  Megaphone,
  ShieldAlert,
} from 'lucide-react';
import { AppView, Pet, UserProfile } from '../types/pawpath';

interface RoleHubProps {
  user: UserProfile;
  pets: Pet[];
  onNavigate: (view: AppView) => void;
}

export const RoleHub: React.FC<RoleHubProps> = ({ user, pets, onNavigate }) => {
  const firstName = user.fullName.split(' ')[0];
  const availableCount = pets.filter((p) => p.adoptionStage !== 'Pet Adopted').length;
  const urgentCount = pets.filter(
    (p) => p.status === 'URGENT RESCUE' && p.adoptionStage !== 'Pet Adopted'
  ).length;

  const cards = [
    {
      id: 'rehome',
      title: 'Rehome My Pet',
      badge: 'Private',
      badgeStyle: 'bg-[#F0EDED] text-[#414942]',
      description:
        'I want to safely rehome my family pet due to unfortunate or financial life events with gentle vetting.',
      icon: Home,
      iconBg: 'bg-[#2D5A3C] text-white',
      target: 'rehome-form' as AppView,
    },
    {
      id: 'stray',
      title: 'Report a Stray',
      badge: 'Fast Dispatch',
      badgeStyle: 'bg-[#FCE8E6] text-[#A50E0E]',
      description:
        'I found a stray dog/cat that needs critical medical diagnostics, rabies safe checks, or shelter rescue.',
      icon: ShieldAlert,
      iconBg: 'bg-[#D97736] text-white',
      target: 'stray-form' as AppView,
    },
    {
      id: 'adopt',
      title: 'Adopt a Pet',
      badge: `${availableCount} Available`,
      badgeStyle: 'bg-[#E6F4EA] text-[#137333]',
      description:
        'I want to apply for adoption and bring home an aspin or puspin companion looking for lifelong love.',
      icon: HeartHandshake,
      iconBg: 'bg-[#0284C7] text-white',
      target: 'adoption-map' as AppView,
    },
    {
      id: 'shelter',
      title: 'Animal Shelter / Organization',
      badge: 'Partner Portal',
      badgeStyle: 'bg-[#EAF0F9] text-[#2A4365]',
      description:
        'We are a registered veterinary hospital, barangay pound, or rescue NGO reviewing requests and stray alerts.',
      icon: Building2,
      iconBg: 'bg-[#6D28D9] text-white',
      target: 'shelter-portal' as AppView,
    },
  ];

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-14">
      {/* Greeting */}
      <div className="mb-6 sm:mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-[#E6F4EA] text-[#137333] text-[11px] font-bold uppercase tracking-wider mb-3">
          Metro Manila Welfare Hub
        </span>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A] tracking-tight">
          Welcome back, <span className="text-[#2D5A3C]">{firstName}</span>! How can we help today?
        </h1>
        <p className="text-sm sm:text-base text-[#5A635C] mt-2">
          Select an action path to start submitting animal reports, adoption inquiries, or managing
          shelter data.
        </p>
      </div>

      {/* Live Urgent Alert Strip */}
      {urgentCount > 0 && (
        <button
          type="button"
          onClick={() => onNavigate('adoption-map')}
          className="w-full mb-6 bg-[#FEF3E6] hover:bg-[#FFDBC9]/60 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#D97736] text-white flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#994703]">
                Manila Urgent Triage · {urgentCount} Active
              </div>
              <p className="text-xs sm:text-sm text-[#321200] truncate">
                Urgent stray rescue dispatches are active on the Metro Manila Adoption Map.
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#994703] shrink-0" />
        </button>
      )}

      {/* 2x2 Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onNavigate(card.target)}
              className="group text-left bg-white rounded-2xl p-6 shadow-[0_2px_8px_-2px_rgba(45,90,60,0.05),0_1px_3px_0_rgba(26,26,26,0.04)] hover:shadow-md active:scale-[0.99] transition-all flex flex-col justify-between gap-5"
            >
              <div className="flex items-start justify-between w-full">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${card.iconBg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F7F8F4] text-[#5A635C] group-hover:bg-[#2D5A3C] group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="font-display text-lg font-bold text-[#1A1A1A]">{card.title}</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${card.badgeStyle}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <p className="text-sm text-[#5A635C] leading-relaxed">{card.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Personal Impact Summary */}
      <div className="mt-8 bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(45,90,60,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold text-[#1A1A1A]">
            Your Metro Manila Impact
          </h3>
          <span className="text-xs font-semibold text-[#2D5A3C]">{user.district}, Manila</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-[#F7F8F4] rounded-xl p-3">
            <span className="font-display text-xl font-bold text-[#2D5A3C] tabular-nums block">
              {availableCount}
            </span>
            <span className="text-xs text-[#5A635C]">Active Pets</span>
          </div>
          <div className="bg-[#F7F8F4] rounded-xl p-3">
            <span className="font-display text-xl font-bold text-[#D97736] tabular-nums block">
              {urgentCount}
            </span>
            <span className="text-xs text-[#5A635C]">Urgent Strays</span>
          </div>
          <div className="bg-[#F7F8F4] rounded-xl p-3">
            <span className="font-display text-xl font-bold text-[#293A5A] tabular-nums block">
              {pets.filter((p) => p.adoptionStage === 'Pet Adopted').length}
            </span>
            <span className="text-xs text-[#5A635C]">Adopted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
