import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal, Image, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Constants from "../Screens/constants.json";
import { FEEDS_AOI } from "../utils/Queries";
import { WATCH_VIDEO_MUTATION } from "../utils/Mutations";
const { width, height } = Dimensions.get('window');
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Videos({ show, onHide, url, thumbnail, videoType, topic_id, page, pageSize, claim, feedType, isCategory }) {
  const [feeds, { data: feedData, loading: feedLoading, error: feedError }] = useLazyQuery(FEEDS_AOI, { fetchPolicy: 'network-only' });

  const [paused, setPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fullscreenState, setFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoStyles = fullscreenState ? styles.videoFullscreen : styles.video;

  const handleLoadStart = () => {
    setHasStarted(false);
    setIsLoading(true);
  };

  const closeModal = () => {
    onHide();
    setFullscreen(false);
  }

  const handleReadyForDisplay = () => {
    setHasStarted(true);
    setIsLoading(false);
  };

  const togglePause = () => {
    setPaused(!paused);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  function watchCount() {
    setIsLoading(true);
    setFullscreen(false);
    if (videoType === "favour") {
      watchVideo({ variables: { videoViewsInput: { video_type_flag: true, topic_id: Number(topic_id) } } });
    } else if (videoType === "against") {
      watchVideo({ variables: { videoViewsInput: { video_type_flag: false, topic_id: Number(topic_id) } } });
    }
  }

  const [watchVideo] = useMutation(WATCH_VIDEO_MUTATION, {
    onCompleted(data) {
      if (data) {
        feeds({ variables: { claim: claim, isCategory: isCategory, sorting_id: 1, type: feedType } });
      }
    },
    onError(error) {
      if (error.graphQLErrors) {
        if (error.graphQLErrors.length > 0) {
          console.log(error.graphQLErrors[0].message.toString());
        }
      }
    },
  });

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={show}
        statusBarTranslucent={false}
        onRequestClose={closeModal}
      >
        <View style={fullscreenState ? styles.fullscreenContainer : styles.centeredView}>
          <TouchableOpacity
            onPress={closeModal}
            style={{ alignSelf: 'flex-end', position: 'relative' }}
          >
            <Image
              source={require('../assets/Icons/close.png')}
              style={{}}
            />
          </TouchableOpacity>
          <View style={styles.modalView}>
            <View style={{ width: width * .9 }}>
              <View style={{ position: 'relative' }}>
                {!hasStarted && (
                  <Image
                    source={{ uri: thumbnail }}
                    style={styles.thumbnail}
                  />
                )}
                {isLoading && (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Constants.btnColor} />
                  </View>
                )}
              <Video
  source={{ uri: url }}
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
  onError={(error) => {
    console.error("Video Error: ", error);
  }}
  onEnd={() => {
    watchCount();
    setTimeout(() => { onHide() }, 1000);
  }}
/>

              </View>
              {Platform.OS === 'android' && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                  <TouchableOpacity style={styles.playPauseButton} onPress={togglePause}>
                    <Icon name={paused ? "play-arrow" : "pause"} size={30} color={Constants.btnColor} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.fullscreenButton} onPress={() => setFullscreen(!fullscreenState)}>
                    <Icon name={fullscreenState ? "fullscreen-exit" : "fullscreen"} size={30} color={Constants.btnColor} />
                  </TouchableOpacity>
                </View>
              )}
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
    backgroundColor: 'rgba(0,0,0,.5)'
  },
  modalView: {
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
    zIndex: 1, // Ensure the thumbnail is below the loader
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    zIndex: 2, // Ensure the loader is above the thumbnail
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    marginBottom: 30,
  },
  videoFullscreen: {
    height: height - 80,
    marginBottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    margin: 10,
},
  fullscreenButton: {
    margin: 10,
  },
});