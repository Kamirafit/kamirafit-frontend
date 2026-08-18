// Comprehensive Indian Pincode Directory & Lookup Engine

interface PincodeResult {
  city: string;
  state: string;
}

// 3-digit prefix mapping for major Indian districts / cities
const PINCODE_3_MAP: Record<string, PincodeResult> = {
  // Delhi
  "110": { city: "New Delhi", state: "Delhi" },
  
  // Haryana
  "121": { city: "Faridabad", state: "Haryana" },
  "122": { city: "Gurugram", state: "Haryana" },
  "124": { city: "Rohtak", state: "Haryana" },
  "125": { city: "Hisar", state: "Haryana" },
  "131": { city: "Sonipat", state: "Haryana" },
  "132": { city: "Panipat", state: "Haryana" },
  "133": { city: "Ambala", state: "Haryana" },
  "134": { city: "Panchkula", state: "Haryana" },
  "135": { city: "Yamunanagar", state: "Haryana" },
  "136": { city: "Kurukshetra", state: "Haryana" },

  // Punjab & Chandigarh
  "140": { city: "Mohali", state: "Punjab" },
  "141": { city: "Ludhiana", state: "Punjab" },
  "143": { city: "Amritsar", state: "Punjab" },
  "144": { city: "Jalandhar", state: "Punjab" },
  "147": { city: "Patiala", state: "Punjab" },
  "151": { city: "Bathinda", state: "Punjab" },
  "160": { city: "Chandigarh", state: "Chandigarh" },

  // Himachal Pradesh
  "171": { city: "Shimla", state: "Himachal Pradesh" },
  "173": { city: "Solan", state: "Himachal Pradesh" },
  "175": { city: "Mandi", state: "Himachal Pradesh" },
  "176": { city: "Dharamshala", state: "Himachal Pradesh" },

  // Jammu & Kashmir
  "180": { city: "Jammu", state: "Jammu and Kashmir" },
  "190": { city: "Srinagar", state: "Jammu and Kashmir" },
  "194": { city: "Leh", state: "Ladakh" },

  // Uttar Pradesh & Uttarakhand
  "201": { city: "Noida", state: "Uttar Pradesh" },
  "202": { city: "Aligarh", state: "Uttar Pradesh" },
  "203": { city: "Bulandshahr", state: "Uttar Pradesh" },
  "204": { city: "Hathras", state: "Uttar Pradesh" },
  "208": { city: "Kanpur", state: "Uttar Pradesh" },
  "209": { city: "Kanpur Dehat", state: "Uttar Pradesh" },
  "211": { city: "Prayagraj", state: "Uttar Pradesh" },
  "221": { city: "Varanasi", state: "Uttar Pradesh" },
  "224": { city: "Ayodhya", state: "Uttar Pradesh" },
  "226": { city: "Lucknow", state: "Uttar Pradesh" },
  "227": { city: "Lucknow", state: "Uttar Pradesh" },
  "228": { city: "Sultanpur", state: "Uttar Pradesh" },
  "230": { city: "Pratapgarh", state: "Uttar Pradesh" },
  "231": { city: "Mirzapur", state: "Uttar Pradesh" },
  "241": { city: "Hardoi", state: "Uttar Pradesh" },
  "243": { city: "Bareilly", state: "Uttar Pradesh" },
  "244": { city: "Moradabad", state: "Uttar Pradesh" },
  "245": { city: "Hapur", state: "Uttar Pradesh" },
  "246": { city: "Pauri Garhwal", state: "Uttarakhand" },
  "247": { city: "Saharanpur", state: "Uttar Pradesh" },
  "248": { city: "Dehradun", state: "Uttarakhand" },
  "249": { city: "Haridwar", state: "Uttarakhand" },
  "250": { city: "Meerut", state: "Uttar Pradesh" },
  "251": { city: "Muzaffarnagar", state: "Uttar Pradesh" },
  "262": { city: "Pilibhit", state: "Uttar Pradesh" },
  "263": { city: "Nainital", state: "Uttarakhand" },
  "271": { city: "Gonda", state: "Uttar Pradesh" },
  "272": { city: "Basti", state: "Uttar Pradesh" },
  "273": { city: "Gorakhpur", state: "Uttar Pradesh" },
  "281": { city: "Mathura", state: "Uttar Pradesh" },
  "282": { city: "Agra", state: "Uttar Pradesh" },
  "283": { city: "Firozabad", state: "Uttar Pradesh" },
  "284": { city: "Jhansi", state: "Uttar Pradesh" },

  // Rajasthan
  "301": { city: "Alwar", state: "Rajasthan" },
  "302": { city: "Jaipur", state: "Rajasthan" },
  "303": { city: "Jaipur Rural", state: "Rajasthan" },
  "305": { city: "Ajmer", state: "Rajasthan" },
  "311": { city: "Bhilwara", state: "Rajasthan" },
  "312": { city: "Chittorgarh", state: "Rajasthan" },
  "313": { city: "Udaipur", state: "Rajasthan" },
  "321": { city: "Bharatpur", state: "Rajasthan" },
  "324": { city: "Kota", state: "Rajasthan" },
  "334": { city: "Bikaner", state: "Rajasthan" },
  "335": { city: "Sri Ganganagar", state: "Rajasthan" },
  "342": { city: "Jodhpur", state: "Rajasthan" },

  // Gujarat
  "360": { city: "Rajkot", state: "Gujarat" },
  "361": { city: "Jamnagar", state: "Gujarat" },
  "362": { city: "Junagadh", state: "Gujarat" },
  "363": { city: "Surendranagar", state: "Gujarat" },
  "364": { city: "Bhavnagar", state: "Gujarat" },
  "370": { city: "Bhuj", state: "Gujarat" },
  "380": { city: "Ahmedabad", state: "Gujarat" },
  "382": { city: "Gandhinagar", state: "Gujarat" },
  "384": { city: "Mehsana", state: "Gujarat" },
  "387": { city: "Nadiad", state: "Gujarat" },
  "388": { city: "Anand", state: "Gujarat" },
  "390": { city: "Vadodara", state: "Gujarat" },
  "392": { city: "Bharuch", state: "Gujarat" },
  "395": { city: "Surat", state: "Gujarat" },
  "396": { city: "Valsad", state: "Gujarat" },

  // Maharashtra & Goa
  "400": { city: "Mumbai", state: "Maharashtra" },
  "401": { city: "Thane", state: "Maharashtra" },
  "402": { city: "Raigad", state: "Maharashtra" },
  "403": { city: "North Goa", state: "Goa" },
  "410": { city: "Pune Rural", state: "Maharashtra" },
  "411": { city: "Pune", state: "Maharashtra" },
  "412": { city: "Pune", state: "Maharashtra" },
  "413": { city: "Solapur", state: "Maharashtra" },
  "414": { city: "Ahmednagar", state: "Maharashtra" },
  "415": { city: "Satara", state: "Maharashtra" },
  "416": { city: "Kolhapur", state: "Maharashtra" },
  "421": { city: "Kalyan", state: "Maharashtra" },
  "422": { city: "Nashik", state: "Maharashtra" },
  "424": { city: "Dhule", state: "Maharashtra" },
  "425": { city: "Jalgaon", state: "Maharashtra" },
  "431": { city: "Chhatrapati Sambhaji Nagar", state: "Maharashtra" },
  "440": { city: "Nagpur", state: "Maharashtra" },
  "444": { city: "Amravati", state: "Maharashtra" },

  // Madhya Pradesh & Chhattisgarh
  "450": { city: "Khandwa", state: "Madhya Pradesh" },
  "452": { city: "Indore", state: "Madhya Pradesh" },
  "453": { city: "Indore", state: "Madhya Pradesh" },
  "456": { city: "Ujjain", state: "Madhya Pradesh" },
  "457": { city: "Ratlam", state: "Madhya Pradesh" },
  "462": { city: "Bhopal", state: "Madhya Pradesh" },
  "470": { city: "Sagar", state: "Madhya Pradesh" },
  "474": { city: "Gwalior", state: "Madhya Pradesh" },
  "482": { city: "Jabalpur", state: "Madhya Pradesh" },
  "486": { city: "Rewa", state: "Madhya Pradesh" },
  "490": { city: "Bhilai", state: "Chhattisgarh" },
  "491": { city: "Durg", state: "Chhattisgarh" },
  "492": { city: "Raipur", state: "Chhattisgarh" },
  "495": { city: "Bilaspur", state: "Chhattisgarh" },

  // Telangana & Andhra Pradesh
  "500": { city: "Hyderabad", state: "Telangana" },
  "501": { city: "Ranga Reddy", state: "Telangana" },
  "502": { city: "Medak", state: "Telangana" },
  "505": { city: "Karimnagar", state: "Telangana" },
  "506": { city: "Warangal", state: "Telangana" },
  "515": { city: "Anantapur", state: "Andhra Pradesh" },
  "517": { city: "Tirupati", state: "Andhra Pradesh" },
  "518": { city: "Kurnool", state: "Andhra Pradesh" },
  "520": { city: "Vijayawada", state: "Andhra Pradesh" },
  "522": { city: "Guntur", state: "Andhra Pradesh" },
  "524": { city: "Nellore", state: "Andhra Pradesh" },
  "530": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "533": { city: "Kakinada", state: "Andhra Pradesh" },
  "534": { city: "Eluru", state: "Andhra Pradesh" },

  // Karnataka
  "560": { city: "Bengaluru", state: "Karnataka" },
  "562": { city: "Bengaluru Rural", state: "Karnataka" },
  "563": { city: "Kolar", state: "Karnataka" },
  "570": { city: "Mysuru", state: "Karnataka" },
  "571": { city: "Mandya", state: "Karnataka" },
  "572": { city: "Tumakuru", state: "Karnataka" },
  "573": { city: "Hassan", state: "Karnataka" },
  "574": { city: "Dakshina Kannada", state: "Karnataka" },
  "575": { city: "Mangaluru", state: "Karnataka" },
  "576": { city: "Udupi", state: "Karnataka" },
  "577": { city: "Shivamogga", state: "Karnataka" },
  "580": { city: "Hubballi", state: "Karnataka" },
  "583": { city: "Ballari", state: "Karnataka" },
  "585": { city: "Kalaburagi", state: "Karnataka" },
  "590": { city: "Belagavi", state: "Karnataka" },

  // Tamil Nadu & Puducherry
  "600": { city: "Chennai", state: "Tamil Nadu" },
  "601": { city: "Tiruvallur", state: "Tamil Nadu" },
  "602": { city: "Kanchipuram", state: "Tamil Nadu" },
  "603": { city: "Chengalpattu", state: "Tamil Nadu" },
  "605": { city: "Puducherry", state: "Puducherry" },
  "606": { city: "Viluppuram", state: "Tamil Nadu" },
  "607": { city: "Cuddalore", state: "Tamil Nadu" },
  "608": { city: "Chidambaram", state: "Tamil Nadu" },
  "620": { city: "Tiruchirappalli", state: "Tamil Nadu" },
  "621": { city: "Perambalur", state: "Tamil Nadu" },
  "624": { city: "Dindigul", state: "Tamil Nadu" },
  "625": { city: "Madurai", state: "Tamil Nadu" },
  "627": { city: "Tirunelveli", state: "Tamil Nadu" },
  "628": { city: "Thoothukudi", state: "Tamil Nadu" },
  "629": { city: "Kanyakumari", state: "Tamil Nadu" },
  "630": { city: "Karaikudi", state: "Tamil Nadu" },
  "632": { city: "Vellore", state: "Tamil Nadu" },
  "635": { city: "Krishnagiri", state: "Tamil Nadu" },
  "636": { city: "Salem", state: "Tamil Nadu" },
  "637": { city: "Namakkal", state: "Tamil Nadu" },
  "638": { city: "Erode", state: "Tamil Nadu" },
  "641": { city: "Coimbatore", state: "Tamil Nadu" },
  "642": { city: "Pollachi", state: "Tamil Nadu" },
  "643": { city: "Nilgiris (Ooty)", state: "Tamil Nadu" },

  // Kerala
  "670": { city: "Kannur", state: "Kerala" },
  "671": { city: "Kasaragod", state: "Kerala" },
  "673": { city: "Kozhikode", state: "Kerala" },
  "676": { city: "Malappuram", state: "Kerala" },
  "678": { city: "Palakkad", state: "Kerala" },
  "679": { city: "Shornur", state: "Kerala" },
  "680": { city: "Thrissur", state: "Kerala" },
  "682": { city: "Kochi", state: "Kerala" },
  "683": { city: "Aluva", state: "Kerala" },
  "685": { city: "Idukki", state: "Kerala" },
  "686": { city: "Kottayam", state: "Kerala" },
  "688": { city: "Alappuzha", state: "Kerala" },
  "689": { city: "Pathanamthitta", state: "Kerala" },
  "691": { city: "Kollam", state: "Kerala" },
  "695": { city: "Thiruvananthapuram", state: "Kerala" },

  // West Bengal & Andaman
  "700": { city: "Kolkata", state: "West Bengal" },
  "711": { city: "Howrah", state: "West Bengal" },
  "712": { city: "Hooghly", state: "West Bengal" },
  "713": { city: "Durgapur / Bardhaman", state: "West Bengal" },
  "721": { city: "Medinipur", state: "West Bengal" },
  "722": { city: "Bankura", state: "West Bengal" },
  "723": { city: "Purulia", state: "West Bengal" },
  "731": { city: "Birbhum (Bolpur)", state: "West Bengal" },
  "732": { city: "Malda", state: "West Bengal" },
  "733": { city: "North Dinajpur", state: "West Bengal" },
  "734": { city: "Siliguri / Darjeeling", state: "West Bengal" },
  "735": { city: "Jalpaiguri", state: "West Bengal" },
  "736": { city: "Cooch Behar", state: "West Bengal" },
  "741": { city: "Nadia", state: "West Bengal" },
  "742": { city: "Murshidabad", state: "West Bengal" },
  "743": { city: "24 Parganas", state: "West Bengal" },
  "744": { city: "Port Blair", state: "Andaman and Nicobar Islands" },

  // Odisha
  "751": { city: "Bhubaneswar", state: "Odisha" },
  "752": { city: "Puri", state: "Odisha" },
  "753": { city: "Cuttack", state: "Odisha" },
  "756": { city: "Balasore", state: "Odisha" },
  "760": { city: "Berhampur", state: "Odisha" },
  "768": { city: "Sambalpur", state: "Odisha" },
  "769": { city: "Rourkela", state: "Odisha" },

  // Assam & North East
  "781": { city: "Guwahati", state: "Assam" },
  "782": { city: "Nagaon", state: "Assam" },
  "784": { city: "Tezpur", state: "Assam" },
  "785": { city: "Jorhat", state: "Assam" },
  "786": { city: "Dibrugarh", state: "Assam" },
  "788": { city: "Silchar", state: "Assam" },
  "791": { city: "Itanagar", state: "Arunachal Pradesh" },
  "793": { city: "Shillong", state: "Meghalaya" },
  "795": { city: "Imphal", state: "Manipur" },
  "796": { city: "Aizawl", state: "Mizoram" },
  "797": { city: "Kohima", state: "Nagaland" },
  "799": { city: "Agartala", state: "Tripura" },
  "737": { city: "Gangtok", state: "Sikkim" },

  // Bihar & Jharkhand
  "800": { city: "Patna", state: "Bihar" },
  "801": { city: "Patna Rural", state: "Bihar" },
  "802": { city: "Bhojpur (Ara)", state: "Bihar" },
  "803": { city: "Nalanda (Bihar Sharif)", state: "Bihar" },
  "823": { city: "Gaya", state: "Bihar" },
  "824": { city: "Aurangabad", state: "Bihar" },
  "825": { city: "Hazaribagh", state: "Jharkhand" },
  "826": { city: "Dhanbad", state: "Jharkhand" },
  "827": { city: "Bokaro", state: "Jharkhand" },
  "828": { city: "Dhanbad", state: "Jharkhand" },
  "829": { city: "Ramgarh", state: "Jharkhand" },
  "831": { city: "Jamshedpur", state: "Jharkhand" },
  "834": { city: "Ranchi", state: "Jharkhand" },
  "841": { city: "Saran (Chapra)", state: "Bihar" },
  "842": { city: "Muzaffarpur", state: "Bihar" },
  "843": { city: "Sitamarhi", state: "Bihar" },
  "844": { city: "Vaishali (Hajipur)", state: "Bihar" },
  "845": { city: "East Champaran (Motihari)", state: "Bihar" },
  "846": { city: "Darbhanga", state: "Bihar" },
  "847": { city: "Madhubani", state: "Bihar" },
  "848": { city: "Samastipur", state: "Bihar" },
  "851": { city: "Begusarai", state: "Bihar" },
  "852": { city: "Saharsa", state: "Bihar" },
  "854": { city: "Purnia", state: "Bihar" },
};

