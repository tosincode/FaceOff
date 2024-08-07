import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, Image, Dimensions, Keyboard, Modal, TouchableOpacity, Text, TouchableWithoutFeedback, ScrollView, FlatList } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell, } from 'react-native-confirmation-code-field';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from "@react-native-community/async-storage";
 import { useMutation} from "@apollo/react-hooks";
import { gql } from 'apollo-boost';
import Toast from 'react-native-simple-toast';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import { BoldText, ThinText, RegularText, SemiBoldText } from '../Components/styledTexts';
import Input from '../Components/InputField'
import { Button } from "../Components/button";
import ErrorHandler from '../Components/ErrorHandler'
import Loader from '../Components/Loader'
import Constants from "../Screens/constants"
import { UserContext } from "../../App";
import { LOGIN_OTP_MUTATION } from "../utils/Mutations";
import { GET_USER_INFO } from "../utils/Queries";
import { useLazyQuery } from '@apollo/client';
import { ThemeContext } from '../utils/screenModes/ThemeContext';
import { darkTheme, lightTheme } from '../utils/screenModes/theme';

const uniqueId = DeviceInfo.getUniqueId();
export default function Login({ navigation, route }) {

  const userContext = React.useContext(UserContext);

  const { height, width } = Dimensions.get("screen");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState('');
  // const ref = useBlurOnFulfill({value, cellCount: 7});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const [fcmToken, setFcmToken] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const { theme, toggleTheme } = useContext(ThemeContext);
  const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;


  //const [callMe, { data: userData, loading: userLoading, error: userError }] = useLazyQuery(GET_USER_INFO, {fetchPolicy: 'network-only'});

  const [callMe, { data: userData, loading: userLoading, error: userError }] = useLazyQuery(GET_USER_INFO, {
    fetchPolicy: 'network-only',
    onError: (graphQLError) => {
      // Handle GraphQL errors here
      console.error('GraphQL Error:', graphQLError.message);
    },
  });

  useEffect(() => {
    getToken();
    setVisible(true)
  }, [0])


  // useEffect( async() =>  {
  //   token = await AsyncStorage.getItem("Accesstoken");
  //   //setUserData(userData)
  // }, []);


  useEffect( () => {
    setLoadingActivity(userLoading);
    console.log("userData",userData, userLoading, userError)
    if (userData && userData.getUserProfile) {
      setUserData(userData.getUserProfile)
    }
   // setUserData(userData)
  }, [userData, userLoading, userError]);

  const setUserData = async (data) => {
    let token = await AsyncStorage.getItem("Accesstoken");
    setLoadingActivity(false);
    userContext.setData({ token: token, loading: false, profile: data })
    navigation.reset(
      {
        index: 0,
        routes: [
          { name: 'tabs' },
        ],
      })

  }


  const doLogin = async () => {
    if (value === null || value === "") {
      Toast.showWithGravity("Please enter passcode", Toast.LONG, Toast.BOTTOM);
    } else {
      setLoadingActivity(true)
       console.log("fcmToken", fcmToken)

      try {
        console.log(" i tried try")
        callLogin({
          variables: {
            verifyOtpInput: {
              code: value,
              phone: route.params.number,
              fcm_token: fcmToken,
              device_id: uniqueId,
            }
          }
        });
      } catch (error) {
        console.log(JSON.stringify(error))
      }

    }
  }

  const [callLogin] = useMutation(LOGIN_OTP_MUTATION, {
   

    onCompleted(data) {   
  
      if (data) {
        console.log("data", data)
        AsyncStorage.setItem('Accesstoken', data.verifyOtp.token).then(() => {
          console.log("data.verifyOtp.token", data.verifyOtp.token)

          if (data.verifyOtp.isRegistered == "true") {
            callMe()

          } else {
            setLoadingActivity(false);
            navigation.navigate('userInfo', { from: 'login', number: route.params.number, maskedPhone: route.params.maskedPhone });
          }
          console.log('login response data is', data);

        });
      }
    },
    onError(error, operation) {
      console.log(JSON.stringify(error), 'error login in');
      // console.log(value, 'form');
      setLoadingActivity(false);
      if (error.graphQLErrors) {
        if (error.graphQLErrors.length > 0) {
          Toast.showWithGravity(error.graphQLErrors[0].message.toString(), Toast.LONG, Toast.BOTTOM);
        }
      }
    },
  });

 

  const getToken = async () => {
    messaging()
      .getToken()
      .then(async token => {
         setFcmToken(token)
        console.log('-----------------Token--------------', token);
        AsyncStorage.setItem('fcm_token', token);
      });
  };
  return (
    <View style={[Styles.Container, {backgroundColor:screenModeStyles.backgroundColor}]}>

      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'flex-end',backgroundColor:screenModeStyles.backgroundColor }} extraHeight={100} enableOnAndroid={true} bounce={false}>
        <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
          {/* <Image source={(require('../assets/Icons/big-logo.png'))} style={{ height: height * 0.25, width: 250, resizeMode: 'contain', marginBottom: 10 }} /> */}
          <Image source={(require('../assets/Icons/big-logo.png'))} style={{ height: height * 0.24, width: 250, resizeMode: 'contain', marginVertical: 50, }} />
        </View>


        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor:screenModeStyles.backgroundColor }}>
          <View style={{ backgroundColor:screenModeStyles.backgroundColor, padding: 20, paddingLeft: 40, paddingRight: 50 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', flex: .5 }}>
                <Image source={(require('../assets/Icons/back.png'))}
                  style={Styles.logoImage} />
              </TouchableOpacity>
              <BoldText style={{ fontSize: 28, flex: 1, marginBottom: 20 }}>Passcode</BoldText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, }}>
              <Image source={require('../assets/Icons/lock.png')} style={{ width: 30, height: 30, resizeMode: 'contain',}} />
              <View style={{ paddingLeft: 15, flex: 1 }}>
                <RegularText style={{}}>Enter the passcode!</RegularText>
                <RegularText style={{}}>Sent to {route.params.maskedPhone}</RegularText>
              </View>

            </View>

            <CodeField
              // ref={ref}
              {...props}
              value={value}
              onChangeText={setValue}
             
              cellCount={6}
              rootStyle={Styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              onSubmitEditing={() => Keyboard.dismiss()}

              renderCell={({ index, symbol, isFocused }) => (
                <View
                  key={index}
                  onLayout={getCellOnLayoutHandler(index)}
                  style={[Styles.cell, isFocused && Styles.focusCell]}
                >
                  <Text
                  style={{color:"#2a6b9c"}}
                    key={index}>
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                </View>
              )}
            />
            <Button title={"Continue"} onPress={() => doLogin()} style={{ alignSelf: 'center', marginVertical: 50, width: width * .8, borderRadius: 25, minHeight: 50 }} />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <Loader loading={loadingActivity} />
      <Modal animationType={"slide"} transparent={true} visible={visible}>
        {/* <TouchableWithoutFeedback onPress={() => {}}> */}
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }}>
          <View style={{flex: 1, justifyContent:'flex-end'}}>
            <View style={{backgroundColor:screenModeStyles.backgroundColor,marginHorizontal: 10,paddingHorizontal:15,paddingTop:20}}>
            <BoldText>END USER LICENCE AGREEMENT</BoldText>

            </View>
            </View>
              <View
                style={{
                  flex: 4,
                  backgroundColor:screenModeStyles.backgroundColor,
                  // marginVertical: 100,
                  marginHorizontal: 10,
                  paddingHorizontal:15
                }}
              >
                <ScrollView style={{flex: 1, paddingHorizontal: 10, paddingVertical: 10,backgroundColor:screenModeStyles.backgroundColor}}>
                 
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      Face Off, stating the terms that govern your use of the goods and services being provided to you by Face Off (hereinafter the "Service" or "Services"). This agreement, together with all updates, additional terms, and all of Face Off’s rules and policies, including, without limitation, Face Off's Privacy Policy, collectively constitute the "Agreement" between you and Face Off.
          </RegularText>
                    <RegularText style={Styles.subDescription}>
                      By visiting Face Off 's website (hereinafter the "Website"), subscribing to Face Off ’s Services, and/or utilizing the Services, you are indicating that you have read, understood, and agree to be bound by the terms of this Agreement. Face Off may refuse access to the Services for noncompliance with any part of this Agreement.
          </RegularText>
                    <RegularText style={Styles.subDescription}>
                      This Agreement may be updated or amended by us from time to time without notice to you. Please check back periodically to learn of any updates or amendments. When using the Services, you shall be subject to any posted guidelines or rules applicable to such services which may be posted from time to time. All such guidelines or rules are hereby incorporated by reference into the EULA.
          </RegularText>
                  </View>

                  {/* <RegularText>Privacy Policy</RegularText>
        <View style={Styles.description}>
          <RegularText style={Styles.subDescription}>
            A complete statement of our privacy policy can be found at
            <RegularText style={{color:'#2a6b9c', textAlign:'justify'}} onPress={()=>navigation.navigate('privacyPolicy')}> Policy page.</RegularText>
          </RegularText>
        </View> */}

                  <RegularText>Ownership</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      The Services, our technology, and any updates or improvements to the Services and/or our technology, are owned by Face Off and its licensors. Face Off and its licensors own all copyrights, patents, trademarks, trade secrets, and other intellectual property rights relating to or residing in our Services.
          </RegularText>
                    <RegularText style={Styles.subDescription}>
                      You understand that our Services and technology contain valuable software and confidential information and you agree that you will not copy, modify, reverse engineer, de-compile, attempt to derive the source code of, create other works from, or disassemble any of our software without our prior written consent. Face Off reserves all rights not expressly granted to you.
          </RegularText>
                  </View>

                  <RegularText>Your Account</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      You are responsible for maintaining the confidentiality of account information and for restricting access to your account. You agree to accept responsibility and liability for all activities that occur under your account whether lawful or unlawful. You are also solely responsible for all uses of your account, whether or not actually or expressly authorized by you. Persons under the age of 18 years may use the Services ONLY with involvement of a parent or guardian.
          </RegularText>
                    <RegularText style={Styles.subDescription}>
                      Face Off reserves the right to refuse use of the Services, terminate accounts, or cancel orders in our sole discretion. Violation of this EULA may result in immediate suspension of your account. In order to ensure that Face Off is able to provide high quality services that are responsive to your needs, you agree to allow our employees to access your account and records on a case-by-case basis to investigate complaints. We will not disclose the existence or occurrence of such an investigation unless required by law, including but not limited to a court order or an order of any other administrative or regulatory agency.
          </RegularText>
                  </View>

                  <RegularText>Account Registration</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      For Users, You understand and agree that you are responsible for maintaining the secrecy of your OTP and for activities occurring under your account. You should notify us immediately if you believe that others are accessing your account. You understand and agree that you will not transfer or loan your mobile number and otp to others, or allow others to use your mobile and otp in a manner that is inconsistent with this EULA. You cannot use our Services until after we have verified the mobile number you provide during registration.
          </RegularText>
                  </View>

                  <RegularText>No Liability For Access By Minors</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      The Website is not designed or intended to attract children under the age of 17. Face Off is not responsible for determining the age of its users and has no liability whatsoever should an unpermitted minor access our Website. We do not collect any personally identifiable information, whether or not such information is voluntarily provided, from any person we actually know is under the age of 13. If we are made aware that we have actually collected information about a person under the age of 13, we will remove that information from our records in a timely fashion.
          </RegularText>
                  </View>

                  <RegularText>Termination Of Account</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      You may terminate your account with Face Off at any time; however, you are not entitled to a refund of any amounts paid by you for your in-app purchases. We may terminate your account without notice or refund to you if you violate this EULA or any other guidelines or rules posted by Face Off. If your account is terminated, Face Off reserves the right to remove your account information along with any software settings from our servers with NO liability or notice to you.
          </RegularText>
                  </View>

                  <RegularText>Payment</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      All payments will be made to Face Off. You agree to pay for all services requested by you and rendered by Face Off. In the event of a dispute regarding payment for services rendered, you agree to notify Face Off of any such disputes within 30 days of the invoice date and to pay all undisputed amounts as required by Face Off payment terms.
          </RegularText>
                  </View>

                  <RegularText>Communications And Content</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      You are responsible for the content of the messages you communicate when using our Services as well as the consequences of those messages. You agree that you will not use our Services to Face Off in activities that are illegal, obscene, threatening, defamatory, invade privacy, infringe intellectual property rights, or otherwise injure third parties or are objectionable. You may not use a false e-mail address, impersonate any person or entity, or otherwise mislead us as to your identity.
          </RegularText>
                    <RegularText style={Styles.subDescription}>
                      Face Off ’s Services may display, include or make available content, data, factual information, applications, including but not limited to third party applications, software, viruses, or materials from third parties ("Third Party Materials"). Such Third-Party Materials are provided solely as a convenience to you. You acknowledge and agree that Face Off is not responsible for examining or evaluating the content, accuracy, completeness, timeliness, validity, copyright compliance, legality, decency, quality or any other aspect of such Third Party Materials. Face Off does not warrant or endorse and does not assume and will not have any liability or responsibility to you or any other person for any Services, Third Party Materials, or for any other materials, products, or services of third parties. Although we provide rules for user conduct and postings, we do not control nor are not responsible for what users post, transmit or share on our Website. Furthermore, we are not responsible for any offensive, inappropriate, obscene, unlawful or otherwise objectionable content you may encounter on our Website. Face Off is not responsible for the conduct, whether online or offline, of any user of the Website or Services.
          </RegularText>
                    <RegularText style={Styles.subDescription}>
                      Face Off may be temporarily unavailable from time to time for maintenance or other reasons. Face Off assumes no responsibility for any error, omission, interruption, deletion, defect, delay in operation or transmission, communications line failure, theft or destruction or unauthorized access to, or alteration of, user communications. Face Off is not responsible for any technical malfunction in your use of our Website, including, but not limited to, problems with using the Website and/or Services, loss of personal content on our Website, and lost or undeliverable email. Under no circumstances will Face Off be responsible for any loss or damage, including, but not limited to personal injury or death, resulting from use of our Website or Services, or any interactions between users of our Website, whether online or offline.
          </RegularText>
                  </View>

                  <RegularText>Waiver Of Liability For Links To Other Websites</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      Our Website may contain links to other websites ("Third Party Websites"). You understand and agree that Face Off has no control over the content of Third Party Websites, especially with regards to the accuracy, reliability, and timeliness of their content. You understand and agree that your use and reliance on any content from Third Party Websites is solely at your own risk. You understand and agree that Face Off is in no way liable for any damages to you that may arise from such use or reliance, regardless of the fact that you reached one or more Third Party Websites through our Website.
          </RegularText>
                  </View>

                  <RegularText>Monitoring And Removel Of Information</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      You understand and agree that Face Off reserves the right to monitor all advertisements, public postings and messages to ensure that they conform to our content guidelines. We also reserve the right to monitor all messages that take place through our Website. You understand and agree that monitoring is at our discretion and that we cannot and do not monitor every message or other material posted or sent by Members of our Website. You understand and agree that Face Off is not responsible in any way for monitoring or failing to monitor any offensive or obscene materials that may be transmitted or posted by other users, including, but not limited to, current members, unauthorized users, hackers, etc. Furthermore, you also understand and agree that Face Off is not responsible for the use of any personal information that a member may choose to post on our Website. Face Off reserves the right to delete, move, or edit messages or materials, including, but not limited to, advertisements, public postings, and messages that we, in our sole discretion, deem necessary to be removed.
          </RegularText>
                  </View>

                  <RegularText>Promotional Lists And Newsletters</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      You understand and agree that by using our Website and/or Services, your name may be placed on promotional lists to receive emails regarding our Website and Services, news from our affiliates, and the Face Off newsletter. If at anytime you no longer wish to receive such emails, please visit the "Account Settings" section of our Website. Face Off complies with all provisions of the CAN-SPAM Act.
          </RegularText>
                  </View>

                  <RegularText>Advertisters, User Contributions, Testimonials And Opinions</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      You understand that our Website and any newsletters or emails you receive from Face Off or our affiliates may include advertisements, user-contributed materials (such as blogs or discussion groups), testimonials and opinions from other individuals, including, but not limited to, users of our Website, manufacturers and service providers, and other industry professionals. You understand and agree that such advertisements, user-contributed materials, testimonials, and opinions are considered those of the individual that gave them and in no way represent a warranty of our Website and/or Services. Furthermore, you understand and agree that Face Off is no way liable for the content and your reliance on it of any such advertisements, user-contributed materials, testimonials, and opinions.
          </RegularText>
                  </View>

                  <RegularText>Rules Of Conduct While Using Our Website And Services</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      All users of our Website and Services understand and agree to the following rules of conduct while using our Website and/or Services:
          </RegularText>
                    <FlatList
                      data={conductRules}
                      renderItem={({ item }) => {
                        return (
                          <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 10, justifyContent: 'flex-start' }}>
                            <View>
                              <SemiBoldText style={[Styles.subDescription, { fontSize: 16 }]}>•</SemiBoldText>
                            </View>
                            <View>
                              <SemiBoldText style={Styles.subDescription}>{item}</SemiBoldText>
                            </View>
                          </View>
                        )
                      }}
                    />

                  </View>


                  <RegularText>Disclaimer Of Warranties And Limitation Of Liability</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      unless we otherwise agree in writing, this website and the services are provided on an "as is" and "as available" basis, without warranty of any kind. to the maximum extent permitted by law, Face Off expressly disclaims all warranties, whether express, implied, or statutory, regarding the website and services, including, but not limited to, the implied warranties of title, merchantability, fitness for a particular purpose, and non-infringement. Face Off does not represent or warrant that the services will be error free, secure, virus free, or without interruption. neither of us will be liable to the other for any consequential, incidental, indirect, special, or exemplary damages of any kind, including without limitation any loss of use, loss of business, or loss of profit or revenue, arising out of or in connection with services provided by us (however arising, including negligence), even if we are aware of the possibility of such damages. Face Off ’s total cumulative liability in connection with the services rendered, whether in contract or tort or otherwise, will not exceed any amounts paid by you for services rendered during the twelve (12) month period immediately preceding the date on which such liability arose. you agree to indemnify, defend and hold harmless Face Off , its affiliates, officers, directors, employees, consultants and agents from and against any and all third party claims, liability, damages and/or costs (including, but not limited to, attorney’s fees) directly or indirectly arising out of or relating to your unauthorized or improper use of Face Off's website or services, your violation of the eula or your infringement, or infringement by any other user of your account, of any intellectual property or other right of any person or entity. the eula will be binding upon, and will inure to the benefit of, your and Face Off ’s successors, assigns, and licensees.
          </RegularText>
                  </View>

                  <RegularText>Application Law</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      This EULA shall be governed by and construed in accordance with the laws of the State of Florida, without giving effect to Florida's conflict of laws doctrine or to the conflict of laws doctrine of your actual state or country of residence. Both you and Face Off unconditionally agree to assert any claims against the other arising out of or relating to the Website, Services, or this Agreement in the form of a lawsuit commenced in Los Angeles, CA or the United States District Court in and for the district in which such county is located. You hereby consent to the sole and exclusive jurisdiction and venue of the courts of that county, state, and district for such purposes.
          </RegularText>
                  </View>

                  <RegularText>Modification And Waiver</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      We reserve the right to make changes to the Website, our Services, this EULA and applicable policies and guidelines at any time. A waiver by Face Off of its rights hereunder will not be binding unless contained in a writing signed by an authorized representative of Face Off . Face Off's non-enforcement or waiver of any provision on one (1) occasion does not constitute a waiver of such provision on any other occasions unless expressly so agreed in writing.
          </RegularText>
                  </View>

                  <RegularText>Severability</RegularText>
                  <View style={Styles.description}>
                    <RegularText style={Styles.subDescription}>
                      If any condition of this EULA is deemed invalid, void, or unenforceable for any reason, that condition will be severed from the EULA and will not affect the validity and enforceability of any remaining condition.
          </RegularText>
                  </View>

                  <RegularText>Questions</RegularText>
                  <View style={[Styles.description, { marginBottom: 20 }]}>
                    <RegularText style={Styles.subDescription}>
                      If you have any questions regarding this EULA, please contact us at: Face Off
          </RegularText>
                    <RegularText style={Styles.subDescription}>
                      Face Offapp@gmail.com
          </RegularText>
                  </View>
                </ScrollView>
              </View>
           
          <View style={{ backgroundColor:screenModeStyles.backgroundColor, height:80, marginHorizontal: 10,
                  paddingHorizontal:15, marginBottom:100, paddingTop:20}}>
          <Button title={"Agree"} onPress={() => setVisible(false)} style={{ alignSelf: 'center', width: width * .8, borderRadius: 25, minHeight: 50 }} />

          </View>
          </View>
        {/* </TouchableWithoutFeedback> */}
      </Modal>
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
  },
  codeFieldRoot: {
    color: '#2a6b9c', fontSize: 15, borderWidth: 1, borderColor: "#C0C0C0", borderRadius: 25, paddingHorizontal: 30, width: Dimensions.get("screen").width * .8, minHeight: 45
  },
  cell: {
    width: 40,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
 
  },
  cellText: {
    color: '#000',
    fontSize: 36,
    textAlign: 'center',
  },
  focusCell: {
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
  },
  description: {
    color: '#a9aaac',
    marginVertical: 10,
    textAlign: 'justify',
  },
  subDescription: {
    color: '#a9aaac',
    textAlign: 'justify',
    letterSpacing: .2
  },
})

const conductRules = [
  "You agree to use our Website, its content, and our Services solely for their intended purposes.",
  "You agree to abide by the EULA which you acknowledged at the time of registering for our Services and with any updates or amendments that may be included from time to time by Face Off.",
  "You agree to not in any way attempt to use any method to gain unauthorized access to any paid features of our Website.",
  "You agree to not copy, print (except for personal use), republish, display, distribute, transmit, sell, rent, lease, loan or otherwise make available in any form or by any means all or any portion of our Website, its content, and our Services.",
  "You agree to not use our Website or any content obtained from it to develop, of use as a component of, any information, storage and retrieval system, database, information base, or similar resource (in any media now existing or hereafter developed), that is offered for commercial distribution of any kind, including through sale, license, lease, rental, subscription, or any other commercial distribution mechanism.",
  "You agree to not use automated scripts to collect information from or otherwise interact with the Services or our Website.",
  "You agree to not use our Website or Services to 'stalk' or otherwise harass another person.",
  "You agree to not harvest or collect email addresses or other contact information from users of our Website and Services for the purposes of sending unsolicited emails or other unsolicited communications."
]