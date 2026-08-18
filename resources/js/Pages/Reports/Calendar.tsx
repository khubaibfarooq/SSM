import React, { useState, useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Layout from '../../Layouts';
import { Card, Col, Container, Row, Modal, Table, Badge, Form, Button } from 'react-bootstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import BootstrapTheme from '@fullcalendar/bootstrap';
import axios from 'axios';

const ReportsCalendar = ({ clients, staff }: any) => {
    const { auth } = usePage().props as any;
    const userRoles = auth?.roles || [];
    const canSchedule = userRoles.includes('Manager') || userRoles.includes('manager') || userRoles.includes('admin') || userRoles.includes('superadmin');

    const canApproveVisit = (visit: any) => {
        const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
        const isManager = userRoles.includes('Manager') || userRoles.includes('manager');
        
        if (isAdmin) return true;
        if (isManager && visit.by_user_id !== auth?.user?.id) return true;
        
        return false;
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    
    const [filters, setFilters] = useState({
        client_id: '',
        staff_id: '',
        status: ''
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        by_user_id: '',
        date: '',
        next_date: '',
        description: '',
    });

    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [visitToComplete, setVisitToComplete] = useState<any>(null);

    const { data: completeData, setData: setCompleteData, patch: patchComplete, post: postComplete, processing: processingComplete, errors: completeErrors, reset: resetComplete, transform: transformComplete } = useForm({
        status: 'completed',
        next_date: '',
        description: '',
        user_id: '',
        by_user_id: '',
        date: '',
        completed_followup_id: '',
    });

    transformComplete((data) => {
        let finalDescription = visitToComplete?.description || '';
        if (data.description) {
            const userName = auth?.user?.name || 'User';
            const newEntry = `${userName}: ${data.description}`;
            finalDescription = finalDescription ? `${finalDescription}\n\n${newEntry}` : newEntry;
        }
        return {
            ...data,
            description: finalDescription
        };
    });

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [visitToReview, setVisitToReview] = useState<any>(null);
    const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');

    const { data: reviewData, setData: setReviewData, patch: patchReview, processing: processingReview, errors: reviewErrors, reset: resetReview, transform: transformReview } = useForm({
        status: 'approved',
        description: '',
    });

    transformReview((data) => {
        let finalDescription = visitToReview?.description || '';
        if (data.description) {
            const userName = auth?.user?.name || 'User';
            const newEntry = `${userName}: ${data.description}`;
            finalDescription = finalDescription ? `${finalDescription}\n\n${newEntry}` : newEntry;
        }
        return {
            ...data,
            description: finalDescription
        };
    });

    const calendarRef = useRef<any>(null);

    const handleEventClick = (arg: any) => {
        setSelectedEvent({
            title: arg.event.title,
            date: arg.event.startStr,
            visits: arg.event.extendedProps.visits || []
        });
        setShowModal(true);
    };

    const handleDateClick = (arg: any) => {
        if (!canSchedule) return;
        setData('date', arg.dateStr);
        setShowScheduleModal(true);
    };

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/visits', {
            preserveScroll: true,
            onSuccess: () => {
                setShowScheduleModal(false);
                reset();
                if (calendarRef.current) {
                    calendarRef.current.getApi().refetchEvents();
                }
            }
        });
    };

    const applyFilters = () => {
        if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents();
        }
    };

    const openCompleteModal = (visit: any) => {
        setVisitToComplete(visit);
        setCompleteData({
            status: 'completed',
            next_date: '',
            description: '',
            user_id: visit.user_id || '',
            by_user_id: visit.by_user_id || '',
            date: visit.next_date || new Date().toISOString().split('T')[0],
            completed_followup_id: visit.status === 'follow-up' ? visit.id : '',
        });
        setShowCompleteModal(true);
    };

    const handleCompleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isFollowUp = visitToComplete?.status === 'follow-up';
        const url = isFollowUp ? '/visits' : `/visits/${visitToComplete.id}/status`;
        const submitAction = isFollowUp ? postComplete : patchComplete;

        submitAction(url, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCompleteModal(false);
                resetComplete();
                if (calendarRef.current) {
                    calendarRef.current.getApi().refetchEvents();
                }
                setSelectedEvent((prev: any) => {
                    if (prev) {
                        return {
                            ...prev,
                            visits: prev.visits.map((v: any) => {
                                if (v.id === visitToComplete.id) {
                                    // Manually update the view based on what we just submitted
                                    let finalDescription = v.description || '';
                                    if (completeData.description) {
                                        const userName = auth?.user?.name || 'User';
                                        const newEntry = `${userName}: ${completeData.description}`;
                                        finalDescription = finalDescription ? `${finalDescription}\n\n${newEntry}` : newEntry;
                                    }
                                    return { ...v, status: 'completed', next_date: completeData.next_date, description: finalDescription };
                                }
                                return v;
                            })
                        };
                    }
                    return prev;
                });
            }
        });
    };

    const openReviewModal = (visit: any, action: 'approved' | 'rejected') => {
        setVisitToReview(visit);
        setReviewAction(action);
        setReviewData('status', action);
        setReviewData('description', '');
        setShowReviewModal(true);
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patchReview(`/visits/${visitToReview.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReviewModal(false);
                resetReview();
                if (calendarRef.current) {
                    calendarRef.current.getApi().refetchEvents();
                }
                setSelectedEvent((prev: any) => {
                    if (prev) {
                        return {
                            ...prev,
                            visits: prev.visits.map((v: any) => {
                                if (v.id === visitToReview.id) {
                                    let finalDescription = v.description || '';
                                    if (reviewData.description) {
                                        const userName = auth?.user?.name || 'User';
                                        const newEntry = `${userName}: ${reviewData.description}`;
                                        finalDescription = finalDescription ? `${finalDescription}\n\n${newEntry}` : newEntry;
                                    }
                                    return { ...v, status: reviewAction, description: finalDescription };
                                }
                                return v;
                            })
                        };
                    }
                    return prev;
                });
            }
        });
    };

    // Refetch when filters change automatically
    React.useEffect(() => {
        applyFilters();
    }, [filters]);

    return (
        <React.Fragment>
            <Head title="Visit Calendar Report | SSM" />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Visit Calendar Report" pageTitle="Reports" />

                    <Row className="mb-3">
                        <Col md={3}>
                            <Form.Select value={filters.client_id} onChange={e => setFilters({...filters, client_id: e.target.value})}>
                                <option value="">All Clients</option>
                                {clients?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Form.Select>
                        </Col>
                        {canSchedule && (
                            <Col md={3}>
                                <Form.Select value={filters.staff_id} onChange={e => setFilters({...filters, staff_id: e.target.value})}>
                                    <option value="">All Staff</option>
                                    {staff?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </Form.Select>
                            </Col>
                        )}
                        <Col md={3}>
                            <Form.Select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="follow-up">Follow-up</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <Row>
                        <Col xl={12}>
                            <Card className="card-h-100">
                                <Card.Body>
                                    <FullCalendar
                                        ref={calendarRef}
                                        plugins={[BootstrapTheme, dayGridPlugin, interactionPlugin]}
                                        initialView="dayGridMonth"
                                        themeSystem="bootstrap"
                                        headerToolbar={{
                                            left: 'prev,next today',
                                            center: 'title',
                                            right: 'dayGridMonth,dayGridWeek,dayGridDay'
                                        }}
                                        selectable={canSchedule}
                                        dateClick={handleDateClick}
                                        events={(info, successCallback, failureCallback) => {
                                            const start = encodeURIComponent(info.startStr);
                                            const end = encodeURIComponent(info.endStr);
                                            let url = `/api/visits/calendar?start=${start}&end=${end}`;
                                            if (filters.client_id) url += `&client_id=${filters.client_id}`;
                                            if (filters.staff_id) url += `&staff_id=${filters.staff_id}`;
                                            if (filters.status) url += `&status=${filters.status}`;

                                            axios.get(url)
                                                .then(response => {
                                                    successCallback(response.data);
                                                })
                                                .catch(error => {
                                                    console.error("Error fetching calendar events:", error);
                                                    failureCallback(error);
                                                });
                                        }}
                                        eventContent={(arg) => {
                                            // The title is already formatted as "John: 5 (P:2, C:3, App:0)"
                                            return (
                                                <div className="p-1 px-2 fw-medium text-truncate" title={arg.event.title} style={{ cursor: 'pointer' }}>
                                                    {arg.event.title}
                                                </div>
                                            );
                                        }}
                                        eventClick={handleEventClick}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Details Modal */}
                    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedEvent?.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h6 className="mb-3">Visits for {selectedEvent?.date ? new Date(selectedEvent.date).toLocaleDateString() : ''}</h6>
                            {selectedEvent?.visits && selectedEvent.visits.length > 0 ? (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Client</th>
                                            <th>Status</th>
                                            <th>Next Visit</th>
                                            <th>Description</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedEvent.visits.map((visit: any) => (
                                            <tr key={visit.id}>
                                                <td>{visit.client_name}</td>
                                                <td>
                                                    <Badge bg={
                                                        visit.status === 'approved' ? 'success' :
                                                        visit.status === 'completed' ? 'info' : 
                                                        visit.status === 'rejected' ? 'danger' : 'warning'
                                                    }>
                                                        {visit.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td>{visit.next_date ? new Date(visit.next_date).toLocaleDateString() : '-'}</td>
                                                <td style={{ whiteSpace: 'pre-line' }}>{visit.description || '-'}</td>
                                                <td>
                                                    {(visit.status === 'pending' || visit.status === 'follow-up') && visit.by_user_id === auth?.user?.id && (
                                                        <Button variant="success" size="sm" onClick={() => openCompleteModal(visit)}>
                                                            Complete
                                                        </Button>
                                                    )}
                                                    {visit.status === 'completed' && canApproveVisit(visit) && (
                                                        <div className="d-flex gap-1">
                                                            <Button variant="success" size="sm" onClick={() => openReviewModal(visit, 'approved')}>
                                                                Approve
                                                            </Button>
                                                            <Button variant="danger" size="sm" onClick={() => openReviewModal(visit, 'rejected')}>
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-muted">No details available.</p>
                            )}
                        </Modal.Body>
                    </Modal>

                    {/* Schedule Visit Modal */}
                    <Modal show={showScheduleModal} onHide={() => { setShowScheduleModal(false); reset(); }} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Schedule Visit</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleScheduleSubmit}>
                            <Modal.Body>
                                <div className="mb-3">
                                    <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="date" value={data.date} onChange={e => setData('date', e.target.value)} required />
                                    {errors.date && <div className="text-danger mt-1">{errors.date}</div>}
                                </div>
                                <div className="mb-3">
                                    <Form.Label>Client <span className="text-danger">*</span></Form.Label>
                                    <Form.Select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required>
                                        <option value="">Select Client</option>
                                        {clients?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Form.Select>
                                    {errors.user_id && <div className="text-danger mt-1">{errors.user_id}</div>}
                                </div>
                                <div className="mb-3">
                                    <Form.Label>Staff Member <span className="text-danger">*</span></Form.Label>
                                    <Form.Select value={data.by_user_id} onChange={e => setData('by_user_id', e.target.value)} required>
                                        <option value="">Select Staff</option>
                                        {staff?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </Form.Select>
                                    {errors.by_user_id && <div className="text-danger mt-1">{errors.by_user_id}</div>}
                                </div>
                                <div className="mb-3">
                                    <Form.Label>Next Follow-up Date</Form.Label>
                                    <Form.Control type="date" value={data.next_date} onChange={e => setData('next_date', e.target.value)} />
                                    {errors.next_date && <div className="text-danger mt-1">{errors.next_date}</div>}
                                </div>
                                <div className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" rows={3} value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Enter details..." />
                                    {errors.description && <div className="text-danger mt-1">{errors.description}</div>}
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="light" onClick={() => { setShowScheduleModal(false); reset(); }}>Close</Button>
                                <Button variant="primary" type="submit" disabled={processing}>Schedule Visit</Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* Complete Visit Modal */}
                    <Modal show={showCompleteModal} onHide={() => { setShowCompleteModal(false); resetComplete(); }} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Complete Visit</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleCompleteSubmit}>
                            <Modal.Body>
                                <div className="mb-3">
                                    <Form.Label>Next Visit Date</Form.Label>
                                    <Form.Control type="date" value={completeData.next_date} onChange={e => setCompleteData('next_date', e.target.value)} />
                                    {completeErrors.next_date && <div className="text-danger mt-1">{completeErrors.next_date}</div>}
                                </div>
                                <div className="mb-3">
                                    <Form.Label>Description (Notes)</Form.Label>
                                    <Form.Control as="textarea" rows={4} value={completeData.description} onChange={e => setCompleteData('description', e.target.value)} placeholder="Add any details or notes here..." />
                                    {completeErrors.description && <div className="text-danger mt-1">{completeErrors.description}</div>}
                                    {visitToComplete?.description && (
                                        <div className="mt-2 text-muted small">
                                            <strong>Previous Description:</strong>
                                            <p style={{ whiteSpace: 'pre-line' }}>{visitToComplete.description}</p>
                                        </div>
                                    )}
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="light" onClick={() => { setShowCompleteModal(false); resetComplete(); }}>Close</Button>
                                <Button variant="success" type="submit" disabled={processingComplete}>Complete</Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* Review Visit Modal */}
                    <Modal show={showReviewModal} onHide={() => { setShowReviewModal(false); resetReview(); }} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{reviewAction === 'approved' ? 'Approve' : 'Reject'} Visit</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleReviewSubmit}>
                            <Modal.Body>
                                <div className="mb-3">
                                    <Form.Label>Description (Notes)</Form.Label>
                                    <Form.Control as="textarea" rows={4} value={reviewData.description} onChange={e => setReviewData('description', e.target.value)} placeholder="Add any details or notes here..." />
                                    {reviewErrors.description && <div className="text-danger mt-1">{reviewErrors.description}</div>}
                                    {visitToReview?.description && (
                                        <div className="mt-2 text-muted small">
                                            <strong>Previous Description:</strong>
                                            <p style={{ whiteSpace: 'pre-line' }}>{visitToReview.description}</p>
                                        </div>
                                    )}
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="light" onClick={() => { setShowReviewModal(false); resetReview(); }}>Close</Button>
                                <Button variant={reviewAction === 'approved' ? 'success' : 'danger'} type="submit" disabled={processingReview}>
                                    {reviewAction === 'approved' ? 'Approve' : 'Reject'}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                </Container>
            </div>
        </React.Fragment>
    );
};

ReportsCalendar.layout = (page: any) => <Layout children={page} />;
export default ReportsCalendar;