// 2-digit state fallback
const STATE_2_MAP: Record<string, string> = {
  "11": "Delhi",
  "12": "Haryana",
  "13": "Haryana",
  "14": "Punjab",
  "15": "Punjab",
  "16": "Chandigarh",
  "17": "Himachal Pradesh",
  "18": "Jammu and Kashmir",
  "19": "Jammu and Kashmir",
  "20": "Uttar Pradesh",
  "21": "Uttar Pradesh",
  "22": "Uttar Pradesh",
  "23": "Uttar Pradesh",
  "24": "Uttarakhand",
  "25": "Uttar Pradesh",
  "26": "Uttar Pradesh",
  "27": "Uttar Pradesh",
  "28": "Uttar Pradesh",
  "30": "Rajasthan",
  "31": "Rajasthan",
  "32": "Rajasthan",
  "33": "Rajasthan",
  "34": "Rajasthan",
  "36": "Gujarat",
  "37": "Gujarat",
  "38": "Gujarat",
  "39": "Gujarat",
  "40": "Maharashtra",
  "41": "Maharashtra",
  "42": "Maharashtra",
  "43": "Maharashtra",
  "44": "Maharashtra",
  "45": "Madhya Pradesh",
  "46": "Madhya Pradesh",
  "47": "Madhya Pradesh",
  "48": "Madhya Pradesh",
  "49": "Chhattisgarh",
  "50": "Telangana",
  "51": "Andhra Pradesh",
  "52": "Andhra Pradesh",
  "53": "Andhra Pradesh",
  "56": "Karnataka",
  "57": "Karnataka",
  "58": "Karnataka",
  "59": "Karnataka",
  "60": "Tamil Nadu",
  "61": "Tamil Nadu",
  "62": "Tamil Nadu",
  "63": "Tamil Nadu",
  "64": "Tamil Nadu",
  "67": "Kerala",
  "68": "Kerala",
  "69": "Kerala",
  "70": "West Bengal",
  "71": "West Bengal",
  "72": "West Bengal",
  "73": "West Bengal",
  "74": "West Bengal",
  "75": "Odisha",
  "76": "Odisha",
  "77": "Odisha",
  "78": "Assam",
  "79": "North Eastern States",
  "80": "Bihar",
  "81": "Bihar",
  "82": "Jharkhand",
  "83": "Jharkhand",
  "84": "Bihar",
  "85": "Bihar",
};

