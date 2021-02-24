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
    padding: '8px 12px',
    fontSize: 12
  },
  sideContentHeadIcon: {
    color: '#b0bec5',
    '&:hover': {
      color: '#eceff1'
    }
  },
})

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

class _FileM extends React.PureComponent {
  constructor(props) {
    super(props)
  }
  state = {}
  handleFileClick = (nodes) => {
    return () => {
      this.props.onItemClick && this.props.onItemClick(nodes)
    }
  }
  renderTree = (nodes) => {
    if (!nodes) return
    const TreeItem = wrapTreeItem(MtTreeItem)
    const { classes } = this.props
    const iconSize = 15
    const style = { display: 'flex', alignItems: 'center', height: 24 }
    if(nodes.type === 'file') {
      const icon = <InsertDriveFileIcon style={{ fontSize: iconSize }} />
      return <TreeItem
        icon={icon}
        node={nodes}
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
        node={nodes}
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
      node={nodes}
      nodeId={nodes.id}
      label={(
        <Typography style={style} variant="caption">{nodes.name}</Typography>
      )}>
      {Array.isArray(nodes.children) ? _.orderBy(nodes.children, [item => item.type, item => item.fullPath.toLowerCase()], ['desc', 'asc']).map((node) => this.renderTree(node)) : null}
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
          <NoteAddIcon className={classes.sideContentHeadIcon} fontSize="inherit" />
          <CreateNewFolderIcon className={classes.sideContentHeadIcon} fontSize="inherit" style={{ marginLeft: '8px' }} />
        </Box>
      </Box>
      <Divider light />
      <Box className={classes.sideContentTree}>
        <TreeView
          multiSelect={false}
          defaultExpanded={['root']}>
          {this.props.dataSource && this.renderTree(this.props.dataSource)}
        </TreeView>
      </Box>
    </Box>
  }
}

_FileM.propTypes = {
  dataSource: PropTypes.object
}

export default withStyles(styles)(_FileM)