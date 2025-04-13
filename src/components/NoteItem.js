import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardActions from '@mui/joy/CardActions';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import { NotebookPen, Trash2 } from 'lucide-react';
import { useContext } from 'react';
import noteContext from '../context/notes/noteContext';

const NoteItem = (props) => {
    const context=useContext(noteContext)
    const {deleteNote}=context
    const { note } = props;
    const { title, description } = note;

    return (
        <div className='col-md-3'>
            <Card
                variant="outlined"
                sx={{
                    width: 320,
                    overflow: 'auto',
                    resize: 'vertical',
                    marginTop: 3,
                }}
            >
                <CardContent>
                    <Typography level="title-lg">{title}</Typography>
                    <Typography level="body-sm">
                        {description}
                    </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                    {/* Edit Button */}
                    <IconButton variant="soft" color="primary">
                        <NotebookPen/>
                    </IconButton>

                    {/* Delete Button */}
                    <IconButton variant="soft" color="danger" onClick={()=>{deleteNote(note._id)}}>
                        <Trash2/>
                    </IconButton>
                </CardActions>
            </Card>
        </div>
    );
};

export default NoteItem;
