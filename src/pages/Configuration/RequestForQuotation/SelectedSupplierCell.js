import { Tooltip, Badge } from '@mui/material';
import * as React from 'react';
import { HiCalculator } from "react-icons/hi";

const SelectedSupplierCell = ({ selectedsupplier }) => {
    return (
        <>
            <div className=''>
                <div className='row'>
                    <div className='col-12 mb-3 '>
                        <div className='row align-items-center p-1 ps-0 pe-0   ms-0 me-0 mt-2 MuiDataGrid-columnHeaders text-white d-none d-lg-block' style={{borderRadius:"0px"}}>
                            <div className='col-12 col-md-10 f14 lingh14'>
                                <div className=" pe-2">
                                    <div className='row text-left'>
                                        <div className='col-lg-1 col-md-4 col-12 ps-1 f14 fw500' >
                                            <div className=''>S.No</div>
                                        </div>
                                        <div className='col-lg col-md-4 col-12 f14 fw500' >
                                            <div className=''>Name </div>
                                        </div>
                                        <div className='col-lg col-md-4 col-6  f14 fw500'>
                                            <div className=''>
                                                 Email
                                            </div>
                                        </div>
                                        <div className='col-lg col-md-4 col-6 f14 fw500'>
                                            <div className=''>
                                                 Company Name
                                            </div>
                                        </div>
                                        
                                       

                                    </div>
                                </div>
                            </div>
                            <div className='d-flex col-12 col-md-2 align-items-center text-end'>
                                <div className='f14'>
                                    <div className='text-muted f14 lingh14'></div>
                                </div>
                            </div>
                        </div>
                        <div className='zebracolor'>
                            {selectedsupplier && selectedsupplier?.length > 0 && selectedsupplier?.map((item, index) => <div className={`${index % 2 == 0 ? "even" : "odd"}`} key={index}>
                                <div className='row align-items-center p-0 pb-1 border-bottom ms-0 me-0 pt-2'>
                                    <div className='col-10 col-md-10 col-lg-10'>
                                        <div className="ps-2 pe-2">
                                            <div className='row text-left f14'>
                                                <div className='col-lg-1 col-md-4 col-12' >
                                                    <div className='text-muted f14 lingh14'>{index + 1}</div>
                                                </div>
                                                <div className='col-lg col-md-4 col-12 text-truncate' >
                                                    <div className='text-muted lingh14 text-truncate'>{item?.contactPerson}</div>
                                                </div>
                                                <div className='col-lg col-md-4 col-6 text-truncate'>
                                                    <div className='text-muted lingh14 text-truncate'>{item?.email}</div>
                                                </div>
                                                <div className='col-lg col-md-4 col-6' style={{ overflow: 'visible' }}>
                                                    <div className='d-flex align-items-center gap-2' style={{ overflow: 'visible', paddingTop: '4px', paddingBottom: '4px' }}>
                                                        <Tooltip title={item?.companyName || ''} placement="top" arrow>
                                                            <div className='text-muted lingh14 text-truncate'>{item?.companyName}</div>
                                                        </Tooltip>
                                                        {(() => {
                                                            const loadingFactors = item?.rfqLoadingFactor || item?.bidLoadingFactor || [];
                                                            return loadingFactors.length > 0 && (
                                                                <div style={{ paddingTop: '2px', marginTop: '2px' }}>
                                                                    <Tooltip title={`${loadingFactors.length} Loading Factor(s) Applied`} placement="top" arrow>
                                                                        <Badge 
                                                                            badgeContent={loadingFactors.length} 
                                                                            color="primary"
                                                                            sx={{ 
                                                                                '& .MuiBadge-badge': { 
                                                                                    fontSize: '0.65rem',
                                                                                    height: '16px',
                                                                                    minWidth: '16px',
                                                                                    padding: '0 4px'
                                                                                } 
                                                                            }}
                                                                        >
                                                                            <HiCalculator className='text-primary' size={16} />
                                                                        </Badge>
                                                                    </Tooltip>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SelectedSupplierCell