export type TicketCategory = 'crop' | 'product' | 'order' | 'finance'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface SupportTicket {
  id: string
  user_id: string
  farmer_name: string
  farmer_phone: string
  category: TicketCategory
  subject: string
  description: string
  status: TicketStatus
  priority: 'normal' | 'urgent'
  photos?: string[]
  created_at: string
  updated_at: string
}

export interface SupportTicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  sender_name: string
  sender_role: 'farmer' | 'expert' | 'system'
  message: string
  attachments?: string[]
  created_at: string
}

export interface CommunityPost {
  id: string
  author_id: string
  author_name: string
  author_district: string
  crop_tag: string
  title: string
  content: string
  photos?: string[]
  upvotes_count: number
  upvoted_by: string[]
  reported_by: string[]
  comments_count: number
  created_at: string
}

export interface CommunityComment {
  id: string
  post_id: string
  author_id: string
  author_name: string
  comment: string
  created_at: string
}

export interface SupportFAQ {
  id: string
  category: 'general' | 'crop' | 'product' | 'order' | 'finance'
  question_en: string
  question_hi: string
  answer_en: string
  answer_hi: string
}

export const SEEDED_FAQS: SupportFAQ[] = [
  {
    id: 'faq_1',
    category: 'crop',
    question_en: 'How can I treat yellowing of wheat leaves in early tillering?',
    question_hi: 'शुरुआती कल्ले फूटने के समय गेहूं की पत्तियां पीली पड़ने पर क्या करें?',
    answer_en: 'Yellowing in early tillering is most frequently caused by Zinc deficiency or water-logging. Spray 0.5% Zinc Sulphate (21%) + 1% Urea solution in 150L water per acre during clear weather.',
    answer_hi: 'शुरुआती कल्ले फूटते समय पीलापन अक्सर जिंक की कमी या खेत में पानी भरने के कारण होता है। 0.5% जिंक सल्फेट (21%) + 1% यूरिया का 150 लीटर पानी में प्रति एकड़ छिड़काव करें।',
  },
  {
    id: 'faq_2',
    category: 'order',
    question_en: 'How do I track my seed and fertilizer delivery?',
    question_hi: 'मैं अपने बीज और खाद के ऑर्डर को कैसे ट्रैक कर सकता हूँ?',
    answer_en: 'Go to Orders in your profile or top navigation. Click on any active order to view the real-time event timeline (Placed, Packed, Shipped, Delivered) and delivery agent contact.',
    answer_hi: 'प्रोफाइल या टॉप नेविगेशन में "Orders" पर जाएं। किसी भी एक्टिव ऑर्डर पर क्लिक करके उसका लाइव स्टेटस (Placed, Packed, Shipped, Delivered) देखें।',
  },
  {
    id: 'faq_3',
    category: 'finance',
    question_en: 'What documents are required to apply for Kisan Credit Card (KCC)?',
    question_hi: 'किसान क्रेडिट कार्ड (KCC) बनवाने के लिए कौन-कौन से दस्तावेज चाहिए?',
    answer_en: 'You need Aadhaar card, PAN card, updated Land Jamabandi / Fard / Record of Rights, crop sowing certificate from Patwari, and 2 passport photos. Kisan OS generates an auto-filled application checklist under /finance.',
    answer_hi: 'आधार कार्ड, पैन कार्ड, जमीन की नवीनतम जमाबंदी/फर्द, पटवारी से फसल गिरदावरी प्रमाण पत्र और 2 पासपोर्ट फोटो चाहिए। /finance में आपको पूरी चेकलिस्ट मिल जाएगी।',
  },
  {
    id: 'faq_4',
    category: 'product',
    question_en: 'Are the bio-fertilizers and bio-pesticides certified organic?',
    question_hi: 'क्या जैविक खाद और कीटनाशक पूरी तरह प्रमाणित हैं?',
    answer_en: 'Yes, all products tagged as Organic in the Kisan OS marketplace are certified under NPOP (National Programme for Organic Production) and Jaivik Bharat with verified batch test reports.',
    answer_hi: 'हाँ, किसान ओएस पर "जैविक" टैग वाले सभी उत्पाद NPOP और जैविक भारत द्वारा प्रमाणित हैं और उनकी गुणवत्ता जांची गई है।',
  },
  {
    id: 'faq_5',
    category: 'crop',
    question_en: 'How does the AI Plant Doctor leaf scan work?',
    question_hi: 'एआई प्लांट डॉक्टर से पत्ती की फोटो स्कैन कैसे काम करता है?',
    answer_en: 'Upload a clear, focused photo of the affected plant leaf under /crop-care. Our computer vision model scans for 40+ common fungal, bacterial, and pest symptoms and suggests approved treatments.',
    answer_hi: '/crop-care पेज पर जाकर प्रभावित पत्ती की साफ फोटो अपलोड करें। हमारा एआई मॉडल 40 से अधिक फफूंद व कीट रोगों की पहचान कर तुरंत समाधान सुझाता है।',
  },
]

export const SEEDED_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_001',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    farmer_name: 'Rajesh Kumar',
    farmer_phone: '+91 98765 43210',
    category: 'crop',
    subject: 'Aphid infestation on mustard leaves',
    description: 'Noticing dense colonies of green aphids sucking sap on flowering mustard branches. Need immediate organic or low-toxicity spray recommendation.',
    status: 'in_progress',
    priority: 'urgent',
    photos: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6910a514?auto=format&fit=crop&w=800&q=80',
    ],
    created_at: '2026-09-27T10:15:00Z',
    updated_at: '2026-09-27T11:00:00Z',
  },
  {
    id: 'tkt_002',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    farmer_name: 'Rajesh Kumar',
    farmer_phone: '+91 98765 43210',
    category: 'finance',
    subject: 'PMFBY crop insurance claim verification help',
    description: 'Hailstorm damaged standing wheat crop in my sector. Need guidance on how to submit the 72-hour intimation on the insurance portal.',
    status: 'resolved',
    priority: 'normal',
    photos: [],
    created_at: '2026-09-20T14:30:00Z',
    updated_at: '2026-09-21T09:40:00Z',
  },
]

