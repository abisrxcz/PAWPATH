export type PetSpecies = 'Dog' | 'Cat' | 'Other';
export type PetHealthStatus = 'HEALTHY' | 'NEEDS CARE' | 'URGENT RESCUE' | 'PET ADOPTED';
export type AdoptionStage = 'Available' | 'Want to Adopt' | 'Ongoing Adoption' | 'Pet Adopted';
export type ListingType = 'adoption' | 'rehome' | 'stray';

export type AppView =
  | 'landing'
  | 'role-hub'
  | 'adoption-map'
  | 'chat'
  | 'health-centers'
  | 'food-shops'
  | 'rehome-form'
  | 'stray-form'
  | 'shelter-portal';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  age: number;
  district: string;
  barangay: string;
  role: 'citizen' | 'adopter' | 'shelter';
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  ageLabel: string;
  status: PetHealthStatus;
  adoptionStage: AdoptionStage;
  listingType: ListingType;
  district: string;
  barangay: string;
  lat: number;
  lng: number;
  vaccinated: boolean;
  medicalNotes: string;
  urgencyFlags?: string[];
  rehomingReason?: string;
  reporterName: string;
  reporterPhone?: string;
  imageUrl: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  petId: string;
  senderName: string;
  senderRole: 'adopter' | 'coordinator' | 'system';
  body: string;
  createdAt: string;
}

export interface RA10631Agreement {
  petId: string;
  adopterFullName: string;
  governmentIdType: string;
  governmentIdRef: string;
  homeEnvironment: string;
  digitalSignature: string;
  signedAt: string;
}

export interface VetService {
  name: string;
  pricePhp: number;
  note: string;
}

export interface HealthCenter {
  id: string;
  name: string;
  category: 'Government Office' | 'Public Hospital' | 'Private Partner' | 'Volunteer Rescue Clinic';
  address: string;
  district: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  services: VetService[];
}

export interface SupplyProduct {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Both';
  lifeStage: string;
  pricePhp: number;
  unit: string;
}

export interface FoodShop {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  tags: string[];
  lat: number;
  lng: number;
  dietGuide: string;
  catalog: SupplyProduct[];
}

export interface CartItem {
  product: SupplyProduct;
  quantity: number;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface AppointmentBooking {
  id: string;
  centerId: string;
  centerName: string;
  serviceName: string;
  petName: string;
  preferredDate: string;
  consultationType: 'In-Person Clinic Visit' | 'Preventative Tele-Guidance';
  createdAt: string;
}
