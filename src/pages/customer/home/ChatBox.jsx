import { askGemini, getWeatherForCity, extractCity } from "../utils/chatAI";

const sendMessage = () => {
  if (input.trim() !== "") {
    const userMessage = input.trim();
    setMessages([...messages, { text: input, sender: "user" }]);
    dispatch({
      type: ChatboxActions.ADD_MESSAGE,
      payload: {
        message: { text: input, sender: "user" },
      },
    });
    setInput("");

    setTimeout(async () => {
      const city = extractCity(userMessage);
      let weatherText = "";
      if (city) {
        weatherText = await getWeatherForCity(city);
      }

      const reply = await askGemini(userMessage, weatherText);

      setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);

      dispatch({
        type: ChatboxActions.ADD_MESSAGE,
        payload: {
          message: {
            text: reply,
            sender: "bot",
          },
        },
      });
    }, 1000);
  }
};
