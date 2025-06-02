const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@adapter": path.resolve(__dirname, "src/adapter"),
      "@components": path.resolve(__dirname, "src/components"),
      "@css": path.resolve(__dirname, "src/css"),
      "@images": path.resolve(__dirname, "src/images"),
      "@libs": path.resolve(__dirname, "src/libs"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@redux": path.resolve(__dirname, "src/redux"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
};