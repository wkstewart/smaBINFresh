import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'react-native';


export const setLanguageState = (languageStored, setLanguageStored, translations, languageButtonLabel, setLanguageButtonLabel) => {
   let newLanguage = "en";
   let newButtonLabel = "Íslensku";
   if(languageStored === "en") {
       newLanguage = "is";
       newButtonLabel = "English";
   }
   translations.setLanguage(newLanguage);
   setLanguageButtonLabel(newButtonLabel);
   setLanguageStored(newLanguage);
   storeData(newLanguage, languageStored, setLanguageStored);
}

let storeKey = 'languageSetting'
export const storeData = async (value, languageStored, setLanguageStored) => {
  try {
    await AsyncStorage.setItem(storeKey, JSON.stringify(value))
  } catch (e) {
    Toast.show({
      text: `Report this error: ${e.message}`,
      duration: Toast.durations.LONG
    });
  }
}

export const getData = async () => {
  try {
    const value = await AsyncStorage.getItem(storeKey)
    if(value !== null) {
      return JSON.parse(value);
    }
  } catch(e) {
    // error reading value
    Toast.show({
      text: `Report this error: ${e.message}`,
      duration: Toast.durations.LONG
    });
  }
}