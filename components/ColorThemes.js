import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// activity color themes
const COLOR_THEMES = {
  RUN_THEME: '#9cf0b1',
  SWIM_THEME: '#B3F2FF',
  JUMP_THEME: '#FAB6F8',
};

// supposed to emulate tropical water colors and vibes
const TROPIC_THEME = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    secondary: '#CFFAF7',
    background: '#F7F8FF',
    profileHeader: '#BFB3FF',
    gradientLeft: '#197CCB',
    gradientRight: '#5CE7EA',
    gradientMiddle: '#16BAEF',
    header: '#E6EBF5',
    border: '#B1B5BD',
    button: '#3C4F76',
    textButtonColor: '#F2FFFF',
    textColor: '#252526',
    cardBackground: '#FFFFFF'
  },
};

const DARK_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#001E2E',
    card: '#08102E',
    gradientLeft: '#16E8EF',
    gradientMiddle: '#197CCB',
    gradientRight: '#36EA8E',
    textButtonColor: '#F2FFFF',
    textColor: '#2DC7ED'
  },
};

module.exports = {
  COLOR_THEMES,
  TROPIC_THEME,
  DARK_THEME
}