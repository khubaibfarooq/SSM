import React, { useState, useMemo, useCallback } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Modal,
  Form,
  Button,
  Nav,
  Tab
} from "react-bootstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";

const VisitsIndex = (props: any) => {
  const { visits, clients, staff } = props;
  const { auth } = usePage().props as any;
  const user = auth.user;
  const [modal, setModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredVisits = useMemo(() => {
    if (!visits) return [];
    
    if (activeTab === "pending") {
      // Pending visits of this week (next_date is in current week)
      return visits.filter((v: any) => v.next_date && moment(v.next_date).isSame(moment(), 'week'));
    } else if (activeTab === "old") {
      // Old visits that visited (date is in the past)
      return visits.filter((v: any) => v.date && moment(v.date).isBefore(moment(), 'day'));
    }
    
    return visits;
  }, [visits, activeTab]);

  const { data, setData, post, processing, errors, reset } = useForm({
    user_id: "",
    by_user_id: "",
    date: moment().format("YYYY-MM-DD"),
    next_date: "",
    description: "",
    assigned_to: "",
  });

  const statusForm = useForm({ status: "" });

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      reset();
    } else {
      setModal(true);
    }
  }, [modal, reset]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(route("visits.store"), {
      onSuccess: () => {
        setModal(false);
        reset();
        toast.success("Visit logged successfully");
      },
    });
  };

  const updateStatus = (visitId: string, newStatus: string) => {
    router.patch(route("visits.updateStatus", visitId), { status: newStatus }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Visit status updated");
      },
      onError: (err) => {
        toast.error("Failed to update status");
      }
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "Client",
        accessorKey: "client.name",
        enableColumnFilter: false,
      },
      {
        header: "Staff Member",
        accessorKey: "staff.name",
        enableColumnFilter: false,
      },
      {
        header: "Assigned To",
        accessorKey: "assignee.name",
        enableColumnFilter: false,
        cell: (c: any) => c.getValue() || "—",
      },
      {
        header: "Date",
        accessorKey: "date",
        enableColumnFilter: false,
        cell: (cell: any) => moment(cell.getValue()).format("DD MMM, YYYY"),
      },
      {
        header: "Next Visit",
        accessorKey: "next_date",
        enableColumnFilter: false,
        cell: (cell: any) => cell.getValue() ? moment(cell.getValue()).format("DD MMM, YYYY") : "N/A",
      },
      {
        header: "Description",
        accessorKey: "description",
        enableColumnFilter: false,
      },
      {
        header: "Completed Date",
        accessorKey: "completed_at",
        enableColumnFilter: false,
        cell: (c: any) => c.getValue() ? moment(c.getValue()).format("DD MMM, YYYY hh:mm A") : "—",
      },
      {
        header: "Approved By",
        accessorKey: "approved_by",
        enableColumnFilter: false,
        cell: (cellProps: any) => cellProps.row.original.approver?.name || "—",
      },
      {
        header: "Approved Date",
        accessorKey: "approved_at",
        enableColumnFilter: false,
        cell: (c: any) => c.getValue() ? moment(c.getValue()).format("DD MMM, YYYY hh:mm A") : "—",
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (c: any) => {
          const status = c.getValue();
          let badgeClass = "bg-warning-subtle text-warning";
          if (status === "completed") badgeClass = "bg-info-subtle text-info";
          if (status === "approved") badgeClass = "bg-success-subtle text-success";
          return <span className={`badge text-uppercase ${badgeClass}`}>{status}</span>;
        },
      },
      {
        header: "Action",
        cell: (cellProps: any) => {
          const v = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              {v.status === "pending" && (String(v.assigned_to) === String(user.id) || String(v.by_user_id) === String(user.id)) && (
                <li className="list-inline-item">
                  <Button variant="link" className="text-success d-inline-block p-0" onClick={() => updateStatus(v.id, "completed")} title="Mark as Completed">
                    <i className="ri-check-double-line fs-16"></i> Mark Complete
                  </Button>
                </li>
              )}
              {v.status === "completed" && user.roles?.some((r: any) => ['admin', 'superadmin', 'manager'].includes(r.name.toLowerCase())) && (
                <li className="list-inline-item">
                  <Button variant="link" className="text-primary d-inline-block p-0" onClick={() => updateStatus(v.id, "approved")} title="Approve Visit">
                    <i className="ri-thumb-up-fill fs-16"></i> Approve
                  </Button>
                </li>
              )}
            </ul>
          );
        },
      },
    ],
    [user]
  );

  return (
    <React.Fragment>
      <Head title="Visits | SSM" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Visits" pageTitle="Management" />
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Client Visits</h5>
                  <div className="flex-shrink-0">
                    <Button
                      variant="success"
                      className="add-btn"
                      onClick={toggle}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Log Visit
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Nav variant="tabs" className="nav-tabs-custom nav-success nav-justified mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="all" active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                        All Visits
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="pending" active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
                        Pending This Week
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="old" active={activeTab === 'old'} onClick={() => setActiveTab('old')}>
                        Old Visits
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content className="text-muted">
                    <Tab.Pane eventKey={activeTab} active>
                      <TableContainer
                        columns={columns}
                        data={filteredVisits}
                        isGlobalFilter={true}
                        customPageSize={10}
                        divClass="table-responsive table-card mb-1"
                        tableClass="align-middle table-nowrap"
                        theadClass="table-light text-muted"
                      />
                    </Tab.Pane>
                  </Tab.Content>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <Modal show={modal} onHide={toggle} centered>
          <Modal.Header className="bg-light p-3" closeButton>
            <h5 className="modal-title">Log New Visit</h5>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className="mb-3">
                <Form.Label htmlFor="client-id">Client</Form.Label>
                <Form.Select
                  id="client-id"
                  value={data.user_id}
                  onChange={(e) => setData("user_id", e.target.value)}
                  isInvalid={!!errors.user_id}
                >
                  <option value="">Select Client</option>
                  {(clients || []).map((client: any) => (
                    <option key={client.id} value={client.id}>{client.name} ({client.business_name})</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.user_id}</Form.Control.Feedback>
              </div>

              <Row>
                  <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="staff-id">Staff Member (By)</Form.Label>
                        <Form.Select
                          id="staff-id"
                          value={data.by_user_id}
                          onChange={(e) => setData("by_user_id", e.target.value)}
                          isInvalid={!!errors.by_user_id}
                        >
                          <option value="">Select Staff</option>
                          {(staff || []).map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.by_user_id}</Form.Control.Feedback>
                      </div>
                  </Col>
                  <Col md={6}>
                      <div className="mb-3">
                        <Form.Label htmlFor="assigned-to">Assigned To (Optional)</Form.Label>
                        <Form.Select
                          id="assigned-to"
                          value={data.assigned_to}
                          onChange={(e) => setData("assigned_to", e.target.value)}
                          isInvalid={!!errors.assigned_to}
                        >
                          <option value="">Select Staff</option>
                          {(staff || []).map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.assigned_to}</Form.Control.Feedback>
                      </div>
                  </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label htmlFor="date">Date</Form.Label>
                    <Form.Control
                      id="date"
                      type="date"
                      value={data.date}
                      onChange={(e) => setData("date", e.target.value)}
                      isInvalid={!!errors.date}
                    />
                    <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label htmlFor="next-date">Next Date</Form.Label>
                    <Form.Control
                      id="next-date"
                      type="date"
                      value={data.next_date}
                      onChange={(e) => setData("next_date", e.target.value)}
                      isInvalid={!!errors.next_date}
                    />
                    <Form.Control.Feedback type="invalid">{errors.next_date}</Form.Control.Feedback>
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <Form.Label htmlFor="description">Description</Form.Label>
                <Form.Control
                  id="description"
                  as="textarea"
                  rows={3}
                  placeholder="Interaction details..."
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={toggle}>Close</Button>
              <Button variant="success" type="submit" disabled={processing}>Save Visit</Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

VisitsIndex.layout = (page: any) => <Layout children={page} />;
export default VisitsIndex;
