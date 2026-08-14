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
import { Head, useForm, router, usePage } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";

const PaymentsIndex = (props: any) => {
  const { payments, users, filters } = props;
  const { auth } = usePage().props as any;
  const [modal, setModal] = useState<boolean>(false);
  const [clientModal, setClientModal] = useState<boolean>(false);

  // Filter State
  const [filterState, setFilterState] = useState({
    from_user_id: filters?.from_user_id || "",
    to_user_id: filters?.to_user_id || "",
    by_user_id: filters?.by_user_id || "",
    client_id: filters?.client_id || "",
    date_from: filters?.date_from || "",
    date_to: filters?.date_to || "",
  });

  const { data, setData, post, processing, errors, reset } = useForm({
    date: moment().format("YYYY-MM-DD"),
    amount: "",
    from_user_id: "",
    by_user_id: auth.user.id,
    details: [
      { to_user_id: "", amount: "" }
    ],
    description: "",
    img: null,
    source_allocation_id: "",
  });

  const clientPaymentForm = useForm({
    date: moment().format("YYYY-MM-DD"),
    amount: "",
    from_user_id: "",
    by_user_id: auth.user.id,
    details: [
      { to_user_id: 4, amount: "" }
    ],
    description: "",
    img: null,
  });

  const handleFilterChange = (e: any) => {
    setFilterState({ ...filterState, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    router.get(route("payments.index"), filterState, { preserveState: true });
  };

  const clearFilters = () => {
    const cleared = {
      from_user_id: "",
      to_user_id: "",
      by_user_id: "",
      client_id: "",
      date_from: "",
      date_to: "",
    };
    setFilterState(cleared);
    router.get(route("payments.index"), {}, { preserveState: true });
  };

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      reset();
    } else {
      setModal(true);
    }
  }, [modal, reset]);

  const toggleClientModal = useCallback(() => {
    if (clientModal) {
      setClientModal(false);
      clientPaymentForm.reset();
    } else {
      setClientModal(true);
    }
  }, [clientModal, clientPaymentForm]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(route("payments.store"), {
      onSuccess: () => {
        setModal(false);
        toast.success("Payment processed successfully");
      },
    });
  };

  const handleClientPaymentSubmit = (e: any) => {
    e.preventDefault();
    
    clientPaymentForm.post(route("payments.store"), {
      onSuccess: () => {
        setClientModal(false);
        clientPaymentForm.reset();
        toast.success("Client payment processed successfully");
      },
    });
  };

  const addDetailRow = () => {
    setData("details", [...data.details, { to_user_id: "", amount: "" }]);
  };

  const removeDetailRow = (index: number) => {
    const newDetails = [...data.details];
    newDetails.splice(index, 1);
    setData("details", newDetails);
  };

  const updateDetail = (index: number, field: string, value: any) => {
    const newDetails = [...data.details];
    (newDetails[index] as any)[field] = value;
    setData("details", newDetails);
  };

  const columns = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "date",
        enableColumnFilter: false,
        cell: (cell: any) => moment(cell.getValue()).format("DD MMM, YYYY"),
      },
      {
        header: "From User",
        accessorKey: "from_user.name",
        enableColumnFilter: false,
      },
      {
        header: "Client",
        accessorKey: "client.name",
        enableColumnFilter: false,
        cell: (cell: any) => cell.getValue() || <span className="text-muted small italic">Auto/FIFO</span>,
      },
      {
        header: "Total Amount",
        accessorKey: "amount",
        enableColumnFilter: false,
        cell: (cell: any) => `Rs. ${cell.getValue()}`,
      },
      {
        header: "Recorded By",
        accessorKey: "by_user.name",
        enableColumnFilter: false,
      },
      {
        header: "Allocations",
        accessorKey: "details",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const details = cell.getValue() || [];
          return (
            <div className="d-flex flex-wrap gap-1">
              {details.map((d: any, i: number) => (
                <div key={i} className="badge bg-primary-subtle text-primary border border-primary-subtle">
                  {d.to_user?.name}: Rs. {d.amount}
                </div>
              ))}
            </div>
          );
        }
      },
      {
        header: "Description",
        accessorKey: "description",
        enableColumnFilter: false,
        cell: (cell: any) => <div className="text-truncate" style={{maxWidth: "150px"}} title={cell.getValue()}>{cell.getValue() || "—"}</div>,
      },
      {
        header: "Attachment",
        accessorKey: "img",
        enableColumnFilter: false,
        cell: (cell: any) => cell.getValue() ? (
          <a href={cell.getValue()} target="_blank" rel="noreferrer">
            <img src={cell.getValue()} alt="payment" className="rounded shadow-sm" style={{height: "30px", width: "30px", objectFit: "cover"}} />
          </a>
        ) : "—",
      }
    ],
    []
  );

  return (
    <React.Fragment>
      <Head title="Payments | SSM" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Payments" pageTitle="Management" />

          {/* Filter Section */}
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Body>
                  <Form>
                    <Row className="g-3">
                      <Col xxl={2} sm={4}>
                        <Form.Label className="fw-semibold">From User (Payer)</Form.Label>
                        <Form.Select name="from_user_id" value={filterState.from_user_id} onChange={handleFilterChange}>
                          <option value="">All Payers</option>
                          {users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </Form.Select>
                      </Col>

                      <Col xxl={2} sm={4}>
                        <Form.Label className="fw-semibold">To User (Recipient)</Form.Label>
                        <Form.Select name="to_user_id" value={filterState.to_user_id} onChange={handleFilterChange}>
                          <option value="">All Recipients</option>
                          {users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </Form.Select>
                      </Col>

                      <Col xxl={2} sm={4}>
                        <Form.Label className="fw-semibold">Client</Form.Label>
                        <Form.Select name="client_id" value={filterState.client_id} onChange={handleFilterChange}>
                          <option value="">All Clients</option>
                          {users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </Form.Select>
                      </Col>

                      <Col xxl={2} sm={4}>
                        <Form.Label className="fw-semibold">Recorded By</Form.Label>
                        <Form.Select name="by_user_id" value={filterState.by_user_id} onChange={handleFilterChange}>
                          <option value="">All Staff</option>
                          {users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </Form.Select>
                      </Col>

                      <Col xxl={2} sm={4}>
                        <Form.Label className="fw-semibold">From Date</Form.Label>
                        <Form.Control type="date" name="date_from" value={filterState.date_from} onChange={handleFilterChange} />
                      </Col>

                      <Col xxl={2} sm={4}>
                        <Form.Label className="fw-semibold">To Date</Form.Label>
                        <Form.Control type="date" name="date_to" value={filterState.date_to} onChange={handleFilterChange} />
                      </Col>

                      <Col xxl={2} sm={4} className="d-flex align-items-end gap-2">
                        <Button variant="primary" className="w-100" onClick={applyFilters}>
                          <i className="ri-equalizer-fill me-1 align-bottom"></i> Filters
                        </Button>
                        <Button variant="light" className="w-100" onClick={clearFilters}>
                          Clear
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Transaction History</h5>
                  <div className="flex-shrink-0">
                    <Button
                      variant="info"
                      className="me-2"
                      onClick={toggleClientModal}
                    >
                      <i className="ri-user-received-line align-bottom me-1"></i> Client Payment
                    </Button>
                    <Button
                      variant="success"
                      className="add-btn"
                      onClick={toggle}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> New Payment
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TableContainer
                    columns={columns}
                    data={payments || []}
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

        <Modal show={modal} onHide={toggle} centered size="lg">
          <Modal.Header className="bg-light p-3" closeButton>
            <h5 className="modal-title">Record New Payment</h5>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label htmlFor="payment-date">Date</Form.Label>
                    <Form.Control
                      id="payment-date"
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
                    <Form.Label htmlFor="total-amount">Total Amount</Form.Label>
                    <Form.Control
                      id="total-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={data.amount}
                      onChange={(e) => setData("amount", e.target.value)}
                      isInvalid={!!errors.amount}
                    />
                    <Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <div className="mb-3">
                    <Form.Label htmlFor="payment-description">Description</Form.Label>
                    <Form.Control
                      id="payment-description"
                      as="textarea"
                      rows={2}
                      placeholder="Enter payment description..."
                      value={data.description}
                      onChange={(e) => setData("description", e.target.value)}
                      isInvalid={!!errors.description}
                    />
                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="mb-3">
                    <Form.Label htmlFor="payment-img">Receipt/Attachment</Form.Label>
                    <Form.Control
                      id="payment-img"
                      type="file"
                      onChange={(e: any) => setData("img", e.target.files[0])}
                      isInvalid={!!errors.img}
                    />
                    <Form.Control.Feedback type="invalid">{errors.img}</Form.Control.Feedback>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <div className="mb-3">
                    <Form.Label htmlFor="from-user">From User (Payer)</Form.Label>
                    <Form.Select
                      id="from-user"
                      value={data.from_user_id}
                      onChange={(e) => {
                        setData((prev: any) => ({
                          ...prev,
                          from_user_id: e.target.value,
                          source_allocation_id: "", // Reset source when payer changes
                        }));
                      }}
                      isInvalid={!!errors.from_user_id}
                    >
                      <option value="">Select Payer</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name} (Total: Rs. {Number(u.balance).toFixed(2)})</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.from_user_id}</Form.Control.Feedback>
                  </div>
                </Col>

                {data.from_user_id && (
                  <Col md={12}>
                    <div className="mb-3 p-3 bg-light rounded border">
                      <Form.Label className="fw-semibold text-primary">
                        <i className="ri-database-2-line me-1"></i> Select Fund Source (Transaction)
                      </Form.Label>
                      <Form.Select
                        value={data.source_allocation_id}
                        onChange={(e) => setData("source_allocation_id", e.target.value)}
                        isInvalid={!!errors.source_allocation_id}
                      >
                        <option value="">-- Select Transaction --</option>
                        {(users.find((u: any) => String(u.id) === String(data.from_user_id))?.received_allocations || []).map((a: any) => (
                          <option key={a.id} value={a.id}>
                            {moment(a.payment?.date).format("DD MMM, YY")} - From: {a.payment?.from_user?.name} (Remaining: Rs. {Number(a.remaining_balance).toFixed(2)} / Total: Rs. {Number(a.amount).toFixed(2)})
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.source_allocation_id}</Form.Control.Feedback>
                      
                      <div className="mt-2 fs-12 text-muted">
                        <i className="ri-information-line me-1"></i>
                        The selected transaction must have enough balance to cover the total amount.
                      </div>
                    </div>
                  </Col>
                )}
              </Row>

              <hr />
              <div className="d-flex align-items-center mb-1">
                <h6 className="mb-0 flex-grow-1">Payment Allocations</h6>
                <Button variant="outline-primary" size="sm" onClick={addDetailRow}>
                  <i className="ri-add-line"></i> Add Allocation
                </Button>
              </div>
              
              <div className="mb-3">
                {(() => {
                  const total = Number(data.amount) || 0;
                  const allocated = data.details.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
                  const remaining = total - allocated;
                  const isBalanced = Math.abs(total - allocated) < 0.001;
                  
                  return (
                    <div className={`p-2 rounded bg-light border ${!isBalanced && allocated !== 0 ? 'border-warning' : 'border-light'}`}>
                      <div className="d-flex justify-content-between fs-12">
                        <span>Total to Allocate: <b>Rs. {total.toFixed(2)}</b></span>
                        <span className={!isBalanced ? "text-warning" : "text-success"}>
                          Allocated: <b>Rs. {allocated.toFixed(2)}</b>
                        </span>
                        <span>Remaining: <b className={!isBalanced ? "text-warning" : ""}>Rs. {remaining.toFixed(2)}</b></span>
                      </div>
                      {!isBalanced && total > 0 && (
                        <div className="text-warning fs-11 mt-1">
                          <i className="ri-error-warning-line me-1"></i> Allocation must exactly equal the total amount (Rs. ${total.toFixed(2)})
                        </div>
                      )}
                      {isBalanced && total > 0 && (
                        <div className="text-success fs-11 mt-1">
                          <i className="ri-checkbox-circle-line me-1"></i> Balanced: All funds allocated correctly.
                        </div>
                      )}
                    </div>
                  );
                })()}
                {errors.details && <div className="text-danger fs-12 mt-1">{errors.details}</div>}
              </div>
              
              {data.details.map((detail, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col md={6}>
                    <Form.Label>Allocate To</Form.Label>
                    <Form.Select
                      value={detail.to_user_id}
                      onChange={(e) => updateDetail(index, "to_user_id", e.target.value)}
                    >
                      <option value="">Select Recipient</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name} (Balance: Rs. {u.balance})</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={detail.amount}
                      onChange={(e) => updateDetail(index, "amount", e.target.value)}
                    />
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="outline-danger"
                      className="w-100"
                      onClick={() => removeDetailRow(index)}
                      disabled={data.details.length === 1}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </Col>
                </Row>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={toggle}>Close</Button>
              <Button variant="success" type="submit" disabled={processing}>Process Payment</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Simplified Client Payment Modal */}
        <Modal show={clientModal} onHide={toggleClientModal} centered>
          <Modal.Header className="bg-light p-3" closeButton>
            <h5 className="modal-title">Record Client Payment</h5>
          </Modal.Header>
          <Form onSubmit={handleClientPaymentSubmit}>
            <Modal.Body>
              <div className="mb-3">
                <Form.Label htmlFor="client-payment-date">Date</Form.Label>
                <Form.Control
                  id="client-payment-date"
                  type="date"
                  value={clientPaymentForm.data.date}
                  onChange={(e) => clientPaymentForm.setData("date", e.target.value)}
                  isInvalid={!!clientPaymentForm.errors.date}
                />
                <Form.Control.Feedback type="invalid">{clientPaymentForm.errors.date}</Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="client-from-user">Select Client</Form.Label>
                <Form.Select
                  id="client-from-user"
                  value={clientPaymentForm.data.from_user_id}
                  onChange={(e) => clientPaymentForm.setData("from_user_id", e.target.value)}
                  isInvalid={!!clientPaymentForm.errors.from_user_id}
                >
                  <option value="">Select Client</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name} (Balance: Rs. {Number(u.balance).toFixed(2)})</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{clientPaymentForm.errors.from_user_id}</Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="client-amount">Amount</Form.Label>
                <Form.Control
                  id="client-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={clientPaymentForm.data.amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    clientPaymentForm.setData((prev: any) => ({
                      ...prev,
                      amount: val,
                      details: [{ ...prev.details[0], amount: val }]
                    }));
                  }}
                  isInvalid={!!clientPaymentForm.errors.amount}
                />
                <Form.Control.Feedback type="invalid">{clientPaymentForm.errors.amount}</Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="client-description">Description</Form.Label>
                <Form.Control
                  id="client-description"
                  as="textarea"
                  rows={2}
                  placeholder="Payment notes..."
                  value={clientPaymentForm.data.description}
                  onChange={(e) => clientPaymentForm.setData("description", e.target.value)}
                  isInvalid={!!clientPaymentForm.errors.description}
                />
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="client-img">Attachment</Form.Label>
                <Form.Control
                  id="client-img"
                  type="file"
                  onChange={(e: any) => clientPaymentForm.setData("img", e.target.files[0])}
                  isInvalid={!!clientPaymentForm.errors.img}
                />
              </div>
              
              <div className="bg-info-subtle p-2 rounded text-info fs-12">
                <i className="ri-information-line me-1"></i>
                This payment will be allocated to User ID 4 and recorded by you ({auth.user.name}).
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={toggleClientModal}>Close</Button>
              <Button variant="success" type="submit" disabled={clientPaymentForm.processing}>Save Payment</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

PaymentsIndex.layout = (page: any) => <Layout children={page} />;
export default PaymentsIndex;
