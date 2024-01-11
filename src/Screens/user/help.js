import React, { useContext } from 'react';
import { View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions} from 'react-native';
import Header from '../../Components/Header';
import { RegularText, BoldText, SemiBoldText } from "../../Components/styledTexts";
import { darkTheme, lightTheme } from '../../utils/screenModes/theme';
import { ThemeContext } from '../../utils/screenModes/ThemeContext';
import Constants from "../constants.json";

export default function Help({ route, navigation }) {

    const { theme, toggleTheme } = useContext(ThemeContext);
    const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;
    return (
        <View style={[styles.container,{backgroundColor:screenModeStyles.backgroundColor}]}>
            <View style={[styles.header, {backgroundColor:screenModeStyles.backgroundColor}]}>
                <Header title="Help (FAQ)"
                back={()=>navigation.goBack()}
                />
            </View>
            <ScrollView style={[styles.body, {backgroundColor:screenModeStyles.backgroundColor}]} bounces={false}>
                <View style={[styles.bottomPart, {backgroundColor:screenModeStyles.backgroundColor}]}>
                    <SemiBoldText style={styles.desctiption}>How do i earn points:</SemiBoldText>
                    <RegularText style={styles.desctiption}>Voting- 2 points</RegularText>
                    <RegularText style={styles.desctiption}>Winning vote- 1 point</RegularText>
                    <RegularText style={styles.desctiption}>Watch an ad- 5 points</RegularText>
                    <RegularText style={styles.desctiption}>Post a video- 5 points</RegularText>
                    <RegularText style={styles.desctiption}>Inviting someone to join- 1 points</RegularText>

                    <RegularText style={styles.desctiption}>Win a dispute- 5 points</RegularText>

                    <RegularText style={styles.desctiption}>Responding to a video: 5 points</RegularText>
  
                </View>
            </ScrollView>
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
        borderBottomColor:Constants.btnColor,
        borderBottomWidth:1
    },
    body: {
        flex: 1,
        backgroundColor: '#fff',
    },
    bottomPart:{
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    desctiption:{
        fontSize:16,
        marginTop:15
    }
});