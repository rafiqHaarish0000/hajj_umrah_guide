export interface Facility {
  id: string;
  type:
    | "entrance"
    | "toilet"
    | "wheelchair"
    | "zamzam"
    | "women"
    | "restaurant"
    | "hospital"
    | "bus";
  name: string;
  latitude: number;
  longitude: number;
  gateNumber?: string;
}

export const facilitiesData: Facility[] = [
  // Masjid al-Haram Entrances
  {
    id: "gate1",
    type: "entrance",
    name: "King Fahd Gate",
    gateNumber: "1",
    latitude: 21.4225,
    longitude: 39.8262,
  },
  {
    id: "gate79",
    type: "entrance",
    name: "King Abdul Aziz Gate",
    gateNumber: "79",
    latitude: 21.4235,
    longitude: 39.8255,
  },
  {
    id: "gate5",
    type: "entrance",
    name: "Al-Salam Gate",
    gateNumber: "5",
    latitude: 21.4218,
    longitude: 39.8268,
  },
  {
    id: "gate11",
    type: "entrance",
    name: "Umrah Gate",
    gateNumber: "11",
    latitude: 21.4242,
    longitude: 39.8271,
  },
  {
    id: "gate15",
    type: "entrance",
    name: "Al-Fath Gate",
    gateNumber: "15",
    latitude: 21.4228,
    longitude: 39.8275,
  },

  // Toilets
  {
    id: "toilet1",
    type: "toilet",
    name: "Public Toilets - Ground Floor",
    latitude: 21.423,
    longitude: 39.826,
  },
  {
    id: "toilet2",
    type: "toilet",
    name: "Public Toilets - First Floor",
    latitude: 21.4233,
    longitude: 39.8264,
  },
  {
    id: "toilet3",
    type: "toilet",
    name: "Public Toilets - Masa Area",
    latitude: 21.4221,
    longitude: 39.8253,
  },

  // Wheelchair Accessible Paths
  {
    id: "wheelchair1",
    type: "wheelchair",
    name: "Wheelchair Accessible Path - South",
    latitude: 21.4228,
    longitude: 39.8258,
  },
  {
    id: "wheelchair2",
    type: "wheelchair",
    name: "Wheelchair Accessible Path - North",
    latitude: 21.4238,
    longitude: 39.8267,
  },
  {
    id: "wheelchair3",
    type: "wheelchair",
    name: "Wheelchair Ramp - King Fahd Gate",
    latitude: 21.4226,
    longitude: 39.8261,
  },

  // Zamzam Water Stations
  {
    id: "zamzam1",
    type: "zamzam",
    name: "Zamzam Water Station - Main",
    latitude: 21.4232,
    longitude: 39.8263,
  },
  {
    id: "zamzam2",
    type: "zamzam",
    name: "Zamzam Water Station - East",
    latitude: 21.4229,
    longitude: 39.8269,
  },
  {
    id: "zamzam3",
    type: "zamzam",
    name: "Zamzam Water Station - West",
    latitude: 21.4224,
    longitude: 39.8256,
  },

  // Women Prayer Zones
  {
    id: "women1",
    type: "women",
    name: "Women Prayer Zone - Level 2",
    latitude: 21.4227,
    longitude: 39.8257,
  },
  {
    id: "women2",
    type: "women",
    name: "Women Prayer Zone - Level 3",
    latitude: 21.4231,
    longitude: 39.8265,
  },

  // Restaurants - Makkah
  {
    id: "restaurant1",
    type: "restaurant",
    name: "Al Baik - Ajyad Street",
    latitude: 21.4205,
    longitude: 39.8283,
  },
  {
    id: "restaurant2",
    type: "restaurant",
    name: "Hardee's - Ibrahim Al Khalil",
    latitude: 21.4198,
    longitude: 39.8275,
  },
  {
    id: "restaurant3",
    type: "restaurant",
    name: "McDonald's - Abraj Al Bait",
    latitude: 21.4187,
    longitude: 39.8262,
  },
  {
    id: "restaurant4",
    type: "restaurant",
    name: "KFC - Clock Tower",
    latitude: 21.4191,
    longitude: 39.8258,
  },
  {
    id: "restaurant5",
    type: "restaurant",
    name: "Nando's - Haram Area",
    latitude: 21.4213,
    longitude: 39.8247,
  },
  {
    id: "restaurant6",
    type: "restaurant",
    name: "Subway - Ajyad",
    latitude: 21.4202,
    longitude: 39.8279,
  },
  {
    id: "restaurant7",
    type: "restaurant",
    name: "Al Tazaj - King Fahd Road",
    latitude: 21.4176,
    longitude: 39.8241,
  },
  {
    id: "restaurant8",
    type: "restaurant",
    name: "Kudu - Ibrahim Al Khalil",
    latitude: 21.4195,
    longitude: 39.8268,
  },

  // Hospitals - Makkah
  {
    id: "hospital1",
    type: "hospital",
    name: "Ajyad Emergency Hospital",
    latitude: 21.4163,
    longitude: 39.8298,
  },
  {
    id: "hospital2",
    type: "hospital",
    name: "King Abdullah Medical City",
    latitude: 21.4052,
    longitude: 39.8156,
  },
  {
    id: "hospital3",
    type: "hospital",
    name: "Hera General Hospital",
    latitude: 21.4387,
    longitude: 39.8542,
  },
  {
    id: "hospital4",
    type: "hospital",
    name: "Noor Specialist Hospital",
    latitude: 21.4285,
    longitude: 39.8178,
  },
  {
    id: "hospital5",
    type: "hospital",
    name: "Al Noor Specialist Hospital - Makkah",
    latitude: 21.3891,
    longitude: 39.8579,
  },
  {
    id: "hospital6",
    type: "hospital",
    name: "Maternity and Children Hospital",
    latitude: 21.4125,
    longitude: 39.8215,
  },

  // Bus Stops - Makkah
  {
    id: "bus1",
    type: "bus",
    name: "Haram Bus Station - King Abdul Aziz Gate",
    latitude: 21.4251,
    longitude: 39.8243,
  },
  {
    id: "bus2",
    type: "bus",
    name: "Bus Stop - Ajyad Street",
    latitude: 21.4182,
    longitude: 39.8291,
  },
  {
    id: "bus3",
    type: "bus",
    name: "Central Bus Terminal - Makkah",
    latitude: 21.3968,
    longitude: 39.8521,
  },
  {
    id: "bus4",
    type: "bus",
    name: "Bus Stop - Ibrahim Al Khalil",
    latitude: 21.4172,
    longitude: 39.8235,
  },
  {
    id: "bus5",
    type: "bus",
    name: "Arafat Buses Terminal",
    latitude: 21.3542,
    longitude: 39.9845,
  },
  {
    id: "bus6",
    type: "bus",
    name: "Mina Bus Station",
    latitude: 21.4118,
    longitude: 39.8897,
  },
  {
    id: "bus7",
    type: "bus",
    name: "Muzdalifah Bus Stop",
    latitude: 21.3951,
    longitude: 39.9384,
  },
  {
    id: "bus8",
    type: "bus",
    name: "Bus Stop - Clock Tower",
    latitude: 21.4189,
    longitude: 39.8254,
  },

  // Madinah - Masjid an-Nabawi Entrances
  {
    id: "madinah_gate1",
    type: "entrance",
    name: "Bab Al-Salam - Madinah",
    gateNumber: "25",
    latitude: 24.4672,
    longitude: 39.6111,
  },
  {
    id: "madinah_gate2",
    type: "entrance",
    name: "Bab Jibreel - Madinah",
    gateNumber: "1",
    latitude: 24.4681,
    longitude: 39.6103,
  },

  // Restaurants - Madinah
  {
    id: "madinah_restaurant1",
    type: "restaurant",
    name: "Al Baik - King Fahd Road Madinah",
    latitude: 24.4701,
    longitude: 39.6092,
  },
  {
    id: "madinah_restaurant2",
    type: "restaurant",
    name: "McDonald's - Al Madinah Road",
    latitude: 24.4695,
    longitude: 39.6125,
  },
  {
    id: "madinah_restaurant3",
    type: "restaurant",
    name: "KFC - Quba Road",
    latitude: 24.4658,
    longitude: 39.6138,
  },

  // Hospitals - Madinah
  {
    id: "madinah_hospital1",
    type: "hospital",
    name: "King Fahd Hospital - Madinah",
    latitude: 24.4893,
    longitude: 39.5842,
  },
  {
    id: "madinah_hospital2",
    type: "hospital",
    name: "Ohud Hospital",
    latitude: 24.5123,
    longitude: 39.6185,
  },
  {
    id: "madinah_hospital3",
    type: "hospital",
    name: "Madinah Maternity Hospital",
    latitude: 24.4756,
    longitude: 39.5968,
  },

  // Bus Stops - Madinah
  {
    id: "madinah_bus1",
    type: "bus",
    name: "Haram Bus Station - Madinah",
    latitude: 24.4689,
    longitude: 39.6089,
  },
  {
    id: "madinah_bus2",
    type: "bus",
    name: "Quba Mosque Bus Stop",
    latitude: 24.4421,
    longitude: 39.6196,
  },
  {
    id: "madinah_bus3",
    type: "bus",
    name: "Central Bus Terminal - Madinah",
    latitude: 24.4512,
    longitude: 39.5987,
  },
];
