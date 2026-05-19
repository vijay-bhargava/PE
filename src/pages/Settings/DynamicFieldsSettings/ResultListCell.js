import React, { useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { TextField, Checkbox, Typography, Tooltip, IconButton, Stack, Badge, Chip, Avatar, Button, FormControl } from '@mui/material';
import { Modal } from 'react-bootstrap';
import { LoadingButton } from '@mui/lab';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineX, HiPencilAlt } from 'react-icons/hi';
import { FaRegFloppyDisk, FaPaperclip } from "react-icons/fa6";
// import GroupAddIcon from '@mui/icons-material/GroupAdd';
// import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
// import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
// import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
// import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
// import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';




// import CategoryListCell from './CategoryListCell';



const ResultListCell = ({ itemin, callback, callbackAddCus }) => {
    console.log('itemin', itemin)

    const [modal1, setModal1] = useState(false);
    const handleCloseModal1 = () => setModal1(false);
    const [editmode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const formikcat = useFormik({
        enableReinitialize: true,
        initialValues: {
            //  businessId: gid,
            //  token: token,
            id: itemin?.id,
            name: `${itemin?.name}`,
            show: itemin?.show === 1 ? true : false,
            mandatory: itemin?.mandatory === 1 ? true : false,
            deleteFlag: '0',
            options: itemin?.options,
        },
        //  validationSchema: validationSchemaCat,
        onSubmit: (values) => {
            console.log(values)

        },
    });

    // options
    //const [inputList, setInputList] = useState([{ id:'', name: ""}]);
    const [inputList, setInputList] = useState(itemin?.options?.length > 0 ? itemin?.options : [{ id: '', name: "", deleteFlag: false }]);
    const handleInputChange = (e, index) => {
        console.log('pagge', e)
        const { name, value } = e.target;
        const list = [...inputList];
        list[index][name] = value;
        setInputList(list);
    };
    const handleInputDelete = (e, index) => {
        const { name, checked } = e.target;
        const list = [...inputList];
        list[index][name] = checked;
        setInputList(list);
    };
    const handleRemoveClick = index => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
    };
    const handleAddClick = () => {
        setInputList([...inputList, { id: '', name: "", deleteFlag: false }]);
    };
    // options
    //console.log('inputList', inputList)

    const setDelete = () => {
        //console.log('idto delete', itemin?.id)
        formikcat.setFieldValue("deleteFlag", '1');
        formikcat.handleSubmit();
    }
    const setUpdate = () => {
        //console.log('idto setUpdate', itemin?.id)
        formikcat.setFieldValue("deleteFlag", '0');
        formikcat.handleSubmit();
    }
    const updateOptions = () => {
        //console.log('inputListdata', inputList)
        formikcat.setFieldValue("options", inputList);
        formikcat.handleSubmit();
    }


    return (
        <>
             <div className='row align-items-center pt-1 pb-1 border-bottom ms-0 me-0'>
                <div className='col-12 col-md-10'>
                    <div className='row align-items-center text-left f12 lingh14 text-muted'>
                        <div className='col-lg col-md col-12' >
                            <div className='text-truncate'>{itemin?.name}</div>
                        </div>
                        <div className='col-lg-1 col-md-1 col-12 text-center' >
                            <div>RA</div>
                        </div>
                        <div className='col-lg-2 col-md-1 col-12 text-center' >
                            <div>{itemin?.tab}</div>
                        </div>
                        <div className='col-lg-1 col-md-1 col-12 text-center' >
                            <div>Yes</div>
                        </div>
                        <div className='col-lg-1 col-md-2 col-12 text-center pe-0 ps-0' >
                            <div>Yes</div>
                        </div>
                        <div className='col-lg-2 col-md-2 col-12 text-center' >
                            {itemin?.options ? <>
                                <Chip avatar={<Avatar>{itemin?.options?.length}</Avatar>} size='small' label="Options" color="success" onClick={() => setModal1(true)} variant="outlined" />
                            </>:<></>}
                        </div>
                        <div className='col-lg-1 col-md col-6 text-center pe-0 ps-0'>
                            <div>23 Jul 2023</div>
                        </div>
                        <div className='col-lg-1 col-md-1 col-6 text-center'>
                            <div className='text-success'>Active</div>
                        </div>
                    </div>
                </div>
                <div className='d-flex col-12 col-md-2 align-items-center justify-content-end'>
                    <IconButton size='small' className='bg-white'>
                        <HiPencilAlt className='f17 text-primary' />
                    </IconButton>
                    <IconButton size='small' className='bg-white ms-2'>
                        <HiOutlineX className='f17 text-danger' />
                    </IconButton>
                </div>
            </div>
            <Modal
                size="lg"
                show={modal1}
                backdrop="static"
                keyboard={false}
                centered
                contentClassName='border-0 rounded'
                onHide={() => handleCloseModal1()}
            >
                <Modal.Header>
                    <Modal.Title id="modal-heading">
                        <div className='d-flex align-items-center f14'>ADD OPTIONS</div>
                    </Modal.Title>
                    <IconButton
                        onClick={() => handleCloseModal1()}
                        size="small"
                        edge="start">
                        {/* <CloseOutlinedIcon className='text-white' />   */}
                    </IconButton>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className='p-3'>
                        <div className='row'>
                            <div className='col-12 col-lg-12 mt-2 '>
                                {inputList?.map((x, i) => {
                                    return (
                                        <div className="row  d-flex align-items-center w-100 mb-3" key={i}>
                                            <div className="col-lg-6 col-12">
                                                <TextField
                                                    variant="standard"
                                                    className='w-100'
                                                    required
                                                    id={x.name}
                                                    label="Option Value"
                                                    value={x.name}
                                                    size='small'
                                                    name="name"
                                                    placeholder="Option Value"
                                                    onChange={e => handleInputChange(e, i)}
                                                // helperText={`${x.name.length}/${'25'}`}
                                                />

                                            </div>
                                            <div className="col-lg-4 col-12">
                                                <FormControl component="fieldset" variant="standard">
                                                    <FormGroup
                                                        name='deleteFlag'
                                                    >
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    //defaultChecked={individualConfig?.value}
                                                                    name='deleteFlag'
                                                                    value={x.deleteFlag}
                                                                    onChange={e => handleInputDelete(e, i)}
                                                                />
                                                            }
                                                            label={
                                                                <Typography className='f14'>Delete</Typography>
                                                            }
                                                        />
                                                    </FormGroup>
                                                </FormControl>
                                            </div>

                                            {inputList?.length ? <>
                                                {inputList.length - 1 === i && <div className='col-lg-2 col-6 pe-0'><Button variant="outlined" size='small' color="primary" className="" onClick={handleAddClick}>+ Add More</Button></div>}
                                            </> : null}

                                            {/* {inputList.length !== 1 && <div className="col-lg-2 col-6"><Button
                                                        variant="outlined" color="error" size='small'
                                                        onClick={() => handleRemoveClick(i)}><ClearOutlinedIcon /></Button></div>} */}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="error" variant='text' onClick={() => handleCloseModal1()} className='me-3' size='small'>
                        Cancel
                    </Button>
                    {!loading ? <Button color="success"
                        variant='outlined' className='' size='small' onClick={() => updateOptions()} >
                        UPDATE OPTIONS
                    </Button> : <LoadingButton className='' loading variant="outlined">
                        UPDATE OPTIONS
                    </LoadingButton>}
                </Modal.Footer>

            </Modal>


        </>
    )
}

export default ResultListCell