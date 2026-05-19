import React, { useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import TextFieldCell from '../../BaseCells/TextFieldCell'
import { LoadingButton } from '@mui/lab'
import { useStateValue } from '../../../store';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

const AddPRQuestionCellForm = ({ idFromURL, callbackQuesAddCustom }) => {
    const [{ atoken, rtoken, customerid, userDetail }, dispatch] = useStateValue();
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const validationSchema = yup.object().shape({
        rfqqUestion: yup
            .string('Enter Question')
            .required('Question Title is required'),
    });
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            rfqqUestion: '',
            rfqQuestionRequirement: '',
            mandatory: false,
        },
        validationSchema: validationSchema,
        onSubmit: (values, { resetForm }) => {
            var data = {
                id: 0,
                rfqId:idFromURL,
                libraryId:0,
                rfqqUestion: values?.rfqqUestion,
                questionId:0,
                questionDescription: values?.rfqqUestion,
                attachement:false,
                attachedFileName:'',
                optionType:false,
                mandatory: values?.mandatory,
                weightage:0,
                rfqQuestionRequirement: values?.rfqQuestionRequirement
            };
            callbackQuesAddCustom(data)
        }
    });

    return (
        <div>
            <form onSubmit={formik.handleSubmit} autoComplete="off">
                <div className='row mt-2'>
                    <div className='col-12 col-md-12 mb-4'>
                        <TextFieldCell
                            id="rfqqUestion"
                            name="rfqqUestion"
                            label="Enter Question *"
                            placeholder=''
                            value={formik.values.rfqqUestion}
                            onChange={formik.handleChange}
                            error={formik.touched.rfqqUestion && Boolean(formik.errors.rfqqUestion)}
                            helperText={formik.touched.rfqqUestion && formik.errors.rfqqUestion}
                        />
                    </div>
                    <div className='col-12 col-md-12 mb-2'>
                        <TextFieldCell
                            id="rfqQuestionRequirement"
                            name="rfqQuestionRequirement"
                            label="Your Requirement"
                            multiline
                            rows={2}
                            placeholder=''
                            value={formik.values.rfqQuestionRequirement}
                            onChange={formik.handleChange}
                            error={formik.touched.rfqQuestionRequirement && Boolean(formik.errors.rfqQuestionRequirement)}
                            helperText={formik.touched.rfqQuestionRequirement && formik.errors.rfqQuestionRequirement}
                        />
                    </div>
                    <div className='col-12 col-md-12 mb-4'>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={formik.values.mandatory} />}
                                id="mandatory"
                                label={<span className='f14 muted'>Mandatory</span>}
                                labelPlacement="Sealed Bid"
                                name="mandatory"
                                value={formik.values.mandatory}
                                onChange={formik.handleChange}
                            />
                        </FormGroup>
                    </div>
                </div>
                <hr className='mt-0' />
                <div className='text-end'>
                    <LoadingButton
                        variant='outlined'
                        onClick={() => formik.resetForm()}
                        color='primary'
                        className='me-3 text-capitalize'
                        size='small'
                    >
                        Reset
                    </LoadingButton>
                    <LoadingButton
                        loading={loadingSubmit}
                        variant='contained'
                        type="submit"
                        color='primary'
                        className='text-capitalize'
                        size='small'
                    >
                        Add
                    </LoadingButton>
                </div>
            </form>

        </div>
    )
}

export default AddPRQuestionCellForm