import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

interface VidhansabhaOption {
  value: string;
  label: string;
  district: string;
}

interface VidhansabhaDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Complete Maharashtra Assembly Constituencies (1-288)
const VIDHANSABHA_OPTIONS: VidhansabhaOption[] = [
  // Nandurabar
  { value: "1", label: "1 - Akkalkuwa (ST)", district: "Nandurabar" },
  { value: "2", label: "2 - Shahada (ST)", district: "Nandurabar" },
  { value: "3", label: "3 - Nandurbar (ST)", district: "Nandurabar" },
  { value: "4", label: "4 - Nawapur (ST)", district: "Nandurabar" },

  // Dhule
  { value: "5", label: "5 - Sakri (ST)", district: "Dhule" },
  { value: "6", label: "6 - Dhule Rural", district: "Dhule" },
  { value: "7", label: "7 - Dhule City", district: "Dhule" },
  { value: "8", label: "8 - Sindhkheda", district: "Dhule" },
  { value: "9", label: "9 - Shirpur (ST)", district: "Dhule" },

  // Jalgaon
  { value: "10", label: "10 - Chopda (ST)", district: "Jalgaon" },
  { value: "11", label: "11 - Raver", district: "Jalgaon" },
  { value: "12", label: "12 - Bhusawal (SC)", district: "Jalgaon" },
  { value: "13", label: "13 - Jalgaon City", district: "Jalgaon" },
  { value: "14", label: "14 - Jalgaon Rural", district: "Jalgaon" },
  { value: "15", label: "15 - Amalner", district: "Jalgaon" },
  { value: "16", label: "16 - Erandol", district: "Jalgaon" },
  { value: "17", label: "17 - Chalisgaon", district: "Jalgaon" },
  { value: "18", label: "18 - Pachora", district: "Jalgaon" },
  { value: "19", label: "19 - Jamner", district: "Jalgaon" },
  { value: "20", label: "20 - Muktainagar", district: "Jalgaon" },

  // Buldhana
  { value: "21", label: "21 - Malkapur", district: "Buldhana" },
  { value: "22", label: "22 - Buldhana", district: "Buldhana" },
  { value: "23", label: "23 - Chikhli", district: "Buldhana" },
  { value: "24", label: "24 - Sindhkhed Raja", district: "Buldhana" },
  { value: "25", label: "25 - Mehkar (SC)", district: "Buldhana" },
  { value: "26", label: "26 - Khamgaon", district: "Buldhana" },
  { value: "27", label: "27 - Jalgaon (Jamod)", district: "Buldhana" },

  // Akola
  { value: "28", label: "28 - Akot", district: "Akola" },
  { value: "29", label: "29 - Balapur", district: "Akola" },
  { value: "30", label: "30 - Aakola West", district: "Akola" },
  { value: "31", label: "31 - Akola East", district: "Akola" },
  { value: "32", label: "32 - Murtizapur (SC)", district: "Akola" },

  // Washim
  { value: "33", label: "33 - Risod", district: "Washim" },
  { value: "34", label: "34 - Washim (SC)", district: "Washim" },
  { value: "35", label: "35 - Karanja", district: "Washim" },

  // Amaravati
  { value: "36", label: "36 - Dhamangaon Railway", district: "Amaravati" },
  { value: "37", label: "37 - Badnera", district: "Amaravati" },
  { value: "38", label: "38 - Amrawati", district: "Amaravati" },
  { value: "39", label: "39 - Teosa", district: "Amaravati" },
  { value: "40", label: "40 - Daryapur (SC)", district: "Amaravati" },
  { value: "41", label: "41 - Melghat (ST)", district: "Amaravati" },
  { value: "42", label: "42 - Achalpur", district: "Amaravati" },
  { value: "43", label: "43 - Morshi", district: "Amaravati" },

  // Wardha
  { value: "44", label: "44 - Arvi", district: "Wardha" },
  { value: "45", label: "45 - Deoli", district: "Wardha" },
  { value: "46", label: "46 - Hinganghat", district: "Wardha" },
  { value: "47", label: "47 - Wardha", district: "Wardha" },

  // Nagpur
  { value: "48", label: "48 - Katol", district: "Nagpur" },
  { value: "49", label: "49 - Savner", district: "Nagpur" },
  { value: "50", label: "50 - Hingna", district: "Nagpur" },
  { value: "51", label: "51 - Umred (SC)", district: "Nagpur" },
  { value: "52", label: "52 - Nagpur South West", district: "Nagpur" },
  { value: "53", label: "53 - Nagpur South", district: "Nagpur" },
  { value: "54", label: "54 - Nagpur East", district: "Nagpur" },
  { value: "55", label: "55 - Nagpur Central", district: "Nagpur" },
  { value: "56", label: "56 - Nagpur West", district: "Nagpur" },
  { value: "57", label: "57 - Nagpur North (SC)", district: "Nagpur" },
  { value: "58", label: "58 - Kamthi", district: "Nagpur" },
  { value: "59", label: "59 - Ramtek", district: "Nagpur" },

  // Bhandara
  { value: "60", label: "60 - Tumsar", district: "Bhandara" },
  { value: "61", label: "61 - Bhandara (SC)", district: "Bhandara" },
  { value: "62", label: "62 - Sakoli", district: "Bhandara" },

  // Gondiya
  { value: "63", label: "63 - Arjuni Morgaon (SC)", district: "Gondiya" },
  { value: "64", label: "64 - Tirora", district: "Gondiya" },
  { value: "65", label: "65 - Gondia", district: "Gondiya" },
  { value: "66", label: "66 - Amgaon (ST)", district: "Gondiya" },

  // Gadchiroli
  { value: "67", label: "67 - Armori (ST)", district: "Gadchiroli" },
  { value: "68", label: "68 - Gadchiroli (ST)", district: "Gadchiroli" },
  { value: "69", label: "69 - Aheri (ST)", district: "Gadchiroli" },

  // Chandrapur
  { value: "70", label: "70 - Rajura", district: "Chandrapur" },
  { value: "71", label: "71 - Chandrapur (SC)", district: "Chandrapur" },
  { value: "72", label: "72 - Ballarpur", district: "Chandrapur" },
  { value: "73", label: "73 - Bramhapuri", district: "Chandrapur" },
  { value: "74", label: "74 - Chimur", district: "Chandrapur" },
  { value: "75", label: "75 - Warora", district: "Chandrapur" },

  // Yavatmal
  { value: "76", label: "76 - Wani", district: "Yavatmal" },
  { value: "77", label: "77 - Ralegaon (ST)", district: "Yavatmal" },
  { value: "78", label: "78 - Yavatmal", district: "Yavatmal" },
  { value: "79", label: "79 - Digras", district: "Yavatmal" },
  { value: "80", label: "80 - Arni (ST)", district: "Yavatmal" },
  { value: "81", label: "81 - Pusad", district: "Yavatmal" },
  { value: "82", label: "82 - Umarkhed (SC)", district: "Yavatmal" },

  // Nanded
  { value: "83", label: "83 - Kinwat", district: "Nanded" },
  { value: "84", label: "84 - Hadgaon", district: "Nanded" },
  { value: "85", label: "85 - Bhokar", district: "Nanded" },
  { value: "86", label: "86 - Nanded North", district: "Nanded" },
  { value: "87", label: "87 - Nanded South", district: "Nanded" },
  { value: "88", label: "88 - Loha", district: "Nanded" },
  { value: "89", label: "89 - Naigaon", district: "Nanded" },
  { value: "90", label: "90 - Deglur (SC)", district: "Nanded" },
  { value: "91", label: "91 - Mukhed", district: "Nanded" },

  // Hingoli
  { value: "92", label: "92 - Basmath", district: "Hingoli" },
  { value: "93", label: "93 - Kalamnuri", district: "Hingoli" },
  { value: "94", label: "94 - Hingoli", district: "Hingoli" },

  // Parbhani
  { value: "95", label: "95 - Jintur", district: "Parbhani" },
  { value: "96", label: "96 - Parbhani", district: "Parbhani" },
  { value: "97", label: "97 - Gangakhed", district: "Parbhani" },
  { value: "98", label: "98 - Pathri", district: "Parbhani" },

  // Jalna
  { value: "99", label: "99 - Partur", district: "Jalna" },
  { value: "100", label: "100 - Gansavangi", district: "Jalna" },
  { value: "101", label: "101 - Jalna", district: "Jalna" },
  { value: "102", label: "102 - Badnapur (SC)", district: "Jalna" },
  { value: "103", label: "103 - Bhokardan", district: "Jalna" },

  // Aurangabad
  { value: "104", label: "104 - Sillod", district: "Aurangabad" },
  { value: "105", label: "105 - Kannad", district: "Aurangabad" },
  { value: "106", label: "106 - Pholambari", district: "Aurangabad" },
  { value: "107", label: "107 - Aurangabad (Central)", district: "Aurangabad" },
  { value: "108", label: "108 - Aurangabad (West) (SC)", district: "Aurangabad" },
  { value: "109", label: "109 - Aurangbad (East)", district: "Aurangabad" },
  { value: "110", label: "110 - Paithan", district: "Aurangabad" },
  { value: "111", label: "111 - Gangapur", district: "Aurangabad" },
  { value: "112", label: "112 - Vaijapur", district: "Aurangabad" },

  // Nashik
  { value: "113", label: "113 - Nandgaon", district: "Nashik" },
  { value: "114", label: "114 - Malegaon (Central)", district: "Nashik" },
  { value: "115", label: "115 - Malegaon (Outer)", district: "Nashik" },
  { value: "116", label: "116 - Baglan (ST)", district: "Nashik" },
  { value: "117", label: "117 - Kalwan (ST)", district: "Nashik" },
  { value: "118", label: "118 - Chandwad", district: "Nashik" },
  { value: "119", label: "119 - Yevla", district: "Nashik" },
  { value: "120", label: "120 - Sinnar", district: "Nashik" },
  { value: "121", label: "121 - Niphad", district: "Nashik" },
  { value: "122", label: "122 - Dindori (ST)", district: "Nashik" },
  { value: "123", label: "123 - Nashik East", district: "Nashik" },
  { value: "124", label: "124 - Nashik (Central)", district: "Nashik" },
  { value: "125", label: "125 - Nashik West", district: "Nashik" },
  { value: "126", label: "126 - Deolali (SC)", district: "Nashik" },
  { value: "127", label: "127 - Igatpuri (ST)", district: "Nashik" },

  // Palghar
  { value: "128", label: "128 - Dahanu (ST)", district: "Palghar" },
  { value: "129", label: "129 - Vekramgrth (ST)", district: "Palghar" },
  { value: "130", label: "130 - Palghar (ST)", district: "Palghar" },
  { value: "131", label: "131 - Boisar (ST)", district: "Palghar" },
  { value: "132", label: "132 - Nalasopara", district: "Palghar" },
  { value: "133", label: "133 - Vasai", district: "Palghar" },

  // Thane
  { value: "134", label: "134 - Bhiwandi Rural (ST)", district: "Thane" },
  { value: "135", label: "135 - Shahapur (ST)", district: "Thane" },
  { value: "136", label: "136 - Bhiwandi West", district: "Thane" },
  { value: "137", label: "137 - Bhiwandi East", district: "Thane" },
  { value: "138", label: "138 - Kalyan West", district: "Thane" },
  { value: "139", label: "139 - Murbad", district: "Thane" },
  { value: "140", label: "140 - Ambarnath (SC)", district: "Thane" },
  { value: "141", label: "141 - Ulhasnagar", district: "Thane" },
  { value: "142", label: "142 - Kalyan East", district: "Thane" },
  { value: "143", label: "143 - Dombivali", district: "Thane" },
  { value: "144", label: "144 - Kalyan Rural", district: "Thane" },
  { value: "145", label: "145 - Meera Bhayandar", district: "Thane" },
  { value: "146", label: "146 - Ovala majiwada", district: "Thane" },
  { value: "147", label: "147 - Kopri-Pachpakhadi", district: "Thane" },
  { value: "148", label: "148 - Thane", district: "Thane" },
  { value: "149", label: "149 - Mumbra-Kalwa", district: "Thane" },
  { value: "150", label: "150 - Airoli", district: "Thane" },
  { value: "151", label: "151 - Belapur", district: "Thane" },

  // Mumbai Suburban
  { value: "152", label: "152 - Borivali", district: "Mumbai Suburban" },
  { value: "153", label: "153 - Dhaisar", district: "Mumbai Suburban" },
  { value: "154", label: "154 - Magathane", district: "Mumbai Suburban" },
  { value: "155", label: "155 - Mulund", district: "Mumbai Suburban" },
  { value: "156", label: "156 - Vikhroli", district: "Mumbai Suburban" },
  { value: "157", label: "157 - Bhandup West", district: "Mumbai Suburban" },
  { value: "158", label: "158 - Jogeshwari East", district: "Mumbai Suburban" },
  { value: "159", label: "159 - Dindoshi", district: "Mumbai Suburban" },
  { value: "160", label: "160 - Kandivali East", district: "Mumbai Suburban" },
  { value: "161", label: "161 - Charkop", district: "Mumbai Suburban" },
  { value: "162", label: "162 - Malad West", district: "Mumbai Suburban" },
  { value: "163", label: "163 - Goregaon", district: "Mumbai Suburban" },
  { value: "164", label: "164 - Varsova", district: "Mumbai Suburban" },
  { value: "165", label: "165 - Andheri West", district: "Mumbai Suburban" },
  { value: "166", label: "166 - Andheri East", district: "Mumbai Suburban" },
  { value: "167", label: "167 - Vile Parle", district: "Mumbai Suburban" },
  { value: "168", label: "168 - Chandivali", district: "Mumbai Suburban" },
  { value: "169", label: "169 - Ghatkopar West", district: "Mumbai Suburban" },
  { value: "170", label: "170 - Ghatkopar East", district: "Mumbai Suburban" },
  { value: "171", label: "171 - Mankhurd shivajinagar", district: "Mumbai Suburban" },
  { value: "172", label: "172 - Anushakti Nagar", district: "Mumbai Suburban" },
  { value: "173", label: "173 - Chembur", district: "Mumbai Suburban" },
  { value: "174", label: "174 - Kurla (SC)", district: "Mumbai Suburban" },
  { value: "175", label: "175 - Kalina", district: "Mumbai Suburban" },
  { value: "176", label: "176 - Vandre East", district: "Mumbai Suburban" },
  { value: "177", label: "177 - Vandre West", district: "Mumbai Suburban" },

  // Mumbai City
  { value: "178", label: "178 - Dharavi (SC)", district: "Mumbai City" },
  { value: "179", label: "179 - Sion Koliwada", district: "Mumbai City" },
  { value: "180", label: "180 - Wadala", district: "Mumbai City" },
  { value: "181", label: "181 - Mahim", district: "Mumbai City" },
  { value: "182", label: "182 - Worli", district: "Mumbai City" },
  { value: "183", label: "183 - Shivadi", district: "Mumbai City" },
  { value: "184", label: "184 - Byculla", district: "Mumbai City" },
  { value: "185", label: "185 - Malabar Hill", district: "Mumbai City" },
  { value: "186", label: "186 - Mumbadevi", district: "Mumbai City" },
  { value: "187", label: "187 - Colaba", district: "Mumbai City" },

  // Raigad
  { value: "188", label: "188 - Panvel", district: "Raigad" },
  { value: "189", label: "189 - Karjat", district: "Raigad" },
  { value: "190", label: "190 - Uran", district: "Raigad" },
  { value: "191", label: "191 - Pen", district: "Raigad" },
  { value: "192", label: "192 - Alibag", district: "Raigad" },
  { value: "193", label: "193 - Shrivardhan", district: "Raigad" },
  { value: "194", label: "194 - Mahad", district: "Raigad" },

  // Pune
  { value: "195", label: "195 - Junnar", district: "Pune" },
  { value: "196", label: "196 - Ambegaon", district: "Pune" },
  { value: "197", label: "197 - Khed Alandi", district: "Pune" },
  { value: "198", label: "198 - Shirur", district: "Pune" },
  { value: "199", label: "199 - Daund", district: "Pune" },
  { value: "200", label: "200 - Indapur", district: "Pune" },
  { value: "201", label: "201 - Baramati", district: "Pune" },
  { value: "202", label: "202 - Purandar", district: "Pune" },
  { value: "203", label: "203 - Bhor", district: "Pune" },
  { value: "204", label: "204 - Maval", district: "Pune" },
  { value: "205", label: "205 - Chinchwad", district: "Pune" },
  { value: "206", label: "206 - Pimpri (SC)", district: "Pune" },
  { value: "207", label: "207 - Bhosari", district: "Pune" },
  { value: "208", label: "208 - Vadgaon Sheri", district: "Pune" },
  { value: "209", label: "209 - Shivajinagar", district: "Pune" },
  { value: "210", label: "210 - Kothrud", district: "Pune" },
  { value: "211", label: "211 - Khadakwasala", district: "Pune" },
  { value: "212", label: "212 - Parvati", district: "Pune" },
  { value: "213", label: "213 - Hadapsar", district: "Pune" },
  { value: "214", label: "214 - Pune Cantonment (SC)", district: "Pune" },
  { value: "215", label: "215 - Kasba Peth", district: "Pune" },

  // Ahmednagar
  { value: "216", label: "216 - Akole (ST)", district: "Ahmednagar" },
  { value: "217", label: "217 - Sangmner", district: "Ahmednagar" },
  { value: "218", label: "218 - Shirdi", district: "Ahmednagar" },
  { value: "219", label: "219 - Kopargaon", district: "Ahmednagar" },
  { value: "220", label: "220 - Shrirampur (SC)", district: "Ahmednagar" },
  { value: "221", label: "221 - Nevasa", district: "Ahmednagar" },
  { value: "222", label: "222 - Shevgaon", district: "Ahmednagar" },
  { value: "223", label: "223 - Rahuri", district: "Ahmednagar" },
  { value: "224", label: "224 - Parner", district: "Ahmednagar" },
  { value: "225", label: "225 - Ahmednagar City", district: "Ahmednagar" },
  { value: "226", label: "226 - Shrigonda", district: "Ahmednagar" },
  { value: "227", label: "227 - Karjat Jamkhed", district: "Ahmednagar" },

  // Beed
  { value: "228", label: "228 - Georai", district: "Beed" },
  { value: "229", label: "229 - Majalgaon", district: "Beed" },
  { value: "230", label: "230 - Beed", district: "Beed" },
  { value: "231", label: "231 - Ashti", district: "Beed" },
  { value: "232", label: "232 - Kaij (SC)", district: "Beed" },
  { value: "233", label: "233 - Parli", district: "Beed" },

  // Latur
  { value: "234", label: "234 - Latur Rural", district: "Latur" },
  { value: "235", label: "235 - Latur City", district: "Latur" },
  { value: "236", label: "236 - Ahmedpur", district: "Latur" },
  { value: "237", label: "237 - Udgir (SC)", district: "Latur" },
  { value: "238", label: "238 - Nilanga", district: "Latur" },
  { value: "239", label: "239 - Ausa", district: "Latur" },

  // Osmanabad
  { value: "240", label: "240 - Omerga (SC)", district: "Osmanabad" },
  { value: "241", label: "241 - Tuljapur", district: "Osmanabad" },
  { value: "242", label: "242 - Osmanabad", district: "Osmanabad" },
  { value: "243", label: "243 - Paranda", district: "Osmanabad" },

  // Solapur
  { value: "244", label: "244 - Karmala", district: "Solapur" },
  { value: "245", label: "245 - Madha", district: "Solapur" },
  { value: "246", label: "246 - Barshi", district: "Solapur" },
  { value: "247", label: "247 - Mohol (SC)", district: "Solapur" },
  { value: "248", label: "248 - Solapur City North", district: "Solapur" },
  { value: "249", label: "249 - Solapur City Central", district: "Solapur" },
  { value: "250", label: "250 - Akkalkot", district: "Solapur" },
  { value: "251", label: "251 - Solapur South", district: "Solapur" },
  { value: "252", label: "252 - Pandharpur", district: "Solapur" },
  { value: "253", label: "253 - Sangola", district: "Solapur" },
  { value: "254", label: "254 - Malshiran (SC)", district: "Solapur" },

  // Satara
  { value: "255", label: "255 - Phaltan (SC)", district: "Satara" },
  { value: "256", label: "256 - Wai", district: "Satara" },
  { value: "257", label: "257 - Koregaon", district: "Satara" },
  { value: "258", label: "258 - Man", district: "Satara" },
  { value: "259", label: "259 - Karad North", district: "Satara" },
  { value: "260", label: "260 - Karad South", district: "Satara" },
  { value: "261", label: "261 - Patan", district: "Satara" },
  { value: "262", label: "262 - Satara", district: "Satara" },

  // Ratnagiri
  { value: "263", label: "263 - Dapoli", district: "Ratnagiri" },
  { value: "264", label: "264 - Guhagar", district: "Ratnagiri" },
  { value: "265", label: "265 - Chiplun", district: "Ratnagiri" },
  { value: "266", label: "266 - Ratnagiri", district: "Ratnagiri" },
  { value: "267", label: "267 - Rajapur", district: "Ratnagiri" },

  // Sindhudurg
  { value: "268", label: "268 - Kankavli", district: "Sindhudurg" },
  { value: "269", label: "269 - Kudal", district: "Sindhudurg" },
  { value: "270", label: "270 - Sawantwadi", district: "Sindhudurg" },

  // Kolhapur
  { value: "271", label: "271 - Chandgad", district: "Kolhapur" },
  { value: "272", label: "272 - Radhanagari", district: "Kolhapur" },
  { value: "273", label: "273 - kagal", district: "Kolhapur" },
  { value: "274", label: "274 - Kolhapur South", district: "Kolhapur" },
  { value: "275", label: "275 - Karvir", district: "Kolhapur" },
  { value: "276", label: "276 - Kolhapur North", district: "Kolhapur" },
  { value: "277", label: "277 - Shahuwadi", district: "Kolhapur" },
  { value: "278", label: "278 - Hatkanangle (SC)", district: "Kolhapur" },
  { value: "279", label: "279 - Ichalkaranji", district: "Kolhapur" },
  { value: "280", label: "280 - Shirol", district: "Kolhapur" },

  // Sangli
  { value: "281", label: "281 - Miraj (SC)", district: "Sangli" },
  { value: "282", label: "282 - Sangli", district: "Sangli" },
  { value: "283", label: "283 - Islampur", district: "Sangli" },
  { value: "284", label: "284 - Shirala", district: "Sangli" },
  { value: "285", label: "285 - Palus-Kadegaon", district: "Sangli" },
  { value: "286", label: "286 - Khanpur", district: "Sangli" },
  { value: "287", label: "287 - Tasgaon-Kavathe Mahankal", district: "Sangli" },
  { value: "288", label: "288 - Jat", district: "Sangli" },
];

const VidhansabhaDropdown: React.FC<VidhansabhaDropdownProps> = ({
  value = '',
  onChange,
  placeholder = 'Select Vidhansabha Constituency'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = VIDHANSABHA_OPTIONS.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = VIDHANSABHA_OPTIONS.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search constituency or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{option.district}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-center">
                No constituencies found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default VidhansabhaDropdown;
