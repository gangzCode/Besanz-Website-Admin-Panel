import React from 'react';
import {TextField, Button, Grid} from '@mui/material';
import {Formik, Form, Field} from 'formik';
import * as Yup from 'yup';
import Typography from "@mui/material/Typography";
import {createUser} from "@/service/user-service";

const CreateUser = ({ setUserCreationModal, setShowLoading }:any) => {

    const handleSubmit = async (values: any) => {
        //setUserCreationModal(false);
        setShowLoading(true);
        let data = await createUser(values);
        setShowLoading(false);
        if (data) {
            setUserCreationModal(false);
        }
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Required'),
        givenName: Yup.string().required('Required'),
        surname: Yup.string().required('Required'),
    });

    return (
        <Formik
            initialValues={{
                email: '',
                givenName: '',
                surname: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({errors, touched, resetForm}) => (
                <Form>
                    <Grid container spacing={2} sx={{padding: 2}}>
                        <Grid item xs={8}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Create User
                            </Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="right">
                            <Button type="button" variant="outlined" color="error" size="small"
                                    onClick={() => {
                                        resetForm();
                                        setUserCreationModal(false);
                                    }}
                            >Cancel</Button>
                        </Grid>
                        <Grid item xs={12} marginTop="20px">
                            <Field
                                as={TextField}
                                sx={{width: 1}}
                                name="email"
                                label="Email"
                                error={errors.email && touched.email}
                                helperText={errors.email && touched.email ? errors.email : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                sx={{width: 1}}
                                name="givenName"
                                label="Given Name"
                                error={errors.givenName && touched.givenName}
                                helperText={errors.givenName && touched.givenName ? errors.givenName : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                sx={{width: 1}}
                                name="surname"
                                label="Surname"
                                error={errors.surname && touched.surname}
                                helperText={errors.surname && touched.surname ? errors.surname : ''}
                            />
                        </Grid>
                        <Grid item xs={12} textAlign="center" marginTop="20px">
                            <Button type="submit" variant="contained">Create User</Button>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    );
};

export default CreateUser;
