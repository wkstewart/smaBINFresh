import {useEffect, useState} from 'react';
import {Text, View, StyleSheet, ScrollView, Image, Linking, SafeAreaView, Button} from 'react-native';
import LocalizedStrings from 'react-native-localization';
import en from './about-strings-en.json';
import is from './about-strings-is.json';
import { setLanguageState, storeData, getData } from './languageUtils';
import { useIsFocused } from '@react-navigation/native';

const searchFinna = require('./images/searchFinna.png');
const searchRegular = require('./images/searchRegular.png');
const switchImage = require('./images/switchControl.png');
const switchImageOn = require('./images/switchControlOn.png');
const talWildCard = require('./images/talWildCard.png');
const starBord = require('./images/starBord.png');
const starGreid = require('./images/starGreid.png');
const bUnderScore = require('./images/bUnderScore.png');
const underNNUnder = require('./images/underNNUnder.png');

const styles = StyleSheet.create({
  image: {
      paddingLeft: 0,
      borderWidth: 3,
      marginTop: 6,
  },
  header: {
      fontSize: 22,
      paddingTop: 0,
      fontWeight: 'bold',
      flexDirection: 'row',
      color: "black",
  },
  paragraph: {
      marginLeft: 4,
      width: "84%",
      fontSize: 16,
      paddingTop: 10,
      paddingBottom: 10,
      color: "black",
  },
  separatorLine: {
      flex: 1,
      height: 3,
      width: "100%",
      backgroundColor: '#2171b5'
  },
})

const binBlue = '#2171b5';
const languages = {en, is};
let translations = {};

async function initTranslations() {
  try {
    translations = await new LocalizedStrings(languages);
  } catch (e) {
    // saving error
  }
}

initTranslations();

function About(props) {
  const [languageButtonLabel, setLanguageButtonLabel] = useState("Íslensku");
  const [languageStored, setLanguageStored] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    getData().then(value => {
      let label = "Íslensku";
      if(value === 'is') {
        label = "English";
      }
      setLanguageButtonLabel(label);
      translations.setLanguage(value);
      setLanguageStored(value);
    });
   }, [props, isFocused]);

  return (
  <SafeAreaView style={{flex: 1}}>
    <ScrollView style={{paddingTop: 8, paddingLeft: 6, paddingRight: 6,
                      backgroundColor: 'white'}}>
      <View style={{marginLeft: Platform.OS === 'ios' ? 20 : 16, paddingBottom: 50}}>
        <View style={{ color: 'white', borderWidth: 1, backgroundColor: binBlue }}>
         <Button
           title={languageButtonLabel}
           onPress={() => setLanguageState( languageStored, setLanguageStored, translations, languageButtonLabel, setLanguageButtonLabel)}
           color={Platform.OS === 'ios' ? 'white' : binBlue}
         />
         </View>
        <Text style={styles.paragraph}>
         <Text style={{ fontWeight: 'bold', color: 'red' }}>{translations.note} </Text>{translations.app_limited_access}
         </Text>
        <Text style={styles.header}>{translations.word_set}</Text>
        <Text style={styles.paragraph}>
            {translations.word_set_text}
        </Text>
        <Text style={styles.paragraph}>
            {translations.is_appropriate}
        </Text>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.license_information}</Text>
        <Text style={styles.paragraph}>
            {translations.copyright}
        </Text>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.report_issues}</Text>
        <Text style={styles.paragraph}>
          {translations.for_problems}{translations.url}
        </Text>
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Button 
            title="Email Support"
            onPress={() => Linking.openURL('mailto:wkstewart@gmail.com')}
            color="blue"
          />
        </View>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.version_information}</Text>
        <Text style={styles.paragraph}>
          {translations.version}: 1.23.0 ({translations.build} 23){'\n'}
          {translations.react_native}: 0.73.9{'\n'}
          {translations.updated}: November 2025
        </Text>
        <View style={styles.separatorLine} />
      </View>
    </ScrollView>
  </SafeAreaView>

  );
}
export default About;
