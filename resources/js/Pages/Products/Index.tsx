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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductsIndex = (props: any) => {
  const { products } = props;
  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    name: "",
    description: "",
  });

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setCurrentProduct(null);
      reset();
    } else {
      setModal(true);
    }
  }, [modal, reset]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isEdit) {
      put(route("products.update", currentProduct.id), {
        onSuccess: () => {
          setModal(false);
          toast.success("Product updated successfully");
        },
      });
    } else {
      post(route("products.store"), {
        onSuccess: () => {
          setModal(false);
          toast.success("Product created successfully");
        },
      });
    }
  };

  const handleEdit = (product: any) => {
    setCurrentProduct(product);
    setData({
      name: product.name,
      description: product.description || "",
    });
    setIsEdit(true);
    setModal(true);
  };

  const handleDeleteClick = (product: any) => {
    setCurrentProduct(product);
    setDeleteModal(true);
  };

  const handleDeleteProduct = () => {
    destroy(route("products.destroy", currentProduct.id), {
      onSuccess: () => {
        setDeleteModal(false);
        toast.success("Product deleted successfully");
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
        header: "Description",
        accessorKey: "description",
        enableColumnFilter: false,
      },
      {
        header: "Plans Count",
        accessorKey: "plans_count",
        enableColumnFilter: false,
      },
      {
        header: "Action",
        cell: (cellProps: any) => {
          const productData = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit">
                <Button
                  variant="link"
                  className="text-primary d-inline-block edit-item-btn p-0"
                  onClick={() => handleEdit(productData)}
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Button>
              </li>
              <li className="list-inline-item">
                <Button
                  variant="link"
                  className="text-danger d-inline-block remove-item-btn p-0"
                  onClick={() => handleDeleteClick(productData)}
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
      <Head title="Products | SSM" />
      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteProduct}
          onCloseClick={() => setDeleteModal(false)}
        />
        <Container fluid>
          <BreadCrumb title="Products" pageTitle="Management" />
          <Row>
            <Col lg={12}>
              <Card>
                <Card.Header className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Products</h5>
                  <div className="flex-shrink-0">
                    <Button
                      variant="success"
                      className="add-btn"
                      onClick={() => {
                        setIsEdit(false);
                        toggle();
                      }}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add Product
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TableContainer
                    columns={columns}
                    data={products || []}
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
            <h5 className="modal-title">{isEdit ? "Edit Product" : "Add Product"}</h5>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className="mb-3">
                <Form.Label htmlFor="product-name">Product Name</Form.Label>
                <Form.Control
                  id="product-name"
                  type="text"
                  placeholder="Enter product name"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="product-description">Description</Form.Label>
                <Form.Control
                  id="product-description"
                  as="textarea"
                  rows={3}
                  placeholder="Enter product description"
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={toggle}>Close</Button>
              <Button variant="success" type="submit" disabled={processing}>
                {isEdit ? "Update Product" : "Create Product"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <ToastContainer closeButton={false} limit={1} />
      </div>
    </React.Fragment>
  );
};

ProductsIndex.layout = (page: any) => <Layout children={page} />;
export default ProductsIndex;
