import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'

const theme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        minWidth: 52
      },
      textPrimary: {
        color: 'cfd8dc'
      },
      textSecondary: {
        color: '#eceff1'
      },
      containedSecondary: {
        '&:hover': {
          backgroundColor: '#37474f'
        }
      }
    },
    MuiPaper: {
      rounded: {
        borderRadius: 2
      },
      root: {
        backgroundColor: '#272727',
        fontSize: 12,
        minWidth: 240
      }
    },
    MuiMenuItem: {
      root: {
        fontSize: '12px',
        lineHeight: 1.2
      }
    },
    MuiTypography: {
      caption: {
        minHeight: 20
      }
    },
    MuiListItemIcon: {
      root: {
        minWidth: 20
      }
    }
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#263238',
    },
    secondary: {
      main: '#455a64',
    },
    action: {
      main: '#546e7a'
    },
    idle: {
      main: '#999999'
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#212121'
    },
    text: {
      primary: '#fafafa',
      secondary: '#bdbdbd'
    }
  },
})

export default theme
