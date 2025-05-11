const unsortedLanguageMap = new Map([
  ["as", "Assamese (India)"],
  ["bn", "Bengali (India)"],
  ["gu", "Gujarati (India)"],
  ["hi", "Hindi (India)"],
  ["kn", "Kannada (India)"],
  ["ml", "Malayalam (India)"],
  ["mr", "Marathi (India)"],
  ["ne", "Nepali (Nepal)"],
  ["or", "Odia (India)"],
  ["pa", "Punjabi (India)"],
  ["ta", "Tamil (India)"],
  ["te", "Telugu (India)"],
  ["ur", "Urdu (India)"],
  ["ar", "Arabic (Saudi Arabia)"],
  ["en", "English (India)"],
  ["fr", "French (France)"],
  ["de", "German (Germany)"],
  ["es", "Spanish (Spain)"],
  ["pt", "Portuguese (Brazil)"],
  ["it", "Italian (Italy)"],
  ["nl", "Dutch (Netherlands)"],
  ["ru", "Russian (Russia)"],
  ["zh", "Chinese (Mandarin)"],
  ["ko", "Korean (South Korea)"],
  ["ja", "Japanese (Japan)"],
  ["th", "Thai (Thailand)"],
  ["tr", "Turkish (Turkey)"],
  ["vi", "Vietnamese (Vietnam)"],
  ["fil", "Filipino (Philippines)"],
  ["he", "Hebrew (Israel)"],
  ["id", "Indonesian (Indonesia)"],
  ["hu", "Hungarian (Hungary)"],
  ["fi", "Finnish (Finland)"],
  ["sv", "Swedish (Sweden)"],
  ["no", "Norwegian (Norway)"],
  ["da", "Danish (Denmark)"],
  ["pl", "Polish (Poland)"],
  ["el", "Greek (Greece)"],
  ["cs", "Czech (Czech Republic)"],
  ["sk", "Slovak (Slovakia)"],
  ["ro", "Romanian (Romania)"],
  ["uk", "Ukrainian (Ukraine)"],
  ["bg", "Bulgarian (Bulgaria)"],
  ["sw", "Swahili (Kenya)"],
  ["ms", "Malay (Malaysia)"],
  ["lv", "Latvian (Latvia)"],
  ["lt", "Lithuanian (Lithuania)"],
  ["et", "Estonian (Estonia)"],
  ["eu", "Basque (Spain)"],
  ["ca", "Catalan (Spain)"],
  ["gl", "Galician (Spain)"],
  ["sr", "Serbian (Serbia)"],
  ["hr", "Croatian (Croatia)"],
  ["sl", "Slovenian (Slovenia)"]
]);

// Sort entries alphabetically by language name
const sortedEntries = [...unsortedLanguageMap.entries()].sort((a, b) =>
  a[1].localeCompare(b[1])
);

const languageMap = new Map(sortedEntries);

export const getLanguageName = (code) => languageMap.get(code);

export const getLanguageCode = (name) => {
  for (const [code, lang] of languageMap.entries()) {
    if (lang === name) return code;
  }
  return null;
};

export default languageMap;
