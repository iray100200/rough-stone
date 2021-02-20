import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Editor from "@monaco-editor/react"
import BugReportIcon from '@material-ui/icons/BugReport'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import { withStyles } from '@material-ui/core/styles'
import Menu from '../../components/Menu'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import MenuConfig from '../../components/edit/menu.config'
import axios from 'axios'
import events from 'events'
import clsx from 'clsx'
import CloseIcon from '@material-ui/icons/Close'
import language from '../../components/edit/language'
import _ from 'lodash'
import FileManagement from '../../components/edit/FileM'

const eventEmitter = new events.EventEmitter()
const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error'
}

const styles = (theme) => ({
  toolbar: {
    height: 34,
    minHeight: 34
  },
  view: {
    backgroundColor: '#fff'
  },
  btn: {
    height: 34,
    borderRadius: 0,
    fontSize: 12,
    minWidth: 50,
    padding: '6px 12px'
  },
  divider: {
    margin: '4px 0'
  },
  shortcut: {
    fontWeight: 300
  },
  side: {
    background: '#263238'
  },
  sideIcon: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.grey[100]
    }
  },
  sideContent: {
    width: 260
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 0
  },
  fileList: {
    height: 33,
    overflowX: 'hidden',
    backgroundColor: '#2f2f2f',
    '&::-webkit-scrollbar': {
      height: '3px'
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#555'
    },
    '&:hover': {
      overflowX: 'overlay'
    }
  },
  fileItem: {
    minWidth: 114,
    height: '100%',
    backgroundColor: '#2f2f2f',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: '33px',
    fontSize: 12,
    position: 'relative',
    color: theme.palette.grey[400],
    cursor: 'pointer',
    paddingRight: 26,
    paddingLeft: 10,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    userSelect: 'none',
    borderRight: '1px solid #212121',
    '&:hover': {
      '& svg': {
        visibility: 'visible'
      }
    }
  },
  savedFileItem: {
    fontStyle: 'initial',
  },
  activeFileItem: {
    backgroundColor: '#212121',
    color: theme.palette.grey[50],
    '& svg': {
      visibility: 'visible'
    }
  },
  closeFileBtn: {
    visibility: 'hidden',
    position: 'absolute',
    fontSize: 15,
    right: 8,
    top: 9,
    cursor: 'pointer'
  },
  editor: {
    flexGrow: 1,
    overflow: 'hidden'
  }
})

class App extends React.Component {
  constructor (props) {
    super(props)

    Object.assign(this, MenuConfig)

    this.state = {
      code: '',
      currentMenuKey: null,
      active: false,
      currentSideMenuKey: 0,
      currentFileKey: 0,
      displayFileList: [],
      fileTreeData: null
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', (evt) => {
      if(evt.ctrlKey && evt.key === 's') {
        evt.preventDefault()
        eventEmitter.emit('file-save')
      }
    })

    eventEmitter.on('run-run', this.run)
    eventEmitter.on('file-save', () => {
      this.handleSaveFile()
      this.handlePinCurrent()
    })
    eventEmitter.on('file-save-all', () => {
      const { displayFileList } = this.state
      displayFileList.forEach(o => o._fixed = true)
      this.setState({
        displayFileList
      })
    })

