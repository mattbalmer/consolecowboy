import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import * as React from 'react';
import { ButtonProps } from '@mui/material/Button/Button';

export const ConfirmDialog = ({
  id,
  title,
  children,
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
  children: React.JSX.Element[] | React.JSX.Element | string,
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
          {typeof children === 'string' ?
            <DialogContentText id={`confirm-dialog-description__${id}`}>
              {children}
            </DialogContentText>
            : children
          }
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