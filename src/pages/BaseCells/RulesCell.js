import React, { useState } from 'react'
import { HiOutlineCollection } from 'react-icons/hi';
import { Badge, FormGroup } from 'react-bootstrap';
import { Checkbox, FormControlLabel, MenuItem, FormControl, InputLabel, Select, Box, Divider } from '@mui/material';
import DateTimePickerCell from './DateTimePickerCell';
const RulesCell = () => {
  const [isChecked, setIsChecked] = useState(false); // State to manage checkbox state
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  return (
    <>
      <div className='row mb-2'>
        <div className='col-12'>
          {/* <div className='f14 text-muted mb-1'>Rules</div> */}
          <Divider textAlign="center" light>Rules</Divider>
        </div>
      </div>
      <div className='row'>
        <div className='col-12 col-md-6 col-lg-4 mb-4'>
          <FormGroup >
            <FormControlLabel
              value="end"
              control={<Checkbox />}
              label={<span className='f14 muted'>Sealed Bid</span>}
              labelPlacement="Sealed Bid"
              onChange={handleCheckboxChange}
            />
          </FormGroup>
        </div>
        {isChecked && <div className='col-12 col-md-6 col-lg-4 mb-4'>
          <DateTimePickerCell
            label={'Bid Open Date/Time'}
            
            value={null}
            defaultValue=''
          />
        </div>}
      </div>
      <div className='row'>
        <div className='col-12 col-md-6 col-lg-4'>
          <FormControl row fullWidth>
            <InputLabel className='f14 muted' id="techappr-label">Technical Approver *</InputLabel>
            <Select
              labelId="techappr-label"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              size='small'
              id="techappr"
              name="techappr"
              value={'0'}
              label="Technical Approver"
            >
              <MenuItem value={'0'}>Select</MenuItem>
              <MenuItem value={'DT'}>Demo Testing</MenuItem>
            </Select>
          </FormControl>
        </div>

      </div>

    </>

  )
}

export default RulesCell;
