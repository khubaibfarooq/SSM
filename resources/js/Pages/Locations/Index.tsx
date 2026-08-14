import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Container, Row, Col, Card, Button, Modal, Form, Table } from "react-bootstrap";
import Layout from "../../Layouts";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LocationsIndex = ({ zones }: any) => {
    const [zoneModal, setZoneModal] = useState<boolean>(false);
    const [areaModal, setAreaModal] = useState<boolean>(false);
    const [isEditZone, setIsEditZone] = useState<boolean>(false);
    const [isEditArea, setIsEditArea] = useState<boolean>(false);
    const [currentZone, setCurrentZone] = useState<any>(null);
    const [currentArea, setCurrentArea] = useState<any>(null);

    const zoneForm = useForm({ name: "" });
    const areaForm = useForm({ name: "", zone_id: "" });

    // Zone Handlers
    const toggleZoneModal = () => {
        setZoneModal(!zoneModal);
        if (zoneModal) {
            zoneForm.reset();
            setCurrentZone(null);
            setIsEditZone(false);
        }
    };

    const handleEditZone = (zone: any) => {
        setCurrentZone(zone);
        setIsEditZone(true);
        zoneForm.setData({ name: zone.name });
        setZoneModal(true);
    };

    const submitZone = (e: any) => {
        e.preventDefault();
        if (isEditZone) {
            zoneForm.put(route('zones.update', currentZone.id), {
                onSuccess: () => { toggleZoneModal(); toast.success("Zone updated successfully"); }
            });
        } else {
            zoneForm.post(route('zones.store'), {
                onSuccess: () => { toggleZoneModal(); toast.success("Zone created successfully"); }
            });
        }
    };

    const deleteZone = (zone: any) => {
        if (window.confirm("Are you sure you want to delete this zone? All associated areas will be deleted.")) {
            zoneForm.delete(route('zones.destroy', zone.id), {
                onSuccess: () => toast.success("Zone deleted successfully")
            });
        }
    };

    // Area Handlers
    const toggleAreaModal = () => {
        setAreaModal(!areaModal);
        if (areaModal) {
            areaForm.reset();
            setCurrentArea(null);
            setIsEditArea(false);
        }
    };

    const handleEditArea = (area: any) => {
        setCurrentArea(area);
        setIsEditArea(true);
        areaForm.setData({ name: area.name, zone_id: area.zone_id });
        setAreaModal(true);
    };

    const submitArea = (e: any) => {
        e.preventDefault();
        if (isEditArea) {
            areaForm.put(route('areas.update', currentArea.id), {
                onSuccess: () => { toggleAreaModal(); toast.success("Area updated successfully"); }
            });
        } else {
            areaForm.post(route('areas.store'), {
                onSuccess: () => { toggleAreaModal(); toast.success("Area created successfully"); }
            });
        }
    };

    const deleteArea = (area: any) => {
        if (window.confirm("Are you sure you want to delete this area?")) {
            areaForm.delete(route('areas.destroy', area.id), {
                onSuccess: () => toast.success("Area deleted successfully")
            });
        }
    };

    return (
        <React.Fragment>
            <Head title="Locations | SSM" />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Locations Management" pageTitle="Admin" />
                    
                    <Row>
                        {/* Zones Column */}
                        <Col lg={6}>
                            <Card>
                                <Card.Header className="d-flex align-items-center">
                                    <h5 className="card-title mb-0 flex-grow-1">Zones</h5>
                                    <div>
                                        <Button variant="primary" size="sm" onClick={toggleZoneModal}>
                                            <i className="ri-add-line align-bottom me-1"></i> Add Zone
                                        </Button>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Table hover striped bordered className="align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Name</th>
                                                <th>Areas Count</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {zones.map((zone: any) => (
                                                <tr key={zone.id}>
                                                    <td>{zone.name}</td>
                                                    <td>{zone.areas?.length || 0}</td>
                                                    <td className="text-end">
                                                        <Button variant="soft-secondary" size="sm" className="me-2" onClick={() => handleEditZone(zone)}>
                                                            <i className="ri-pencil-fill"></i>
                                                        </Button>
                                                        <Button variant="soft-danger" size="sm" onClick={() => deleteZone(zone)}>
                                                            <i className="ri-delete-bin-fill"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {zones.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="text-center">No zones found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Areas Column */}
                        <Col lg={6}>
                            <Card>
                                <Card.Header className="d-flex align-items-center">
                                    <h5 className="card-title mb-0 flex-grow-1">Areas</h5>
                                    <div>
                                        <Button variant="primary" size="sm" onClick={toggleAreaModal}>
                                            <i className="ri-add-line align-bottom me-1"></i> Add Area
                                        </Button>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Table hover striped bordered className="align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Area Name</th>
                                                <th>Parent Zone</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {zones.flatMap((z: any) => z.areas || []).map((area: any) => {
                                                const parentZone = zones.find((z: any) => z.id === area.zone_id);
                                                return (
                                                    <tr key={area.id}>
                                                        <td>{area.name}</td>
                                                        <td><span className="badge bg-info-subtle text-info fs-12">{parentZone?.name}</span></td>
                                                        <td className="text-end">
                                                            <Button variant="soft-secondary" size="sm" className="me-2" onClick={() => handleEditArea(area)}>
                                                                <i className="ri-pencil-fill"></i>
                                                            </Button>
                                                            <Button variant="soft-danger" size="sm" onClick={() => deleteArea(area)}>
                                                                <i className="ri-delete-bin-fill"></i>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {zones.flatMap((z: any) => z.areas || []).length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="text-center">No areas found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Zone Modal */}
            <Modal show={zoneModal} onHide={toggleZoneModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditZone ? "Edit Zone" : "Add Zone"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={submitZone}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Zone Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter zone name"
                                value={zoneForm.data.name}
                                onChange={(e) => zoneForm.setData("name", e.target.value)}
                                isInvalid={!!zoneForm.errors.name}
                                required
                            />
                            <Form.Control.Feedback type="invalid">{zoneForm.errors.name}</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={toggleZoneModal}>Close</Button>
                        <Button variant="primary" type="submit" disabled={zoneForm.processing}>
                            {zoneForm.processing ? "Saving..." : "Save Zone"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Area Modal */}
            <Modal show={areaModal} onHide={toggleAreaModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditArea ? "Edit Area" : "Add Area"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={submitArea}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Area Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter area name"
                                value={areaForm.data.name}
                                onChange={(e) => areaForm.setData("name", e.target.value)}
                                isInvalid={!!areaForm.errors.name}
                                required
                            />
                            <Form.Control.Feedback type="invalid">{areaForm.errors.name}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Parent Zone</Form.Label>
                            <Form.Select
                                value={areaForm.data.zone_id}
                                onChange={(e) => areaForm.setData("zone_id", e.target.value)}
                                isInvalid={!!areaForm.errors.zone_id}
                                required
                            >
                                <option value="">Select a zone...</option>
                                {zones.map((zone: any) => (
                                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{areaForm.errors.zone_id}</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={toggleAreaModal}>Close</Button>
                        <Button variant="primary" type="submit" disabled={areaForm.processing}>
                            {areaForm.processing ? "Saving..." : "Save Area"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            
            <ToastContainer />
        </React.Fragment>
    );
};

LocationsIndex.layout = (page: any) => <Layout children={page} />;
export default LocationsIndex;
