import React, { useMemo, useState } from 'react';
import { AdvancedMarker, Map as GoogleMap } from '@vis.gl/react-google-maps';
import {
  CheckCircle2,
  ExternalLink,
  Filter,
  MapPin,
  MessageCircle,
  Search,
  User,
  X,
} from 'lucide-react';
import { MANILA_DISTRICTS } from '../data/seedData';
import { Pet } from '../types/pawpath';

interface AdoptionMapViewProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelectPet: (petId: string) => void;
  onOpenChat: (pet: Pet) => void;
}

export const AdoptionMapView: React.FC<AdoptionMapViewProps> = ({
  pets,
  selectedPetId,
  onSelectPet,
  onOpenChat,
}) => {
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'Dog' | 'Cat' | 'urgent'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'any' | 'HEALTHY' | 'NEEDS CARE' | 'URGENT RESCUE'>('any');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsPet, setDetailsPet] = useState<Pet | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Only show active (non-adopted) pets on the public map
  const activePets = useMemo(
    () => pets.filter((p) => p.adoptionStage !== 'Pet Adopted'),
    [pets]
  );

  const filteredPets = useMemo(() => {
    return activePets.filter((pet) => {
      if (speciesFilter === 'Dog' && pet.species !== 'Dog') return false;
      if (speciesFilter === 'Cat' && pet.species !== 'Cat') return false;
      if (speciesFilter === 'urgent' && pet.status !== 'URGENT RESCUE') return false;
      if (urgencyFilter !== 'any' && pet.status !== urgencyFilter) return false;
      if (districtFilter !== 'All' && pet.district !== districtFilter) return false;
      if (
        searchQuery.trim() &&
        !`${pet.name} ${pet.breed} ${pet.barangay} ${pet.district}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [activePets, speciesFilter, urgencyFilter, districtFilter, searchQuery]);

  const activePet =
    filteredPets.find((p) => p.id === selectedPetId) || filteredPets[0] || activePets[0] || null;

  const mapCenter = useMemo(() => {
    if (districtFilter !== 'All') {
      const dist = MANILA_DISTRICTS.find((d) => d.name === districtFilter);
      if (dist) return { lat: dist.lat, lng: dist.lng };
    }
    return { lat: 14.596, lng: 120.984 };
  }, [districtFilter]);

  const getStatusBadge = (status: Pet['status']) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-[#E6F4EA] text-[#137333]';
      case 'NEEDS CARE':
        return 'bg-[#EAF0F9] text-[#2A4365]';
      case 'URGENT RESCUE':
        return 'bg-[#FCE8E6] text-[#A50E0E]';
      default:
        return 'bg-[#F0EDED] text-[#414942]';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-64px)] pb-20 lg:pb-0">
      {/* Desktop Sidebar Filters */}
      <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col bg-white border-r border-black/[0.06] p-6 gap-6">
        <div>
          <h2 className="font-display text-lg font-bold text-[#1A1A1A]">Filters</h2>
          <div className="relative mt-3">
            <Search className="w-4 h-4 text-[#5A635C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pet or barangay..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E2E4DE] bg-[#F7F8F4] text-xs focus:outline-none focus:border-[#2D5A3C]"
            />
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#5A635C] mb-2">
            Adoption Type
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F7F8F4]">
            {[
              { id: 'all', label: 'All' },
              { id: 'Dog', label: 'Dogs' },
              { id: 'Cat', label: 'Cats' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSpeciesFilter(item.id as typeof speciesFilter)}
                className={`h-8 rounded-lg text-xs font-semibold transition-colors ${
                  speciesFilter === item.id
                    ? 'bg-[#2D5A3C] text-white'
                    : 'text-[#414942] hover:text-[#1A1A1A]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#5A635C] mb-2">
            Urgency Level
          </span>
          <div className="space-y-2">
            {[
              { value: 'any', label: 'Any Urgency' },
              { value: 'HEALTHY', label: 'Low (Healthy / Ready)' },
              { value: 'NEEDS CARE', label: 'Medium (Needs Care)' },
              { value: 'URGENT RESCUE', label: 'Critical (Urgent Rescue)' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="desktop-urgency"
                  checked={urgencyFilter === opt.value}
                  onChange={() => setUrgencyFilter(opt.value as typeof urgencyFilter)}
                  className="w-4 h-4 accent-[#2D5A3C]"
                />
                <span className="text-[#1A1A1A] font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A635C] mb-2">
            Manila District
          </label>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E4DE] bg-white text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#2D5A3C]"
          >
            <option value="All">All Districts (Tondo, Sampaloc, etc)</option>
            {MANILA_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-auto pt-4 border-t border-black/[0.06] text-xs text-[#5A635C]">
          Showing <strong className="text-[#1A1A1A]">{filteredPets.length}</strong> active animals
          across Metro Manila.
        </div>
      </aside>

      {/* Mobile Filter Strip */}
      <div className="lg:hidden px-4 pt-3 pb-2 bg-[#F7F8F4] space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5A635C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Barangay or Pet Name..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-[#E2E4DE] text-xs focus:outline-none focus:border-[#2D5A3C]"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMobileFilters((v) => !v)}
            className="h-10 px-3 rounded-xl bg-white border border-[#E2E4DE] text-xs font-semibold text-[#2D5A3C] flex items-center gap-1 shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{districtFilter === 'All' ? 'All Manila' : districtFilter}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: `All (${activePets.length})` },
            { id: 'Dog', label: 'Dogs' },
            { id: 'Cat', label: 'Cats' },
            { id: 'urgent', label: 'Urgent Strays' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSpeciesFilter(pill.id as typeof speciesFilter)}
              className={`px-3.5 h-8 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                speciesFilter === pill.id
                  ? 'bg-[#2D5A3C] text-white'
                  : 'bg-white text-[#1A1A1A] border border-[#E2E4DE]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {showMobileFilters && (
          <div className="bg-white rounded-2xl p-3 border border-[#E2E4DE] grid grid-cols-2 gap-2">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-[#E2E4DE] text-xs bg-white"
            >
              <option value="All">All Districts</option>
              {MANILA_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as typeof urgencyFilter)}
              className="h-9 px-2.5 rounded-lg border border-[#E2E4DE] text-xs bg-white"
            >
              <option value="any">Any Urgency</option>
              <option value="HEALTHY">Healthy</option>
              <option value="NEEDS CARE">Needs Care</option>
              <option value="URGENT RESCUE">Urgent Rescue</option>
            </select>
          </div>
        )}
      </div>

      {/* Interactive Google Map Canvas + Floating Preview Card */}
      <div className="relative flex-1 min-h-[540px] lg:h-[calc(100vh-64px)]">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={mapCenter}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%', minHeight: '540px' }}
        >
          {filteredPets.map((pet) => {
            const isSelected = activePet?.id === pet.id;
            const isUrgent = pet.status === 'URGENT RESCUE';
            return (
              <AdvancedMarker
                key={pet.id}
                position={{ lat: pet.lat, lng: pet.lng }}
                onClick={() => onSelectPet(pet.id)}
                title={`${pet.name} (${pet.district})`}
              >
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border-2 transition-transform cursor-pointer ${
                    isSelected
                      ? 'bg-[#2D5A3C] text-white border-white scale-110'
                      : isUrgent
                      ? 'bg-[#FCE8E6] text-[#A50E0E] border-[#D9383A]'
                      : 'bg-white text-[#144226] border-[#2D5A3C]/40 hover:scale-105'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{pet.name}</span>
                </div>
              </AdvancedMarker>
            );
          })}
        </GoogleMap>

        {/* Floating Adoption Preview Card */}
        {activePet && (
          <div className="mt-3 mx-4 lg:mt-0 lg:mx-0 lg:absolute lg:bottom-6 lg:right-6 lg:w-[340px] z-20 bg-white rounded-2xl shadow-xl overflow-hidden border border-black/[0.06]">
            <div className="relative h-40 w-full bg-[#EAE7E7]">
              <img
                src={activePet.imageUrl}
                alt={activePet.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusBadge(
                  activePet.status
                )}`}
              >
                {activePet.status}
              </span>
            </div>

            <div className="p-4 space-y-2.5">
              <div>
                <h3 className="font-display text-lg font-bold text-[#1A1A1A]">{activePet.name}</h3>
                <p className="text-xs text-[#5A635C]">
                  {activePet.breed} · {activePet.ageLabel}
                </p>
              </div>

              <div className="space-y-1 text-xs text-[#414942]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D97736] shrink-0" />
                  <span className="truncate">{activePet.barangay}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#2D5A3C] shrink-0" />
                  <span className="truncate">
                    Reported by: <strong>{activePet.reporterName}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDetailsPet(activePet)}
                  className="h-10 rounded-full border border-[#E2E4DE] text-[#1A1A1A] text-xs font-semibold hover:bg-[#F7F8F4] flex items-center justify-center gap-1"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChat(activePet)}
                  className="h-10 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Connect / Chat</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pet Details Modal */}
      {detailsPet && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setDetailsPet(null)}
              aria-label="Close pet details"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-[#1A1A1A] flex items-center justify-center shadow"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={detailsPet.imageUrl}
              alt={detailsPet.name}
              referrerPolicy="no-referrer"
              className="w-full h-56 object-cover"
            />
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#1A1A1A]">
                    {detailsPet.name}
                  </h3>
                  <p className="text-sm text-[#5A635C]">
                    {detailsPet.breed} · {detailsPet.ageLabel}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${getStatusBadge(
                    detailsPet.status
                  )}`}
                >
                  {detailsPet.status}
                </span>
              </div>

              <div className="bg-[#F7F8F4] rounded-2xl p-4 space-y-2 text-xs text-[#414942]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D97736]" />
                  <span>{detailsPet.barangay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A3C]" />
                  <span>
                    {detailsPet.vaccinated
                      ? 'Vaccinated & Health Screened'
                      : 'Pending Shelter Vaccination'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A635C] mb-1">
                  Medical &amp; Care Notes
                </h4>
                <p className="text-sm text-[#1A1A1A] leading-relaxed">{detailsPet.medicalNotes}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const target = detailsPet;
                  setDetailsPet(null);
                  onOpenChat(target);
                }}
                className="w-full h-12 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Start Adoption Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
