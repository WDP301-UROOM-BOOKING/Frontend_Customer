import { FaWifi, FaSwimmingPool, FaParking, FaConciergeBell, FaUtensils, FaDumbbell, FaShuttleVan, FaSpa, FaChalkboardTeacher, FaDog, FaWineBottle, FaHandsWash } from "react-icons/fa";
import { getDistricts, getProvinces, getWards } from "vietnam-provinces";

// Transform provinces data
const transformProvinces = () => {
  try {
    const provinces = getProvinces();
    console.log('Provinces structure:', provinces); // Debug log
    
    if (Array.isArray(provinces)) {
      return provinces.map(province => ({
        value: province.name, // Sử dụng name từ API
        label: province.name
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error transforming provinces:', error);
    return [];
  }
};

// Transform districts data - group by province
const transformDistricts = () => {
  try {
    const districts = getDistricts();
    console.log('Districts structure:', districts); // Debug log
    
    const result = {};
    
    // Nếu districts trả về array với thông tin province trong mỗi district
    if (Array.isArray(districts)) {
      districts.forEach(district => {
        const provinceName = district.province_name; // Sử dụng province_name từ API
        const districtName = district.name; // Sử dụng name từ API
        
        if (!result[provinceName]) {
          result[provinceName] = [];
        }
        
        result[provinceName].push({
          value: districtName,
          label: districtName
        });
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error transforming districts:', error);
    return {};
  }
};

// Transform wards data - group by district
const transformWards = () => {
  try {
    const wards = getWards();
    console.log('Wards structure:', wards); // Debug log
    
    const result = {};
    
    // Nếu wards trả về array với thông tin district trong mỗi ward
    if (Array.isArray(wards)) {
      wards.forEach(ward => {
        const districtName = ward.district_name; // Sử dụng district_name từ API
        const wardName = ward.name; // Sử dụng name từ API
        
        if (!result[districtName]) {
          result[districtName] = [];
        }
        
        result[districtName].push({
          value: wardName,
          label: wardName
        });
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error transforming wards:', error);
    return {};
  }
};

// Export transformed data
export const cityOptionSelect = transformProvinces();
export const districtsByCity = transformDistricts();
export const wardsByDistrict = transformWards();



export const listFacilities = [
  { name: "Free Wi-Fi", icon: "FaWifi", description: "Free high-speed internet for guests.", iconTemp: FaWifi },
  { name: "Swimming Pool", icon: "FaSwimmingPool", description: "Spacious, clean, and modern swimming pool.", iconTemp: FaSwimmingPool },
  { name: "Parking Lot", icon: "FaParking", description: "Free parking available for staying guests.", iconTemp: FaParking },
  { name: "24/7 Room Service", icon: "FaConciergeBell", description: "Room service available at all times.", iconTemp: FaConciergeBell },
  { name: "Restaurant", icon: "FaUtensils", description: "Restaurant serving a wide variety of delicious dishes.", iconTemp: FaUtensils },
  { name: "Fitness Center", icon: "FaDumbbell", description: "Gym fully equipped with modern facilities.", iconTemp: FaDumbbell },
  { name: "Airport Shuttle", icon: "FaShuttleVan", description: "Convenient airport transfer service for guests.", iconTemp: FaShuttleVan },
  { name: "Spa & Wellness Center", icon: "FaSpa", description: "Relaxing spa treatments and wellness options.", iconTemp: FaSpa },
  { name: "Laundry Service", icon: "FaHandsWash", description: "Professional laundry and dry-cleaning service.", iconTemp: FaHandsWash },
  { name: "Conference Room", icon: "FaChalkboardTeacher", description: "Spacious and well-equipped conference facilities.", iconTemp: FaChalkboardTeacher },
  { name: "Pet-Friendly", icon: "FaDog", description: "Pets are welcome in designated rooms.", iconTemp: FaDog },
  { name: "Mini Bar", icon: "FaWineBottle", description: "In-room mini bar with snacks and beverages.", iconTemp: FaWineBottle }
];