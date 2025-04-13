import React, {Fragment} from 'react'
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/joy/Box';
import Alert from '@mui/joy/Alert';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import { ThumbsUp } from 'lucide-react';
const AlertBox = (props) => {
  const {message}=props
  return (
    <div>
        {/* This is delete alert */}
        <Box sx={{ display: 'flex', gap: 2, width: '100%', flexDirection: 'column' }}>
      <Alert
        startDecorator={<ThumbsUp />}
        variant="soft"
        color="success"
        endDecorator={
          <Fragment>
            <Button variant="soft" color="success" sx={{ mr: 1 }}>
              Undo
            </Button>
            <IconButton variant="soft" size="sm" color="danger">
              <CloseIcon />
            </IconButton>
          </Fragment>
        }
      >
        {message}
      </Alert>
      </Box>
    </div>
  )
}

export default AlertBox