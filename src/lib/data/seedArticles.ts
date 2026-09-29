export interface KnowledgeArticle {
  id: string
  title: string
  title_hi: string
  category: 'disease_control' | 'nutrient_management' | 'water_saving' | 'soil_health' | 'harvest_tips'
  crop_tag: 'Wheat' | 'Mustard' | 'Rice' | 'Cotton' | 'Potato' | 'General'
  read_time_minutes: number
  summary: string
  summary_hi: string
  content: string
  content_hi: string
  action_steps: string[]
  action_steps_hi: string[]
}

export const SEEDED_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art_1',
    title: 'Yellow Rust Identification & Timely Control in Wheat',
    title_hi: 'गेहूँ में पीला रतुआ (हल्दी रोग) की पहचान और त्वरित रोकथाम',
    category: 'disease_control',
    crop_tag: 'Wheat',
    read_time_minutes: 3,
    summary: 'Recognize linear yellow powder pustules on wheat leaves during foggy winter mornings and apply verified triazole fungicides.',
    summary_hi: 'सर्दियों की सुबह गेहूँ की पत्तियों पर पीले पाउडर की धारियां पहचानें और समय पर ट्रायजोल फफूंदनाशक का छिड़काव करें।',
    content: `Yellow rust (Puccinia striiformis) thrives during cool, humid periods (10°C to 15°C) from December through February. It spreads via windborne spores and can reduce grain yields by up to 40% if left unmanaged during the flag leaf stage.

Scout fields twice a week, especially in shaded, damp depressions. At the very first sign of yellow stripes, apply Nativo (Tebuconazole + Trifloxystrobin) or Saaf (Carbendazim + Mancozeb) with a flat-fan nozzle for complete foliage coverage.`,
    content_hi: `पीला रतुआ (पक्सीनिया स्ट्राइफॉर्मिस) 10 से 15 डिग्री सेल्सियस तापमान और उच्च नमी में बहुत तेजी से फैलता है। यदि झंडा पत्ती अवस्था में इस पर ध्यान न दिया जाए तो पैदावार में 40% तक की भारी गिरावट हो सकती है।

खेत के छायादार कोनों में नियमित निगरानी रखें। पीली धारियां दिखाई देते ही नेटिवो या साफ फफूंदनाशक का तुरंत छिड़काव करें।`,
    action_steps: [
      'Scout lower leaves in shaded boundaries for yellow powdery stripes.',
      'Spray Nativo at 0.8g/L or Saaf at 2g/L within 48 hours of detection.',
      'Use 150-200 liters of clean water per acre with a power or battery knapsack sprayer.',
    ],
    action_steps_hi: [
      'खेत की मेड़ों और छायादार हिस्सों में पत्तियों की जांच करें।',
      'लक्षण दिखते ही नेटिवो (0.8 ग्राम/लीटर) या साफ (2 ग्राम/लीटर) का छिड़काव करें।',
      'प्रति एकड़ 150-200 लीटर साफ पानी का उपयोग करें।',
    ],
  },
  {
    id: 'art_2',
    title: 'Optimizing Nitrogen: Granular Urea vs Nano Urea Foliar Spray',
    title_hi: 'नाइट्रोजन प्रबंधन: दानेदार यूरिया बनाम नैनो यूरिया का सही उपयोग',
    category: 'nutrient_management',
    crop_tag: 'General',
    read_time_minutes: 3,
    summary: 'Learn how foliar Nano Urea cuts chemical leaching by 50% while delivering rapid vegetative greening within 48 hours.',
    summary_hi: 'जानें कैसे नैनो यूरिया का छिड़काव रासायनिक बर्बादी को 50% तक कम करके 48 घंटे में पौधों को हरा-भरा करता है।',
    content: `Conventional granular urea applied on soil suffers from 50-70% nitrogen losses due to ammonia volatilization and nitrate leaching into groundwater. 

By replacing the second top-dressing split with 500ml of IFFCO Nano Urea per acre, nitrogen nanoparticles penetrate directly through leaf stomatal pores with over 80% absorption efficiency. Spray during early morning or late afternoon when stomata are fully open.`,
    content_hi: `मिट्टी में डाला जाने वाला दानेदार यूरिया 50% से अधिक पानी में बहकर या गैस बनकर बर्बाद हो जाता है। 

दूसरी बार यूरिया डालने के स्थान पर प्रति एकड़ 500 मिली नैनो यूरिया का पर्णीय छिड़काव करने से 80% से अधिक नाइट्रोजन सीधे पत्तियों द्वारा अवशोषित हो जाती है।`,
    action_steps: [
      'Apply 50% of nitrogen as basal neem coated urea during field preparation.',
      'Spray Nano Urea (4ml per liter water) at active tillering/branching stage.',
      'Ensure leaves are dry and avoid spraying during peak afternoon heat.',
    ],
    action_steps_hi: [
      'बिजाई के समय 50% दानेदार नीम लेपित यूरिया का उपयोग करें।',
      'शाखाएं निकलते समय 4 मिली प्रति लीटर की दर से नैनो यूरिया का छिड़काव करें।',
      'छिड़काव सुबह या शाम के समय ही करें जब धूप तेज न हो।',
    ],
  },
  {
    id: 'art_3',
    title: 'Crown Root Initiation (CRI): The Critical First Wheat Irrigation',
    title_hi: 'ताज जड़ अवस्था (CRI): गेहूँ की सबसे महत्वपूर्ण पहली सिंचाई',
    category: 'water_saving',
    crop_tag: 'Wheat',
    read_time_minutes: 2,
    summary: 'Irrigating at 20-22 days after sowing triggers secondary root crown development, directly determining tillering count.',
    summary_hi: 'बिजाई के 20-22 दिन बाद पहली हल्की सिंचाई करने से कल्ले फूटने वाली जड़ों का संपूर्ण विकास होता है।',
    content: `The Crown Root Initiation (CRI) stage occurs between 20 to 25 days after wheat sowing. Secondary roots developing at this junction anchor the plant and feed tillers. 

Delaying this irrigation by even a week can cause tillers to abort, reducing yield by 5 to 7 quintals per acre. Keep the irrigation light to prevent waterlogging.`,
    content_hi: `गेहूँ में बिजाई के 20 से 25 दिन बाद ताज जड़ें निकलती हैं जो पौधे को मजबूती देती हैं और अधिक कल्ले बनाने में मदद करती हैं।

इस सिंचाई में एक हफ्ते की भी देरी होने पर प्रति एकड़ 5 से 7 क्विंटल पैदावार कम हो सकती है। पानी अधिक न भरें, हल्की सिंचाई करें।`,
    action_steps: [
      'Mark 21 days from sowing on your Kisan OS crop calendar.',
      'Apply a light 4-5cm irrigation without submerging plant crowns.',
      'Follow up with first urea top-dressing once soil moisture allows foot entry.',
    ],
    action_steps_hi: [
      'बिजाई की तारीख से 21वें दिन का रिमाइंडर कैलेंडर में सेट करें।',
      'हल्की सिंचाई (4-5 सेमी) करें जिससे पौधे पूरी तरह न डूबें।',
      'पैर टिकने लायक नमी होने पर पहला यूरिया डालें।',
    ],
  },
  {
    id: 'art_4',
    title: 'Mustard Aphid (Mahua) Integrated Pest Management',
    title_hi: 'सरसों में चेपा/माहू कीट की एकीकृत एवं जैविक रोकथाम',
    category: 'disease_control',
    crop_tag: 'Mustard',
    read_time_minutes: 3,
    summary: 'Monitor cloudy winter weather when green/black aphid colonies multiply rapidly on flowering shoots.',
    summary_hi: 'बादल वाले मौसम में सरसों की टहनियों पर चिपके हुए माहू कीट की पहचान करें और सही समय पर रोक लगाएं।',
    content: `Mustard aphids (Lipaphis erysimi) suck sap from tender shoots, inflorescences, and young pods. In cloudy, humid weather, a small colony can envelope entire flowering twigs in 3 days.

Install yellow sticky traps (10 per acre) when flowering commences. If 10% of plants show aphid colonies, apply bio-organic Neem oil (10,000 ppm at 2ml/L) or selective systemic insecticides before pods harden.`,
    content_hi: `सरसों का माहू कीट कोमल फूलों और फलियों का रस चूस लेता है जिससे फलियां खाली रह जाती हैं।

खेत में प्रति एकड़ 10 पीले चिपचिपे ट्रैप लगाएं। प्रकोप दिखने पर नीम का तेल या अनुशंसित कीटनाशक का छिड़काव करें।`,
    action_steps: [
      'Erect yellow sticky traps at canopy level.',
      'Scout 20 plants across the field diagonally twice a week.',
      'Spray early morning before honeybee foraging begins to protect pollinators.',
    ],
    action_steps_hi: [
      'खेत में पीले स्टिकी ट्रैप पौधे की ऊंचाई पर लगाएं।',
      'सप्ताह में दो बार खेत के बीच में जाकर 20 पौधों की जांच करें।',
      'मधुमक्खियों की सुरक्षा के लिए सुबह जल्दी छिड़काव करें।',
    ],
  },
  {
    id: 'art_5',
    title: 'Direct Seeded Rice (DSR): 35% Water & Fuel Reduction Guide',
    title_hi: 'धान की सीधी बिजाई (DSR): 35% पानी और डीजल बचाने की विधि',
    category: 'water_saving',
    crop_tag: 'Rice',
    read_time_minutes: 4,
    summary: 'Eliminate nursery transplantation and puddling to preserve groundwater and save ₹3,500/acre in labor costs.',
    summary_hi: 'बिना कद्दू किए और बिना नर्सरी तैयार किए सीधे बीज बोकर भूजल बचाएं और प्रति एकड़ ₹3,500 की बचत करें।',
    content: `Direct Seeded Rice (DSR) with laser leveling and specialized seed drills avoids traditional puddling. Puddling degrades soil structure and consumes 1,200 liters of water per kilogram of rice.

With DSR, tar-watter (optimal moisture) sowing paired with pre-emergence weed control (Pendimethalin within 24 hours) yields results on par with conventional transplanted rice while finishing 10 days earlier.`,
    content_hi: `लेजर लैंड लेवलर से समतल किए गए खेत में 'तर-वत्तर' स्थिति में सीधी बिजाई करने से कद्दू करने का झंझट खत्म होता है।

बिजाई के 24 घंटे के भीतर पेंडीमेथालिन खरपतवारनाशक का छिड़काव करने से घास नहीं उगती और धान 10 दिन पहले पकता है।`,
    action_steps: [
      'Ensure perfect laser leveling to prevent water ponding.',
      'Drill treated seed at 8-10 kg/acre at 2-3cm depth.',
      'Spray pre-emergence herbicide immediately after sowing in adequate soil moisture.',
    ],
    action_steps_hi: [
      'खेत को लेजर लेवलर से पूरी तरह समतल करें।',
      'उपचारित बीज को 2-3 सेमी गहराई पर 8-10 किलो प्रति एकड़ की दर से बोएं।',
      'बिजाई के तुरंत बाद खरपतवारनाशक का छिड़काव अवश्य करें।',
    ],
  },
  {
    id: 'art_6',
    title: 'Cotton Pink Bollworm Surveillance & Pheromone Trapping',
    title_hi: 'कपास में गुलाबी सुंडी की निगरानी और फेरोमोन ट्रैप प्रबंधन',
    category: 'disease_control',
    crop_tag: 'Cotton',
    read_time_minutes: 3,
    summary: 'Detect early rosette flowers and employ mass-trapping lures to protect bolls before larval entry.',
    summary_hi: 'गुलाबी फूल (रोसेट फ्लावर) की पहचान करें और सुंडी के टिंडे में घुसने से पहले फेरोमोन ट्रैप से रोकें।',
    content: `Pink bollworm (Pectinophora gossypiella) has developed resistance in certain regions. The female moth lays eggs in squaring bracts, and newly hatched larvae burrow inside unopened bolls within 30 minutes, where external sprays cannot reach them.

Install 5 Gossyplure pheromone traps per acre at 45 days after sowing. Check trap catches weekly. If catches exceed 8 moths/trap for 3 consecutive nights, immediately deploy Coragen or biological release of Trichogramma.`,
    content_hi: `गुलाबी सुंडी का लार्वा अंडे से निकलने के 30 मिनट के भीतर टिंडे के अंदर घुस जाता है, जहां कोई भी कीटनाशक नहीं पहुंच पाता।

बिजाई के 45 दिन बाद प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं। लगातार 3 रात 8 से अधिक पतंगे आने पर कोराजन का छिड़काव करें।`,
    action_steps: [
      'Inspect flower buds for twisted "rosette" petals.',
      'Replace pheromone lure septa every 25 days.',
      'Destroy fallen squares and infested shed bolls to break lifecycle.',
    ],
    action_steps_hi: [
      'गुलाब जैसे मुड़े हुए फूलों को तोड़कर नष्ट करें।',
      'फेरोमोन ट्रैप की टिकिया (ल्यूर) को 25 दिन में बदलें।',
      'जमीन पर गिरे हुए संक्रमित टिंडों को इकट्ठा करके दबा दें।',
    ],
  },
  {
    id: 'art_7',
    title: 'How to Read Your Soil Health Card & Balance NPK Ratios',
    title_hi: 'मृदा स्वास्थ्य कार्ड (Soil Health Card) कैसे समझें और खाद संतुलित करें',
    category: 'soil_health',
    crop_tag: 'General',
    read_time_minutes: 3,
    summary: 'Stop over-applying DAP; learn how Organic Carbon (OC) and soil pH dictate fertilizer absorption efficiency.',
    summary_hi: 'अंधाधुंध डीएपी डालना बंद करें; जानें कैसे जैविक कार्बन (OC) और मिट्टी का पीएच खाद के असर को तय करते हैं।',
    content: `Most intensive agricultural soils in the Indo-Gangetic plains suffer from low Organic Carbon (<0.4%) and alkaline pH (>8.0). Under high pH, phosphorus becomes fixed and unavailable to roots despite heavy DAP additions.

Applying 25kg Zinc sulfate heptahydrate every 2 years alongside organic farmyard manure restores micro-nutrient absorption and boosts fertilizer ROI by 22%.`,
    content_hi: `उत्तर भारत की अधिकांश जमीनों में जैविक कार्बन 0.4% से कम हो गया है। मिट्टी का पीएच अधिक होने से डीएपी का फास्फोरस जमीन में जम जाता है और पौधों को नहीं मिलता।

गोबर की खाद के साथ हर दो साल में जिंक सल्फेट डालने से खाद का पूरा फायदा मिलता है।`,
    action_steps: [
      'Check Organic Carbon (OC); if below 0.5%, incorporate green manure (Dhaincha).',
      'Do not mix Zinc sulfate and DAP together in the same tank or furrow.',
      'Target balanced N:P:K ratio of 4:2:1 instead of nitrogen-heavy skewed feeding.',
    ],
    action_steps_hi: [
      'जैविक कार्बन 0.5% से कम होने पर ढैंचा या हरी खाद पलटें।',
      'जिंक सल्फेट और डीएपी को कभी भी एक साथ मिलाकर न डालें।',
      'नाइट्रोजन, फास्फोरस और पोटाश का 4:2:1 अनुपात बनाए रखें।',
    ],
  },
  {
    id: 'art_8',
    title: 'Potato Late Blight Forecast & Preventative Spray Windows',
    title_hi: 'आलू में पछेती झुलसा (लेट ब्लाइट) का पूर्वानुमान और रोकथाम',
    category: 'disease_control',
    crop_tag: 'Potato',
    read_time_minutes: 3,
    summary: 'Water-soaked blackening on leaf margins during cold foggy drizzle can destroy a potato canopy in 5 days.',
    summary_hi: 'सर्दियों में कोहरे और बूंदाबांदी के समय पत्तियों के किनारों पर काले धब्बे 5 दिन में पूरी फसल बर्बाद कर सकते हैं।',
    content: `Late blight (Phytophthora infestans) is the most destructive potato disease. It attacks when temperatures drop below 18°C with relative humidity exceeding 90% for two consecutive days.

Prophylactic sprays of contact fungicides like Saaf or Mancozeb before fog spells build an impenetrable barrier on leaf surfaces. If active sporulation is visible, immediately switch to systemic Curzate or Nativo.`,
    content_hi: `पछेती झुलसा रोग ठंडे कोहरे और 90% से अधिक नमी में बहुत तेजी से फैलता है।

कोहरा शुरू होने से पहले ही साफ या मैंकोजेब का सुरक्षात्मक छिड़काव करें। यदि बीमारी लग चुकी हो तो सिस्टेमिक फफूंदनाशक का प्रयोग करें।`,
    action_steps: [
      'Check Weather Card on Kisan OS for humidity spikes above 85%.',
      'Spray preventative contact fungicide before dense winter fog sets in.',
      'Ensure spray reaches the undersides of lower leaves where white mildew develops.',
    ],
    action_steps_hi: [
      'किसान ओएस के मौसम कार्ड में नमी 85% से अधिक होने पर सतर्क रहें।',
      'घना कोहरा पड़ने से पहले ही फफूंदनाशक का छिड़काव पूरा करें।',
      'पत्तियों की निचली सतह पर दवा अच्छी तरह पहुंचाएं।',
    ],
  },
  {
    id: 'art_9',
    title: 'Essential Safety Protocols for Agricultural Chemical Spraying',
    title_hi: 'कीटनाशक एवं दवा छिड़काव के 5 अनिवार्य सुरक्षा नियम',
    category: 'disease_control',
    crop_tag: 'General',
    read_time_minutes: 2,
    summary: 'Protect farm operators from acute neurotoxic chemical exposure with certified safety kit and correct nozzle direction.',
    summary_hi: 'छिड़काव करते समय जहरीली दवाओं के असर से बचने के लिए सुरक्षा किट और सही दिशा का ध्यान रखें।',
    content: `Pesticides enter the human body primarily through inhalation and dermal absorption through sweaty skin. Never spray bare-chested or with leaking backpack pumps.

Always use personal protective equipment (PPE): nitrile gloves, N95 carbon respirator mask, and protective goggles. Never spray facing into the wind. Wash pump nozzles with water and a soft grass stalk—never blow through clogged nozzles with your mouth.`,
    content_hi: `कीटनाशक दवाएं सांस और त्वचा के जरिए शरीर में प्रवेश कर जहर फैलाती हैं।

हमेशा मास्क, चश्मा और दस्ताने पहनकर ही छिड़काव करें। कभी भी हवा की उल्टी दिशा में छिड़काव न करें। बंद नोजल को मुंह से फूंक मारकर कभी साफ न करें।`,
    action_steps: [
      'Equip certified N95 mask, rubber gloves, and eye shield.',
      'Always spray with the wind direction blowing behind your back.',
      'Bathe immediately with soap and wash clothing separately after spraying.',
    ],
    action_steps_hi: [
      'दवा छिड़काव के समय मास्क, दस्ताने और चश्मा अवश्य पहनें।',
      'हवा की दिशा में आगे बढ़ें, दवा उड़कर शरीर पर न आने दें।',
      'काम समाप्त होते ही साबुन से स्नान करें और कपड़े अलग धोएं।',
    ],
  },
  {
    id: 'art_10',
    title: 'Field Grain Moisture Testing Prior to Combine Harvester Entry',
    title_hi: 'कंबाइन हार्वेस्टर बुलाने से पहले अनाज में नमी की जांच',
    category: 'harvest_tips',
    crop_tag: 'Wheat',
    read_time_minutes: 2,
    summary: 'Harvesting above 13% moisture leads to mold growth and steep mandi price cuts; below 10% causes shattering losses.',
    summary_hi: '13% से अधिक नमी पर कटाई करने से मंडी में भाव कटता है और 10% से कम पर दाना झड़ने का नुकसान होता है।',
    content: `Timing your harvester dispatch to the precise moisture window maximizes your payout. If grain moisture exceeds 12%, government procurement agencies and private millers enforce significant monetary deductions for driage.

Test grain moisture in the afternoon after morning dew has fully evaporated. Take 20 grains from random earheads across the field and crush them between your teeth: a crisp, sharp "click" sound indicates optimal moisture (11-12%).`,
    content_hi: `अनाज में 12% से अधिक नमी होने पर मंडियों में प्रति क्विंटल ₹50 से ₹150 की कटौती की जाती है।

दोपहर 12 बजे के बाद जब ओस सूख जाए तब दाने को दांतों से चबाकर देखें। यदि दाना कड़क आवाज के साथ टूटता है तो कटाई के लिए सही समय है।`,
    action_steps: [
      'Cease all field irrigation 10-12 days prior to targeted harvest date.',
      'Harvest between 11 AM and 6 PM when relative humidity is lowest.',
      'Clean combine sieves to avoid grain cracking and straw contamination.',
    ],
    action_steps_hi: [
      'कटाई से 10-12 दिन पहले खेत का पानी पूरी तरह बंद कर दें।',
      'सुबह की ओस सूखने के बाद दोपहर 11 से शाम 6 बजे के बीच कंबाइन चलाएं।',
      'दाने टूटने से बचाने के लिए कंबाइन की छलनी साफ रखें।',
    ],
  },
]
