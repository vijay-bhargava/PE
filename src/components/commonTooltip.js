import { styled, Tooltip, tooltipClasses } from "@mui/material";

const CommonTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: '12px',
    maxWidth: '500px',
    backgroundColor: 'common.black',
    '& .MuiTooltip-arrow': {
      display: 'none',
    },
  },
}));

export default CommonTooltip;
