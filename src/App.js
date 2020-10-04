import React from 'react';
import {
    Button,
    TextField,
    Paper,
    Chip,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Modal,
} from '@material-ui/core';

const api = window.localStorage; // :)
const serverDelay = 100;

const getNotes = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(JSON.parse(api.getItem('notes'))), serverDelay);
    });
};

const saveNotes = (notes) => {
    api.setItem('notes', JSON.stringify(notes));
    return new Promise((resolve) => {
        setTimeout(() => resolve({ status: 'ok' }), serverDelay);
    });
};

const App = () => {
    const [notes, setNotes] = React.useState([]);
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [search, setSearch] = React.useState(new RegExp(''));
    const [tags, setTags] = React.useState([]);

    const updateNotes = ({ status }) => {
        if (status === 'ok') {
            getNotes().then((res) => {
                Array.isArray(res) && setNotes(res);
            });
        }
    };

    React.useEffect(() => {
        updateNotes({ status: 'ok' });
    }, []);

    const handleModalOpen = (note) => () => {
        setModalOpen(note);
    };

    const handleSearch = (event) => {
        setSearch(new RegExp(event.target.value, 'i'));
    };

    const handleTagDelete = (tag) => () => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handlePin = (note) => () => {
        const updatedNotes = notes.filter(({ id }) => id !== note.id);
        const index = note.pinned ? updatedNotes.findIndex(({ pinned }) => pinned !== true) : 0;
        updatedNotes.splice(index, 0, { ...note, pinned: !note.pinned });
        saveNotes(updatedNotes).then(updateNotes);
    };

    const handleTagClick = (tag) => () => {
        if (!tags.find((t) => t === tag)) setTags([tag, ...tags]);
    };

    const handleDelete = (note) => () => {
        const updatedNotes = notes.filter(({ id }) => id !== note.id);
        saveNotes(updatedNotes).then(updateNotes);
    };

    const handleModalEdit = (field) => (event) => {
        setModalOpen({ ...isModalOpen, [field]: event.target.value });
    };

    const handleModalClose = () => {
        const updatedNotes = notes.filter(({ id }) => id !== isModalOpen.id);
        const index = updatedNotes.findIndex(({ pinned }) => pinned !== true);
        updatedNotes.splice(index > -1 ? index : 0, 0, isModalOpen);
        saveNotes(updatedNotes).then(updateNotes);
        setModalOpen(false);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ width: '100%' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: '0 20px',
                    }}>
                    <h3>notes</h3>
                    <Button
                        variant={'outlined'}
                        size={'small'}
                        onClick={handleModalOpen({ id: new Date().getTime(), tags: '', text: '' })}>
                        create
                    </Button>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: '0 20px',
                    }}>
                    <TextField label={'Search'} size={'small'} onChange={handleSearch} />
                    <Paper component="div" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
                        {tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                onDelete={handleTagDelete(tag)}
                                size={'small'}
                                style={{
                                    margin: '5px',
                                }}
                            />
                        ))}
                    </Paper>
                </div>
                <List dense={true}>
                    {notes.reduce((filtered, note) => {
                        if (!search.test(note.text)) return filtered;
                        const noteTags = note.tags.length ? note.tags.split(' ') : [];
                        if (tags.length && !tags.some((tag) => noteTags.includes(tag))) {
                            return filtered;
                        }
                        filtered.push(
                            <ListItem key={note.id}>
                                <ListItemAvatar>
                                    <Avatar
                                        onClick={handlePin(note)}
                                        style={{
                                            cursor: 'pointer',
                                            background: note.pinned ? 'black' : 'darkgrey',
                                        }}>
                                        pin
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={note.text}
                                    onClick={handleModalOpen(note)}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        marginRight: '20px',
                                    }}
                                />
                                <ListItemSecondaryAction
                                    style={{
                                        display: 'flex',
                                    }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}>
                                        {noteTags.map((tag) => (
                                            <Chip
                                                key={tag}
                                                size={'small'}
                                                style={{
                                                    margin: '1px',
                                                }}
                                                label={tag}
                                                onClick={handleTagClick(tag)}
                                            />
                                        ))}
                                    </div>
                                    <IconButton onClick={handleDelete(note)} edge={'end'}>
                                        del
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        );
                        return filtered;
                    }, [])}
                </List>
            </div>
            <Modal
                open={!!isModalOpen}
                onClose={handleModalClose}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        background: 'gray',
                        padding: '10px',
                        border: '1px solid black',
                    }}>
                    <TextField
                        label={'Tags'}
                        placeholder={'work hobby important ...'}
                        margin={'normal'}
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant={'outlined'}
                        defaultValue={isModalOpen.tags}
                        onChange={handleModalEdit('tags')}
                    />
                    <TextField
                        label={'Note'}
                        multiline
                        rows={4}
                        fullWidth
                        variant={'outlined'}
                        defaultValue={isModalOpen.text}
                        onChange={handleModalEdit('text')}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default App;
