import { styled, Tooltip, tooltipClasses } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";

const WhiteTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#FFF',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 600,
    minWidth:400,
    minWidth:300,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    cursor:'pointer',
   
  },
}));

export default WhiteTooltip;