import React from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Form,
  Button,
} from "react-bootstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { Head, Link, useForm } from "@inertiajs/react";
import Layout from "../../Layouts";

const CreateEditRole = (props: any) => {
  const { role, permissions } = props;
  const isEdit = !!role;

  const { data, setData, post, put, processing, errors } = useForm({
    name: role?.name || "",
    permissions: role?.permissions?.map((p: any) => p.id) || [],
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isEdit) {
      put(route("roles.update", role.id));
    } else {
      post(route("roles.store"));
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    let newPermissions = [...data.permissions];
    if (newPermissions.includes(permissionId)) {
      newPermissions = newPermissions.filter(id => id !== permissionId);
    } else {
      newPermissions.push(permissionId);
    }
    setData("permissions", newPermissions);
  };

  return (
    <React.Fragment>
      <Head title={`${isEdit ? 'Edit' : 'Create'} Role | SSM`} />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title={`${isEdit ? 'Edit' : 'Create'} Role`} pageTitle="Roles & Permissions" />
          <Row>
            <Col lg={12}>
              <Card>
                <Form onSubmit={handleSubmit}>
                  <Card.Header>
                    <h5 className="card-title mb-0">{isEdit ? 'Edit Role Details' : 'New Role Details'}</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Form.Label htmlFor="roleName">Role Name <span className="text-danger">*</span></Form.Label>
                          <Form.Control 
                            id="roleName" 
                            type="text" 
                            placeholder="e.g. Manager"
                            value={data.name} 
                            onChange={(e) => setData("name", e.target.value)} 
                            isInvalid={!!errors.name}
                            disabled={isEdit && role.name === 'superadmin'}
                          />
                          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </div>
                      </Col>
                    </Row>

                    <div className="mt-4">
                      <h5 className="fs-14 mb-3">Assign Permissions</h5>
                      {isEdit && role.name === 'superadmin' ? (
                        <div className="alert alert-info">
                          The <strong>superadmin</strong> role automatically bypasses all permission checks. Individual permissions do not need to be assigned.
                        </div>
                      ) : (
                        <Row>
                          {permissions && permissions.map((p: any) => (
                            <Col md={3} sm={4} key={p.id} className="mb-2">
                              <Form.Check 
                                type="checkbox"
                                id={`permission-${p.id}`}
                                label={p.name}
                                checked={data.permissions.includes(p.id)}
                                onChange={() => handlePermissionToggle(p.id)}
                              />
                            </Col>
                          ))}
                        </Row>
                      )}
                      {errors.permissions && <div className="text-danger mt-2">{errors.permissions}</div>}
                    </div>
                  </Card.Body>
                  <Card.Footer className="text-end">
                    <Link href={route('roles.index')} className="btn btn-light me-2">Cancel</Link>
                    <Button variant="success" type="submit" disabled={processing}>
                      {isEdit ? "Update Role" : "Create Role"}
                    </Button>
                  </Card.Footer>
                </Form>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

CreateEditRole.layout = (page: any) => <Layout children={page} />;
export default CreateEditRole;
