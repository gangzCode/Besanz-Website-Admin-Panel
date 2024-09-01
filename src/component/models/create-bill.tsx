import React, {useEffect, useState} from 'react';
import {
    Button,
    Collapse,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    Select,
    TextField
} from '@mui/material';
import {Field, Form, Formik} from 'formik';
import * as Yup from 'yup';
import Typography from "@mui/material/Typography";
import {getAllFeatures} from "@/service/feature-service";
import Box from "@mui/material/Box";
import {Delete, Download, ExpandCircleDownOutlined, Visibility} from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import {getAllPackages} from "@/service/package-service";
import MenuItem from "@mui/material/MenuItem";
import {createBill, downloadInvoicePdf, getPDFData, openInvoicePDF, updateBill} from "@/service/bill-service";
import IconButton from "@mui/material/IconButton";
import Swal from "sweetalert2";

const CreateBill = ({setCreationModal, setShowLoading, users, updateObj}: any) => {

    const [index, setIndex] = useState(0);
    const [total, setTotal] = useState(0);
    const [features, setFeatures] = useState<any>([]);
    const [filteredFeatures, setFilteredFeatures] = useState<any>([]);
    const [packages, setPackages] = useState<any>([]);

    const [pdfData, setPdfData] = useState<any>('');

    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        if (updateObj && updateObj._id) {
            if (updateObj.package_id && updateObj.package_id.trim() != "") {
                setIsCustom(false);
                setIndex(1);
                setTimeout(() => {
                    loadPackages();
                })
            } else {
                setIsCustom(true);
                setIndex(1);
                setTimeout(() => {
                    loadFeatures();
                })
            }
            if (updateObj.contain_invoice === true) {
                getPDFData(updateObj._id).then((response: any) => {
                    if (response.data && response.data.length > 0) {
                        setPdfData(response.data[0].data);
                    }
                });
            }
        }
    }, []);

    const loadFeatures = () => {
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
    }

    const loadPackages = () => {
        setShowLoading(true);
        setPackages([]);
        getAllPackages().then((response: any) => {
            setShowLoading(false);
            if (response && response?.status == 200 && response.data) {
                setPackages(response.data);
            }
        }).catch(() => {
            setShowLoading(false);
        });
    }

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
        if (isCustom) {
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
            setIndex(3);
        } else {
            let packageObj = packages.find((packageObj: any) => packageObj._id == values.package_id);
            values.name = packageObj.name;
            values.price = packageObj.price;
            setFilteredFeatures(packageObj.features);
            setIndex(2);
        }
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
            flag = await createBill({
                name: data.name,
                price: data.price,
                user_email: data.user_email,
                package_id: data.package_id,
                pdf_data: pdfData ? pdfData : null,
                features: cleanData
            });
        } else {
            flag = await updateBill({
                _id: updateObj._id,
                name: data.name,
                price: data.price,
                user_email: data.user_email,
                package_id: data.package_id,
                pdf_data: pdfData ? pdfData : null,
                features: cleanData
            });
        }
        setShowLoading(false);
        if (flag) {
            setCreationModal(false);
        }
        setShowLoading(false);
    };

    const validationSchema = Yup.object().shape({
        user_email: Yup.string().required('Required'),
        package_id: (!isCustom) ? Yup.string().required('Required') : Yup.string(),
        name: (isCustom) ? Yup.string().required('Required') : Yup.string(),
        price: (isCustom) ? Yup.number().required('Required').min(0.01) : Yup.number(),
    });

    return (
        <Formik
            initialValues={{
                user_email: updateObj ? updateObj.user_email : undefined,
                package_id: updateObj ? updateObj.package_id : undefined,
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
                                        {(updateObj && updateObj._id) ? 'Update' : 'Create'} Bill
                                        {(index != 0) ? (isCustom ? ' - Custom' : ' - From Package') : '' }
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

                            {(index != 0 && isCustom) &&
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
                                 maxHeight='80vh' overflow='auto' display='flex'>
                                <Box width={'50%'} pr={1} pt={2}>
                                    <Button fullWidth variant="contained" type='button' size='large'
                                            onClick={() => {
                                                resetForm();
                                                setIsCustom(true);
                                                loadFeatures();
                                                setIndex(1);
                                            }}>
                                        Custom Bill
                                    </Button>
                                </Box>
                                <Box width={'50%'} pl={1} pt={2}>
                                    <Button fullWidth variant="contained" type='button' size='large'
                                            onClick={() => {
                                                resetForm();
                                                setIsCustom(false);
                                                loadPackages();
                                                setIndex(1);
                                            }}>
                                        Package Bill
                                    </Button>
                                </Box>
                            </Box>
                        }
                        {(index == 1 && isCustom) &&
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
                        {(index == 1 && !isCustom) &&
                            <Box bgcolor={'whitesmoke'} borderRadius={3} p={2} pt={0} m={2} width='100%'
                                 maxHeight='80vh' overflow='auto' display='flex'>
                                <Box flexGrow={1} pr={1} pt={2}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="user_email">User</InputLabel>
                                        <Field
                                            as={Select}
                                            sx={{width: 1}}
                                            labelId="user_email"
                                            name="user_email"
                                            label="User"
                                            placeholder="Select Parent"
                                            error={errors.user_email && touched.user_email}
                                        >
                                            {users.map((user: any) => (
                                                <MenuItem key={user._id} value={user.email}>{user.name}</MenuItem>
                                            ))}
                                        </Field>
                                        {(errors.user_email && touched.user_email) &&
                                            <FormHelperText sx={{mx: 2, color: '#d32f2f'}}>
                                                {errors.user_email.toString()}
                                            </FormHelperText>
                                        }
                                    </FormControl>
                                </Box>
                                <Box flexGrow={1} pl={1} pt={2}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="package_id">Package</InputLabel>
                                        <Field
                                            as={Select}
                                            sx={{width: 1}}
                                            labelId="package_id"
                                            name="package_id"
                                            label="Package"
                                            placeholder="Select Parent"
                                            error={errors.package_id && touched.package_id}
                                        >
                                            {packages.map((packageObj: any) => (
                                                <MenuItem key={packageObj._id} value={packageObj._id}>
                                                    {packageObj.name + ' - $' +
                                                        (Math.round(packageObj.price * 100) / 100).toFixed(2)}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                        {(errors.package_id && touched.package_id) &&
                                            <FormHelperText sx={{mx: 2, color: '#d32f2f'}}>
                                                {errors.package_id.toString()}
                                            </FormHelperText>
                                        }
                                    </FormControl>
                                </Box>
                            </Box>
                        }


                        {(index == 2 && isCustom) &&
                            <Box bgcolor={'whitesmoke'} borderRadius={3} p={2} pt={0} m={2} width='100%'
                                 maxHeight='80vh' overflow='auto' display='flex'>
                                <Box flexGrow={1} pr={2} pt={2}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="user_email">User</InputLabel>
                                        <Field
                                            as={Select}
                                            sx={{width: 1}}
                                            labelId="user_email"
                                            name="user_email"
                                            label="User"
                                            placeholder="Select Parent"
                                            error={errors.user_email && touched.user_email}
                                        >
                                            {users.map((user: any) => (
                                                <MenuItem key={user._id} value={user.email}>{user.name}</MenuItem>
                                            ))}
                                        </Field>
                                        {(errors.user_email && touched.user_email) &&
                                            <FormHelperText sx={{mx: 2, color: '#d32f2f'}}>
                                                {errors.user_email.toString()}
                                            </FormHelperText>
                                        }
                                    </FormControl>
                                </Box>
                                <Box flexGrow={1} pr={1} pt={2}>
                                    <Field
                                        as={TextField}
                                        sx={{width: 1}}
                                        name="name"
                                        label="Package Name"
                                        error={errors.name && touched.name}
                                        helperText={errors.name && touched.name ? errors.name : ''}
                                    />
                                </Box>
                                <Box flexGrow={0} pl={1} pt={2}>
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
                        {((isCustom && (index == 3)) || (!isCustom && (index == 2))) &&
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
                                <Box display='flex' px={2} mx={2} mb={2} width='100%' fontSize={"large"}
                                     alignItems="center">
                                    Upload Invoice :
                                    <Button variant="contained" type='button' size={'small'} sx={{ml: 2}}
                                            onClick={() => {
                                                document.getElementById('upload-doc')?.click();
                                            }}>
                                        {(pdfData) ? 'Replace' : 'Upload'}
                                    </Button>
                                    <input id='upload-doc' type="file" style={{display: "none"}}
                                           accept="application/pdf"
                                           onChange={(e: any) => {
                                               setPdfData('');
                                               let file = e.target.files[0];
                                               if (file && file.type == "application/pdf") {
                                                   let reader = new FileReader();
                                                   reader.onload = (e: any) => {
                                                       let data = e.target.result;
                                                       setPdfData(data);
                                                   }
                                                   reader.readAsDataURL(file);
                                               } else if (file) {
                                                   Swal.fire({
                                                       title: 'Invalid File!',
                                                       text: 'Only PDF files are supported!',
                                                       icon: 'error',
                                                       heightAuto: false,
                                                       confirmButtonText: 'OK'
                                                   });
                                               }
                                               e.target.value = "";
                                           }}
                                    />
                                    { (pdfData) ?
                                        <Box ml={2}>
                                            {values.name + '_invoice.pdf'}
                                            <IconButton size="small" sx={{ml: 2}} color={"primary"}
                                                        onClick={() => {
                                                            openInvoicePDF(pdfData);
                                                        }}>
                                                <Visibility fontSize="small"/>
                                            </IconButton>
                                            <IconButton size="small" sx={{ml: 1}} color={"primary"}
                                                        onClick={() => {
                                                            downloadInvoicePdf(pdfData, values.name + '_invoice.pdf');
                                                        }}>
                                                <Download fontSize="small"/>
                                            </IconButton>
                                            <IconButton size="small" sx={{ml: 1}} color={"error"}
                                                        onClick={() => {
                                                            setPdfData('');
                                                        }}>
                                                <Delete fontSize="small"/>
                                            </IconButton>
                                        </Box>
                                        :
                                        <Box ml={2} fontSize={"medium"} color={'red'}>
                                            No Invoice Selected
                                        </Box>
                                    }
                                </Box>
                            </>
                        }
                        <Box display='flex' width={'100%'} mx={2}>
                            <Box flexGrow={1} textAlign='left'>
                                {(index > 1 || (index == 1 && !updateObj?._id)) &&
                                    <Button variant="outlined" type='button' onClick={() => setIndex((index - 1))}>
                                        BACK
                                    </Button>
                                }
                            </Box>
                            <Box flexGrow={1} textAlign='right'>
                                {(isCustom && (index == 1)) &&
                                    <Button variant="contained" type='button' onClick={() => setIndex((index + 1))}>
                                        NEXT
                                    </Button>
                                }
                                {((!isCustom && (index == 1)) || (isCustom && (index == 2))) &&
                                    <Button variant="contained" type='submit'>
                                        NEXT
                                    </Button>
                                }
                                {((!isCustom && (index == 2)) || (isCustom && (index == 3))) &&
                                    <Button variant="contained" type='button' onClick={() => savePackage(values)}>
                                       {(updateObj && updateObj._id) ? 'Update' : 'Save'} Bill
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

export default CreateBill;
