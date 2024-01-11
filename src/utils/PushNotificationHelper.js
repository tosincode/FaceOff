import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';

export async function requestPushNotificationPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    GetFCMToken()
  }
}

async function GetFCMToken(){

    let fcmToken = await AsyncStorage.getItem("Accesstoken");

  console.log("newfcmToken1", fcmToken)
    if(fcmToken){
     
        try{
            const fcmToken = await messaging().getToken();
            console.log("FCMtoken ",fcmToken)
          
            if(fcmToken){
                await AsyncStorage.setItem("Accesstoken",fcmToken.toString())
                console.log("FCMtoken ", fcmToken)

            }
        }catch (error) {
            console.log("FCMtoken Error",error)
        }
    }
    
}

export const NotificationListner=()=>{
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp(async remoteMessage => {

      console.log("from background state", remoteMessage)

        console.log('Notification caused app to open from background state:');
      });

    messaging().onMessage(async remoteMessage =>{
        console.log("Notification on foreground state.......");
      console.log("from foreground state", remoteMessage);
    })
}