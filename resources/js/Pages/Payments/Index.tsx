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
import { Head, useForm, router } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";

const PaymentsIndex = (props: any) => {
  const { payments, users, filters } = props;
  const [modal, setModal] = useState<boolean>(false);

  // Filter State
  const [filterState, setFilterState] = useState({
    from_user_id: filters?.from_user_id || "",
    to_user_id: filters?.to_user_id || "",
    by_user_id: filters?.by_user_id || "",
    date_from: filters?.date_from || "",
    date_to: filters?.date_to || "",
  });

  const { data, setData, post, processing, errors, reset } = useForm({
    date: moment().format("YYYY-MM-DD"),
    amount: "",
    from_user_id: "",
    by_user_id: "",
    details: [
      { to_user_id: "", amount: "" }
    ],
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

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(route("payments.store"), {
      onSuccess: () => {
        setModal(false);
        toast.success("Payment processed successfully");
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
        header: "Total Amount",
        accessorKey: "amount",
        enableColumnFilter: false,
        cell: (cell: any) => `$${cell.getValue()}`,
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
                  {d.to_user?.name}: ${d.amount}
                </div>
              ))}
            </div>
          );
        }
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
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label htmlFor="from-user">From User (Payer)</Form.Label>
                    <Form.Select
                      id="from-user"
                      value={data.from_user_id}
                      onChange={(e) => setData("from_user_id", e.target.value)}
                      isInvalid={!!errors.from_user_id}
                    >
                      <option value="">Select Payer</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name} (Balance: ${Number(u.balance).toFixed(2)})</option>
                      ))}
                    </Form.Select>
                    {data.from_user_id && (
                      <div className="mt-1 text-muted fs-12">
                        Available Balance: <span className="fw-medium text-info">${Number(users.find((u: any) => String(u.id) === String(data.from_user_id))?.balance || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <Form.Control.Feedback type="invalid">{errors.from_user_id}</Form.Control.Feedback>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label htmlFor="by-user">Recorded By</Form.Label>
                    <Form.Select
                      id="by-user"
                      value={data.by_user_id}
                      onChange={(e) => setData("by_user_id", e.target.value)}
                      isInvalid={!!errors.by_user_id}
                    >
                      <option value="">Select User</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.by_user_id}</Form.Control.Feedback>
                  </div>
                </Col>
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
                        <span>Total to Allocate: <b>${total.toFixed(2)}</b></span>
                        <span className={!isBalanced ? "text-warning" : "text-success"}>
                          Allocated: <b>${allocated.toFixed(2)}</b>
                        </span>
                        <span>Remaining: <b className={!isBalanced ? "text-warning" : ""}>${remaining.toFixed(2)}</b></span>
                      </div>
                      {!isBalanced && total > 0 && (
                        <div className="text-warning fs-11 mt-1">
                          <i className="ri-error-warning-line me-1"></i> Allocation must exactly equal the total amount (${total.toFixed(2)})
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
                        <option key={u.id} value={u.id}>{u.name} (Balance: ${u.balance})</option>
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
        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

PaymentsIndex.layout = (page: any) => <Layout children={page} />;
export default PaymentsIndex;
