import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';

import { Box } from '@mui/material';

/**
 * DataGrid için height problemi çözen container component
 * MUI X DataGrid parent container'ın height'ı olmasını gerektirir
 */
const DataGridContainer = ({ 
  children, 
  height = 600, 
  minHeight = 400,
  sx = {},
  ...other 
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Force set heights after component mounts
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const container = containerRef.current;
        const dataGrid = container.querySelector('.MuiDataGrid-root');
        const virtualScroller = container.querySelector('.MuiDataGrid-virtualScroller');
        const main = container.querySelector('.MuiDataGrid-main');

        if (dataGrid) {
          dataGrid.style.height = '100%';
          dataGrid.style.minHeight = `${minHeight}px`;
          dataGrid.style.display = 'flex';
          dataGrid.style.flexDirection = 'column';
        }

        if (main) {
          main.style.flex = '1 1 auto';
          main.style.minHeight = '0';
        }

        if (virtualScroller) {
          virtualScroller.style.flex = '1 1 auto';
          virtualScroller.style.overflow = 'auto';
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [minHeight]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: `${height}px !important`,
        minHeight: `${minHeight}px !important`,
        width: '100% !important',
        display: 'flex !important',
        flexDirection: 'column !important',
        position: 'relative',
        overflow: 'hidden',
        '& .MuiDataGrid-root': {
          height: '100% !important',
          maxHeight: '100% !important',
          minHeight: `${minHeight}px !important`,
          flex: '1 1 auto !important',
          display: 'flex !important',
          flexDirection: 'column !important',
        },
        '& .MuiDataGrid-main': {
          flex: '1 1 auto !important',
          minHeight: 0,
        },
        '& .MuiDataGrid-virtualScroller': {
          overflow: 'auto !important',
          flex: '1 1 auto !important',
        },
        '& .MuiDataGrid-virtualScrollerContent': {
          minHeight: 'auto !important',
        },
        '& .MuiDataGrid-virtualScrollerRenderZone': {
          minHeight: 'auto !important',
        },
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
};

DataGridContainer.propTypes = {
  children: PropTypes.node.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  // sx prop validation kaldırıldı - MUI standart prop'u
};

export default DataGridContainer; 