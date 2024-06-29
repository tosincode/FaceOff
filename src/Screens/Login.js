import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Text
} from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from "@react-native-community/async-storage";
// import { doLogin } from '../../store/actions/authAction'
import { connect } from 'react-redux';
import {useMutation, useLazyQuery} from "@apollo/react-hooks";
import {gql} from 'apollo-boost';
import Toast from 'react-native-simple-toast';

import { BoldText, ThinText, RegularText, SemiBoldText } from '../Components/styledTexts';
import Input from '../Components/InputField'
import { Button } from "../Components/button";
import ErrorHandler from '../Components/ErrorHandler'
import Loader from '../Components/Loader'
import Constants from "../Screens/constants"
import { UserContext } from "../../App";
import { LOGIN_MUTATION } from "../utils/Mutations";
import { Picker } from '@react-native-community/picker';
import countryPhoneCodes from '../utils/Countrycodes';
import { ThemeContext } from '../utils/screenModes/ThemeContext';
import { darkTheme, lightTheme } from '../utils/screenModes/theme';


function Login({ navigation }) {
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1'); // Set a default country code

  const userContext = React.useContext(UserContext);

  const { height, width } = Dimensions.get("screen");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const formatterRef = useRef(null);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [form, setForm] = useState({
    phone: "",
  })
  const [loadingActivity, setLoadingActivity] = useState(false);

  const { theme, toggleTheme } = useContext(ThemeContext);
  const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;

  const doLogin = async () => {
    console.log("form.phone", selectedCountryCode+form.phone)
    if (form.phone === null || form.phone === "") {
      Toast.showWithGravity("Please enter phone number", Toast.LONG, Toast.BOTTOM);
    } else {
      setLoadingActivity(true)
     try {
      callLogin({variables:{
          loginViaOtpInput:{
            phone:selectedCountryCode+form.phone
        }
      }});
     } catch (error) {
       console.log(JSON.stringify(error))
     }
  }}

  const [callLogin] = useMutation(LOGIN_MUTATION,{

    onCompleted(data) {
      if (data) {
        console.log('login response data is', data);
        setLoadingActivity(false);
        console.log(('passcode',{number:form.phone, maskedPhone:maskedPhone}))
        navigation.navigate('passcode',{number:selectedCountryCode+form.phone, maskedPhone:maskedPhone});
      }
    },
    onError(error, operation) {
      console.log(JSON.stringify(error))
      console.log("OP",JSON.stringify(operation))
      console.log(form, 'form');
      if (error.graphQLErrors) {
        if (error.graphQLErrors.length > 0) {
          Toast.showWithGravity(error.graphQLErrors[0].message.toString(), Toast.LONG, Toast.BOTTOM);
        }
      }
      setLoadingActivity(false);
      // ErrorHandler.showError(error);
    },
  });



  return (
    <View style={[Styles.Container, {backgroundColor:screenModeStyles.backgroundColor}]}>
      <KeyboardAwareScrollView contentContainerStyle={{flexGrow:1, alignItems: 'flex-end', backgroundColor:screenModeStyles.backgroundColor}} scrollEnabled={true} extraHeight={100} enableOnAndroid={true} bounce={false}>
        <View style={{justifyContent:'center', flex:1, alignSelf:'center' }}>
          <Image source={(require('../assets/Icons/big-logo.png'))} style={{ height: height * 0.24, width: 250, resizeMode: 'contain', marginVertical: 50, }} />
        </View>

        <View style={{flex:1, justifyContent: 'flex-end'}} >
          <View style={{backgroundColor:screenModeStyles.backgroundColor, padding:20, paddingHorizontal:40 }}>
          <BoldText style={{fontSize: 28, textAlign:'center', marginBottom:20 }}>Login</BoldText>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom:20 }}>
            <Image source={require('../assets/Icons/phone.png')} style={{ width: 30, height: 30, resizeMode: 'contain' }} />
            <RegularText style={{ paddingLeft: 15 }}>A 6 digit passcode will be sent via text to verify your mobile number!</RegularText>
          </View>
               <RegularText  style={{ marginBottom:5}}>Select Country code</RegularText> 
            <View style={{marginBottom:10, borderColor:"#C0C0C0", borderWidth:1, borderRadius: 25,paddingHorizontal: 15, backgroundColor:"white"}}>
          <Picker
           style={{color:"red" }}
            selectedValue={selectedCountryCode}
            onValueChange={(itemValue) => setSelectedCountryCode(itemValue)}
          >
        {countryPhoneCodes.map((country) => (
          <Picker.Item
          //style={{color:"#2a6b9c"}}
          style={{color:screenModeStyles.textColor }}
            key={country.code}
            label={`${country.name} (${country.dial_code})`}
            value={country.dial_code}
          />
        ))}
      </Picker>
    </View>
    <RegularText  style={{marginBottom:5}}>Phone Number</RegularText>
          <TextInputMask
            type={'custom'}
            options={{
              mask: '(999) 999-9999',
              getRawValue: function (value, settings) {
                let result = value;
                // result = result.replace('+1', '');
                result = result.replace('(', '');
                result = result.replace(') ', '');
                result = result.replace('', '');
                result = result.replace('-', '');
                return result;
              }
            }}
            placeholder={'(000) 000-0000'}
            placeholderTextColor={'#404040'}
            style={{ color: '#2a6b9c', fontSize: 15, borderWidth: 1, borderColor: "#C0C0C0", borderRadius: 25, paddingHorizontal: 15, minHeight: 45 }}
            keyboardType={'phone-pad'}
            maxLength={14}
            textContentType={'telephoneNumber'}
            value={maskedPhone}
            onChangeText={value => {
              setMaskedPhone(value);
              // let finalContactNumber = formatterRef.current.getRawValue();
              // console.log(finalContactNumber.trim(), "finalContactNumber");
              // console.log(value, "value")
              let result = value;
                // result = result.replace('+1', '');
                result = result.replace('(', '');
                result = result.replace(') ', '');
                result = result.replace('', '');
                result = result.replace('-', '');
                result = result.replace(/ /g, "");
              setForm({ ...form, phone: result })
              if (value.length >= 14) {
                Keyboard.dismiss();
              }
            }}
            ref={formatterRef}
          />
          <Button title={"Login"} onPress={() => doLogin()} style={{ alignSelf: 'center', marginVertical: 50, width:width*.8, borderRadius:25,minHeight: 50 }} />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <Loader loading={loadingActivity} />
    </View>
  );
}


const Styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: 'white'
  },
  logoView: {
    flex: 2,
    paddingTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  regularText: {
    color: Constants.grayText,
    fontSize: 13
  },
  forgetButton: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
    marginRight: 10,
  },
  bottomRow: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default Login
