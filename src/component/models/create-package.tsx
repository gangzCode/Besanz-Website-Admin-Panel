import React, {useEffect, useState} from 'react';
import {Button, Collapse, Divider, Grid, TextField} from '@mui/material';
import {Field, Form, Formik} from 'formik';
import * as Yup from 'yup';
import Typography from "@mui/material/Typography";
import {getAllFeatures} from "@/service/feature-service";
import Box from "@mui/material/Box";
import {ExpandCircleDownOutlined} from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import {createPackage, updatePackage} from "@/service/package-service";

const CreatePackage = ({setCreationModal, setShowLoading, updateObj}: any) => {

    const [index, setIndex] = useState(0);
    const [total, setTotal] = useState(0);
    const [features, setFeatures] = useState<any>([]);
    const [filteredFeatures, setFilteredFeatures] = useState<any>([]);

    useEffect(() => {
        setShowLoading(true);
        setFeatures([]);
        getAllFeatures().then((response: any) => {
            setShowLoading(false);
            if (response && response?.status == 200 && response.data) {
                let tempFeatures = response.data;
                let tot = 0;
                if (updateObj && updateObj._id) {
                    for (let feature of tempFeatures) {
                        for (let selectedFeature of updateObj.features) {
                            if (feature._id == selectedFeature._id) {
                                let allChildrenSelected = true;
                                for (let child of feature.children) {
                                    for (let selectedChild of selectedFeature.children) {
                                        if (child._id == selectedChild._id) {
                                            child.selected = true;
                                        }
                                    }
                                    if (!child.selected) {
                                        allChildrenSelected = false;
                                    }
                                }
                                if (allChildrenSelected) {
                                    feature.selected = true;
                                    tot += feature.price;
                                } else {
                                    for (let child of feature.children) {
                                        if (child.selected) {
                                            tot += child.price;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    setFeatures(tempFeatures);
                    setTotal(tot);
                } else {
                    setFeatures(tempFeatures);
                }
            }
        }).catch(() => {
            setShowLoading(false);
        });
    }, []);

    const calcTotal = () => {
        let tot = 0;
        for (let feature of features) {
            if (feature.selected) {
                tot += feature.price;
            } else {
                for (let child of feature.children) {
                    if (child.selected) {
                        tot += child.price;
                    }
                }
            }
        }
        setTotal(tot);
    };

    const handleSubmit = async (values: any) => {
        let filtered = [];
        for (let feature of features) {
            if (feature.selected) {
                filtered.push(feature);
            } else {
                let children = [];
                for (let child of feature.children) {
                    if (child.selected) {
                        children.push(child);
                    }
                }
                if (children.length > 0) {
                    let tempFeature = {...feature};
                    tempFeature.children = children;
                    filtered.push(tempFeature);
                }
            }
        }
        setFilteredFeatures(filtered);
        setIndex(2);
    };

    const savePackage = async (data: any) => {
        setShowLoading(true);
        let cleanData = [];
        for (let feature of filteredFeatures) {
            let tempFeature = {...feature};
            delete tempFeature.price;
            delete tempFeature.selected;
            delete tempFeature.collapsed;
            tempFeature.children = tempFeature.children.map((child: any) => {
                let tempChild = {...child};
                delete tempChild.price;
                delete tempChild.parent_id;
                delete tempChild.selected;
                delete tempChild.collapsed;
                return tempChild;
            });
            cleanData.push(tempFeature);
        }
        let flag;
        if (!updateObj || !updateObj._id) {
            flag = await createPackage({name: data.name, price: data.price, features: cleanData});
        } else {
            flag = await updatePackage({_id: updateObj._id, name: data.name, price: data.price, features: cleanData});
        }
        setShowLoading(false);
        if (flag) {
            setCreationModal(false);
        }
        setShowLoading(false);
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Required'),
        price: Yup.number().required('Required').min(0.01),
    });

    return (
        <Formik
            initialValues={{
                name: updateObj ? updateObj.name : undefined,
                price: updateObj ? updateObj.price : total,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({errors, touched, resetForm, setFieldValue, values}) => (
                <Form>
                    <Grid container sx={{padding: 2, pb: 0}}>
                        <Grid item xs={12}>
                            <Box display='flex' width={'100%'}>
                                <Box flexGrow={1} textAlign={'left'}>
                                    <Typography id="modal-modal-title" variant="h6" component="h2">
                                        {(updateObj && updateObj._id) ? 'Update' : 'Create'} Package
                                    </Typography>
                                </Box>
                                <Box flexGrow={1} textAlign={'right'}>
                                    <Button type="button" variant="outlined" color="error" size="small"
                                            onClick={() => {
                                                resetForm();
                                                setCreationModal(false);
                                            }}
                                    >Cancel</Button>
                                </Box>
                            </Box>

                            {(index != 2) &&
                                <Box display='flex' width={'100%'} mt={1}>
                                    <Box flexGrow={1} textAlign={'left'} sx={{fontWeight: "bold"}}>
                                        Select Features
                                    </Box>
                                    <Box flexGrow={1} textAlign={'right'}>
                                        Selected Feature Total
                                        : <strong>$ {(Math.round(total * 100) / 100).toFixed(2)}</strong>
                                    </Box>
                                </Box>
                            }
                        </Grid>
                        {(index == 0) &&
                            <Box bgcolor={'whitesmoke'} borderRadius={3} p={2} pt={0} m={2} width='100%'
                                 maxHeight='80vh' overflow='auto'>
                                {
                                    features.map((feature: any, index: number) => (
                                        <Box key={feature._id}>
                                            <Box fontWeight={'bold'} pt={1} display={'flex'} alignItems={'center'}>
                                                <ExpandCircleDownOutlined
                                                    sx={{
                                                        transition: "transform 0.2s linear",
                                                        transform: feature.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                        visibility: feature.children.length > 0 ? 'visible' : 'hidden'
                                                    }}
                                                    onClick={() => {
                                                        feature.collapsed = !feature.collapsed;
                                                        setFeatures([...features]);
                                                    }}
                                                >
                                                </ExpandCircleDownOutlined>
                                                <Checkbox
                                                    sx={{ml: 1}} checked={feature.selected}
                                                    indeterminate={feature.children.some((child: any) => child.selected) && !feature.selected}
                                                    onChange={() => {
                                                        feature.selected = !feature.selected;
                                                        for (let child of feature.children) {
                                                            child.selected = feature.selected;
                                                        }
                                                        setFeatures([...features]);
                                                        setTimeout(() => {
                                                            calcTotal();
                                                        });
                                                    }}
                                                />
                                                <Box pl={1}>{feature.name}</Box>
                                                <Box px={2}>-</Box>
                                                <Box>
                                                    $ {(Math.round(feature.price * 100) / 100).toFixed(2)}
                                                </Box>
                                            </Box>
                                            <Collapse in={!feature.collapsed}>
                                                <Box ml={'52px'} pl={0} borderLeft={'1px solid #0003'}>
                                                    {
                                                        feature.children.map((child: any) => (
                                                            <Box key={child._id} pb={1} display={'flex'}
                                                                 alignItems={'center'}>
                                                                <Box pl={2} height="1px" bgcolor="#0003"></Box>
                                                                <Checkbox
                                                                    sx={{ml: 0, mr: 1}} checked={child.selected}
                                                                    onChange={() => {
                                                                        child.selected = !child.selected;
                                                                        feature.selected = feature.children.every((child: any) => child.selected);
                                                                        setFeatures([...features]);
                                                                        setTimeout(() => {
                                                                            calcTotal();
                                                                        });
                                                                    }}
                                                                />
                                                                <Box>{child.name}</Box>
                                                                <Box px={2}>-</Box>
                                                                <Box fontWeight={'bold'}>
                                                                    $ {(Math.round(child.price * 100) / 100).toFixed(2)}
                                                                </Box>
                                                            </Box>
                                                        ))
                                                    }
                                                </Box>
                                            </Collapse>
                                            {
                                                index < features.length - 1 &&
                                                <Divider sx={{pt: (feature.collapsed) ? 1 : 0}}/>
                                            }
                                        </Box>
                                    ))
                                }
                                {
                                    features.length == 0 &&
                                    <Box display={'flex'} alignItems={'center'} justifyContent={'center'}
                                         fontWeight="bold" minHeight={'40vh'}>
                                        No features available.
                                    </Box>
                                }
                            </Box>
                        }
                        {(index == 1) &&
                            <Box bgcolor={'whitesmoke'} borderRadius={3} p={2} pt={0} m={2} width='100%'
                                 maxHeight='80vh' overflow='auto' display='flex'>
                                <Box width={'50%'} pr={1} pt={2}>
                                    <Field
                                        as={TextField}
                                        sx={{width: 1}}
                                        name="name"
                                        label="Package Name"
                                        error={errors.name && touched.name}
                                        helperText={errors.name && touched.name ? errors.name : ''}
                                    />
                                </Box>
                                <Box width={'50%'} pl={1} pt={2}>
                                    <Field
                                        as={TextField}
                                        sx={{width: 1}}
                                        name="price"
                                        label={"Final Price"}
                                        error={errors.price && touched.price}
                                        helperText={errors.price && touched.price ? errors.price : ''}
                                    />
                                </Box>
                            </Box>
                        }
                        {(index == 2) &&
                            <>
                                <Box display='flex' px={2} m={2} width='100%' fontSize={"x-large"} fontWeight={'bold'}>
                                    {values?.name} - $ {(Math.round(values?.price * 100) / 100).toFixed(2)}
                                </Box>
                                <Box bgcolor={'whitesmoke'} borderRadius={3} p={2} pt={0} m={2} mt={1} width='100%'
                                     maxHeight='80vh' overflow='auto'>
                                    {
                                        filteredFeatures.map((feature: any, index: number) => (
                                            <Box key={feature._id}>
                                                <Box fontWeight={'bold'} pt={1} display={'flex'} alignItems={'center'}>
                                                    <ExpandCircleDownOutlined
                                                        sx={{
                                                            transition: "transform 0.2s linear",
                                                            transform: feature.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                            visibility: feature.children.length > 0 ? 'visible' : 'hidden'
                                                        }}
                                                        onClick={() => {
                                                            feature.collapsed = !feature.collapsed;
                                                            setFilteredFeatures([...filteredFeatures]);
                                                        }}
                                                    >
                                                    </ExpandCircleDownOutlined>
                                                    <Box pl={1}>{feature.name}</Box>
                                                </Box>
                                                <Collapse in={!feature.collapsed}>
                                                    <Box ml={'52px'} pl={0} borderLeft={'1px solid #0003'}>
                                                        {
                                                            feature.children.map((child: any) => (
                                                                <Box key={child._id} py={1} display={'flex'}
                                                                     alignItems={'center'}>
                                                                    <Box pl={2} height="1px" bgcolor="#0003"></Box>
                                                                    <Box pl={1}>{child.name}</Box>
                                                                </Box>
                                                            ))
                                                        }
                                                    </Box>
                                                </Collapse>
                                                {
                                                    index < filteredFeatures.length - 1 &&
                                                    <Divider sx={{pt: (feature.collapsed) ? 1 : 0}}/>
                                                }
                                            </Box>
                                        ))
                                    }
                                    {filteredFeatures.length == 0 &&
                                        <Box display={'flex'} alignItems={'center'} justifyContent={'center'}
                                             fontWeight="bold" minHeight={'40vh'}>
                                            No features available.
                                        </Box>
                                    }
                                </Box>
                            </>
                        }
                        <Box display='flex' width={'100%'} mx={2}>
                            <Box flexGrow={1} textAlign='left'>
                                {(index != 0) &&
                                    <Button variant="outlined" type='button' onClick={() => setIndex((index - 1))}>
                                        BACK
                                    </Button>
                                }
                            </Box>
                            <Box flexGrow={1} textAlign='right'>
                                {(index == 0) &&
                                    <Button variant="contained" type='button'
                                            onClick={async () => {
                                                if (!updateObj || !updateObj._id) {
                                                    await setFieldValue('price', total);
                                                }
                                                setIndex(1);
                                            }}
                                    >
                                        NEXT
                                    </Button>
                                }
                                {(index == 1) &&
                                    <Button variant="contained" type='submit'>
                                        NEXT
                                    </Button>
                                }
                                {(index == 2) &&
                                    <Button variant="contained" type='button' onClick={() => savePackage(values)}>
                                        {(updateObj && updateObj._id) ? 'Update' : 'Save'} Package
                                    </Button>
                                }
                            </Box>
                        </Box>
                    </Grid>
                </Form>
            )}
        </Formik>
    );
};

export default CreatePackage;
