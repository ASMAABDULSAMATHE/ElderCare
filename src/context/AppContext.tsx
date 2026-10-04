import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  UserProfile,
  Caregiver,
  LovedOne,
  Medication,
  MedicationStatus,
  MealPlan,
  Workout,
  Appointment,
  EmergencyContact,
  AccessibilitySettings,
  WellbeingStatus,
  LovedOneReminder,
  SavedPlace,
  FoodScanResult,
} from '../types';
import {
  initialProfile,
  initialCaregivers,
  initialLovedOnes,
  initialLovedOneReminders,
  initialEmergencyContacts,
  initialMedications,
  initialMeals,
  initialWorkouts,
  initialAppointments,
  initialAccessibility,
  initialSavedPlaces,
} from '../data/defaultData';

export interface CallModalState {
  isOpen: boolean;
  name: string;
  relationship?: string;
  phone: string;
  type?: 'caregiver' | 'loved_one' | 'emergency' | 'doctor';
}

export interface FingerprintModalState {
  isOpen: boolean;
  title: string;
  description: string;
  onSuccessCallback?: () => void;
}

interface AppContextType {
  role: UserRole;
  isAuthenticated: boolean;
  isCaregiverAuthenticated: boolean;
  profile: UserProfile;
  caregivers: Caregiver[];
  lovedOnes: LovedOne[];
  emergencyContacts: EmergencyContact[];
  medications: Medication[];
  meals: MealPlan[];
  workouts: Workout[];
  appointments: Appointment[];
  lovedOneReminders: LovedOneReminder[];
  savedPlaces: SavedPlace[];
  foodScanResults: FoodScanResult[];
  waterCount: number;
  waterGoal: number;
  wellbeing: WellbeingStatus;
  accessibility: AccessibilitySettings;
  activeTab: string;
  callModal: CallModalState;
  fingerprintModal: FingerprintModalState;
  isVoiceAssistantOpen: boolean;
  
  // Navigation & Role actions
  setActiveTab: (tab: string) => void;
  loginAsElderly: () => void;
  unlockCaregiverMode: () => void;
  exitCaregiverMode: () => void;
  logout: () => void;
  
  // Elderly Actions (strictly non-admin)
  markMedicationTaken: (id: string) => void;
  markMedicationUntaken?: (id: string) => void;
  addWater: () => void;
  completeWorkout: (id: string) => void;
  setWellbeing: (status: WellbeingStatus) => void;

  // Places I Visit (Elderly and Caregiver both have permission)
  addSavedPlace: (data: Omit<SavedPlace, 'id'>) => void;
  updateSavedPlace: (id: string, data: Partial<SavedPlace>) => void;
  deleteSavedPlace: (id: string) => void;

  // Food Scanner
  addFoodScanResult: (result: FoodScanResult) => void;
  
  // Modal Actions
  startCall: (contact: { name: string; relationship?: string; phone: string; type?: CallModalState['type'] }) => void;
  closeCall: () => void;
  openVoiceAssistant: () => void;
  closeVoiceAssistant: () => void;
  openFingerprintAuth: (options: { title?: string; onSuccess: () => void }) => void;
  closeFingerprintAuth: () => void;

