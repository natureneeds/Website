export interface SchemeData {
  id: string
  title: string
  title_hi: string
  section: 'loans_kcc' | 'insurance' | 'subsidies_schemes'
  type: 'subsidy' | 'credit_loan' | 'insurance' | 'grant'
  description: string
  description_hi: string
  eligibility: string
  eligibility_hi: string
  max_benefit: string
  required_docs: string[]
  required_docs_hi: string[]
  eligible_crops: string[]
  states: string[]
  min_land_acre: number
  max_land_acre: number
  official_portal_url: string
  portal_name: string
}

export const SEEDED_SCHEMES: SchemeData[] = [
  // ==========================================================================
  // LOANS AND KCC
  // ==========================================================================
  {
    id: 'sch_kcc_1',
    title: 'Kisan Credit Card (KCC) Crop Loan & Working Capital',
    title_hi: 'किसान क्रेडिट कार्ड (केसीसी) फसली ऋण योजना',
    section: 'loans_kcc',
    type: 'credit_loan',
    description:
      'Provides farmers with affordable revolving short-term credit for seeds, fertilizers, pesticides, and post-harvest maintenance at an effective subsidized interest rate of 4% per annum (with 3% prompt repayment incentive).',
    description_hi:
      'किसानों को बीज, खाद, कीटनाशक और फसल प्रबंधन हेतु 4% रियायती ब्याज दर (समय पर भुगतान पर 3% छूट सहित) पर ₹3 लाख तक का आसान ऋण।',
    eligibility:
      'All owner-cultivator farmers, tenant farmers, oral lessees, sharecroppers, and SHGs/JLGs engaged in agriculture and allied activities.',
    eligibility_hi: 'सभी भूमि स्वामी किसान, बटाईदार, पट्टेदार और स्वयं सहायता समूह।',
    max_benefit: 'Up to ₹3,00,000 collateral-free credit at 4% interest p.a.',
    required_docs: [
      'Aadhaar Card of Applicant',
      'Latest Land Record (Jamabandi / Fard / 7-12 Extract)',
      'Crop Sowing Declaration / Girdawari Certificate',
      'Passport size photographs (2 copies)',
      'Bank Account Passbook / Cancelled Cheque',
      'No-Dues Certificate from other scheduled banks in area',
    ],
    required_docs_hi: [
      'आवेदक का आधार कार्ड',
      'नवीनतम भू-अभिलेख (जमाबंदी / फर्द / खसरा-खतौनी)',
      'फसल गिरदावरी / बुवाई प्रमाण पत्र',
      'पासपोर्ट साइज फोटो (2 प्रतियां)',
      'बैंक पासबुक की प्रति या रद्द चेक',
      'अदेय प्रमाण पत्र (No Dues Certificate)',
    ],
    eligible_crops: ['All', 'Wheat', 'Rice', 'Mustard', 'Cotton', 'Sugarcane', 'Maize'],
    states: ['ALL', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh'],
    min_land_acre: 0.1,
    max_land_acre: 1000,
    official_portal_url: 'https://myscheme.gov.in/schemes/kcc',
    portal_name: 'National MyScheme Portal & State Commercial Banks',
  },
  {
    id: 'sch_aif_2',
    title: 'Agriculture Infrastructure Fund (AIF) Term Loan',
    title_hi: 'कृषि अवसंरचना कोष (एआईएफ) परियोजना ऋण',
    section: 'loans_kcc',
    type: 'credit_loan',
    description:
      'Medium-long term debt financing for post-harvest management infrastructure such as cold storage, grain silos, sorting/grading units, and custom hiring centers with 3% per annum interest subvention up to ₹2 Crore for 7 years.',
    description_hi:
      'कोल्ड स्टोरेज, वेयरहाउस, सॉर्टिंग यूनिट और कस्टम हायरिंग सेंटर स्थापित करने हेतु 3% ब्याज छूट के साथ ₹2 करोड़ तक का दीर्घकालिक ऋण।',
    eligibility:
      'Primary Agricultural Credit Societies (PACS), FPOs, Agri-entrepreneurs, Startups, and Individual progressive farmers.',
    eligibility_hi: 'कृषक उत्पादक संगठन (FPO), पैक्स (PACS), कृषि उद्यमी और व्यक्तिगत किसान।',
    max_benefit: 'Interest subvention of 3% p.a. on loans up to ₹2.00 Crore for 7 years',
    required_docs: [
      'Detailed Project Report (DPR) with cashflow projections',
      'Aadhaar & PAN Card of Applicant / Directors',
      'Land ownership or lease deed agreement (minimum 10 years)',
      'Firm / FPO Registration Certificate or GSTIN (if applicable)',
      'Bank statements for preceding 6 months',
    ],
    required_docs_hi: [
      'विस्तृत परियोजना रिपोर्ट (DPR)',
      'आधार कार्ड एवं पैन कार्ड',
      'भूमि स्वामित्व या कम से कम 10 वर्ष का लीज डीड',
      'पंजीकरण प्रमाण पत्र या जीएसटी (यदि लागू हो)',
      'पिछले 6 माह का बैंक खाता विवरण',
    ],
    eligible_crops: ['All', 'Potato', 'Onion', 'Wheat', 'Mustard', 'Fruits', 'Vegetables'],
    states: ['ALL', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan'],
    min_land_acre: 0.5,
    max_land_acre: 500,
    official_portal_url: 'https://agriinfra.dac.gov.in/',
    portal_name: 'Department of Agriculture & Farmers Welfare (DA&FW)',
  },

  // ==========================================================================
  // INSURANCE (PMFBY ETC.)
  // ==========================================================================
  {
    id: 'sch_pmfby_3',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) Comprehensive Crop Cover',
    title_hi: 'प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)',
    section: 'insurance',
    type: 'insurance',
    description:
      'Comprehensive risk cover against non-preventable natural risks (drought, flood, unseasonal hail, frost, and pest epidemics) from pre-sowing to post-harvest. Farmer pays only 1.5% premium for Rabi crops and 2.0% for Kharif crops.',
    description_hi:
      'प्राकृतिक आपदाओं (सूखा, बाढ़, ओलावृष्टि, पाला, कीट प्रकोप) से बुवाई से लेकर कटाई तक व्यापक बीमा। किसान प्रीमियम: रबी 1.5%, खरीफ 2.0%।',
    eligibility:
      'All farmers growing notified crops in notified insurance units, including loanee and non-loanee farmers, sharecroppers, and tenant farmers.',
    eligibility_hi: 'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी ऋणी और गैर-ऋणी किसान।',
    max_benefit: 'Full Sum Insured per hectare based on district Scale of Finance (up to ₹65,000/acre)',
    required_docs: [
      'Aadhaar Card linked with Bank Account',
      'Active Bank Account Passbook (showing IFSC & Account Number)',
      'Sowing Certificate / Patwari Girdawari verification',
      'Land Record Document (Khatauni / Jamabandi)',
      'Tenant / Sharecropper agreement affidavit (for non-owner cultivators)',
    ],
    required_docs_hi: [
      'बैंक खाते से लिंक आधार कार्ड',
      'सक्रिय बैंक पासबुक की प्रति (IFSC और खाता संख्या स्पष्ट)',
      'पटवारी गिरदावरी / बुवाई स्व-घोषणा पत्र',
      'भूमि फर्द / जमाबंदी / खतौनी प्रति',
      'बटाईदार / पट्टेदार शपथ पत्र (यदि लागू हो)',
    ],
    eligible_crops: ['Wheat', 'Mustard', 'Rice', 'Cotton', 'Gram', 'Barley', 'Bajra', 'Maize'],
    states: ['ALL', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh'],
    min_land_acre: 0.1,
    max_land_acre: 1000,
    official_portal_url: 'https://pmfby.gov.in/',
    portal_name: 'PMFBY National Crop Insurance Portal',
  },
  {
    id: 'sch_rwbcis_4',
    title: 'Weather Based Crop Insurance Scheme (WBCIS) for Horticulture',
    title_hi: 'मौसम आधारित फसल बीमा योजना (बागवानी एवं नकदी फसलें)',
    section: 'insurance',
    type: 'insurance',
    description:
      'Protects horticultural, fruit, and spice crops against weather triggers (excess rainfall, unseasonal frost, windstorms, and extreme temperature fluctuations) recorded by automated weather stations.',
    description_hi:
      'अत्यधिक वर्षा, बेमौसम पाला, आंधी व तापमान उतार-चढ़ाव से बागवानी और नकदी फसलों का स्वचालित वेदर स्टेशन आधारित बीमा। किसान प्रीमियम अधिकतम 5%।',
    eligibility:
      'Farmers cultivating notified vegetable, fruit, or spice crops in designated weather cluster districts.',
    eligibility_hi: 'अधिसूचित बागवानी, फल व मसाला उत्पादक किसान।',
    max_benefit: 'Sum Insured up to ₹1,20,000 per acre depending on fruit/vegetable crop type',
    required_docs: [
      'Aadhaar Card of Cultivator',
      'Land revenue document / orchard plantation proof',
      'Bank passbook copy',
      'Self-declaration of tree count or acreage planted',
    ],
    required_docs_hi: [
      'आधार कार्ड',
      'भूमि राजस्व दस्तावेज / बागवानी प्रमाण',
      'बैंक पासबुक',
      'पेड़ों की संख्या या बुवाई क्षेत्रफल का स्व-घोषणा पत्र',
    ],
    eligible_crops: ['Potato', 'Tomato', 'Citrus', 'Guava', 'Mango', 'Chilli', 'Onion'],
    states: ['ALL', 'Haryana', 'Punjab', 'Rajasthan', 'Uttar Pradesh'],
    min_land_acre: 0.2,
    max_land_acre: 200,
    official_portal_url: 'https://pmfby.gov.in/',
    portal_name: 'National Weather Insurance Dashboard',
  },

  // ==========================================================================
  // SUBSIDIES AND SCHEMES
  // ==========================================================================
  {
    id: 'sch_pmkisan_5',
    title: 'PM-KISAN Samman Nidhi Direct Income Support',
    title_hi: 'प्रधानमंत्री किसान सम्मान निधि (पीएम-किसान)',
    section: 'subsidies_schemes',
    type: 'subsidy',
    description:
      'Direct income support of ₹6,000 per year transferred in three equal four-monthly installments of ₹2,000 directly into the Aadhaar-seeded bank accounts of landholding farmer families.',
    description_hi:
      'पात्र किसान परिवारों को ₹6,000 प्रति वर्ष की प्रत्यक्ष आर्थिक सहायता, जो ₹2,000 की तीन समान किस्तों में सीधे बैंक खाते में भेजी जाती है।',
    eligibility:
      'All landholding farmer families having cultivable landholding in their names (subject to exclusion criteria like institutional landholders or income tax payees).',
    eligibility_hi: 'खेती योग्य भूमि के स्वामी सभी किसान परिवार (आयकर दाता अपवाद हैं)।',
    max_benefit: '₹6,000 annually (in 3 installments of ₹2,000 each via DBT)',
    required_docs: [
      'Aadhaar Card with mobile number linked for OTP e-KYC',
      'Proof of land ownership (Khatauni / Jamabandi / Land Title)',
      'Bank Account details with NPCI/Aadhaar seeding active',
    ],
    required_docs_hi: [
      'मोबाइल नंबर से लिंक आधार कार्ड (e-KYC हेतु)',
      'जमीन की फर्द / जमाबंदी / खसरा-खतौनी की प्रति',
      'आधार सीडेड बैंक खाता पासबुक',
    ],
    eligible_crops: ['All'],
    states: ['ALL', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh'],
    min_land_acre: 0.05,
    max_land_acre: 1000,
    official_portal_url: 'https://pmkisan.gov.in/',
    portal_name: 'PM-KISAN Official Portal (pmkisan.gov.in)',
  },
  {
    id: 'sch_smam_6',
    title: 'Sub-Mission on Agricultural Mechanization (SMAM) Farm Machinery Subsidy',
    title_hi: 'कृषि यंत्रीकरण उप-अभियान (मशीनरी एवं ट्रैक्टर सब्सिडी)',
    section: 'subsidies_schemes',
    type: 'subsidy',
    description:
      'Provides 40% to 50% capital subsidy on farm machinery (Tractors, Drone sprayers, Rotavators, Super Seeders, Happy Seeders, and Laser Land Levelers) to promote mechanized, stubble-free farming.',
    description_hi:
      'ट्रैक्टर, ड्रोन स्प्रेयर, सुपर सीडर, रोटावेटर और लेजर लेवलर पर 40% से 50% तक की भारी सरकारी सब्सिडी।',
    eligibility:
      'Individual small & marginal farmers, women farmers, SC/ST farmers (50% subsidy) and general category farmers (40% subsidy).',
    eligibility_hi: 'छोटे, सीमांत, महिला, एससी/एसटी किसान (50% सब्सिडी) एवं सामान्य किसान (40% सब्सिडी)।',
    max_benefit: 'Up to ₹5,00,000 subsidy on custom hiring machinery & up to ₹1,00,000 on individual implements',
    required_docs: [
      'Aadhaar Card & Parivar Pehchan Patra (if in Haryana)',
      'Land Registry / Fard with Patwari signature',
      'Bank Account Passbook / Cancelled Cheque',
      'Affidavit of non-receipt of machinery subsidy in last 5 years',
      'Quotation / Proforma Invoice from authorized farm equipment dealer',
    ],
    required_docs_hi: [
      'आधार कार्ड एवं परिवार पहचान पत्र (PPP)',
      'पटवारी सत्यापित जमीन की फर्द / जमाबंदी',
      'बैंक पासबुक या कैंसिल चेक',
      'पिछले 5 वर्षों में सब्सिडी न लेने का शपथ पत्र',
      'अधिकृत कृषि यंत्र विक्रेता का कोटेशन / इनवॉइस',
    ],
    eligible_crops: ['All', 'Wheat', 'Rice', 'Mustard', 'Cotton', 'Sugarcane'],
    states: ['ALL', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan'],
    min_land_acre: 0.5,
    max_land_acre: 50,
    official_portal_url: 'https://agrimachinery.nic.in/',
    portal_name: 'Farmech Agri Machinery Portal (agrimachinery.nic.in)',
  },
  {
    id: 'sch_pmksy_7',
    title: 'PM Krishi Sinchayee Yojana (Per Drop More Crop - Drip & Micro Irrigation)',
    title_hi: 'प्रधानमंत्री कृषि सिंचाई योजना (ड्रिप एवं स्प्रिंकलर सब्सिडी)',
    section: 'subsidies_schemes',
    type: 'subsidy',
    description:
      'Enhances water efficiency through 55% capital subsidy for small and marginal farmers (45% for other farmers) for installing drip and micro-sprinkler irrigation systems on field crops and orchards.',
    description_hi:
      'ड्रिप और मिनी स्प्रिंकलर लगाने पर छोटे व सीमांत किसानों को 55% और अन्य किसानों को 45% सब्सिडी।',
    eligibility:
      'All landholding farmers having assured water source (borewell, tubewell, farm pond, or canal connection).',
    eligibility_hi: 'निश्चित जल स्रोत (बोरवेल, फार्म पॉन्ड या नहर) वाले सभी किसान।',
    max_benefit: '55% subsidy on micro-irrigation system cost (up to ₹35,000/acre)',
    required_docs: [
      'Aadhaar Card',
      'Land ownership Jamabandi / 7-12 Record',
      'Electricity connection bill or NOC for irrigation source',
      'Field soil & water test report',
      'System design layout from approved micro-irrigation vendor',
    ],
    required_docs_hi: [
      'आधार कार्ड',
      'जमीन की फर्द / खसरा-खतौनी',
      'नलकूप / बिजली बिल या जल स्रोत का प्रमाण',
      'मिट्टी व पानी जांच रिपोर्ट',
      'कंपनी द्वारा तैयार ड्रिप लेआउट मैप',
    ],
    eligible_crops: ['Cotton', 'Mustard', 'Sugarcane', 'Vegetables', 'Fruits', 'Maize', 'Wheat'],
    states: ['ALL', 'Haryana', 'Rajasthan', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh'],
    min_land_acre: 0.25,
    max_land_acre: 12.5,
    official_portal_url: 'https://pmksy.gov.in/',
    portal_name: 'PMKSY Official Portal (pmksy.gov.in)',
  },
  {
    id: 'sch_kusum_8',
    title: 'PM-KUSUM Component-B (Solar Agri Pumping System Subsidy)',
    title_hi: 'पीएम-कुसुम योजना (सोलर पंप 60% से 75% सब्सिडी)',
    section: 'subsidies_schemes',
    type: 'subsidy',
    description:
      'Provides standalone off-grid solar-powered agriculture pumps (3HP, 5HP, 7.5HP, 10HP) replacing polluting diesel pumps. Government provides up to 60-75% subsidy (30% Central + 30-45% State); farmer pays only balance 25-40%.',
    description_hi:
      'डीजल पंप की जगह 3HP, 5HP, 7.5HP, 10HP सोलर पंप लगवाने पर 60% से 75% तक की भारी सब्सिडी।',
    eligibility:
      'Individual farmers, Water User Associations, and Community irrigation groups without grid-connected electric pump connections.',
    eligibility_hi: 'ऐसे किसान जिनके पास ग्रिड बिजली का ट्यूबवेल कनेक्शन नहीं है।',
    max_benefit: 'Up to 75% subsidy on benchmark cost of solar agri pump',
    required_docs: [
      'Aadhaar Card',
      'Land revenue record showing groundwater depth clearance',
      'Affidavit that no existing grid-electric tubewell connection exists',
      'Bank passbook copy',
      'Micro-irrigation installation undertaking (in select states)',
    ],
    required_docs_hi: [
      'आधार कार्ड',
      'भूजल प्रमाण पत्र / जमीन की फर्द',
      'बिजली कनेक्शन न होने का शपथ पत्र',
      'बैंक पासबुक',
      'ड्रिप/स्प्रिंकलर लगाने की सहमति',
    ],
    eligible_crops: ['All'],
    states: ['ALL', 'Haryana', 'Rajasthan', 'Punjab', 'Uttar Pradesh'],
    min_land_acre: 1.0,
    max_land_acre: 50,
    official_portal_url: 'https://pmkusum.mnre.gov.in/',
    portal_name: 'Ministry of New & Renewable Energy (MNRE)',
  },
]
