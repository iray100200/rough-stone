import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import BugReportIcon from '@material-ui/icons/BugReport'
import Box from '@material-ui/core/Box'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import axios from 'axios'
import events from 'events'
import clsx from 'clsx'
import CloseIcon from '@material-ui/icons/Close'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import MenuConfig from '../../components/MonacoEditor/menu.config'
import FileManagement from '../../components/MonacoEditor/FileManagement'
import Editor from '../../components/MonacoEditor/Editor'
import Menus from '../../components/MonacoEditor/Menus'

const EVENT_EMITTER = new events.EventEmitter()
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
  divider: {
    margin: '4px 0'
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
  clearIcon: {
    position: 'absolute',
    right: 8,
    top: 11,
    cursor: 'pointer',
    height: 12
  },
  editingFileBtn: {
    fontSize: 12,
    verticalAlign: 'top'
  },
  closeFileBtn: {
    visibility: 'hidden',
    fontSize: 12,
    verticalAlign: 'top'
  },
  editor: {
    flexGrow: 1
  }
})

class App extends React.Component {
  constructor (props) {
    super(props)

    Object.assign(this, MenuConfig)

    this.state = {
      code: '',
      currentSideMenuKey: 0,
      currentFileKey: 0,
      displayFileList: [],
      dirTreeData: null,
      fileExtension: 'javascript',
      editingFiles: [],
      clearIconHoverPath: ''
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', (evt) => {
      if(evt.ctrlKey && evt.key === 's') {
        evt.preventDefault()
        EVENT_EMITTER.emit('file-save')
      }
    })

    EVENT_EMITTER.on('run-run', this.run)
    EVENT_EMITTER.on('file-save', () => {
      this.handleSaveFile()
      this.handlePinCurrent()
      this.clearCurrentEditingState()
    })
    EVENT_EMITTER.on('file-save-all', () => {
      const { displayFileList } = this.state
      displayFileList.forEach(o => o._fixed = true)
      this.setState({
        displayFileList
      })
    })

