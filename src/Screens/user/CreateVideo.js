/* eslint-disable no-console */
import React , {useContext, useEffect, useRef, useState}from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Image, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';

import CountDown from 'react-native-countdown-component';
import { RNCamera } from 'react-native-camera';
import RNFS from 'react-native-fs'
import Toast from 'react-native-simple-toast'
import { useRoute, useNavigation} from '@react-navigation/native';
import {gql} from 'apollo-boost';
import {useMutation} from '@apollo/react-hooks'
import Header from "../../Components/Header";
import Loader from "../../Components/Loader";
import { RegularText, SemiBoldText, BoldText } from "../../Components/styledTexts";
import { Button } from '../../Components/button'
import Constants from '../constants.json'
import VideoPlayer from '../../Components/VideoPlayer'
import { AGAINST_MUTATION, RECAPTURE_VIDEO} from "../../utils/Mutations";
import { ThemeContext } from '../../utils/screenModes/ThemeContext';
import { darkTheme, lightTheme } from '../../utils/screenModes/theme';
import { createThumbnail } from "react-native-create-thumbnail";
import DocumentPicker from 'react-native-document-picker';
import { getVideoDuration } from 'react-native-video-duration';
const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

var time = 1;
var interval;


const CameraScreen = ({ navigation, from }) => {

  // const [videoURI, setVideoURI] = useState('');
  const [timeCounter, setTimeCounter] = useState("00:00");
  const [flash, setFlash] = useState('off');
  const [zoom, setZoom] = useState(0);
  const [type, setType] = useState('back');
  const [isRecording, setIsRecording] = useState(false);
  const [countdownTime, setCountdownTime] = useState(21);

  const route = useRoute();
  console.log("route.params.from", route.params.from)
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showPreview, setShowpreview] = useState(false);
  const [show, setShow] = useState(false);
  const [postButtonText, setPostButtonText] = useState("Post") 
  const [buttonAbility, setButtonAbility] = useState(false)
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [thumbnailImage, setThumbnail] = useState("");
  const [isUploaded, setIsUpLoaded] =  useState(false)

  const [isUploadedLoded, setIsUpLoadedLoaded] =  useState(false)
  const [uploadVideoUrl, setVideoUploadUrl] = useState("")

  const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;
  const cameraRef = useRef(null);

  useEffect(() => {
    let countdownInterval = 21;
    if (isRecording) {
      countdownInterval = setInterval(() => {
        setCountdownTime((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(countdownInterval);
            stopVideo();
            setTimeCounter("00:00")
            return 0;
          }
          setTimeCounter(formatTime(newTime));
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [isRecording]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleFacing = () => setType(type === 'back' ? 'front' : 'back');
  const toggleFlash = () => setFlash(flash === 'off' ? 'on' : 'off'); // Adjust according to your flashModeOrder
  const zoomOut = () => setZoom((prevZoom) => (prevZoom - 0.1 < 0 ? 0 : prevZoom - 0.1));
  const zoomIn = () => setZoom((prevZoom) => (prevZoom + 0.1 > 1 ? 1 : prevZoom + 0.1));

  const renderStopRecBtn = () => {
    return <Image source={require('../../assets/Icons/stop.png')} style={{ width: 70, height: 70, tintColor: Constants.btnColor }} />;
  }

  const renderRecBtn = ()  => {
    return <Image source={require('../../assets/Icons/record.png')} style={{ width: 70, height: 70 }} />;
  }


  // const stopVideo = async () => {
  //   if (isRecording && cameraRef.current) {
  //     const data = await cameraRef.current.stopRecording();
  //     setVideoURI(data.uri);
  //     setVideoUrl(data.uri);
  //     if (from === "feeds" || from === "archives" || from === "notificationFeed") {
  //       showPreview();
  //     }
  //     setIsRecording(false);
  //   }
  // };

  const stopVideo = async () => {
    if (isRecording && cameraRef.current) {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
      setCountdownTime(25); // Reset the countdown time for the next recording
      setTimeCounter("00:00"); // Set the time display to "00:00" when stopped
    }
  };

  const takeVideo = async () => {
    if (cameraRef.current && !isRecording) {
      setCountdownTime(24); // Reset the countdown time to 20 seconds
      setTimeCounter("00:24"); // Set the initial display to "00:20"
      setIsRecording(true);
  
      const promise = cameraRef.current.recordAsync({
        mute: false,
        maxDuration: 24,
        videoBitrate: 2 * 1024 * 1024,
        // quality: RNCamera.Constants.VideoQuality['480p'], // Uncomment and adjust if needed
      });
  
      promise.then((data) => {
        console.log("data.uri", data.uri)
      //  setVideoURI(data.uri);
        setVideoUrl(data.uri);
        setIsRecording(false);
        if (route.params.from === "feeds" || route.params.from === "archives" || route.params.from === "notificationFeed") {
          setShowpreview(true);
          console.log("review")
        }
      }).catch((e) => console.error(e));
    }
  };

  
  // const takeVideo = async () => {
  //   if (cameraRef.current && !isRecording) {
  //     setIsRecording(true);
  //     const promise = cameraRef.current.recordAsync({
  //       mute: false,
  //       maxDuration: 20,
  //       videoBitrate: 2 * 1024 * 1024,
  //       // quality: RNCamera.Constants.VideoQuality['480p'], // Uncomment and adjust if needed
  //     });
  //     promise.then((data) => {
  //       setVideoURI(data.uri);
  //       setVideoUrl(data.uri);
  //       setIsRecording(false);
  //       if (from === "feeds" || from === "archives" || from === "notificationFeed") {
  //         showPreview();
  //       }
  //     }).catch((e) => console.error(e));
  //   }
  // };


 
    const onHide = () => {
        setShow(false)
    }

  const uploadVideo = async() => {
    setShowpreview(!showPreview)
  }
  const reRecordVideo = () => {
    setVideoUrl('')
    if (route.params.from === "feeds" || route.params.from === "archives" || route.params.from === "notificationFeed") {
      setShowpreview(true);
      console.log("review")
    }
  }

  const submitVideo = async() => {
    
  setPostButtonText("Posting...")
  setButtonAbility(true)
    if(route.params.from=="feeds" || route.params.from == "notificationFeed"){
      setLoadingActivity(true);
     // console.log( videoUrl, "videoUrl noow")
      if(isUploaded){
            console.log(videoUrl,"got it here")
       //   const video = `data:video/mp4;base64,${videoUrl}`;
          againstVideo({variables:{
            againstVideoInput:{
              topic_id:Number(route.params.topic_id),
              video:uploadVideoUrl
            }
          }})
      }else{
        const filepath = videoUrl.split('//')[1];
        const videoUriBase64 = await RNFS.readFile(filepath, 'base64');
        const video = `data:video/mp4;base64,${videoUriBase64}`;
        console.log(video, "vidoo recordimg")
        againstVideo({variables:{
          againstVideoInput:{
            topic_id:Number(route.params.topic_id),
            video:video
          }
        }})
      }
      
      
    } else if(route.params.from=="archives"){
      setLoadingActivity(true);
      const filepath = videoUrl.split('//')[1];

      const videoUriBase64 = await RNFS.readFile(filepath, 'base64');
      const video = `data:video/mp4;base64,${videoUriBase64}`;
      recaptureVideo({variables:{
        topic_id:Number(route.params.topic_id),
        video:video
      }})
    } else {
      console.log("videoUrl", videoUrl)
    navigation.navigate('createTopic', {videoURI:videoUrl})
    }
  }

  const [againstVideo] = useMutation(AGAINST_MUTATION,{

    onCompleted(data) {
      if (data) {
        console.log("route.params.againstVideo", route.params.from)
        setLoadingActivity(false);
        setPostButtonText("Post")
        setButtonAbility(false)
        Toast.showWithGravity('Video posted successfully !!', Toast.LONG, Toast.BOTTOM)
        if(route.params.from == "notificationFeed"){
          navigation.navigate('individualTopic')
        }else{
          navigation.navigate('feeds')
        }
       
      //   {
      //     (route.params.from == "notificationFeed")?
      //   props.navigation.navigate('individualTopic')
      //   :
      //   props.navigation.navigate('feeds')
      // }
        
        
      }
    },
    onError(error, operation) {
      console.log(JSON.stringify(error))
      setPostButtonText("Post")
      setButtonAbility(false)
      if (error.graphQLErrors) {
        if (error.graphQLErrors.length > 0) {
          Toast.showWithGravity(error.graphQLErrors[0].message.toString(), Toast.LONG, Toast.BOTTOM);
        }
      }
      setLoadingActivity(false);
      // ErrorHandler.showError(error);
    },
  });

  const [recaptureVideo] = useMutation(RECAPTURE_VIDEO,{

    onCompleted(data) {
      if (data) {
        setButtonAbility(false)
        setPostButtonText("Post")
        setLoadingActivity(false);
        props.navigation.navigate('archives')
        
      }
    },
    onError(error, operation) {
      console.log(JSON.stringify(error))
      setPostButtonText("Post")
      setButtonAbility(false)
      if (error.graphQLErrors) {
        if (error.graphQLErrors.length > 0) {
          Toast.showWithGravity(error.graphQLErrors[0].message.toString(), Toast.LONG, Toast.BOTTOM);
        }
      }
      setLoadingActivity(false);
      // ErrorHandler.showError(error);
    },
  });


  const uploadFromPhoneVideo = async () => {
    setIsUpLoaded(true)
    setIsUpLoadedLoaded(true)
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.video],
      });
      
      // Check if there is at least one item in the array and if its type is video
      if (res.length > 0 && res[0].type && res[0].type.includes('video')) {
        const fileInfo = await RNFS.stat(res[0].uri);
        const fileSizeInBytes = fileInfo.size;
        const fileSizeInMb = fileSizeInBytes / (1024 * 1024); // Convert file size to MB
        const durationInSeconds = await getVideoDuration(res[0].uri);

       console.log("durationInSeconds", durationInSeconds)

        if (durationInSeconds <= 24) {
            console.log("res[0].uri", res[0].uri)
            // setVideoUrl(res[0].uri)
            // setShow(true)

           getBase64ForUoplad(res[0].uri);
         
        } else {
          setIsUpLoaded(false)
          setIsUpLoadedLoaded(false)
          // Display an error message if the video exceeds the size or duration limit
          Toast.showWithGravity(
            'Video duration or size cannot exceed 24 seconds',
            Toast.LONG,
            Toast.BOTTOM
          );
        }
      } else {
        // Display an error message if no file is selected or if the selected file is not a video
        Toast.showWithGravity('Please select a valid video file', Toast.LONG, Toast.BOTTOM);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
        setIsUpLoadedLoaded(false)
        setIsUpLoaded(false)
        return;
      }
     
      // Handle other errors
      console.error(err);
    }
  };


  const getBase64ForUoplad = async (getvideoUri) => {
    try {
      console.log("videoUri ==>", getvideoUri);
      const videoUriBase64 = await RNFS.readFile(getvideoUri, 'base64');
  
      console.log("videoUriBase64", videoUriBase64);
  
      createThumbnail({
        url: getvideoUri,
        timeStamp: 10000,
      })
      .then(response => setThumbnail(response.path))
      .catch(err => console.log({ err }));
     // setVideoURI(getvideoUri);
      setVideoUrl(getvideoUri);
      setIsRecording(false);
      setShowpreview(true)
      setVideoUploadUrl(`data:video/mp4;base64,${videoUriBase64}`);
 
    setIsUpLoadedLoaded(false);
    } catch (error) {
      console.error("Error converting video to base64:", error);
      setIsUpLoadedLoaded(false);
    }
  }

const closeUploadedVideo = () =>{
  setVideoUrl("") 
  setIsUpLoaded(false);
  setShowpreview(false)
}
  


  const RenderRecording = () => {
    
   
    const backgroundColor = isRecording ? 'white' : null;
    const action = isRecording ? stopVideo : takeVideo;
    const button = isRecording ? renderStopRecBtn() : renderRecBtn();
    return (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <SemiBoldText style={{width:80,fontSize:16,color:Constants.btnColor, paddingLeft:15}}>{timeCounter}</SemiBoldText>
        <TouchableOpacity
          style={[
            {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              // marginRight: 20
            },
          ]}
          onPress={() => action()}
        >
          {button}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            {
              // flex: 1,
              justifyContent: 'center',
              alignItems: 'flex-end',
              marginRight: 20,
            },
          ]}
          onPress={toggleFacing}
        >
          <Image source={require('../../assets/Icons/rotate.png')} style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <View style={[styles.container, {backgroundColor:screenModeStyles.backgroundColor}]}>
      <Loader loading={loadingActivity} />
      <View style={[styles.header, {backgroundColor:screenModeStyles.backgroundColor}]}>
        <Header title="Create video" back={() => navigation.goBack()} />
      </View>
      <SemiBoldText style={{ margin: 20 }}>Video recorded here</SemiBoldText>
    
      <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: screenModeStyles.backgroundColor }} bounces={false}>
          

          
                
                  {
                        isUploaded && videoUrl !== "" &&
                        <View style={{ flex: 1}}>
                         <ImageBackground source={{ uri: thumbnailImage }} resizeMode={"cover"} style={{  height: 250, backgroundColor: '#a1a1a1', justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                             <TouchableOpacity onPress={() => { setShow(true); }} >
                                 {/* <Image  style={{ flex:1, height: 250, resizeMode: 'contain' }} /> */}
                                 <Image source={require('../../assets/Icons/play-icon.png')} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
                             </TouchableOpacity>
                             <TouchableOpacity onPress={() => closeUploadedVideo()} style={{ position: 'absolute', top: 4, right: 10 }}>
                                 <Image
                                     source={require('../../assets/Icons/close.png')}
                                 // 
                                 />
                             </TouchableOpacity>
                           
                         </ImageBackground>
                         </View>

                         }

          {
              isUploadedLoded &&
              <View style={{flex:1,flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                   <ActivityIndicator  />
              </View>
           }
         


           {
             !isUploaded && 
             <View style={{ flex: 1, alignItems:"center"}}>
             <RNCamera
                ref={cameraRef}
               
               style={{
                flex:1,
                 aspectRatio: 140/165,
                 width: Dimensions.get('window').width*.95,
                 height: Dimensions.get('window').height*95,
                 justifyContent: 'space-between',

                 margin:10,
               }}
               type={type}
               flashMode={flash}
               captureAudio={true}
               
               androidCameraPermissionOptions={{
                 title: 'Permission to use camera',
                 message: 'We need your permission to use your camera',
                 buttonPositive: 'Ok',
                 buttonNegative: 'Cancel',
               }}
   
               androidRecordAudioPermissionOptions={{
                 title: 'Permission to use audio recording',
                 message: 'We need your permission to use your audio',
                 buttonPositive: 'Ok',
                 buttonNegative: 'Cancel',
               }}
             >
               <View style={{ flex: 1 }} />
   
                 <View
                   style={{
                     height: 70,
                     marginBottom:5
                   }}
                 >
                   <RenderRecording />
                 </View>
             </RNCamera>
   
           </View>
           }
      

      </ScrollView>
      <View style={{ marginVertical:60}}>
      {route.params.from=="createVideo"?
      !showPreview && videoUrl!==''&&
      <View style={{flexDirection:'row',  justifyContent:'center'}}>
      <Button title={"Rerecord"} onPress={()=>reRecordVideo()} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .36, borderRadius: 2, minHeight: 50 }} />
      <Button title={route.params.from=="feeds"|| route.params.from=="archives"?"Upload":"Next"} onPress={()=>route.params.from=="feeds"|| route.params.from=="archives"?uploadVideo():submitVideo()} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .36, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
      </View>
      :null
      }

         {/* <TouchableOpacity onPress={()=> navigation.navigate('createTopic', {videoURI:null})}>
                                <RegularText> pRESS ME</RegularText>
                                </TouchableOpacity>  */}
      
      {videoUrl!=='' && route.params.from=="feeds"  && showPreview &&
        <View style={{flexDirection:'row',  justifyContent:'center'}}>
          <Button title={"Preview"} onPress={()=>{setShow(true);}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50 }} />
          <Button title={"Rerecord"} onPress={()=>{reRecordVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
          <Button  buttondisable={buttonAbility} title={postButtonText} onPress={()=>{submitVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
        </View>
      }

      {videoUrl!==''&& route.params.from=="notificationFeed"  && showPreview &&
        <View style={{flexDirection:'row',  justifyContent:'center'}}>
          <Button title={"Preview"} onPress={()=>{setShow(true);}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50 }} />
          <Button title={"Rerecord"} onPress={()=>{reRecordVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
          <Button title={postButtonText} onPress={()=>{submitVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
        </View>
      }

      {videoUrl!==''&& route.params.from=="archives"  && showPreview &&
        <View style={{flexDirection:'row',  justifyContent:'center'}}>
          <Button title={"Preview"} onPress={()=>{setShow(true);}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50 }} />
          <Button title={"Rerecord"} onPress={()=>{reRecordVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
          <Button  buttondisable={buttonAbility} title={postButtonText} onPress={()=>{submitVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
        </View>
      }

         
     

               {
                 !showPreview && route.params.from=="feeds"  && 
                <View>
                <SemiBoldText style={{ margin: 10, marginLeft:20 }}>Or Upload  recorded Video here</SemiBoldText>
                 <TouchableOpacity 
                         onPress={() => uploadFromPhoneVideo()}
                          style={{
                             flexDirection: 'row', 
                             alignItems: 'center', 
                             backgroundColor: Constants.btnColor, 
                             // marginTop: 15, 
                             borderRadius: 15, 
                             paddingVertical: 10, // Adjust as needed for padding top and bottom
                             paddingHorizontal: 15,  
                             marginHorizontal:20
                             
                           }} >
                             <Image source={require('../../assets/Icons/video.png')} style={{ width: 30, height: 30, resizeMode: 'contain', tintColor:'white' }} />
                             <SemiBoldText style={{color:'white', fontSize:16, paddingLeft:5}}>Upload Video </SemiBoldText>
                  </TouchableOpacity>
                </View>
     

             }
            

      <VideoPlayer show={show} onHide={onHide} url={videoUrl} />
    </View>
    </View>
  );
};
export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#fff',
    elevation: 3,
    borderBottomColor: Constants.btnColor,
    borderBottomWidth: 1
  },
});


