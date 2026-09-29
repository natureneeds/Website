export interface StateData {
  state: string
  districts: {
    name: string
    villages: string[]
  }[]
}

export const SEEDED_STATES: StateData[] = [
  {
    state: 'Punjab',
    districts: [
      {
        name: 'Ludhiana',
        villages: ['Samrala', 'Khanna', 'Payal', 'Jagraon', 'Raikot'],
      },
      {
        name: 'Amritsar',
        villages: ['Ajnala', 'Majitha', 'Baba Bakala', 'Jandiala Guru', 'Attari'],
      },
      {
        name: 'Bathinda',
        villages: ['Rampura Phul', 'Talwandi Sabo', 'Goniana', 'Maur', 'Bhagta Bhaika'],
      },
      {
        name: 'Jalandhar',
        villages: ['Nakodar', 'Phillaur', 'Shahkot', 'Kartarpur', 'Goraya'],
      },
    ],
  },
  {
    state: 'Haryana',
    districts: [
      {
        name: 'Karnal',
        villages: ['Assandh', 'Gharaunda', 'Indri', 'Nilokheri', 'Taraori'],
      },
      {
        name: 'Kurukshetra',
        villages: ['Thanesar', 'Pehowa', 'Shahbad', 'Ladwa', 'Babain'],
      },
      {
        name: 'Sirsa',
        villages: ['Dabwali', 'Ellenabad', 'Rania', 'Kalanwali', 'Nathusari Chopta'],
      },
      {
        name: 'Hisar',
        villages: ['Hansi', 'Barwala', 'Narnaund', 'Uklana', 'Adampur'],
      },
    ],
  },
  {
    state: 'Madhya Pradesh',
    districts: [
      {
        name: 'Indore',
        villages: ['Depalpur', 'Sanwer', 'Mhow', 'Hatod', 'Rau'],
      },
      {
        name: 'Ujjain',
        villages: ['Nagda', 'Khachrod', 'Tarana', 'Mahidpur', 'Badnagar'],
      },
      {
        name: 'Sehore',
        villages: ['Ashta', 'Ichhawar', 'Nasrullaganj', 'Budhni', 'Shyampur'],
      },
      {
        name: 'Hoshangabad',
        villages: ['Itarsi', 'Pipariya', 'Sohagpur', 'Babai', 'Seoni Malwa'],
      },
    ],
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      {
        name: 'Meerut',
        villages: ['Mawana', 'Sardhana', 'Hastinapur', 'Daurala', 'Parikshitgarh'],
      },
      {
        name: 'Varanasi',
        villages: ['Pindra', 'Raja Talab', 'Cholapur', 'Araziline', 'Rohania'],
      },
      {
        name: 'Aligarh',
        villages: ['Atrauli', 'Khair', 'Iglas', 'Gabhana', 'Jawan'],
      },
    ],
  },
  {
    state: 'Rajasthan',
    districts: [
      {
        name: 'Sri Ganganagar',
        villages: ['Suratgarh', 'Anupgarh', 'Padampur', 'Sadulshahar', 'Karanpur'],
      },
      {
        name: 'Kota',
        villages: ['Sangod', 'Ramganj Mandi', 'Digod', 'Ladpura', 'Itawa'],
      },
    ],
  },
  {
    state: 'Maharashtra',
    districts: [
      {
        name: 'Nashik',
        villages: ['Niphad', 'Sinnar', 'Yeola', 'Dindori', 'Kalwan'],
      },
      {
        name: 'Pune',
        villages: ['Baramati', 'Shirur', 'Junnar', 'Indapur', 'Daund'],
      },
    ],
  },
]

export const SOIL_TYPES = [
  'Alluvial Soil (जलोढ़ मिट्टी)',
  'Black / Regur Soil (काली मिट्टी)',
  'Red & Yellow Soil (लाल-पीली मिट्टी)',
  'Sandy Loam Soil (बलुई दोमट)',
  'Clay Loam Soil (चिकनी दोमट)',
]

export const WATER_SOURCES = [
  'Canal Irrigation (नहरी सिंचाई)',
  'Borewell / Tube-well (नलकूप / ट्यूबवेल)',
  'Micro Drip System (ड्रिप सिंचाई)',
  'Rainfed / Monsoonal (वर्षा आधारित)',
  'Farm Pond / Recharge Well (खेत तालाब)',
]

export const CROP_OPTIONS = [
  { id: 'wheat', label: 'Wheat (गेहूँ)' },
  { id: 'rice', label: 'Basmati Rice (बासमती धान)' },
  { id: 'mustard', label: 'Mustard (सरसों)' },
  { id: 'cotton', label: 'Bt Cotton (कपास)' },
  { id: 'soybean', label: 'Soybean (सोयाबीन)' },
  { id: 'chana', label: 'Chickpea (चना)' },
  { id: 'sugarcane', label: 'Sugarcane (गन्ना)' },
  { id: 'maize', label: 'Maize / Corn (मक्का)' },
  { id: 'potato', label: 'Potato (आलू)' },
  { id: 'onion', label: 'Onion (प्याज)' },
]
