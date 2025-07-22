import axios from "axios";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const WEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;


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
Bạn là trợ lý du lịch thông minh, thân thiện bằng tiếng Việt.
Câu hỏi khách hàng: "${question}"
${weatherText ? `\nThông tin thời tiết liên quan:\n${weatherText}` : ""}
Nếu có thông tin thời tiết, hãy đưa ra gợi ý phù hợp. Nếu không biết, hãy trả lời lịch sự.
Không lặp lại thông tin thời tiết đã cung cấp.
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