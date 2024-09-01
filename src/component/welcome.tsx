import Box from "@mui/material/Box";
import Image from "next/image";
import Typography from "@mui/material/Typography";

const Welcome = () => {
    return (
        <Box height={'100%'} width={'100%'} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <Image src={"/images/Logo_Full.svg"} alt="Beasanz" height={'200'} width={'500'}/>
            <Typography variant='h5' margin={0} fontStyle={'italic'}>~ Admin Panel ~</Typography>
        </Box>
    );
}

export default Welcome;