import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import NoteAddIcon from '@material-ui/icons/NoteAdd'
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder'
import Divider from '@material-ui/core/Divider'
import TreeView from '@material-ui/lab/TreeView'
import TreeItem from '@material-ui/lab/TreeItem'
import { withStyles } from '@material-ui/core/styles'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'
import FolderIcon from '@material-ui/icons/Folder'
import RightClickMenu from '../RightClickMenu'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import _ from 'lodash'

const MtTreeItem = TreeItem
const styles = () => ({
  sideContentHead: {
    display: 'flex',
    height: 32
  },
  sideContentTree: {
    padding: '4px 0 4px 12px',
    fontSize: 12
  },
  sideContentHeadIcon: {
    color: '#b0bec5',
    '&:hover': {
      color: '#eceff1'
    }
  },
  inputContainer: {
    position: 'relative'
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    border: '1px solid #0060da',
    color: '#fff',
    height: '24px',
    outline: 'none',
    fontSize: '12px',
    width: '100%'
  },
  inputWithError: {
    backgroundColor: 'rgba(64, 18, 18, 0.3)',
    border: '1px solid #f11',
    color: '#fff',
    height: '24px',
    outline: 'none',
    fontSize: '12px',
    width: '100%'
  },
  error: {
    display: 'block',
    position: 'absolute',
    color: '#fff',
    height: 25,
    width: '100%',
    top: 24,
    left: 0,
    border: '1px solid #f11',
    backgroundColor: '#9c5059',
    fontSize: 12,
    lineHeight: '24px',
    padding: '0 4px'
  },
  treeItem: {
    
  }
})

const DIRTYPES = {
  NEW_FILE: 'new-file',
  FILE: 'file',
  FOLDER: 'folder',
  NEW_FOLDER: 'new-folder'
}

const FILE_ERRORS = {
  EMPTY: ''
}

function wrapTreeItem () {
  return class TreeItem extends React.Component {
    render () {
      return <RightClickMenu trigger={<MtTreeItem {...this.props}></MtTreeItem>}>
        <MenuList>
          <MenuItem>123</MenuItem>
          <MenuItem>456</MenuItem>
        </MenuList>
      </RightClickMenu>
    }
  }
}

class File {
  constructor (context) {
    this.name = ''
    this.nodeId = this.id = '__new-file'
    this.type = DIRTYPES.NEW_FILE
    this.context = context
  }
  setError (errorMessage) {
    if (errorMessage === false) {
      this.hasError = false
    } else {
      this.hasError = true
      this.errorMessage = errorMessage
    }
  }
}

