import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Dimensions, Text, ImageBackground, FlatList, Platform } from 'react-native';
import Toast from 'react-native-simple-toast';
import { useMutation, useQuery } from "@apollo/react-hooks";
import { gql } from 'apollo-boost';
import { Picker } from "@react-native-community/picker";
import Header from '../../Components/Header';
import { Button } from '../../Components/button'
import VideoTile from "../../Components/VideoTiles";
import { RegularText, BoldText, SemiBoldText } from "../../Components/styledTexts";
import Constants from "../constants.json";
import Input from "../../Components/InputField";
import ModalPicker from "../../Components/searchModalPicker";
import Loader from '../../Components/Loader'
import RNFS from 'react-native-fs'
import { createThumbnail } from "react-native-create-thumbnail";
import VideoPlayer from '../../Components/VideoPlayer'
import { GET_CATEGORY, GET_USER_LIST } from "../../utils/Queries";
import { CREATE_TOPIC } from "../../utils/Mutations";
import { UserContext } from '../../../App';
import { ThemeContext } from '../../utils/screenModes/ThemeContext';
import { darkTheme, lightTheme } from '../../utils/screenModes/theme';
import DocumentPicker from 'react-native-document-picker';
import Video from 'react-native-video';
import { getVideoDuration } from 'react-native-video-duration';


export default function CreateTopic({ route, navigation }) {
    const userContext = useContext(UserContext)
    const [claim, setClaim] = useState("");
    const [categoryArray, setCategoryArray] = useState([]);
    const [category, setCategory] = useState(0);
    const [userArray, setUserArray] = useState([]);
    const [initialUserArray, setInitialUserArray] = useState([]);
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    const [userActivity, setUserActivity] = useState(true);
    const [video, setVideo] = useState("");
    const [loadingActivity, setLoadingActivity] = useState(false);
    const [videoUrl, setVideoUrl] = useState("")
    const [thumbnailImage, setThumbnail] = useState("");
    const [show, setShow] = useState(false);
    const [showUserList, setShowUserList] = useState(false)
    const { theme, toggleTheme } = useContext(ThemeContext);
    const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;
    const videoRef = useRef(null);


    const { data: categoryData, loading: categoryLoading, error: categoryError } = useQuery(GET_CATEGORY, { fetchPolicy: 'cache-and-network' });
    const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER_LIST, { fetchPolicy: 'cache-and-network' });




