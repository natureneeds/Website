-- ============================================================================
-- Kisan OS Seed Data: 8 Categories, 20 Crops, 30 Products, 10 Schemes
-- Phase 3 Database Seeding
-- ============================================================================

-- Clean existing seed data in case of re-run
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.cart_items;
DELETE FROM public.carts;
DELETE FROM public.products;
DELETE FROM public.sellers;
DELETE FROM public.categories;
DELETE FROM public.crops;
DELETE FROM public.schemes;

-- ----------------------------------------------------------------------------
-- 1. 8 TOP-LEVEL CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (id, name, parent_id, icon) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Seeds', NULL, 'Sprout'),
  ('c1000000-0000-0000-0000-000000000002', 'Fertilizers', NULL, 'Layers'),
  ('c1000000-0000-0000-0000-000000000003', 'Pesticides', NULL, 'ShieldAlert'),
  ('c1000000-0000-0000-0000-000000000004', 'Spray Pumps & Sprayers', NULL, 'Zap'),
  ('c1000000-0000-0000-0000-000000000005', 'Tools & Equipment', NULL, 'Wrench'),
  ('c1000000-0000-0000-0000-000000000006', 'Irrigation', NULL, 'Droplets'),
  ('c1000000-0000-0000-0000-000000000007', 'Organic Inputs', NULL, 'Leaf'),
  ('c1000000-0000-0000-0000-000000000008', 'Farm Safety', NULL, 'ShieldCheck');

-- ----------------------------------------------------------------------------
-- 2. 20 CROPS
-- ----------------------------------------------------------------------------
INSERT INTO public.crops (id, name, seasons, soil_types, water_need, duration_days, avg_cost_per_acre, avg_yield_per_acre) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Wheat (गेहूँ)', '{"Rabi"}', '{"Alluvial Soil", "Clay Loam"}', 'medium', 120, 18500, 22.5),
  ('a1000000-0000-0000-0000-000000000002', 'Basmati Rice (बासमती धान)', '{"Kharif"}', '{"Clay Loam", "Alluvial Soil"}', 'very_high', 140, 24000, 20.0),
  ('a1000000-0000-0000-0000-000000000003', 'Mustard (सरसों)', '{"Rabi"}', '{"Sandy Loam", "Alluvial Soil"}', 'low', 110, 12000, 9.5),
  ('a1000000-0000-0000-0000-000000000004', 'Bt Cotton (कपास)', '{"Kharif"}', '{"Black / Regur Soil", "Alluvial Soil"}', 'medium', 165, 28000, 14.0),
  ('a1000000-0000-0000-0000-000000000005', 'Soybean (सोयाबीन)', '{"Kharif"}', '{"Black / Regur Soil", "Loam"}', 'medium', 100, 15500, 11.0),
  ('a1000000-0000-0000-0000-000000000006', 'Chickpea / Chana (चना)', '{"Rabi"}', '{"Sandy Loam", "Black Soil"}', 'low', 115, 13000, 8.5),
  ('a1000000-0000-0000-0000-000000000007', 'Sugarcane (गन्ना)', '{"Annual"}', '{"Loam", "Clay Loam"}', 'very_high', 330, 48000, 380.0),
  ('a1000000-0000-0000-0000-000000000008', 'Maize / Corn (मक्का)', '{"Kharif", "Rabi"}', '{"Alluvial Soil", "Red Soil"}', 'medium', 95, 16000, 24.0),
  ('a1000000-0000-0000-0000-000000000009', 'Potato (आलू)', '{"Rabi"}', '{"Sandy Loam", "Alluvial Soil"}', 'medium', 90, 32000, 110.0),
  ('a1000000-0000-0000-0000-000000000010', 'Onion (प्याज)', '{"Rabi", "Kharif"}', '{"Sandy Loam", "Alluvial Soil"}', 'medium', 130, 35000, 95.0),
  ('a1000000-0000-0000-0000-000000000011', 'Tomato (टमाटर)', '{"Rabi", "Zaid"}', '{"Loam", "Red Soil"}', 'high', 105, 38000, 140.0),
  ('a1000000-0000-0000-0000-000000000012', 'Green Pea (मटर)', '{"Rabi"}', '{"Alluvial Soil", "Loam"}', 'low', 75, 19000, 42.0),
  ('a1000000-0000-0000-0000-000000000013', 'Groundnut (मूंगफली)', '{"Kharif"}', '{"Sandy Loam", "Red Soil"}', 'low', 120, 17500, 12.5),
  ('a1000000-0000-0000-0000-000000000014', 'Barley (जौ)', '{"Rabi"}', '{"Sandy Loam", "Alluvial Soil"}', 'low', 115, 14000, 16.0),
  ('a1000000-0000-0000-0000-000000000015', 'Pearl Millet / Bajra (बाजरा)', '{"Kharif"}', '{"Sandy Loam", "Arid Soil"}', 'low', 85, 11000, 13.0),
  ('a1000000-0000-0000-0000-000000000016', 'Sorghum / Jowar (ज्वार)', '{"Kharif"}', '{"Black Soil", "Loam"}', 'low', 100, 12500, 12.0),
  ('a1000000-0000-0000-0000-000000000017', 'Sunflower (सूरजमुखी)', '{"Zaid", "Rabi"}', '{"Black Soil", "Loam"}', 'medium', 95, 16500, 9.0),
  ('a1000000-0000-0000-0000-000000000018', 'Chilli (मिर्च)', '{"Kharif", "Rabi"}', '{"Black Soil", "Loam"}', 'medium', 150, 42000, 28.0),
  ('a1000000-0000-0000-0000-000000000019', 'Turmeric (हल्दी)', '{"Kharif"}', '{"Loam", "Clay Loam"}', 'high', 240, 45000, 85.0),
  ('a1000000-0000-0000-0000-000000000020', 'Garlic (लहसुन)', '{"Rabi"}', '{"Sandy Loam", "Loam"}', 'medium', 140, 40000, 45.0);

