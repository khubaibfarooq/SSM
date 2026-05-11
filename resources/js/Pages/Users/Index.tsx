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
import DeleteModal from "../../Components/Common/DeleteModal";
import { Head, useForm } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UsersIndex = (props: any) => {
  const { users, plans } = props;
  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [paymentModal, setPaymentModal] = useState<boolean>(false);
  const [selectedUserPayments, setSelectedUserPayments] = useState<any[]>([]);

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    contact: "",
    address: "",
    business_name: "",
    type: "client",
    plan_id: "",
    plan_added_date: "",
    balance: "",
  };

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm(emptyForm);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setCurrentUser(null);
      reset();
    } else {
      setModal(true);
    }
  }, [modal, reset]);

  const handleViewPayments = (user: any) => {
    // 1. Payments MADE by this user (Outgoing)
    const outgoing = (user.payments || []).map((p: any) => ({
      id: p.id,
      date: p.date,
      totalAmount: p.amount,
      type: "Outgoing",
      party: "Multiple Allocations",
      details: p.details || []
    }));

    // 2. Allocations RECEIVED by this user (Incoming)
    const incoming = (user.received_allocations || []).map((a: any) => ({
      id: `rec-${a.id}`,
      date: a.payment?.date || a.created_at,
      totalAmount: a.amount,
      type: "Incoming",
      party: `From: ${a.payment?.from_user?.name || "Unknown User"}`,
      details: []
    }));

    // Merge and sort by date descending
    const merged = [...outgoing, ...incoming].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setSelectedUserPayments(merged);
    setPaymentModal(true);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isEdit) {
      put(route("users.update", currentUser.id), {
        onSuccess: () => { setModal(false); toast.success("User updated successfully"); },
      });
    } else {
      post(route("users.store"), {
        onSuccess: () => { setModal(false); toast.success("User created successfully"); },
      });
    }
  };

  const handleEdit = (user: any) => {
    setCurrentUser(user);
    setData({
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      password_confirmation: "",
      contact: user.contact ?? "",
      address: user.address ?? "",
      business_name: user.business_name ?? "",
      type: user.type ?? "client",
      plan_id: user.plan_id ? String(user.plan_id) : "",
      plan_added_date: user.plan_added_date ?? "",
      balance: user.balance ? String(user.balance) : "",
    });
    setIsEdit(true);
    setModal(true);
  };

  const handleDeleteClick = (user: any) => {
    setCurrentUser(user);
    setDeleteModal(true);
  };

  const handleDeleteUser = () => {
    destroy(route("users.destroy", currentUser.id), {
      onSuccess: () => { setDeleteModal(false); toast.success("User deleted successfully"); },
    });
  };

  const typeBadge: Record<string, string> = {
    admin:  "bg-danger-subtle text-danger",
    staff:  "bg-warning-subtle text-warning",
    client: "bg-success-subtle text-success",
  };

  const columns = useMemo(
    () => [
      { header: "Name",          accessorKey: "name",          enableColumnFilter: false },
      { header: "Email",         accessorKey: "email",         enableColumnFilter: false },
      { header: "Contact",       accessorKey: "contact",       enableColumnFilter: false, cell: (c: any) => c.getValue() || "—" },
      { header: "Business",      accessorKey: "business_name", enableColumnFilter: false, cell: (c: any) => c.getValue() || "—" },
      {
        header: "Type",
        accessorKey: "type",
        enableColumnFilter: false,
        cell: (c: any) => (
          <span className={`badge text-uppercase ${typeBadge[c.getValue()] ?? "bg-secondary-subtle text-secondary"}`}>
            {c.getValue() ?? "—"}
          </span>
        ),
      },
      {
        header: "Plan",
        accessorKey: "plan",
        enableColumnFilter: false,
        cell: (c: any) => c.getValue()?.name ?? "—",
      },
      {
        header: "Plan Date",
        accessorKey: "plan_added_date",
        enableColumnFilter: false,
        cell: (c: any) => c.getValue()
          ? new Date(c.getValue()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
          : "—",
      },
      {
        header: "Balance",
        accessorKey: "balance",
        enableColumnFilter: false,
        cell: (c: any) => c.getValue() != null ? `$${Number(c.getValue()).toFixed(2)}` : "—",
      },
      {
        header: "Action",
        cell: (cellProps: any) => {
          const u = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item">
                <Button variant="link" className="text-info d-inline-block view-item-btn p-0" onClick={() => handleViewPayments(u)}>
                  <i className="ri-eye-fill fs-16"></i>
                </Button>
              </li>
              <li className="list-inline-item edit">
                <Button variant="link" className="text-primary d-inline-block edit-item-btn p-0" onClick={() => handleEdit(u)}>
                  <i className="ri-pencil-fill fs-16"></i>
                </Button>
              </li>
              <li className="list-inline-item">
                <Button variant="link" className="text-danger d-inline-block remove-item-btn p-0" onClick={() => handleDeleteClick(u)}>
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Button>
              </li>
            </ul>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <Head title="Users | SSM" />
      <div className="page-content">
        <DeleteModal show={deleteModal} onDeleteClick={handleDeleteUser} onCloseClick={() => setDeleteModal(false)} />
        <Container fluid>
          <BreadCrumb title="Users" pageTitle="Management" />
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">System Users</h5>
                  <div className="flex-shrink-0">
                    <Button variant="success" className="add-btn" onClick={() => { setIsEdit(false); toggle(); }}>
                      <i className="ri-add-line align-bottom me-1"></i> Add User
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TableContainer
                    columns={columns}
                    data={users || []}
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

        {/* Payment History Modal */}
        <Modal show={paymentModal} onHide={() => setPaymentModal(false)} centered size="lg">
          <Modal.Header className="bg-light p-3" closeButton>
            <h5 className="modal-title">Payment History</h5>
          </Modal.Header>
          <Modal.Body>
            {selectedUserPayments.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-bordered align-middle table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Type</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Details / From</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedUserPayments || []).map((p: any, index: number) => (
                      <tr key={index}>
                        <td>{p.date ? new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                        <td>
                          <span className={`badge ${p.type === "Incoming" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                            {p.type}
                          </span>
                        </td>
                        <td className={p.type === "Incoming" ? "text-success" : "text-danger"}>
                          {p.type === "Incoming" ? "+" : "-"}${p.totalAmount ? Number(p.totalAmount).toFixed(2) : "0.00"}
                        </td>
                        <td>
                          {p.type === "Incoming" ? (
                            <span className="text-muted">{p.party}</span>
                          ) : (
                            <div>
                              {p.details && p.details.length > 0 ? (
                                <ul className="list-unstyled mb-0">
                                  {p.details.map((detail: any, dIdx: number) => (
                                    <li key={dIdx} className="fs-12 border-bottom border-light pb-1 mb-1 last-child-mb-0">
                                      <i className="ri-user-received-line text-muted me-1"></i>
                                      {detail.to_user?.name || `User #${detail.to_user_id}`}: 
                                      <span className="text-primary ms-1">${Number(detail.amount).toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-muted italic">No allocations</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td><span className="badge bg-success">Paid</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="ri-information-line text-info display-5"></i>
                <p className="mt-2 text-muted">No payment history found for this user.</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setPaymentModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        {/* Add / Edit Modal */}
        <Modal show={modal} onHide={toggle} centered size="lg">
          <Modal.Header className="bg-light p-3" closeButton>
            <h5 className="modal-title">{isEdit ? "Edit User" : "Add User"}</h5>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                {/* Name */}
                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="u-name">Full Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control id="u-name" type="text" placeholder="Full name"
                    value={data.name} onChange={(e) => setData("name", e.target.value)} isInvalid={!!errors.name} />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Col>

                {/* Email */}
                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="u-email">Email Address <span className="text-danger">*</span></Form.Label>
                  <Form.Control id="u-email" type="email" placeholder="Email"
                    value={data.email} onChange={(e) => setData("email", e.target.value)} isInvalid={!!errors.email} />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Col>

                {/* Password */}
                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="u-password">
                    Password {isEdit && <span className="text-muted fs-12">(leave blank to keep)</span>}
                    {!isEdit && <span className="text-danger"> *</span>}
                  </Form.Label>
                  <Form.Control id="u-password" type="password" placeholder={isEdit ? "New password (optional)" : "Password"}
                    value={data.password} onChange={(e) => setData("password", e.target.value)} isInvalid={!!errors.password} />
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Col>

                {/* Confirm Password */}
                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="u-password-confirm">Confirm Password</Form.Label>
                  <Form.Control id="u-password-confirm" type="password" placeholder="Confirm password"
                    value={data.password_confirmation} onChange={(e) => setData("password_confirmation", e.target.value)} />
                </Col>

                {/* Contact */}
                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="u-contact">Contact No.</Form.Label>
                  <Form.Control id="u-contact" type="text" placeholder="Phone number"
                    value={data.contact} onChange={(e) => setData("contact", e.target.value)} isInvalid={!!errors.contact} />
                  <Form.Control.Feedback type="invalid">{errors.contact}</Form.Control.Feedback>
                </Col>

                {/* Business Name */}
                <Col md={6} className="mb-3">
                  <Form.Label htmlFor="u-business">Business Name</Form.Label>
                  <Form.Control id="u-business" type="text" placeholder="Business / company name"
                    value={data.business_name} onChange={(e) => setData("business_name", e.target.value)} isInvalid={!!errors.business_name} />
                  <Form.Control.Feedback type="invalid">{errors.business_name}</Form.Control.Feedback>
                </Col>

                {/* Address */}
                <Col md={12} className="mb-3">
                  <Form.Label htmlFor="u-address">Address</Form.Label>
                  <Form.Control id="u-address" as="textarea" rows={2} placeholder="Street address"
                    value={data.address} onChange={(e) => setData("address", e.target.value)} isInvalid={!!errors.address} />
                  <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                </Col>

                {/* Type */}
                <Col md={4} className="mb-3">
                  <Form.Label htmlFor="u-type">User Type</Form.Label>
                  <Form.Select id="u-type" value={data.type} onChange={(e) => setData("type", e.target.value)} isInvalid={!!errors.type}>
                    <option value="client">Client</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
                </Col>

                {/* Plan */}
                <Col md={4} className="mb-3">
                  <Form.Label htmlFor="u-plan">Subscription Plan</Form.Label>
                  <Form.Select id="u-plan" value={data.plan_id} onChange={(e) => setData("plan_id", e.target.value)} isInvalid={!!errors.plan_id}>
                    <option value="">— No Plan —</option>
                    {(plans || []).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.plan_id}</Form.Control.Feedback>
                </Col>

                {/* Plan Added Date */}
                <Col md={4} className="mb-3">
                  <Form.Label htmlFor="u-plan-date">Plan Start Date</Form.Label>
                  <Form.Control id="u-plan-date" type="date"
                    value={data.plan_added_date} onChange={(e) => setData("plan_added_date", e.target.value)} isInvalid={!!errors.plan_added_date} />
                  <Form.Control.Feedback type="invalid">{errors.plan_added_date}</Form.Control.Feedback>
                </Col>

                {/* Balance */}
                <Col md={4} className="mb-3">
                  <Form.Label htmlFor="u-balance">Balance ($)</Form.Label>
                  <Form.Control id="u-balance" type="number" step="0.01" placeholder="0.00"
                    value={data.balance} onChange={(e) => setData("balance", e.target.value)} isInvalid={!!errors.balance} />
                  <Form.Control.Feedback type="invalid">{errors.balance}</Form.Control.Feedback>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={toggle}>Close</Button>
              <Button variant="success" type="submit" disabled={processing}>
                {isEdit ? "Update User" : "Create User"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

UsersIndex.layout = (page: any) => <Layout children={page} />;
export default UsersIndex;
