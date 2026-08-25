import React from 'react'
import { TextField } from '@mui/material';

const TextFieldCell = ({ id, name, label, placeholder, type, value, error, helperText, defaultValue, readOnly, onChange, maxLength, multiline, rows, disabled, onBlur, InputProps, className }) => {
	return (
		<TextField
			fullWidth
			id={id}
			name={name}
			InputLabelProps={{ shrink: true }}
			inputProps={{ maxLength: maxLength }}
			disabled={disabled}
			className={`f14${className ? ' ' + className : ''}`}
			value={value}
			size="small"
			label={label}
			placeholder={placeholder}
			type={type || 'text'}
			error={error}
			helperText={helperText}
			defaultValue={defaultValue}
			multiline={multiline}
			rows={rows}
			onChange={onChange}
			onBlur={onBlur}
			InputProps={InputProps}
			variant="outlined"
			autoComplete="off"
			autoCorrect='off'
			autoCapitalize='off'
			readOnly={readOnly}
		/>
	)
}

export default TextFieldCell