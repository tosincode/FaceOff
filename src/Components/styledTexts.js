import React, {useContext} from 'react';
import { Text } from 'react-native';
import { darkTheme, lightTheme } from '../utils/screenModes/theme';
import { ThemeContext, ThemeProvider } from '../utils/screenModes/ThemeContext';



export const BoldText = ({ style, children, numberOfLines }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Text
      style={[{ color: screenModeStyles.textColor, fontSize: 20, fontFamily: "Poppins-Bold" }, style]}
      numberOfLines={numberOfLines || null}>
      {children}
    </Text>
  );
};


export const RegularMenuText = ({ style, children, numberOfLines, onPress }) => {
  return (
    <ThemeProvider> 
      <RegularForMenuText style={style} children={children} numberOfLines={numberOfLines} onPress={onPress} />
    </ThemeProvider>
  );
};


export const RegularForMenuText = ({ style, children, numberOfLines, onPress }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Text
      style={[{ color: screenModeStyles.textColor, fontFamily: "Poppins-Regular" }, style]}
      onPress={onPress}
      numberOfLines={numberOfLines || null}>
      {children}
    </Text>
  );
};
 export const RegularText = ({ style, children, numberOfLines, onPress }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Text
      style={[{ color: screenModeStyles.textColor, fontFamily: "Poppins-Regular" }, style]}
      onPress={onPress}
      numberOfLines={numberOfLines || null}>
      {children}
    </Text>
  );
};

export const SemiBoldText = ({ style, children, numberOfLines, onPress }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Text
      style={[{ color: screenModeStyles.textColor, fontFamily: "Poppins-SemiBold" }, style]}
      onPress={onPress}
      numberOfLines={numberOfLines || null}>
      {children}
    </Text>
  );
};

export const ThinText = ({ style, children, numberOfLines, onPress }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const screenModeStyles = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Text
      style={[{ color: screenModeStyles.textColor, fontFamily: "Poppins-Thin" }, style]}
      onPress={onPress}
      numberOfLines={numberOfLines || null}>
      {children}
    </Text>
  );
};



// import React, {Component} from 'react';
// import {Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
// import _ from 'lodash';

// export class BoldText extends Component {
//   render() {
//     let {style} = this.props;
//     if (style === null || style === undefined) {
//       style = {};
//     }
//     return (
//       <Text
//         style={[{color: '#000', fontSize: 20,fontFamily:"Poppins-Bold"}, style]}
//         numberOfLines={
//           this.props.numberOfLines ? this.props.numberOfLines : null
//         }>
//         {this.props.children}
//       </Text>
//     );
//   }
// }

// export class RegularText extends Component {
//   render() {
//     let {style} = this.props;
//     if (style === null || style === undefined) {
//       style = {};
//     }
//     return (
//       <Text
//         style={[{color: '#000',fontFamily:"Poppins-Regular"}, style]}
//         onPress={this.props.onPress}
//         numberOfLines={
//           this.props.numberOfLines ? this.props.numberOfLines : null
//         }>
//         {this.props.children}
//       </Text>
//     );
//   }
// }
// export class SemiBoldText extends Component {
//   render() {
//     let {style} = this.props;
//     if (style === null || style === undefined) {
//       style = {};
//     }
//     return (
//         <Text
//             style={[{color: '#000',fontFamily:"Poppins-SemiBold"}, style]}
//             onPress={this.props.onPress}
//             numberOfLines={
//               this.props.numberOfLines ? this.props.numberOfLines : null
//             }>
//           {this.props.children}
//         </Text>
//     );
//   }
// }
// export class ThinText extends Component {
//   render() {
//     let {style} = this.props;
//     if (style === null || style === undefined) {
//       style = {};
//     }
//     return (
//         <Text
//             style={[{color: '#000',fontFamily:"Poppins-Thin"}, style]}
//             onPress={this.props.onPress}
//             numberOfLines={
//               this.props.numberOfLines ? this.props.numberOfLines : null
//             }>
//           {this.props.children}
//         </Text>
//     );
//   }
// }
