import moment from "moment-timezone";

export default class Utils {
  static getDate(timestamp, type = 1, timezone = "Asia/Ho_Chi_Minh") {
    if (timestamp === null) {
      return "";
    }
    let result = null;
    switch (type) {
      case 1:
        result = moment.tz(timestamp, timezone).format("DD/MM/YYYY");
        break;
      case 2:
        result = moment.tz(timestamp, timezone).format("DD.MM.yyyy - HH:mm");
        break;
      case 3:
        result = moment.tz(timestamp, timezone).format("yyyy-MM-DD");
        break;
      case 4:
        result = moment.tz(timestamp, timezone).format("HH:mm:ss - DD.MM.yyyy");
        break;
      case 5:
        result = moment.tz(timestamp, timezone).format("DD.MM.yyyy - HH:mm");
        break;
      case 6:
        result = moment.tz(timestamp, timezone).format("HH:mm");
        break;
      case 7:
        result = moment.tz(timestamp, timezone).format("HH:mm:ss");
        break;
      case 8:
        result = moment.tz(timestamp, timezone).format("DD/MM");
        break;
      case 9:
        result = moment.tz(timestamp, timezone).format("DD/MM/YYYY");
        break;
      case 10:
        result = moment
          .tz(timestamp, timezone)
          .format("YYYY-MM-DDTHH:mm:ss.ssss");
        break;
      case 11:
        result = moment.tz(timestamp, timezone).format("HH:mm");
        break;
      case 12:
        result = moment.tz(timestamp, timezone).format("HHmm");
        break;
      case 13:
        result = moment.tz(timestamp, timezone).format("Month d yyyy");
        break;
      case 14:
        result = moment.tz(timestamp, timezone).format("YYYY-MM-DD");
        break;
      case 15:
        result = moment.tz(timestamp, timezone).format("MM/YYYY");
        break;
      case 16:
        result = moment.tz(timestamp, timezone).format("DD");
        break;
      case 17:
        result = moment.tz(timestamp, timezone).format("YYYY/MM/DD");
        break;
      case 18:
        result = moment.tz(timestamp, timezone).format("HH:mm DD/MM/YYYY");
        break;
      default:
        result = "";
        break;
    }
    return result;
  }
  static formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  static getFormattedMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const timezone = "Asia/Ho_Chi_Minh";
    const now = moment.tz(timezone).startOf("day");
    const date = moment.tz(timestamp, timezone).startOf("day");

    const isToday = date.isSame(now);

    return Utils.getDate(timestamp, isToday ? 11 : 18, timezone);
  };

  static calculateTotalPrice = (rooms) => {
    if (!rooms || !Array.isArray(rooms)) return 0;
    return rooms.reduce((total, roomItem) => {
      const roomPrice = roomItem.room?.price || 0;
      const quantity = roomItem.quantity || 1;
      return total + roomPrice * quantity;
    }, 0);
  };
}

export const cloudName = "dnel8ng9g";
