import React from 'react'
import MenuConfig from './menu.config'
import Menu from '../../components/Menu'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => {
  return {
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
    }
  }
})

export default function Menus (props) {
  const classes = useStyles()
  const [active, setActive] = React.useState(false)
  const [currentMenuKey, setCurrentMenuKey] = React.useState(null)

  const handleSelect = (index) => {
    return () => {
      setCurrentMenuKey(index)
      setActive(true)
    }
  }

  const handleCloseAll = () => {
    setCurrentMenuKey(null)
    setActive(false)
  }

  const handleRunCommand = (item) => {
    return () => {
      setCurrentMenuKey(null)
      setActive(false)
      props.onRunCommand(item)
    }
  }

  return <div>
    {
      MenuConfig.menus.map((item, index) => {
        return <Menu
          onClick={handleSelect(index)}
          onClose={handleCloseAll}
          key={index}
          selected={currentMenuKey === index}
          active={active}
          trigger={(
            <Button
              disableElevation
              disableFocusRipple
              disableRipple
              variant={currentMenuKey === index ? 'contained' : 'text'}
              className={classes.btn}
              color="secondary"
              size="small">{item.name}</Button>
          )}>
          <MenuList>
            {
              item.menuList.map((item, nindex) => {
                if (item.type === 'divider') {
                  return <Divider key={String(index) + '-' + String(nindex)} className={classes.divider} light />
                }
                return <MenuItem onClick={handleRunCommand(item)} key={String(index) + '-' + String(nindex)}>
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
  </div>
}