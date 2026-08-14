import React, { useRef, useEffect, useState } from 'react';
import { Col, Row, Modal, Form, Button } from 'react-bootstrap';
import flatpickr from 'flatpickr';
import { usePage, useForm, router } from '@inertiajs/react';

const Section = ({ rightClickBtn, filters, zones }: any) => {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const dateRef = useRef<HTMLInputElement>(null);
    const [modal, setModal] = useState<boolean>(false);
    
    const { data, setData, post, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        contact: "",
        address: "",
        business_name: "",
        zone_id: "",
        area_id: "",
    });

    const toggle = () => {
        if (modal) {
            setModal(false);
            reset();
        } else {
            setModal(true);
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('clients.store'), {
            onSuccess: () => {
                setModal(false);
                reset();
            }
        });
    };

    useEffect(() => {
        if (dateRef.current) {
            const instance = flatpickr(dateRef.current, {
                mode: "range",
                dateFormat: "d M, Y",
                defaultDate: filters ? [filters.start_date, filters.end_date] : [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)],
                onChange: function(selectedDates, dateStr, instance) {
                    if (selectedDates.length === 2) {
                        const start = instance.formatDate(selectedDates[0], "Y-m-d");
                        const end = instance.formatDate(selectedDates[1], "Y-m-d");
                        router.get(window.location.pathname, { start_date: start, end_date: end }, { preserveState: true, replace: true });
                    }
                }
            });
            return () => {
                instance.destroy();
            };
        }
    }, [filters]);

    return (
        <React.Fragment>
            <Row className="mb-3 pb-1">
                <Col xs={12}>
                    <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                        <div className="flex-grow-1">
                            <h4 className="fs-16 mb-1">Good Morning, {user?.name || 'User'}!</h4>
                            <p className="text-muted mb-0">Here's what's happening with your business today.</p>
                        </div>
                        <div className="mt-3 mt-lg-0">
                            <form action="#">
                                <Row className="g-3 mb-0 align-items-center">
                                    <div className="col-sm-auto">
                                        <div className="input-group">
                                            <input
                                                ref={dateRef}
                                                className="form-control border-0 dash-filter-picker shadow"
                                                readOnly
                                            />
                                            <div className="input-group-text bg-primary border-primary text-white"><i className="ri-calendar-2-line"></i></div>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <button type="button" className="btn btn-soft-secondary" onClick={toggle}>
                                            <i className="ri-add-circle-line align-middle me-1"></i> Add Client
                                        </button>
                                    </div>
                                    <div className="col-auto">
                                        <button type="button" className="btn btn-soft-success btn-success waves-effect waves-light layout-rightside-btn" onClick={rightClickBtn} ><i className="ri-pulse-line"></i></button>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Add Client Modal */}
            <Modal show={modal} onHide={toggle} centered size="lg">
                <Modal.Header className="bg-light p-3" closeButton>
                    <h5 className="modal-title">Add Client</h5>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Full name" value={data.name} onChange={(e) => setData("name", e.target.value)} isInvalid={!!errors.name} />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="email" placeholder="Email" value={data.email} onChange={(e) => setData("email", e.target.value)} isInvalid={!!errors.email} />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="password" placeholder="Password" value={data.password} onChange={(e) => setData("password", e.target.value)} isInvalid={!!errors.password} />
                                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="password" placeholder="Confirm password" value={data.password_confirmation} onChange={(e) => setData("password_confirmation", e.target.value)} />
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Contact No.</Form.Label>
                                <Form.Control type="text" placeholder="Phone number" value={data.contact} onChange={(e) => setData("contact", e.target.value)} isInvalid={!!errors.contact} />
                                <Form.Control.Feedback type="invalid">{errors.contact}</Form.Control.Feedback>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Business Name</Form.Label>
                                <Form.Control type="text" placeholder="Business / company name" value={data.business_name} onChange={(e) => setData("business_name", e.target.value)} isInvalid={!!errors.business_name} />
                                <Form.Control.Feedback type="invalid">{errors.business_name}</Form.Control.Feedback>
                            </Col>
                            <Col md={12} className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="Street address" value={data.address} onChange={(e) => setData("address", e.target.value)} isInvalid={!!errors.address} />
                                <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Zone</Form.Label>
                                <Form.Select value={data.zone_id} onChange={(e) => { setData("zone_id", e.target.value); setData("area_id", ""); }} isInvalid={!!(errors as any).zone_id}>
                                    <option value="">— Select Zone —</option>
                                    {(zones || []).map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Area</Form.Label>
                                <Form.Select value={data.area_id} onChange={(e) => setData("area_id", e.target.value)} isInvalid={!!(errors as any).area_id} disabled={!data.zone_id}>
                                    <option value="">— Select Area —</option>
                                    {data.zone_id && (zones || []).find((z: any) => String(z.id) === String(data.zone_id))?.areas?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{(errors as any).area_id}</Form.Control.Feedback>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={toggle}>Close</Button>
                        <Button variant="success" type="submit">Add Client</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </React.Fragment>
    );
};

export default Section;