class FileManagement extends React.PureComponent {
  static getDerivedStateFromProps (props, state) {
    return {
      treeDataSource: props.dataSource ? { ...props.dataSource } : null,
      workingNode: state.workingNode
    }
  }
  constructor (props) {
    super(props)
  }
  state = {
    workingNode: null,
    treeDataSource: null
  }
  get workingNodeContext () {
    if (this.workingNode.type === DIRTYPES.FILE) {
      return this.workingNode.parent
    }
    return this.workingNode
  }
  redrawTreeNodes = () => {
    this.setState({
      treeDataSource: { ...this.state.treeDataSource }
    })
  }
  handleFileInputBlur = (evt) => {
    if (!this.file) return
    document.removeEventListener('click', this.handleFileInputBlur)
    evt.target.removeEventListener('keyup', this.handleKeyup)
    if (this.file.name === FILE_ERRORS.EMPTY) {
      this.workingNodeContext.children.shift()
      this.redrawTreeNodes()
    } else {
      if (this.file && this.file.hasError === false) {
        this.props.onCreateFile && this.props.onCreateFile(this.file.name, this.workingNodeContext)
        this.workingNodeContext.children.shift()
      }
    }
    this.file = null
    this.workingInputRef = null
  }
  handleFileClick = (nodes) => {
    return () => {
      this.workingNode = nodes
      this.props.onItemClick && this.props.onItemClick(nodes)
    }
  }
  handleFolderClick = (nodes) => {
    return () => {
      this.workingNode = nodes
    }
  }
  handleAddFile = (evt) => {
    if (this.file && 
      this.file.type === DIRTYPES.NEW_FILE &&
      this.file.context === this.workingNodeContext) {
        evt.stopPropagation()
        setTimeout(() => {
          this.workingInputRef && this.workingInputRef.focus()
        })
        return
      }
    const file = this.file = new File(this.workingNodeContext)
    this.workingNodeContext.children.unshift(file)
    this.redrawTreeNodes()
  }
  handleAddFolder = () => {
    this.onCreateFolder && this.onCreateFolder(this.workingNode)
  }
  handleAppendInput = (ref) => {
    if (ref) {
      this.workingInputRef = ref
      setTimeout(() => {
        ref.focus()
        document.addEventListener('click', this.handleFileInputBlur)
        ref.addEventListener('keyup', this.handleKeyup)
        ref.addEventListener('click', evt => {
          evt.stopPropagation()
        })
      })
    }
  }
  handleKeyup = (evt) => {
    if (evt.key === 'Enter') {
      this.handleFileInputBlur(evt)
    }
  }
  handleTemporaryInputChange = (evt) => {
    if (!this.file) return
    const val = evt.target.value
    this.file.name = val
    
    if (!val) {
      this.file.setError('请输入文件名')
    } else {
      if (this.workingNodeContext.children.slice(1).some(o => {
        return o.name === val
      })) {
        this.file.setError('文件名称发生重复')
      } else {
        this.file.setError(false)
      }
    }
    this.redrawTreeNodes()
  }
  renderTree = (nodes) => {
    if(!nodes) return null
    const TreeItem = wrapTreeItem(MtTreeItem)
    const { classes } = this.props
    const iconSize = 14
    const style = { outline: 'none', backgroundColor: 'transparent', border: 0, color: '#fff' }
    if(nodes.type === DIRTYPES.NEW_FILE && this.file) {
      const icon = <InsertDriveFileIcon style={{ fontSize: iconSize }} />
      return <TreeItem
        icon={icon}
        nodeId={nodes.id}
        key={nodes.id}
        className={classes.treeItem}
        label={(
          <div className={classes.inputContainer}>
            <input  
              ref={this.handleAppendInput}
              value={nodes.name}
              onInput={this.handleTemporaryInputChange}
              className={nodes.hasError ? classes.inputWithError : classes.input}></input>
            {
              nodes.hasError && <div className={classes.error}>{nodes.errorMessage}</div>
            }
          </div>
        )} />
    }
    if(nodes.type === DIRTYPES.FILE) {
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
      onClick={this.handleFolderClick(nodes)}
      key={nodes.id}
      nodeId={nodes.id}
      label={(
        <Typography style={style} variant="caption">{nodes.name}</Typography>
      )}>
      {Array.isArray(nodes.children) ?
        _.orderBy(nodes.children,
          [item => item.type, item => item.fullPath && item.fullPath.toLowerCase()],
          ['desc', 'asc'])
          .map((node) => this.renderTree(node)) : null}
    </TreeItem>
  }
  render () {
    const { classes } = this.props
    return <Box display="flex" flexDirection="column">
      <Box display="flex" alignItems="center" className={classes.sideContentHead} padding="6px 12px">
        <Box flexGrow={1} overflow="hidden">
          <Typography style={{ minHeight: 18 }} variant="caption">文件资源管理</Typography>
        </Box>
        <Box display="flex" alignItems="center" style={{ fontSize: '16x' }}>
          <NoteAddIcon onClick={this.handleAddFile} className={classes.sideContentHeadIcon} fontSize="inherit" />
          <CreateNewFolderIcon onClick={this.handleAddFolder} className={classes.sideContentHeadIcon} fontSize="inherit" style={{ marginLeft: '8px' }} />
        </Box>
      </Box>
      <Divider light />
      <Box className={classes.sideContentTree}>
        <TreeView
          multiSelect={false}
          defaultExpanded={['root']}>
          {this.state.treeDataSource && this.renderTree(this.state.treeDataSource)}
        </TreeView>
      </Box>
    </Box>
  }
}

FileManagement.propTypes = {
  dataSource: PropTypes.object
}

export default withStyles(styles)(FileManagement)