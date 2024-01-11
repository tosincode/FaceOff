import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing Material Icons

const MyCustomPauseIcon = ({ size = 30, color = 'black' }) => {
  return <Icon name="pause" size={size} color={color} />;
};


export default MyCustomPauseIcon;
