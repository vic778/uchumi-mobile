import { Image, StyleProp, ImageStyle } from 'react-native';

// Uchumi logo from the backend's public folder — bundled as a local asset
const logo = require('../../../assets/images/logo.png');

export function UchumiLogo({ style }: { style?: StyleProp<ImageStyle> }) {
  return <Image source={logo} style={[{ width: 120, height: 40, resizeMode: 'contain' }, style]} />;
}
