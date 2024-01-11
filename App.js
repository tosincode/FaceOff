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
// import {
//   SafeAreaView,

//   StyleSheet,
//   Text,

//   View,
// } from 'react-native';

import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';

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


  useEffect(() => {
    requestUserPermission();
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