-- ----------------------------------------------------------------------------
-- 3. SAMPLE VERIFIED SELLERS
-- ----------------------------------------------------------------------------
INSERT INTO public.sellers (id, user_id, shop_name, gst_no, status) VALUES
  ('s1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'IFFCO Agri-Hub Punjab', '03AAACI1234F1Z1', 'active'),
  ('s1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Kisan Seva Kendra Haryana', '06AAACK5678B1Z2', 'active'),
  ('s1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Bharat Precision Agri Tools', '27AAACB9012D1Z3', 'active');

-- ----------------------------------------------------------------------------
-- 4. 30 SAMPLE PRODUCTS
-- ----------------------------------------------------------------------------
INSERT INTO public.products (id, seller_id, category_id, name, description, brand, price, mrp, unit, stock, images, specs, crop_tags, is_active) VALUES
  -- 1. Seeds
  ('p1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'PBW-550 Certified Wheat Seeds (40kg)', 'High yielding certified durum wheat seed with rust resistance and bold grains.', 'Punjab Agri Seeds',
   1350.00, 1550.00, '40kg bag', 150, ARRAY['/images/marketplace.bmp'],
   '{"germination": "92%", "purity": "99.2%", "treatment": "Thiram Treated", "dosage": "40kg per acre"}'::jsonb,
   ARRAY['Wheat'], true),

  ('p1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'Pusa Basmati 1121 Hybrid Paddy Seeds (10kg)', 'Extra long slender aromatic grain with high cooking elongation and drought tolerance.', 'IARI Pusa',
   950.00, 1100.00, '10kg bag', 200, ARRAY['/images/marketplace.bmp'],
   '{"grain_length": "8.4mm", "maturity": "140 days", "germination": "90%", "dosage": "8kg per acre"}'::jsonb,
   ARRAY['Basmati Rice'], true),

  ('p1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001',
   'Pusa Bold Mustard Seeds (2kg)', 'High oil content (42%) bold brown mustard seeds suited for rainfed & irrigated tracts.', 'Mahyco Agri',
   420.00, 500.00, '2kg pack', 320, ARRAY['/images/marketplace.bmp'],
   '{"oil_content": "41.5%", "germination": "88%", "duration": "115 days", "dosage": "1.5kg per acre"}'::jsonb,
   ARRAY['Mustard'], true),

  ('p1000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001',
   'RCH-659 BG-II Hybrid Cotton Seeds (450g)', 'Bollgard II protection against pink bollworm with high ginning turnout.', 'Rasi Seeds',
   850.00, 920.00, 'packet', 180, ARRAY['/images/marketplace.bmp'],
   '{"staple_length": "31mm", "trait": "Bollgard II", "duration": "165 days", "dosage": "2 packets per acre"}'::jsonb,
   ARRAY['Bt Cotton'], true),

  -- 2. Fertilizers
  ('p1000000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002',
   'IFFCO Neem Coated Urea (45kg)', 'Slow release nitrogen fertilizer minimizing leaching and atmospheric volatilization.', 'IFFCO',
   266.50, 290.00, '45kg bag', 500, ARRAY['/images/marketplace.bmp'],
   '{"nitrogen": "46%", "coating": "Neem Oil 0.05%", "solubility": "100%", "dosage": "45kg per acre split"}'::jsonb,
   ARRAY['Wheat', 'Basmati Rice', 'Sugarcane', 'Maize'], true),

  ('p1000000-0000-0000-0000-000000000006', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002',
   'IFFCO DAP Di-Ammonium Phosphate 18:46:0 (50kg)', 'High nutrient basal fertilizer promoting vigorous root development.', 'IFFCO',
   1350.00, 1400.00, '50kg bag', 450, ARRAY['/images/marketplace.bmp'],
   '{"nitrogen": "18%", "phosphorus": "46%", "moisture": "1.5%", "dosage": "50kg per acre basal"}'::jsonb,
   ARRAY['Wheat', 'Mustard', 'Potato', 'Chickpea'], true),

  ('p1000000-0000-0000-0000-000000000007', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002',
   'Nano Urea Liquid Fertilizer (500ml Bottle)', 'Nanotechnology based foliar nitrogen spray equivalent to one 45kg bag of conventional urea.', 'IFFCO Nano',
   225.00, 240.00, '500ml bottle', 600, ARRAY['/images/marketplace.bmp'],
   '{"nitrogen_particle_size": "20-50nm", "absorption_efficiency": "80%", "dosage": "4ml per litre water"}'::jsonb,
   ARRAY['Wheat', 'Basmati Rice', 'Cotton', 'Potato'], true),

  ('p1000000-0000-0000-0000-000000000008', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002',
   'Potash MOP Muriate of Potash 0:0:60 (50kg)', 'Premium potassium chloride enhancing grain weight, disease resistance and drought tolerance.', 'IPL',
   1650.00, 1800.00, '50kg bag', 220, ARRAY['/images/marketplace.bmp'],
   '{"potash_k2o": "60%", "moisture": "0.5%", "dosage": "25kg per acre"}'::jsonb,
   ARRAY['Potato', 'Sugarcane', 'Wheat', 'Chilli'], true),

  -- 3. Pesticides & Crop Care
  ('p1000000-0000-0000-0000-000000000009', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003',
   'Coragen Insecticide Chlorantraniliprole 18.5% SC (150ml)', 'Broad-spectrum anthranilic diamide insecticide providing long-duration borer control.', 'FMC',
   1850.00, 2050.00, '150ml bottle', 140, ARRAY['/images/marketplace.bmp'],
   '{"active_ingredient": "Chlorantraniliprole 18.5%", "target_pests": "Stem borer, Leaf folder, American bollworm", "dosage": "60ml per acre"}'::jsonb,
   ARRAY['Basmati Rice', 'Sugarcane', 'Cotton'], true),

  ('p1000000-0000-0000-0000-000000000010', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003',
   'Nativo Fungicide Tebuconazole + Trifloxystrobin (100g)', 'Systemic broad-spectrum fungicide with protective & curative action on blast & sheath blight.', 'Bayer CropScience',
   920.00, 1050.00, '100g pack', 190, ARRAY['/images/marketplace.bmp'],
   '{"formulation": "WG 75%", "target_disease": "Leaf Blast, Sheath Blight, Powdery Mildew", "dosage": "80g per acre"}'::jsonb,
   ARRAY['Basmati Rice', 'Wheat', 'Tomato'], true),

  ('p1000000-0000-0000-0000-000000000011', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003',
   'Amistar Top Fungicide Azoxystrobin + Difenoconazole (200ml)', 'Dual mode of action systemic fungicide providing greening effect and disease suppression.', 'Syngenta',
   1480.00, 1620.00, '200ml bottle', 110, ARRAY['/images/marketplace.bmp'],
   '{"composition": "Azoxystrobin 18.2% + Difenoconazole 11.4%", "dosage": "200ml per acre"}'::jsonb,
   ARRAY['Wheat', 'Cotton', 'Chilli', 'Onion'], true),

  ('p1000000-0000-0000-0000-000000000012', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003',
   'Saaf Systemic Fungicide Carbendazim + Mancozeb (500g)', 'Cost-effective contact and systemic fungicide for seed treatment and foliar spray.', 'UPL',
   340.00, 410.00, '500g pack', 280, ARRAY['/images/marketplace.bmp'],
   '{"active": "Carbendazim 12% + Mancozeb 63% WP", "dosage": "2g per litre water"}'::jsonb,
   ARRAY['Groundnut', 'Potato', 'Tomato', 'Chilli'], true),

  -- 4. Spray Pumps & Sprayers
  ('p1000000-0000-0000-0000-000000000013', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004',
   'Neptune 16L Battery Knapsack Sprayer 12V 12Ah', 'Heavy duty rechargeable lithium-compatible battery sprayer with brass lance and pressure regulator.', 'Neptune Agri',
   2750.00, 3200.00, 'unit', 85, ARRAY['/images/marketplace.bmp'],
   '{"tank_capacity": "16 Litres", "battery": "12V 12Ah Lead-Acid", "working_time": "6-8 hours", "nozzles": "4 Interchangeable Nozzles"}'::jsonb,
   ARRAY['All Crops'], true),

  ('p1000000-0000-0000-0000-000000000014', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004',
   'ASPEE HTP Horizontal Triplex Power Sprayer 3HP', 'Tractor PTO / electric engine driven high pressure pump for tall trees and vast acreage spraying.', 'ASPEE',
   8900.00, 9900.00, 'unit', 40, ARRAY['/images/marketplace.bmp'],
   '{"pressure": "400 PSI", "suction_capacity": "36 LPM", "power": "3HP to 5HP engine", "material": "Solid Brass Head"}'::jsonb,
   ARRAY['Cotton', 'Sugarcane', 'Wheat'], true),

  ('p1000000-0000-0000-0000-000000000015', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004',
   'Balwaan 2-Stroke Portable Power Sprayer 26cc', 'Lightweight portable petrol spray pump with 50-meter heavy discharge hose pipe.', 'Balwaan Krishi',
   5200.00, 6100.00, 'unit', 65, ARRAY['/images/marketplace.bmp'],
   '{"engine_type": "2-Stroke 26cc", "fuel": "Petrol with 2T Oil", "discharge_range": "30-35 feet"}'::jsonb,
   ARRAY['All Crops'], true),

  ('p1000000-0000-0000-0000-000000000016', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004',
   'Kisan Drone Spray Nozzle Cluster (Set of 4)', 'Ultra-low volume centrifugal anti-drift nozzles for agriculture payload drones.', 'AeroKisan',
   1450.00, 1800.00, 'set', 120, ARRAY['/images/marketplace.bmp'],
   '{"droplet_size": "100-250 microns", "spray_swath": "4.5 meters", "material": "Ceramic Core"}'::jsonb,
   ARRAY['Wheat', 'Basmati Rice', 'Cotton'], true),

  -- 5. Tools & Equipment
  ('p1000000-0000-0000-0000-000000000017', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005',
   'Digital Soil NPK pH & Moisture 4-in-1 Sensor Probe', 'Instant optical LCD digital meter for real-time nitrogen, phosphorus, potassium, and pH calibration.', 'AgriSense Labs',
   3400.00, 4200.00, 'unit', 75, ARRAY['/images/marketplace.bmp'],
   '{"accuracy": "+/- 2%", "display": "Backlit LCD", "battery": "9V Standard", "probe_depth": "20cm stainless steel"}'::jsonb,
   ARRAY['All Crops'], true),

  ('p1000000-0000-0000-0000-000000000018', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005',
   'Manual Single Row Push Seeder & Planter Machine', 'Precision hand-push roller planter with interchangeable seed discs for wheat, maize, soybean, and chana.', 'Falcon Agri Tools',
   3850.00, 4600.00, 'unit', 45, ARRAY['/images/marketplace.bmp'],
   '{"seed_capacity": "3.5kg", "depth_adjustment": "2.5cm to 7cm", "wheels": "Dual Traction Steel Wheels"}'::jsonb,
   ARRAY['Maize', 'Soybean', 'Chickpea', 'Wheat'], true),

  ('p1000000-0000-0000-0000-000000000019', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005',
   'Heavy Duty Rotavator Boron Steel Blades (Set of 42)', 'Heat-treated L-type boron steel rotavator blades engineered for deep tillage and stubble mulching.', 'Shaktiman',
   5600.00, 6400.00, 'set of 42', 90, ARRAY['/images/marketplace.bmp'],
   '{"material": "Boron Steel 30MnB5", "thickness": "8mm", "hardness": "48-52 HRC"}'::jsonb,
   ARRAY['All Crops'], true),

  ('p1000000-0000-0000-0000-000000000020', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005',
   'Digital Grain Moisture Tester Meter (Wheat, Rice, Mustard)', 'Capacitance based digital meter testing moisture percentage across 16 grain types in 5 seconds.', 'Labman Instruments',
   6200.00, 7500.00, 'unit', 35, ARRAY['/images/marketplace.bmp'],
   '{"range": "5% to 30%", "resolution": "0.1%", "calibration": "Auto Temperature Compensated"}'::jsonb,
   ARRAY['Wheat', 'Basmati Rice', 'Mustard', 'Soybean'], true),

  -- 6. Irrigation
  ('p1000000-0000-0000-0000-000000000021', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000006',
   'Jain Drip Irrigation Lateral Pipe 16mm (400m Roll)', 'Inline cylindrical dripper pipe spaced at 40cm delivering 2.4 LPH uniform discharge.', 'Jain Irrigation',
   3600.00, 4200.00, '400m roll', 110, ARRAY['/images/marketplace.bmp'],
   '{"diameter": "16mm Class 2", "dripper_spacing": "40cm", "discharge": "2.4 LPH", "uv_stabilized": true}'::jsonb,
   ARRAY['Cotton', 'Sugarcane', 'Tomato', 'Chilli'], true),

  ('p1000000-0000-0000-0000-000000000022', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000006',
   'Kirloskar Submersible Solar Pump Controller 5HP', 'Solar MPPT controller driving 5HP AC borewell pumps with dry-run and high voltage protection.', 'Kirloskar Brothers',
   18500.00, 22000.00, 'unit', 25, ARRAY['/images/marketplace.bmp'],
   '{"rating": "5HP Three Phase", "mppt_efficiency": "98.5%", "enclosure": "IP65 Weatherproof"}'::jsonb,
   ARRAY['All Crops'], true),

  ('p1000000-0000-0000-0000-000000000023', 's1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000006',
   'Rain Gun Sprinkler 1.5 Inch Heavy Brass 360 Degree', 'High radius field impact rain gun covering 100 to 140 feet diameter for uniform field irrigation.', 'Finolex Plasson',
   2450.00, 2900.00, 'unit', 95, ARRAY['/images/marketplace.bmp'],
   '{"inlet_size": "1.5 inch female BSP", "pressure": "2.5 to 5.0 kg/cm2", "radius": "28-36 meters"}'::jsonb,
   ARRAY['Wheat', 'Sugarcane', 'Maize', 'Groundnut'], true),

  ('p1000000-0000-0000-0000-000000000024', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000006',
   'Smart Automated Irrigation Solenoid Valve 2 Inch 24V DC', 'Electric latching pulse solenoid valve compatible with IoT telemetry and smartphone timers.', 'Netafim',
   2800.00, 3350.00, 'unit', 60, ARRAY['/images/marketplace.bmp'],
   '{"size": "2 inch BSP", "voltage": "24V AC/DC Latching", "body": "Reinforced Glass-Filled Nylon"}'::jsonb,
   ARRAY['All Crops'], true),

  -- 7. Organic Inputs
  ('p1000000-0000-0000-0000-000000000025', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000007',
   'Bio-NPK Consortium Liquid Bio-Fertilizer (1 Litre)', 'Symbiotic Azotobacter, PSB, and KMB bacterial culture restoring native soil microbial biodiversity.', 'IFFCO Organic',
   320.00, 380.00, '1L bottle', 300, ARRAY['/images/marketplace.bmp'],
   '{"bacterial_count": "1x10^9 CFU/ml", "components": "Nitrogen fixer, Phosphate solubilizer, Potash mobilizer", "dosage": "1 Litre per acre drip or drench"}'::jsonb,
   ARRAY['All Crops'], true),

  ('p1000000-0000-0000-0000-000000000026', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000007',
   'Pure Cold-Pressed Neem Oil 10000 PPM Azadirachtin (1 Litre)', 'Organic certified botanical insecticide deterring sucking pests, thrips, and caterpillars.', 'GreenTech Bio',
   680.00, 820.00, '1L bottle', 220, ARRAY['/images/marketplace.bmp'],
   '{"active": "Azadirachtin 1% (10000 PPM)", "emulsifier": "Pre-mixed Organic Emulsifier", "dosage": "3ml per litre water"}'::jsonb,
   ARRAY['Cotton', 'Mustard', 'Chilli', 'Tomato'], true),

  ('p1000000-0000-0000-0000-000000000027', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000007',
   'Humic Acid 98% Flakes Bio-Stimulant (1kg)', 'Potassium humate 98% boosting root branching, cation exchange capacity, and micronutrient uptake.', 'Swarna Bio',
   450.00, 560.00, '1kg pack', 350, ARRAY['/images/marketplace.bmp'],
   '{"humic_acid": "65%", "fulvic_acid": "15%", "k2o": "12%", "water_solubility": "100%", "dosage": "500g per acre"}'::jsonb,
   ARRAY['Wheat', 'Potato', 'Sugarcane', 'Basmati Rice'], true),

  ('p1000000-0000-0000-0000-000000000028', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000007',
   'Trichoderma Viride Bio-Fungicide Powder 1% WP (1kg)', 'Beneficial antagonistic fungal bio-agent preventing seed rot, damping off, and root wilts.', 'Anand Bio Care',
   260.00, 310.00, '1kg pack', 240, ARRAY['/images/marketplace.bmp'],
   '{"cfu_count": "2x10^6 CFU/g", "target": "Fusarium, Pythium, Rhizoctonia", "application": "Seed treatment & soil drenching"}'::jsonb,
   ARRAY['Chickpea', 'Mustard', 'Groundnut', 'Soybean'], true),

  -- 8. Farm Safety
  ('p1000000-0000-0000-0000-000000000029', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000008',
   '3M Chemical Spray Protection Respirator Mask Kit', 'Certified dual organic vapor cartridge respirator for high-hazard agricultural pesticide spraying.', '3M Safety',
   1850.00, 2150.00, 'kit', 130, ARRAY['/images/marketplace.bmp'],
   '{"standard": "NIOSH OV/P95", "material": "Hypoallergenic Silicone Facepiece", "cartridges": "Replaceable Activated Carbon"}'::jsonb,
   ARRAY['All Crops'], true),

  ('p1000000-0000-0000-0000-000000000030', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000008',
   'Chemical Resistant Full Body PPE Coverall & Nitrile Gloves', 'Liquid-tight breathable coverall suit protecting operators against pesticide drifts and contact irritants.', 'Udyogi Safety',
   780.00, 950.00, 'set', 170, ARRAY['/images/marketplace.bmp'],
   '{"rating": "Type 4/5/6 Chemical Protective", "seams": "Taped Waterproof", "includes": "15 Mil Heavy Nitrile Gloves"}'::jsonb,
   ARRAY['All Crops'], true);

-- ----------------------------------------------------------------------------
-- 5. 10 GOVERNMENT SCHEMES
-- ----------------------------------------------------------------------------
INSERT INTO public.schemes (id, title, type, description, eligibility, link, states) VALUES
  ('f1000000-0000-0000-0000-000000000001',
   'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
   'subsidy',
   'Direct income support of Rs 6,000 per year transferred in three equal instalments into the bank accounts of all landholding farmers.',
   'All landholding farmer families with cultivable landholding in their names.',
   'https://pmkisan.gov.in',
   ARRAY['ALL']),

  ('f1000000-0000-0000-0000-000000000002',
   'PM Fasal Bima Yojana (PMFBY)',
   'insurance',
   'Comprehensive crop insurance against non-preventable natural risks from pre-sowing to post-harvest at nominal premium (1.5% Rabi, 2% Kharif).',
   'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
   'https://pmfby.gov.in',
   ARRAY['ALL']),

  ('f1000000-0000-0000-0000-000000000003',
   'Kisan Credit Card (KCC) Scheme',
   'credit_loan',
   'Concessional institutional credit up to Rs 3 Lakh at effective 4% interest per annum with prompt repayment incentive.',
   'All farmers, individual/joint borrowers, SHGs, tenant farmers, and oral lessees.',
   'https://agricoop.nic.in',
   ARRAY['ALL']),

  ('f1000000-0000-0000-0000-000000000004',
   'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) - Per Drop More Crop',
   'subsidy',
   'Up to 55% capital subsidy for small and marginal farmers on precision micro-irrigation (drip and sprinkler systems).',
   'Farmers owning agricultural land with assured irrigation water source.',
   'https://pmksy.gov.in',
   ARRAY['ALL']),

  ('f1000000-0000-0000-0000-000000000005',
   'Sub-Mission on Agricultural Mechanization (SMAM)',
   'subsidy',
   'Financial assistance of 40% to 50% on purchase of tractors, laser levelers, rotavators, drone sprayers, and combine harvesters.',
   'Individual farmers, Custom Hiring Centres, and Farmer Producer Organizations (FPOs).',
   'https://agrimachinery.nic.in',
   ARRAY['ALL']),

  ('f1000000-0000-0000-0000-000000000006',
   'Paramparagat Krishi Vikas Yojana (PKVY)',
   'grant',
   'Financial assistance of Rs 50,000 per hectare over 3 years for cluster organic farming, certification, and direct marketing.',
   'Farmer groups with minimum 20 hectares contiguous agricultural land cluster.',
   'https://pgsindia-ncof.gov.in',
   ARRAY['ALL']),

  ('f1000000-0000-0000-0000-000000000007',
   'Agriculture Infrastructure Fund (AIF)',
   'infrastructure',
   'Medium to long-term debt financing with 3% interest subvention for post-harvest management infrastructure and cold storage warehouses.',
   'Primary Agricultural Credit Societies, FPOs, Agri-entrepreneurs, and Startups.',
   'https://agriinfra.dac.gov.in',
   ARRAY['ALL']),

  ('f1000000-0000-0000-0000-000000000008',
   'Soil Health Card Scheme',
   'advisory',
   'Periodic free comprehensive testing of 12 soil parameters with customized nutrient dosage advisory cards issued every 3 years.',
   'All operational landholding agricultural farmers across all districts.',
   'https://soilhealth.dac.gov.in',
   ARRAY['ALL']),

  ('f1000000-0000-0000-0000-000000000009',
   'National Mission on Edible Oils - Oil Palm & Oilseeds (NMEO)',
   'subsidy',
   'Price assurance Viability Gap Payment (VGP) and subsidized planting material for mustard, groundnut, soybean, and oil palm growers.',
   'Farmers cultivating notified oilseed and oil palm varieties.',
   'https://nmeo.gov.in',
   ARRAY['Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra', 'Uttar Pradesh']),

  ('f1000000-0000-0000-0000-00000000010',
   'National Agriculture Market (e-NAM) Platform',
   'advisory',
   'Pan-India electronic trading portal integrating APMC mandis for transparent competitive online bidding and direct buyer settlements.',
   'All farmers registered at APMC mandis holding active bank accounts.',
   'https://enam.gov.in',
   ARRAY['ALL']);
