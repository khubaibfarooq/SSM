import React from 'react';
import { Card, Col } from 'react-bootstrap';

const TopStaff = ({ topStaff }: any) => {
    return (
        <React.Fragment>
            <Col xl={6}>
                <Card>
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Top Staff</h4>
                    </Card.Header>

                    <Card.Body>
                        <div className="table-responsive table-card">
                            <table className="table table-hover table-centered align-middle table-nowrap mb-0">
                                <thead>
                                    <tr>
                                        <th>Staff Name</th>
                                        <th>Transactions</th>
                                        <th>Revenue Collected</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(topStaff || []).length > 0 ? (topStaff || []).map((staff: any, key: number) => (
                                        <tr key={key}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div>
                                                        <h5 className="fs-14 my-1 fw-medium">{staff.name}</h5>
                                                        <span className="text-muted">{staff.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <h5 className="fs-14 my-1 fw-normal">{staff.transactions}</h5>
                                            </td>
                                            <td>
                                                <h5 className="fs-14 my-1 fw-normal">Rs. {Number(staff.total_amount).toFixed(2)}</h5>
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

export default TopStaff;
