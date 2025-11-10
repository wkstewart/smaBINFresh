import React, { useEffect, useState, useRef, createElement } from 'react';
import {Alert, Text, TextInput, StyleSheet, Linking, View, ScrollView, StatusBar, SafeAreaView, Keyboard, TouchableOpacity} from 'react-native';
// import { Link } from 'react-router-dom' // Web-only, not needed for mobile
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Switch } from '@rneui/themed'; // Use React Native Switch instead
import { Switch } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import LocalizedStrings from 'react-native-localization';
import en from './home-strings-en.json';
import is from './home-strings-is.json';

//TODO: Alþjóðaheilbrigðismálastofnun test word length, set dynamic font size???
//TODO: Bera test word search -- tested with switch change below. -- done!
//TODO: Berglind test word for search -- alt spellings with forward slashes -- done!
//TODO: add special character keys á ð é í ó ú ý þ æ ö, figure out best component
//TODO: change spacing on heading for android -- done!
//TODO: add switch for choosing search type == Leita að beygingarmynd -- done!
//TODO: Check to see if all word categories are supported -- done!
//afn: Afturbeygt fornafn xx
//ao: Atviksorð xx
//fn: Önnur fornöfn && eignarfornöfn xx
//fs: Forsetningar && //st: Samtengingar && //uh: Upphrópanir && //nhm: Nafnháttarmerki xx
//lo: Lýsingarorð xx
//no: Nafnorð xx
//pfn: Persónufornöfn xx
//rt: Raðtölur && //gr: Greinir xx
//so: Sagnorð xx
//to: Töluorð xx
//TODO: fix icons for android
//TODO: hamburger menu
//TODO: localization?? -- paid version??
//TODO: offline mode support?? -- paid version??

let binGray = '#e9ecef';
let binYellow = '#c88413';
let binBlue = '#2171b5';
//let binBlue = 'steelblue';

const styles = StyleSheet.create({
  sectionHeading1: {
      fontSize: 16,
      width: '100%',
      fontWeight: 'bold',
      lineHeight: 20,
      paddingLeft: 0,
      color: "black",
      alignItems: "flex-start",
  },
  sectionHeading2: {
      fontSize: 16,
      width: '100%',
      fontWeight: 'bold',
      alignItems: "flex-start",
      borderWidth: 0,
      color: "black",
  },
  sectionHeading3: {
      fontSize: 16,
      fontWeight: 'bold',
      //textDecorationLine: 'underline',
      width: '100%',
      alignItems: "flex-start",
      borderWidth: 0,
      color: "black",
  },
  wordName: {
      fontSize: 20,
      fontWeight: "bold",
      color: binBlue,
      width: '100%',
      alignItems: "flex-start",
      borderWidth: 0,
  },
  colorHeading: {
      flexDirection: 'row',
      paddingTop: 2,
      paddingBottom: 4,
      borderWidth: 0,
  },
  rowHeading1: {
      flex: 0,
      alignItems: "flex-start",
      backgroundColor: binGray,
      borderWidth: 0,
      paddingLeft: 5,
  },
  rowHeading: {
      flex: 1,
      alignItems: "center",
      backgroundColor: binGray,
      paddingLeft: 5,
      borderWidth: 0,
  },
  headerBar: {
      flex: 1,
      alignItems: "center",
  },
  elementLine: {
      flex: 1,
      alignItems: "flex-start",
      flexWrap: "nowrap",
      marginLeft: 4,
      borderWidth: 0,
  },
  nounLabel: {
      flex: 0,
      paddingLeft: 4,
      width: '10%',
      alignItems: "flex-start",
      fontSize: 18,
      borderWidth: 0,
  },
  searchInput: {
      backgroundColor: '#f5f5f5',
      borderWidth: 1,
      color: 'black',
      width: 200,
      flexDirection: 'row',
      paddingLeft: 5,
  },
  submitButton: {
      backgroundColor: '#f4511e',
      textAlignVertical: 'bottom',
      borderWidth: 3,
  },
  rowData: {
      flex: 1
  },
  rowList: {
      backgroundColor: '#f4511e',
      fontSize: 18,
  },
  personLabel: {
      width: '8%',
      marginRight: 4,
      paddingLeft: 4,
  },
  personText: {
      fontSize: 6,
  },
  viewLabel: {
          borderWidth: 0,
          width: '18%',
   },
  smallText: {
      fontSize: 14,
      color: "black",
  },
  fallLabel: {
      flex: 0,
      flexShrink: 1,
      flexWrap: "nowrap",
      paddingLeft: 2,
      paddingRight: 4,
      fontSize: 10,
      borderWidth: 0,
  },
  lineItem: {
      flex: 1,
      alignItems: "center",
      fontWeight: 'bold',
      color: binBlue,
      fontSize: 20,
  },
  separatorLine: {
      flex: 1,
      height: 2,
      backgroundColor: '#e9ecef'
  },
  plainText: {
      color: "black",
      fontSize: 16,
  },
});

