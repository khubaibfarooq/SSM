import React, { useMemo, useState } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Button,
  Modal,
  Form
} from "react-bootstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import { Head, useForm, router } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PermissionsIndex = (props: any) => {
  const { permissions } = props;
  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentPermission, setCurrentPermission] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: "",
  });

  const toggle = () => {
    if (modal) {
      setModal(false);
      setCurrentPermission(null);
      reset();
    } else {
      setModal(true);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isEdit) {
      put(route("permissions.update", currentPermission.id), {
        onSuccess: () => { setModal(false); toast.success("Permission updated successfully"); },
      });
    } else {
      post(route("permissions.store"), {
        onSuccess: () => { setModal(false); toast.success("Permission created successfully"); },
      });
    }
  };

  const handleEdit = (permission: any) => {
    setCurrentPermission(permission);
    setData({
      name: permission.name ?? "",
    });
    setIsEdit(true);
    setModal(true);
  };

  const handleDeleteClick = (permission: any) => {
    setCurrentPermission(permission);
    setDeleteModal(true);
  };

  const handleDeletePermission = () => {
    router.delete(route("permissions.destroy", currentPermission.id), {
      onSuccess: () => { setDeleteModal(false); toast.success("Permission deleted successfully"); },
      onError: (err) => { setDeleteModal(false); toast.error(err.message || "Cannot delete permission"); }
    });
  };

  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "id", enableColumnFilter: false },
      { header: "Permission Name", accessorKey: "name", enableColumnFilter: false,
        cell: (c: any) => (
            <span className={`badge bg-secondary-subtle text-secondary`}>
              {c.getValue()}
            </span>
        ),
      },
      {
        header: "Created At",
        accessorKey: "created_at",
        enableColumnFilter: false,
        cell: (c: any) => new Date(c.getValue()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      },
      {
        header: "Action",
        cell: (cellProps: any) => {
          const p = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit">
                <Button variant="link" className="text-primary d-inline-block edit-item-btn p-0" onClick={() => handleEdit(p)}>
                  <i className="ri-pencil-fill fs-16"></i>
                </Button>
              </li>
              <li className="list-inline-item">
                <Button variant="link" className="text-danger d-inline-block remove-item-btn p-0" onClick={() => handleDeleteClick(p)}>
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
      <Head title="Permissions | SSM" />
      <div className="page-content">
        <DeleteModal show={deleteModal} onDeleteClick={handleDeletePermission} onCloseClick={() => setDeleteModal(false)} />
        
        {/* Create / Edit Modal */}
        <Modal show={modal} onHide={toggle} centered>
          <Modal.Header className="bg-light p-3" closeButton>
            <h5 className="modal-title">{isEdit ? "Edit Permission" : "Add Permission"}</h5>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className="mb-3">
                <Form.Label htmlFor="p-name">Permission Name <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  id="p-name" 
                  type="text" 
                  placeholder="e.g. manage settings"
                  value={data.name} 
                  onChange={(e) => setData("name", e.target.value)} 
                  isInvalid={!!errors.name} 
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={toggle}>Close</Button>
              <Button variant="success" type="submit" disabled={processing}>
                {isEdit ? "Update Permission" : "Create Permission"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Container fluid>
          <BreadCrumb title="Permissions" pageTitle="Management" />
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">System Permissions</h5>
                  <div className="flex-shrink-0">
                    <Button variant="success" className="add-btn" onClick={() => { setIsEdit(false); toggle(); }}>
                      <i className="ri-add-line align-bottom me-1"></i> Add Permission
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TableContainer
                    columns={columns}
                    data={permissions?.data || []}
                    isGlobalFilter={true}
                    customPageSize={15}
                    divClass="table-responsive table-card mb-1"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light text-muted"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

PermissionsIndex.layout = (page: any) => <Layout children={page} />;
export default PermissionsIndex;
