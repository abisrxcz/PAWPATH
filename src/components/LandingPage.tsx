import React, { useState } from 'react';
import { MapPin, Send } from 'lucide-react';
import { ABOUT_VOLUNTEERS_URL, HERO_IMAGE_URL } from '../data/seedData';
import { submitContactInquiry } from '../lib/supabaseClient';
import { Pet, UserProfile } from '../types/pawpath';

interface LandingPageProps {
  pets: Pet[];
  user: UserProfile | null;
  onAdoptClick: (pet: Pet) => void;
  onExploreMap: () => void;
  onReportStray: () => void;
  onToast: (message: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  pets,
  onAdoptClick,
  onExploreMap,
  onReportStray,
  onToast,
}) => {
  const [senderName, setSenderName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const activePets = pets.filter((p) => p.adoptionStage !== 'Pet Adopted').slice(0, 6);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    await submitContactInquiry({
      senderName: senderName.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    setSending(false);
    setSenderName('');
    setEmail('');
    setMessage('');
    onToast('Thank you! Your inquiry has been sent to the PawPath Manila team.');
  };

  const getStatusBadgeStyle = (status: Pet['status']) => {
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
    <div className="flex flex-col pb-20 lg:pb-0">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative w-full overflow-hidden bg-[#144226] text-white"
      >
        <img
          src={HERO_IMAGE_URL}
          alt="Metro Manila animal rescue volunteers and rescued Aspin dogs"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#144226]/95 via-[#144226]/80 to-[#144226]/55" />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block px-3 py-1 rounded-full bg-[#D97736]/20 text-[#FFDBC9] text-[11px] font-bold tracking-wider uppercase">
              Metro Manila Civic Animal Welfare
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-tight text-balance">
              PawPath; A Centralized Animal Adoption, Nutrition, and Healthcare System
            </h1>
            <p className="text-base text-white/90 max-w-xl leading-relaxed">
              Bridging animal shelters, local health units, and pet-loving citizens across the City
              of Manila. Find your next furry best friend or report strays in need of critical help.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExploreMap}
                className="h-12 px-6 rounded-full bg-[#2D5A3C] hover:bg-[#3B6849] text-white font-semibold text-sm transition-colors shadow-md"
              >
                Explore Adoptables
              </button>
              <button
                type="button"
                onClick={onReportStray}
                className="h-12 px-6 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors backdrop-blur-sm"
              >
                Report a Stray
              </button>
            </div>
          </div>

          {/* Manila Rescue Impact Card */}
          <div className="lg:col-span-5">
            <div className="bg-white text-[#1A1A1A] rounded-2xl p-6 sm:p-7 shadow-xl max-w-md lg:ml-auto">
              <h2 className="font-display text-base font-bold text-[#1A1A1A] mb-5">
                Manila Rescue Impact
              </h2>
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-[#D97736] tabular-nums">
                    1,240+
                  </span>
                  <span className="text-sm text-[#5A635C]">Animals Rehomed in Manila</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-[#D97736] tabular-nums">
                    45+
                  </span>
                  <span className="text-sm text-[#5A635C]">Connected Barangay Shelters</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-[#D97736] tabular-nums">
                    98%
                  </span>
                  <span className="text-sm text-[#5A635C]">Treatment Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adoption News Feed */}
      <section className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#D97736]">
            Ligtas at Kupkop Feed
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
            Our Rescues Looking for Loving Homes
          </h2>
          <p className="text-sm text-[#5A635C] mt-2">
            Meet the lovable animals in our Manila-wide network. These pets are vetted, cared for,
            and ready for safe adoption.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePets.map((pet) => (
            <article
              key={pet.id}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(45,90,60,0.06),0_1px_3px_0_rgba(26,26,26,0.04)] flex flex-col transition-transform hover:-translate-y-0.5"
            >
              <div className="aspect-[4/3] w-full bg-[#EAE7E7] overflow-hidden">
                <img
                  src={pet.imageUrl}
                  alt={`${pet.name} - ${pet.breed}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#1A1A1A]">{pet.name}</h3>
                      <p className="text-xs text-[#5A635C] mt-0.5">
                        {pet.breed} · {pet.ageLabel}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadgeStyle(
                        pet.status
                      )}`}
                    >
                      {pet.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#5A635C] mt-3">
                    <MapPin className="w-3.5 h-3.5 text-[#D97736] shrink-0" />
                    <span className="truncate">{pet.barangay}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAdoptClick(pet)}
                  className="w-full h-11 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm transition-colors"
                >
                  Adopt Me
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Goals & About Us */}
      <section id="goals" className="bg-white border-y border-black/[0.05] py-14">
        <div
          id="about"
          className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#D97736]">
                Our Purpose
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
                About PawPath Manila Civic-Tech
              </h2>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-[#2D5A3C]">Our Mission</h3>
              <p className="text-sm text-[#414942] leading-relaxed">
                To foster a compassionate Manila by providing a seamless, real-time civic portal
                connecting citizens with local veterinary clinics, pet nutrition hubs, and volunteer
                rescue networks.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-[#D97736]">Our Vision</h3>
              <p className="text-sm text-[#414942] leading-relaxed">
                A city where every stray is safely sheltered, every domestic pet receives top-tier
                nutrition and diagnostics, and no animal is left hungry on the streets.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-md aspect-[4/3] bg-[#EAE7E7]">
              <img
                src={ABOUT_VOLUNTEERS_URL}
                alt="Manila animal welfare volunteers caring for rescued dogs"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#D97736]">
              Get in Touch
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
              Partner with Manila Animal Welfare
            </h2>
            <p className="text-sm text-[#5A635C] mt-2">
              Have questions about adoption policies, organizational memberships, or volunteering?
              Drop us a line below.
            </p>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_-2px_rgba(26,26,26,0.06)] space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                  Your Name <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Juan dela Cruz"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                  Email Address <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                Message <span className="text-[#D9383A]">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we collaborate on local animal rescue efforts?"
                className="w-full p-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full h-12 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Sending...' : 'Submit Message'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D5A3C] text-white/90 py-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© 2026 PawPath Manila Civic-Tech Platform. All Rights Reserved.</span>
          <span className="text-white/75">
            Designed for the Welfare of Stray and Domestic Animals in the City of Manila.
          </span>
        </div>
      </footer>
    </div>
  );
};
