import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Form,
  Modal,
  Dropdown,
} from "react-bootstrap";
import SimpleBar from "simplebar-react";
import "react-perfect-scrollbar/dist/css/styles.css";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import Layout from "../../Layouts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const TicketsChat = (props: any) => {
  const { tickets } = props;
  const { auth } = usePage().props as any;
  const user = auth.user;
  const isAdminOrManager = user.roles?.some((r: any) =>
    ["admin", "superadmin", "manager"].includes(r.name.toLowerCase())
  );

  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [modal, setModal] = useState<boolean>(false);
  const chatRef = useRef<any>(null);

  // Form for New Ticket
  const {
    data: newTicketData,
    setData: setNewTicketData,
    post: postNewTicket,
    processing: processingNewTicket,
    errors: newTicketErrors,
    reset: resetNewTicket,
  } = useForm({
    subject: "",
    message: "",
    attachment: null as File | null,
  });

  // Form for New Message
  const {
    data: messageData,
    setData: setMessageData,
    post: postMessage,
    processing: processingMessage,
    reset: resetMessage,
  } = useForm({
    message: "",
    attachment: null as File | null,
  });

  useEffect(() => {
    if (chatRef.current?.el) {
      chatRef.current.getScrollElement().scrollTop = chatRef.current.getScrollElement().scrollHeight;
    }
  }, [activeTicket]);

  const toggleModal = () => {
    setModal(!modal);
    resetNewTicket();
  };

  const submitNewTicket = (e: any) => {
    e.preventDefault();
    postNewTicket(route("tickets.store"), {
      onSuccess: () => {
        setModal(false);
        resetNewTicket();
        toast.success("Ticket created successfully");
      },
      forceFormData: true,
    });
  };

  const submitMessage = (e: any) => {
    e.preventDefault();
    if (!activeTicket) return;
    if (!messageData.message && !messageData.attachment) {
      toast.error("Please enter a message or attach a file.");
      return;
    }
    
    postMessage(route("tickets.messages.store", activeTicket.id), {
      onSuccess: () => {
        resetMessage();
        // The page will reload via Inertia, so we should update activeTicket to reflect new messages.
      },
      forceFormData: true,
      preserveScroll: true,
    });
  };

  // Update activeTicket whenever the `tickets` prop changes (e.g. after a message is sent)
  useEffect(() => {
    if (activeTicket) {
      const updated = tickets.find((t: any) => t.id === activeTicket.id);
      if (updated) {
        setActiveTicket(updated);
      }
    }
  }, [tickets]);

  const updateStatus = (ticketId: string, newStatus: string) => {
    router.patch(
      route("tickets.update", ticketId),
      { status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Ticket marked as ${newStatus}`);
          setActiveTicket(null); // Deselect or let it update
        },
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  const renderHTML = (htmlString: string) => {
    return { __html: htmlString };
  };

  return (
    <React.Fragment>
      <Head title="Help Desk Chat | SSM" />
      <div className="page-content">
        <Container fluid>
          <div className="chat-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1">
            {/* Left Sidebar - Ticket List */}
            <div className="chat-leftsidebar border">
              <div className="px-4 pt-4 mb-3">
                <div className="d-flex align-items-start">
                  <div className="flex-grow-1">
                    <h5 className="mb-4">Help Desk</h5>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={toggleModal}
                    >
                      <i className="ri-add-line align-bottom"></i> New Ticket
                    </Button>
                  </div>
                </div>
              </div>

              <SimpleBar className="chat-room-list pt-3" style={{ height: "calc(100vh - 250px)" }}>
                <ul className="list-unstyled chat-list chat-user-list mb-0">
                  {tickets.map((t: any) => (
                    <li key={t.id} className={activeTicket?.id === t.id ? "active" : ""}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTicket(t);
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                            <div className="avatar-xxs">
                              <div className="avatar-title bg-light rounded-circle text-body">
                                <i className="ri-ticket-2-line"></i>
                              </div>
                            </div>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <p className="text-truncate mb-0 fw-medium">{t.subject}</p>
                            <p className="text-truncate mb-0 text-muted fs-12">
                              {t.creator?.name || "Unknown"} &middot; {moment(t.created_at).format("MMM DD")}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span
                              className={`badge ${
                                t.status === "resolved" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                  {tickets.length === 0 && (
                    <div className="text-center text-muted p-3">No tickets found.</div>
                  )}
                </ul>
              </SimpleBar>
            </div>

            {/* Right Pane - Chat Window */}
            <div className="user-chat w-100 overflow-hidden border">
              <div className="chat-content d-lg-flex">
                <div className="w-100 overflow-hidden position-relative">
                  {activeTicket ? (
                    <div className="position-relative d-flex flex-column" style={{ height: "calc(100vh - 120px)" }}>
                      <div className="p-3 user-chat-topbar border-bottom">
                        <Row className="align-items-center">
                          <Col sm={8} xs={8}>
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1 overflow-hidden">
                                <h5 className="text-truncate mb-0 fs-16">
                                  {activeTicket.subject}
                                </h5>
                                <p className="text-truncate text-muted fs-14 mb-0 userStatus">
                                  <small>Created by {activeTicket.creator?.name}</small>
                                </p>
                              </div>
                            </div>
                          </Col>
                          <Col sm={4} xs={4} className="text-end">
                            {isAdminOrManager && activeTicket.status === "pending" && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => updateStatus(activeTicket.id, "resolved")}
                              >
                                Mark Resolved
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </div>

                      <div className="chat-conversation p-3 p-lg-4 flex-grow-1" style={{ overflowY: "auto" }} ref={chatRef}>
                        <ul className="list-unstyled chat-conversation-list">
                          {activeTicket.messages?.map((msg: any) => {
                            const isOwnMessage = msg.user_id === user.id;
                            return (
                              <li key={msg.id} className={`chat-list ${isOwnMessage ? "right" : "left"}`}>
                                <div className="conversation-list">
                                  {!isOwnMessage && (
                                    <div className="chat-avatar">
                                      <div className="avatar-xs">
                                        <span className="avatar-title rounded-circle bg-primary fs-12">
                                          {msg.sender?.name?.charAt(0) || "U"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  <div className="user-chat-content">
                                    <div className="ctext-wrap">
                                      <div className="ctext-wrap-content">
                                        <div dangerouslySetInnerHTML={renderHTML(msg.message)} />
                                        {msg.attachment_path && (
                                          <div className="mt-2">
                                            <a
                                              href={`/storage/${msg.attachment_path}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="btn btn-sm btn-soft-primary"
                                            >
                                              <i className="ri-attachment-2 align-bottom"></i> View Attachment
                                            </a>
                                          </div>
                                        )}
                                        <p className="chat-time mb-0 mt-1">
                                          <i className="ri-time-line align-middle"></i>{" "}
                                          <span className="align-middle">
                                            {moment(msg.created_at).format("hh:mm A")}
                                          </span>
                                        </p>
                                      </div>
                                      {!isOwnMessage && (
                                        <div className="conversation-name">{msg.sender?.name}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {activeTicket.status === "pending" ? (
                        <div className="chat-input-section p-3 p-lg-4 border-top">
                          <Form onSubmit={submitMessage}>
                            <Row className="g-0 align-items-center">
                              <Col xs="auto">
                                <div className="chat-input-links me-2">
                                  <div className="links-list-item">
                                    <label htmlFor="file-upload" className="btn btn-link text-decoration-none emoji-btn" id="emoji-btn">
                                      <i className="bx bx-paperclip align-middle"></i>
                                    </label>
                                    <input 
                                      type="file" 
                                      id="file-upload" 
                                      style={{ display: "none" }}
                                      onChange={(e) => setMessageData("attachment", e.target.files ? e.target.files[0] : null)}
                                    />
                                  </div>
                                </div>
                              </Col>
                              <Col>
                                <div className="chat-input-feedback">
                                  {messageData.attachment && (
                                    <span className="badge bg-soft-info text-info mb-1">
                                      {messageData.attachment.name}
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  className="form-control chat-input bg-light border-light"
                                  placeholder="Type your message..."
                                  value={messageData.message}
                                  onChange={(e) => setMessageData("message", e.target.value)}
                                  disabled={processingMessage}
                                />
                              </Col>
                              <Col xs="auto">
                                <div className="chat-input-links ms-2">
                                  <div className="links-list-item">
                                    <Button
                                      type="submit"
                                      variant="success"
                                      className="chat-send waves-effect waves-light"
                                      disabled={processingMessage}
                                    >
                                      <i className="ri-send-plane-2-fill align-bottom"></i>
                                    </Button>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        </div>
                      ) : (
                        <div className="chat-input-section p-3 p-lg-4 border-top text-center bg-light">
                          <p className="text-muted mb-0">This ticket has been resolved. You cannot reply.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "calc(100vh - 120px)" }}>
                      <div className="text-center">
                        <i className="ri-chat-voice-line display-4 text-muted"></i>
                        <h4 className="mt-3 text-muted">Select a Ticket</h4>
                        <p className="text-muted">Choose a ticket from the left sidebar to view its details.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* New Ticket Modal */}
      <Modal show={modal} onHide={toggleModal} centered size="lg">
        <Modal.Header closeButton className="p-3 bg-light">
          <Modal.Title>Create New Ticket</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitNewTicket}>
          <Modal.Body>
            <div className="mb-3">
              <Form.Label htmlFor="t-subject">Subject <span className="text-danger">*</span></Form.Label>
              <Form.Control
                id="t-subject"
                type="text"
                placeholder="Issue subject"
                value={newTicketData.subject}
                onChange={(e) => setNewTicketData("subject", e.target.value)}
                isInvalid={!!newTicketErrors.subject}
              />
              <Form.Control.Feedback type="invalid">{newTicketErrors.subject}</Form.Control.Feedback>
            </div>

            <div className="mb-3">
              <Form.Label htmlFor="t-message">Description (Rich Text) <span className="text-danger">*</span></Form.Label>
              <CKEditor
                editor={ClassicEditor}
                data={newTicketData.message}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setNewTicketData("message", data);
                }}
              />
              {newTicketErrors.message && <div className="text-danger mt-1 fs-12">{newTicketErrors.message}</div>}
            </div>

            <div className="mb-3">
              <Form.Label htmlFor="t-attachment">Attachment (Optional)</Form.Label>
              <Form.Control
                id="t-attachment"
                type="file"
                onChange={(e: any) => setNewTicketData("attachment", e.target.files ? e.target.files[0] : null)}
                isInvalid={!!newTicketErrors.attachment}
              />
              <Form.Control.Feedback type="invalid">{newTicketErrors.attachment}</Form.Control.Feedback>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={toggleModal}>Close</Button>
            <Button variant="success" type="submit" disabled={processingNewTicket}>Submit Ticket</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ToastContainer closeButton={false} limit={1} />
    </React.Fragment>
  );
};

TicketsChat.layout = (page: any) => <Layout children={page} />;
export default TicketsChat;
