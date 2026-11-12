import { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { CheckCircle2 } from 'lucide-react';
import { AdoptionMapView } from './components/AdoptionMapView';
import { AuthModals } from './components/AuthModals';
import { ChatView } from './components/ChatView';
import { FoodShopsView } from './components/FoodShopsView';
import { HealthCentersView } from './components/HealthCentersView';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { RehomeForm } from './components/RehomeForm';
import { RoleHub } from './components/RoleHub';
import { ShelterPortal } from './components/ShelterPortal';
import { StrayReportForm } from './components/StrayReportForm';
import { SEED_MESSAGES, SEED_PETS } from './data/seedData';
import {
  fetchMessages,
  fetchPets,
  getSavedUser,
  isSupabaseConfigured,
  saveUserSession,
  supabase,
  updatePetStatusAndStage,
} from './lib/supabaseClient';
import {
  AdoptionStage,
  AppView,
  CartItem,
  ChatMessage,
  Pet,
  PetHealthStatus,
  SupplyProduct,
  UserProfile,
} from './types/pawpath';

const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => getSavedUser());
  const [activeView, setActiveView] = useState<AppView>(() =>
    getSavedUser() ? 'role-hub' : 'landing'
  );
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [pendingPetForChat, setPendingPetForChat] = useState<Pet | null>(null);

  const [pets, setPets] = useState<Pet[]>(SEED_PETS);
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [selectedPetId, setSelectedPetId] = useState<string>(SEED_PETS[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  useEffect(() => {
    fetchPets().then(setPets);
    fetchMessages().then(setMessages);
  }, []);

  // Optional Supabase Realtime subscription when keys are configured
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;
    const channel = supabase
      .channel('pawpath-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const incoming: ChatMessage = {
            id: String(row.id),
            petId: String(row.pet_id),
            senderName: String(row.sender_name),
            senderRole: row.sender_role as ChatMessage['senderRole'],
            body: String(row.body),
            createdAt: String(row.created_at),
          };
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((current) => (current === msg ? null : current));
    }, 3500);
  };

  const handleNavigate = (view: AppView, sectionId?: string) => {
    setActiveView(view);
    if (view === 'landing' && sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    saveUserSession(loggedInUser);
    setAuthModalMode(null);
    showToast(`Welcome back, ${loggedInUser.fullName}!`);

    if (pendingPetForChat) {
      setSelectedPetId(pendingPetForChat.id);
      setPendingPetForChat(null);
      setActiveView('adoption-map');
    } else {
      setActiveView('role-hub');
    }
  };

  const handleLogout = async () => {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    saveUserSession(null);
    setActiveView('landing');
    showToast('You have been logged out.');
  };

  const handleAdoptClick = (pet: Pet) => {
    if (!user) {
      setPendingPetForChat(pet);
      setAuthModalMode('signup');
      showToast('Please sign up or log in to adopt or chat with the shelter.');
      return;
    }
    setSelectedPetId(pet.id);
    setActiveView('adoption-map');
  };

  const handleOpenChat = (pet: Pet) => {
    if (!user) {
      setPendingPetForChat(pet);
      setAuthModalMode('login');
      return;
    }
    setSelectedPetId(pet.id);
    setActiveView('chat');
  };

  const handleUpdatePet = async (
    petId: string,
    updates: { status?: PetHealthStatus; adoptionStage?: AdoptionStage }
  ) => {
    const updated = await updatePetStatusAndStage(petId, updates);
    setPets(updated);
  };

  const handleAddToCart = (product: SupplyProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to your supply cart.`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      language="en"
      region="PH"
      libraries={['marker']}
    >
      <div className="min-h-screen flex flex-col bg-[#F7F8F4] text-[#1A1A1A]">
        {mapsQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        <Navbar
          user={user}
          activeView={activeView}
          onNavigate={handleNavigate}
          onOpenLogin={() => setAuthModalMode('login')}
          onOpenSignup={() => setAuthModalMode('signup')}
          onLogout={handleLogout}
          cartCount={totalCartCount}
        />

        <main className="flex-1">
          {activeView === 'landing' && (
            <LandingPage
              pets={pets}
              user={user}
              onAdoptClick={handleAdoptClick}
              onExploreMap={() =>
                user ? handleNavigate('adoption-map') : setAuthModalMode('login')
              }
              onReportStray={() =>
                user ? handleNavigate('stray-form') : setAuthModalMode('login')
              }
              onToast={showToast}
            />
          )}

          {activeView === 'role-hub' && user && (
            <RoleHub user={user} pets={pets} onNavigate={(v) => handleNavigate(v)} />
          )}

          {activeView === 'adoption-map' && (
            <AdoptionMapView
              pets={pets}
              selectedPetId={selectedPetId}
              onSelectPet={setSelectedPetId}
              onOpenChat={handleOpenChat}
            />
          )}

          {activeView === 'chat' && user && (
            <ChatView
              user={user}
              pets={pets}
              messages={messages}
              activePetId={selectedPetId}
              onSelectPet={setSelectedPetId}
              onNewMessage={(msg) => setMessages((prev) => [...prev, msg])}
              onUpdatePetStage={handleUpdatePet}
              onToast={showToast}
            />
          )}

          {activeView === 'health-centers' && <HealthCentersView onToast={showToast} />}

          {activeView === 'food-shops' && (
            <FoodShopsView
              user={user}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={() => setCart([])}
              onToast={showToast}
            />
          )}

          {activeView === 'rehome-form' && user && (
            <RehomeForm
              user={user}
              onBack={() => handleNavigate('role-hub')}
              onCreated={(created) => {
                setPets((prev) => [created, ...prev]);
                setSelectedPetId(created.id);
                setActiveView('adoption-map');
                showToast(`${created.name} is now listed on the Manila Adoption Map!`);
              }}
            />
          )}

          {activeView === 'stray-form' && (
            <StrayReportForm
              user={user}
              onBack={() => handleNavigate(user ? 'role-hub' : 'landing')}
              onCreated={(created) => {
                setPets((prev) => [created, ...prev]);
                setSelectedPetId(created.id);
                setActiveView('adoption-map');
                showToast('Urgent stray report dispatched to the Manila Map!');
              }}
            />
          )}

          {activeView === 'shelter-portal' && (
            <ShelterPortal
              pets={pets}
              onBack={() => handleNavigate('role-hub')}
              onUpdatePet={async (id, updates) => {
                await handleUpdatePet(id, updates);
                showToast('Rescue status updated.');
              }}
              onOpenChat={handleOpenChat}
            />
          )}
        </main>

        <AuthModals
          mode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSwitchMode={(m) => setAuthModalMode(m)}
          onAuthSuccess={handleAuthSuccess}
        />

        {toast && (
          <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-[#144226] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium max-w-sm">
            <CheckCircle2 className="w-4 h-4 text-[#A1D2AC] shrink-0" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </APIProvider>
  );
}
