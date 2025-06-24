import axios from "axios";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const WEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
export const extractTopHotelRequest = (message) => {
  const regex = /top\s*(\d+)\s*khách\s*sạn.*?(hà nội|đà nẵng|hồ chí minh|nha trang|đà lạt)/i;
  const match = message.match(regex);
  if (match) {
    return {
      count: parseInt(match[1]),
      city: match[2].toLowerCase(),
    };
  }
  return null;
};


export const extractCity = (text) => {
    const cities = ["Hà Nội", "Đà Nẵng", "Hồ Chí Minh", "Đà Lạt", "Nha Trang"];
    return cities.find((city) =>
        text.toLowerCase().includes(city.toLowerCase())
    );
};

// export const getWeatherForCity = async (city) => {
//     try {
//         const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=3&lang=vi`;
//         const res = await axios.get(url);
//         const forecastDays = res.data.forecast.forecastday;

//         return forecastDays
//             .map((day) => {
//                 const date = day.date;
//                 const avgTemp = day.day.avgtemp_c;
//                 const condition = day.day.condition.text;
//                 return `${date}: ${avgTemp}°C, ${condition}`;
//             })
//             .join("\n");
//     } catch (err) {
//         console.error("Lỗi lấy thời tiết:", err);
//         return "Không thể lấy thời tiết.";
//     }
// };
export const getWeatherForCity = async (city) => {
    try {
        // B1: Lấy lat/lon từ tên thành phố
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${WEATHER_API_KEY}`;
        const geoRes = await axios.get(geoUrl);
        if (!geoRes.data || geoRes.data.length === 0) return "Không tìm thấy vị trí thành phố.";
        const { lat, lon } = geoRes.data[0];

        // B2: Lấy dự báo 7 ngày từ OpenWeatherMap PRO
        const weatherUrl = `https://pro.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&appid=${WEATHER_API_KEY}&lang=vi`;
        const weatherRes = await axios.get(weatherUrl);
        const forecastDays = weatherRes.data.list;

        return forecastDays
            .map((day) => {
                const date = new Date(day.dt * 1000).toLocaleDateString("vi-VN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                });
                const avgTemp = Math.round(day.temp.day - 273.15);
                const condition = day.weather[0].description;
                const pop = typeof day.pop !== "undefined" ? `, Xác suất mưa: ${Math.round(day.pop * 100)}%` : "";
                return `${date}: ${avgTemp}°C, ${condition}${pop}`;
            })
            .join("\n");
    } catch (err) {
        console.error("Lỗi lấy thời tiết:", err);
        return "Không thể lấy thời tiết.";
    }
};

export const askGemini = async (question, weatherText = "") => {
    const prompt = `
Người dùng hỏi: "${question}"
${weatherText ? `\nDự báo thời tiết:\n${weatherText}` : ""}

Trả lời như một chuyên gia du lịch thông minh. Đưa ra gợi ý phù hợp với thời tiết nếu có.
`;

    try {
        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
            }
        );
        return (
            res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Không có câu trả lời."
        );
    } catch (err) {
        return "Lỗi từ AI: Không thể trả lời.";
    }
};
export const getTopHotels = (city, count) => {
    const hotelData = {
        "đà nẵng": [
            { name: "Furama Resort", rating: 4.9 },
            { name: "InterContinental", rating: 4.8 },
            { name: "Vinpearl Condotel", rating: 4.7 },
            { name: "Pullman", rating: 4.6 },
            { name: "Grand Tourane", rating: 4.5 },
        ],
        "hà nội": [
            { name: "Lotte Hotel", rating: 4.9 },
            { name: "JW Marriott", rating: 4.8 },
            { name: "Sofitel Metropole", rating: 4.7 },
        ],
        "hồ chí minh": [
            { name: "The Reverie Saigon", rating: 4.9 },
            { name: "Park Hyatt Saigon", rating: 4.8 },
            { name: "Caravelle Hotel", rating: 4.7 },
        ],
    };

    const hotels = hotelData[city];
    if (!hotels) return [];

    return hotels.slice(0, count);
};
export const getTopHotelsFromServer = async (location, count = 5) => {
  try {
    const res = await axios.get(
      `/api/hotels/get-top-hotel-location?location=${encodeURIComponent(location)}`
    );
    const hotels = res.data.hotels || [];

    return hotels.slice(0, count).map((hotel, idx) => {
      return `${idx + 1}. ${hotel.name} (${hotel.rating ?? "Chưa có đánh giá"}⭐)`;
    });
  } catch (error) {
    console.error("Lỗi lấy top khách sạn:", error);
    return [];
  }
};