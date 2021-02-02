import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Editor from "@monaco-editor/react"
import BugReportIcon from '@material-ui/icons/BugReport'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import { withStyles } from '@material-ui/core/styles'

const styles = () => ({
  toolbar: {
    height: 48
  },
  view: {
    backgroundColor: '#fff'
  }
})

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      code: '// type your code...',
    }
  }
  render() {
    const { classes } = this.props
    return <div>
      <AppBar elevation={1}>
        <Toolbar variant="dense">
          <BugReportIcon />
          <Button style={{ marginLeft: 16 }} size="small">文件</Button>
          <Button size="small">编辑</Button>
          <Button size="small">视图</Button>
        </Toolbar>
      </AppBar>
      <Toolbar className={classes.toolbar} variant="dense" />
      <Box display="flex">
        <Box flexGrow={1} flexBasis="50%">
          <Editor
            height="calc(100vh - 70px)"
            theme="vs-dark"
            defaultLanguage="javascript"
            defaultValue="// some comment"
          />
        </Box>
        <Box className={classes.view} flexGrow={1} flexBasis="50%">
          
        </Box>
      </Box>
    </div>
  }
}

export default withStyles(styles)(App)