import React, {useState} from 'react';
import {
    TextField,
    Button,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Select,
    FormHelperText,
    InputLabel, FormControl
} from '@mui/material';
import {Formik, Form, Field} from 'formik';
import * as Yup from 'yup';
import Typography from "@mui/material/Typography";
import {createFeature, updateFeature} from "@/service/feature-service";
import MenuItem from "@mui/material/MenuItem";

const CreateFeature = ({setCreationModal, setShowLoading, parentList, updateObj}: any) => {

    const [view, setView] = useState((updateObj && updateObj.parent_id) ? 'child' : 'parent');

    const handleSubmit = async (values: any) => {
        setShowLoading(true);
        let data;
        if (!updateObj) {
            data = await createFeature(values);
        } else {
            data = await updateFeature({_id: updateObj._id, ...values});
        }
        setShowLoading(false);
        if (data) {
            setCreationModal(false);
        }
    };

    const validationSchema = Yup.object().shape({
        parent_id: (view == 'child') ? Yup.string().required('Required') : Yup.string(),
        name: Yup.string().required('Required'),
        price: Yup.number().required('Required').min(0.01),
    });

    return (
        <Formik
            initialValues={{
                parent_id: updateObj ? updateObj.parent_id : undefined,
                name: updateObj ? updateObj.name : undefined,
                price: updateObj ? updateObj.price : undefined,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({errors, touched, resetForm}) => (
                <Form>
                    <Grid container spacing={2} sx={{padding: 2}}>
                        <Grid item xs={8}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Create Feature
                            </Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                            <Button type="button" variant="outlined" color="error" size="small"
                                    onClick={() => {
                                        resetForm();
                                        setCreationModal(false);
                                    }}
                            >Cancel</Button>
                        </Grid>
                        <Grid item xs={12} marginTop="20px" textAlign={'center'}>
                            <ToggleButtonGroup
                                orientation="horizontal"
                                color="primary"
                                value={view}
                                exclusive
                                onChange={(_event: any, nextView: string) => setView(nextView)}
                                disabled={!!updateObj}
                            >
                                <ToggleButton value="parent" aria-label="list">
                                    Parent Item
                                </ToggleButton>
                                <ToggleButton value="child" aria-label="module">
                                    Child Item
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>
                        {(view == 'child') &&
                            <Grid item xs={12} marginTop="20px">
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="parent_id">Parent</InputLabel>
                                    <Field
                                        as={Select}
                                        sx={{width: 1}}
                                        labelId="parent_id"
                                        name="parent_id"
                                        label="Parent"
                                        placeholder="Select Parent"
                                        error={errors.parent_id && touched.parent_id}
                                    >
                                        {parentList.map((parent: any) => (
                                            <MenuItem key={parent._id} value={parent._id}>{parent.name}</MenuItem>
                                        ))}
                                    </Field>
                                    {(errors.parent_id && touched.parent_id) &&
                                        <FormHelperText sx={{mx: 2, color: '#d32f2f'}}>
                                            {errors.parent_id.toString()}
                                        </FormHelperText>
                                    }
                                </FormControl>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                sx={{width: 1}}
                                name="name"
                                label="Feature Name"
                                error={errors.name && touched.name}
                                helperText={errors.name && touched.name ? errors.name : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                sx={{width: 1}}
                                name="price"
                                label={(view == 'child') ? "Price" : "Combined Price"}
                                error={errors.price && touched.price}
                                helperText={errors.price && touched.price ? errors.price : ''}
                            />
                        </Grid>
                        <Grid item xs={12} textAlign="center" marginTop="20px">
                            <Button type="submit" variant="contained">
                                {!updateObj ? 'Create' : 'Update'} Feature
                            </Button>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    );
};

export default CreateFeature;
