import {useEffect, useState} from 'react';
import {Text, View, StyleSheet, ScrollView, Image, SafeAreaView, Button, useColorScheme} from 'react-native';
import LocalizedStrings from 'react-native-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './help-strings-en.json';
import is from './help-strings-is.json';
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
const specialKeys = require('./images/specialKeys.png');

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

function Help(props) {

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
    <ScrollView style={{paddingTop: 8, paddingLeft: 6, paddingRight: 6, backgroundColor: "white"}}>
      <View style={{marginLeft: Platform.OS === 'ios' ? 20 : 16, paddingBottom: 50}}>
        <View style={{ color: 'white', borderWidth: 0, backgroundColor: binBlue }}>
         <Button
           title={languageButtonLabel}
           onPress={() => setLanguageState( languageStored, setLanguageStored, translations, languageButtonLabel, setLanguageButtonLabel)}
           color={Platform.OS === 'ios' ? 'white' : binBlue}
           style={{borderRadius: 50}}
         />
         </View>
        {/*
        <Text style={styles.header}>{translations.special_characters}</Text>
        <Text style={styles.paragraph}>{translations.special_input}</Text>
        <Image source={specialKeys} style={styles.image} />
        <Text style={styles.paragraph}><Text style={{color: "red"}}>{translations.note}</Text>{Platform.OS === 'ios' ? translations.which_key_iphone : translations.which_key_android}</Text>
        */}
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.single_result}</Text>
        <Text style={styles.paragraph}>{translations.type_word}</Text>
        <Image source={searchFinna} style={styles.image} />
        <Text style={styles.paragraph}>{translations.single_word_found}</Text>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.multi_result}</Text>
        <Text style={styles.paragraph}>{translations.more_words}</Text>
        <Image source={searchRegular} style={styles.image} />
        <Text style={styles.paragraph}>{translations.touch_blue}</Text>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.case_search}</Text>
       <Text style={styles.paragraph}>{translations.switch_set}</Text>
        <Image source={switchImage} style={styles.image} />
        <Text style={styles.paragraph}>{translations.head_search}</Text>
        <Image source={switchImageOn} style={styles.image} />
        <Text style={styles.paragraph}>{translations.switch_on}</Text>
        <Text style={styles.paragraph}>{translations.switch_setting}</Text>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.search_star}</Text>
        <Text style={styles.paragraph}>{translations.star_matches}</Text>
        <Image source={talWildCard} style={styles.image} />
        <Text style={styles.paragraph}>{translations.star_example}</Text>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.searching_compound}</Text>
        <Text style={styles.paragraph}>
            {translations.find_compound}
        </Text>
        <Image source={starBord} style={styles.image} />
        <Text style={styles.paragraph}>
            {translations.star_anywhere}
        </Text>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.part_search}</Text>
        <Text style={styles.paragraph}>{translations.star_multi}</Text>
        <Image source={starGreid} style={styles.image} />
        <Text style={styles.paragraph}>{translations.helpful_parts}</Text>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.searching_under}</Text>
        <Text style={styles.paragraph}>{translations.under_match}</Text>
        <Image source={bUnderScore} style={styles.image} />
        <Text style={styles.paragraph}>{translations.under_spell}</Text>
        <View style={styles.separatorLine} />
        <Text style={styles.header}>{translations.under_multi}</Text>
        <Text style={styles.paragraph}>{translations.under_position}</Text>
        <Image source={underNNUnder} style={styles.image} />
        <Text style={styles.paragraph}>{translations.under_sure}</Text>
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}
export default Help;