import { forwardRef } from 'react';

import Box from '@mui/material/Box';

import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/config-global';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

const LOGO_URL = `${CONFIG.assetsDir}/logo/logo-iyihisler.png`;

export const Logo = forwardRef(
  (
    { width, href = '/', height, isSingle = true, disableLink = false, className, sx, ...other },
    ref
  ) => {
    const baseSize = {
      // Yuvarlak logo: kare kutu (objectFit: contain ile oran korunur)
      width: width ?? (isSingle ? 96 : 220),
      height: height ?? (isSingle ? 96 : 72),
    };

    const logoImage = (
      <Box
        component="img"
        alt="iyi hisler - eğitim danışmanlık"
        src={LOGO_URL}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    );

    return (
      <Box
        ref={ref}
        component={RouterLink}
        href={href}
        className={logoClasses.root.concat(className ? ` ${className}` : '')}
        aria-label="Logo"
        sx={{
          ...baseSize,
          flexShrink: 0,
          display: 'inline-flex',
          verticalAlign: 'middle',
          ...(disableLink && { pointerEvents: 'none' }),
          ...sx,
        }}
        {...other}
      >
        {logoImage}
      </Box>
    );
  }
);
