/* eslint-disable no-console */
import React , {useEffect, useState}from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Image, ScrollView } from 'react-native';

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
import { Colors } from 'react-native/Libraries/NewAppScreen';
const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

var time = 1;
var interval;


class CameraScreen extends React.Component {


  constructor(props) {
  
    super(props);
    this.state = {
      videoURI:'',
      timeCounter:"00:00",
      flash: 'off',
      zoom: 0,
      type: 'back',
      startTime: 0,
      countdownTime: 21, // Set the initial countdown time in seconds
      countdownInterval: null,
      // ratio:'3:4',
      recordOptions: {
        mute: false,
        maxDuration:20,
        videoBitrate: 2*1024*1024,
     //   quality: RNCamera.Constants.VideoQuality['480p'],
      },
    isRecording: false, };
  }

  // componentDidMount() {
  //   this.startCountdown();
  // }
  componentWillUnmount() {
    this.clearCountdownInterval();
  }


  formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  startCountdown = () => {
    this.setState({
      countdownTime: 21, // Reset the countdown time to 25 seconds
      countdownInterval: setInterval(() => {
        this.setState(prevState => {
          if (prevState.countdownTime <= 0) {
            clearInterval(prevState.countdownInterval);
            this.stopVideo(); // Stop video when countdown reaches 0
            return { countdownInterval: null, timeCounter: "00:00" };
          } else {
            return { countdownTime: prevState.countdownTime - 1, timeCounter: this.formatTime(prevState.countdownTime - 1) };
          }
        });
      }, 1000)
    });
  }

  clearCountdownInterval = () => {
    if (this.state.countdownInterval) {
      clearInterval(this.state.countdownInterval);
      this.setState({ countdownInterval: null });
    }
  }
  stopCountdown = () => {
    clearInterval(this.state.countdownInterval);
    this.setState({ countdownInterval: null, countdownTime: 0 });
  }
  
  toggleFacing() {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  }

  zoomOut() {
    this.setState({
      zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1,
    });
  }

  zoomIn() {
    this.setState({
      zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1,
    });
  }
  
  increaseTime = (time) => {
     var minutes = Math.floor(time / 60);
     var seconds = time - minutes * 60;
     if (minutes.toString().length == 1) {
      minutes = "0" + minutes;
     }
     if (seconds.toString().length == 1) {
      seconds = "0" + seconds;
     }
      // console.log(minutes+":"+seconds);
      this.setState({timeCounter: minutes+":"+seconds})
      if(minutes+":"+seconds =="00:20"){
        this.stopVideo()
      }
  }
  // stopVideo = async () => {
  //   await this.camera.stopRecording();
  //   this.setState({startTime:null, isRecording: false})
    
  //   // this.setState({ isRecording: false });
  // };

  stopVideo = async () => {
    if (this.state.isRecording) {
      await this.camera.stopRecording();
    }
    this.clearCountdownInterval();
    this.setState({ isRecording: false, timeCounter: "00:00" });
  };

  
  takeVideo = async () => {
    this.setState({
      startTime:1
  }, async () => {
    
    const { isRecording } = this.state; 
    if (this.camera && !isRecording) {
      this.startCountdown();
      try {
        const promise = this.camera.recordAsync(this.state.recordOptions);
        if (promise) {
          this.setState({startTime:0, timeCounter:null,  isRecording: true})
          
          // this.setState({ });
          const data = await promise;
          this.setState({videoURI:data.uri})
          this.props.setVideoUrl(data.uri)
          if(this.props.from == "feeds" || this.props.from == "archives" || this.props.from == "notificationFeed"){
            this.props.showPreview();
          }
          
        }
      } catch (e) {
        console.error(e);
      }
    }
  });
    
  };

  toggle = value => () => this.setState(prevState => ({ [value]: !prevState[value] }));

  

  renderRecording = () => {
    
    const { isRecording } = this.state;
    const backgroundColor = isRecording ? 'white' : null;
    const action = isRecording ? this.stopVideo : this.takeVideo;
    const button = isRecording ? this.renderStopRecBtn() : this.renderRecBtn();
    return (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <SemiBoldText style={{width:80,fontSize:16,color:Constants.btnColor, paddingLeft:15}}>{this.state.timeCounter}</SemiBoldText>
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
          onPress={this.toggleFacing.bind(this)}
        >
          <Image source={require('../../assets/Icons/rotate.png')} style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
      </View>
    );
  };

  

