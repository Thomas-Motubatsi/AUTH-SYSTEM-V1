import Box from '@mui/material/Box'

const Message = ({text})=>{
    return(
        <box sx={{backgroundColor:'#69CAB', color:'#FFFFFF', with:'90%', height:'40px', position:'absolute', top:'20px'}}>
            {text}
        </box>
    )
}

export default Message