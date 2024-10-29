import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import * as React from 'react';
import { ButtonProps } from '@mui/material/Button/Button';

export const ConfirmDialog = ({
  id,
  title,
  body,
  shouldRender,
  isOpen,
  onCancel,
  onConfirm,
  cancelText,
  confirmText,
  color,
}: {
  id: string,
  title: string,
  body: string,
  shouldRender?: boolean,
  isOpen?: boolean,
  onCancel: () => void,
  onConfirm: () => void,
  cancelText?: string,
  confirmText?: string,
  color?: ButtonProps['color'],
}) => {

  return <>
    {(shouldRender ?? true) &&
      <Dialog
        open={isOpen ?? false}
        onClose={onCancel}
        aria-labelledby={`confirm-dialog-title__${id}`}
        aria-describedby={`confirm-dialog-description__${id}`}
      >
        <DialogTitle id={`confirm-dialog-title__${id}`}>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id={`confirm-dialog-description__${id}`}>
            {body}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} autoFocus>
            {cancelText ?? 'Cancel'}
          </Button>
          <Button onClick={onConfirm} variant={'contained'} color={color ?? 'primary'}>
            {confirmText ?? 'Okay'}
          </Button>
        </DialogActions>
      </Dialog>
    }
  </>
}