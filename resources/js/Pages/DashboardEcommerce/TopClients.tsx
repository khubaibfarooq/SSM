import React from 'react';
import { Card, Col } from 'react-bootstrap';

const TopClients = ({ topClients }: any) => {
    return (
        <React.Fragment>
            <Col xl={6}>
                <Card>
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Top Clients</h4>
                    </Card.Header>

                    <Card.Body>
                        <div className="table-responsive table-card">
                            <table className="table table-hover table-centered align-middle table-nowrap mb-0">
                                <thead>
                                    <tr>
                                        <th>Client Name</th>
                                        <th>Transactions</th>
                                        <th>Amount Paid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(topClients || []).length > 0 ? (topClients || []).map((client: any, key: number) => (
                                        <tr key={key}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div>
                                                        <h5 className="fs-14 my-1 fw-medium">{client.name}</h5>
                                                        <span className="text-muted">{client.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <h5 className="fs-14 my-1 fw-normal">{client.transactions}</h5>
                                            </td>
                                            <td>
                                                <h5 className="fs-14 my-1 fw-normal">Rs. {Number(client.total_amount).toFixed(2)}</h5>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="text-center text-muted p-4">No data available for this period</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default TopClients;
