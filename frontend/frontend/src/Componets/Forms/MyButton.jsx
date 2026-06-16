import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import '../../App.css'

export default function MyButtons(props) {
    const {label, type} = props
  return (
    
    
      
      <Button type={type} variant="contained" className='Myform'>
        {label}
        </Button>
      
   
  );
}