const Home = () => {
  const [jsonObject, setJsonObject] = useState(null);
  const [wordData, setWordData] = useState([]);
  const [searchBoxInput, setSearchBoxInput] = useState('');
  const [numBmyndir, setNumBmyndir] = useState(0);
  const [numElements, setNumElements] = useState(0);
  const [parsedObject, setParsedObject] = useState(null);
  const [bodyElement, setBodyElement] = useState(0);
  const ScrollViewRef = useRef();
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('á');

  let resultData = new Map([]);
  let wordDataLength, wordCount, wordListDesc, wordName;

  const submitSearch = (searchValue, searchType) => {
    //Alert.alert(`searchValue ${searchValue}, searchType ${searchType}`);
    let res, response;
    try {
          let url;
          //Alert.alert(`type ${searchType}, value ${searchValue}`);
          //Alert.alert(`open ${open}`);
          if(open && searchType !== "guid") { //open is the switch for searching all beygingarmynd
            //Alert.alert(`open ${open}`);
            url = `https://bin.arnastofnun.is/api/beygingarmynd/${searchValue}`;
          }
          else {
            //Alert.alert(`open ${open}`);
            url = `https://bin.arnastofnun.is/api/ord/${searchValue}`;
          }
          //https://bin.arnastofnun.is/api/beygingarmynd/undir
          //Alert.alert(`URL ${url}`);
          //console.log(`URL ${url}`);
          let res = axios.get(url)
            .then(response => {
                setWordData(response.data);
                Keyboard.dismiss();
                ScrollViewRef.current.scrollTo({ y: 0, x: 0});
            })
            .catch(error => console.log(error));
            //Alert.alert(`wordData`);
            //Alert.alert(`wordData ${JSON.stringify(response.data[0])}`);
            //console.log(`${JSON.stringify(wordData)}`);
    } catch (error) {
          //Alert.alert(`error in get ${error}`);
          //console.log(error);
    }
    //Alert.alert(`wordData ${JSON.stringify(wordData)}`);
    //console.log(wordData);
  }


  //[Ss]agnorð
  //#1. GM_FH_NT, Germynd_Persónuleg_notkun_Framsöguháttur, GM-FH-NT-1P-ET
  //#2. OP_PF_GM_FH_NT, Germynd_Ópersónuleg_notkun - (Frumlag í þolfalli), OP-ÞF-GM-FH-NT-1P-ET
  //#2a. OP_PGF_GM_FH_NT, Germynd_Ópersónuleg_notkun - (Frumlag í þágufalli), OP-ÞGF-GM-FH-NT-1P-ET
  //#2b. OP_EF_GM_FH_NT, Germynd_Ópersónuleg_notkun - (Frumlag í eignarfalli), OP-EF-GM-FH-NT-1P-ET
  //#3. OP_PAD_GM_FH, Germynd_Ópersónuleg notkun - (Gervifrumlag), OP-það-GM-FH-NT-3P-ET
  //#4. MM_FH_NT, Miðmynd_Persónuleg_notkun_Framsöguháttur, MM-FH-NT-1P-ET
  //#5. OP_PGF_MM_FH, Miðmynd_Ópersónuleg_notkun - (Frumlag í þágufalli), OP-ÞGF-MM-FH-NT-1P-ET
  //#6. OP_PAD_MM_FH, Germynd_Ópersónuleg notkun - (Gervifrumlag), OP-það-MM-FH-NT-3P-ET
  //#7. GM_BH_ST, Boðháttur, GM-BH-ST
  //#8. LHNT, Lýsingarháttur nútíðar, LHNT
  //#8a. SAG, Sagnbót
  //#9. LHÞT_SB_KK, Lýsingarháttur þátíðar, LHÞT-SB-KK-NFET
  //#10. SP_GM_FH, Spurnarmyndir_Germynd_Framsöguháttur, SP-GM-FH-NT-2P-ET

  //Sagnorð Section
  //#1. GM_FH_NT, Germynd_Persónuleg_notkun_Framsöguháttur, GM-FH-NT-1P-ET
  const display_GM_FH_NT = [0]
  const GM_FH_NT = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading2}>Persónuleg notkun</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ég</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-NT-1P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>við</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-NT-1P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þú</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-NT-2P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þið</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-NT-2P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hún{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-NT-3P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeir{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-NT-3P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ég</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-ÞT-1P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>við</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-ÞT-1P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þú</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-ÞT-2P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þið</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-ÞT-2P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hún{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-ÞT-3P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeir{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-FH-ÞT-3P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ég</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-NT-1P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>við</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-NT-1P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þú</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-NT-2P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þið</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-NT-2P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hún{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-NT-3P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeir{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-NT-3P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ég</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-ÞT-1P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>við</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-ÞT-1P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þú</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-ÞT-2P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þið</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-ÞT-2P-FT', display_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hún{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-ÞT-3P-ET', display_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeir{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-VH-ÞT-3P-FT', display_GM_FH_NT)}</Text></View>
          </View>
        </>;
    if(!display_GM_FH_NT[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#2. OP-ÞF-GM-FH-NT, Germynd_Ópersónuleg_notkun - (Frumlag í þolfalli), OP-ÞF-GM-FH-NT-1P-ET
  const display_OP_PF_GM_FH_NT = [0]
  const OP_PF_GM_FH_NT = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading2}>Ópersónuleg notkun - (Frumlag í þolfalli)</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-NT-1P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-NT-1P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-NT-2P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-NT-2P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hana{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-NT-3P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þá{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-NT-3P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-ÞT-1P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-ÞT-1P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-ÞT-2P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-ÞT-2P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hana{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-ÞT-3P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þá{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-FH-ÞT-3P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-NT-1P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-NT-1P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-NT-2P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-NT-2P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hana{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-NT-3P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þá{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-NT-3P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-ÞT-1P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-ÞT-1P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-ÞT-2P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-ÞT-2P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hana{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-ÞT-3P-ET', display_OP_PF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þá{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞF-GM-VH-ÞT-3P-FT', display_OP_PF_GM_FH_NT)}</Text></View>
          </View>
        </>;
    if(!display_OP_PF_GM_FH_NT[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#2a. OP_PGF_GM_FH_NT, Germynd_Ópersónuleg_notkun - (Frumlag í þágufalli), OP-ÞGF-GM-FH-NT-1P-ET
  const display_OP_PGF_GM_FH_NT = [0]
  const OP_PGF_GM_FH_NT = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading2}>Ópersónuleg notkun - (Frumlag í þágufalli)</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-NT-1P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-NT-1P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-NT-2P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-NT-2P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>honum{"\n"}henni{"\n"}því</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-NT-3P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeim{"\n"}þeim{"\n"}þeim</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-NT-3P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-ÞT-1P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-ÞT-1P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-ÞT-2P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-ÞT-2P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>honum{"\n"}henni{"\n"}því</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-ÞT-3P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeim{"\n"}þeim{"\n"}þeim</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-FH-ÞT-3P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-NT-1P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-NT-1P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-NT-2P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-NT-2P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>honum{"\n"}henni{"\n"}því</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-NT-3P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeim{"\n"}þeim{"\n"}þeim</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-NT-3P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-ÞT-1P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-ÞT-1P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-ÞT-2P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-ÞT-2P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>honum{"\n"}henni{"\n"}því</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-ÞT-3P-ET', display_OP_PGF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeim{"\n"}þeim{"\n"}þeim</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-GM-VH-ÞT-3P-FT', display_OP_PGF_GM_FH_NT)}</Text></View>
          </View>
        </>;
    if(!display_OP_PGF_GM_FH_NT[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#2b. OP_EF_GM_FH_NT, Germynd_Ópersónuleg_notkun - (Frumlag í eignarfalli), OP-EF-GM-FH-NT-1P-ET
  const display_OP_EF_GM_FH_NT = [0]
  const OP_EF_GM_FH_NT = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading2}>Ópersónuleg notkun - (Frumlag í eignarfalli)</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-NT-1P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-NT-1P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-NT-2P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-NT-2P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hana{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-NT-3P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þá{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-NT-3P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-ÞT-1P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-ÞT-1P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-ÞT-2P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-ÞT-2P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hana{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-ÞT-3P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þá{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-FH-ÞT-3P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-NT-1P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-NT-1P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-NT-2P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-NT-2P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hana{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-NT-3P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þá{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-NT-3P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-ÞT-1P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-ÞT-1P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þig</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-ÞT-2P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-ÞT-2P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hana{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-ÞT-3P-ET', display_OP_EF_GM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þá{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-EF-GM-VH-ÞT-3P-FT', display_OP_EF_GM_FH_NT)}</Text></View>
          </View>
        </>;
    if(!display_OP_EF_GM_FH_NT[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#3. OP-það-GM-FH, Germynd_Ópersónuleg notkun - (Gervifrumlag), OP-það-GM-FH-NT-3P-ET
  const display_OP_PAD_GM_FH = [0]
  const OP_PAD_GM_FH = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 4}}>
            <Text style={styles.sectionHeading2}>Ópersónuleg notkun - (Gervifrumlag)</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-GM-FH-NT-3P-ET', display_OP_PAD_GM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-GM-FH-NT-3P-FT', display_OP_PAD_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-GM-FH-ÞT-3P-ET', display_OP_PAD_GM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-GM-FH-ÞT-3P-FT', display_OP_PAD_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-GM-VH-NT-3P-ET', display_OP_PAD_GM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-GM-VH-NT-3P-FT', display_OP_PAD_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-GM-VH-ÞT-3P-ET', display_OP_PAD_GM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-GM-VH-ÞT-3P-FT', display_OP_PAD_GM_FH)}</Text></View>
          </View>
        </>;
    if(!display_OP_PAD_GM_FH[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#4. MM-FH-NT, Miðmynd_Persónuleg_notkun_Framsöguháttur, MM-FH-NT-1P-ET
  const display_MM_FH_NT = [0]
  const MM_FH_NT = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <Text style={styles.sectionHeading1}>Miðmynd</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{width: '100%', alignItems: "flex-start", borderWidth: 0}}><Text style={styles.plainText}>Nafnháttur</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flexDirection: 'row', width: '100%', alignItems: "center", paddingBottom: 12}}>
              <Text style={styles.plainText}>að </Text>
              <Text style={styles.wordName}>{getResultData('MM-NH', display_MM_FH_NT)}</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading2}>Persónuleg notkun</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ég</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-NT-1P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>við</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-NT-1P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þú</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-NT-2P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þið</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-NT-2P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hún{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-NT-3P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeir{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-NT-3P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ég</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-ÞT-1P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>við</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-ÞT-1P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þú</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-ÞT-2P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þið</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-ÞT-2P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hún{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-ÞT-3P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeir{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-FH-ÞT-3P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ég</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-NT-1P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>við</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-NT-1P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þú</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-NT-2P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þið</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-NT-2P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hún{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-NT-3P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeir{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-NT-3P-FT', display_MM_FH_NT)}</Text></View></View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ég</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-ÞT-1P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>við</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-ÞT-1P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þú</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-ÞT-2P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þið</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-ÞT-2P-FT', display_MM_FH_NT)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>hann{"\n"}hún{"\n"}það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-ÞT-3P-ET', display_MM_FH_NT)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeir{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-VH-ÞT-3P-FT', display_MM_FH_NT)}</Text></View>
          </View>
        </>;
    if(!display_MM_FH_NT[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#5. OP-ÞGF-MM-FH, Miðmynd_Ópersónuleg_notkun - (Frumlag í þágufalli), OP-ÞGF-MM-FH-NT-1P-ET
  const display_OP_PGF_MM_FH = [0]
  const OP_PGF_MM_FH = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 4}}>
            <Text style={styles.sectionHeading2}>Ópersónuleg notkun - (Frumlag í þágufalli)</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-NT-1P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-NT-1P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-NT-2P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-NT-2P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>honum{"\n"}henni{"\n"}því</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-NT-3P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeim{"\n"}þeim{"\n"}þeim</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-NT-3P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-ÞT-1P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-ÞT-1P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-ÞT-2P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-ÞT-2P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>honum{"\n"}henni{"\n"}því</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-ÞT-2P-FT', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeim{"\n"}þeim{"\n"}þeim</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-FH-ÞT-3P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-NT-1P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-NT-1P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-NT-2P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-NT-2P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>honum{"\n"}henni{"\n"}því</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-NT-3P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeim{"\n"}þeim{"\n"}þeim</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-NT-3P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>1.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>mér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-ÞT-1P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>okkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-ÞT-1P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þér</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-ÞT-2P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>ykkur</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-ÞT-2P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>honum{"\n"}henni{"\n"}því</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-ÞT-3P-ET', display_OP_PGF_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>þeir{"\n"}þær{"\n"}þau</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-ÞGF-MM-VH-ÞT-3P-FT', display_OP_PGF_MM_FH)}</Text></View>
          </View>
        </>;
    if(!display_OP_PGF_MM_FH[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#6. OP-það-MM-FH, Germynd_Ópersónuleg notkun - (Gervifrumlag), OP-það-MM-FH-NT-3P-ET
  const display_OP_PAD_MM_FH = [0]
  const OP_PAD_MM_FH = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 4}}>
            <Text style={styles.sectionHeading2}>Ópersónuleg notkun - (Gervifrumlag)</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-MM-FH-NT-3P-ET', display_OP_PAD_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-MM-FH-NT-3P-FT', display_OP_PAD_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-MM-FH-ÞT-3P-ET', display_OP_PAD_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-MM-FH-ÞT-3P-FT', display_OP_PAD_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-MM-VH-NT-3P-ET', display_OP_PAD_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-MM-VH-NT-3P-FT', display_OP_PAD_MM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.personLabel}><Text style={styles.smallText}>3.p.</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-MM-VH-ÞT-3P-ET', display_OP_PAD_MM_FH)}</Text></View>
              <View style={styles.viewLabel}><Text style={styles.smallText}>það</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('OP-það-MM-VH-ÞT-3P-FT', display_OP_PAD_MM_FH)}</Text></View>
          </View>
        </>;
    if(!display_OP_PAD_MM_FH[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#7. GM-BH-ST, Boðháttur, GM-BH-ST
  const display_GM_BH_ST = [0]
  const GM_BH_ST = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading1}>Boðháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Germynd</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Miðmynd</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={{width: "14%"}}><Text style={styles.smallText}>Stýfður</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-BH-ST', display_GM_BH_ST)}</Text></View>
              <View><Text></Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-BH-ST', display_GM_BH_ST)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={{width: "14%"}}><Text style={styles.smallText}>Et.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-BH-ET', display_GM_BH_ST)}</Text></View>
              <View><Text></Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-BH-ET', display_GM_BH_ST)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={{width: "14%"}}><Text style={styles.smallText}>Ft.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-BH-FT', display_GM_BH_ST)}</Text></View>
              <View><Text></Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-BH-FT', display_GM_BH_ST)}</Text></View>
          </View>
        </>;
    if(!display_GM_BH_ST[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#8. LHNT, Lýsingarháttur nútíðar, LHNT
  const display_LHNT = [0]
  const LHNT = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading1}>Lýsingarháttur nútíðar</Text>
          </View>
          <View style={{flex: 2, width: '100%'}}>
            <Text style={styles.wordName}>{getResultData('LHNT', display_LHNT)}</Text>
          </View>
        </>;
    if(!display_LHNT[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#8a. SAG, Sagnbót
  const display_SAG = [0]
  const SAG = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading1}>Sagnbót</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Germynd</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Miðmynd</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View><Text></Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('GM-SAGNB', display_SAG)}</Text></View>
              <View><Text></Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MM-SAGNB', display_SAG)}</Text></View>
          </View>
        </>;
    if(!display_SAG[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#9. LHÞT-SB-KK, Lýsingarháttur þátíðar, LHÞT-SB-KK-NFET
  const display_LHÞT_SB_KK = [0]
  const LHÞT_SB_KK = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading1}>Lýsingarháttur þátíðar</Text>
          </View>
          <View style={{flex: 2, width: '100%'}}>
            <Text style={styles.sectionHeading3}>Sterk beyging</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KK-NFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KVK-NFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-HK-NFET', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KK-ÞFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KVK-ÞFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-HK-ÞFET', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KK-ÞGFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KVK-ÞGFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-HK-ÞGFET', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KK-EFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KVK-EFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-HK-EFET', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Ft.</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KK-NFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KVK-NFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-HK-NFFT', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KK-ÞFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KVK-ÞFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-HK-ÞFFT', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KK-ÞGFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KVK-ÞGFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-HK-ÞGFFT', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KK-EFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-KVK-EFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-SB-HK-EFFT', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flex: 2, width: '100%'}}>
            <Text style={styles.sectionHeading3}>Veik beyging</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KK-NFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KVK-NFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-HK-NFET', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KK-ÞFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KVK-ÞFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-HK-ÞFET', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KK-ÞGFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KVK-ÞGFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-HK-ÞGFET', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KK-EFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KVK-EFET', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-HK-EFET', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Ft.</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KK-NFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KVK-NFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-HK-NFFT', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KK-ÞFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KVK-ÞFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-HK-ÞFFT', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KK-ÞGFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KVK-ÞGFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-HK-ÞGFFT', display_LHÞT_SB_KK)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KK-EFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-KVK-EFFT', display_LHÞT_SB_KK)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('LHÞT-VB-HK-EFFT', display_LHÞT_SB_KK)}</Text></View>
          </View>
        </>;
    if(!display_LHÞT_SB_KK[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //#10. SP-GM-FH, Spurnarmyndir_Germynd_Framsöguháttur, SP-GM-FH-NT-2P-ET
  const display_SP_GM_FH = [0]
  const SP_GM_FH = () => {
    sectionHtml =
        <>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <Text style={styles.sectionHeading1}>Spurnarmyndir</Text>
          </View>
          <View style={{width: '100%', flex: 2}}>
            <Text style={styles.sectionHeading1}>Germynd</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{width: '100%', borderWidth: 0}}>
              <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-GM-FH-NT-2P-ET', display_SP_GM_FH)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-GM-FH-NT-2P-FT', display_SP_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-GM-FH-ÞT-2P-ET', display_SP_GM_FH)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-GM-FH-ÞT-2P-FT', display_SP_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{width: '100%', borderWidth: 0}}>
              <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-GM-VH-NT-2P-ET', display_SP_GM_FH)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-GM-VH-NT-2P-FT', display_SP_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-GM-VH-ÞT-2P-ET', display_SP_GM_FH)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-GM-VH-ÞT-2P-FT', display_SP_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{width: '100%', flex: 2}}>
            <Text style={styles.sectionHeading1}>Miðmynd</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <Text style={styles.sectionHeading3}>Framsöguháttur</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-MM-FH-NT-2P-ET', display_SP_GM_FH)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-MM-FH-NT-2P-FT', display_SP_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-MM-FH-ÞT-2P-ET', display_SP_GM_FH)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-MM-FH-ÞT-2P-FT', display_SP_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{width: '100%', borderWidth: 0}}>
              <Text style={styles.sectionHeading3}>Viðtengingarháttur</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.rowHeading1}><Text style={styles.plainText}>Nútíð</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-MM-VH-NT-2P-ET', display_SP_GM_FH)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-MM-VH-NT-2P-FT', display_SP_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Þátið</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:2}]}><Text style={styles.plainText}>Ft.</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.personLabel}><Text style={styles.smallText}>2.p.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-MM-VH-ÞT-2P-ET', display_SP_GM_FH)}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('SP-MM-VH-ÞT-2P-FT', display_SP_GM_FH)}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
        </>;
    if(!display_SP_GM_FH[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //Atviksorð Section
  //#11. [Aa]tviksorð
  const display_FST = [0]
  const FST = () => {
    sectionHtml =
        <>
         <View style={{flexDirection: 'row', paddingTop: 10}}>
           <View style={{flex: 1, backgroundColor: binGray, paddingLeft: 5}}><Text style={styles.plainText}>Frumstig</Text></View>
           <View style={{flex: 1, backgroundColor: binGray}}><Text style={styles.plainText}>Miðstig</Text></View>
           <View style={{flex: 1, backgroundColor: binGray}}><Text style={styles.plainText}>Efsta stig</Text></View>
         </View>
         <View style={{flexDirection: 'row', paddingTop: 10}}>
           <View style={{flex: 1, paddingLeft: 6}}><Text style={styles.lineItem}>{getResultData('FST', display_FST)}</Text></View>
           <View style={{flex: 1, paddingLeft: 6}}><Text style={styles.lineItem}>{getResultData('MST', display_FST)}</Text></View>
           <View style={{flex: 1, paddingLeft: 6}}><Text style={styles.lineItem}>{getResultData('EST', display_FST)}</Text></View>
         </View>
        </>;
    if(!display_FST[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  //Lýsingarorð Section
  //#12. /singar /[Ll]ýsingarorð/
  const display_FSB = [0]
  const FSB = () => {
    sectionHtml =
        <>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <Text style={styles.sectionHeading1}>Frumstig</Text>
            </View>
            <View style={{flex: 2, width: '100%'}}>
              <Text style={styles.sectionHeading3}>Sterk beyging</Text>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Et.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KK-NFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KVK-NFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-HK-NFET', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KK-ÞFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KVK-ÞFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-HK-ÞFET', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KK-ÞGFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KVK-ÞGFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-HK-ÞGFET', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KK-EFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KVK-EFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-HK-EFET', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Ft.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KK-NFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KVK-NFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-HK-NFFT', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KK-ÞFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KVK-ÞFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-HK-ÞFFT', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KK-ÞGFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KVK-ÞGFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-HK-ÞGFFT', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KK-EFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-KVK-EFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FSB-HK-EFFT', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flex: 2, width: '100%'}}>
              <Text style={styles.sectionHeading3}>Veik beyging</Text>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Et.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KK-NFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KVK-NFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-HK-NFET', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KK-ÞFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KVK-ÞFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-HK-ÞFET', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KK-ÞGFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KVK-ÞGFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-HK-ÞGFET', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-HK-EFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KVK-EFET', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-HK-EFET', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Ft.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KK-NFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KVK-NFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-HK-NFFT', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KK-ÞFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KVK-ÞFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-HK-ÞFFT', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KK-ÞGFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KVK-ÞGFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-HK-ÞGFFT', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KK-EFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-KVK-EFFT', display_FSB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('FVB-HK-EFFT', display_FSB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
        </>;
    if(!display_FSB[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  const display_MST = [0]
  const MST = () => {
    sectionHtml =
        <>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <Text style={styles.sectionHeading1}>Miðstig</Text>
            </View>
            <View style={{flex: 2, width: '100%'}}>
              <Text style={styles.sectionHeading3}>Veik beyging</Text>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Et.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KK-NFET', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KVK-NFET', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-HK-NFET', display_MST)}</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KK-ÞFET', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KVK-ÞFET', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-HK-ÞFET', display_MST)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KK-ÞFET', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KVK-ÞFET', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-HK-ÞFET', display_MST)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KK-EFET', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KK-EFET', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-HK-EFET', display_MST)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Ft.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KK-NFFT', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KVK-NFFT', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-HK-NFFT', display_MST)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KK-ÞFFT', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KVK-ÞFFT', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-HK-ÞFFT', display_MST)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KK-ÞGFFT', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KVK-ÞGFFT', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-HK-ÞGFFT', display_MST)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KK-EFFT', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-KVK-EFFT', display_MST)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('MST-HK-EFFT', display_MST)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
        </>;
    if(!display_MST[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  const display_ESB = [0]
  const ESB = () => {
    sectionHtml =
        <>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <Text style={styles.sectionHeading1}>Efsta stig</Text>
            </View>
            <View style={{flex: 2, width: '100%'}}>
              <Text style={styles.sectionHeading3}>Sterk beyging</Text>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Et.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KK-NFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KVK-NFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-HK-NFET', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KK-ÞFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KVK-ÞFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-HK-ÞFET', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KK-ÞGFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KVK-ÞGFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-HK-ÞGFET', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KK-EFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KVK-EFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-HK-EFET', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Ft.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KK-NFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KVK-NFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-HK-NFFT', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KK-ÞFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KVK-ÞFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-HK-ÞFFT', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KK-ÞGFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KVK-ÞGFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-HK-ÞGFFT', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KK-EFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-KVK-EFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ESB-HK-EFFT', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flex: 2, width: '100%'}}>
              <Text style={styles.sectionHeading3}>Veik beyging</Text>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Et.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KK-NFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KVK-NFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-HK-NFET', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KK-ÞFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KVK-ÞFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-HK-ÞFET', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KK-ÞGFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KVK-ÞGFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-HK-ÞGFET', display_ESB)}</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KK-EFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KVK-EFET', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-HK-EFET', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Ft.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KK-NFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KVK-NFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-HK-NFFT', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KK-ÞFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KVK-ÞFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-HK-ÞFFT', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KK-ÞGFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KVK-ÞGFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-HK-ÞGFFT', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KK-EFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-KVK-EFFT', display_ESB)}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EVB-HK-EFFT', display_ESB)}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
        </>;
    if(!display_ESB[0]) {
        return null
    }
    else {
        return (sectionHtml)
    }
  }

  const ColorHeadingComponent = () => {
    return (
      <>
            <View style={styles.colorHeading}>
              <View style={{flexDirection: 'row', width: '100%', alignItems: "center"}}>
               <Text style={{fontSize: 20, lineHeight: 20, paddingRight: 4, color: "black"}}>{wordData[0].ord}</Text>
                <Text style={{flex: 0, alignItems: "flex-start", borderWidth: 0, color: binBlue, paddingRight: 0, lineHeight: 20}}>{makeSplitString(wordData[0].skyring,  wordData[0].ofl_heiti)[0]}</Text>
                <Text style={{flex: 0, alignItems: "flex-start", borderWidth: 0, color: binYellow, paddingRight: 0, lineHeight: 20}}>{ makeSplitString(wordData[0].skyring,  wordData[0].ofl_heiti)[1] }</Text>
                <Text style={{flex: 0, alignItems: "flex-start", borderWidth: 0, color: "grey", paddingRight: 0, lineHeight: 20}}>{ makeSplitString(wordData[0].skyring,  wordData[0].ofl_heiti)[2] }</Text>
              </View>
            </View>
      </>
    )
  }

  const renderInputBox = (searchBoxInput) => {
    return (
      <>
      <View
        style={{
          marginTop: Platform.OS === 'ios' ? 8 : 8,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: 50,
	  borderWidth: 0
        }}
      >
        <TextInput
          name="searchBoxInput"
          style={{ fontSize: 18, 
		        padding: 0,
		        color: 'black',
                textAlignVertical: 'center', 
                borderBottomColor: '#b9bbbd',
                borderBottomWidth: 2,
                height: 50, width: '70%'}}
          autoCapitalize='none'
          placeholder = "Leit í beygingarlýsingu"
          placeholderTextColor="#b9bbbd"
          onChangeText={(text) => {
            setSearchBoxInput(text);
          }}
          onSubmitEditing={() => submitSearch(searchBoxInput, "ord")}
        />

        <TouchableOpacity
          onPress={() => submitSearch(searchBoxInput, "ord")}
          color={Platform.OS === 'ios' ? 'white' : binBlue}
          style={{backgroundColor: binBlue, borderRadius: 10}}
        >
          <Icon name="search" color={'white'} size={24} style={{alignSelf: 'center', padding: 8}} />
        </TouchableOpacity>

      </View>

      <View style={{borderWidth: 0, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', height: 46, width: '100%', paddingTop: 10, paddingRight: 10}}>
        <Text style={{color: binBlue, paddingRight: 2}}>Leita að beygingarmynd</Text>
          <Switch value={open}
                  onValueChange={storeData}
                  style={{ transform: [{ scaleX: Platform.OS === 'ios' ? .65 : .95}, { scaleY: Platform.OS === 'ios' ? .65 : .95}] }}
        />
      </View>
      </>
    )
  }


  // Retrieve initial value from storage when component mounts
   useEffect(() => {
     getData().then(value => {
       setOpen(value); //TODO: sets the state of the switch, needs better name
     });
   }, []);

  const storeKey = 'beygingarmynd'
  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem(storeKey, JSON.stringify(value))
    } catch (e) {
      // saving error
    }
    setOpen(value);
  }

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem(storeKey)
      if(value !== null) {
        return JSON.parse(value);
      }
    } catch(e) {
      // error reading value
    }
  }

  function submitLink(linkGuid, linkType) {
    //Alert.alert(`submitLink ${linkGuid} ${linkType} ${linkWord}`);
    submitSearch(linkGuid, linkType);
  }

//[{"ord":"Abarímfjall","guid":"43321ac96c7d463431b96666f2fb92ac","ofl_heiti":"nafnorð","ofl":"no","kyn":"hk","hluti":"Biblían","hluti_id":"BIBL","skyring":"hvorugkynsnafnorð, landfræðiheiti úr Biblíunni","bmyndir":[{"g":"NFET","b":"Abarímfjall"},{"g":"ÞFET","b":"Abarímfjall"},{"g":"ÞGFET","b":"Abarímfjalli"},{"g":"EFET","b":"Abarímfjalls"}]}]
//[{"ord":"abstrakt","guid":"e421eeff17964a20b5004f0bfb92394b","ofl_heiti":"lýsingarorð","ofl":"lo","kyn":"","hluti":"Almennt mál","hluti_id":"ALM","skyring":"lýsingarorð, aðeins ein orðmynd",
//[{"ord":"hver","guid":"a66c0f1c0cf3182604ee6f217665692b","ofl_heiti":"önnur fornöfn","ofl":"fn","kyn":"","hluti":"Almennt mál","hluti_id":"ALM","skyring":"spurnarfornafn og óákveðið fornafn"},{"ord":"hver","guid":"f78df423f443cc1f96318604017e09f8","ofl_heiti":"nafnorð","ofl":"no","kyn":"kk","hluti":"Almennt mál","hluti_id":"ALM","skyring":"karlkynsnafnorð"}]

// "ofl_heiti":"önnur fornöfn"
// 1.  ábendingarfornafn - sá
// 2.  afturbeygt eignarfornafn - sinn
// [{"ord":"sinn","guid":"38c357a67920e4ec94f16c11134c9109","ofl_heiti":"önnur fornöfn","ofl":"fn","kyn":"","hluti":"Almennt mál","hluti_id":"ALM","skyring":"afturbeygt eignarfornafn","
//  3. eignarfornafn - vor
//  4. óákveðið ábendingarfornafn - sami
//  5. óákveðið fornafn - einn, annar
//  6. spurnarfornafn - hvaða
//  7. spurnarfornafn  og  óákveðið fornafn - hvor
//  8. tveggja óákveðið fornafn - hvor, annar

  function makeSplitString(inSkyring, oflHeiti) {
        let splitArray = [];
        inSkyring = inSkyring.replace(/[,|\r|\n]/g, ' ');
        let searchWord = " " + oflHeiti;

        if(oflHeiti === "nafnorð" ||
                oflHeiti === "lýsingarorð" ||
                oflHeiti === "persónufornöfn" ||
                oflHeiti === "atviksorð" ){
           let nounIndex = inSkyring.indexOf(" ");
           if(nounIndex !== -1) {
                searchWord = inSkyring.substr(0, nounIndex).trim();
           }
           else {
                searchWord = inSkyring;
           }
        }
        if(oflHeiti === "önnur fornöfn") {
                if(inSkyring === "afturbeygt eignarfornafn" ||
                        inSkyring ===  "eignarfornafn" ||
                        inSkyring === "óákveðið ábendingarfornafn" ||
                        inSkyring === "ábendingarfornafn" ||
                        inSkyring === "óákveðið fornafn" ||
                        inSkyring === "spurnarfornafn" ||
                        inSkyring === "fornafn" ||
                        inSkyring === "spurnarfornafn og óákveðið fornafn"
                ) {
                    searchWord =  inSkyring;
                }
        }
        const splitIndex = inSkyring.lastIndexOf(searchWord);
        let nextSpaceIndex;
        if(oflHeiti === "önnur fornöfn") {
                if(inSkyring === "afturbeygt eignarfornafn" ||
                        inSkyring ===  "eignarfornafn" ||
                        inSkyring === "óákveðið ábendingarfornafn" ||
                        inSkyring === "ábendingarfornafn" ||
                        inSkyring === "óákveðið fornafn" ||
                        inSkyring === "spurnarfornafn" ||
                        inSkyring === "fornafn" ||
                        inSkyring === "spurnarfornafn og óákveðið fornafn"
                ) {
                    nextSpaceIndex = inSkyring.length;
                }
        }
        else {
             nextSpaceIndex = inSkyring.indexOf(" ", splitIndex + 1);
        }
         //Alert.alert(`searchWord ${searchWord}, splitIndex:  ${splitIndex}, nextSpaceIndex: ${nextSpaceIndex}`);

        //if(inSkyring === "karlkynsnafnorð") {
             //Alert.alert(`searchWord ${searchWord}, splitIndex:  ${splitIndex}, nextSpaceIndex: ${nextSpaceIndex}`);
        //}

        if (splitIndex !== -1) {
            splitArray[0] = inSkyring.substr(0, splitIndex).trim();
             if( nextSpaceIndex !== -1) {
                splitArray[1] = inSkyring.substr(splitIndex, nextSpaceIndex - splitIndex).trim();
                splitArray[2] = inSkyring.substr(nextSpaceIndex).trim();
             }
             else {
                    splitArray[1] =  inSkyring.substr(splitIndex).trim();
                    splitArray[2] = "";
             }
        }
        else {
            splitArray[0] = "";
            splitArray[1] = inSkyring;
            splitArray[2] = "";
        }

        if(splitArray[0].length) {
            splitArray[0] = splitArray[0] +  " ";
        }
        if(splitArray[2].length) {
            splitArray[1] = splitArray[1] + " ";
        }
        return splitArray;
  }

  let htmlElements = <Text></Text>;
  if(wordData.length){
    //console.log(`${JSON.stringify(wordData)}`);
    let wordCategory = wordData[0].ofl_heiti;
    let wordName = wordData[0].ord;

    wordData[0].skyring = wordData[0].skyring.replace(/[,|\n]/g, '');
    const lastSpaceIndex = wordData[0].skyring.lastIndexOf(" ");
    let splitString = [];
    if (lastSpaceIndex !== -1) {
      splitString[0] = wordData[0].skyring.substr(0, lastSpaceIndex);
      splitString[1] = wordData[0].skyring.substr(lastSpaceIndex + 1);
    } else {
      splitString[0] = wordData[0].skyring;
    }

    //const splitString = wordData[0].skyring.split(',');
    let skyring = splitString[0];
    let skyringColor = "#c88413";
    let wordType = splitString[1];
    //Alert.alert(`skyring ${skyring}`);
    let wordSep = " ";
    if(splitString[1]) {
        skyringColor = binBlue;
        wordSep = ", ";
    }
    //Alert.alert(`skyring ${skyring}, wordSep ${wordSep}, wordType ${wordType}`);

    if(wordData.length > 1){ //list of words returned.
      wordCount = wordData.length;
      wordListDesc = <Text style={{paddingTop: 6, paddingBottom: 8}}>{wordCount} orð fundust. Smelltu á það orð sem þú vilt sjá:</Text>;
      htmlElements = wordData.map((item, key) => (
        <View key={key} style={{paddingTop: 4, paddingLeft: 8, paddingBottom: 2, alignItems: 'flex-start', flexDirection: 'column', width: '100%', borderWidth: 0}}>
          <Text style={{flex: 0, borderWidth: 0, textDecorationLine: 'underline', paddingBottom: 0, paddingRight: 4, color: binBlue, fontWeight: 'bold', fontSize: 20, lineHeight: 20}} onPress={() =>
             submitLink(item.guid, "guid")
            }>{item.ord}</Text>
           <View style={{ flexDirection: 'row' }}>
                <Text style={{flex: 0, alignItems: "flex-start", borderWidth: 0, color: binBlue, paddingRight: 0, lineHeight: 20}}>{makeSplitString(item.skyring,  item.ofl_heiti)[0]}</Text>
                <Text style={{flex: 0, alignItems: "flex-start", borderWidth: 0, color: binYellow, paddingRight: 0, lineHeight: 20}}>{ makeSplitString(item.skyring,  item.ofl_heiti)[1] }</Text>
                <Text style={{flex: 0, alignItems: "flex-start", borderWidth: 0, color: "grey", paddingRight: 0, lineHeight: 20}}>{ makeSplitString(item.skyring,  item.ofl_heiti)[2] }</Text>
          </View>
        </View>
      ));
    } else if(wordData.length === 1){
      const loadResultData = () => {
          let count = 0;
           for (let i = 0; i < wordData[0].bmyndir.length; i++) {
                  //console.log(wordData[0].bmyndir[i].g);
                  //console.log(wordData[0].bmyndir[i].b);
                  resultData.set(wordData[0].bmyndir[i].g, wordData[0].bmyndir[i].b);
            }
      }

      // xxx
      // function takes an array as second param so the flag value
      // can be set inside the function and determine if a section
      // will be displayed or not
      function getResultData(keySpec, displayFlagArray) {
        let data = resultData.get(keySpec);
        //Alert.alert(`display flag in getResultData: ${keySpec}, ${data}`);
        //if(keySpec == "LHNT" || keySpec == "GM-SAGNB" || keySpec == "MM-SAGNB") {
        //    Alert.alert(`display flag in getResultData: ${keySpec}, ${displayFlagArray[0]}, ${data}`);
        //}

        if(data) {
          for (let i = 1; i <= 2; i++) {
            let result = resultData.get(keySpec + i)
            if (result) {
              data += `\/\n${result}`;
            }
          }
        }

        if(data && displayFlagArray && displayFlagArray[0] === 0) {
            //special case for how the "að tala" form is retreived in  Persónuleg notkun Miðmynd
            //even if there is a value her we don't want to set the display flag
            if(keySpec !== "MM-NH") {
                displayFlagArray[0] = 1;
            }
            //if(keySpec == "LHNT" || keySpec == "GM-SAGNB" || keySpec == "MM-SAGNB") {
            //    Alert.alert(`setting displaySection ${displayFlagArray[0]}`);
            //}
        }
        return data || '--';
      }

      if(/[Nn]afnorð/.test(wordCategory)){ //hestur
          loadResultData();
          htmlElements =
            <>
            {<ColorHeadingComponent/>}
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
              <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
              <View style={{flex: 3, height: 1}} />
            </View>
            <View style={{flexDirection: 'row', paddingTop: 10}}>
              <View style={{flex: .25, backgroundColor: binGray, paddingLeft: 5}}><Text style={styles.plainText}>Et.</Text></View>
              <View style={{flex: 1, backgroundColor: binGray, alignItems: "center"}}><Text style={styles.plainText}>án greinis</Text></View>
              <View style={{flex: 1, backgroundColor: binGray, alignItems: "center"}}><Text style={styles.plainText}>með greini</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 10}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('NFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('NFETgr')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ÞFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ÞFETgr')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ÞGFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ÞGFETgr')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EFETgr')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 10}}>
              <View style={{flex: .25, backgroundColor: binGray, paddingLeft: 5}}><Text style={styles.plainText}>Ft.</Text></View>
              <View style={{flex: 1, backgroundColor: binGray, alignItems: "center"}}><Text style={styles.plainText}>án greinis</Text></View>
              <View style={{flex: 1, backgroundColor: binGray, alignItems: "center"}}><Text style={styles.plainText}>með greini</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 10}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('NFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('NFFTgr')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ÞFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ÞFFTgr')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ÞGFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('ÞGFFTgr')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('EFFTgr')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            </>;
      } else if(/[Rr]aðtölur/.test(wordCategory) || //annar
                /[Gg]reinir/.test(wordCategory) //hinn
      ){
          loadResultData();
          htmlElements =
            <>
            {<ColorHeadingComponent/>}
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
              <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
              <View style={{flex: 3, height: 1}} />
            </View>
            <View style={{flexDirection: 'row', paddingTop: 8, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Et.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-NFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-NFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-NFET')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-ÞFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-ÞFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-ÞFET')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-ÞGFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-ÞGFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-ÞGFET')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-EFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-EFET')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-EFET')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Ft.</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
              <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-NFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-NFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-NFFT')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-ÞFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-ÞFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-ÞFFT')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-ÞGFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-ÞGFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-ÞGFFT')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-EFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-EFFT')}</Text></View>
              <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-EFFT')}</Text></View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
            </>;
      } else if(/[Ss]agnorð/.test(wordCategory)){ //fá
          loadResultData();
          var heading =
          <>
            {<ColorHeadingComponent/>}
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
            <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
            <View style={{flex: 3, height: 1}} />
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
              <Text style={styles.sectionHeading1}>Germynd</Text>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 2}}>
            <View style={{flex: 2}}>
              <Text style={styles.plainText}>Nafnháttur</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', width: '100%', alignItems: "center", paddingBottom: 12}}>
            <Text style={styles.plainText}>að </Text>
            <Text style={styles.wordName}>{wordName}</Text>
          </View>

          {<GM_FH_NT />}
          {<OP_PF_GM_FH_NT />}
          {<OP_PGF_GM_FH_NT />}
          {<OP_EF_GM_FH_NT />}
          {<OP_PAD_GM_FH />}
          {<MM_FH_NT />}
          {<OP_PGF_MM_FH />}
          {<OP_PAD_MM_FH />}
          {<GM_BH_ST />}
          {<LHNT />}
          {<SAG />}
          {<LHÞT_SB_KK />}

          </>;
          htmlElements = heading;
      } else if(/[Ll]ýsingarorð/.test(wordCategory)){ //þögull and óæðri (for empty sections)
          loadResultData();
          //This also applies to adjectives and adverbs. Adjectives like
          // https://bin.arnastofnun.is/beyging/189728 -- óæðri (only Miðstig)
          // https://bin.arnastofnun.is/beyging/189714 -- aðdjúpur (has all fields)
          //https://bin.arnastofnun.is/beyging/389840 -- allstór (Frumstig only)
          //all have a different number of frames.

          htmlElements =
            <>
            {<ColorHeadingComponent/>}
            <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
              <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
              <View style={{flex: 3, height: 1}} />
            </View>

            {<FSB />}
            {<MST />}
            {<ESB />}

          </>
      } else if(/[Ff]orsetning/.test(wordCategory) ||   //undir
                /[Nn]afnháttarmerki/.test(wordCategory) || //að
                /[Ss]amtenging/.test(wordCategory) || //að
                /[Uu]pphrópun/.test(wordCategory) //nei
      ){
        htmlElements  =
          <>
            {<ColorHeadingComponent/>}
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
            <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
            <View style={{flex: 3, height: 1}} />
          </View>
          </>
      } else if(/[Aa]tviksorð/.test(wordCategory)){ //mjög and  (for empty section)
        loadResultData();
        //Adverbs either have a frame or they don't, see
        // https://bin.arnastofnun.is/beyging/495089 -- auðsýnilega
        // https://bin.arnastofnun.is/beyging/402517 -- almennt
        htmlElements =
         <>
         {<ColorHeadingComponent/>}
         <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
           <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
           <View style={{flex: 3, height: 1}} />
         </View>
         {<FST />}
         <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
         </>;
      } else if(/[Tt]öluorð/.test(wordCategory)){ //einn
        loadResultData();
        htmlElements =
          <>
         {<ColorHeadingComponent/>}
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
            <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
            <View style={{flex: 3, height: 1}} />
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1,{flex:.3, borderWidth: 0}]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,{flex:1, borderWidth: 0}]}><Text style={styles.plainText}>Karlkyn</Text></View>
            <View style={[styles.rowHeading,{flex:1, borderWidth: 0}]}><Text style={styles.plainText}>Kvenkyn</Text></View>
            <View style={[styles.rowHeading,{flex:1, borderWidth: 0}]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Nf.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KK-NFET')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KVK-NFET')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('HK-NFET')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Þf.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KK-ÞFET')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KVK-ÞFET')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('HK-ÞFET')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Þgf.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KK-ÞGFET')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KVK-ÞGFET')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('HK-ÞGFET')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Ef.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KK-EFET')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KVK-EFET')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('HK-EFET')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1,{flex:.3, borderWidth: 0}]}><Text style={styles.plainText}>Ft.</Text></View>
            <View style={[styles.rowHeading,{flex:1, borderWidth: 0}]}><Text style={styles.plainText}>Karlkyn</Text></View>
            <View style={[styles.rowHeading,{flex:1, borderWidth: 0}]}><Text style={styles.plainText}>Kvenkyn</Text></View>
            <View style={[styles.rowHeading,{flex:1, borderWidth: 0}]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Nf.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KK-NFFT')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KVK-NFFT')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('HK-NFFT')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Þf.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KK-ÞFFT')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KVK-ÞFFT')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('HK-ÞFFT')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Þgf.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KK-ÞGFFT')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KVK-ÞGFFT')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('HK-ÞGFFT')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Ef.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KK-EFFT')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('KVK-EFFT')}</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('HK-EFFT')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
          </>
      } else if(/[Pp]ersónufornöfn/.test(wordCategory)){ //hann
        loadResultData();
        htmlElements =
           <>
         {<ColorHeadingComponent/>}
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
            <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
            <View style={{flex: 3, height: 1}} />
          </View>
           <View style={{flexDirection: 'row', paddingTop: 8, paddingBottom: 4}}>
             <View style={[styles.rowHeading1,{flex:0, borderWidth: 0}]}><Text></Text></View>
             <View style={[styles.rowHeading,{flex:1, borderWidth: 0}]}><Text style={styles.plainText}>Et.</Text></View>
             <View style={[styles.rowHeading,{flex:1, borderWidth: 0}]}><Text style={styles.plainText}>Ft.</Text></View>
           </View>
           <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
             <View style={{flex:0, borderWidth: 0}}><Text style={styles.smallText}>Nf.</Text></View>
             <View style={styles.lineItem}>
               <Text style={styles.lineItem}>{getResultData('NFET')}</Text></View>
             <View style={styles.lineItem}><Text style={styles.lineItem}>{getResultData('NFFT')}</Text></View>
           </View>
           <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
           <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
             <View style={{flex:0, borderWidth: 0}}><Text style={styles.smallText}>Þf.</Text></View>
             <View style={styles.lineItem}><Text style={styles.lineItem}>{getResultData('ÞFET')}</Text></View>
             <View style={styles.lineItem}><Text style={styles.lineItem}>{getResultData('ÞFFT')}</Text></View>
           </View>
           <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
           <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
             <View style={{flex:0, borderWidth: 0}}><Text style={styles.smallText}>Þgf.</Text></View>
             <View style={styles.lineItem}><Text style={styles.lineItem}>{getResultData('ÞGFET')}</Text></View>
             <View style={styles.lineItem}><Text style={styles.lineItem}>{getResultData('ÞGFFT')}</Text></View>
           </View>
           <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
           <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
             <View style={{flex:0, borderWidth: 0}}><Text style={styles.smallText}>Ef.</Text></View>
             <View style={styles.lineItem}><Text style={styles.lineItem}>{getResultData('EFET')}</Text></View>
             <View style={styles.lineItem}><Text style={styles.lineItem}>{getResultData('EFFT')}</Text></View>
           </View>
           <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={styles.separatorLine} /></View>
           </>
      } else if(/[Ee]ignarfornöfn/.test(wordCategory)  || //minn
                /[Öö]nnur fornöfn/.test(wordCategory) //??
      ){
        loadResultData();
        htmlElements =
          <>
         {<ColorHeadingComponent/>}
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
            <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
            <View style={{flex: 3, height: 1}} />
          </View>
          <View style={{flexDirection: 'row', paddingTop: 8, paddingBottom: 4}}>
            <View style={[styles.rowHeading1]}><Text style={styles.plainText}>Et.</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Karlkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Kvenkyn</Text></View>
            <View style={[styles.rowHeading,styles.headerBar]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-NFET')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-NFET')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-NFET')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-ÞFET')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-ÞFET')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-ÞFET')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-ÞGFET')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-ÞGFET')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-ÞGFET')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-EFET')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-EFET')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-EFET')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={[styles.rowHeading1,{flex:.3, borderWidth: 0}]}><Text style={styles.plainText}>Ft.</Text></View>
            <View style={[styles.rowHeading,styles.elementLine]}><Text style={styles.plainText}>Karlkyn</Text></View>
            <View style={[styles.rowHeading,styles.elementLine]}><Text style={styles.plainText}>Kvenkyn</Text></View>
            <View style={[styles.rowHeading,styles.elementLine]}><Text style={styles.plainText}>Hvorugkyn</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Nf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-NFFT')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-NFFT')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-NFFT')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-ÞFFT')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-ÞFFT')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-ÞFFT')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Þgf.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-ÞGFFT')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-ÞGFFT')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-ÞGFFT')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={styles.nounLabel}><Text style={styles.smallText}>Ef.</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KK-EFFT')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('KVK-EFFT')}</Text></View>
            <View style={styles.elementLine}><Text style={styles.lineItem}>{getResultData('HK-EFFT')}</Text></View>
          </View>
          </>
      } else if(/[Aa]fturbeygt fornafn/.test(wordCategory)){ //sig
        loadResultData();
        htmlElements =
          <>
         {<ColorHeadingComponent/>}
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 14}}>
            <View style={{flex: 1, height: 1, backgroundColor: binBlue}} />
            <View style={{flex: 3, height: 1}} />
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Nf.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('NF')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Þf.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('ÞF')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Þgf.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('ÞGF')}</Text></View>
          </View>
          <View style={{flexDirection: 'row', paddingTop: 2, paddingBottom: 4}}>
            <View style={{flex:1, borderWidth: 0}}><Text style={styles.smallText}>Ef.</Text></View>
            <View style={{flex: 1}}><Text style={styles.lineItem}>{getResultData('EF')}</Text></View>
          </View>
          </>
      }
   }
 } else {
   //something went wrong
   htmlElements = <Text></Text>; //TODO: appropriate message in icelandic
 }

  return (

  <>
  <SafeAreaView style={{flex: 1}}>
  {renderInputBox(searchBoxInput)}
  <ScrollView ref={ScrollViewRef} style={{paddingTop: 0, paddingLeft: 6, paddingRight: 6, backgroundColor: 'white'}}>
    <View style={{ borderWidth: 0, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'white'}}>
        {wordListDesc}
        {htmlElements}
    </View>
  </ScrollView>
  </SafeAreaView>
  </>
  ); //end return
}
export default Home;
