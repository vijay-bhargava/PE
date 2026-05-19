import React, { useState } from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, TextField, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Radio, RadioGroup, FormControlLabel, Typography, Grid } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const NFADetail = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Sample itemsList for table data (replace with your actual data)
    const [itemsList, setItemsList] = useState([
        { id: 1, vendorName: 'Vendor 1', itemCode: 'A123', itemName: 'Item 1', quantity: 10, uom: 'kg', price: 50 },
        { id: 2, vendorName: 'Vendor 2', itemCode: 'B456', itemName: 'Item 2', quantity: 15, uom: 'ltr', price: 30 }
    ]);
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className="p-3 pe-2 ps-2 custom-fix">
            {/* Accordion for Responses */}
            <Accordion sx={{ boxShadow: 'none', marginBottom: '16px' }}>
                <AccordionSummary className='text-primary fw500' expandIcon={<ExpandMore />} id="panel1-header">
                    Responses
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {/* First Row of Questions */}
                        <Grid container item xs={12} spacing={2}>
                            <Grid item xs={6}>
                                <Typography>Question 1</Typography>
                                <TextField
                                    placeholder="Answer here"
                                    size="small"
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                            <Typography>Question 2</Typography>
                                <TextField
                                    placeholder="Answer here"
                                    size="small"
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} spacing={2}>
                            <Grid item xs={6}>
                                <Typography>Question 3</Typography>
                                <TextField
                                    placeholder="Answer here"
                                    size="small"
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                            <Typography>Question 4</Typography>
                            <TextField
                                    placeholder="Answer here"
                                    size="small"
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                        </Grid>
                        {/* Second Row of Questions */}
                       
                      
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Accordion for Bidding Details */}
            <Accordion sx={{ boxShadow: 'none' }}>
                <AccordionSummary className='text-primary fw500' expandIcon={<ExpandMore />} id="panel2-header">
                    Bidding Details
                </AccordionSummary>
                <AccordionDetails>
                    <div className="table-responsive item-Table">
                        <Table className="itemstable stripped">
                            <thead style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                                <tr>
                                    <th className="text-white fw500 f14">S.No</th>
                                    <th className="text-white fw500 f14">Vendor Name</th>
                                    <th className="text-white fw500 f14">Question 1</th>
                                    <th className="text-white fw500 f14">Question 2</th>
                                    <th className="text-white fw500 f14">Question 3</th>
                                    <th className="text-white fw500 f14">Question 4</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                                    <tr key={item.id} className={index % 2 === 0 ? 'even' : 'odd'}>
                                        <td>{page * rowsPerPage + index + 1}</td>
                                        <td>
                                            <RadioGroup row aria-label="vendor" name="vendor-group">
                                                <FormControlLabel value={item.vendorName} control={<Radio />} label={item.vendorName} />
                                            </RadioGroup>
                                        </td>
                                        <td>
                                            <RadioGroup row aria-label="question1" name={`question1-${item.id}`}>
                                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                                <FormControlLabel value="no" control={<Radio />} label="No" />
                                                <FormControlLabel value="na" control={<Radio />} label="NA" />
                                            </RadioGroup>
                                        </td>
                                        <td>
                                            <RadioGroup row aria-label="question2" name={`question2-${item.id}`}>
                                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                                <FormControlLabel value="no" control={<Radio />} label="No" />
                                                <FormControlLabel value="na" control={<Radio />} label="NA" />
                                            </RadioGroup>
                                        </td>
                                        <td>
                                            <RadioGroup row aria-label="question3" name={`question3-${item.id}`}>
                                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                                <FormControlLabel value="no" control={<Radio />} label="No" />
                                                <FormControlLabel value="na" control={<Radio />} label="NA" />
                                            </RadioGroup>
                                        </td>
                                        <td>
                                            <RadioGroup row aria-label="question4" name={`question4-${item.id}`}>
                                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                                <FormControlLabel value="no" control={<Radio />} label="No" />
                                                <FormControlLabel value="na" control={<Radio />} label="NA" />
                                            </RadioGroup>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10]}
                            component="div"
                            count={itemsList.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default NFADetail;
