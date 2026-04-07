import { forwardRef, useState } from 'react';

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
    const [imgReady, setImgReady] = useState(false);

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
        loading="eager"
        decoding="async"
        onLoad={() => setImgReady(true)}
        sx={(theme) => ({
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'contain',
          objectPosition: 'center',
          borderRadius: '50%',
          // Yüklenene kadar kare/placeholder çizimini göstermemek için
          opacity: imgReady ? 1 : 0,
          transition: theme.transitions.create('opacity', { duration: 160 }),
        })}
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
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          borderRadius: '50%',
          overflow: 'hidden',
          bgcolor: 'transparent',
          // Link odak/hover'da tema ile kare zemin çıkmasın
          textDecoration: 'none',
          color: 'inherit',
          '&:hover': { bgcolor: 'transparent' },
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