export async function lookupPincode(pincode: string): Promise<PincodeResult | null> {
  const cleanPin = pincode.replace(/\D/g, "").slice(0, 6);
  if (cleanPin.length !== 6) return null;

  // 1. Instant accurate client-side lookup from directory
  const prefix3 = cleanPin.slice(0, 3);
  if (PINCODE_3_MAP[prefix3]) {
    const res = PINCODE_3_MAP[prefix3];
    // Return early with local resolution
    // Then attempt live enhancement in background if needed
    tryRemoteLookup(cleanPin).catch(() => {});
    return res;
  }

  // 2. Try online API lookup
  const remote = await tryRemoteLookup(cleanPin);
  if (remote) return remote;

  // 3. Fallback to 2-digit state map
  const prefix2 = cleanPin.slice(0, 2);
  if (STATE_2_MAP[prefix2]) {
    return {
      city: `${STATE_2_MAP[prefix2]} District`,
      state: STATE_2_MAP[prefix2],
    };
  }

  return null;
}

async function tryRemoteLookup(pincode: string): Promise<PincodeResult | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (
        data &&
        Array.isArray(data) &&
        data[0]?.Status === "Success" &&
        Array.isArray(data[0]?.PostOffice) &&
        data[0].PostOffice.length > 0
      ) {
        const po = data[0].PostOffice[0];
        const city = po.District || po.Block || po.Circle || po.Name || "";
        const state = po.State || "";
        if (city || state) {
          return { city, state };
        }
      }
    }
  } catch {
    // remote failed
  }
  return null;
}
