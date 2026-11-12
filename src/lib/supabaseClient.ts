import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AdoptionStage,
  AppointmentBooking,
  CartItem,
  ChatMessage,
  ContactMessage,
  Pet,
  PetHealthStatus,
  RA10631Agreement,
  UserProfile,
} from '../types/pawpath';
import { SEED_MESSAGES, SEED_PETS } from '../data/seedData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

const KEYS = {
  USER: 'pawpath_user_v1',
  PETS: 'pawpath_pets_v1',
  MESSAGES: 'pawpath_messages_v1',
  AGREEMENTS: 'pawpath_agreements_v1',
  CONTACTS: 'pawpath_contacts_v1',
  APPOINTMENTS: 'pawpath_appointments_v1',
  ORDERS: 'pawpath_orders_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors in private browsing
  }
}

export const DEMO_USER: UserProfile = {
  id: 'demo-cinna-moroll',
  fullName: 'Cinna Moroll',
  email: 'cinna.moroll@pawpath.ph',
  mobile: '+63 917 555 0188',
  age: 26,
  district: 'Sampaloc',
  barangay: 'Barangay 402',
  role: 'citizen',
};

export function getSavedUser(): UserProfile | null {
  return readStorage<UserProfile | null>(KEYS.USER, null);
}

export function saveUserSession(user: UserProfile | null): void {
  if (user) {
    writeStorage(KEYS.USER, user);
  } else {
    localStorage.removeItem(KEYS.USER);
  }
}

export async function fetchPets(): Promise<Pet[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          name: String(row.name),
          species: row.species as Pet['species'],
          breed: String(row.breed),
          ageLabel: String(row.age_label),
          status: row.status as PetHealthStatus,
          adoptionStage: row.adoption_stage as AdoptionStage,
          listingType: row.listing_type as Pet['listingType'],
          district: String(row.district),
          barangay: String(row.barangay),
          lat: Number(row.lat),
          lng: Number(row.lng),
          vaccinated: Boolean(row.vaccinated),
          medicalNotes: String(row.medical_notes ?? ''),
          urgencyFlags: Array.isArray(row.urgency_flags) ? (row.urgency_flags as string[]) : [],
          rehomingReason: row.rehoming_reason ? String(row.rehoming_reason) : undefined,
          reporterName: String(row.reporter_name),
          reporterPhone: row.reporter_phone ? String(row.reporter_phone) : undefined,
          imageUrl: String(row.image_url || SEED_PETS[0].imageUrl),
          createdAt: String(row.created_at),
        }));
      }
    } catch {
      // fall back to localStorage
    }
  }
  const local = readStorage<Pet[] | null>(KEYS.PETS, null);
  if (!local) {
    writeStorage(KEYS.PETS, SEED_PETS);
    return SEED_PETS;
  }
  return local;
}

