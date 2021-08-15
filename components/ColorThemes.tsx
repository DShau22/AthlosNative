import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// nice gradients and colors
// #757f9a to #d7dde8 like a gray mystic
// #2bc0e4 to #eaecc6 bora bora
// #404E7C offsets the dark theme background color nicely

// activity color themes
const COLOR_THEMES = {
  RUN_THEME: '#9cf0b1',
  SWIM_THEME: '#B3F2FF',
  JUMP_THEME: '#FAB6F8',
  HIIT_THEME: '#e8664f',
  SWIMMING_EVENT_THEME: '#7e8ee6',
  TIMER_THEME: '#f50a3d',
  INTERVAL_THEME: '#ff03b7',
  SWIM_WORKOUT_THEME: '#241571',
  RUN_DONUT_GRADIENTS: [
    {
      key: 'Running',
      startColor: '#1D976C',
      endColor: '#93F9B9',
    },
    {
      key: 'Walking',
      startColor: '#F09819',
      endColor: '#EDDE5D',
    },
    {
      key: 'Resting',
      startColor: '#ff5f6d',
      endColor: '#ffc371',
    },
  ],
  SWIM_DONUT_GRADIENTS: [
    {
      key: 'fly',
      startColor: 'rgb(226, 52, 137)',
      endColor: 'rgb(168, 49, 213)',
    },
    {
      key: 'back',
      startColor: 'rgb(63,94,251,1)',
      endColor: 'rgb(252,70,107,1)',
    },
    {
      key: 'breast',
      startColor: 'rgb(2, 170, 176)',
      endColor: 'rgb(0, 205, 172)',
    },
    {
      key: 'free',
      startColor: 'rgb(66, 194, 244)',
      endColor: 'rgb(134, 65, 244)',
    },
  ], // gradients for each of the four strokes
};

// supposed to emulate tropical water colors and vibes
const LIGHT_THEME = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    secondary: '#CFFAF7',
    background: '#F7F8FF',
    backgroundOffset: 'gray',
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
    background: '#0C1947',
    backgroundOffset: '#404E7C',
    button: '#404E7C',
    card: '#08102E',
    header: '#08102E',
    gradientLeft: '#16E8EF',
    gradientMiddle: '#197CCB',
    gradientRight: '#36EA8E',
    textButtonColor: '#F2FFFF',
    textColor: '#FFFFFF',
    textHighlight: '#34ebeb',
    border: '#404E7C'
    // ...DarkTheme.colors,
    // background: '#001E2E',
  },
};

export {
  COLOR_THEMES,
  LIGHT_THEME,
  DARK_THEME
}