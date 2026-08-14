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
import { Head, useForm, usePage, router } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";

const TasksIndex = (props: any) => {
  const { tasks, staff, filters } = props;
  const { auth } = usePage().props as any;
  const user = auth.user;
  const isManager = user.roles?.some((r: any) => ['manager', 'admin', 'superadmin'].includes(r.name.toLowerCase()));
  const isStaff = user.roles?.some((r: any) => r.name.toLowerCase() === "staff");

  const [modal, setModal] = useState<boolean>(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
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
    post(route("tasks.store"), {
      onSuccess: () => {
        setModal(false);
        reset();
        toast.success("Task created successfully");
      },
    });
  };

  const [filterData, setFilterData] = useState({
      staff_id: filters?.staff_id || '',
      status: filters?.status || '',
      start_date: filters?.start_date || '',
      end_date: filters?.end_date || '',
  });

  const handleFilterChange = (e: any) => {
      setFilterData({ ...filterData, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e: any) => {
      e.preventDefault();
      router.get(route('tasks.index'), filterData, { preserveState: true });
  };

  const handleReset = () => {
      const emptyFilters = { staff_id: '', status: '', start_date: '', end_date: '' };
      setFilterData(emptyFilters);
      router.get(route('tasks.index'), emptyFilters, { preserveState: true });
  };

  const updateStatus = (taskId: string, newStatus: string) => {
    statusForm.setData("status", newStatus);
    statusForm.patch(route("tasks.updateStatus", taskId), {
      onSuccess: () => {
        toast.success("Task status updated");
      },
      onError: (err) => {
        toast.error("Failed to update status");
      }
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "Title",
        accessorKey: "title",
        enableColumnFilter: false,
      },
      {
        header: "Assigned To",
        accessorKey: "assignee.name",
        enableColumnFilter: false,
        cell: (c: any) => c.getValue() || "—",
      },
      {
        header: "Assigned By",
        accessorKey: "assigner.name",
        enableColumnFilter: false,
        cell: (c: any) => c.getValue() || "—",
      },
      {
        header: "Due Date",
        accessorKey: "due_date",
        enableColumnFilter: false,
        cell: (c: any) => c.getValue() ? moment(c.getValue()).format("DD MMM, YYYY") : "—",
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
          const t = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              {t.status === "pending" && String(t.assigned_to) === String(user.id) && (
                <li className="list-inline-item">
                  <Button variant="link" className="text-success d-inline-block p-0" onClick={() => updateStatus(t.id, "completed")} title="Mark as Completed">
                    <i className="ri-check-double-line fs-16"></i> Mark Complete
                  </Button>
                </li>
              )}
              {t.status === "completed" && (String(t.assigned_by) === String(user.id) || user.roles?.some((r: any) => ['admin', 'superadmin'].includes(r.name.toLowerCase()))) && (
                <li className="list-inline-item">
                  <Button variant="link" className="text-primary d-inline-block p-0" onClick={() => updateStatus(t.id, "approved")} title="Approve Task">
                    <i className="ri-thumb-up-fill fs-16"></i> Approve
                  </Button>
                </li>
              )}
            </ul>
          );
        },
      },
    ],
    [isManager, isStaff, statusForm]
  );

  return (
    <React.Fragment>
      <Head title="Tasks | SSM" />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Tasks" pageTitle="Management" />
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header>
                    <h5 className="card-title mb-0">Filters</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleFilterSubmit}>
                        <Row className="g-3">
                            <Col lg={3} sm={6}>
                                <Form.Label>Staff Member</Form.Label>
                                <Form.Select name="staff_id" value={filterData.staff_id} onChange={handleFilterChange}>
                                    <option value="">All Staff</option>
                                    {(staff || []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </Form.Select>
                            </Col>
                            <Col lg={3} sm={6}>
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={filterData.status} onChange={handleFilterChange}>
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="approved">Approved</option>
                                </Form.Select>
                            </Col>
                            <Col lg={2} sm={6}>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control type="date" name="start_date" value={filterData.start_date} onChange={handleFilterChange} />
                            </Col>
                            <Col lg={2} sm={6}>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control type="date" name="end_date" value={filterData.end_date} onChange={handleFilterChange} />
                            </Col>
                            <Col lg={2} sm={12} className="d-flex align-items-end gap-2">
                                <Button variant="primary" type="submit" className="w-100">
                                    <i className="ri-filter-2-line me-1 align-bottom"></i> Filter
                                </Button>
                                <Button variant="soft-secondary" onClick={handleReset} type="button" className="w-100">
                                    <i className="ri-refresh-line me-1 align-bottom"></i> Reset
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Task List</h5>
                  <div className="flex-shrink-0">
                    <Button variant="success" className="add-btn" onClick={toggle}>
                      <i className="ri-add-line align-bottom me-1"></i> Assign Task
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TableContainer
                    columns={columns}
                    data={tasks || []}
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
            <h5 className="modal-title">Assign New Task</h5>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className="mb-3">
                <Form.Label htmlFor="t-title">Task Title <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  id="t-title"
                  type="text"
                  placeholder="Task title"
                  value={data.title}
                  onChange={(e) => setData("title", e.target.value)}
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="t-staff">Assign To <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  id="t-staff"
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

              <div className="mb-3">
                <Form.Label htmlFor="t-due">Due Date</Form.Label>
                <Form.Control
                  id="t-due"
                  type="date"
                  value={data.due_date}
                  onChange={(e) => setData("due_date", e.target.value)}
                  isInvalid={!!errors.due_date}
                />
                <Form.Control.Feedback type="invalid">{errors.due_date}</Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="t-desc">Description</Form.Label>
                <Form.Control
                  id="t-desc"
                  as="textarea"
                  rows={3}
                  placeholder="Task details..."
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={toggle}>Close</Button>
              <Button variant="success" type="submit" disabled={processing}>Assign Task</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

TasksIndex.layout = (page: any) => <Layout children={page} />;
export default TasksIndex;
