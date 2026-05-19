import React from 'react'
import { DateField, LocalizationProvider, MobileTimePicker, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

const DateTimePickerCell = ({label, value, error, helperText, defaultValue, onChange}) => {
    return (
        <LocalizationProvider
            dateAdapter={AdapterDateFns}>
            <DateTimePicker
                variant="outlined"
                label={label}
                size="small"
                value={value}
                slotProps={{
                    textField: {
                        variant: 'outlined', fullWidth: true, size: 'small', InputLabelProps: { shrink: true },
                        error: error,
                        helperText: helperText
                    }
                }}
                onChange={onChange}
                defaultValue={defaultValue}
            />
        </LocalizationProvider>
    )
}

export default DateTimePickerCell