    this.handleReadResourceTree()
  }

  get currentFile () {
    const { displayFileList, currentFileKey } = this.state
    const target = displayFileList && displayFileList[currentFileKey]
    return target
  }
  get model () {
    if (!this.editor) return null
    return this.editor.getModel()
  }
  get isAttached () {
    return this.state.displayFileList.length > 0
  }
  handlePinCurrent = () => {
    if (!this.currentFile) return
    this.currentFile._fixed = true
    this.setState({
      displayFileList: [...this.state.displayFileList]
    })
  }
  handleSaveFile = () => {
    if (!this.currentFile) return
    if (!this.model) return
    const newContent = this.model.getValue() 
    axios.post('/api/vm/save/file', {
      fullPath: this.currentFile.fullPath,
      content: newContent
    }).then(res => {
      if (res.data === RESPONSE_STATUS.SUCCESS) {
        console.log('saved')
      }
    })
  }
  handleReadResourceTree = () => {
    axios.get('/api/vm/read/test').then(res => {
      this.processTree([res.data])
      this.setState({
        fileTreeData: res.data
      })
    })
  }
  handleReadCurrentFileContent = () => {
    if (!this.currentFile) return
    axios.post('/api/vm/read/file', { fullPath: this.currentFile.fullPath }, {
      responseType: 'text',
      transformResponse: data => data
    }).then(res => {
      this.setEditorValue(res.data, this.currentFile.extension)
    })
  }
  processTree (data) {
    data.forEach(o => {
      if (o.children) {
        o.children = _.orderBy(Object.values(o.children), 'name', 'desc')
        this.processTree(o.children)
      }
    })
  }
  handleEditorDidMount = (editor, monaco) => {
    this.editor = editor
    this.monaco = monaco

    if (editor) {
      editor.getModel().updateOptions({
        tabSize: 2,
        lineNumbers: true
      })
    }
    
    if (monaco) {
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      })
    }
  }
  undo = () => {
    if (!this.model) return
    this.model.undo()
  }
  redo = () => {
    if (!this.model) return
    this.editor.getModel().redo()
  }
  handleSelect = (index) => {
    return () => {
      this.setState({
        currentMenuKey: index,
        active: true
      })
    }
  }
  handleCloseAll = () => {
    this.setState({
      currentMenuKey: null,
      active: false
    })
  }
  handleSelectSideMenu = (index) => {
    return () => {
      this.setState({
        currentSideMenuKey: index
      })
    }
  }
  run = () => {
    /** example test */
    const projectName = 'test'

    axios.get('/api/vm/run/' + projectName).then(() => {
      // this.iframe.contentWindow.location.reload(true)
    })
  }
  handleCodeChange = (value) => {
    this.setState({
      code: value
    })
  }
  handleFileClick = (node) => {
    if (node === this.currentFile) return
    const fileList = this.state.displayFileList.filter(o => o._fixed)
    const index = fileList.findIndex(o => o === node)

    this.handleSaveFile()

    if(index > -1) {
      this.setState({
        currentFileKey: index
      }, this.handleReadCurrentFileContent)
      return
    }

    fileList.push(node)

    this.setState({
      displayFileList: [...fileList],
      currentFileKey: fileList.length - 1
    }, this.handleReadCurrentFileContent)
  }
  setEditorValue = (value, extension) => {
    if (this.model) {
      this.model.setValue(value)
      this.monaco.editor.setModelLanguage(this.editor.getModel(), language[extension])
    }
  }
  handleFileClose = (node, index) => {
    return (evt) => {
      this.handleSaveFile()
      evt.stopPropagation()
      node._fixed = false
      this.state.displayFileList.splice(index, 1)
      if(this.state.displayFileList.length === 0) {
        this.setEditorValue(null)
      }
      this.setState({
        displayFileList: [...this.state.displayFileList],
        currentFileKey: index - 1
      }, this.handleReadCurrentFileContent)
    }
  }
  renderCodeContent = () => {
    return <FileManagement dataSource={this.state.fileTreeData} onItemClick={this.handleFileClick} />
  }
  handleRunCommand = ({ command, click }) => {
    return () => {
      if (click) click()
      if (!command) return
      eventEmitter.emit(command)
      this.setState({
        currentMenuKey: null,
        active: false
      })
    }
  }
  render() {
    const { classes } = this.props
    return <div style={{ height: '100vh' }}>
      <AppBar elevation={0}>
        <Toolbar disableGutters className={classes.toolbar} variant="dense">
          <Box width={56} display="flex" alignItems="center" justifyContent="center">
            <BugReportIcon />
          </Box>
          {
            this.menus.map((item, index) => {
              return <Menu
                onClick={this.handleSelect(index)}
                onClose={this.handleCloseAll}
                key={index}
                selected={this.state.currentMenuKey === index}
                active={this.state.active}
                trigger={(
                  <Button
                    disableElevation
                    disableFocusRipple
                    disableRipple
                    variant={this.state.currentMenuKey === index ? 'contained' : 'text'}
                    className={classes.btn}
                    color="secondary"
                    size="small">{item.name}</Button>
                )}>
                <MenuList>
                  {
                    item.menuList.map((item, nindex) => {
                      if(item.type === 'divider') {
                        return <Divider key={String(index) + '-' + String(nindex)} className={classes.divider} light />
                      }
                      return <MenuItem onClick={this.handleRunCommand(item)} key={String(index) + '-' + String(nindex)}>
                        <Box width="100%" alignItems="center" display="flex">
                          <Box lineHeight={1} marginRight={6} flexGrow={1} overflow="hidden">{item.name}</Box>
                          <Box className={classes.shortcut}>{item.shortcut}</Box>
                        </Box>
                      </MenuItem>
                    })
                  }
                </MenuList>
              </Menu>
            })
          }
        </Toolbar>
      </AppBar>
      <Toolbar className={classes.toolbar} variant="dense" />
      <Box display="flex" height="calc(100vh - 34px)">
        <Box className={classes.side} width={56} flexShrink={0} overflow="hidden">
          <List>
            {
              this.sideMenus.map((item, index) => {
                return <ListItem onClick={this.handleSelectSideMenu(index)} key={index}>
                  <ListItemIcon>
                    <item.icon className={classes.sideIcon} color={this.state.currentSideMenuKey === index ? 'action' : 'secondary'} />
                  </ListItemIcon>
                </ListItem>
              })
            }
          </List>
        </Box>
        <Box className={classes.sideContent} flexShrink={0} flexBasis={260} borderRight="1px solid #263238" overflow="hidden">
          {this.renderCodeContent()}
        </Box>
        <Box display="flex" flexGrow={1} overflow="hidden">
          <Box flexGrow={1} flexBasis="50%" overflow="hidden" display="flex" flexDirection="column">
            <Box display={this.isAttached ? 'flex' : 'none'} alignItems="center" className={classes.fileList} flexShrink={0}>
              {
                this.state.displayFileList.map((item, index) => {
                  const isCurrent = index === this.state.currentFileKey
                  const isFixed = item._fixed
                  const className = [classes.fileItem]
                  if(isFixed) {
                    className.push(classes.savedFileItem)
                  }
                  if(isCurrent) {
                    className.push(classes.activeFileItem)
                  }
                  return <div
                    key={item.name + '-' + index}
                    onClick={() => this.handleFileClick(item)}
                    className={clsx([className])}>
                    {item.name}
                    <CloseIcon onClick={this.handleFileClose(item, index)} className={classes.closeFileBtn} />
                  </div>
                })
              }
            </Box>
            {/* <Divider /> */}
            <Editor
              className={classes.editor}
              theme="vs-dark"
              defaultLanguage="javascript"
              onMount={this.handleEditorDidMount}
              onChange={this.handleCodeChange}
            />
          </Box>
          <Box className={classes.view} flexGrow={1} flexBasis="50%" overflow="hidden">
            <iframe ref={ref => this.iframe = ref} className={classes.iframe} src="http://localhost:8080/"></iframe>
          </Box>
        </Box>
      </Box>
    </div>
  }
}

export default withStyles(styles)(App)