import React, { useState } from 'react';
import { AdvancedMarker, Map as GoogleMap, Pin } from '@vis.gl/react-google-maps';
import { AlertTriangle, ArrowLeft, Camera, MapPin } from 'lucide-react';
import { MANILA_DISTRICTS, SEED_PETS } from '../data/seedData';
import { createPetListing } from '../lib/supabaseClient';
import { Pet, PetSpecies, UserProfile } from '../types/pawpath';

interface StrayReportFormProps {
  user: UserProfile | null;
  onBack: () => void;
  onCreated: (pet: Pet) => void;
}

const URGENCY_OPTIONS = [
  'Injured / Bleeding / Open Wounds',
  'Severely Malnourished or Starving',
  'Immediate Rescue / Active Danger Needed',
  'Vomiting / Nausea / Lethargic',
  'Extremely Rabid or Aggressive Behavior',
];

export const StrayReportForm: React.FC<StrayReportFormProps> = ({ user, onBack, onCreated }) => {
  const [species, setSpecies] = useState<PetSpecies>('Dog');
  const [description, setDescription] = useState('');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([
    'Immediate Rescue / Active Danger Needed',
  ]);
  const [district, setDistrict] = useState(user?.district || 'Tondo');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState(user?.mobile || '+63 917 555 4921');
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>({
    lat: 14.6188,
    lng: 120.9675,
  });
  const [photoPreview, setPhotoPreview] = useState<string>(SEED_PETS[2].imageUrl);
  const [submitting, setSubmitting] = useState(false);

  const toggleFlag = (flag: string) => {
    setSelectedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleDistrictChange = (nextDistrict: string) => {
    setDistrict(nextDistrict);
    const found = MANILA_DISTRICTS.find((d) => d.name === nextDistrict);
    if (found) setPinCoords({ lat: found.lat, lng: found.lng });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !landmark.trim()) return;
    setSubmitting(true);
    const created = await createPetListing({
      name: `Stray ${species} (${district})`,
      species,
      breed: `Stray ${species} / Urgent Dispatch`,
      ageLabel: 'Unknown Age',
      status: 'URGENT RESCUE',
      adoptionStage: 'Available',
      listingType: 'stray',
      district,
      barangay: `${landmark.trim()}, ${district}, Manila`,
      lat: pinCoords.lat,
      lng: pinCoords.lng,
      vaccinated: false,
      medicalNotes: description.trim(),
      urgencyFlags: selectedFlags,
      reporterName: user?.fullName || 'Concerned Manila Citizen',
      reporterPhone: phone.trim(),
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
        <span>Dashboard / Report a Stray</span>
      </button>

      <div className="mb-6">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FCE8E6] text-[#A50E0E] text-[11px] font-bold uppercase tracking-wider">
          Urgent Public Response
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-2">
          File Stray Animal Emergency Report
        </h1>
        <p className="text-sm text-[#5A635C] mt-1">
          Citizen-led alerts place an urgent rescue pin on the Manila Map for immediate barangay
          and shelter triage.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="font-display text-base font-bold text-[#D97736]">Stray Description</h2>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-2">
              Animal Type <span className="text-[#D9383A]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Dog', 'Cat', 'Other'] as PetSpecies[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSpecies(type)}
                  className={`h-11 rounded-xl text-sm font-semibold transition-colors ${
                    species === type
                      ? 'bg-[#2D5A3C] text-white'
                      : 'bg-[#F7F8F4] text-[#1A1A1A] hover:bg-[#EAE7E7]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Physical Description &amp; Health Details <span className="text-[#D9383A]">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Scrawny brown dog, visible leg injury, wearing an orange collar."
              className="w-full p-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C] resize-none"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#1A1A1A] mb-2">
              Observable Medical / Urgency Indicators (Check all that apply)
            </span>
            <div className="space-y-2 bg-[#F7F8F4] p-3.5 rounded-xl">
              {URGENCY_OPTIONS.map((flag) => (
                <label key={flag} className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={selectedFlags.includes(flag)}
                    onChange={() => toggleFlag(flag)}
                    className="w-4 h-4 accent-[#D97736] rounded"
                  />
                  <span className="text-xs sm:text-sm text-[#1A1A1A] font-medium">{flag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-[#E2E4DE] hover:border-[#D97736] cursor-pointer transition-colors text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <Camera className="w-7 h-7 text-[#D97736] mb-2" />
              <span className="text-sm font-semibold text-[#1A1A1A]">
                Take or Upload Stray Photo
              </span>
              <span className="text-xs text-[#5A635C] mt-0.5">
                Helps responders assess triage urgency
              </span>
            </label>
            {photoPreview && (
              <div className="mt-3 rounded-xl overflow-hidden h-36 bg-[#F7F8F4]">
                <img
                  src={photoPreview}
                  alt="Stray preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-display text-sm font-bold text-[#1A1A1A]">
              Select Exact Stranding Location
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
                  <Pin background="#D9383A" borderColor="#A50E0E" glyphColor="#FFFFFF" />
                </AdvancedMarker>
              </GoogleMap>
            </div>
            <p className="text-[11px] text-[#5A635C] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D9383A]" />
              <span>Tap on the map to pin exact Manila street coordinates.</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Manila District
              </label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E4DE] bg-white text-xs focus:outline-none focus:border-[#2D5A3C]"
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
                Landmarks / Reference Points <span className="text-[#D9383A]">*</span>
              </label>
              <input
                type="text"
                required
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near UST Overpass or Pritil Market"
                className="w-full h-10 px-3 rounded-xl border border-[#E2E4DE] text-xs focus:outline-none focus:border-[#2D5A3C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Reporter Phone Number <span className="text-[#D9383A]">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E4DE] text-xs focus:outline-none focus:border-[#2D5A3C]"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#5A635C]">
            <AlertTriangle className="w-4 h-4 text-[#D97736] shrink-0" />
            <span>
              False reports or prank dispatches will lead to account suspension under the Manila
              Veterinary Office code.
            </span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-7 h-11 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm transition-colors shrink-0"
          >
            {submitting ? 'Dispatching...' : 'Submit Emergency Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
