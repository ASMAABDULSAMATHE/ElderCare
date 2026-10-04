export type UserRole = 'elderly' | 'caregiver';

export type FoodInstruction = 'before_food' | 'after_food' | 'with_food' | 'no_instruction';

export type MedicationStatus = 'upcoming' | 'due' | 'taken' | 'missed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  foodInstruction: FoodInstruction;
  instructions: string;
  status: MedicationStatus;
  takenAt?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  avatar?: string;
}

export interface LovedOne {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  reminderFrequency: 'daily' | 'weekly' | 'custom';
  reminderTime: string;
  avatar?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

export interface MealPlan {
  id: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  title: string;
  time: string;
  description: string;
  preferences: string;
  preferredIngredients?: string;
  allergens: string;
  specialInstructions?: string;
}

export interface LovedOneReminder {
  id: string;
  lovedOneId?: string;
  name: string;
  relationship: string;
  time: string;
  frequency: string;
  date?: string;
  notes?: string;
}

export interface Workout {
  id: string;
  title: string;
  time: string;
  duration: string;
  instructions: string;
  completed: boolean;
}

export interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  clinic: string;
  locationAddress: string;
  date: string;
  time: string;
  type: string;
  phone: string;
  reminder: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  city: string;
  country: string;
  phone: string;
  address: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  avatar: string;
}

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  voiceGuidance: boolean;
  reduceMotion: boolean;
  largeButtons: boolean;
}

export type WellbeingStatus = 'good' | 'okay' | 'not_well' | null;

export interface WellbeingRecord {
  status: WellbeingStatus;
  timestamp: string;
}

export interface UaeLocation {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy';
  address: string;
  emirate: 'Abu Dhabi' | 'Dubai' | 'Sharjah' | 'Al Ain';
  phone: string;
  timing: string;
  latitude: number;
  longitude: number;
}

export type PlaceType =
  | 'home'
  | 'doctor'
  | 'hospital'
  | 'pharmacy'
  | 'mosque'
  | 'grocery'
  | 'family'
  | 'community'
  | 'clinic'
  | 'park'
  | 'restaurant'
  | 'other';

export interface SavedPlace {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  phone?: string;
  openingHours?: string;
  distance?: string;
  accessibilityInfo?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface AllergyMatch {
  allergen: string;
  matchedIngredient: string;
  isConfirmedMatch: boolean;
}

export interface FoodScanResult {
  id: string;
  productName: string;
  brand: string;
  ingredients: string[];
  rawIngredientsText: string;
  barcode?: string;
  timestamp: string;
  allergyMatches: AllergyMatch[];
  hasAllergen: boolean;
  status: 'safe' | 'warning' | 'uncertain';
  warningMessage?: string;
}