    this.handleReadResourceTree()
  }
  get currentFile() {
    const { displayFileList, currentFileKey } = this.state
    const target = displayFileList && displayFileList[currentFileKey]
    return target
  }
  get model() {
    if(!this.editor) return null
    return this.editor.getModel()
  }
  get isAttached() {
    return this.state.displayFileList.length > 0
  }
  clearCurrentEditingState = () => {
    const { currentFileKey, displayFileList } = this.state
    displayFileList[currentFileKey]._unsaved = false
    this.setState({
      displayFileList: [...displayFileList]
    })
  }
  clearAllEditingState = () => {
    const { displayFileList } = this.state
    this.setState({
      displayFileList: [displayFileList.map(o => {
        o._unsaved = false
        return o
      })]
    })
  }
  handlePinCurrent = () => {
    if(!this.currentFile) return
    this.currentFile._fixed = true
    this.setState({
      displayFileList: [...this.state.displayFileList]
    })
  }
  handleSaveFile = () => {
    if(!this.currentFile) return
    if(!this.model) return
    axios.post('/api/vm/save/file', {
      fullPath: this.currentFile.fullPath,
      content: this.model.getValue()
    }).then(res => {
      if(res.data === RESPONSE_STATUS.SUCCESS) {
        console.log('saved')
      }
    })
  }
  handleReadResourceTree = () => {
    axios.get('/api/vm/read/test').then(res => {
      this.processTree([res.data])
      this.setState({
        dirTreeData: res.data
      })
    })
  }
  handleReadCurrentFileContent = (currentFile) => {
    if(!currentFile) return
    return axios.post('/api/vm/read/file', { fullPath: currentFile.fullPath }, {
      responseType: 'text',
      transformResponse: data => data
    }).then(res => {
      return {
        code: res.data,
        fileExtension: currentFile.extension
      }
    })
  }
  processTree(data, parent = null) {
    data.forEach(o => {
      Object.defineProperty(o, 'parent', {
        get: ((data) => {
          return () => data
        })(parent)
      })
      if(o.children) {
        o.children = Object.values(o.children)
        this.processTree(o.children, o)
      }
    })
  }
  handleEditorDidMount = (editor, monaco) => {
    this.editor = editor
    this.monaco = monaco
  }
  undo = () => {
    if(!this.model) return
    this.model.undo()
  }
  redo = () => {
    if(!this.model) return
    this.editor.getModel().redo()
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
  handleFileClick = async (node) => {
    if(node === this.currentFile) return
    const fileList = this.state.displayFileList.filter(o => o._fixed)
    const index = fileList.findIndex(o => o === node)

    this.handleSaveFile()

    if(index > -1) {
      const { code, fileExtension } = await this.handleReadCurrentFileContent(this.state.displayFileList[index])
      this.setState({
        currentFileKey: index,
        code,
        fileExtension
      })
      return
    }

    fileList.push(node)

    const nextIndex = fileList.length - 1
    const { code, fileExtension } = await this.handleReadCurrentFileContent(fileList[nextIndex])

    this.setState({
      displayFileList: [...fileList],
      currentFileKey: nextIndex,
      code,
      fileExtension
    })
  }
  handleFileClose = (node, index) => {
    return async (evt) => {
      evt.stopPropagation()
      this.handleSaveFile()
      node._fixed = false
      this.state.displayFileList.splice(index, 1)
      if(this.state.displayFileList.length === 0) {
        this.setState({
          code: null,
          displayFileList: [],
          currentFileKey: 0,
          fileExtension: ''
        })
        return
      }
      const nextIndex = 0
      const { code, fileExtension } = await this.handleReadCurrentFileContent(this.state.displayFileList[nextIndex])
      this.setState({
        displayFileList: [...this.state.displayFileList],
        currentFileKey: nextIndex,
        code,
        fileExtension
      })
    }
  }
  renderCodeContent = () => {
    return <FileManagement onCreateFile={this.handleCreateFile} dataSource={this.state.dirTreeData} onItemClick={this.handleFileClick} />
  }
  handleCreateFile = (fileName, parentNode) => {
    axios.post('/api/vm/new/file', {
      fileName,
      parentPath: parentNode.fullPath
    }).then(this.handleReadResourceTree)
  }
  handleRunCommand = ({ command, click }) => {
    if(click) click()
    if(!command) return
    EVENT_EMITTER.emit(command)
  }
  handleFileChange = () => {
    const { displayFileList, currentFileKey } = this.state
    displayFileList[currentFileKey]._unsaved = true
    this.setState({
      displayFileList: [...displayFileList]
    })
  }
  handleMouseEnterClearIcon = (path) => {
    return () => {
      this.setState({
        clearIconHoverPath: path
      })
    }
  }
  handleMouseLeaveClearIcon = () => {
    this.setState({
      clearIconHoverPath: null
    })
  }
  render() {
    const { classes } = this.props
    return <div style={{ height: '100vh' }}>
      <AppBar elevation={0}>
        <Toolbar disableGutters className={classes.toolbar} variant="dense">
          <Box width={56} display="flex" alignItems="center" justifyContent="center">
            <BugReportIcon />
          </Box>
          <Menus onRunCommand={this.handleRunCommand} />
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
            {
              this.isAttached &&
              <Box key="fileList" display="flex" alignItems="center" className={classes.fileList} flexShrink={0}>
                {
                  this.state.displayFileList.map((item, index) => {
                    const isCurrent = index === this.state.currentFileKey
                    const isFixed = item._fixed
                    const className = [classes.fileItem]
                    const isUnsaved = item._unsaved
                    const isClearIconHovered = this.state.clearIconHoverPath === item.fullPath
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
                      <i
                        className={classes.clearIcon}
                        onMouseEnter={this.handleMouseEnterClearIcon(item.fullPath)}
                        onMouseLeave={this.handleMouseLeaveClearIcon}>
                        {
                          isUnsaved && !isClearIconHovered ? <FiberManualRecordIcon className={classes.editingFileBtn}></FiberManualRecordIcon> :
                            <CloseIcon onClick={this.handleFileClose(item, index)} className={classes.closeFileBtn} />
                        }
                      </i>
                    </div>
                  })
                }
              </Box>
            }
            {
              this.isAttached &&
              <Editor
                key="editor"
                value={this.state.code}
                fileExtension={this.state.fileExtension}
                className={classes.editor}
                onMount={this.handleEditorDidMount}
                onChange={this.handleFileChange}
              />
            }
          </Box>
          <Box className={classes.view} flexGrow={1} flexBasis="50%" overflow="hidden">
            <iframe ref={ref => this.iframe = ref} className={classes.iframe} src="http://127.0.0.1:8080/"></iframe>
          </Box>
        </Box>
      </Box>
    </div>
  }
}

export default withStyles(styles)(App)