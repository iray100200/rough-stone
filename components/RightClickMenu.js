import React from 'react'
import Popper from '@material-ui/core/Popper'
import Paper from '@material-ui/core/Paper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => {
  return {
    popper: {
      zIndex: 10000
    }
  }
})

export default function Menu (props) {
  const classes = useStyles()
  const anchorRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)
  const [referenceObject, setReferenceObject] = React.useState(null)

  const handleOpen = () => {
    setOpen(true)
    props.onClick && props.onClick()
  }

  const handleClose = () => {
    setOpen(false)
    props.onClose && props.onClose()
  }

  React.useEffect(() => {
    setOpen(props.selected)
    if (anchorRef) {
      window.addEventListener('right-click', (evt) => {
        if (evt.detail !== anchorRef.current) {
          handleClose()
        }
      })
      document.addEventListener('click', () => {
        handleClose()
      })
      anchorRef.current.oncontextmenu = (evt) => {
        evt.preventDefault()
        evt.stopPropagation()
        handleOpen()
        setReferenceObject({
          bottom: evt.clientY,
          height: 1,
          left: evt.clientX,
          top: evt.clientY,
          right: evt.clientX,
          width: 1,
          x: 0,
          y: 0,
        })
        window.dispatchEvent(new CustomEvent('right-click', {
          detail: anchorRef.current
        }))
      }
    }
  }, [props.selected])

  return <>
    <props.trigger.type {...props.trigger.props} ref={anchorRef} />
    <Popper
      placement="bottom-start" 
      open={open || false}
      container={document.body}
      anchorEl={{
        getBoundingClientRect () {
          return referenceObject || {
            height: 1,
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            width: 1,
            x: 0,
            y: 0
          }
        },
        clientWidth: 0,
        clientHeight: 0
      }}
      role={undefined}
      className={classes.popper}
      disablePortal={false}>
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