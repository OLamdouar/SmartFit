// babel.config.js
module.exports = function(api) {
    api.cache(true);
    return {
      // "babel-preset-expo" is typical for Expo
      presets: ["babel-preset-expo"],
      plugins: [
        // ... other plugins you might use
        "react-native-reanimated/plugin" // Reanimated plugin MUST be listed last
      ],
    };
  };
  