export const SEEDED_TICKET_MESSAGES: Record<string, SupportTicketMessage[]> = {
  tkt_001: [
    {
      id: 'msg_101',
      ticket_id: 'tkt_001',
      sender_id: 'usr_OTg3NjU0MzIxMA00',
      sender_name: 'Rajesh Kumar',
      sender_role: 'farmer',
      message: 'Noticing dense colonies of green aphids sucking sap on flowering mustard branches. Need immediate organic or low-toxicity spray recommendation.',
      created_at: '2026-09-27T10:15:00Z',
    },
    {
      id: 'msg_102',
      ticket_id: 'tkt_001',
      sender_id: 'expert_agri_01',
      sender_name: 'Dr. Virender Sharma (KVK Agronomist)',
      sender_role: 'expert',
      message: 'Namaste Rajesh ji. Based on the photo, this is early mustard aphid (Lipaphis erysimi). Since flowering has started, do not spray harsh chemicals that harm honeybees. Spray Neem Oil 10,000 PPM @ 3ml per litre, or Imidacloprid 17.8 SL @ 0.5ml per litre in the late afternoon after 4 PM.',
      created_at: '2026-09-27T10:45:00Z',
    },
  ],
  tkt_002: [
    {
      id: 'msg_201',
      ticket_id: 'tkt_002',
      sender_id: 'usr_OTg3NjU0MzIxMA00',
      sender_name: 'Rajesh Kumar',
      sender_role: 'farmer',
      message: 'Hailstorm damaged standing wheat crop in my sector. Need guidance on how to submit the 72-hour intimation on the insurance portal.',
      created_at: '2026-09-20T14:30:00Z',
    },
    {
      id: 'msg_202',
      ticket_id: 'tkt_002',
      sender_id: 'expert_fin_01',
      sender_name: 'Sunita Malik (Agri Credit & Insurance Desk)',
      sender_role: 'expert',
      message: 'Hello Rajesh ji, we have initiated your intimation directly with the District Agriculture Officer. You will receive an SMS survey schedule shortly. Please keep your KCC policy number handy.',
      created_at: '2026-09-21T09:40:00Z',
    },
  ],
}

export const SEEDED_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    author_id: 'usr_baljit_haryana',
    author_name: 'Sardar Baljit Singh',
    author_district: 'Karnal, Haryana',
    crop_tag: 'Wheat HD-3086',
    title: 'Zero tillage sowing results after 21 days - Excellent germination!',
    content: 'Used happy seeder directly after paddy harvest without burning any stubble. Soil moisture was retained and tillering is very uniform. Saved nearly ₹2,800 per acre in diesel and field preparation costs!',
    photos: [
      'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
    ],
    upvotes_count: 24,
    upvoted_by: [],
    reported_by: [],
    comments_count: 5,
    created_at: '2026-09-26T08:30:00Z',
  },
  {
    id: 'post_2',
    author_id: 'usr_manish_punjab',
    author_name: 'Manish Choudhary',
    author_district: 'Hisar, Haryana',
    crop_tag: 'Mustard Pusa Bold',
    title: 'Yellow sticky traps working wonders against whitefly and aphids',
    content: 'Installed 12 yellow sticky sheets per acre across the mustard perimeter. Within 3 days, insect pressure dropped noticeably without any chemical spray.',
    photos: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6910a514?auto=format&fit=crop&w=800&q=80',
    ],
    upvotes_count: 18,
    upvoted_by: [],
    reported_by: [],
    comments_count: 3,
    created_at: '2026-09-27T12:00:00Z',
  },
  {
    id: 'post_3',
    author_id: 'usr_gurmeet_punjab',
    author_name: 'Gurmeet Gill',
    author_district: 'Ludhiana, Punjab',
    crop_tag: 'Paddy Basmati 1121',
    title: 'Direct Seeded Rice (DSR) water conservation experience this Kharif',
    content: 'Reduced irrigation cycles by almost 35% using laser leveling + tensiometer guided watering. Yield was comparable to traditional puddle transplanting with zero nursery labour cost.',
    photos: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    ],
    upvotes_count: 31,
    upvoted_by: [],
    reported_by: [],
    comments_count: 8,
    created_at: '2026-09-25T15:20:00Z',
  },
]

export const SEEDED_COMMUNITY_COMMENTS: Record<string, CommunityComment[]> = {
  post_1: [
    {
      id: 'com_1',
      post_id: 'post_1',
      author_id: 'usr_harpreet',
      author_name: 'Harpreet Dhillon',
      comment: 'Did you apply any extra nitrogen dose at sowing to decompose the leftover straw?',
      created_at: '2026-09-26T09:10:00Z',
    },
    {
      id: 'com_2',
      post_id: 'post_1',
      author_id: 'usr_baljit_haryana',
      author_name: 'Sardar Baljit Singh',
      comment: 'Yes brother, added 25kg extra urea per acre with first irrigation to balance the carbon-nitrogen ratio. Result is very good.',
      created_at: '2026-09-26T10:00:00Z',
    },
  ],
  post_2: [
    {
      id: 'com_3',
      post_id: 'post_2',
      author_id: 'usr_vikram',
      author_name: 'Vikram Shekhawat',
      comment: 'Where did you buy the weather-proof sheets? Local ones get ruined by dew.',
      created_at: '2026-09-27T13:15:00Z',
    },
  ],
}
