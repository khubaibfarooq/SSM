import React, { useMemo, useState } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Button,
} from "react-bootstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RolesIndex = (props: any) => {
  const { roles } = props;
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<any>(null);

  const handleDeleteClick = (role: any) => {
    setCurrentRole(role);
    setDeleteModal(true);
  };

  const handleDeleteRole = () => {
    router.delete(route("roles.destroy", currentRole.id), {
      onSuccess: () => { setDeleteModal(false); toast.success("Role deleted successfully"); },
      onError: (err) => { setDeleteModal(false); toast.error(err.message || "Cannot delete role"); }
    });
  };

  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "id", enableColumnFilter: false },
      { header: "Role Name", accessorKey: "name", enableColumnFilter: false,
        cell: (c: any) => (
            <span className={`badge bg-primary-subtle text-primary text-uppercase`}>
              {c.getValue()}
            </span>
        ),
      },
      {
        header: "Permissions",
        accessorKey: "permissions",
        enableColumnFilter: false,
        cell: (c: any) => {
          const perms = c.getValue() || [];
          if (c.row.original.name === 'superadmin') return <span className="badge bg-danger">ALL PERMISSIONS</span>;
          if (perms.length === 0) return <span className="text-muted">No Permissions</span>;
          return (
            <div className="d-flex flex-wrap gap-1">
              {perms.slice(0, 3).map((p: any) => (
                <span key={p.id} className="badge bg-light text-body">{p.name}</span>
              ))}
              {perms.length > 3 && <span className="badge bg-secondary">+{perms.length - 3} more</span>}
            </div>
          );
        },
      },
      {
        header: "Action",
        cell: (cellProps: any) => {
          const r = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit">
                <Link href={route("roles.edit", r.id)} className="text-primary d-inline-block edit-item-btn p-0">
                  <i className="ri-pencil-fill fs-16"></i>
                </Link>
              </li>
              {r.name !== 'superadmin' && (
                  <li className="list-inline-item">
                    <Button variant="link" className="text-danger d-inline-block remove-item-btn p-0" onClick={() => handleDeleteClick(r)}>
                      <i className="ri-delete-bin-5-fill fs-16"></i>
                    </Button>
                  </li>
              )}
            </ul>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <Head title="Roles & Permissions | SSM" />
      <div className="page-content">
        <DeleteModal show={deleteModal} onDeleteClick={handleDeleteRole} onCloseClick={() => setDeleteModal(false)} />
        <Container fluid>
          <BreadCrumb title="Roles & Permissions" pageTitle="Management" />
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">System Roles</h5>
                  <div className="flex-shrink-0">
                    <Link href={route("roles.create")} className="btn btn-success add-btn">
                      <i className="ri-add-line align-bottom me-1"></i> Add Role
                    </Link>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TableContainer
                    columns={columns}
                    data={roles?.data || []}
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
        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

RolesIndex.layout = (page: any) => <Layout children={page} />;
export default RolesIndex;
