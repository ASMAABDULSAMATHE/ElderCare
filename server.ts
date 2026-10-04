import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini AI Client with dynamic environment resolution
function getAiClient(): GoogleGenAI | null {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: currentKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint for Gemini API connectivity
app.get('/api/gemini/health', async (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    ok: true,
    hasApiKey: hasKey,
    models: ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.8-live'],
    status: hasKey ? 'connected' : 'no_key',
    timestamp: new Date().toISOString(),
  });
});

// REST fallback for AI Help
app.post('/api/ai-help', async (req, res) => {
  const { query, userData } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const qLower = String(query).toLowerCase().trim();

  // STRICT APPOINTMENT POLICY: Elderly users cannot take or book appointments through Gemini
  const isAskingToTakeAppointment =
    (qLower.includes('take') ||
      qLower.includes('book') ||
      qLower.includes('schedule') ||
      qLower.includes('add') ||
      qLower.includes('make') ||
      qLower.includes('cancel') ||
      qLower.includes('reschedule') ||
      qLower.includes('change') ||
      qLower.includes('reserve') ||
      qLower.includes('fix') ||
      qLower.includes('want an') ||
      qLower.includes('need an') ||
      qLower.includes('new')) &&
    (qLower.includes('appointment') ||
      qLower.includes('doctor') ||
      qLower.includes('clinic') ||
      qLower.includes('hospital') ||
      qLower.includes('physio') ||
      qLower.includes('consultation') ||
      qLower.includes('visit'));

  if (isAskingToTakeAppointment) {
    return res.json({
      answer: "Doctor appointments can only be booked or scheduled by your caregiver. Please contact your daughter Aisha (+971 50 123 4567) or your clinic directly to schedule an appointment.",
      permissionBlocked: true,
      reason: "Elderly patients cannot book or modify medical appointments through Gemini.",
    });
  }

  const aiClient = getAiClient();
  if (aiClient) {
    const systemInstruction = `You are a warm, gentle, and respectful Arabic-heritage AI companion for an elderly Emirati woman named Mariam Ahmed (age 74, Abu Dhabi, UAE).
Current schedule & data:
- Today's date: Tuesday, 29 September 2026
- Next medication: Metformin 500 mg at 8:00 AM (After food)
- Daily medications: Metformin 500mg (8 AM), Amlodipine 5mg (9 AM), Vitamin D3 (1 PM), Omeprazole (8 PM)
- Today's Water: ${userData?.waterCount || 6} / ${userData?.waterGoal || 8} glasses
- Next appointment: Dr. Sara Ahmed (Internal Medicine at NMC Royal Hospital Abu Dhabi at 6:00 PM)
- Primary Caregiver: Aisha Ahmed (Daughter, +971 50 123 4567)
- Emergency numbers: Police 999, Ambulance 998, Civil Defence 997

IMPORTANT RULES:
1. Speak in a calm, clear, comforting tone with large simple sentences (1 to 3 sentences maximum).
2. DO NOT diagnose medical conditions or give clinical advice.
3. For medical symptoms, gently urge her to call Dr. Sara Ahmed, daughter Aisha, or call 998 for ambulance if urgent.
4. CRITICAL APPOINTMENT POLICY: Elderly users are strictly forbidden from booking, taking, scheduling, or changing appointments through Gemini. If asked, inform them that only their caregiver (daughter Aisha +971 50 123 4567) or clinic can schedule appointments.`;

    const modelsToTry = [
      { name: 'gemini-3.1-flash-lite', config: { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } } },
      { name: 'gemini-flash-latest', config: {} },
      { name: 'gemini-3.8-flash', config: {} },
    ];

    for (const m of modelsToTry) {
      try {
        const response = await aiClient.models.generateContent({
          model: m.name,
          contents: query,
          config: {
            systemInstruction,
            temperature: 0.7,
            ...m.config,
          },
        });
        if (response?.text) {
          return res.json({ answer: response.text });
        }
      } catch (err: any) {
        console.warn(`ai-help error on ${m.name}:`, err?.message || err);
      }
    }
  }

  // Contextual fallback
  if (qLower.includes('when') && qLower.includes('appointment')) {
    return res.json({ answer: "Your next appointment is with Dr. Sara Ahmed today at 6:00 PM at NMC Royal Hospital Abu Dhabi." });
  }
  if (qLower.includes('medicine') || qLower.includes('medication')) {
    return res.json({ answer: "Your next medicine is Metformin 500 mg at 8:00 AM after food." });
  }
  if (qLower.includes('water')) {
    return res.json({ answer: `You have had ${userData?.waterCount || 6} out of ${userData?.waterGoal || 8} glasses of water today. Excellent progress!` });
  }

  res.json({ answer: "I am here to help you, Mariam. How else may I assist you today?" });
});