const uploadVideo = async () => {
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

        if (durationInSeconds <= 20 ) {
            console.log("res[0].uri", res[0].uri)
            setVideoUrl(res[0].uri);
            setLoadingActivity(true);
            getBase64ForUoplad(res[0].uri);
        } else {
          // Display an error message if the video exceeds the size or duration limit
          Toast.showWithGravity(
            'Video duration or size cannot exceed 20 seconds',
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
        return;
      }
      // Handle other errors
      console.error(err);
    }
  };
  


  
 
    useEffect(() => {
        if (route.params) {
            if (route.params.videoURI) {
                console.log("check")
                setVideoUrl(route.params.videoURI);
                setLoadingActivity(true);
                getBase64(route.params.videoURI)
            }
        }
    }, [route.params]);


    useEffect(() => {

        if (categoryData && categoryData.categoryList) {

            setCategoryData(categoryData.categoryList)
        }
    }, [categoryData, categoryError]);


    useEffect(() => {
       console.log("thumbnailImage ==>" , videoUrl)
    }, [thumbnailImage]);

    const setCategoryData = data => {
        let temp_data = [];
        let other_arr = []
        data.map((item) => {
            if (item.name == "Other") {
                other_arr.push(item)
            } else {
                temp_data.push(item)
            }
        });
        // console.log([...temp_data,...other_arr])
        setCategoryArray(temp_data.concat(other_arr))
    }

    useEffect(() => {

    

        if (userData && userData.usersList) {
            modifyUserArray(userData.usersList)
    }
    }, [userData, userError]);

    const modifyUserArray = data => {
        let temp = [];
        let temp_data = [];
        data.map((item) => {
            if (item.id == userContext.profile.id) {
                temp_data.push({ label: item.first_name + " " + item.last_name + "(Me)", value: item.id })
            } else {
                temp_data.push({ label: item.first_name + " " + item.last_name, value: item.id })
            }
        });
        // console.log(temp_data,"temp_data.push")
        // data.map(item=>temp.push({label: item.first_name + " " +item.last_name, value: item.id}))
        // data.map(item=>temp.push({label: item.first_name + " " +item.last_name, value: item.id}))
        setUserArray(temp_data)
        setUserActivity(false)
    }

    const searchUserArray = text => {
        setUserName(text);
        if (text.length > 2) {
            let find_text = text.toLowerCase();
            const data = userArray.filter(item => {
                const findName = item.label.toLowerCase();
                return findName.indexOf(find_text) > -1;
            });
            setShowUserList(true)
            setInitialUserArray([...new Set(data)])
        } else {
            setShowUserList(false);
        }
    }

    const searchUser = async (item) => {
        setUserName(item.label)
        setUserId(item.value)
        setShowUserList(false)

    }

    const getBase64ForUoplad = async (videoUri) => {
        try {
          console.log("videoUri ==>", videoUri);
          const videoUriBase64 = await RNFS.readFile(videoUri, 'base64');
      
          console.log("videoUriBase64", videoUriBase64);
      
          createThumbnail({
            url: videoUri,
            timeStamp: 10000,
          })
          .then(response => setThumbnail(response.path))
          .catch(err => console.log({ err }));
      
          setVideo(`data:video/mp4;base64,${videoUriBase64}`);
          setLoadingActivity(false);
        } catch (error) {
          console.error("Error converting video to base64:", error);
          setLoadingActivity(false);
        }
      }
      


    const getBase64 = async (videoUri) => {
        console.log("videoUri ==>", videoUri)

        const filepath = videoUri.split('//')[1];
        const videoUriBase64 = await RNFS.readFile(filepath, 'base64');

        console.log("filepath", filepath )

        createThumbnail({
            url: videoUri,
            timeStamp: 10000,
        })
            .then(response => setThumbnail(response.path))
            .catch(err => console.log({ err }));
        setVideo(`data:video/mp4;base64,${videoUriBase64}`);
      //  console.log("videoUriBase64",videoUriBase64)
        setLoadingActivity(false);
    }

    const create_topics = async () => {
        console.log(video, "create topic video")
        if (claim === null || claim === "") {
            Toast.showWithGravity('Please enter claim topic', Toast.LONG, Toast.BOTTOM);
        } else if (category === null || category === "") {
            Toast.showWithGravity('Please select category', Toast.LONG, Toast.BOTTOM);
        } else if (video === null || video === "") {
            Toast.showWithGravity('Please capture video', Toast.LONG, Toast.BOTTOM);
        } else {
            setLoadingActivity(true)
            let temp_data = {
                claim: claim,
                category_id: Number(category),
               video: video,
             
                // is_respond: (userName) ? true : false,
                is_respond: userName && userId ? true : false,
            }
            if (userName !== "" && userId !== ""  ) {
                temp_data['responder_id'] = [Number(userId)]
            }

             console.log("temp_data", temp_data)
            createTopics({
                variables: {
                    createTopicInput: temp_data

                }
            })
        }
    }

    const [createTopics] = useMutation(CREATE_TOPIC, {
        onCompleted(data) {
            if (data) {
                setLoadingActivity(false);
                console.log(data, "data")
                setClaim("");
                setCategory("");
                setVideo("");
                setVideoUrl("")
                setThumbnail("");
                setUserId("")
                setUserName("")

                Toast.showWithGravity('Topic Created!!', Toast.LONG, Toast.BOTTOM);
                setTimeout(() => {
                    navigation.navigate('feeds');
                }, 1000)
            }
        },
        onError(error, operation) {
            console.log(JSON.stringify(error), " createTopics error")
            //   if (error.graphQLErrors) {
            //     if (error.graphQLErrors.length > 0) {
            //       Toast.showWithGravity(error.graphQLErrors[0].message.toString(), Toast.LONG, Toast.BOTTOM);
            //     }
            //   }
            //   console.log(form, 'form');
            // setData({})
            setLoadingActivity(false);
            //   ErrorHandler.showError(error);
        },
    })

    const onHide = () => {
        setShow(false)
    }
    return (
        <View style={[styles.container, {backgroundColor:screenModeStyles.backgroundColor}]}>
            <View style={[styles.header, {backgroundColor:screenModeStyles.backgroundColor}]}>
                <Header title="Tell Your Side"
                />
            </View>
            <ScrollView style={[styles.body, {backgroundColor:screenModeStyles.backgroundColor}]} bounces={false}>

                <View style={[styles.bottomPart, {backgroundColor:screenModeStyles.backgroundColor}]}>
                    <Text style={[styles.textStyle, { marginTop: 0 }]}>Claim</Text>
                    <TextInput
                        style={{ borderBottomWidth: 1, borderBottomColor: '#ddd', height: 40, color:"#2a6b9c" }}
                        value={claim}
                        onChangeText={(text) => setClaim(text)}
                        placeholder="The voting question"
                        placeholderTextColor={screenModeStyles.textColor}
                        
                    />

                    <Text style={[styles.textStyle, { paddingTop: 0 }]}>Category</Text>
                    <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                        <Picker
                            selectedValue={category}
                            onValueChange={(itemValue, itemIndex) => setCategory(itemValue)}
                            style={{ flex: 1,  color:screenModeStyles.textColor }}
                           // itemStyle={{color:"red"}}
                            itemStyle={{color:screenModeStyles.textColor}}
                        >
                            {categoryArray.length > 0 &&
                                categoryArray.map((item, idx) => <Picker.Item  key={item.id.toString()} label={item.name} value={item.id} />)
                            }
                        </Picker>

                    </View>
                    {!userActivity &&
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.textStyle, { paddingTop: 0 }]}>Send to specific person</Text>
                            <Text style={styles.desc}>Type the first three words of the person's name and select</Text>
                            <TextInput
                                style={{ borderBottomWidth: 1, borderBottomColor: '#ddd', height: 40, color:"#2a6b9c" }}
                                value={userName}
                                placeholderTextColor={"grey"}
                                onChangeText={(text) => { searchUserArray(text) }}
                                placeholder="Type here"
                            />
                            {showUserList &&
                                <View style={{ maxHeight: 190, }}>
                                    <FlatList
                                        data={initialUserArray}
                                        keyExtractor={item => item.value}
                                        keyboardShouldPersistTaps="always"
                                        renderItem={({ item, index }) => {
                                            return (
                                                initialUserArray.length == 1 ?
                                                    <TouchableOpacity style={{ padding: 10, backgroundColor: 'rgba(0,0,0,.03)' }} onPress={() => searchUser(item)}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                                            <RegularText style={{ fontSize: 16 }}>{item.label}</RegularText>

                                                        </View>

                                                    </TouchableOpacity>
                                                    :
                                                    <TouchableOpacity style={{ padding: 5, backgroundColor: (index % 2) ? 'rgba(0,0,0,.03)' : "#fff" }} onPress={() => searchUser(item)}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                                            <RegularText style={{ fontSize: 16 }}>{item.label}</RegularText>

                                                        </View>

                                                    </TouchableOpacity>
                                            )
                                        }}
                                    />
                                </View>
                            }
                            {/* <ModalPicker
                                dataSource={userArray}
                                dummyDataSource={userArray}
                                defaultValue={false}
                                pickerTitle={"Select User"}
                                showSearchBar={true}
                                showPickerTitle={true}
                                pickerStyle={styles.pickerStyle}
                                selectedLabel={userName}
                                placeHolderLabel={"Select User"}
                                searchBarPlaceHolder={"Search..."}
                                selectLabelTextStyle={styles.selectLabelTextStyle}
                                placeHolderTextStyle={styles.placeHolderTextStyle}
                                dropDownImageStyle={styles.dropDownImageStyle}
                                clearOnPress={()=>{setUserId(0); setUserName('');} }
                                clearImage={require('../../assets/Icons/close.png')}
                                dropDownImage={require("../../assets/Icons/dropDown.png")}
                                selectedValue={(value) => {
                                    setUserId(value) 
                                    let data = userArray.find(item=>item.value == value);
                                    setUserName(data.label)
                                    
                                }}
                            /> */}

                        </View>
                    }
                    {/* <Text style={[styles.textStyle]}>Create Video</Text> */}
                    <View style={{ justifyContent:"space-between", flexDirection:"row"}}>
                    <TouchableOpacity 
                    onPress={() => { navigation.navigate('recordVideo', { from: 'createVideo' }) }}
                     style={{
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        backgroundColor: Constants.btnColor, 
                        marginTop: 15, 
                        borderRadius: 15,
                        marginRight:5, 
                        paddingVertical: 10, // Adjust as needed for padding top and bottom
                        paddingHorizontal: 15  // Adjust as needed for padding left and right
                        
                      }} >
                        <Image source={require('../../assets/Icons/video.png')} style={{ width: 30, height: 30, resizeMode: 'contain', tintColor:'white' }} />
                        <SemiBoldText style={{color:'white', fontSize:16, paddingLeft:5}}>Create Video </SemiBoldText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                    onPress={() => uploadVideo()}
                     style={{
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        backgroundColor: "white", 
                        borderColor: Constants.btnColor,
                        marginTop: 15, 
                        borderWidth:1,
                        borderRadius: 15, 
                        paddingVertical: 10, // Adjust as needed for padding top and bottom
                        paddingHorizontal: 15  // Adjust as needed for padding left and right
                        
                      }} >
                        <Image source={require('../../assets/Icons/video.png')} style={{ width: 30, height: 30, resizeMode: 'contain', tintColor:'white' }} />
                        <SemiBoldText style={{color:Constants.btnColor, fontSize:16, paddingLeft:5}}>Upload Video </SemiBoldText>
                    </TouchableOpacity>
                    </View>
                       {
                        videoUrl !== "" &&
                        <ImageBackground source={{ uri: thumbnailImage }} resizeMode={"cover"} style={{ flex: 1, height: 250, backgroundColor: '#a1a1a1', justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                            <TouchableOpacity onPress={() => { setShow(true); }} >
                                {/* <Image  style={{ flex:1, height: 250, resizeMode: 'contain' }} /> */}
                                <Image source={require('../../assets/Icons/play-icon.png')} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setVideoUrl("") }} style={{ position: 'absolute', top: 4, right: 10 }}>
                                <Image
                                    source={require('../../assets/Icons/close.png')}
                                // 
                                />
                            </TouchableOpacity>
                          
                        </ImageBackground>
                        }

                    <Button title={"Post"} onPress={() => { loadingActivity ? null : create_topics() }} style={{ alignSelf: 'center', marginVertical: 60, width: Dimensions.get('screen').width * .8, borderRadius: 10, minHeight: 50, backgroundColor: loadingActivity ? '#fdac4150' : Constants.btnColor }} />

                </View>

                <VideoPlayer show={show} onHide={onHide} url={videoUrl} />
            </ScrollView>
            <Loader loading={loadingActivity} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    header: {
        backgroundColor: '#fff',
        elevation: 3,
        borderBottomColor: Constants.btnColor,
        borderBottomWidth: 1
    },
    body: {
        flex: 1,
        backgroundColor: '#fff',
    },
    bottomPart: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },
    textStyle: {
        marginTop: 20,
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        color: 'gray'
    },
    desc:{
        fontSize: 12,
        fontFamily: "Poppins-Light",
        color: 'gray'
    },
    selectLabelTextStyle: {
        color: "#000",
        textAlign: "left",
        fontSize: 15,
        width: "99%",
        padding: 10,
    },
    placeHolderTextStyle: {
        color: "#000",
        padding: 10,
        textAlign: "left",
        width: "99%",
        flexDirection: "row"
    },
    dropDownImageStyle: {
        width: 10,
        height: 10,
        alignSelf: "center"
    },
    pickerStyle: {
        shadowColor: '#DDDDDD',
        width: '100%',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        shadowOpacity: 0,
        color: '#2a6b9c',
        fontFamily: 'Poppins-Regular',
        paddingRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
});
