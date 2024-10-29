import * as React from 'react';
import { FlexRow } from '@client/components/FlexRow';
import { Tab, Tabs } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const LinkTab = ({
  value,
  label,
  selected,
}: {
  value?: string;
  label?: string;
  selected?: boolean;
}) => {
  return (
    <Tab
      component={Link}
      label={label}
      value={value}
      to={selected ? '#' : value}
      aria-current={selected ? 'page' : undefined}
    />
  );
}

export const NavBar = () => {
  const location = useLocation();

  return <>
    <FlexRow>
      <Tabs
        value={
          location.pathname
            .replace(/play\/.+/g, 'play')
            .replace(/create\.+/g, 'create')
        }
        aria-label='Nav Tabs'
        role='navigation'
      >
        <LinkTab
          label='Play'
          value='/play'
        />
        <LinkTab
          label='Create'
          value='/create'
        />
      </Tabs>
    </FlexRow>
  </>
}