// Tool declarations for Gemini API and Gemini Live API
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_today_reminders',
    description: "Get all of today's reminders for Mariam in chronological order (medications, meals, water, workout, doctor appointment, and call reminder)",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_next_appointment',
    description: "Get Mariam's next upcoming doctor appointment with doctor name, clinic name, date, time, and address",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_all_appointments',
    description: "Get the complete list of scheduled doctor and medical appointments",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_medication_schedule',
    description: "Get today's complete medication schedule including dosages and food instructions (e.g. Metformin 500mg at 8 AM after food)",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'mark_medication_taken',
    description: "Request to mark a scheduled medication as taken",
    parameters: {
      type: Type.OBJECT,
      properties: {
        medicationName: {
          type: Type.STRING,
          description: "Name of the medication (e.g. Metformin, Amlodipine)",
        },
      },
      required: ['medicationName'],
    },
  },
  {
    name: 'get_water_progress',
    description: "Get today's current water hydration progress (glasses drank vs goal)",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'add_water',
    description: "Request to record drinking one or more glasses of water",
    parameters: {
      type: Type.OBJECT,
      properties: {
        count: {
          type: Type.NUMBER,
          description: "Number of glasses of water to add (default 1)",
        },
      },
    },
  },
  {
    name: 'get_meal_plan',
    description: "Get the complete dedicated meal plan (breakfast, lunch, afternoon snack, dinner, allergens, dietary preferences, and special food instructions)",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_today_meals',
    description: "Get today's meals summary (what's scheduled for breakfast, lunch, dinner, or snack)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        mealType: {
          type: Type.STRING,
          description: "Optional specific meal: breakfast, lunch, dinner, or snack",
        },
      },
    },
  },
  {
    name: 'get_workout_schedule',
    description: "Get today's gentle workout activity (e.g. Evening Walk) and completion status",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'mark_workout_complete',
    description: "Request to mark today's gentle workout activity as complete",
    parameters: {
      type: Type.OBJECT,
      properties: {
        workoutTitle: {
          type: Type.STRING,
          description: "Title of the workout, e.g. Evening Walk",
        },
      },
    },
  },
  {
    name: 'get_caregivers',
    description: "Get list of registered family caregivers, relationship, phone numbers, and primary status",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_loved_ones',
    description: "Get list of registered loved ones/children (such as daughter Aisha, son Omar, granddaughter Salma) and their phone numbers",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'call_contact',
    description: "Initiate an actual phone call to a caregiver or loved one by name. This will trigger a confirmation dialog in the app before dialing.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        contactName: {
          type: Type.STRING,
          description: "Name of the caregiver or loved one to call, e.g. Aisha, Omar, Salma, or 'daughter'",
        },
        relationship: {
          type: Type.STRING,
          description: "Relationship, e.g. Daughter, Son, Granddaughter",
        },
      },
      required: ['contactName'],
    },
  },
  {
    name: 'create_loved_one_reminder',
    description: "Schedule a reminder to call a child or loved one (e.g. Call my daughter every Sunday at 7 PM, or Call Ahmed tomorrow at 6 PM)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Name of the person to call (e.g. Aisha, Omar, Ahmed, or daughter/son)",
        },
        time: {
          type: Type.STRING,
          description: "Time of day (e.g. 7:00 PM, 6:00 PM, this evening)",
        },
        frequency: {
          type: Type.STRING,
          description: "Frequency or day: Daily, Every Sunday, Every Friday, Tomorrow, Tonight, or Once",
        },
      },
      required: ['name', 'time'],
    },
  },
  {
    name: 'get_loved_one_reminders',
    description: "Get the list of active call reminders to call kids/family members",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'open_places',
    description: "Open the Places I Visit directory and saved locations (doctor clinics, pharmacy, mosque, family)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          description: "Optional category filter",
        },
      },
    },
  },
  {
    name: 'start_emergency_call',
    description: "Request emergency assistance (Ambulance 998, Police 999, Civil Defence 997). The app will show an explicit emergency confirmation card before dialing.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        service: {
          type: Type.STRING,
          description: "Service requested: 'ambulance', 'police', 'civil_defence', '998', '999', or '997'",
        },
      },
      required: ['service'],
    },
  },
  {
    name: 'get_wellbeing_status',
    description: "Get Mariam's current recorded wellbeing status (Good, Okay, or Not well)",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'request_caregiver_action',
    description: "Invoked when a user asks to change protected data such as changing medication dosage, changing daily water goal, modifying protected meal data, or adding/deleting caregivers. The app will enforce permissions.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        actionType: {
          type: Type.STRING,
          description: "Type of action attempted: change_medication, change_water_goal, add_caregiver, edit_meal, edit_medical_info",
        },
        details: {
          type: Type.STRING,
          description: "Description of the request",
        },
      },
      required: ['actionType'],
    },
  },
  {
    name: 'get_saved_places',
    description: "Get all saved frequently visited places for Mariam (Home, Doctor clinic, Pharmacy, Mosque, Grocery store, Aisha's home)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        placeType: {
          type: Type.STRING,
          description: "Optional place type filter: home, doctor, pharmacy, mosque, grocery, family, clinic, hospital",
        },
      },
    },
  },
  {
    name: 'get_place_details',
    description: "Get specific details for a saved place such as address, phone number, opening hours, or notes (e.g. usual pharmacy or doctor clinic)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        placeNameOrType: {
          type: Type.STRING,
          description: "Name or type of place: 'usual pharmacy', 'doctor clinic', 'Al Manara', 'mosque', 'grocery'",
        },
      },
      required: ['placeNameOrType'],
    },
  },
  {
    name: 'get_place_accessibility',
    description: "Get accessibility features for a specific saved place (e.g. wheelchair access, elevator, ramp, disabled parking)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        placeName: {
          type: Type.STRING,
          description: "Name or type of place, e.g. 'hospital', 'doctor', 'NMC Royal', 'pharmacy', 'mosque'",
        },
      },
      required: ['placeName'],
    },
  },
  {
    name: 'add_saved_place',
    description: "Add a new saved place to Places I Visit. Requires confirmation.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Name of the place, e.g. Al Bateen Pharmacy, Community Center",
        },
        type: {
          type: Type.STRING,
          description: "Type of place: pharmacy, doctor, hospital, grocery, mosque, family, other",
        },
        address: {
          type: Type.STRING,
          description: "Address of the place",
        },
      },
      required: ['name', 'address'],
    },
  },
  {
    name: 'edit_saved_place',
    description: "Update the address or details of a saved place. Requires confirmation.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        placeName: {
          type: Type.STRING,
          description: "Name of the place to update, e.g. 'pharmacy', 'doctor'",
        },
        newAddress: {
          type: Type.STRING,
          description: "Updated address",
        },
      },
      required: ['placeName'],
    },
  },
  {
    name: 'delete_saved_place',
    description: "Remove a place from saved places (e.g. remove old grocery store). Requires confirmation.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        placeName: {
          type: Type.STRING,
          description: "Name of the place to remove, e.g. 'old grocery store', 'Lulu'",
        },
      },
      required: ['placeName'],
    },
  },
  {
    name: 'open_place_in_maps',
    description: "Open turn-by-turn directions or Google Maps location for a saved place (doctor, hospital, pharmacy)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        placeName: {
          type: Type.STRING,
          description: "Name of the place to open in Google Maps",
        },
      },
      required: ['placeName'],
    },
  },
  {
    name: 'get_food_scan_result',
    description: "Check the results of a scanned food item and its ingredients",
    parameters: {
      type: Type.OBJECT,
      properties: {
        productName: {
          type: Type.STRING,
          description: "Name of the food product",
        },
      },
    },
  },
  {
    name: 'check_ingredients_against_allergies',
    description: "Check a list of ingredients or food product against Mariam's stored allergies (Penicillin, Aspirin, Peanuts, Milk)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        ingredients: {
          type: Type.STRING,
          description: "Ingredient list or food description to analyze for allergens",
        },
      },
      required: ['ingredients'],
    },
  },
];

