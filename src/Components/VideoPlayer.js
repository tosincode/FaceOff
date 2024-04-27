import React, { useRef, useState } from "react";
import {StyleSheet, Text, TouchableOpacity, View, Modal, Image, Dimensions, ActivityIndicator, Platform } from 'react-native';
import VideoPlayer from 'react-native-video-player';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Constants from "../Screens/constants.json";
import { FEEDS_AOI } from "../utils/Queries";
import { WATCH_VIDEO_MUTATION } from "../utils/Mutations";
import { PLAY_ICON } from "../assets/Icons/icons/svgIcons";
import MyCustomPauseIcon from "../assets/Icons/MyCustomPauseIcon";
const { width, height } = Dimensions.get('window');
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Make sure to install react-native-vector-icons


export default function Videos({ show, onHide, url, thumbnail,videoType, topic_id, page, pageSize, claim, feedType, isCategory  }) {

  const [feeds, { data: feedData, loading: feedLoading, error: feedError }] = useLazyQuery(FEEDS_AOI, { fetchPolicy: 'network-only' });

const [paused, setPaused] = useState(false);
const [hasStarted, setHasStarted] = useState(false);
const [isLoading, setIsLoading] = useState(true); // New state for loading

const [fullscreenState, setFullscreen] = useState(false);
const [isFullscreen, setIsFullscreen] = useState(false);
// ... existing functions

const toggleFullscreen = () => {
  setFullscreen(!fullscreenState);

};



// ... existing watchCount and other functions

const videoStyles = fullscreenState
  ? styles.videoFullscreen
  : styles.video;

  

const handleLoadStart = () => {
  setHasStarted(false);
};

const closeModal = () =>{
 onHide()
 setFullscreen(false);
}

const handleReadyForDisplay = () => {
  setHasStarted(true);
};

  const togglePause = () => {
    setPaused(!paused);
  };

  const handleVideoLoad = () => {
    console.log("isLoaded")
    setIsLoading(false); 
  };
  function watchCount() {
    setIsLoading(true); 
    setFullscreen(false);
    if(videoType=="favour"){
      // console.log("video_type_flag",{
      //   video_type_flag: true,
      //   topic_id: Number(topic_id)
      // })
      watchVideo({variables: {
        videoViewsInput: {
          video_type_flag: true,
          topic_id: Number(topic_id)
        }
      }})
    } else if(videoType=="against"){
      // console.log({
      //   video_type_flag: false,
      //   topic_id: Number(topic_id)
      // })
      watchVideo({variables: {
        videoViewsInput: {
          video_type_flag: false,
          topic_id: Number(topic_id)
        }
      }})
    }
    
  }

  const [watchVideo] = useMutation(WATCH_VIDEO_MUTATION, {

    onCompleted(data) {
        if (data) {
          // console.log(data,"data")
          // console.log({
          //   // page: page, 
          //   // pageSize: pageSize, 
          //   claim:claim, 
          //   isCategory: isCategory,
          //   sorting_id: 1,
          //   type: feedType
          // },"watch video")
          feeds({variables:{
            // page: page, 
            // pageSize: pageSize, 
            claim:claim, 
            isCategory: isCategory,
            sorting_id: 1,
            type: feedType
          }})
        }
    },
    onError(error, operation) {
            if (error.graphQLErrors) {
                if (error.graphQLErrors.length > 0) {
                    console.log(error.graphQLErrors[0].message.toString());
                }
            }
        // console.log(JSON.stringify(error))
        // ErrorHandler.showError(error);
    },
});

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={show}
        statusBarTranslucent={false}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
        }}
      >
           <View style={fullscreenState ? styles.fullscreenContainer : styles.centeredView}>

          <TouchableOpacity
            onPress={() => closeModal()}
            style={{ alignSelf: 'flex-end', position: 'relative', }}
          >
            <Image
              source={require('../assets/Icons/close.png')}
              style={{}}
            />
          </TouchableOpacity>
          <View style={styles.modalView}>
         
            <View style={{ width: width * .9, }}>
            
            {/* {isLoading && (
             
             <ActivityIndicator size="large" color="red" />
        
               )} */}
               {
                  Platform.OS == 'ios' &&
                    <VideoPlayer
                video={(url) ? { uri: url } : null}
                // videoWidth={width*.9}
                // videoHeight={250}
                controlsTimeout={2000}
                autoplay
                resizeMode={'cover'}
                hideControlsOnStart={false}
                // onStart={watchCount()}
                onEnd={() => {watchCount();setTimeout(() => { onHide()}, 1000)}}
                // navigator={this.props.navigator}
                // toggleResizeModeOnFullscreen={false}
                // disableFullscreen
                // disableBack
                // disableVolume
                // disableControlsAutoHide={true}
                thumbnail={{ uri: thumbnail, }}
                customStyles={{
                  videoWrapper: { borderRadius: 5 },
                  wrapper: { borderRadius: 5, overflow: 'hidden' },
                  thumbnail: { width: width * .9, height: 250, resizeMode: 'cover', flex: 1 },
                  video: { width: width * .9, height: 250 },
                  controls: { backgroundColor: '#fff' },
                    playIcon: { color: 'red' },
              // playIcon: <MyCustomPauseIcon />,
                  controlIcon: { color: '#00000090' },
                  seekBarFullWidth: { backgroundColor: '#fff' },
                  seekBarBackground: { backgroundColor: '#ddd' },
                  seekBarKnob: { backgroundColor: Constants.btnColor },
                  seekBarProgress: { backgroundColor: Constants.btnColor },
                }}
              /> 
               }

           
        {
                  Platform.OS == 'android' &&     
            <Video
                source={{ uri: url }}   // Can be a URL or a local file.
                style={videoStyles}
                onLoadStart={handleLoadStart}
                onReadyForDisplay={handleReadyForDisplay}
                controls={true}
                paused={paused}
                onLoad={handleVideoLoad}
                onFullscreenPlayerDidPresent={() => setIsFullscreen(true)}
        onFullscreenPlayerDidDismiss={() => setIsFullscreen(false)}
                fullscreen={fullscreenState}
                resizeMode="cover"
                onEnd={() => {
                  watchCount();
                  setTimeout(() => { onHide()}, 1000)
                }
                }
                
                
              /> 
          }
 

              {/* {isLoading && (
              <View style={[styles.thumbnail, styles.loaderContainer]}>
                <ActivityIndicator size="large" color="red" />
              </View>
            )} */}
             
             
              {!hasStarted && (
                <Image
                  source={{ uri: thumbnail }}
                  style={styles.thumbnail}
                />
              )}
               {
                  Platform.OS == 'android' &&    
               <View>
              {isLoading && (
             
             <ActivityIndicator size="large" color={Constants.btnColor} />
        
               )}
    
               
               {hasStarted && (
               <View style={{flexDirection:"row", justifyContent:"space-between"}}>
               <TouchableOpacity style={styles.playPauseButton} onPress={togglePause}>
                <Icon name={paused ? "play-arrow" : "pause"} size={30} color="red" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.fullscreenButton} onPress={toggleFullscreen}>
            <Icon name={fullscreenState ? "fullscreen-exit" : "fullscreen"} size={30} color="red" />
          </TouchableOpacity>
               </View>
               )
               }
               </View>
         }

              
             
            </View>
          </View>

        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22,
    backgroundColor: 'rgba(0,0,0,.5)'
  },
  modalView: {
    // margin: 20,
    // height:300,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // elevation: 5
  },
  video: {
    width: '100%',
    height: 250, // Adjust the height as needed
  },
  thumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
   fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
   marginBottom:30,
   
  },
  videoFullscreen: {
    height:height - 80,
    marginBottom:0,
    justifyContent: "center",
   alignItems: "center",
   
  },
});