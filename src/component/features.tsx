import Box from "@mui/material/Box";
import {Collapse, Divider, Modal} from "@mui/material";
import {ExpandCircleDownOutlined} from "@mui/icons-material";
import Checkbox from '@mui/material/Checkbox';
import {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import * as React from "react";
import {deleteFeature, getAllFeatures} from "@/service/feature-service";
import CreateFeature from "@/component/models/create-feature";
import IconButton from "@mui/material/IconButton";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from "sweetalert2";

const Features = ({setShowLoading}: any) => {

    const [showCreateModel, setShowCreateModel] = useState<any>(false);

    const [features, setFeatures] = useState<any>([]);
    const [parents, setParents] = useState<any>([]);
    const [updateObj, setUpdateObj] = useState<any>(null);

    const createModalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 5,
        boxShadow: 24,
        p: 4,
    };

    useEffect(() => {
        if (showCreateModel == false)
            loadData();
    }, [showCreateModel]);

    const loadData = () => {
        setShowLoading(true);
        setFeatures([]);
        setParents([]);
        getAllFeatures().then((response: any) => {
            setShowLoading(false);
            if (response && response?.status == 200 && response.data) {
                setFeatures(response.data);
                let tempParents = [];
                for (let feature of response.data) {
                    if (!feature.parent_id) {
                        tempParents.push({
                            _id: feature._id,
                            name: feature.name,
                        });
                    }
                }
                setParents(tempParents);
            }
        }).catch(() => {
            setShowLoading(false);
        });
    }

    const deleteFeatureBtn = (feature: any) => {
        Swal.fire({
            title: 'Confirm Delete',
            html: `
            <div><b>Are you sure to delete '` + feature.name + `'?</b></div>
            <div>` + ((feature.parent_id) ? "" : "</div><div><b>All children features will also be deleted!</b></div>") +
                `<div>Existing packages and bills will not be affected.</div>`,
            icon: 'error',
            heightAuto: false,
            showCancelButton: false,
            showDenyButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Cancel',
            denyButtonText: 'Delete',
            confirmButtonColor: '#6e7881',
        }).then(async (result) => {
            if (result.isDenied) {
                setShowLoading(true);
                await deleteFeature(feature);
                loadData();
            }
        });
    }

    return (
        <Box height={'100%'} width={'100%'} overflow={'auto'}>
            <Box p={2}>
                <Box display={'flex'} alignItems={'center'} mb={1} px={1}>
                    <Typography sx={{flexGrow: 1}} variant='h5' margin={0}>Features</Typography>
                    <Button sx={{display: 'block'}} variant="contained" color="primary" size="small"
                            onClick={() => {
                                setUpdateObj(null)
                                setTimeout(() => {
                                    setShowCreateModel(true)
                                });
                            }}>
                        Add Features
                    </Button>
                </Box>
                <Box bgcolor={'white'} borderRadius={3} p={2} pt={0}>
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
                                        }}
                                    />
                                    <Box pl={1}>{feature.name}</Box>
                                    <Box px={2}>-</Box>
                                    <Box>
                                        $ {(Math.round(feature.price * 100) / 100).toFixed(2)}
                                    </Box>
                                    <IconButton
                                                size="small" sx={{ml: 1}}
                                                onClick={() => {
                                                    setUpdateObj(feature);
                                                    setTimeout(() => {
                                                        setShowCreateModel(true)
                                                    });
                                                }}>
                                        <EditIcon fontSize="small"/>
                                    </IconButton>
                                    <IconButton
                                                size="small" sx={{ml: 1}} onClick={() => deleteFeatureBtn(feature)}>
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </Box>
                                <Collapse in={!feature.collapsed}>
                                    <Box ml={'52px'} pl={0} borderLeft={'1px solid #0003'}>
                                        {
                                            feature.children.map((child: any) => (
                                                <Box key={child._id} pb={1} display={'flex'} alignItems={'center'}>
                                                    <Box pl={2} height="1px" bgcolor="#0003"></Box>
                                                    <Checkbox
                                                        sx={{ml: 0, mr: 1}} checked={child.selected}
                                                        onChange={() => {
                                                            child.selected = !child.selected;
                                                            feature.selected = feature.children.every((child: any) => child.selected);
                                                            setFeatures([...features]);
                                                        }}
                                                    />
                                                    <Box>{child.name}</Box>
                                                    <Box px={2}>-</Box>
                                                    <Box fontWeight={'bold'}>
                                                        $ {(Math.round(child.price * 100) / 100).toFixed(2)}
                                                    </Box>
                                                    <IconButton size="small"
                                                                sx={{ml: 1}}
                                                                onClick={() => {
                                                                    setUpdateObj(child);
                                                                    setTimeout(() => {
                                                                        setShowCreateModel(true)
                                                                    });
                                                                }}>
                                                        <EditIcon fontSize="small"/>
                                                    </IconButton>
                                                    <IconButton
                                                                size="small" sx={{ml: 1}}
                                                                onClick={() => deleteFeatureBtn(child)}>
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </Box>
                                            ))
                                        }
                                    </Box>
                                </Collapse>
                                {
                                    index < features.length - 1 && <Divider sx={{pt: (feature.collapsed) ? 1 : 0}}/>
                                }
                            </Box>
                        ))
                    }
                    {
                        features.length == 0 &&
                        <Box textAlign={'center'} pt={2} fontWeight="bold">
                            No Features Available.
                        </Box>
                    }
                </Box>
            </Box>
            <Modal open={showCreateModel}>
                <Box sx={createModalStyle}>
                    <CreateFeature setCreationModal={setShowCreateModel} setShowLoading={setShowLoading}
                                   parentList={parents} updateObj={updateObj} />
                </Box>
            </Modal>
        </Box>
    );
}

export default Features;