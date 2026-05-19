import { Box, Tooltip } from '@mui/material'
import React from 'react'
import { FaUserLock } from 'react-icons/fa'

const EventQuoteSealed = () => {
  return (
<>
 <Tooltip  title="Response Locked">
<Box
  sx={{
    padding: 1,
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // horizontally center
    color: '#2A68D3', // icon color
    fontSize: 24 // optional: icon size
  }}
>
  
  <FaUserLock />
 
</Box>
 </Tooltip> 
</>
  )
}

export default EventQuoteSealed
