import { Box, Button, Checkbox, Drawer, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useState } from 'react'
import { HiOutlineX, HiPlusSm } from 'react-icons/hi'
import { useCallback } from 'react'
import ResultListCell from './ResultListCell'
import { LoadingButton } from '@mui/lab'
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextFieldCell from '../../BaseCells/TextFieldCell'

const DynamicFieldsSettings = () => {

    const [state, setState] = useState({
        addnewfield: false,
    });
    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };
    const callbackAddCus = useCallback((pass) => {
        console.log('callbackAddCus', pass);
        // setcusupdata(pass);
        // setModalUploadShow(true)
    }, []);
    return (
        <>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-12 col-md-8 col-lg-9 p-0 '>
                       
                                                        <div className='d-flex justify-content-between minh50px align-items-center bg-grey p-2'>

                            <div className='d-flex justify-content-between minh50px align-items-center bg-white p-2 border-bottom'>
                                <div className='page-heading f16'>Manage Fields</div>
                                <div>
                                    <div className='action-wrap'>
                                        <Button
                                            variant='text'
                                            size='small'
                                            startIcon={<HiPlusSm />}
                                            className='text-capitalize font-normal'
                                            onClick={toggleDrawer('addnewfield', true)}
                                        >Add New</Button>
                                    </div>
                                </div>
                            </div>
                            
                                 <div className='flex-grow-1 m-1'>
                                <div className='p-3'>
                                    <div className='row'>
                                        <div className='col-12 mb-3'>
                                            <div className='row align-items-center pt-2 pb-1 rounded border-bottom ms-0 me-0 mb-3 bggray'>
                                                <div className='col-12 col-md-10'>
                                                    <div className='row text-left f12 lingh14 text-muted'>
                                                        <div className='col-lg col-md col-12' >
                                                            <div>Field Title</div>
                                                        </div>
                                                        <div className='col-lg-1 col-md-1 col-12 text-center' >
                                                            <div>For</div>
                                                        </div>
                                                        <div className='col-lg-2 col-md-1 col-12 text-center' >
                                                            <div>Tab</div>
                                                        </div>
                                                        <div className='col-lg-1 col-md-1 col-12 text-center' >
                                                            <div>Show</div>
                                                        </div>
                                                        <div className='col-lg-1 col-md-2 col-12 text-center pe-0 ps-0' >
                                                            <div>Required</div>
                                                        </div>
                                                        <div className='col-lg-2 col-md-2 col-12 text-center' >
                                                            <div className=''>Options</div>
                                                        </div>
                                                        <div className='col-lg-1 col-md col-6 text-center pe-0 ps-0'>
                                                            <div>Created At</div>
                                                        </div>
                                                        <div className='col-lg-1 col-md-1 col-6 text-center'>
                                                            <div>Status</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='d-flex col-12 col-md-2 align-items-center text-end'>
                                                    <div className='f14'>
                                                        <div className='text-muted f14 lingh14'></div>
                                                    </div>
                                                </div>
                                            </div>
                                            {customcatlist && customcatlist?.length > 0 && customcatlist?.map((item, i) => (
                                                <ResultListCell key={i} itemin={item} callbackAddCus={callbackAddCus} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-12 col-md-4 col-lg-3 border-start p-0'>
                        <div className='d-flex flex-column min-vh-100'>
                            <div className='bg-white border-bottom minh50px d-flex align-items-center ps-2 pe-2'>
                                <div className='row'>
                                    <div className='col-12'>
                                        <div className='f14'>Filters</div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex-grow-1'>
                                <div className='p-3'>
                                    <div className='row'>
                                        <div className='col-12 mb-4'>
                                            <TextFieldCell
                                                id=""
                                                name=""
                                                label="Field Title"
                                                placeholder=''
                                            />
                                        </div>
                                        <div className='col-12 mb-4'>
                                            <FormControl fullWidth>
                                                <InputLabel id="eventtype">Event For</InputLabel>
                                                <Select
                                                    labelId="eventtype"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    variant="outlined"
                                                    size='small'
                                                    id=""
                                                    name=""
                                                    value={'all'}
                                                    label="Event For"
                                                // onChange={handleChange}
                                                >
                                                    <MenuItem value={'all'}>All</MenuItem>
                                                    <MenuItem value={'rfq'}>RFQ</MenuItem>
                                                    <MenuItem value={'ra'}>RA</MenuItem>
                                                    <MenuItem value={'fa'}>FA</MenuItem>
                                                    <MenuItem value={'vq'}>VQ</MenuItem>
                                                    <MenuItem value={'vo'}>Supplier Onboarding</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                       <div className='col-12 mb-4'>
                                            <FormControl fullWidth>
                                                <InputLabel id="Workflowtype">Tab</InputLabel>
                                                <Select
                                                    labelId="Tab"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    variant="outlined"
                                                    size='small'
                                                    id="Tab"
                                                    name=""
                                                    value={1}
                                                    label="Tab"
                                                //onChange={handleChange}
                                                >
                                                     <MenuItem value={1}>All</MenuItem>
                                                    <MenuItem value={2}>General</MenuItem>
                                                    <MenuItem value={3}>Product/Item</MenuItem>

                                                </Select>
                                            </FormControl>
                                        </div>
                                         <div className='col-12 mb-4'>
                                            <LocalizationProvider
                                                dateAdapter={AdapterDateFns}>
                                                <DesktopDatePicker
                                                    variant="outlined"
                                                    slotProps={{
                                                        textField: {
                                                            variant: 'outlined', fullWidth: true, size: 'small', InputLabelProps: { shrink: true },
                                                        }
                                                    }}
                                                    label='Date Created'
                                                />
                                            </LocalizationProvider>
                                        </div>

                                        <div className='col-12 mb-4'>
                                            <FormControl fullWidth>
                                                <InputLabel id="Required">Show</InputLabel>
                                                <Select
                                                    labelId="Show"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    variant="outlined"
                                                    size='small'
                                                    id="Show"
                                                    name=""
                                                    value={1}
                                                    label="Show"
                                                //onChange={handleChange}
                                                >
                                                    <MenuItem value={1}></MenuItem>
                                                    <MenuItem value={2}>Yes</MenuItem>
                                                    <MenuItem value={3}>No</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className='col-12 mb-4'>
                                            <FormControl fullWidth>
                                                <InputLabel id="Required">Required</InputLabel>
                                                <Select
                                                    labelId="Required"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    variant="outlined"
                                                    size='small'
                                                    id="Required"
                                                    name=""
                                                    value={1}
                                                    label="Required"
                                                //onChange={handleChange}
                                                >
                                                    <MenuItem value={1}></MenuItem>
                                                    <MenuItem value={2}>Yes</MenuItem>
                                                    <MenuItem value={3}>No</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                        
                                        <div className='col-12 mb-4'>
                                            <FormControl fullWidth>
                                                <InputLabel id="Status">Status</InputLabel>
                                                <Select
                                                    labelId="Status"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    variant="outlined"
                                                    size='small'
                                                    id="Status"
                                                    name=""
                                                    value={1}
                                                    label="Status"
                                                //onChange={handleChange}
                                                >
                                                    <MenuItem value={1}>All</MenuItem>
                                                    <MenuItem value={2}>Active</MenuItem>
                                                    <MenuItem value={3}>Deactive</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div> 
                                        <div className='col-12 text-end'>
                                            <LoadingButton
                                                variant='text'
                                                color='primary'
                                                className='me-3 text-capitalize'
                                                size='small'
                                            >
                                                Clear
                                            </LoadingButton>
                                            <LoadingButton
                                                // loading
                                                variant='outlined'
                                                // onClick={() => router.push(`/sdsdsd/${actibeModuleID}`)}
                                                color='primary'
                                                className='text-capitalize'
                                                size='small'
                                            >
                                                Submit
                                            </LoadingButton>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <React.Fragment key='top'  >
                <Drawer
                    anchor='right'
                    open={state['addnewfield']}
                    onClose={toggleDrawer('addnewfield', false)}>
                    <Box sx={{ width: { xs: 280, sm: 480, md: 720 }, }} >
                        <div className='flex flex-col'>
                            <Box className='bgheaderCards'>
                                <div className='d-flex align-items-center justify-content-between pt-2 pb-2'>
                                    <div className='ms-3 text-white'>
                                        Add Field
                                    </div>
                                    <div>
                                        <IconButton
                                            onClick={toggleDrawer('addnewfield', false)}
                                            size="small"
                                            edge="start"
                                            sx={{ mr: 1 }}
                                        >
                                            <HiOutlineX className='f20 text-white' />
                                        </IconButton>
                                    </div>
                                </div>
                            </Box>
                            <div className='h50px'></div>
                            <Box sx={{ flexGrow: 1, p: 2 }} >
                                <div className='row'>
                                    <div className='col-12 col-md-6 mb-4'>
                                        <TextField
                                            id="fieldType"
                                            className='w-100 '
                                            select
                                            label="Field Type"
                                            name="fieldType"
                                            variant="standard"
                                        >
                                            <MenuItem value='tags'>
                                                Select
                                            </MenuItem>
                                            <MenuItem value='textarea'>
                                                TextField
                                            </MenuItem>
                                            <MenuItem value='textarea'>
                                                Radio
                                            </MenuItem>
                                            <MenuItem value='textarea'>
                                                Checkbox
                                            </MenuItem>
                                        </TextField>
                                    </div>
                                    <div className='col-12 col-md-6 mb-4'>
                                        <TextField
                                            className='w-100'
                                            variant="standard"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            id="name"
                                            name="textbox"
                                            label='Field Title/Name'
                                            value=''
                                            type='text'
                                        />
                                    </div>
                                    <div className='col-12 col-lg-12'>
                                        <FormGroup className=''>
                                            <FormControlLabel control={<Checkbox
                                                name='show'
                                                id='show'
                                            // value={formikcat.values.show}
                                            // onChange={formikcat.handleChange}
                                            //defaultChecked
                                            />} label="Show" />
                                        </FormGroup>
                                    </div>
                                    <div className='col-12 col-lg-12'>
                                        <FormGroup className=''>
                                            <FormControlLabel control={<Checkbox
                                                name='mandatory'
                                                id='mandatory'
                                            // value={formikcat.values.mandatory}
                                            // onChange={formikcat.handleChange}
                                            //defaultChecked
                                            />} label="Mandatory" />
                                        </FormGroup>
                                    </div>
                                    <div className='col-12 col-lg-12'>
                                        <FormGroup className=''>
                                            <FormControlLabel control={<Checkbox
                                                name='mandatory'
                                                id='mandatory'
                                            // value={formikcat.values.mandatory}
                                            // onChange={formikcat.handleChange}
                                            //defaultChecked
                                            />} label="Multi Select" />
                                        </FormGroup>
                                    </div>
                                    <div className='col-12 text-end'>
                                        <hr />
                                        <LoadingButton
                                            variant='text'
                                            color='primary'
                                            className='me-3 text-capitalize'
                                            size='small'
                                        >
                                            Reset
                                        </LoadingButton>
                                        <LoadingButton
                                            // loading
                                            variant='outlined'
                                            // onClick={() => router.push(`/sdsdsd/${actibeModuleID}`)}
                                            color='primary'
                                            className='text-capitalize'
                                            size='small'
                                        >
                                            Submit
                                        </LoadingButton>
                                    </div>
                                </div>
                            </Box>
                        </div>
                    </Box>
                </Drawer>
            </React.Fragment>
        </>
    )
}

const customcatlist = [
    {
        id: 2,
        name: "Select",
        fieldName: "skills_cat",
        show: 1,
        mandatory: 1,
        multiSelect: 1,
        fieldType: "select",
        value: "",
        valueLabel: "",
        tab: 'Product',
        options: [
            {
                id: 3,
                name: "tert",
                deleteFlag: false
            },
            {
                id: 16,
                name: "ewrewr",
                deleteFlag: false
            }
        ]
    },
    {
        id: 2,
        name: "Radio Type",
        fieldName: "skills_cat",
        show: 1,
        mandatory: 1,
        multiSelect: 0,
        fieldType: "select",
        value: "",
        valueLabel: "",
        tab: 'General',
        options: [
            {
                id: 3,
                name: "tert",
                deleteFlag: false
            },
            {
                id: 16,
                name: "ewrewr",
                deleteFlag: false
            }
        ]
    },
    {
        id: 3,
        name: "TextBox label",
        fieldName: "gst_no_tag",
        show: 1,
        mandatory: 1,
        multiSelect: 0,
        fieldType: "textarea",
        value: "",
        valueLabel: "",
        tab: 'Product'
    },
    {
        id: 4,
        name: "Checkbox label",
        fieldName: "gst_no_tag",
        show: 1,
        mandatory: 1,
        multiSelect: 0,
        fieldType: "checkbox",
        value: "",
        valueLabel: "",
        tab: 'Product'
    },
    {
        id: 5,
        name: "CheckBox Group",
        fieldName: "skills_cat",
        show: 1,
        mandatory: 1,
        multiSelect: 1,
        fieldType: "select",
        value: "",
        valueLabel: "",
        tab: 'Product',
        options: [
            {
                id: 3,
                name: "tert",
                deleteFlag: false
            },
            {
                id: 16,
                name: "ewrewr",
                deleteFlag: false
            }
        ]
    },
];

export default DynamicFieldsSettings