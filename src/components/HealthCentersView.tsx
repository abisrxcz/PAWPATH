import React, { useState } from 'react';
import { AdvancedMarker, Map as GoogleMap } from '@vis.gl/react-google-maps';
import { AlertCircle, CalendarCheck, MapPin, Phone, X } from 'lucide-react';
import { HEALTH_CENTERS } from '../data/seedData';
import { saveAppointmentBooking } from '../lib/supabaseClient';
import { HealthCenter } from '../types/pawpath';

interface HealthCentersViewProps {
  onToast: (msg: string) => void;
}

export const HealthCentersView: React.FC<HealthCentersViewProps> = ({ onToast }) => {
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter>(HEALTH_CENTERS[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [bookingCenter, setBookingCenter] = useState<HealthCenter | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [petName, setPetName] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [consultType, setConsultType] = useState<
    'In-Person Clinic Visit' | 'Preventative Tele-Guidance'
  >('In-Person Clinic Visit');

  const filtered = HEALTH_CENTERS.filter(
    (hc) => categoryFilter === 'All' || hc.category === categoryFilter
  );

  const openBooking = (center: HealthCenter) => {
    setBookingCenter(center);
    setSelectedService(center.services[0]?.name || 'General Consultation');
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCenter || !petName.trim() || !preferredDate) return;
    saveAppointmentBooking({
      centerId: bookingCenter.id,
      centerName: bookingCenter.name,
      serviceName: selectedService,
      petName: petName.trim(),
      preferredDate,
      consultationType: consultType,
    });
    setBookingCenter(null);
    setPetName('');
    setPreferredDate('');
    onToast(`Appointment booked at ${bookingCenter.name} for ${petName}.`);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-64px)] pb-20 lg:pb-0">
      {/* Left Directory List */}
      <div className="w-full lg:w-[440px] shrink-0 bg-white border-r border-black/[0.06] overflow-y-auto lg:h-[calc(100vh-64px)]">
        <div className="p-5 border-b border-black/[0.06] space-y-3">
          <h1 className="font-display text-2xl font-bold text-[#1A1A1A]">
            Manila Veterinary &amp; Health Directory
          </h1>
          <p className="text-xs text-[#5A635C]">
            Public free vaccination hubs, city veterinary offices, and partner clinics with
            transparent service pricing.
          </p>

          {/* Emergency Physical Visit Notice */}
          <div className="p-3 rounded-xl bg-[#FCE8E6] text-[#A50E0E] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Emergency Notice:</strong> Tele-guidance is for preventative care only. For
              bleeding, poisoning, or breathing distress, visit a 24-hour physical clinic
              immediately.
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {['All', 'Government Office', 'Public Hospital', 'Private Partner', 'Volunteer Rescue Clinic'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[#2D5A3C] text-white'
                      : 'bg-[#F7F8F4] text-[#414942] hover:bg-[#EAE7E7]'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className="divide-y divide-black/[0.06]">
          {filtered.map((center) => {
            const isSelected = selectedCenter.id === center.id;
            return (
              <div
                key={center.id}
                onClick={() => setSelectedCenter(center)}
                className={`p-5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#F7F8F4]' : 'hover:bg-[#FCF9F8]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-base font-bold text-[#1A1A1A]">{center.name}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#EAF0F9] text-[#2A4365] text-[10px] font-bold shrink-0">
                    {center.category}
                  </span>
                </div>
                <p className="text-xs text-[#5A635C] mt-1">{center.address}</p>
                <div className="flex items-center gap-3 text-xs text-[#414942] mt-1.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#2D5A3C]" />
                    {center.phone}
                  </span>
                  <span className="text-[#D97736] font-medium">{center.hours}</span>
                </div>

                {/* Transparent Service Pricing */}
                <div className="mt-3 bg-white rounded-xl border border-[#E2E4DE] p-2.5 space-y-1.5">
                  {center.services.map((svc) => (
                    <div key={svc.name} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-[#1A1A1A] truncate">{svc.name}</span>
                      <span className="font-bold text-[#2D5A3C] tabular-nums shrink-0">
                        {svc.pricePhp === 0 ? 'FREE' : `₱${svc.pricePhp.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openBooking(center);
                    }}
                    className="h-9 px-4 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCenter(center)}
                    className="text-xs font-semibold text-[#2D5A3C] hover:underline"
                  >
                    Pin on Map
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Google Map */}
      <div className="flex-1 min-h-[420px] lg:h-[calc(100vh-64px)]">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          center={{ lat: selectedCenter.lat, lng: selectedCenter.lng }}
          defaultZoom={13}
          gestureHandling="greedy"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%', minHeight: '420px' }}
        >
          {filtered.map((center) => (
            <AdvancedMarker
              key={center.id}
              position={{ lat: center.lat, lng: center.lng }}
              onClick={() => setSelectedCenter(center)}
              title={center.name}
            >
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border-2 cursor-pointer ${
                  selectedCenter.id === center.id
                    ? 'bg-[#1D4ED8] text-white border-white scale-110'
                    : 'bg-white text-[#1E3A8A] border-[#1D4ED8]/40'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{center.name.split('—')[0].trim()}</span>
              </div>
            </AdvancedMarker>
          ))}
        </GoogleMap>
      </div>

      {/* Appointment Booking Modal */}
      {bookingCenter && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <button
              type="button"
              onClick={() => setBookingCenter(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F7F8F4] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display text-xl font-bold text-[#1A1A1A]">
              Book Care Appointment
            </h3>
            <p className="text-xs text-[#5A635C] mt-1">{bookingCenter.name}</p>

            <form onSubmit={handleBookSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Consultation Mode
                </label>
                <select
                  value={consultType}
                  onChange={(e) => setConsultType(e.target.value as typeof consultType)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E4DE] bg-white text-xs"
                >
                  <option value="In-Person Clinic Visit">In-Person Clinic Visit</option>
                  <option value="Preventative Tele-Guidance">Preventative Tele-Guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E4DE] bg-white text-xs"
                >
                  {bookingCenter.services.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.pricePhp === 0 ? 'FREE' : `₱${s.pricePhp}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Pet Name <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Bantay"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Preferred Date <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
