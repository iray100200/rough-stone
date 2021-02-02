import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'

const theme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        minWidth: 52
      }
    }
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#263238',
    },
    secondary: {
      main: '#37474f',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#212121',
    },
    text: {
      primary: '#fafafa',
      secondary: '#bdbdbd'
    }
  },
})

export default theme