// Unified REST chat endpoint for Gemini text & voice-transcribed queries
app.post('/api/gemini/chat', async (req, res) => {
  const { message, role, userData } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const textLower = message.trim().toLowerCase();

  // 1. STRICT CAREGIVER PERMISSION REFUSAL PRE-CHECK (Voice & Text identical enforcement)
  if (
    textLower.includes('change my medication') ||
    textLower.includes('change medication') ||
    textLower.includes('change my dose') ||
    textLower.includes('change dosage') ||
    textLower.includes('edit medication')
  ) {
    return res.json({
      answer: "Medication changes can only be made by a caregiver. Please contact your caregiver to adjust your medicine.",
      permissionBlocked: true,
      reason: "Medication changes can only be made by a caregiver.",
      toolCalls: [],
    });
  }

  if (textLower.includes('change my water goal') || textLower.includes('change water goal')) {
    return res.json({
      answer: "Your water goal can only be changed by a caregiver.",
      permissionBlocked: true,
      reason: "Your water goal can only be changed by a caregiver.",
      toolCalls: [],
    });
  }

  if (
    textLower.includes('add a caregiver') ||
    textLower.includes('add another caregiver') ||
    textLower.includes('delete caregiver')
  ) {
    return res.json({
      answer: "Caregivers can only be added or modified through Caregiver Mode.",
      permissionBlocked: true,
      reason: "Caregivers can only be added through Caregiver Mode.",
      toolCalls: [],
    });
  }

  // 2. EMERGENCY IDENTIFICATION PRE-CHECK
  const cleaned = textLower.replace(/[.!?,]/g, '').trim();
  if (
    cleaned.includes('ambulance') ||
    cleaned.includes('call emergency') ||
    cleaned.includes('call 998') ||
    cleaned === 'i need help' ||
    cleaned.includes('call 999')
  ) {
    return res.json({
      answer: "I am preparing emergency assistance for you right now. Please confirm on the screen to dial 998.",
      emergency: true,
      toolCalls: [
        {
          id: `call-em-${Date.now()}`,
          name: 'start_emergency_call',
          args: { service: 'ambulance' },
        },
      ],
    });
  }

  // 3. STRICT APPOINTMENT POLICY PRE-CHECK (Elderly users cannot book, take, add, edit, or cancel appointments through Gemini)
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

  const wantsAppointmentModification =
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
      textLower.includes('appointment with doctor') ||
      textLower.includes('appointment with dr') ||
      textLower.includes('appointment tomorrow') ||
      textLower.includes('appointment next week') ||
      ((textLower.includes('book') ||
        textLower.includes('take') ||
        textLower.includes('schedule') ||
        textLower.includes('add') ||
        textLower.includes('make') ||
        textLower.includes('cancel') ||
        textLower.includes('edit') ||
        textLower.includes('change') ||
        textLower.includes('reschedule') ||
        textLower.includes('reserve') ||
        textLower.includes('fix') ||
        textLower.includes('want an') ||
        textLower.includes('need an')) &&
       (textLower.includes('appointment') ||
        textLower.includes('doctor') ||
        textLower.includes('clinic') ||
        textLower.includes('hospital') ||
        textLower.includes('physio') ||
        textLower.includes('consultation') ||
        textLower.includes('visit')))
    );

  if (wantsAppointmentModification) {
    return res.json({
      answer:
        "Doctor appointments can only be booked or scheduled by your caregiver. Please contact your daughter Aisha (+971 50 123 4567) or your clinic directly to schedule an appointment.",
      permissionBlocked: true,
      reason: "Elderly patients cannot book or modify medical appointments through Gemini.",
      toolCalls: [],
    });
  }

  const systemInstruction = `You are the AI companion for ElderCare, assisting an elderly Emirati senior named Mariam Ahmed (age 74, Abu Dhabi, UAE).
Her family and schedule:
- Primary caregiver / Daughter: Aisha Ahmed (+971 50 123 4567)
- Son: Omar Ahmed (+971 55 987 6543)
- Granddaughter: Salma (+971 50 246 8102)
- Today's date: Tuesday, 29 September 2026
- Next medication: Metformin 500 mg at 8:00 AM (After food)
- Daily medications: Metformin 500mg (8:00 AM), Amlodipine 5mg (9:00 AM), Vitamin D3 (1:00 PM), Omeprazole (8:00 PM)
- Today's meals:
  * Breakfast (8:30 AM): Warm oatmeal with banana slices & herbal mint tea
  * Lunch (1:30 PM): Grilled sea bass with saffron basmati rice & steamed zucchini
  * Afternoon Snack (5:00 PM): 2 Khalas dates & roasted pumpkin & sunflower seeds with chamomile tea (100% nut-free)
  * Dinner (8:30 PM): Yellow lentil shorba soup with Arabic flatbread & dairy-free cucumber mint dip (100% dairy-free)
- Today's Water: ${userData?.waterCount ?? 6} / ${userData?.waterGoal ?? 8} glasses
- Next appointment: Dr. Sara Ahmed (Internal Medicine) at NMC Royal Hospital Abu Dhabi today at 6:00 PM
- Upcoming appointments:
  * Dr. Sara Ahmed: Today Tuesday, 29 Sep at 6:00 PM (NMC Royal Hospital Abu Dhabi)
  * Dr. Tariq Mansoor (Ophthalmology): Monday, 5 October at 10:30 AM (Cleveland Clinic Abu Dhabi)
  * Dr. Fatima Al Nuaimi (Physiotherapy): Wednesday, 7 October at 4:00 PM (Amana Healthcare Rehabilitation)
- Loved ones call reminders:
  * Call Aisha (Daughter) every evening at 7:00 PM
  * Call Omar (Son) every Sunday at 6:00 PM
  * Call Salma (Granddaughter) every Friday at 5:00 PM
- Saved Places I Visit:
  * Home: Villa 14, Al Bateen, Abu Dhabi (Step-free entrance, anti-slip tiles)
  * Usual Pharmacy: Al Manara Pharmacy, Corniche Road West, Al Bateen, Abu Dhabi (+971 2 666 4321, 24 Hours Open, 1.2 km away, Step-free entrance with ramp, drive-through window)
  * Usual Doctor Clinic: Dr. Sara Ahmed Clinic at NMC Royal Hospital Abu Dhabi (16th St, Khalifa City, +971 2 633 2255, 14 km away, Wheelchair-accessible entrance, accessible elevator, dedicated parking, wheelchair assistance on arrival)
  * Mosque: Sheikh Zayed Grand Mosque (Al Rawdah, Abu Dhabi, 12 km, electric club cars, free wheelchairs)
  * Old Grocery Store: Lulu Hypermarket Khalidiyah (Zayed The First St, Al Khalidiyah, 3.5 km)
  * Family: Daughter Aisha's Home (Sector 34, Al Karamah, 4.8 km)
- Stored Medical & Food Allergies:
  * Penicillin, Aspirin, Peanuts, Milk
- Food Scanner & Safety:
  * Can check scanned food items or ingredient lists against Mariam's stored allergies (Penicillin, Aspirin, Peanuts, Milk).
  * If food contains Milk, Peanuts, or other allergens, clearly warn Mariam!
- Emergency numbers: Ambulance 998, Police 999, Civil Defence 997

RESPONSE STYLE & TONE GUIDELINES FOR ELDERLY USERS:
1. Keep responses SHORT, CLEAR, FRIENDLY, and easy to understand (1 to 3 sentences).
2. Avoid medical jargon or clinical advice.
3. CRITICAL APPOINTMENT POLICY (ABSOLUTELY STRICT): Elderly users (Mariam) are strictly NOT allowed to take, book, add, edit, or cancel doctor appointments through Gemini. If the user asks in any way to take or book an appointment, politely refuse and explain: "Doctor appointments can only be booked or scheduled by your caregiver. Please contact your daughter Aisha (+971 50 123 4567) or your clinic to schedule an appointment." You MAY answer questions about when their next appointment is using get_next_appointment.
4. When asked to call someone (e.g. "Call my daughter", "Call Aisha"), use the call_contact function with contactName="Aisha Ahmed", relationship="Daughter".
5. When asked to remind to call someone (e.g. "Remind me to call my daughter tomorrow at 7 PM"), invoke create_loved_one_reminder. If time is missing, ask politely what time to remind them.
6. For places questions (e.g. "Where is my usual pharmacy?", "How do I get to my doctor?", "Does my usual hospital have wheelchair access?"), provide the exact stored place info and call get_place_details, open_place_in_maps, or get_place_accessibility.
7. For food allergy questions (e.g. "Does this food contain anything I'm allergic to?"), check against Penicillin, Aspirin, Peanuts, and Milk.
8. CAREGIVER PERMISSIONS: If the user asks to change medications, water goal, medical profile, or caregiver lists, refuse gently and explain that a caregiver is required.`;

  const aiClient = getAiClient();
  if (aiClient) {
    try {
      let response: any = null;
      const modelsToTry = [
        { name: 'gemini-3.1-flash-lite', config: { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } } },
        { name: 'gemini-flash-latest', config: {} },
        { name: 'gemini-3.8-flash', config: {} },
      ];

      for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
        try {
          const item = modelsToTry[attempt];
          response = await aiClient.models.generateContent({
            model: item.name,
            contents: message,
            config: {
              systemInstruction,
              temperature: 0.6,
              tools: [{ functionDeclarations: toolDeclarations }],
              ...item.config,
            },
          });
          if (response) break;
        } catch (genErr: any) {
          console.warn(`Gemini attempt ${attempt + 1} (${modelsToTry[attempt].name}) error:`, genErr?.message || genErr);
          if (attempt < modelsToTry.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        }
      }

      if (response) {
        const functionCalls = response.functionCalls || [];
        let text = response.text || '';

        // If the model generated tool calls without explanatory text, synthesize a friendly response
        if (!text.trim() && functionCalls.length > 0) {
          const firstCall = functionCalls[0];
          const callName = firstCall.name;
          const callArgs: any = firstCall.args || {};

          if (callName === 'get_today_meals' || callName === 'get_meal_plan') {
            const type = (callArgs.mealType || '').toLowerCase();
            if (type.includes('dinner')) {
              text = "For dinner at 8:30 PM, you have yellow lentil shorba soup with warm Arabic flatbread and cucumber yogurt.";
            } else if (type.includes('lunch')) {
              text = "For lunch at 1:30 PM, you have grilled sea bass with saffron basmati rice and steamed zucchini.";
            } else if (type.includes('snack')) {
              text = "For your afternoon snack at 5:00 PM, you have 2 Khalas dates, walnuts, and chamomile tea.";
            } else if (type.includes('breakfast')) {
              text = "For breakfast at 8:30 AM, you have warm oatmeal with banana slices and herbal mint tea.";
            } else {
              text = "Today's meal plan includes warm oatmeal for breakfast, grilled sea bass for lunch, dates for snack, and lentil shorba for dinner.";
            }
          } else if (callName === 'get_next_appointment') {
            text = "Your next appointment is with Dr. Sara Ahmed today at 6:00 PM at NMC Royal Hospital Abu Dhabi.";
          } else if (callName === 'get_all_appointments') {
            text = "You have an appointment today at 6:00 PM with Dr. Sara Ahmed, and another on Monday, 5 October at 10:30 AM with Dr. Tariq Mansoor.";
          } else if (callName === 'get_medication_schedule') {
            text = "Your next medicine is Metformin 500 mg at 8:00 AM. It should be taken after food.";
          } else if (callName === 'get_water_progress') {
            text = `You have had ${userData?.waterCount ?? 6} out of ${userData?.waterGoal ?? 8} glasses of water today. You are doing very well!`;
          } else if (callName === 'create_loved_one_reminder') {
            text = `I have set a reminder to call ${callArgs.name || 'your loved one'} ${callArgs.frequency || 'tomorrow'} at ${callArgs.time || '7:00 PM'}.`;
          } else if (callName === 'call_contact') {
            text = `I am preparing a phone call to ${callArgs.contactName || 'your loved one'}. Please confirm below to connect.`;
          } else if (callName === 'start_emergency_call') {
            text = "I am preparing emergency assistance for you right now. Please confirm on the screen to dial 998.";
          } else if (callName === 'get_today_reminders') {
            text = "Today you have Metformin at 8 AM, breakfast at 8:30 AM, lunch at 1:30 PM, your doctor appointment at 6 PM, and calling Aisha at 7 PM.";
          }
        }

        return res.json({
          answer: text,
          toolCalls: functionCalls.map((fc: any, index: number) => ({
            id: fc.id || `tc-${Date.now()}-${index}`,
            name: fc.name,
            args: fc.args || {},
          })),
        });
      }
    } catch (err: any) {
      console.error('Gemini chat error:', err?.message || err);
    }
  }

  // Graceful fallback matching user questions directly if API key is not present or offline
  // APPOINTMENT REFUSAL MUST BE FIRST IN FALLBACK TO PREVENT MISINTERPRETATION
  if (
    textLower.includes('take appointment') ||
    textLower.includes('book appointment') ||
    textLower.includes('schedule appointment') ||
    textLower.includes('add appointment') ||
    textLower.includes('make appointment') ||
    ((textLower.includes('book') ||
      textLower.includes('schedule') ||
      textLower.includes('take') ||
      textLower.includes('add') ||
      textLower.includes('make') ||
      textLower.includes('change') ||
      textLower.includes('cancel')) &&
      (textLower.includes('appointment') || textLower.includes('doctor') || textLower.includes('clinic')))
  ) {
    return res.json({
      answer:
        "Doctor appointments can only be booked or scheduled by your caregiver. Please contact your daughter Aisha (+971 50 123 4567) or your clinic directly to schedule an appointment.",
      permissionBlocked: true,
      reason: "Elderly patients cannot book or modify medical appointments through Gemini.",
      toolCalls: [],
    });
  }

  if (textLower.includes('next appointment') || textLower.includes('upcoming appointment')) {
    return res.json({
      answer: "Your next appointment is with Dr. Sara Ahmed today at 6:00 PM at NMC Royal Hospital Abu Dhabi.",
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'get_next_appointment', args: {} }],
    });
  }
  if (textLower.includes('medicine') || textLower.includes('medication')) {
    return res.json({
      answer: "Your next medicine is Metformin 500 mg at 8:00 AM. It should be taken after food.",
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'get_medication_schedule', args: {} }],
    });
  }
  if (textLower.includes('dinner')) {
    return res.json({
      answer: "For dinner at 8:30 PM, you have yellow lentil shorba soup with warm Arabic flatbread and dairy-free cucumber mint dip.",
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'get_today_meals', args: { mealType: 'dinner' } }],
    });
  }
  if (textLower.includes('water')) {
    return res.json({
      answer: `You have had ${userData?.waterCount ?? 6} out of ${userData?.waterGoal ?? 8} glasses of water today. You are doing very well!`,
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'get_water_progress', args: {} }],
    });
  }
  if (textLower.includes('remind') || textLower.includes('remind me to call')) {
    const timeMatch = textLower.match(/(\d+)\s*(pm|am)/i);
    const timeStr = timeMatch ? `${timeMatch[1]}:00 ${timeMatch[2].toUpperCase()}` : '7:00 PM';
    let target = 'Aisha';
    if (textLower.includes('son') || textLower.includes('omar')) target = 'Omar';
    else if (textLower.includes('salma')) target = 'Salma';
    else if (textLower.includes('kids') || textLower.includes('children')) target = 'your kids';

    let freq = 'Tomorrow';
    if (textLower.includes('sunday')) freq = 'Every Sunday';
    else if (textLower.includes('friday')) freq = 'Every Friday';
    else if (textLower.includes('tonight') || textLower.includes('this evening')) freq = 'Tonight';

    return res.json({
      answer: `I have set a reminder to call ${target} ${freq.toLowerCase()} at ${timeStr}.`,
      toolCalls: [
        {
          id: `tc-${Date.now()}`,
          name: 'create_loved_one_reminder',
          args: { name: target, time: timeStr, frequency: freq },
        },
      ],
    });
  }
  if (textLower.includes('call my daughter') || textLower.includes('call aisha') || textLower.includes('call my son') || textLower.includes('call')) {
    let contact = 'Aisha Ahmed';
    let rel = 'Daughter';
    let phone = '+971 50 123 4567';
    if (textLower.includes('son') || textLower.includes('omar')) {
      contact = 'Omar Ahmed';
      rel = 'Son';
      phone = '+971 55 987 6543';
    } else if (textLower.includes('salma')) {
      contact = 'Salma';
      rel = 'Granddaughter';
      phone = '+971 50 246 8102';
    }
    return res.json({
      answer: `I am preparing to call your ${rel.toLowerCase()} ${contact} at ${phone}. Please confirm below.`,
      toolCalls: [{ id: `tc-${Date.now()}`, name: 'call_contact', args: { contactName: contact, relationship: rel } }],
    });
  }

  // 3. PLACES I VISIT QUERIES
  if (textLower.includes('usual pharmacy') || textLower.includes('my pharmacy') || textLower.includes('where is my pharmacy')) {
    return res.json({
      answer: "Your usual pharmacy is Al Manara Pharmacy on Corniche Road West in Al Bateen (+971 2 666 4321). It is 1.2 km away and open 24 hours.",
      toolCalls: [
        {
          id: `tc-${Date.now()}`,
          name: 'get_place_details',
          args: { placeNameOrType: 'usual pharmacy' },
        },
      ],
    });
  }

  if (
    textLower.includes('get to my doctor') ||
    textLower.includes("open my doctor's location") ||
    textLower.includes('open doctor location') ||
    textLower.includes('directions to doctor')
  ) {
    return res.json({
      answer: "Your doctor's clinic is Dr. Sara Ahmed at NMC Royal Hospital Abu Dhabi (16th St, Khalifa City). I have opened the location in Google Maps for you.",
      toolCalls: [
        {
          id: `tc-${Date.now()}`,
          name: 'open_place_in_maps',
          args: { placeName: 'Dr. Sara Ahmed Clinic (NMC Royal)' },
        },
      ],
    });
  }

  if (
    textLower.includes('wheelchair') ||
    textLower.includes('hospital have wheelchair access') ||
    textLower.includes('accessibility')
  ) {
    return res.json({
      answer: "Yes, Dr. Sara Ahmed's clinic at NMC Royal Hospital Abu Dhabi has full wheelchair accessibility, including ramp entrances, step-free access, elevators, dedicated disabled parking, and wheelchair escort at the entrance.",
      toolCalls: [
        {
          id: `tc-${Date.now()}`,
          name: 'get_place_accessibility',
          args: { placeName: 'NMC Royal Hospital' },
        },
      ],
    });
  }

  if (textLower.includes('open my pharmacy on the map') || textLower.includes('pharmacy on the map')) {
    return res.json({
      answer: "Opening Al Manara Pharmacy on the map for you now.",
      toolCalls: [
        {
          id: `tc-${Date.now()}`,
          name: 'open_place_in_maps',
          args: { placeName: 'Al Manara Pharmacy' },
        },
      ],
    });
  }

  if (textLower.includes('add') && (textLower.includes('pharmacy to my usual places') || textLower.includes('pharmacy to my places') || textLower.includes('new pharmacy'))) {
    return res.json({
      answer: "I have prepared adding this pharmacy to your saved places in Places I Visit. Please confirm on the screen to save it.",
      toolCalls: [
        {
          id: `tc-${Date.now()}`,
          name: 'add_saved_place',
          args: {
            name: 'New Community Pharmacy',
            type: 'pharmacy',
            address: 'Al Bateen, Abu Dhabi, UAE',
          },
        },
      ],
    });
  }

  if (textLower.includes('change my pharmacy address') || textLower.includes('change pharmacy address') || textLower.includes("change my doctor's address")) {
    const isDoc = textLower.includes('doctor');
    return res.json({
      answer: `I have prepared updating the address for your ${isDoc ? 'doctor clinic' : 'pharmacy'}. Please confirm the new address below.`,
      toolCalls: [
        {
          id: `tc-${Date.now()}`,
          name: 'edit_saved_place',
          args: {
            placeName: isDoc ? 'doctor' : 'pharmacy',
            newAddress: isDoc ? 'NMC Royal Hospital, Khalifa City, Abu Dhabi' : 'Corniche Road West, Al Bateen, Abu Dhabi',
          },
        },
      ],
    });
  }

  if (textLower.includes('remove my old grocery store') || textLower.includes('remove old grocery') || textLower.includes('delete old grocery')) {
    return res.json({
      answer: "I have prepared removing the old grocery store (Lulu Hypermarket Khalidiyah) from your saved places. Please confirm below to remove it.",
      toolCalls: [
        {
          id: `tc-${Date.now()}`,
          name: 'delete_saved_place',
          args: {
            placeName: 'Lulu Hypermarket Khalidiyah',
          },
        },
      ],
    });
  }

  // 4. FOOD SCANNER & ALLERGY CHECK QUERIES
  if (textLower.includes('food contain anything') || textLower.includes('allergic to') || textLower.includes('check this food')) {
    return res.json({
      answer: "Your saved allergies are Penicillin, Aspirin, Peanuts, and Milk. If the food packaging ingredients contain any milk, dairy, or peanuts, I will alert you immediately. Always check the packaging label.",
      toolCalls: [
        {
          id: `tc-${Date.now()}`,
          name: 'check_ingredients_against_allergies',
          args: {
            ingredients: textLower,
          },
        },
      ],
    });
  }

  res.json({
    answer: "I am right here with you, Mariam. How else may I assist you today?",
    toolCalls: [],
  });
});

