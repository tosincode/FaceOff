import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, Image, Dimensions,StyleSheet } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, } from 'react-native-popup-menu';
import CountDown from 'react-native-countdown-component';
import { BoldText, RegularMenuText, RegularText, SemiBoldText } from './styledTexts';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import VideoPlayer from './VideoPlayer'
import Loader from './Loader'
import Constants from '../Screens/constants.json'
import { ImageBackground } from 'react-native';
import { ThemeContext } from '../utils/screenModes/ThemeContext';
// import Videos from './VideoPlayer';
let userId = '';
export default function VideoTile({ item, commentPress, onPress, firstItem, votePressFavour, votePressAgainst, report, claimPress, userProfilePress, againstUserProfilePress, page, pageSize, claim, feedType, isCategory }) {

  

//    const favourPercentage = item.totalVotes ? Math.round((item.totalFavourVotes / item.totalVotes) * 100) : 0;
//    const againstPercentage = item.totalVotes ?  Math.round((item.totalAgainstVotes / item.totalVotes) * 100) : 0;
  
//    const favourPercentage = item.totalVotes ? Math.round((item.totalFavourVotes / item.totalVotes) * 100) : 0;
//    const againstPercentage = item.totalVotes ? Math.round((item.totalAgainstVotes / item.totalVotes) * 100) : 0;

   const totalFavourVotes = Number(item.totalFavourVotes) || 0;
   const totalAgainstVotes = Number(item.totalAgainstVotes) || 0;
   const totalVotes = Number(item.totalVotes) || 0;
 
   const favourPercentage = totalVotes ? Math.round((totalFavourVotes / totalVotes) * 100) : 0;
   const againstPercentage = totalVotes ? Math.round((totalAgainstVotes / totalVotes) * 100) : 0;


   //console.log("feeds item",item )

    const { theme, toggleTheme } = useContext(ThemeContext);

    const backgroundImage = theme === 'light'
    ? require('../assets/Icons/Options.png')
    : require('../assets/Icons/3dot.png');

    const [thumbnail, setThumbnail] = useState('');
    const [show, setShow] = useState(false);
    const [videoUrl, setUrl] = useState('');
    const [videoType, setVideoType] = useState(null)
   
    const onHide = () => {
        setVideoType(null)
        setShow(false)
    }

    const calcDays = (date) => {
        var startDate = moment();
        var endDate = moment(date);
        // let current = new Date();
        // let dataPosted = new Date(date);
        // var Difference_In_Time = current.getTime() - dataPosted.getTime(); 
        var Difference_In_Days = startDate.diff(endDate, 'days');
        if (Difference_In_Days > 1) {
            return moment(date).format('MM/DD/YYYY')
        } else {
            let posted_date = moment(date).format('MM/DD/YYYY');
            let today = moment().format('MM/DD/YYYY');
            if (posted_date == today) {
                return moment(date).format("hh:mm A")

            }
            else {
                return moment(date).format('MM/DD/YYYY')
            }

        }

        // return new Date(date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    }

    return <View style={{ margin: 10, marginBottom: 0, padding: 10, borderRadius: 2, borderTopColor: '#ddd', borderTopWidth: (firstItem) ? 0 : 1 }} key={JSON.stringify(item)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
        <View style={{ flex: 1}}>
        <TouchableOpacity onPress={claimPress} >
            <SemiBoldText style={{ flex: 1 }}>
                {/* Claim:  */}{item.claim}.
            </SemiBoldText>

        </TouchableOpacity>
        <View style={{}}>
                    <RegularText style={{fontSize:12, color:'#357DF5'}}>#{item.category}</RegularText>
                </View>
        </View>
            
            <Menu style={{}}>
                <MenuTrigger>
                    <Image style={{ width: 20, height: 20, resizeMode: 'contain', marginLeft: 10 }} source={backgroundImage} />
                </MenuTrigger>
                <MenuOptions customStyles={{ optionWrapper: { width: 150 } }} optionsContainerStyle={{ width: 130, paddingVertical: 10 }}>
                    {/* <MenuOption onSelect={item.isFollow ? unfollow : follow} style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                        <Image source={require('../assets/Icons/followers.png')} />
                        <RegularText style={{ color: 'black', paddingLeft: 10, marginTop: 0 }}>{item.isFollow ? "Unfollow" : "Follow"}</RegularText>
                    </MenuOption> */}
                    <MenuOption onSelect={report} style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
                        <Image source={require('../assets/Icons/report.png')} />
                        <RegularMenuText style={{ color: 'black', paddingLeft: 10, marginTop: 0 }}>Report</RegularMenuText>
                    </MenuOption>

                </MenuOptions>
            </Menu>
        </View>
        
        
        <View style={{ flex: 1, flexDirection: 'row', paddingBottom:10, marginBottom:5, borderBottomColor: '#ddd', borderBottomWidth: 1 }}>
       
            <RegularText style={{ fontSize: 12 }}>Posted: {calcDays(item.created_at)}</RegularText>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', marginBottom:10 }}>
        <View style={{flex:1,flexDirection:'row', alignItems:'center', paddingLeft:10}}>
               <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: '#dddddd50', justifyContent: 'center', alignItems: 'center', borderColor: Constants.btnColor, borderWidth: !item.profile_picture ? 1 : 0 }}>
                {item.profile_picture ?
                    <FastImage
                        //  source={item.profile_picture?{uri:'http://34.207.73.58:3002/'+item.profile_picture}:require('../assets/Icons/thumb.png')} 
                        style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', resizeMode: 'cover' }}
                        source={{
                            uri: 'http://34.207.73.58:3002/' + item.profile_picture,
                            headers: { Authorization: 'someAuthToken' },
                            priority: FastImage.priority.high,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                    : <SemiBoldText style={{ fontSize: 26, color: Constants.btnColor }}>{item.username.match(/\b(\w)/g).join('').toUpperCase()}</SemiBoldText>
                }
            </View>

            <TouchableOpacity style={{ flex: 1, marginLeft: 10 }} onPress={userProfilePress}>
                <RegularText>{item.username.toLowerCase().split(' ').map((str) => str.charAt(0).toUpperCase() + str.substring(1)).join(' ')}</RegularText>
                
            </TouchableOpacity>
            </View>
            { item.against_username &&
            <View style={{flex:1,flexDirection:'row', alignItems:'center', marginLeft:10}}>
            
            <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: '#dddddd50', justifyContent: 'center', alignItems: 'center', borderColor: Constants.btnColor, borderWidth: !item.profile_picture ? 1 : 0 }}>
                {item.against_profile_picture ?
                    <FastImage
                        //  source={item.profile_picture?{uri:'http://34.207.73.58:3002/'+item.profile_picture}:require('../assets/Icons/thumb.png')} 
                        style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', resizeMode: 'cover' }}
                        source={{
                            uri: 'http://34.207.73.58:3002/' + item.against_profile_picture,
                            headers: { Authorization: 'someAuthToken' },
                            priority: FastImage.priority.high,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                    : <SemiBoldText style={{ fontSize: 26, color: Constants.btnColor }}>{(item.against_username)?item.against_username.match(/\b(\w)/g).join('').toUpperCase():""}</SemiBoldText>
                }
            </View>
            <TouchableOpacity style={{ marginLeft: 5 }} onPress={againstUserProfilePress}>
                <RegularText>{(item.against_username)?item.against_username.toLowerCase().split(' ').map((str) => str.charAt(0).toUpperCase() + str.substring(1)).join(' '):""}</RegularText>
            </TouchableOpacity>
            </View>
            }
        </View>
            
        <View style={{ flexDirection: 'row', height: 200 }}>
            <ImageBackground source={(item.thumbnail) ? { uri: "http://34.207.73.58:3002/" + item.thumbnail } : ""} resizeMode={"cover"} style={{ flex: 1, height: 200, backgroundColor: '#a1a1a1', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => { setUrl(item.video); setThumbnail("http://34.207.73.58:3002/" + item.thumbnail); setVideoType("favour"); setShow(true); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/Icons/play-icon.png')} style={{ width: 50, height: 50, resizeMode: 'contain' }} />

                </TouchableOpacity>
            </ImageBackground>

            {item.against_video ?

                <ImageBackground source={(item.against_video_thumbnail) ? { uri: "http://34.207.73.58:3002/" + item.against_video_thumbnail } : ""} resizeMode={"cover"} style={{ flex: 1, height: 200, backgroundColor: '#a1a1a1', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => { setUrl(item.against_video); setThumbnail("http://34.207.73.58:3002/" + item.against_video_thumbnail); setVideoType("against"); setShow(true); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../assets/Icons/play-icon.png')} style={{ width: 50, height: 50, resizeMode: 'contain' }} />

                    </TouchableOpacity>
                </ImageBackground>

                : item.userIsResponder?
                <TouchableOpacity onPress={onPress} style={{ flex: 1, backgroundColor: '#a1a1a1', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/Icons/camera.png')} style={{ width: 100, height: 100, resizeMode: 'contain' }} />

                </TouchableOpacity>
                :<TouchableOpacity onPress={onPress} style={{ flex: 1, backgroundColor: '#a1a1a1', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/Icons/user-a.png')} style={{ width: 100, height: 100, resizeMode: 'contain' }} />

                </TouchableOpacity>
            }
        </View>
        <View style={{ flex: 1, flexDirection: 'row', marginTop: 10 }}>
            <View style={{ fontSize: 12, flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../assets/Icons/eye.png')} style={{ paddingRight: 12 }} />
                <RegularText style={{ paddingLeft: 4, fontSize: 13,   }}>Views: {item.views}</RegularText>
            </View>
            <RegularText style={{ fontSize: 12, flex: 1, textAlign: 'center' }}>Votes: {item.totalVotes}</RegularText>
            <TouchableOpacity onPress={commentPress} style={{ flex: 1, }}>
                <RegularText style={{ fontSize: 12, textAlign: 'right' }}>{item.totalComments} Comments</RegularText>
            </TouchableOpacity>

        </View>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', height: 40 }}>
            {item.active ?
                <Image source={require('../assets/Icons/time-out.png')} style={{ resizeMode: 'contain', }} />
            :null}
            {(item.voting_type != null) ?
                (item.voting_type_flag == 1) ?
                    <TouchableOpacity onPress={votePressFavour} style={{ flex: 1, alignItems: 'center',  }}>
                        <Image source={require('../assets/Icons/vote-1.png')} style={{ resizeMode: 'contain' }} />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={votePressFavour} style={{ flex: 1, alignItems: 'center' }}>
                        <Image source={require('../assets/Icons/vote-2.png')} style={{ resizeMode: 'contain' }} />
                    </TouchableOpacity>
                :
                <TouchableOpacity onPress={votePressFavour} style={{ flex: 1, alignItems: 'center',  }}>
                    <Image source={require('../assets/Icons/vote-2.png')} style={{ resizeMode: 'contain' }} />
                </TouchableOpacity>
            }
            {(item.voting_type != null) ?
                (item.voting_type_flag == 0) ?
                    <TouchableOpacity onPress={votePressAgainst} style={{ flex: 1, alignItems: 'center' }}>
                        <Image source={require('../assets/Icons/vote-1.png')} style={{ resizeMode: 'contain' }} />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={votePressAgainst} style={{ flex: 1, alignItems: 'center' }}>
                        <Image source={require('../assets/Icons/vote-2.png')} style={{ resizeMode: 'contain' }} />
                    </TouchableOpacity>
                :
                <TouchableOpacity onPress={votePressAgainst} style={{ flex: 1, alignItems: 'center' }}>
                    <Image source={require('../assets/Icons/vote-2.png')} style={{ resizeMode: 'contain' }} />
                </TouchableOpacity>
            }
        </View>
         {/* <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-evenly"}}>
         <RegularText style={{ fontSize: 12, }}>{againstPercentage} %</RegularText>
         <View></View>
         <RegularText style={{ fontSize: 12}}>{favourPercentage} %</RegularText>
         </View> */}
         {
            item.voting_type != "" &&  item.voting_type != null &&
                        <View style={styles.voteContainer}>
                    <RegularText style={styles.votes}>{favourPercentage} %</RegularText>
                    <View style={styles.percentageBarContainer}>
                    <View style={[styles.percentageBar, { backgroundColor: '#fdac41', width: `${favourPercentage}%` }]} />
                    <View style={[styles.percentageBar, { backgroundColor: '#2a6b9c', width: `${ againstPercentage}%` }]} />
                    </View>
                    <RegularText style={styles.votes}>{ againstPercentage} %</RegularText>
                </View>
         }
         
        <VideoPlayer show={show} onHide={onHide} url={videoUrl} thumbnail={thumbnail} videoType={videoType} topic_id={item.id} page={page} pageSize={pageSize} claim={claim} feedType={feedType} isCategory={isCategory} />
    </View>
}


const styles = StyleSheet.create({

    percentageBarContainer: {
        flexDirection: 'row',
        height: 20,
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        overflow: 'hidden',
      },
      percentageBar: {
        height: '100%',
      },
      video: {
        width: '100%',
        height: 200,
        marginVertical: 10,
      },
      voteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginVertical: 10,
      },
    });