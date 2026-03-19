import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { useAuth } from 'src/hooks/useAuth';

import { NavList } from './nav-list';
import { NavUl, NavLi } from '../styles';
import { navSectionClasses } from '../classes';
import { navSectionCssVars } from '../css-vars';

// ----------------------------------------------------------------------

export function NavSectionMini({
  sx,
  data,
  render,
  slotProps,
  enabledRootRedirect,
  cssVars: overridesVars,
}) {
  const theme = useTheme();
  const { hasRole, isAdmin } = useAuth();

  const cssVars = {
    ...navSectionCssVars.mini(theme),
    ...overridesVars,
  };

  // USER için sadece yetkili menü öğelerini göster (NavSectionVertical ile aynı filtreleme)
  const filteredData = data.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.hidden) return false;
      if (item.hideForRole === 'ADMIN' && isAdmin()) return false;
      if (!item.requiredRole) return true;
      return hasRole(item.requiredRole);
    }).map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => {
            if (child.hideForRole === 'ADMIN' && isAdmin()) return false;
            if (!child.requiredRole) return true;
            return hasRole(child.requiredRole);
          })
        };
      }
      return item;
    })
  })).filter((group) => group.items.length > 0);

  return (
    <Stack component="nav" className={navSectionClasses.mini.root} sx={{ ...cssVars, ...sx }}>
      <NavUl sx={{ flex: '1 1 auto', gap: 'var(--nav-item-gap)' }}>
        {filteredData.map((group) => (
          <Group
            key={group.subheader ?? group.items[0].title}
            render={render}
            cssVars={cssVars}
            items={group.items}
            slotProps={slotProps}
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function Group({ items, render, slotProps, enabledRootRedirect, cssVars }) {
  return (
    <NavLi>
      <NavUl sx={{ gap: 'var(--nav-item-gap)' }}>
        {items.map((list) => (
          <NavList
            key={list.title}
            depth={1}
            data={list}
            render={render}
            cssVars={cssVars}
            slotProps={slotProps}
            enabledRootRedirect={enabledRootRedirect}
          />
        ))}
      </NavUl>
    </NavLi>
  );
}
