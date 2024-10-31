import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export const SimpleDialog = ({ id, shouldRender, isOpen, onClose, title, children, acknowledge }: {
  id: string,
  shouldRender?: boolean,
  isOpen?: boolean,
  onClose?: () => void,
  title: string,
  children: React.JSX.Element[] | React.JSX.Element | string,
  acknowledge?: string,
}) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  }

  return <>
    {(shouldRender ?? true) &&
      <Dialog
        open={isOpen ?? false}
        onClose={handleClose}
        aria-labelledby={`simple-dialog-title__${id}`}
        aria-describedby={`simple-dialog-description__${id}`}
      >
        <DialogTitle id={`simple-dialog-title__${id}`}>{title}</DialogTitle>
        <DialogContent>
          {typeof children === 'string' ?
            <DialogContentText id={`simple-dialog-description__${id}`}>
              {children}
            </DialogContentText>
            : children
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            {acknowledge ?? 'Okay'}
          </Button>
        </DialogActions>
      </Dialog>
    }
  </>
}