// Dedicated Food Scanner OCR & ingredient parsing endpoint
app.post('/api/gemini/scan-food', async (req, res) => {
  const { barcode, rawText, userAllergies = ['Penicillin', 'Aspirin', 'Peanuts', 'Milk'] } = req.body;

  try {
    const aiClient = getAiClient();
    if (aiClient && rawText) {
      const prompt = `Analyze this food ingredient label text against the user's allergies: ${JSON.stringify(userAllergies)}.
Ingredients text: "${rawText}"
Return JSON formatted with:
{
  "productName": "string",
  "brand": "string",
  "ingredients": ["array of ingredient strings"],
  "hasAllergen": boolean,
  "allergyMatches": [{"allergen": "string", "matchedIngredient": "string", "isConfirmedMatch": boolean}]
}`;
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });
      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    // Default fast local parser
    const matches: any[] = [];
    const textToCheck = (rawText || barcode || '').toLowerCase();
    userAllergies.forEach((allergy: string) => {
      if (textToCheck.includes(allergy.toLowerCase())) {
        matches.push({
          allergen: allergy,
          matchedIngredient: allergy,
          isConfirmedMatch: true,
        });
      }
    });

    res.json({
      productName: 'Scanned Food Item',
      brand: 'Packaged Food',
      ingredients: rawText ? rawText.split(',') : ['Ingredients inspected'],
      hasAllergen: matches.length > 0,
      allergyMatches: matches,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to scan food ingredients', details: err?.message });
  }
});

async function startServer() {
  const server = http.createServer(app);

  // Set up WebSocket server for Gemini Live at /live
  const wss = new WebSocketServer({ server, path: '/live' });

  // Handle server-level errors to prevent unhandled error event throws
  wss.on('error', (err) => {
    console.error('WebSocketServer error:', err);
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('Client connected to /live');

    let liveSession: any = null;
    let isLiveConnected = false;
    let isClientClosed = false;

    // Attach clientWs error listener immediately
    clientWs.on('error', (err) => {
      console.warn('Client WebSocket warning:', err.message);
    });

    const safeSend = (payload: any) => {
      if (!isClientClosed && clientWs.readyState === WebSocket.OPEN) {
        try {
          clientWs.send(JSON.stringify(payload));
        } catch (e) {
          console.warn('safeSend failed:', e);
        }
      }
    };

    clientWs.on('message', async (data: Buffer | string) => {
      try {
        const msg = JSON.parse(data.toString());

        // 1. Initial setup message from client
        if (msg.type === 'init') {
          const clientUserData = msg.userData;

          const systemInstruction = `You are the voice assistant for ElderCare, an elderly companion web app for an Emirati grandmother named Mariam Ahmed (age 74, Abu Dhabi, UAE).
You communicate via real-time spoken voice and bidirectional audio through the Gemini Live API.

Mariam's schedule:
- Date: Tuesday, 29 September
- Next medication: Metformin 500 mg at 8:00 AM (After food)
- Water: ${clientUserData?.waterCount || 6} / ${clientUserData?.waterGoal || 8} glasses
- Doctor Appointment: Dr. Sara Ahmed (Internal Medicine) at 6:00 PM at NMC Royal Hospital Abu Dhabi
- Primary Caregiver: Aisha Ahmed (Daughter, +971 50 123 4567)
- Loved one: Salma (Granddaughter, +971 50 246 8102)
- Emergency numbers: Ambulance 998, Police 999, Civil Defence 997

CORE CONVERSATION BEHAVIOR:
1. Speak in a calm, clear, respectful, and friendly tone. Keep responses short and easy to understand (1 to 3 sentences).
2. When the user asks about schedule, medicines, appointments, water, or caregivers, ALWAYS use your tools (get_today_reminders, get_medication_schedule, get_next_appointment, get_water_progress, get_caregivers).
3. CAREGIVER PERMISSION & APPOINTMENT RULES (EXTREMELY STRICT):
   - Mariam (Elderly user) CANNOT change medications, change the water goal, add caregivers, or book/schedule/take appointments.
   - If user asks in any way to "book appointment", "take appointment", "schedule appointment", "add appointment", "make appointment", or book a doctor/clinic visit: Refuse politely and say: "Doctor appointments can only be booked or scheduled by your caregiver. Please ask your daughter Aisha (+971 50 123 4567) or your clinic to schedule an appointment." NEVER take or book appointments.
   - If user asks to "change medication" or "change dosage": Call request_caregiver_action(actionType="change_medication") or say: "Medication changes can only be made by a caregiver."
   - If user asks to "change my water goal": Call request_caregiver_action(actionType="change_water_goal") or say: "Your water goal can only be changed by a caregiver."
   - If user asks to "add a caregiver": Call request_caregiver_action(actionType="add_caregiver") or say: "Caregivers can only be added through Caregiver Mode."
4. ACTIONS & CONFIRMATIONS:
   - For phone calls (e.g. "Call Aisha", "Call my daughter"): Call the tool call_contact(contactName="Aisha Ahmed", relationship="Daughter"). Tell the user you are preparing the call.
   - For emergency calls (e.g. "I need help", "Call an ambulance", "Call 998"): Call start_emergency_call(service="ambulance").
   - For marking medication or adding water: Call mark_medication_taken or add_water.
5. MEDICAL SAFETY:
   - Do not diagnose illnesses. For health symptoms, urge contacting Dr. Sara Ahmed, daughter Aisha, or calling 998.`;

          const aiClient = getAiClient();
          if (aiClient) {
            try {
              console.log('Connecting to Gemini Live API with model gemini-3.8-live...');
              liveSession = await aiClient.live.connect({
                model: 'gemini-3.8-live',
                config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                  },
                  systemInstruction,
                  tools: [{ functionDeclarations: toolDeclarations }],
                },
                callbacks: {
                  onopen: () => {
                    console.log('Gemini Live session opened');
                    isLiveConnected = true;
                    safeSend({ type: 'connected', model: 'gemini-3.8-live' });
                  },
                  onmessage: (serverMsg: LiveServerMessage) => {
                    // Check for audio
                    const parts = serverMsg.serverContent?.modelTurn?.parts;
                    if (parts && parts.length > 0) {
                      for (const part of parts) {
                        if (part.inlineData?.data) {
                          safeSend({
                            type: 'audio',
                            data: part.inlineData.data, // 24kHz raw PCM
                          });
                        }
                        if (part.text) {
                          safeSend({
                            type: 'assistant_text',
                            text: part.text,
                          });
                        }
                      }
                    }

                    // Check for user interruption (barge-in)
                    if (serverMsg.serverContent?.interrupted) {
                      console.log('Gemini Live interrupted by user');
                      safeSend({ type: 'interrupted' });
                    }

                    // Turn complete
                    if (serverMsg.serverContent?.turnComplete) {
                      safeSend({ type: 'turn_complete' });
                    }

                    // Function / Tool Call from Gemini Live
                    if (serverMsg.toolCall?.functionCalls) {
                      console.log('Gemini Live tool call received:', serverMsg.toolCall.functionCalls);
                      safeSend({
                        type: 'tool_call',
                        functionCalls: serverMsg.toolCall.functionCalls,
                      });
                    }
                  },
                  onerror: (err: any) => {
                    console.warn('Gemini Live session warning:', err?.message || err);
                    safeSend({
                      type: 'error',
                      error: err?.message || 'Gemini Live session error',
                    });
                  },
                  onclose: (e: any) => {
                    console.log('Gemini Live session closed');
                    isLiveConnected = false;
                    safeSend({ type: 'session_close' });
                  },
                },
              });

              isLiveConnected = true;
              safeSend({ type: 'ready', model: 'gemini-3.8-live' });
            } catch (err: any) {
              console.warn('Failed to connect to Gemini Live API:', err?.message || err);
              safeSend({
                type: 'error',
                error: 'Could not connect to Gemini Live service. Please try again.',
                fallback: true,
              });
            }
          } else {
            safeSend({
              type: 'ready',
              model: 'gemini-assisted-mode',
              note: 'No API key configured, running in local speech mode',
            });
          }
        }

        // 2. Incoming real-time audio chunk from client microphone (16kHz PCM little-endian)
        else if (msg.type === 'audio' && msg.data) {
          if (liveSession && isLiveConnected) {
            try {
              liveSession.sendRealtimeInput({
                audio: {
                  data: msg.data,
                  mimeType: 'audio/pcm;rate=16000',
                },
              });
            } catch (e) {
              console.warn('Error sending audio to Gemini Live:', e);
            }
          }
        }

        // 3. User transcribed text (if speech recognized on client)
        else if (msg.type === 'user_text' && msg.text) {
          if (liveSession && isLiveConnected) {
            try {
              liveSession.sendClientContent({
                turns: [
                  {
                    role: 'user',
                    parts: [{ text: msg.text }],
                  },
                ],
                turnComplete: true,
              });
            } catch (e) {
              console.warn('Error sending text to Gemini Live:', e);
            }
          }
        }

        // 4. Client executed tool and returned function response
        else if (msg.type === 'tool_response' && msg.functionResponses) {
          if (liveSession && isLiveConnected) {
            console.log('Sending tool response to Gemini Live:', msg.functionResponses);
            try {
              liveSession.sendToolResponse({
                functionResponses: msg.functionResponses,
              });
            } catch (e) {
              console.warn('Error sending tool response:', e);
            }
          }
        }
      } catch (e: any) {
        console.warn('WebSocket message handling error:', e?.message || e);
      }
    });

    clientWs.on('close', () => {
      isClientClosed = true;
      console.log('Client disconnected from /live');
      if (liveSession) {
        try {
          liveSession.close();
        } catch (e) {
          // Ignore close errors
        }
        liveSession = null;
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`ElderCare running on http://localhost:${PORT}`);
  });
}

startServer();
