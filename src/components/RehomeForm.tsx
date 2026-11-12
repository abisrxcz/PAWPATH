import React, { useState } from 'react';
import { AdvancedMarker, Map as GoogleMap, Pin } from '@vis.gl/react-google-maps';
import { ArrowLeft, MapPin, Upload } from 'lucide-react';
import { MANILA_DISTRICTS, SEED_PETS } from '../data/seedData';
import { createPetListing } from '../lib/supabaseClient';
import { Pet, PetSpecies, UserProfile } from '../types/pawpath';

interface RehomeFormProps {
  user: UserProfile;
  onBack: () => void;
  onCreated: (pet: Pet) => void;
}

export const RehomeForm: React.FC<RehomeFormProps> = ({ user, onBack, onCreated }) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('Dog');
  const [breed, setBreed] = useState('');
  const [ageLabel, setAgeLabel] = useState('');
  const [vaccinated, setVaccinated] = useState<'Yes' | 'No'>('Yes');
  const [reason, setReason] = useState('');
  const [district, setDistrict] = useState(user.district || 'Sampaloc');
  const [barangay, setBarangay] = useState('');
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>({
    lat: 14.6091,
    lng: 120.9923,
  });
  const [photoPreview, setPhotoPreview] = useState<string>(SEED_PETS[0].imageUrl);
  const [submitting, setSubmitting] = useState(false);

  const handleDistrictChange = (nextDistrict: string) => {
    setDistrict(nextDistrict);
    const found = MANILA_DISTRICTS.find((d) => d.name === nextDistrict);
    if (found) {
      setPinCoords({ lat: found.lat, lng: found.lng });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !breed.trim() || !ageLabel.trim() || !reason.trim()) return;
    setSubmitting(true);
    const created = await createPetListing({
      name: name.trim(),
      species,
      breed: `${breed.trim()} / ${species}`,
      ageLabel: ageLabel.trim(),
      status: vaccinated === 'Yes' ? 'HEALTHY' : 'NEEDS CARE',
      adoptionStage: 'Available',
      listingType: 'rehome',
      district,
      barangay: barangay.trim() || `${district}, Manila`,
      lat: pinCoords.lat,
      lng: pinCoords.lng,
      vaccinated: vaccinated === 'Yes',
      medicalNotes: `Rehoming reason: ${reason.trim()}. ${
        vaccinated === 'Yes' ? 'Vaccination records available.' : 'Needs booster vaccination.'
      }`,
      rehomingReason: reason.trim(),
      reporterName: user.fullName,
      reporterPhone: user.mobile,
      imageUrl: photoPreview,
    });
    setSubmitting(false);
    onCreated(created);
  };

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 lg:pb-14">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A635C] hover:text-[#2D5A3C] mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Dashboard / Rehome My Pet</span>
      </button>

      <div className="mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97736]">
          Civic Action Step 1
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
          Submit Pet for Rehoming
        </h1>
        <p className="text-sm text-[#5A635C] mt-1">
          Please fill out this form honestly. Your listing will appear on the Adoption Feed and
          Manila Map immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pet Profile & Medical */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-[#2D5A3C]">Pet Basic Profile</h2>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Pet Name <span className="text-[#D9383A]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bantay"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Pet Type <span className="text-[#D9383A]">*</span>
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as PetSpecies)}
                className="w-full h-11 px-3 rounded-xl border border-[#E2E4DE] bg-white text-sm focus:outline-none focus:border-[#2D5A3C]"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Age <span className="text-[#D9383A]">*</span>
              </label>
              <input
                type="text"
                required
                value={ageLabel}
                onChange={(e) => setAgeLabel(e.target.value)}
                placeholder="e.g. 1 Year, 2 Months"
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Breed <span className="text-[#D9383A]">*</span>
            </label>
            <input
              type="text"
              required
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Philippine Aspin or Puspin"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
            />
          </div>

          <h2 className="font-display text-base font-bold text-[#2D5A3C] pt-2">
            Vaccination &amp; Medical History
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Has Vaccination Records? <span className="text-[#D9383A]">*</span>
            </label>
            <select
              value={vaccinated}
              onChange={(e) => setVaccinated(e.target.value as 'Yes' | 'No')}
              className="w-full h-11 px-3 rounded-xl border border-[#E2E4DE] bg-white text-sm focus:outline-none focus:border-[#2D5A3C]"
            >
              <option value="Yes">Yes — Vaccinated &amp; Dewormed</option>
              <option value="No">No — Needs Vaccination</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Reason for Rehoming <span className="text-[#D9383A]">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide clear explanation for rehoming (moving residence, allergy, financial hardship)"
              className="w-full p-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C] resize-none"
            />
          </div>
        </div>

        {/* Right Column: Photo Upload & Location Pin */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-[#E2E4DE] hover:border-[#2D5A3C] cursor-pointer transition-colors text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <Upload className="w-7 h-7 text-[#2D5A3C] mb-2" />
              <span className="text-sm font-semibold text-[#1A1A1A]">Upload Pet Photo</span>
              <span className="text-xs text-[#5A635C] mt-0.5">PNG, JPG up to 10MB</span>
            </label>
            {photoPreview && (
              <div className="mt-3 rounded-xl overflow-hidden h-36 bg-[#F7F8F4]">
                <img
                  src={photoPreview}
                  alt="Pet preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-display text-sm font-bold text-[#1A1A1A]">
              Set Pet&apos;s Current Location
            </h3>
            <div className="w-full h-44 rounded-xl overflow-hidden border border-[#E2E4DE]">
              <GoogleMap
                mapId="DEMO_MAP_ID"
                center={pinCoords}
                defaultZoom={13}
                gestureHandling="greedy"
                disableDefaultUI
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                onClick={(ev) => {
                  if (ev.detail.latLng) {
                    setPinCoords({ lat: ev.detail.latLng.lat, lng: ev.detail.latLng.lng });
                  }
                }}
                style={{ width: '100%', height: '100%' }}
              >
                <AdvancedMarker position={pinCoords}>
                  <Pin background="#2D5A3C" borderColor="#144226" glyphColor="#FFFFFF" />
                </AdvancedMarker>
              </GoogleMap>
            </div>
            <p className="text-[11px] text-[#5A635C] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#2D5A3C]" />
              <span>Tap anywhere on the Manila map to adjust the pin.</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full h-10 px-2.5 rounded-xl border border-[#E2E4DE] bg-white text-xs focus:outline-none focus:border-[#2D5A3C]"
                >
                  {MANILA_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Barangay &amp; Street
                </label>
                <input
                  type="text"
                  required
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  placeholder="e.g. G. Tuazon St, Brgy 402"
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E4DE] text-xs focus:outline-none focus:border-[#2D5A3C]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Submit Bar */}
        <div className="lg:col-span-12 bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#5A635C]">
            Double check all fields before submitting. Listing publishes immediately to the Manila
            Adoption Map.
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-7 h-11 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm transition-colors"
          >
            {submitting ? 'Publishing...' : 'Submit Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
