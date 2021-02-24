import React from 'react'
import Popper from '@material-ui/core/Popper'
import Paper from '@material-ui/core/Paper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'

export default function Menu (props) {
  const anchorRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => {
    setOpen(true)
    props.onClick()
  }

  const handleClose = () => {
    setOpen(false)
    props.onClose()
  }

  const handleMouseEnter = () => {
    if (props.active) {
      handleOpen()
    }
  }

  React.useEffect(() => {
    setOpen(props.selected)
  }, [props.selected])

  return <>
    <props.trigger.type {...props.trigger.props} ref={anchorRef} onClick={handleOpen} onMouseEnter={handleMouseEnter}></props.trigger.type>
    <Popper placement="top-start" open={open || false} anchorEl={anchorRef.current} role={undefined} disablePortal={false}>
      {() => (
        <Paper>
          <ClickAwayListener onClickAway={handleClose}>
            {props.children}
          </ClickAwayListener>
        </Paper>
      )}
    </Popper>
  </>
}