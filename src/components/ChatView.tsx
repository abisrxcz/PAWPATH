import React, { useState } from 'react';
import {
  CheckCircle2,
  Menu,
  Scale,
  Search,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { saveRA10631Agreement, sendChatMessage } from '../lib/supabaseClient';
import {
  AdoptionStage,
  ChatMessage,
  Pet,
  PetHealthStatus,
  UserProfile,
} from '../types/pawpath';

interface ChatViewProps {
  user: UserProfile;
  pets: Pet[];
  messages: ChatMessage[];
  activePetId: string;
  onSelectPet: (petId: string) => void;
  onNewMessage: (msg: ChatMessage) => void;
  onUpdatePetStage: (
    petId: string,
    updates: { status?: PetHealthStatus; adoptionStage?: AdoptionStage }
  ) => void;
  onToast: (msg: string) => void;
}

const STAGES: AdoptionStage[] = ['Available', 'Want to Adopt', 'Ongoing Adoption', 'Pet Adopted'];

export const ChatView: React.FC<ChatViewProps> = ({
  user,
  pets,
  messages,
  activePetId,
  onSelectPet,
  onNewMessage,
  onUpdatePetStage,
  onToast,
}) => {
  const [inputText, setInputText] = useState('');
  const [threadSearch, setThreadSearch] = useState('');
  const [mobileThreadsOpen, setMobileThreadsOpen] = useState(false);

  // RA 10631 Digital Agreement Modal state
  const [showRA10631Modal, setShowRA10631Modal] = useState(false);
  const [govIdType, setGovIdType] = useState('Philippine National ID (PhilSys)');
  const [govIdRef, setGovIdRef] = useState('');
  const [homeEnv, setHomeEnv] = useState('House / Apartment with secure indoor space');
  const [antiCrueltyAgreed, setAntiCrueltyAgreed] = useState(false);
  const [nonRelinquishAgreed, setNonRelinquishAgreed] = useState(false);
  const [signature, setSignature] = useState(user.fullName);

  const activePet = pets.find((p) => p.id === activePetId) || pets[0];
  const petMessages = messages.filter((m) => m.petId === activePet?.id);

  const filteredThreads = pets.filter((p) =>
    `${p.name} ${p.district} ${p.reporterName}`
      .toLowerCase()
      .includes(threadSearch.toLowerCase())
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePet) return;
    const text = inputText.trim();
    setInputText('');

    const sent = await sendChatMessage({
      petId: activePet.id,
      senderName: user.fullName,
      senderRole: 'adopter',
      body: text,
    });
    onNewMessage(sent);

    // Warm shelter coordinator acknowledgement in hybrid mode
    setTimeout(async () => {
      const reply = await sendChatMessage({
        petId: activePet.id,
        senderName: activePet.reporterName,
        senderRole: 'coordinator',
        body: `Noted, ${user.fullName.split(' ')[0]}! We received your message about ${
          activePet.name
        }. Please bring 1 valid government ID for your Manila meetup.`,
      });
      onNewMessage(reply);
    }, 900);
  };

  const handleStageClick = async (stage: AdoptionStage) => {
    if (!activePet) return;

    if (stage === 'Want to Adopt') {
      onUpdatePetStage(activePet.id, { adoptionStage: 'Want to Adopt' });
      const sysMsg = await sendChatMessage({
        petId: activePet.id,
        senderName: user.fullName,
        senderRole: 'system',
        body: `${user.fullName} clicked "I Want to Adopt This Pet". Next step: Complete the RA 10631 Digital Evaluation to move to Ongoing Adoption.`,
      });
      onNewMessage(sysMsg);
      onToast(`Adoption interest registered for ${activePet.name}.`);
      return;
    }

    if (stage === 'Ongoing Adoption') {
      setShowRA10631Modal(true);
      return;
    }

    if (stage === 'Pet Adopted') {
      if (activePet.adoptionStage !== 'Ongoing Adoption') {
        setShowRA10631Modal(true);
        onToast('Please complete the RA 10631 Digital Agreement first.');
        return;
      }
      onUpdatePetStage(activePet.id, {
        adoptionStage: 'Pet Adopted',
        status: 'PET ADOPTED',
      });
      const sysMsg = await sendChatMessage({
        petId: activePet.id,
        senderName: 'PawPath Manila Registry',
        senderRole: 'system',
        body: `Congratulations! ${activePet.name} has been officially marked as Pet Adopted and removed from the active public adoption map.`,
      });
      onNewMessage(sysMsg);
      onToast(`${activePet.name} marked as Pet Adopted and removed from the public map.`);
    }
  };

  const handleSignRA10631 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePet || !govIdRef.trim() || !signature.trim() || !antiCrueltyAgreed || !nonRelinquishAgreed) {
      return;
    }
    await saveRA10631Agreement({
      petId: activePet.id,
      adopterFullName: user.fullName,
      governmentIdType: govIdType,
      governmentIdRef: govIdRef.trim(),
      homeEnvironment: homeEnv,
      digitalSignature: signature.trim(),
    });
    onUpdatePetStage(activePet.id, { adoptionStage: 'Ongoing Adoption' });
    const sysMsg = await sendChatMessage({
      petId: activePet.id,
      senderName: 'RA 10631 Compliance',
      senderRole: 'system',
      body: `RA 10631 Animal Welfare Act Agreement digitally signed by ${signature.trim()} (${govIdType}). Status updated to Ongoing Adoption.`,
    });
    onNewMessage(sysMsg);
    setShowRA10631Modal(false);
    onToast('RA 10631 Agreement signed! Adoption is now Ongoing.');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[580px]">
        {/* Left Thread List (Desktop) */}
        <aside className="hidden lg:flex lg:col-span-4 bg-white rounded-2xl shadow-sm p-4 flex-col overflow-hidden">
          <h2 className="font-display text-lg font-bold text-[#1A1A1A] mb-3">Messages</h2>
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-[#5A635C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              placeholder="Search adoptions or shelters..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F7F8F4] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A3C]/20"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredThreads.map((pet) => {
              const isSelected = pet.id === activePet?.id;
              return (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => onSelectPet(pet.id)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-[#E6F4EA] border border-[#2D5A3C]/30'
                      : 'bg-[#F7F8F4] hover:bg-[#EAE7E7]'
                  }`}
                >
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#1A1A1A] truncate">
                        {pet.name} ({pet.district})
                      </span>
                      <span className="text-[10px] font-semibold text-[#2D5A3C] shrink-0">
                        {pet.adoptionStage}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A635C] truncate mt-0.5">{pet.reporterName}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Active Chat & 4-Stage Lifecycle */}
        {activePet && (
          <section className="lg:col-span-8 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
            {/* Chat Header + 4-Stage Bar */}
            <div className="p-4 border-b border-black/[0.06] flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activePet.imageUrl}
                    alt={activePet.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-bold text-[#1A1A1A] truncate">
                      {activePet.name} ({activePet.breed})
                    </h2>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] text-[10px] font-bold uppercase mt-0.5">
                      {activePet.adoptionStage}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileThreadsOpen(true)}
                  className="lg:hidden h-9 px-3 rounded-xl bg-[#F7F8F4] text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5"
                >
                  <Menu className="w-4 h-4" />
                  <span>Threads</span>
                </button>
              </div>

              {/* Interactive 4-Stage Adoption Lifecycle Bar */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {STAGES.map((stage, idx) => {
                  const currentIdx = STAGES.indexOf(activePet.adoptionStage);
                  const isCurrent = activePet.adoptionStage === stage;
                  const isCompleted = idx < currentIdx;
                  const label = stage === 'Want to Adopt' ? 'I Want to Adopt This Pet' : stage;

                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => handleStageClick(stage)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                        isCurrent
                          ? stage === 'Ongoing Adoption'
                            ? 'bg-[#D97736] text-white'
                            : 'bg-[#2D5A3C] text-white'
                          : isCompleted
                          ? 'bg-[#E6F4EA] text-[#137333]'
                          : 'bg-[#F7F8F4] text-[#414942] hover:bg-[#EAE7E7]'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FCF9F8]">
              <div className="bg-[#F0EDED] rounded-xl p-3 text-xs text-[#414942] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5A3C] shrink-0 mt-0.5" />
                <span>
                  Direct coordination with <strong>{activePet.reporterName}</strong>. Meetups are
                  conducted safely at designated Manila City Veterinary offices or partner
                  shelters.
                </span>
              </div>

              {petMessages.map((msg) => {
                if (msg.senderRole === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="px-3.5 py-2 rounded-xl bg-[#EAF0F9] text-[#2A4365] text-xs font-medium text-center max-w-md">
                        {msg.body}
                      </div>
                    </div>
                  );
                }

                const isOutbound = msg.senderRole === 'adopter';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[11px] text-[#5A635C] mb-1 px-1">
                      {isOutbound ? 'You' : msg.senderName}
                    </span>
                    <div
                      className={`max-w-[82%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isOutbound
                          ? 'bg-[#2D5A3C] text-white rounded-tr-sm'
                          : 'bg-white text-[#1A1A1A] rounded-tl-sm'
                      }`}
                    >
                      {msg.body}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Chips + Input Bar */}
            <div className="p-3 sm:p-4 border-t border-black/[0.06] bg-white space-y-2.5">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  'Yes, 2:00 PM works!',
                  'What documents should I bring?',
                  'I Want to Adopt This Pet',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setInputText(chip)}
                    className="px-3 py-1 rounded-full bg-[#F7F8F4] hover:bg-[#E6F4EA] text-xs font-medium text-[#414942] shrink-0 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message here to arrange adoption details..."
                  className="flex-1 h-11 px-4 rounded-full bg-[#F7F8F4] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A3C]/20"
                />
                <button
                  type="submit"
                  className="h-11 px-5 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white text-sm font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </section>
        )}
      </div>

      {/* Mobile Threads Drawer */}
      {mobileThreadsOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="w-80 max-w-[85vw] bg-white h-full p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <h3 className="font-display text-base font-bold text-[#1A1A1A]">Adoption Threads</h3>
              <button
                type="button"
                onClick={() => setMobileThreadsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F7F8F4] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2 overflow-y-auto flex-1">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => {
                    onSelectPet(pet.id);
                    setMobileThreadsOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 text-left ${
                    pet.id === activePet?.id ? 'bg-[#E6F4EA]' : 'bg-[#F7F8F4]'
                  }`}
                >
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#1A1A1A] truncate">{pet.name}</div>
                    <div className="text-xs text-[#5A635C] truncate">{pet.adoptionStage}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory RA 10631 Digital Evaluation & Legal Agreement Modal */}
      {showRA10631Modal && activePet && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 my-auto max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowRA10631Modal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F7F8F4] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-[#2D5A3C] mb-2">
              <Scale className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Republic Act No. 10631 Compliance
              </span>
            </div>

            <h3 className="font-display text-xl font-bold text-[#1A1A1A]">
              Digital Evaluation &amp; Animal Welfare Act Agreement
            </h3>
            <p className="text-xs text-[#5A635C] mt-1">
              Required before transitioning <strong>{activePet.name}</strong> to Ongoing Adoption.
            </p>

            <form onSubmit={handleSignRA10631} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Valid Government ID Type <span className="text-[#D9383A]">*</span>
                </label>
                <select
                  value={govIdType}
                  onChange={(e) => setGovIdType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E4DE] bg-white text-xs"
                >
                  <option>Philippine National ID (PhilSys)</option>
                  <option>Driver&apos;s License (LTO)</option>
                  <option>Philippine Passport</option>
                  <option>UMID / SSS ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Government ID Reference Number <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={govIdRef}
                  onChange={(e) => setGovIdRef(e.target.value)}
                  placeholder="e.g. PSN-1234-5678-9012"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Home Environment Check <span className="text-[#D9383A]">*</span>
                </label>
                <select
                  value={homeEnv}
                  onChange={(e) => setHomeEnv(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E2E4DE] bg-white text-xs"
                >
                  <option>House / Apartment with secure indoor space</option>
                  <option>Fenced residential yard in Metro Manila</option>
                  <option>Pet-friendly condominium (with HOA clearance)</option>
                </select>
              </div>

              <div className="space-y-2.5 bg-[#F7F8F4] p-3.5 rounded-xl text-xs text-[#1A1A1A]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={antiCrueltyAgreed}
                    onChange={(e) => setAntiCrueltyAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#2D5A3C]"
                  />
                  <span>
                    I pledge to provide adequate food, clean water, shelter, and veterinary care in
                    strict compliance with <strong>RA 10631 (Animal Welfare Act of the Philippines)</strong>{' '}
                    anti-cruelty provisions.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={nonRelinquishAgreed}
                    onChange={(e) => setNonRelinquishAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#2D5A3C]"
                  />
                  <span>
                    <strong>Non-Relinquishment Rule:</strong> I will never abandon or sell this
                    animal. If unforeseen circumstances arise, I will return the pet directly to the
                    issuing Manila shelter.
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Digital Signature (Type Full Legal Name) <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm"
              >
                Sign RA 10631 Agreement &amp; Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
