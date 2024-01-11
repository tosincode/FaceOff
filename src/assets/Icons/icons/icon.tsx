import React from 'react';
import {SvgXml} from 'react-native-svg';
import IconsSVG, {PLAY_ICON} from './svgIcons';


interface TitleTextProps {
    size?: number;
    name: string;
    color?: string;
    fill?: string
    rotation?: number;
}

const Icon: React.FC<TitleTextProps> = ({
    size = PLAY_ICON,
    color = undefined,
    fill = undefined,
    name,
    rotation = 0,
}) => {
    let xml = IconsSVG[name];

    if (!xml) {
        xml = IconsSVG[""];
    }

    return <SvgXml xml={xml} fill={fill} color={color} width={size} rotation={rotation} />;
};

export default Icon;
