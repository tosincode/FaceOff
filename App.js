/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

 import React, { useState, useEffect, useContext } from 'react';

import { MenuProvider } from 'react-native-popup-menu';
import messaging from '@react-native-firebase/messaging';
import { Provider } from 'react-redux'
import configureStore from './store/ConfigureStore';
import FlashMessage, {showMessage} from 'react-native-flash-message';
import { ThemeProvider } from './src/utils/screenModes/ThemeContext';
import notifee from '@notifee/react-native';



// import {
//   SafeAreaView,

//   StyleSheet,
//   Text,

//   View,
// } from 'react-native';

import { StyleSheet, Text, View, SafeAreaView, StatusBar, Alert } from 'react-native';

import Routes from './Router';
import {
  NotificationListner,
  requestPushNotificationPermission } from './src/utils/PushNotificationHelper'
const store = configureStore();
export const UserContext = React.createContext({
  profile: {},
  loading: true,
  token: null,
  setData: () => {
  },
});


export const UserProvider = UserContext.Provider;
export const UserConsumer = UserContext.Consumer;


export default function App(props) {
  const userContext = useContext(UserContext);
  const setUserData = (data) => {
    setState({ ...state, ...data });
  };
  const initState = {
    profile: {},
    token: null,
    loading: true,
    setData: setUserData,
  };
  const [state, setState] = useState(initState);


  async function requestUserPermission() {
    const authorizationStatus = await messaging().requestPermission();

    if (authorizationStatus) {
        console.log('Permission status:::', authorizationStatus);
    }
  }

  const requestNotificationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_NOTIFICATION_POLICY,
        {
          title: 'Notification Permission',
          message: 'Please enable notifications to receive important notification.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted');
        // Continue with sending notifications
      } else {
        console.log('Notification permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };


  useEffect(() => {
    requestUserPermission();
    requestNotificationPermission()
}, []);



useEffect(async () =>{
  const channelId = await notifee.createChannel({
    id: 'faceOff',
    name: 'faceOff',
  });
 // console.log("channelId==>", channelId)
},[])

function onMessageReceived(message) {


 notifee.displayNotification({
  title: message.notification.title,
  body: message.notification.body,
  android: {
    channelId:"faceOff"
  
  },
});
}

  
useEffect(() => {
  console.log('FCM here =>');

  const unsubscribe = messaging().onMessage(async remoteMessage => {
   // Alert.alert("alert came in")
    console.log("push")
      onMessageReceived(remoteMessage)
  });

  return () => {
    unsubscribe();
  };
}, []);

  
useEffect(() => {
  console.log('FCM here =>');

  const unsubscribe = messaging().setBackgroundMessageHandler(async remoteMessage => {
   // Alert.alert("alert came in")
    console.log("push")
      onMessageReceived(remoteMessage)
  });

  return () => {
    unsubscribe();
  };
}, []);




//   useEffect(() => {
//   requestPushNotificationPermission();
// NotificationListner();
// }, []);




  return (
   
    <Provider store={store}>
      <UserProvider value={state}>
        <MenuProvider>
          <FlashMessage position="top"/>
          <StatusBar barStyle="dark-content" backgroundColor={"#fff"} />
          <SafeAreaView style={{ flex: 0, }} />
          <View style={{ flex: 1, backgroundColor: "white" }}>
          <ThemeProvider>
              <Routes />  
              </ThemeProvider>
          </View>
        </MenuProvider>
      </UserProvider>
    </Provider>

  );
}

// export default App;
