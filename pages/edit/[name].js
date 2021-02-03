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
import TreeView from '@material-ui/lab/TreeView'
import TreeItem from '@material-ui/lab/TreeItem'
import Typography from '@material-ui/core/Typography'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'
import NoteAddIcon from '@material-ui/icons/NoteAdd'
import MenuConfig from './menu.config'
import axios from 'axios'
import events from 'events'
import clsx from 'clsx'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import CloseIcon from '@material-ui/icons/Close'
import FolderIcon from '@material-ui/icons/Folder'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'

const eventEmitter = new events.EventEmitter()

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
  sideContentHead: {
    display: 'flex',
    height: 32
  },
  sideContentTree: {
    padding: '8px 12px',
    fontSize: 12
  },
  sideContentHeadIcon: {
    color: '#b0bec5',
    '&:hover': {
      color: '#eceff1'
    }
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 0
  },
  fileItem: {
    width: 110,
    height: 32,
    backgroundColor: '#303030',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: '33px',
    fontSize: 12,
    position: 'relative',
    color: theme.palette.grey[400],
    cursor: 'pointer',
    paddingRight: 16,
    userSelect: 'none',
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
    backgroundColor: '#191919',
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
      fileTreeData: {
        id: 'root',
        name: 'ROUGH_STONE',
        type: 'folder',
        children: [
          {
            id: '1',
            name: 'node_modules',
            type: 'folder'
          },
          {
            id: '3',
            name: 'src',
            type: 'folder',
            children: [
              {
                id: '4',
                type: 'file',
                name: 'main.js',
                content: '// this is a test'
              },
              {
                id: '5',
                type: 'file',
                name: 'test.js',
                content: 'var p = 123'
              },
            ],
          },
        ],
      }
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
      const { displayFileList, currentFileKey } = this.state
      displayFileList[currentFileKey]._saved = true
      this.setState({
        displayFileList
      })
    })
    eventEmitter.on('file-save-all', () => {
      const { displayFileList } = this.state
      displayFileList.forEach(o => o._saved = true)
      this.setState({
        displayFileList
      })
    })
  }
  handleEditorDidMount = (editor, monaco) => {
    this.editor = editor
    this.editor.getModel().updateOptions({
      tabSize: 2,
      lineNumbers: true
    })

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })
  }
  undo = () => {
    this.editor.getModel().undo()
  }
  redo = () => {
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

    axios.post('/api/vm/create', {
      type: 'vue2',
      name: projectName,
      template: this.state.code
    }).then(() => {
      this.iframe.contentWindow.location.reload(true)
    })
  }
  handleCodeChange = (value) => {
    this.setState({
      code: value
    })
  }
  handleFileClick = (node) => {
    return () => {
      if (node === this.state.displayFileList[this.state.currentFileKey]) return
      const fileList = [...this.state.displayFileList].filter(o => o._saved)
      const index = fileList.findIndex(o => o === node)
      if(index > -1) {
        this.setState({
          currentFileKey: index
        })
        this.setEditorValue(fileList[index].content)
        return
      }
      fileList.push(node)
      this.setEditorValue(node.content)
      this.setState({
        displayFileList: fileList,
        currentFileKey: fileList.length - 1
      })
    }
  }
  setEditorValue = (value) => {
    this.editor.getModel().setValue(value)
  }
  handleFileClose = (node, index) => {
    return (evt) => {
      evt.stopPropagation()
      node._saved = false
      this.state.displayFileList.splice(index, 1)
      if(this.state.displayFileList.length > 0) {
        this.setEditorValue(this.state.displayFileList[index - 1].content)
      } else {
        this.setEditorValue(null)
      }
      this.setState({
        displayFileList: this.state.displayFileList,
        currentFileKey: index - 1
      })
    }
  }
  renderTree = (nodes) => {
    const { classes } = this.props
    const iconSize = 15
    const style = { display: 'flex', alignItems: 'center', height: 24 }
    if(nodes.type === 'file') {
      const icon = <InsertDriveFileIcon style={{ fontSize: iconSize }} />
      return <TreeItem
        icon={icon}
        onClick={this.handleFileClick(nodes)}
        className={classes.treeItem}
        key={nodes.id}
        nodeId={nodes.id}
        label={(
          <Typography style={style} variant="caption">{nodes.name}</Typography>
        )} />
    }
    const active = nodes.children && nodes.children.length > 0
    if(!active) {
      style.color = '#808080'
    }
    if(!active) {
      const icon = <FolderOpenIcon style={{ fontSize: iconSize, color: '#808080' }} />
      return <TreeItem
        icon={icon}
        className={classes.treeItem}
        key={nodes.id}
        nodeId={nodes.id}
        label={(
          <Typography style={style} variant="caption">{nodes.name}</Typography>
        )} />
    }
    return <TreeItem
      endIcon={<FolderOpenIcon style={{ fontSize: iconSize }} />}
      collapseIcon={<FolderOpenIcon style={{ fontSize: iconSize }} />}
      expandIcon={<FolderIcon style={{ fontSize: iconSize }} />}
      className={classes.treeItem}
      key={nodes.id}
      nodeId={nodes.id}
      label={(
        <Typography style={style} variant="caption">{nodes.name}</Typography>
      )}>
      {Array.isArray(nodes.children) ? nodes.children.map((node) => this.renderTree(node)) : null}
    </TreeItem>
  }
  renderCodeContent = () => {
    const { classes } = this.props
    return <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" className={classes.sideContentHead} padding="6px 12px">
        <Box flexGrow={1} overflow="hidden">
          <Typography style={{ minHeight: 18 }} variant="caption">文件资源管理</Typography>
        </Box>
        <Box display="flex" alignItems="center" style={{ fontSize: '16x' }}>
          <NoteAddIcon className={classes.sideContentHeadIcon} fontSize="inherit" />
          <CreateNewFolderIcon className={classes.sideContentHeadIcon} fontSize="inherit" style={{ marginLeft: '8px' }} />
        </Box>
      </Box>
      <Divider light />
      <Box className={classes.sideContentTree}>
        <TreeView
          multiSelect={false}
          defaultExpanded={['root']}>
          {this.renderTree(this.state.fileTreeData)}
        </TreeView>
      </Box>
    </Box>
  }
  handleRunCommand = (command) => {
    return () => {
      eventEmitter.emit(command)
      this.setState({
        currentMenuKey: null,
        active: false
      })
    }
  }
  render() {
    const { classes } = this.props
    return <div>
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
                        return <Divider key={index} className={classes.divider} light />
                      }
                      return <MenuItem onClick={this.handleRunCommand(item.command)} key={String(index) + '-' + String(nindex)}>
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
      <Box display="flex">
        <Box className={classes.side} width={56} flexShrink={0}>
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
          <Box flexGrow={1} flexBasis="50%">
            <Box display="flex" alignItems="center" height={32}>
              {
                this.state.displayFileList.map((item, index) => {
                  const isCurrent = index === this.state.currentFileKey
                  const isSaved = item._saved
                  const className = [classes.fileItem]
                  if(isSaved) {
                    className.push(classes.savedFileItem)
                  }
                  if(isCurrent) {
                    className.push(classes.activeFileItem)
                  }
                  return <div
                    key={item.name + '-' + index}
                    onClick={this.handleFileClick(item)}
                    className={clsx([className])}>
                    {item.name}
                    <CloseIcon onClick={this.handleFileClose(item, index)} className={classes.closeFileBtn} />
                  </div>
                })
              }
            </Box>
            <Divider />
            <div style={{ display: this.state.displayFileList.length > 0 ? 'block' : 'none' }}>
              <Editor
                height="calc(100vh - 102px)"
                theme="vs-dark"
                defaultLanguage="javascript"
                onMount={this.handleEditorDidMount}
                onChange={this.handleCodeChange}
              />
            </div>
            {
              this.state.displayFileList.length === 0 && <Box height="calc(100vh - 102px)" display="flex" alignItems="center" justifyContent="center">
                <Button color="secondary" variant="outlined">快速开始</Button>
              </Box>
            }
          </Box>
          <Box className={classes.view} flexGrow={1} flexBasis="50%">
            <iframe ref={ref => this.iframe = ref} className={classes.iframe} src="/file/vm/vue2/template/test"></iframe>
          </Box>
        </Box>
      </Box>
    </div>
  }
}

export default withStyles(styles)(App)