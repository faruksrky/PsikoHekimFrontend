import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const VIEW_OPTIONS = [
  { value: 'dayGridMonth', label: 'Ay', icon: 'mingcute:calendar-month-line' },
  { value: 'timeGridWeek', label: 'Hafta', icon: 'mingcute:calendar-week-line' },
  { value: 'timeGridDay', label: 'Gün', icon: 'mingcute:calendar-day-line' },
  { value: 'listWeek', label: 'Ajenda', icon: 'fluent:calendar-agenda-24-regular' },
];

// ----------------------------------------------------------------------
export function CalendarToolbar({
  date,
  view,
  loading,
  onToday,
  canReset,
  onNextDate,
  onPrevDate,
  onChangeView,
  onOpenFilters,
}) {
  const popover = usePopover();

  const selectedItem = VIEW_OPTIONS.filter((item) => item.value === view)[0];

  // Tarih formatını kontrol et
  const parsedDate = new Date(date); // Tarih değerini Date nesnesine dönüştür
  const formattedDate = !Number.isNaN(parsedDate.getTime()) // Geçerli bir tarih mi kontrol et
    ? parsedDate.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : "Geçersiz Tarih"; // Hatalı bir tarih geldiğinde gösterilecek metin

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pr: 2, position: 'relative' }}
      >
        <Button
          size="small"
          color="inherit"
          onClick={popover.onOpen}
          startIcon={<Iconify icon={selectedItem.icon} />}
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" sx={{ ml: -0.5 }} />}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          {selectedItem.label}
        </Button>

        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={onPrevDate}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Typography variant="h6">{formattedDate}</Typography>

          <IconButton onClick={onNextDate}>
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Button size="small" color="error" variant="contained" onClick={onToday}>
            Bugün
          </Button>

          <IconButton onClick={onOpenFilters}>
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="ic:round-filter-list" />
            </Badge>
          </IconButton>
        </Stack>

        {loading && (
          <LinearProgress
            color="inherit"
            sx={{
              left: 0,
              width: 1,
              height: 2,
              bottom: 0,
              borderRadius: 0,
              position: 'absolute',
            }}
          />
        )}
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <MenuList>
          {VIEW_OPTIONS.map((viewOption) => (
            <MenuItem
              key={viewOption.value}
              selected={viewOption.value === view}
              onClick={() => {
                popover.onClose();
                onChangeView(viewOption.value);
              }}
            >
              <Iconify icon={viewOption.icon} />
              {viewOption.label}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </>
  );
}
