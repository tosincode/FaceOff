import React, {useState, useContext} from "react";
import {Animated, Image, StyleSheet, TextInput, TouchableOpacity, View, Platform} from "react-native";
import {BoldText, SemiBoldText} from "./styledTexts";
import Constants from "../Screens/constants";
import { darkTheme, lightTheme } from "../utils/screenModes/theme";
import { ThemeContext } from "../utils/screenModes/ThemeContext";



export default function  SearchHeader({title,back,RightComp}) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;

  const [isSearch, setIsSearch] = useState(false);

  return<View style={Styles.logoView}>
    <View style={{flex:0.5,}}>{!back?null:
    <TouchableOpacity onPress={back} >
      <Image source={(require('../assets/Icons/back.png'))}
             style={Styles.logoImage}/>
    </TouchableOpacity>}</View>
<View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
  {
    Platform.OS === 'ios' ? 
    <BoldText style={{color:screenModeStyles.textColor,fontSize:15}}>{title}</BoldText>
    :
    <SemiBoldText style={{color:screenModeStyles.textColor,fontSize:15}}>{title}</SemiBoldText>
  }
  </View>
  
    <View style={{flex:0.5,alignItems:'flex-end',paddingRight:7}}>{
      RightComp?<RightComp />:null
    }</View>
</View>
}


const Styles = StyleSheet.create({

  logoView: {
    height: 60,
    padding: 5,
    flexDirection: 'row',
    alignItems:'center'
  },
})
