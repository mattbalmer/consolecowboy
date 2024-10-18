import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import * as React from 'react';

export const SimpleDialog = ({ id, shouldRender, isOpen, onClose, title, body, acknowledge }: {
  id: string,
  shouldRender?: boolean,
  isOpen?: boolean,
  onClose?: () => void,
  title: string,
  body: string,
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
          <DialogContentText id={`simple-dialog-description__${id}`}>
            {body}
          </DialogContentText>
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