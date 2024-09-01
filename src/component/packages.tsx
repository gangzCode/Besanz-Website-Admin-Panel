import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
    Collapse, Divider,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow
} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import CreatePackage from "@/component/models/create-package";
import {deletePackage, getAllPackages} from "@/service/package-service";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import {ExpandCircleDownOutlined, Visibility} from "@mui/icons-material";

const Packages = ({setShowLoading}: any) => {

    const [showCreateModel, setShowCreateModel] = useState<any>(false);
    const [showViewModel, setShowViewModel] = useState<any>(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const [packages, setPackages] = useState<any>([]);
    const [updateObj, setUpdateObj] = useState<any>(null);

    const createModalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60%',
        bgcolor: 'background.paper',
        borderRadius: 5,
        boxShadow: 24,
        p: 4,
    };

    // Table Helper Functions
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        if (showCreateModel == false)
            loadData();
    }, [showCreateModel]);

    const loadData = () => {
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

    const deletePackageBtn = (packageObj: any) => {
        Swal.fire({
            title: 'Confirm Delete',
            html: `<div><b>Are you sure to delete '` + packageObj.name + `'?</b></div><div>Existing bills will not be affected.</div>`,
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
                await deletePackage(packageObj);
                loadData();
            }
        });
    }

    return (
        <Box height={'100%'} width={'100%'} overflow={'auto'}>
            <Box p={2} maxHeight={'90%'}>
                <Box display={'flex'} alignItems={'center'} mb={1} px={1}>
                    <Typography sx={{flexGrow: 1}} variant='h5' margin={0}>Packages</Typography>
                    <Button sx={{display: 'block'}} variant="contained" color="primary" size="small"
                            onClick={() => {
                                setUpdateObj(null)
                                setTimeout(() => {
                                    setShowCreateModel(true)
                                });
                            }}>
                        Create Package
                    </Button>
                </Box>
                <Paper sx={{width: '100%', maxHeight: '100%', overflow: 'hidden'}}>
                    <TableContainer sx={{maxHeight: 'calc(100% - 50px)'}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell align={"center"}>Created At</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(packages.length > 0) ?
                                    packages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((packageRow: any) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={packageRow._id}>
                                                <TableCell>{packageRow.name}</TableCell>
                                                <TableCell>{packageRow.price}</TableCell>
                                                <TableCell
                                                    align={"center"}>{new Date(packageRow.created_date).toLocaleString()}
                                                </TableCell>
                                                <TableCell align={"center"}>
                                                    <IconButton size="small" color="primary"
                                                                onClick={() => {
                                                                    setUpdateObj(packageRow);
                                                                    setTimeout(() => {
                                                                        setShowViewModel(true)
                                                                    });
                                                                }}>
                                                        <Visibility fontSize="small"/>
                                                    </IconButton>
                                                    <IconButton size="small" sx={{ml: 2}}
                                                                onClick={() => {
                                                                    setUpdateObj(packageRow);
                                                                    setTimeout(() => {
                                                                        setShowCreateModel(true)
                                                                    });
                                                                }}>
                                                        <EditIcon fontSize="small"/>
                                                    </IconButton>
                                                    <IconButton
                                                                size="small" sx={{ml: 1}}
                                                                onClick={() => deletePackageBtn(packageRow)}>
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) :
                                    <TableRow hover role="checkbox" tabIndex={-1}>
                                        <TableCell colSpan={6} align={"center"}>
                                            <h2>No Packages Available</h2>
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={packages.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Box>
            <Modal open={showCreateModel}>
                <Box sx={createModalStyle}>
                    <CreatePackage setCreationModal={setShowCreateModel} setShowLoading={setShowLoading}
                                   updateObj={updateObj} />
                </Box>
            </Modal>
            <Modal open={showViewModel}>
                <Box sx={createModalStyle}>
                    <Box display='flex' fontSize={"x-large"} fontWeight={'bold'}>
                        {updateObj?.name} - $ {(Math.round(updateObj?.price * 100) / 100).toFixed(2)}
                    </Box>
                    <Box bgcolor={'whitesmoke'} borderRadius={3} mt={2} p={1} width='100%'
                         maxHeight='80vh' overflow='auto'>
                        {
                            updateObj?.features.map((feature: any, index: number) => (
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
                                                setUpdateObj({...updateObj});
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
                                        index <  updateObj.features.length - 1 &&
                                        <Divider sx={{pt: (feature.collapsed) ? 1 : 0}}/>
                                    }
                                </Box>
                            ))
                        }
                        { updateObj?.features.length == 0 &&
                            <Box display={'flex'} alignItems={'center'} justifyContent={'center'}
                                 fontWeight="bold" minHeight={'40vh'}>
                                No features available.
                            </Box>
                        }
                    </Box>
                    <Box width='100%' display='flex' justifyContent='center' mt={2}>
                        <Button sx={{display: 'block'}} variant="contained" color="primary" size="small"
                                onClick={() => {
                                    setShowViewModel(false);
                                }}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}

export default Packages;