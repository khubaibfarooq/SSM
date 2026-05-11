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
import { Head, useForm, usePage } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlansIndex = (props: any) => {
  const { plans } = props;
  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    name: "",
    type: "monthly",
    amount: "",
  });

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setCurrentPlan(null);
      reset();
    } else {
      setModal(true);
    }
  }, [modal, reset]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isEdit) {
      put(route("plans.update", currentPlan.id), {
        onSuccess: () => {
          setModal(false);
          toast.success("Plan updated successfully");
        },
      });
    } else {
      post(route("plans.store"), {
        onSuccess: () => {
          setModal(false);
          toast.success("Plan created successfully");
        },
      });
    }
  };

  const handleEdit = (plan: any) => {
    setCurrentPlan(plan);
    setData({
      name: plan.name,
      type: plan.type,
      amount: plan.amount.toString(),
    });
    setIsEdit(true);
    setModal(true);
  };

  const handleDeleteClick = (plan: any) => {
    setCurrentPlan(plan);
    setDeleteModal(true);
  };

  const handleDeletePlan = () => {
    destroy(route("plans.destroy", currentPlan.id), {
      onSuccess: () => {
        setDeleteModal(false);
        toast.success("Plan deleted successfully");
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
      },
      {
        header: "Type",
        accessorKey: "type",
        enableColumnFilter: false,
        cell: (cell: any) => (
          <span className="badge text-uppercase bg-info-subtle text-info">
            {cell.getValue()}
          </span>
        ),
      },
      {
        header: "Amount",
        accessorKey: "amount",
        enableColumnFilter: false,
        cell: (cell: any) => `$${cell.getValue()}`,
      },
      {
        header: "Action",
        cell: (cellProps: any) => {
          const planData = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit">
                <Button
                  variant="link"
                  className="text-primary d-inline-block edit-item-btn p-0"
                  onClick={() => handleEdit(planData)}
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Button>
              </li>
              <li className="list-inline-item">
                <Button
                  variant="link"
                  className="text-danger d-inline-block remove-item-btn p-0"
                  onClick={() => handleDeleteClick(planData)}
                >
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
      <Head title="Plans | SSM" />
      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeletePlan}
          onCloseClick={() => setDeleteModal(false)}
        />
        <Container fluid>
          <BreadCrumb title="Plans" pageTitle="Management" />
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Subscription Plans</h5>
                  <div className="flex-shrink-0">
                    <Button
                      variant="success"
                      className="add-btn"
                      onClick={() => {
                        setIsEdit(false);
                        toggle();
                      }}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add Plan
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TableContainer
                    columns={columns}
                    data={plans || []}
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
            <h5 className="modal-title">{isEdit ? "Edit Plan" : "Add Plan"}</h5>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className="mb-3">
                <Form.Label htmlFor="plan-name">Plan Name</Form.Label>
                <Form.Control
                  id="plan-name"
                  type="text"
                  placeholder="Enter plan name"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="plan-type">Type</Form.Label>
                <Form.Select
                  id="plan-type"
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  isInvalid={!!errors.type}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="plan-amount">Amount</Form.Label>
                <Form.Control
                  id="plan-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={data.amount}
                  onChange={(e) => setData("amount", e.target.value)}
                  isInvalid={!!errors.amount}
                />
                <Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={toggle}>Close</Button>
              <Button variant="success" type="submit" disabled={processing}>
                {isEdit ? "Update Plan" : "Create Plan"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

PlansIndex.layout = (page: any) => <Layout children={page} />;
export default PlansIndex;
