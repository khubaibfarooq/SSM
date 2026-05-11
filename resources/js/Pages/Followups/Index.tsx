import React, { useState, useMemo, useCallback } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Modal,
  Form,
  Button,
} from "react-bootstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import { Head, useForm } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";

const FollowupsIndex = (props: any) => {
  const { followups, clients, staff } = props;
  const [modal, setModal] = useState<boolean>(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    user_id: "",
    by_user_id: "",
    date: moment().format("YYYY-MM-DD"),
    next_date: "",
    description: "",
  });

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
    post(route("followups.store"), {
      onSuccess: () => {
        setModal(false);
        toast.success("Followup logged successfully");
      },
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
        header: "Date",
        accessorKey: "date",
        enableColumnFilter: false,
        cell: (cell: any) => moment(cell.getValue()).format("DD MMM, YYYY"),
      },
      {
        header: "Next Followup",
        accessorKey: "next_date",
        enableColumnFilter: false,
        cell: (cell: any) => cell.getValue() ? moment(cell.getValue()).format("DD MMM, YYYY") : "N/A",
      },
      {
        header: "Description",
        accessorKey: "description",
        enableColumnFilter: false,
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <Head title="Followups | SSM" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Followups" pageTitle="Management" />
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Client Followups</h5>
                  <div className="flex-shrink-0">
                    <Button
                      variant="success"
                      className="add-btn"
                      onClick={toggle}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Log Followup
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TableContainer
                    columns={columns}
                    data={followups || []}
                    isGlobalFilter={true}
                    customPageSize={10}
                    divClass="table-responsive table-card mb-1"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light text-muted"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <Modal show={modal} onHide={toggle} centered>
          <Modal.Header className="bg-light p-3" closeButton>
            <h5 className="modal-title">Log New Followup</h5>
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

              <div className="mb-3">
                <Form.Label htmlFor="staff-id">Staff Member</Form.Label>
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
              <Button variant="success" type="submit" disabled={processing}>Save Followup</Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

FollowupsIndex.layout = (page: any) => <Layout children={page} />;
export default FollowupsIndex;
