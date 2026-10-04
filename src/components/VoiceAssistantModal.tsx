import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { GeminiLiveClient, ToolCall } from '../services/geminiLiveService';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  AlertTriangle,
  Check,
  Phone,
  ShieldAlert,
  Droplet,
  Clock,
  MapPin,
  Pill,
  Sparkles,
  Send,
  Calendar,
  AlertCircle,
  Heart,
  Utensils,
  Activity,
  User,
  Plus,
} from 'lucide-react';

interface VoiceConfirmation {
  title: string;
  description: string;
  actionType:
    | 'call'
    | 'emergency'
    | 'medication'
    | 'water'
    | 'workout'
    | 'reminder'
    | 'appointment'
    | 'place'
    | 'food';
  execute: () => void;
  confirmLabel: string;
  cancelLabel?: string;
  isEmergency?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source: 'voice' | 'text';
  timestamp: string;
}

export const VoiceAssistantModal: React.FC = () => {
  const {
    isVoiceAssistantOpen,
    closeVoiceAssistant,
    role,
    isCaregiverAuthenticated,
    profile,
    caregivers,
    lovedOnes,
    lovedOneReminders,
    savedPlaces,
    medications,
    meals,
    workouts,
    appointments,
    waterCount,
    waterGoal,
    wellbeing,
    markMedicationTaken,
    addWater,
    completeWorkout,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addLovedOneReminder,
    addSavedPlace,
    updateSavedPlace,
    deleteSavedPlace,
    startCall,
    setActiveTab,
  } = useApp();

  // Assistant states: 'ready' | 'listening' | 'processing' | 'responding' | 'error'
  const [connectionStatus, setConnectionStatus] = useState<
    'ready' | 'listening' | 'processing' | 'responding' | 'error'
  >('ready');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);

  // Live real-time transcripts
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [assistantLiveTranscript, setAssistantLiveTranscript] = useState<string>('');

  // Conversation history (Both Voice and Text)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello ${profile.name.split(' ')[0] || 'there'}, I am your ElderCare companion. You can speak to me or type your question below. How can I help you?`,
      source: 'text',
      timestamp: 'Just now',
    },
  ]);

  const [pendingConfirmation, setPendingConfirmation] = useState<VoiceConfirmation | null>(null);
  const [permissionBlockedMessage, setPermissionBlockedMessage] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>('gemini-3.8-flash & live');

  const liveClientRef = useRef<GeminiLiveClient | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');
  const speechSilenceTimerRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Keep fresh references to context state
  const stateRef = useRef({
    role,
    isCaregiverAuthenticated,
    profile,
    caregivers,
    lovedOnes,
    lovedOneReminders,
    savedPlaces,
    medications,
    meals,
    workouts,
    appointments,
    waterCount,
    waterGoal,
    wellbeing,
  });

  useEffect(() => {
    stateRef.current = {
      role,
      isCaregiverAuthenticated,
      profile,
      caregivers,
      lovedOnes,
      lovedOneReminders,
      savedPlaces,
      medications,
      meals,
      workouts,
      appointments,
      waterCount,
      waterGoal,
      wellbeing,
    };
  }, [
    role,
    isCaregiverAuthenticated,
    profile,
    caregivers,
    lovedOnes,
    lovedOneReminders,
    savedPlaces,
    medications,
    meals,
    workouts,
    appointments,
    waterCount,
    waterGoal,
    wellbeing,
  ]);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, assistantLiveTranscript, userTranscript, pendingConfirmation, permissionBlockedMessage]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isVoiceAssistantOpen) {
      handleStopAllAudio();
    }
  }, [isVoiceAssistantOpen]);

  /**
   * Stop all audio (Gemini Live playback, browser TTS, and speech recognition)
   */
  const handleStopAllAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }

    if (liveClientRef.current) {
      liveClientRef.current.disconnect();
      liveClientRef.current = null;
    }

    setConnectionStatus('ready');
  };

  /**
   * Browser Text-to-Speech playback for elderly users (clear, gentle, friendly)
   */
  const speakText = (text: string) => {
    if (!voiceSpeechEnabled) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        setConnectionStatus('responding');
      };
      utterance.onend = () => {
        setConnectionStatus('ready');
      };
      utterance.onerror = () => {
        setConnectionStatus('ready');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  /**
   * UNIFIED TOOL EXECUTION ENGINE
   * Invoked identically by Voice (Gemini Live) and Text (/api/gemini/chat)
   */
  const handleToolCalls = (
    toolCalls: ToolCall[],
    respond?: (responses: Array<{ id: string; response: Record<string, any> }>) => void
  ) => {
    const responses: Array<{ id: string; response: Record<string, any> }> = [];
    const currentState = stateRef.current;

    for (const call of toolCalls) {
      console.log('Unified Tool execution:', call.name, call.args);

      switch (call.name) {
        case 'get_today_reminders': {
          const nextApt = currentState.appointments[0];
          const primaryCg =
            currentState.caregivers.find((c) => c.isPrimary) || currentState.caregivers[0];

          responses.push({
            id: call.id,
            response: {
              schedule: [
                { time: '8:00 AM', item: 'Metformin 500 mg (After food)' },
                { time: '8:30 AM', item: 'Breakfast (Warm oatmeal + banana + mint tea)' },
                { time: '12:00 PM', item: `Drink Water (${currentState.waterCount}/${currentState.waterGoal} glasses)` },
                { time: '1:30 PM', item: 'Lunch (Grilled sea bass + saffron rice)' },
                { time: '4:00 PM', item: 'Evening Walk (20 minutes gentle walk)' },
                { time: '6:00 PM', item: `Doctor Appointment with ${nextApt?.doctor} at ${nextApt?.clinic}` },
                { time: '7:00 PM', item: `Call ${primaryCg?.name || 'daughter Aisha'}` },
                { time: '8:30 PM', item: 'Dinner (Yellow lentil shorba soup)' },
              ],
            },
          });
          break;
        }

        case 'get_next_appointment': {
          const apt = currentState.appointments[0];
          responses.push({
            id: call.id,
            response: apt
              ? {
                  doctor: apt.doctor,
                  specialty: apt.specialty,
                  clinic: apt.clinic,
                  time: apt.time,
                  date: apt.date,
                  locationAddress: apt.locationAddress,
                }
              : { message: 'No upcoming appointments scheduled today.' },
          });
          break;
        }

        case 'get_all_appointments': {
          responses.push({
            id: call.id,
            response: {
              appointments: currentState.appointments.map((a) => ({
                doctor: a.doctor,
                specialty: a.specialty,
                clinic: a.clinic,
                date: a.date,
                time: a.time,
                type: a.type,
                reminder: a.reminder,
              })),
            },
          });
          break;
        }

        case 'add_appointment':
        case 'edit_appointment':
        case 'delete_appointment': {
          const refusalMsg =
            'Doctor appointments can only be booked or scheduled by your caregiver. Please contact your daughter Aisha (+971 50 123 4567) or your clinic to schedule an appointment.';
          setPermissionBlockedMessage(refusalMsg);
          setMessages((prev) => [
            ...prev,
            {
              id: `perm-${Date.now()}`,
              role: 'assistant',
              text: refusalMsg,
              source: 'text',
              timestamp: 'Just now',
            },
          ]);
          speakText(refusalMsg);
          responses.push({
            id: call.id,
            response: {
              status: 'blocked',
              message: refusalMsg,
            },
          });
          break;
        }

        case 'get_medication_schedule': {
          responses.push({
            id: call.id,
            response: {
              medications: currentState.medications.map((m) => ({
                name: m.name,
                dosage: m.dosage,
                time: m.time,
                foodInstruction: m.foodInstruction.replace('_', ' '),
                status: m.status,
              })),
            },
          });
          break;
        }

        case 'mark_medication_taken': {
          const medName = call.args?.medicationName || 'Metformin';
          const targetMed =
            currentState.medications.find((m) =>
              m.name.toLowerCase().includes(medName.toLowerCase())
            ) || currentState.medications[0];

          if (targetMed) {
            setPendingConfirmation({
              title: `Mark ${targetMed.name} as taken?`,
              description: `Dose: ${targetMed.dosage} · Scheduled for ${targetMed.time}`,
              actionType: 'medication',
              confirmLabel: 'Confirm Taken',
              execute: () => {
                markMedicationTaken(targetMed.id);
                setPendingConfirmation(null);
                const ack = `Marked ${targetMed.name} ${targetMed.dosage} as taken.`;
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `med-${Date.now()}`,
                    role: 'assistant',
                    text: ack,
                    source: 'text',
                    timestamp: 'Just now',
                  },
                ]);
                speakText(ack);
              },
            });

            responses.push({
              id: call.id,
              response: {
                status: 'confirmation_requested',
                message: `Asked Mariam to confirm taking ${targetMed.name}.`,
              },
            });
          }
          break;
        }

        case 'get_water_progress': {
          responses.push({
            id: call.id,
            response: {
              waterCount: currentState.waterCount,
              waterGoal: currentState.waterGoal,
              percentage: Math.round((currentState.waterCount / currentState.waterGoal) * 100),
            },
          });
          break;
        }

        case 'add_water': {
          const count = call.args?.count || 1;
          setPendingConfirmation({
            title: `Add ${count} ${count > 1 ? 'glasses' : 'glass'} of water?`,
            description: `Current intake: ${currentState.waterCount} / ${currentState.waterGoal} glasses`,
            actionType: 'water',
            confirmLabel: 'Confirm Water',
            execute: () => {
              for (let i = 0; i < count; i++) addWater();
              setPendingConfirmation(null);
              const ack = `Added ${count} glass of water. Total: ${currentState.waterCount + count} glasses.`;
              setMessages((prev) => [
                ...prev,
                {
                  id: `water-${Date.now()}`,
                  role: 'assistant',
                  text: ack,
                  source: 'text',
                  timestamp: 'Just now',
                },
              ]);
              speakText(ack);
            },
          });

          responses.push({
            id: call.id,
            response: {
              status: 'confirmation_requested',
              message: `Requested confirmation for ${count} glass(es) of water.`,
            },
          });
          break;
        }

        case 'get_meal_plan':
        case 'get_today_meals': {
          const requestedType = call.args?.mealType?.toLowerCase();
          const targetMeals = requestedType
            ? currentState.meals.filter((m) => m.type === requestedType)
            : currentState.meals;

          responses.push({
            id: call.id,
            response: {
              meals: targetMeals.map((m) => ({
                title: m.title,
                time: m.time,
                description: m.description,
                preferences: m.preferences,
                preferredIngredients: m.preferredIngredients,
                allergens: m.allergens,
                specialInstructions: m.specialInstructions,
              })),
            },
          });
          break;
        }

        case 'get_workout_schedule': {
          const wo = currentState.workouts[0];
          responses.push({
            id: call.id,
            response: {
              title: wo?.title || 'Evening Walk',
              time: wo?.time || '4:00 PM',
              duration: wo?.duration || '20 minutes',
              completed: wo?.completed || false,
            },
          });
          break;
        }

        case 'mark_workout_complete': {
          const wo = currentState.workouts[0];
          if (wo) {
            setPendingConfirmation({
              title: `Mark ${wo.title} as completed?`,
              description: `${wo.duration} scheduled at ${wo.time}`,
              actionType: 'workout',
              confirmLabel: 'Mark Complete',
              execute: () => {
                completeWorkout(wo.id);
                setPendingConfirmation(null);
              },
            });
            responses.push({
              id: call.id,
              response: { status: 'confirmation_requested' },
            });
          }
          break;
        }

        case 'get_caregivers': {
          responses.push({
            id: call.id,
            response: {
              caregivers: currentState.caregivers.map((c) => ({
                name: c.name,
                relationship: c.relationship,
                phone: c.phone,
                isPrimary: c.isPrimary,
              })),
            },
          });
          break;
        }

        case 'get_loved_ones': {
          responses.push({
            id: call.id,
            response: {
              lovedOnes: currentState.lovedOnes.map((l) => ({
                name: l.name,
                relationship: l.relationship,
                phone: l.phone,
                reminderTime: l.reminderTime,
              })),
            },
          });
          break;
        }

        case 'call_contact': {
          const nameQuery = (call.args?.contactName || '').toLowerCase();
          const targetContact =
            currentState.lovedOnes.find(
              (l) =>
                l.name.toLowerCase().includes(nameQuery) ||
                l.relationship.toLowerCase().includes(nameQuery)
            ) ||
            currentState.caregivers.find(
              (c) =>
                c.name.toLowerCase().includes(nameQuery) ||
                c.relationship.toLowerCase().includes(nameQuery)
            ) ||
            currentState.lovedOnes[0];

          if (targetContact) {
            setPendingConfirmation({
              title: `Call ${targetContact.name}?`,
              description: `${targetContact.relationship} · ${targetContact.phone}`,
              actionType: 'call',
              confirmLabel: `Call ${targetContact.name.split(' ')[0]} Now`,
              execute: () => {
                handleStopAllAudio();
                closeVoiceAssistant();
                startCall({
                  name: targetContact.name,
                  relationship: targetContact.relationship,
                  phone: targetContact.phone,
                  type: 'loved_one',
                });
                setPendingConfirmation(null);
              },
            });

            responses.push({
              id: call.id,
              response: {
                status: 'call_prepared',
                contactName: targetContact.name,
                phone: targetContact.phone,
                message: `Prepared call for ${targetContact.name}. Awaiting user tap confirmation.`,
              },
            });
          }
          break;
        }

        case 'create_loved_one_reminder': {
          const name = call.args?.name || 'Aisha';
          const time = call.args?.time || '7:00 PM';
          const freq = call.args?.frequency || 'Tomorrow';

          setPendingConfirmation({
            title: `Remind to call ${name}?`,
            description: `${freq} at ${time}`,
            actionType: 'reminder',
            confirmLabel: 'Set Call Reminder',
            execute: () => {
              addLovedOneReminder({
                name,
                relationship: 'Family',
                time,
                frequency: freq,
                notes: `Call reminder scheduled via Gemini assistant`,
              });
              setPendingConfirmation(null);
              const ack = `Reminder set to call ${name} ${freq} at ${time}.`;
              setMessages((prev) => [
                ...prev,
                {
                  id: `lor-${Date.now()}`,
                  role: 'assistant',
                  text: ack,
                  source: 'text',
                  timestamp: 'Just now',
                },
              ]);
              speakText(ack);
            },
          });

          responses.push({
            id: call.id,
            response: {
              status: 'confirmation_requested',
              message: `Requested confirmation to remind Mariam to call ${name} at ${time}.`,
            },
          });
          break;
        }

        case 'get_loved_one_reminders': {
          responses.push({
            id: call.id,
            response: {
              reminders: currentState.lovedOneReminders,
            },
          });
          break;
        }

        case 'open_places':
        case 'open_maps': {
          responses.push({
            id: call.id,
            response: { status: 'navigating_to_places' },
          });
          setTimeout(() => {
            handleStopAllAudio();
            closeVoiceAssistant();
            setActiveTab('places');
          }, 1200);
          break;
        }

        case 'start_emergency_call': {
          const srv = (call.args?.service || 'ambulance').toLowerCase();
          let number = '998';
          let label = 'UAE Ambulance';
          if (srv.includes('police') || srv === '999') {
            number = '999';
            label = 'UAE Police';
          } else if (srv.includes('civil') || srv.includes('fire') || srv === '997') {
            number = '997';
            label = 'UAE Civil Defence';
          }

          setPendingConfirmation({
            title: `Call ${label} (${number})?`,
            description: 'UAE Emergency Services · Opens device telephone dialer immediately',
            actionType: 'emergency',
            isEmergency: true,
            confirmLabel: `Call ${number}`,
            execute: () => {
              handleStopAllAudio();
              closeVoiceAssistant();
              window.location.href = `tel:${number}`;
              setPendingConfirmation(null);
            },
          });

          responses.push({
            id: call.id,
            response: {
              status: 'emergency_confirmation_shown',
              service: label,
              number,
            },
          });
          break;
        }

        case 'get_wellbeing_status': {
          responses.push({
            id: call.id,
            response: {
              status: currentState.wellbeing || 'good',
            },
          });
          break;
        }

        case 'request_caregiver_action': {
          const actionType = call.args?.actionType;
          let blockedMsg = 'Medication changes can only be made by a caregiver.';
          if (actionType === 'change_water_goal') {
            blockedMsg = 'Your water goal can only be changed by a caregiver.';
          } else if (actionType === 'add_caregiver') {
            blockedMsg = 'Caregivers can only be added through Caregiver Mode.';
          } else if (actionType === 'edit_meal') {
            blockedMsg = 'Protected meal plans can only be modified by a caregiver.';
          }

          setPermissionBlockedMessage(blockedMsg);

          responses.push({
            id: call.id,
            response: {
              error: 'PERMISSION_DENIED',
              message: blockedMsg,
              role: currentState.role,
            },
          });
          break;
        }

        default:
          responses.push({
            id: call.id,
            response: { status: 'unsupported' },
          });
      }
    }

    if (respond) {
      respond(responses);
    }
  };

  /**
   * VOICE: Connect to Gemini Live & Start Microphone Input
   */
  const handleStartVoice = async () => {
    // Interruption / Reset
    handleStopAllAudio();
    setErrorMessage(null);
    setConnectionStatus('listening');
    setUserTranscript('');
    setAssistantLiveTranscript('');
    setPendingConfirmation(null);
    setPermissionBlockedMessage(null);

    // Initialize browser speech recognition for instant live transcription display alongside Gemini Live
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';

          rec.onresult = (event: any) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;
            setUserTranscript(transcript);

            // User interruption detection: if user speaks while assistant is speaking, stop assistant audio
            if (connectionStatus === 'responding') {
              liveClientRef.current?.stopAudioPlayback();
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setConnectionStatus('listening');
            }
          };

          rec.onend = () => {
            // If user stopped speaking, commit user message to history
            if (userTranscript) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `user-${Date.now()}`,
                  role: 'user',
                  text: userTranscript,
                  source: 'voice',
                  timestamp: 'Just now',
                },
              ]);
            }
          };

          rec.onerror = () => {};
          rec.start();
          speechRecognitionRef.current = rec;
        } catch (e) {}
      }
    }

    try {
      const client = new GeminiLiveClient({
        onConnected: (model) => {
          setActiveModel(model);
          setConnectionStatus('listening');
        },
        onAssistantSpeechStart: () => {
          setConnectionStatus('responding');
        },
        onAssistantSpeechEnd: () => {
          setConnectionStatus('ready');
          if (assistantLiveTranscript) {
            setMessages((prev) => [
              ...prev,
              {
                id: `asst-${Date.now()}`,
                role: 'assistant',
                text: assistantLiveTranscript,
                source: 'voice',
                timestamp: 'Just now',
              },
            ]);
            setAssistantLiveTranscript('');
          }
        },
        onUserTranscription: (text) => {
          setUserTranscript(text);
        },
        onAssistantTranscription: (text) => {
          setAssistantLiveTranscript((prev) => prev + text);
        },
        onInterrupted: () => {
          console.log('Interruption signaled by Gemini Live');
          setConnectionStatus('listening');
        },
        onToolCall: (calls, respond) => {
          handleToolCalls(calls, respond);
        },
        onError: (err) => {
          setConnectionStatus('error');
          setErrorMessage(err);
        },
        onClose: () => {
          if (connectionStatus !== 'error') {
            setConnectionStatus('ready');
          }
        },
      });

      liveClientRef.current = client;
      const connected = await client.connect(
        stateRef.current.role,
        {
          waterCount: stateRef.current.waterCount,
          waterGoal: stateRef.current.waterGoal,
          caregivers: stateRef.current.caregivers,
          medications: stateRef.current.medications,
          appointments: stateRef.current.appointments,
        },
        true
      );

      if (!connected) {
        setConnectionStatus('error');
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setErrorMessage("Could not connect to microphone. Please check permissions.");
    }
  };

  /**
   * TEXT & SIMULATION: Send Text Query to Unified Assistant
   */
  const handleSendTextQuery = async (queryText?: string) => {
    const textToSend = queryText || textInput;
    if (!textToSend.trim()) return;

    // Interrupt any previous speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    liveClientRef.current?.stopAudioPlayback();

    setTextInput('');
    setUserTranscript('');
    setAssistantLiveTranscript('');
    setPendingConfirmation(null);
    setPermissionBlockedMessage(null);
    setErrorMessage(null);
    setConnectionStatus('processing');

    // Add User message to chat history
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend,
      source: 'text',
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);

    // PRE-CHECK PERMISSIONS & REFUSAL (Strict identical enforcement)
    const textLower = textToSend.toLowerCase();
    if (
      textLower.includes('change my medication') ||
      textLower.includes('change medication') ||
      textLower.includes('change dose') ||
      textLower.includes('change dosage')
    ) {
      const refusalMsg = 'Medication changes can only be made by a caregiver. Please contact your caregiver to adjust your medicine.';
      setPermissionBlockedMessage(refusalMsg);
      setConnectionStatus('ready');
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: refusalMsg,
          source: 'text',
          timestamp: 'Just now',
        },
      ]);
      speakText(refusalMsg);
      return;
    }

    if (textLower.includes('change my water goal') || textLower.includes('change water goal')) {
      const refusalMsg = 'Your water goal can only be changed by a caregiver.';
      setPermissionBlockedMessage(refusalMsg);
      setConnectionStatus('ready');
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: refusalMsg,
          source: 'text',
          timestamp: 'Just now',
        },
      ]);
      speakText(refusalMsg);
      return;
    }

    // STRICT APPOINTMENT POLICY: Elderly users cannot take or book appointments through Gemini
    const isAppointmentInquiry =
      (textLower.startsWith('when is') ||
        textLower.startsWith('what is') ||
        textLower.startsWith('where is') ||
        textLower.includes('tell me when') ||
        textLower.includes('check my appointment') ||
        textLower.includes('view my appointment') ||
        textLower.includes('do i have an appointment')) &&
      !textLower.includes('book') &&
      !textLower.includes('take') &&
      !textLower.includes('schedule') &&
      !textLower.includes('add') &&
      !textLower.includes('make') &&
      !textLower.includes('change') &&
      !textLower.includes('cancel') &&
      !textLower.includes('reschedule');

    const wantsAppointmentBooking =
      !isAppointmentInquiry &&
      (
        textLower.includes('take appointment') ||
        textLower.includes('take an appointment') ||
        textLower.includes('take a doctor appointment') ||
        textLower.includes('take doctor appointment') ||
        textLower.includes('book appointment') ||
        textLower.includes('book an appointment') ||
        textLower.includes('book doctor') ||
        textLower.includes('schedule appointment') ||
        textLower.includes('schedule an appointment') ||
        textLower.includes('add appointment') ||
        textLower.includes('add an appointment') ||
        textLower.includes('make appointment') ||
        textLower.includes('make an appointment') ||
        textLower.includes('new appointment') ||
        textLower.includes('cancel appointment') ||
        textLower.includes('edit appointment') ||
        textLower.includes('reschedule appointment') ||
        textLower.includes('fix appointment') ||
        textLower.includes('reserve appointment') ||
        ((textLower.includes('book') ||
          textLower.includes('take') ||
          textLower.includes('schedule') ||
          textLower.includes('add') ||
          textLower.includes('make') ||
          textLower.includes('cancel') ||
          textLower.includes('change') ||
          textLower.includes('fix') ||
          textLower.includes('reserve')) &&
         (textLower.includes('appointment') || textLower.includes('doctor') || textLower.includes('clinic') || textLower.includes('hospital') || textLower.includes('consultation')))
      );

    if (wantsAppointmentBooking) {
      const refusalMsg =
        'Doctor appointments can only be booked or scheduled by your caregiver. Please contact your daughter Aisha (+971 50 123 4567) or your clinic to schedule an appointment.';
      setPermissionBlockedMessage(refusalMsg);
      setConnectionStatus('ready');
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: refusalMsg,
          source: 'text',
          timestamp: 'Just now',
        },
      ]);
      speakText(refusalMsg);
      return;
    }

    // Call unified backend endpoint
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          role: stateRef.current.role,
          userData: {
            waterCount: stateRef.current.waterCount,
            waterGoal: stateRef.current.waterGoal,
            caregivers: stateRef.current.caregivers,
            medications: stateRef.current.medications,
            appointments: stateRef.current.appointments,
            meals: stateRef.current.meals,
          },
        }),
      });

      const data = await response.json();
      const assistantText =
        data.answer || "I am right here with you, Mariam. How else may I assist you?";

      if (data.permissionBlocked) {
        setPermissionBlockedMessage(assistantText);
      }

      // Execute any returned toolCalls
      if (data.toolCalls && data.toolCalls.length > 0) {
        handleToolCalls(data.toolCalls);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: assistantText,
          source: 'text',
          timestamp: 'Just now',
        },
      ]);

      setConnectionStatus('responding');
      speakText(assistantText);
    } catch (err: any) {
      console.error('Failed to query Gemini assistant:', err);
      setConnectionStatus('error');
      setErrorMessage("Could not reach Gemini assistant. Please try again.");
    }
  };

  if (!isVoiceAssistantOpen) return null;

  const isMicActive = connectionStatus === 'listening';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col relative max-h-[92dvh] sm:max-h-[90vh] h-full overflow-hidden">
        {/* TOP BAR */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h2 id="assistant-title" className="text-xl font-bold text-slate-900 leading-tight">
                Gemini Assistant
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    connectionStatus === 'responding'
                      ? 'bg-emerald-500 animate-pulse'
                      : connectionStatus === 'listening'
                      ? 'bg-rose-500 animate-ping'
                      : connectionStatus === 'processing'
                      ? 'bg-amber-500 animate-pulse'
                      : connectionStatus === 'error'
                      ? 'bg-rose-600'
                      : 'bg-teal-500'
                  }`}
                />
                <span className="capitalize font-bold text-slate-700">
                  {connectionStatus === 'ready' && 'Ready (Voice & Text)'}
                  {connectionStatus === 'listening' && 'Listening to your voice...'}
                  {connectionStatus === 'processing' && 'Processing with Gemini...'}
                  {connectionStatus === 'responding' && 'Gemini is speaking...'}
                  {connectionStatus === 'error' && 'Connection Issue'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Toggle voice speech audio */}
            <button
              type="button"
              onClick={() => {
                setVoiceSpeechEnabled(!voiceSpeechEnabled);
                if (voiceSpeechEnabled && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                voiceSpeechEnabled
                  ? 'bg-teal-50 text-teal-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
              title={voiceSpeechEnabled ? 'Voice audio enabled' : 'Voice audio muted'}
            >
              {voiceSpeechEnabled ? (
                <Volume2 className="w-4 h-4 text-teal-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                handleStopAllAudio();
                closeVoiceAssistant();
              }}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close Assistant"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ERROR CARD */}
        {errorMessage && (
          <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-3 my-2 text-left animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-rose-900">{errorMessage}</p>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={handleStartVoice}
                    className="py-1 px-2.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                  >
                    Try Microphone Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="py-1 px-2.5 rounded-lg border border-rose-300 text-rose-800 font-bold text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAREGIVER PERMISSION REFUSAL GUARDRAIL CARD */}
        {permissionBlockedMessage && (
          <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 my-2 flex items-start gap-2.5 text-left animate-in zoom-in-95">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">
                Caregiver Permission Required
              </p>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                {permissionBlockedMessage}
              </p>
            </div>
          </div>
        )}

        {/* ACTION CONFIRMATION CARD (For Appointments, Calls, Emergency, Water, Medication, Reminders) */}
        {pendingConfirmation && (
          <div className="w-full bg-white border-2 border-teal-600 rounded-3xl p-4 my-2 text-left shadow-lg animate-in zoom-in-95">
            <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
              <Check className="w-4 h-4 text-teal-600" />
              <span>Confirmation Required</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {pendingConfirmation.title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {pendingConfirmation.description}
            </p>

            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <button
                type="button"
                onClick={() => setPendingConfirmation(null)}
                className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm"
              >
                {pendingConfirmation.cancelLabel || 'Cancel'}
              </button>

              <button
                type="button"
                onClick={pendingConfirmation.execute}
                className={`py-2.5 px-3 rounded-xl font-bold text-sm text-white shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-98 ${
                  pendingConfirmation.isEmergency
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-teal-700 hover:bg-teal-800'
                }`}
              >
                {pendingConfirmation.actionType === 'call' || pendingConfirmation.isEmergency ? (
                  <Phone className="w-4 h-4 fill-current" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{pendingConfirmation.confirmLabel}</span>
              </button>
            </div>
          </div>
        )}

        {/* CHAT STREAM (CONVERSATION HISTORY) */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto space-y-3 p-2 my-2 text-left overscroll-contain"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-teal-700 text-white font-medium'
                    : 'bg-slate-100 text-slate-900 border border-slate-200 font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 opacity-75">
                  {msg.role === 'user' ? (
                    <span>You ({msg.source})</span>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-teal-700 inline" />
                      <span>Gemini</span>
                    </>
                  )}
                </div>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* User speaking live transcript */}
          {userTranscript && (
            <div className="flex flex-col items-end">
              <div className="max-w-[85%] rounded-2xl p-3 bg-teal-50 border border-teal-300 text-teal-950 text-sm">
                <span className="text-[10px] font-bold text-teal-700 uppercase block mb-0.5">
                  Listening to you...
                </span>
                <p className="font-semibold italic">"{userTranscript}"</p>
              </div>
            </div>
          )}

          {/* Assistant speaking live transcript */}
          {assistantLiveTranscript && (
            <div className="flex flex-col items-start">
              <div className="max-w-[85%] rounded-2xl p-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Gemini Live Speaking:
                </span>
                <p className="font-semibold leading-relaxed">{assistantLiveTranscript}</p>
              </div>
            </div>
          )}
        </div>

        {/* PROMPT SPECIFIED TEST CHIPS (Tap to test exact phrases from user requirements) */}
        <div className="pt-2 pb-1 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Quick Tests (Voice or Text):
          </p>
          <div className="flex overflow-x-auto sm:flex-wrap gap-1.5 pb-1 no-scrollbar -mx-1 px-1 touch-pan-x">
            {[
              "What is my next appointment?",
              "What medicine do I need to take next?",
              "Remind me to call Salma tomorrow.",
              "How much water have I had today?",
              "When is my next doctor appointment?",
              "What's for dinner?",
              "Call my daughter.",
              "Change my medication",
              "Call an ambulance (998)",
            ].map((testPhrase) => (
              <button
                key={testPhrase}
                type="button"
                onClick={() => handleSendTextQuery(testPhrase)}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors border whitespace-nowrap sm:whitespace-normal shrink-0 sm:shrink active:scale-95 touch-manipulation ${
                  testPhrase.includes('Change')
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : testPhrase.includes('ambulance')
                    ? 'bg-rose-50 text-rose-900 border-rose-300'
                    : 'bg-slate-50 hover:bg-teal-50 text-slate-700 border-slate-200 hover:border-teal-300'
                }`}
              >
                "{testPhrase}"
              </button>
            ))}
          </div>
        </div>

        {/* INPUT CONTROLS: MICROPHONE BUTTON & TEXT INPUT BOX (BOTH SUPPORTED) */}
        <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
          {/* Main Controls Row */}
          <div className="flex items-center gap-2">
            {/* LARGE VOICE MICROPHONE BUTTON */}
            <button
              type="button"
              onClick={isMicActive ? handleStopAllAudio : handleStartVoice}
              className={`min-h-[50px] min-w-[50px] px-3.5 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md touch-manipulation ${
                isMicActive
                  ? 'bg-rose-500 text-white ring-4 ring-rose-200 scale-105 animate-pulse'
                  : connectionStatus === 'responding'
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                  : 'bg-teal-700 hover:bg-teal-800 text-white active:scale-95'
              }`}
              title={isMicActive ? 'Stop listening' : 'Tap to speak'}
            >
              <Mic className="w-6 h-6" />
            </button>

            {/* NORMAL TEXT CHAT INPUT (Requirement 3B) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendTextQuery();
              }}
              className="flex-1 flex items-center gap-2"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  isMicActive
                    ? 'Listening... or type here...'
                    : 'Type a question or reminder for Gemini...'
                }
                className="flex-1 min-h-[50px] px-4 rounded-2xl border border-slate-300 focus:outline-none focus:border-teal-600 text-base sm:text-sm font-medium bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="min-h-[50px] min-w-[50px] px-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm touch-manipulation"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Help hint */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Tap mic to speak, or type and press Send</span>
            {connectionStatus === 'responding' && (
              <button
                type="button"
                onClick={handleStopAllAudio}
                className="text-rose-600 font-bold hover:underline"
              >
                Interrupt & Mute
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