  // Caregiver Protected Actions
  updateProfile: (data: Partial<UserProfile>) => void;
  addCaregiver: (data: Omit<Caregiver, 'id'>) => { success: boolean; message?: string };
  updateCaregiver: (id: string, data: Partial<Caregiver>) => void;
  deleteCaregiver: (id: string) => void;
  addMedication: (data: Omit<Medication, 'id' | 'status'> & { status?: MedicationStatus }) => void;
  updateMedication: (id: string, data: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  updateWaterGoal: (goal: number) => void;
  addMeal: (data: Omit<MealPlan, 'id'>) => void;
  updateMeal: (id: string, data: Partial<MealPlan>) => void;
  deleteMeal: (id: string) => void;
  addAppointment: (data: Omit<Appointment, 'id'>, overridePermission?: boolean) => void;
  updateAppointment: (id: string, data: Partial<Appointment>, overridePermission?: boolean) => void;
  deleteAppointment: (id: string, overridePermission?: boolean) => void;
  addLovedOne: (data: Omit<LovedOne, 'id'>) => void;
  updateLovedOne: (id: string, data: Partial<LovedOne>) => void;
  deleteLovedOne: (id: string) => void;
  addLovedOneReminder: (data: Omit<LovedOneReminder, 'id'>) => void;
  deleteLovedOneReminder: (id: string) => void;
  updateAccessibility: (data: Partial<AccessibilitySettings>) => void;
  resetDemoData: () => void;
  
  // Temporary session during sign-up (discarded on browser refresh)
  isTemporarySession: boolean;
  temporaryUserMeta: { name: string; role: 'elderly' | 'caregiver' } | null;
  registerTemporaryUser: (data: {
    name: string;
    role: 'elderly' | 'caregiver';
    identifier: string;
    city?: string;
    age?: number;
    relativeName?: string;
    relationship?: string;
    emergencyPhone?: string;
  }) => void;
  resetTemporarySession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'eldercare_uae_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load persisted state or fallback to defaults
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }
    return null;
  };

  const saved = loadState();

  const [role, setRole] = useState<UserRole>('elderly');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isCaregiverAuthenticated, setIsCaregiverAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');

  // Temporary sign-up session state (in-memory only; cleared when refreshing browser)
  const [isTemporarySession, setIsTemporarySession] = useState<boolean>(false);
  const [temporaryUserMeta, setTemporaryUserMeta] = useState<{
    name: string;
    role: 'elderly' | 'caregiver';
  } | null>(null);

  const [profile, setProfile] = useState<UserProfile>(saved?.profile || initialProfile);
  const [caregivers, setCaregivers] = useState<Caregiver[]>(saved?.caregivers || initialCaregivers);
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>(saved?.lovedOnes || initialLovedOnes);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    saved?.emergencyContacts || initialEmergencyContacts
  );
  const [medications, setMedications] = useState<Medication[]>(saved?.medications || initialMedications);
  const [meals, setMeals] = useState<MealPlan[]>(() => {
    const currentMeals: MealPlan[] = saved?.meals || initialMeals;
    return currentMeals.map((m: MealPlan) => {
      if (
        m.id === 'meal-3' &&
        (m.allergens?.toLowerCase().includes('nut') ||
          m.description?.toLowerCase().includes('walnut') ||
          m.description?.toLowerCase().includes('pistachio'))
      ) {
        return initialMeals.find((im) => im.id === 'meal-3') || m;
      }
      if (
        m.id === 'meal-4' &&
        (m.allergens?.toLowerCase().includes('dairy') ||
          m.description?.toLowerCase().includes('cucumber yogurt'))
      ) {
        return initialMeals.find((im) => im.id === 'meal-4') || m;
      }
      return m;
    });
  });
  const [workouts, setWorkouts] = useState<Workout[]>(saved?.workouts || initialWorkouts);
  const [appointments, setAppointments] = useState<Appointment[]>(
    saved?.appointments || initialAppointments
  );
  const [lovedOneReminders, setLovedOneReminders] = useState<LovedOneReminder[]>(
    saved?.lovedOneReminders || initialLovedOneReminders
  );
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(
    saved?.savedPlaces || initialSavedPlaces
  );
  const [foodScanResults, setFoodScanResults] = useState<FoodScanResult[]>(
    saved?.foodScanResults || []
  );
  const [waterCount, setWaterCount] = useState<number>(saved?.waterCount ?? 6);
  const [waterGoal, setWaterGoal] = useState<number>(saved?.waterGoal ?? 8);
  const [wellbeing, setWellbeingState] = useState<WellbeingStatus>(saved?.wellbeing ?? 'good');
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(
    saved?.accessibility || initialAccessibility
  );

  // Modals state
  const [callModal, setCallModal] = useState<CallModalState>({
    isOpen: false,
    name: '',
    relationship: '',
    phone: '',
  });

  const [fingerprintModal, setFingerprintModal] = useState<FingerprintModalState>({
    isOpen: false,
    title: 'Fingerprint Authentication',
    description: 'Place your finger on the fingerprint sensor.',
  });

  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  // Sync state to LocalStorage (skipped during temporary sign-up session so data is deleted on browser refresh)
  useEffect(() => {
    if (isTemporarySession) {
      // In-memory temporary sign-up session; do not write to localStorage
      return;
    }
    try {
      const stateToSave = {
        profile,
        caregivers,
        lovedOnes,
        emergencyContacts,
        medications,
        meals,
        workouts,
        appointments,
        lovedOneReminders,
        savedPlaces,
        foodScanResults,
        waterCount,
        waterGoal,
        wellbeing,
        accessibility,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }, [
    isTemporarySession,
    profile,
    caregivers,
    lovedOnes,
    emergencyContacts,
    medications,
    meals,
    workouts,
    appointments,
    lovedOneReminders,
    savedPlaces,
    foodScanResults,
    waterCount,
    waterGoal,
    wellbeing,
    accessibility,
  ]);

  // Handle accessibility and fixed typography
  useEffect(() => {
    const root = document.documentElement;
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (accessibility.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Fixed typography: Elderly mode gets fixed large font throughout; Caregiver mode gets standard compact typography
    if (isCaregiverAuthenticated) {
      root.classList.add('caregiver-mode');
      root.classList.remove('elderly-mode', 'text-size-large', 'text-size-extra-large');
    } else {
      root.classList.add('elderly-mode', 'text-size-large');
      root.classList.remove('caregiver-mode');
    }
  }, [accessibility, isCaregiverAuthenticated]);

  // Places I Visit actions (Both elderly and caregiver have access)
  const addSavedPlace = (data: Omit<SavedPlace, 'id'>) => {
    const newPlace: SavedPlace = {
      ...data,
      id: `sp-${Date.now()}`,
    };
    setSavedPlaces((prev) => [newPlace, ...prev]);
  };

  const updateSavedPlace = (id: string, data: Partial<SavedPlace>) => {
    setSavedPlaces((prev) =>
      prev.map((place) => (place.id === id ? { ...place, ...data } : place))
    );
  };

  const deleteSavedPlace = (id: string) => {
    setSavedPlaces((prev) => prev.filter((place) => place.id !== id));
  };

  // Food Scanner actions
  const addFoodScanResult = (result: FoodScanResult) => {
    setFoodScanResults((prev) => [result, ...prev.slice(0, 19)]);
  };

  // Auth methods
  const loginAsElderly = () => {
    setIsAuthenticated(true);
    setRole('elderly');
    setIsCaregiverAuthenticated(false);
    setActiveTab('home');
  };

  const unlockCaregiverMode = () => {
    setIsAuthenticated(true);
    setIsCaregiverAuthenticated(true);
    setRole('caregiver');
  };

  const exitCaregiverMode = () => {
    setIsCaregiverAuthenticated(false);
    setRole('elderly');
    setActiveTab('home');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsCaregiverAuthenticated(false);
    setRole('elderly');
  };

  const registerTemporaryUser = (data: {
    name: string;
    role: 'elderly' | 'caregiver';
    identifier: string;
    city?: string;
    age?: number;
    relativeName?: string;
    relationship?: string;
    emergencyPhone?: string;
  }) => {
    setIsTemporarySession(true);
    setTemporaryUserMeta({ name: data.name, role: data.role });

    if (data.role === 'elderly') {
      setProfile((prev) => ({
        ...prev,
        name: data.name,
        phone: data.identifier,
        city: data.city || 'Abu Dhabi',
        age: data.age || 72,
        address: data.city ? `Villa Residence, ${data.city}, UAE` : prev.address,
      }));
      setRole('elderly');
      setIsAuthenticated(true);
      setIsCaregiverAuthenticated(false);
      setActiveTab('home');
    } else {
      // Caregiver role signed up
      const seniorName = data.relativeName?.trim() || 'Mariam Ahmed';
      setProfile((prev) => ({
        ...prev,
        name: seniorName,
        city: data.city || prev.city,
      }));

      const newCaregiver: Caregiver = {
        id: `cg-temp-${Date.now()}`,
        name: data.name,
        relationship: data.relationship || 'Family Caregiver',
        phone: data.identifier,
        email: data.identifier.includes('@') ? data.identifier : '',
        isPrimary: true,
      };

      setCaregivers((prev) => [newCaregiver, ...prev.map((c) => ({ ...c, isPrimary: false }))]);
      setRole('caregiver');
      setIsAuthenticated(true);
      setIsCaregiverAuthenticated(true);
      setActiveTab('home');
    }
  };

  const resetTemporarySession = () => {
    setIsTemporarySession(false);
    setTemporaryUserMeta(null);
    resetDemoData();
  };

  // Elderly actions
  const markMedicationTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const isTaken = med.status === 'taken';
          return {
            ...med,
            status: isTaken ? 'due' : 'taken',
            takenAt: isTaken ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return med;
      })
    );
  };

  const addWater = () => {
    setWaterCount((prev) => Math.min(prev + 1, 20));
  };

  const completeWorkout = (id: string) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, completed: !w.completed } : w))
    );
  };

  const setWellbeing = (status: WellbeingStatus) => {
    // Updating mood of the elderly user should not be editable by the caregiver
    if (isCaregiverAuthenticated) {
      console.warn('Caregiver cannot edit elderly user wellbeing status.');
      return;
    }
    setWellbeingState(status);
  };

  // Modal actions
  const startCall = (contact: { name: string; relationship?: string; phone: string; type?: CallModalState['type'] }) => {
    setCallModal({
      isOpen: true,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      type: contact.type || 'caregiver',
    });
  };

  const closeCall = () => {
    setCallModal({ isOpen: false, name: '', phone: '' });
  };

  const openVoiceAssistant = () => {
    setIsVoiceAssistantOpen(true);
  };

  const closeVoiceAssistant = () => {
    setIsVoiceAssistantOpen(false);
  };

  const openFingerprintAuth = (options: { title?: string; onSuccess: () => void }) => {
    setFingerprintModal({
      isOpen: true,
      title: options.title || 'Fingerprint Authentication',
      description: 'Place your finger on the fingerprint sensor.',
      onSuccessCallback: options.onSuccess,
    });
  };

  const closeFingerprintAuth = () => {
    setFingerprintModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Caregiver Protected Actions
  const updateProfile = (data: Partial<UserProfile>) => {
    if (!isCaregiverAuthenticated) return;
    setProfile((prev) => ({ ...prev, ...data }));
  };

  // MAXIMUM 3 CAREGIVERS RULE ENFORCEMENT
  const addCaregiver = (data: Omit<Caregiver, 'id'>) => {
    if (!isCaregiverAuthenticated) {
      return { success: false, message: 'Caregiver authentication required' };
    }
    if (caregivers.length >= 3) {
      return { success: false, message: 'You can have up to 3 caregivers.' };
    }

    const newCaregiver: Caregiver = {
      ...data,
      id: `cg-${Date.now()}`,
    };

    // If marked primary, unmark others
    if (newCaregiver.isPrimary) {
      setCaregivers((prev) => [
        ...prev.map((c) => ({ ...c, isPrimary: false })),
        newCaregiver,
      ]);
    } else {
      // If first caregiver, make it primary automatically
      if (caregivers.length === 0) {
        newCaregiver.isPrimary = true;
      }
      setCaregivers((prev) => [...prev, newCaregiver]);
    }

    return { success: true };
  };

  const updateCaregiver = (id: string, data: Partial<Caregiver>) => {
    if (!isCaregiverAuthenticated) return;
    setCaregivers((prev) => {
      let updated = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      if (data.isPrimary) {
        updated = updated.map((c) => ({
          ...c,
          isPrimary: c.id === id,
        }));
      }
      return updated;
    });
  };

  const deleteCaregiver = (id: string) => {
    if (!isCaregiverAuthenticated) return;
    setCaregivers((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      // If the primary was deleted and there are remaining, set the first one as primary
      if (remaining.length > 0 && !remaining.some((c) => c.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const addMedication = (data: Omit<Medication, 'id' | 'status'> & { status?: MedicationStatus }) => {
    if (!isCaregiverAuthenticated) return;
    const newMed: Medication = {
      ...data,
      id: `med-${Date.now()}`,
      status: data.status || 'upcoming',
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const updateMedication = (id: string, data: Partial<Medication>) => {
    if (!isCaregiverAuthenticated) return;
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  };

  const deleteMedication = (id: string) => {
    if (!isCaregiverAuthenticated) return;
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const updateWaterGoal = (goal: number) => {
    if (!isCaregiverAuthenticated) return;
    setWaterGoal(Math.max(1, Math.min(goal, 20)));
  };

  const addMeal = (data: Omit<MealPlan, 'id'>) => {
    if (!isCaregiverAuthenticated) return;
    const newMeal: MealPlan = {
      ...data,
      id: `meal-${Date.now()}`,
    };
    setMeals((prev) => [...prev, newMeal]);
  };

  const updateMeal = (id: string, data: Partial<MealPlan>) => {
    if (!isCaregiverAuthenticated) return;
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  };

  const deleteMeal = (id: string) => {
    if (!isCaregiverAuthenticated) return;
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const addAppointment = (data: Omit<Appointment, 'id'>, overridePermission = false) => {
    if (!isCaregiverAuthenticated && !overridePermission) return;
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
    };
    setAppointments((prev) => [...prev, newApt]);
  };

  const updateAppointment = (id: string, data: Partial<Appointment>, overridePermission = false) => {
    if (!isCaregiverAuthenticated && !overridePermission) return;
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  };

  const deleteAppointment = (id: string, overridePermission = false) => {
    if (!isCaregiverAuthenticated && !overridePermission) return;
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const addLovedOne = (data: Omit<LovedOne, 'id'>) => {
    if (!isCaregiverAuthenticated) return;
    const newLovedOne: LovedOne = {
      ...data,
      id: `lo-${Date.now()}`,
    };
    setLovedOnes((prev) => [...prev, newLovedOne]);
  };

  const updateLovedOne = (id: string, data: Partial<LovedOne>) => {
    if (!isCaregiverAuthenticated) return;
    setLovedOnes((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const deleteLovedOne = (id: string) => {
    if (!isCaregiverAuthenticated) return;
    setLovedOnes((prev) => prev.filter((l) => l.id !== id));
  };

  const addLovedOneReminder = (data: Omit<LovedOneReminder, 'id'>) => {
    const newReminder: LovedOneReminder = {
      ...data,
      id: `lor-${Date.now()}`,
    };
    setLovedOneReminders((prev) => [...prev, newReminder]);
  };

  const deleteLovedOneReminder = (id: string) => {
    setLovedOneReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const updateAccessibility = (data: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => ({ ...prev, ...data }));
  };

  const resetDemoData = () => {
    setProfile(initialProfile);
    setCaregivers(initialCaregivers);
    setLovedOnes(initialLovedOnes);
    setLovedOneReminders(initialLovedOneReminders);
    setEmergencyContacts(initialEmergencyContacts);
    setMedications(initialMedications);
    setMeals(initialMeals);
    setWorkouts(initialWorkouts);
    setAppointments(initialAppointments);
    setSavedPlaces(initialSavedPlaces);
    setFoodScanResults([]);
    setWaterCount(6);
    setWaterGoal(8);
    setWellbeingState('good');
    setAccessibility(initialAccessibility);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        isAuthenticated,
        isCaregiverAuthenticated,
        profile,
        caregivers,
        lovedOnes,
        emergencyContacts,
        medications,
        meals,
        workouts,
        appointments,
        lovedOneReminders,
        savedPlaces,
        foodScanResults,
        waterCount,
        waterGoal,
        wellbeing,
        accessibility,
        activeTab,
        callModal,
        fingerprintModal,
        isVoiceAssistantOpen,
        setActiveTab,
        loginAsElderly,
        unlockCaregiverMode,
        exitCaregiverMode,
        logout,
        markMedicationTaken,
        addWater,
        completeWorkout,
        setWellbeing,
        startCall,
        closeCall,
        openVoiceAssistant,
        closeVoiceAssistant,
        openFingerprintAuth,
        closeFingerprintAuth,
        updateProfile,
        addCaregiver,
        updateCaregiver,
        deleteCaregiver,
        addMedication,
        updateMedication,
        deleteMedication,
        updateWaterGoal,
        addMeal,
        updateMeal,
        deleteMeal,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addLovedOne,
        updateLovedOne,
        deleteLovedOne,
        addLovedOneReminder,
        deleteLovedOneReminder,
        addSavedPlace,
        updateSavedPlace,
        deleteSavedPlace,
        addFoodScanResult,
        updateAccessibility,
        resetDemoData,
        isTemporarySession,
        temporaryUserMeta,
        registerTemporaryUser,
        resetTemporarySession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
