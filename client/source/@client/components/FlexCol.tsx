import * as React from 'react';
import { Box } from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { BoxProps } from '@mui/material/Box/Box';

export const FlexCol = ({ children, sx, ...props }: {
  children?: React.JSX.Element[] | React.JSX.Element,
  sx?: SxProps<Theme>,
  props?: BoxProps[],
}) => {
  return <Box sx={{
    ...sx,
    display: 'flex',
    flexDirection: 'column',
  }}
    {...props}
  >
    {children}
  </Box>
}