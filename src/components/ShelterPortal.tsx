import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, MapPin, MessageCircle } from 'lucide-react';
import { AdoptionStage, Pet, PetHealthStatus } from '../types/pawpath';

interface ShelterPortalProps {
  pets: Pet[];
  onBack: () => void;
  onUpdatePet: (
    petId: string,
    updates: { status?: PetHealthStatus; adoptionStage?: AdoptionStage }
  ) => void;
  onOpenChat: (pet: Pet) => void;
}

export const ShelterPortal: React.FC<ShelterPortalProps> = ({
  pets,
  onBack,
  onUpdatePet,
  onOpenChat,
}) => {
  const [filter, setFilter] = useState<'all' | 'stray' | 'ongoing'>('all');

  const filtered = pets.filter((p) => {
    if (filter === 'stray') return p.listingType === 'stray' || p.status === 'URGENT RESCUE';
    if (filter === 'ongoing')
      return p.adoptionStage === 'Want to Adopt' || p.adoptionStage === 'Ongoing Adoption';
    return true;
  });

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 lg:pb-14">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A635C] hover:text-[#2D5A3C] mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Dashboard / Shelter &amp; NGO Portal</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D5A3C]">
            Verified Partner Operations
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
            Manila Shelter &amp; Rescue Triage Portal
          </h1>
          <p className="text-sm text-[#5A635C] mt-1">
            Verify stray reports, update medical triage statuses, and review incoming adoption
            requests.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all' ? 'bg-[#2D5A3C] text-white' : 'text-[#5A635C] hover:text-[#1A1A1A]'
            }`}
          >
            All ({pets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('stray')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'stray'
                ? 'bg-[#D97736] text-white'
                : 'text-[#5A635C] hover:text-[#1A1A1A]'
            }`}
          >
            Stray Reports
          </button>
          <button
            type="button"
            onClick={() => setFilter('ongoing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ongoing'
                ? 'bg-[#2D5A3C] text-white'
                : 'text-[#5A635C] hover:text-[#1A1A1A]'
            }`}
          >
            Adoption Requests
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((pet) => (
          <div
            key={pet.id}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4 min-w-0">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-xl object-cover shrink-0 bg-[#EAE7E7]"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-bold text-[#1A1A1A]">{pet.name}</h3>
                  <span className="text-xs text-[#5A635C]">· {pet.breed}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F7F8F4] text-[10px] font-bold uppercase text-[#2D5A3C]">
                    {pet.adoptionStage}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#5A635C] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D97736] shrink-0" />
                  <span className="truncate">{pet.barangay}</span>
                </div>
                <p className="text-xs text-[#414942] mt-1.5 line-clamp-2">{pet.medicalNotes}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <select
                value={pet.status}
                aria-label={`Update status for ${pet.name}`}
                onChange={(e) =>
                  onUpdatePet(pet.id, { status: e.target.value as PetHealthStatus })
                }
                className="h-9 px-3 rounded-xl border border-[#E2E4DE] bg-[#F7F8F4] text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#2D5A3C]"
              >
                <option value="HEALTHY">HEALTHY</option>
                <option value="NEEDS CARE">NEEDS CARE</option>
                <option value="URGENT RESCUE">URGENT RESCUE</option>
                <option value="PET ADOPTED">PET ADOPTED</option>
              </select>

              <button
                type="button"
                onClick={() => onOpenChat(pet)}
                className="h-9 px-3.5 rounded-xl border border-[#2D5A3C] text-[#2D5A3C] text-xs font-semibold hover:bg-[#2D5A3C]/5 flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Open Thread</span>
              </button>

              {pet.adoptionStage !== 'Pet Adopted' && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePet(pet.id, { status: 'PET ADOPTED', adoptionStage: 'Pet Adopted' })
                  }
                  className="h-9 px-3.5 rounded-xl bg-[#2D5A3C] text-white text-xs font-semibold hover:bg-[#21432C] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Adopted</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