  renderRecBtn() {
    return <Image source={require('../../assets/Icons/record.png')} style={{ width: 70, height: 70 }} />;
  }

  renderStopRecBtn() {
    return <Image source={require('../../assets/Icons/stop.png')} style={{ width: 70, height: 70, tintColor: Constants.btnColor }} />;
  }


  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title="Create video"
            back={() => this.props.navigation.goBack()}
          />
        </View>
       
        
        <SemiBoldText style={{ margin: 20 }}>Video will record here</SemiBoldText>
        <ScrollView contentContainerStyle={{flex: 1, backgroundColor: '#f4f6f8',}} bounces={false}>
        
        <View style={{ flex: 1}}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            
            style={{
              flex:1,
              width: Dimensions.get('window').width*.95,
              // height: Dimensions.get('window').height*.8,
              justifyContent: 'space-between',
              margin:10,
            }}
            type={this.state.type}
            flashMode={this.state.flash}
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
                {this.renderRecording()}
              </View>
          </RNCamera>

        </View>

        {/* <Text style={{ fontSize: 20, color:"#fdac41" }}>
        Countdown: {this.state.countdownTime} seconds
        </Text> */}
        
        {/* <CountDown
        until={this.state.startTime}
        timeToShow={['M', 'S']}
       onChange={(e) => {this.increaseTime(e)} }
        size={0}
        style={{position:'absolute', left: -10000, top: -10000}}
      /> */}
        </ScrollView>
        
      </View>
    );
  }
}
export default function({props, navigation}) {
  const route = useRoute();
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showPreview, setShowpreview] = useState(false);
  const [show, setShow] = useState(false);
    const onHide = () => {
        setShow(false)
    }

  const uploadVideo = async() => {
    setShowpreview(!showPreview)
  }
  const reRecordVideo = () => {
    setVideoUrl('')
  }
  const submitVideo = async() => {
    
console.log("route.params.from", route.params.from)
    if(route.params.from=="feeds" || route.params.from == "notificationFeed"){
      setLoadingActivity(true);
      const filepath = videoUrl.split('//')[1];
      const videoUriBase64 = await RNFS.readFile(filepath, 'base64');
      const video = `data:video/mp4;base64,${videoUriBase64}`;
      againstVideo({variables:{
        againstVideoInput:{
          topic_id:Number(route.params.topic_id),
          video:video
        }
      }})
      
      
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
        console.log('login response data is', data);
        setLoadingActivity(false);
        props.navigation.navigate('archives')
        
      }
    },
    onError(error, operation) {
      console.log(JSON.stringify(error))
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
    <>
    <Loader loading={loadingActivity} />
    <CameraScreen  navigation={navigation} {...props} videoUrl={videoUrl} setVideoUrl={setVideoUrl} from={route.params.from} showPreview={uploadVideo} />
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
      
      {videoUrl!==''&& route.params.from=="feeds"  && showPreview &&
        <View style={{flexDirection:'row',  justifyContent:'center'}}>
          <Button title={"Preview"} onPress={()=>{setShow(true);}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50 }} />
          <Button title={"Rerecord"} onPress={()=>{reRecordVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
          <Button title={"Post"} onPress={()=>{submitVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
        </View>
      }

      {videoUrl!==''&& route.params.from=="notificationFeed"  && showPreview &&
        <View style={{flexDirection:'row',  justifyContent:'center'}}>
          <Button title={"Preview"} onPress={()=>{setShow(true);}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50 }} />
          <Button title={"Rerecord"} onPress={()=>{reRecordVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
          <Button title={"Post"} onPress={()=>{submitVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
        </View>
      }

      {videoUrl!==''&& route.params.from=="archives"  && showPreview &&
        <View style={{flexDirection:'row',  justifyContent:'center'}}>
          <Button title={"Preview"} onPress={()=>{setShow(true);}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50 }} />
          <Button title={"Rerecord"} onPress={()=>{reRecordVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
          <Button title={"Post"} onPress={()=>{submitVideo()}} style={{ alignSelf: 'center', width: Dimensions.get('window').width * .27, borderRadius: 2, minHeight: 50, marginLeft:15 }} />
        </View>
      }
      <VideoPlayer show={show} onHide={onHide} url={videoUrl} />
    </View>
    
        
    </>
    
  );
}
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

