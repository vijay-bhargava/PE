import React, { useEffect } from 'react'
import { Autocomplete, TextField } from '@mui/material';
import { Table } from 'react-bootstrap'
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { findObjByValueFromArray } from '../../../utils/common';
import { ApiClient, api } from '../../../Apiclient';
import { useStateValue } from '../../../store';
import { getAccessLevel } from '../../../utils/common/utility';



const SecurityRFQCell = ({inputList, menufeatures,selectedModule, selectedRoleId, handleMapClaim,handleInputChange,prefilledArr ,mapclaims}) => {
    const apiClient = new ApiClient(customersuffix);
    const [{ atoken, rtoken, customerid, roleClaims }, dispatch] =
		useStateValue();
    
    const claimValue = ["Read", "Create", "Remove", "Assign", "Share"];
    
    return (
      <Table striped bordered hover size="sm">
    <thead>
        <tr className='text-center'>
            <th></th>
            {claimValue.map((value, index) => (
                <th key={index}>{value}</th>
            ))}
        </tr>
    </thead>
    <tbody>
        {Array.from(new Set(inputList.map(feature => feature.claimType))).map((claimType, index) => {
            const claimTypeEntries = inputList.filter(feature => feature.claimType === claimType);
            return (
                <tr key={index}>
                    <td>{claimType}</td>
                    {claimValue.map((value, valueIndex) => {
                        const claim = claimTypeEntries.find(item => item.claimValue === value);
                        return (
                            <td key={valueIndex}>
                                <Autocomplete
                                    disablePortal
                                    disableClearable
                                    id={`${value}-${index}`}
                                    size='small'
                                    options={RoleRights}
                                    getOptionLabel={(option) => option?.label ?? ""}
                                    fullWidth
                                    renderInput={(params) => <TextField {...params} InputLabelProps={{ shrink: true }} label="" />}
                                    sx={{ width: '160px' }}
                                    defaultValue={findObjByValueFromArray(RoleRights, claim?.accessLevel, 'label')}
                                    value={findObjByValueFromArray(RoleRights, claim?.accessLevel, 'label')}
                                    onChange={(e, v) => handleInputChange(e, v, selectedModule, claimType, value, selectedRoleId)}
                                />
                            </td>
                        );
                    })}
                </tr>
            );
        })}
    </tbody>
</Table>


    )
}
const RoleRights = [
    { label: "None"},
    { label: 'User'},
    { label: 'Team'},
    { label: 'Department' },
    { label: 'Business Unit' }, 
    { label: 'Legal Entity' }, 
    { label: 'Admin'}
];
export default SecurityRFQCell