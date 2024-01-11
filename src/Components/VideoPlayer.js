import React, { useState } from 'react';
import { StyleSheet, View, Modal, Image, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import VideoPlayer from 'react-native-video-player';
import Constants from "../Screens/constants.json";
import Icon from 'react-native-vector-icons/MaterialIcons'; // Make sure to install react-native-vector-icons

const { width, height } = Dimensions.get('window');

export default function Videos({ show, onHide, url, thumbnail }) {
  const [paused, setPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // State to track if video has started
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleVideoLoadStart = () => {
    setHasStarted(false);
    setIsLoading(true);
  };

  const handleVideoReadyForDisplay = () => {
    setHasStarted(true);
    setIsLoading(false);
  };

  // Other functions...

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={show}
        statusBarTranslucent={false}
        onRequestClose={onHide}
      >
        <View style={isFullscreen ? styles.fullscreenContainer : styles.centeredView}>
          <TouchableOpacity
            onPress={onHide}
            style={{ alignSelf: 'flex-end', position: 'relative' }}
          >
            <Image source={require('../assets/Icons/close.png')} />
          </TouchableOpacity>
          <View style={styles.modalView}>
            <View style={{ width: width * 0.9 }}>
              <VideoPlayer
                video={url ? { uri: url } : null}
                autoplay
                resizeMode={'cover'}
                hideControlsOnStart={false}
                thumbnail={{ uri: thumbnail }}
                onLoadStart={handleVideoLoadStart}
                onReadyForDisplay={handleVideoReadyForDisplay}
                onEnd={() => {
                  // Function to call when video ends
                  setTimeout(onHide, 1000);
                }}
                customStyles={{
                  videoWrapper: { borderRadius: 5 },
                  wrapper: { borderRadius: 5, overflow: 'hidden' },
                  thumbnail: { width: width * .9, height: 250, resizeMode: 'cover', flex: 1 },
                  video: { width: width * .9, height: 250 },
                  controls: { backgroundColor: '#fff' },
                  playIcon: { color: '#00000090' },
                  controlIcon: { color: '#00000090' },
                  seekBarFullWidth: { backgroundColor: '#fff' },
                  seekBarBackground: { backgroundColor: '#ddd' },
                  seekBarKnob: { backgroundColor: Constants.btnColor },
                  seekBarProgress: { backgroundColor: Constants.btnColor },
                }}
              />
              {isLoading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={Constants.btnColor} />
                </View>
              )}
              {!hasStarted && (
                <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  video: {
    width: '100%',
    height: 250,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    marginBottom: 30,
  },
  videoFullscreen: {
    height: height - 80,
    justifyContent: "center",
    alignItems: "center",
  },
});