export async function createPetListing(pet: Omit<Pet, 'id' | 'createdAt'>): Promise<Pet> {
  const newPet: Pet = {
    ...pet,
    id: `pet-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data } = await supabase
        .from('pets')
        .insert({
          name: newPet.name,
          species: newPet.species,
          breed: newPet.breed,
          age_label: newPet.ageLabel,
          status: newPet.status,
          adoption_stage: newPet.adoptionStage,
          listing_type: newPet.listingType,
          district: newPet.district,
          barangay: newPet.barangay,
          lat: newPet.lat,
          lng: newPet.lng,
          vaccinated: newPet.vaccinated,
          medical_notes: newPet.medicalNotes,
          urgency_flags: newPet.urgencyFlags ?? [],
          rehoming_reason: newPet.rehomingReason ?? null,
          reporter_name: newPet.reporterName,
          reporter_phone: newPet.reporterPhone ?? null,
          image_url: newPet.imageUrl,
        })
        .select()
        .single();
      if (data) {
        newPet.id = String(data.id);
      }
    } catch {
      // fallback persists locally
    }
  }

  const current = await fetchPets();
  writeStorage(KEYS.PETS, [newPet, ...current]);
  return newPet;
}

export async function updatePetStatusAndStage(
  petId: string,
  updates: { status?: PetHealthStatus; adoptionStage?: AdoptionStage }
): Promise<Pet[]> {
  if (supabase) {
    try {
      await supabase
        .from('pets')
        .update({
          ...(updates.status ? { status: updates.status } : {}),
          ...(updates.adoptionStage ? { adoption_stage: updates.adoptionStage } : {}),
        })
        .eq('id', petId);
    } catch {
      // ignore offline
    }
  }

  const current = await fetchPets();
  const next = current.map((p) =>
    p.id === petId
      ? {
          ...p,
          status: updates.status ?? p.status,
          adoptionStage: updates.adoptionStage ?? p.adoptionStage,
        }
      : p
  );
  writeStorage(KEYS.PETS, next);
  return next;
}

export async function fetchMessages(petId?: string): Promise<ChatMessage[]> {
  const local = readStorage<ChatMessage[] | null>(KEYS.MESSAGES, null);
  const all = local ?? SEED_MESSAGES;
  if (!local) writeStorage(KEYS.MESSAGES, SEED_MESSAGES);
  return petId ? all.filter((m) => m.petId === petId) : all;
}

export async function sendChatMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
  const newMsg: ChatMessage = {
    ...msg,
    id: `msg-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from('messages').insert({
        pet_id: newMsg.petId,
        sender_name: newMsg.senderName,
        sender_role: newMsg.senderRole,
        body: newMsg.body,
      });
    } catch {
      // fallback persists locally
    }
  }

  const all = await fetchMessages();
  writeStorage(KEYS.MESSAGES, [...all, newMsg]);
  return newMsg;
}

export async function saveRA10631Agreement(agreement: Omit<RA10631Agreement, 'signedAt'>): Promise<RA10631Agreement> {
  const record: RA10631Agreement = {
    ...agreement,
    signedAt: new Date().toISOString(),
  };
  const existing = readStorage<RA10631Agreement[]>(KEYS.AGREEMENTS, []);
  writeStorage(KEYS.AGREEMENTS, [record, ...existing]);
  return record;
}

export async function submitContactInquiry(input: Omit<ContactMessage, 'id' | 'createdAt'>): Promise<ContactMessage> {
  const record: ContactMessage = {
    ...input,
    id: `contact-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  if (supabase) {
    try {
      await supabase.from('contact_messages').insert({
        sender_name: record.senderName,
        email: record.email,
        message: record.message,
      });
    } catch {
      // fallback persists locally
    }
  }
  const existing = readStorage<ContactMessage[]>(KEYS.CONTACTS, []);
  writeStorage(KEYS.CONTACTS, [record, ...existing]);
  return record;
}

export function saveAppointmentBooking(input: Omit<AppointmentBooking, 'id' | 'createdAt'>): AppointmentBooking {
  const record: AppointmentBooking = {
    ...input,
    id: `appt-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const existing = readStorage<AppointmentBooking[]>(KEYS.APPOINTMENTS, []);
  writeStorage(KEYS.APPOINTMENTS, [record, ...existing]);
  return record;
}

export async function submitSupplyReservation(
  customerName: string,
  deliveryAddress: string,
  items: CartItem[],
  totalPhp: number
): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('supply_orders').insert({
        customer_name: customerName,
        delivery_address: deliveryAddress,
        items: items.map((i) => ({ name: i.product.name, qty: i.quantity, pricePhp: i.product.pricePhp })),
        total_php: totalPhp,
        status: 'reserved',
      });
    } catch {
      // fallback persists locally
    }
  }
  const existing = readStorage<unknown[]>(KEYS.ORDERS, []);
  writeStorage(KEYS.ORDERS, [
    { id: `ord-${Date.now()}`, customerName, deliveryAddress, items, totalPhp, createdAt: new Date().toISOString() },
    ...existing,
  ]);
}
