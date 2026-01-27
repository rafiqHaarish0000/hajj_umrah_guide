export interface Facility {
  id: string;
  type: "entrance" | "toilet" | "wheelchair" | "zamzam" | "women";
  name: string;
  latitude: number;
  longitude: number;
  gateNumber?: string;
}

export const facilitiesData: Facility[] = [
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
    id: "toilet1",
    type: "toilet",
    name: "Public Toilets - Ground Floor",
    latitude: 21.423,
    longitude: 39.826,
  },
  {
    id: "wheelchair1",
    type: "wheelchair",
    name: "Wheelchair Accessible Path",
    latitude: 21.4228,
    longitude: 39.8258,
  },
  {
    id: "zamzam1",
    type: "zamzam",
    name: "Zamzam Water Station",
    latitude: 21.4232,
    longitude: 39.8263,
  },
  {
    id: "women1",
    type: "women",
    name: "Women Prayer Zone - Level 2",
    latitude: 21.4227,
    longitude: 39.8257,
  },
];
