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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'
import NoteAddIcon from '@material-ui/icons/NoteAdd'
import MenuConfig from './menu.config'

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
    fontSize: 13,
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
    display: 'flex'
  },
  sideContentTree: {
    padding: 8,
    fontSize: 12
  },
  sideContentHeadIcon: {
    color: '#b0bec5',
    '&:hover': {
      color: '#eceff1'
    }
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
      fileTreeData: {
        id: 'root',
        name: 'ROUGH_STONE',
        children: [
          {
            id: '1',
            name: 'node_modules',
          },
          {
            id: '3',
            name: 'src',
            children: [
              {
                id: '4',
                name: 'main.js',
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
      }
    })
  }
  handleEditorDidMount = (editor) => {
    this.editor = editor
  }
  undo() {
    this.editor.getModel().undo()
  }
  redo() {
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
  renderTree = (nodes) => {
    const { classes } = this.props
    return <TreeItem className={classes.treeItem} key={nodes.id} nodeId={nodes.id} label={(
      <Typography variant="caption">{nodes.name}</Typography>
    )}>
      {Array.isArray(nodes.children) ? nodes.children.map((node) => this.renderTree(node)) : null}
    </TreeItem>
  }
  renderCodeContent = () => {
    const { classes } = this.props
    return <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" className={classes.sideContentHead} padding="8px 12px">
        <Box flexGrow={1} overflow="hidden">
          <Typography style={{ minHeight: 20 }} variant="caption">文件资源管理</Typography>
        </Box>
        <Box display="flex" alignItems="center" style={{ fontSize: '16x' }}>
          <NoteAddIcon className={classes.sideContentHeadIcon} fontSize="inherit" />
          <CreateNewFolderIcon className={classes.sideContentHeadIcon} fontSize="inherit" style={{ marginLeft: '8px' }} />
        </Box>
      </Box>
      <Divider light />
      <Box className={classes.sideContentTree}>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpanded={['root']}
          defaultExpandIcon={<ChevronRightIcon />}>
          {this.renderTree(this.state.fileTreeData)}
        </TreeView>
      </Box>
    </Box>
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
                    variant={this.state.currentMenuKey === index ? 'contained' : ''}
                    className={classes.btn}
                    color="secondary"
                    size="small">{item.name}</Button>
                )}>
                <MenuList>
                  {
                    item.menuList.map((item, nindex) => {
                      if(item.type === 'divider') {
                        return <Divider className={classes.divider} light />
                      }
                      return <MenuItem key={String(index) + '-' + String(nindex)}>
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
            <Editor
              height="calc(100vh - 70px)"
              theme="vs-dark"
              defaultLanguage="javascript"
              defaultValue={this.state.code}
              onMount={this.handleEditorDidMount}
            />
          </Box>
          <Box className={classes.view} flexGrow={1} flexBasis="50%">

          </Box>
        </Box>
      </Box>
    </div>
  }
}

export default withStyles(styles)(App)