import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// activity color themes
const COLOR_THEMES = {
  RUN_THEME: '#9cf0b1',
  SWIM_THEME: '#9cbcf0',
  JUMP_THEME: '#f39ef3',
};

// supposed to emulate tropical water colors and vibes
const TROPIC_THEME = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#197CCB',
    background: '#EDF6FF',
    gradientLeft: '#16E8EF',
    gradientMiddle: '#197CCB',
    gradientRight: '#36EA8E',
    textButtonColor: '#F2FFFF',
    textColor: 'black'
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