import React from 'react';
import { Card, Col } from 'react-bootstrap';

const SalesByZones = ({ salesByZones }: any) => {
    // Calculate total to find percentages
    const totalSales = (salesByZones || []).reduce((acc: number, zone: any) => acc + Number(zone.total), 0);

    return (
        <React.Fragment>
            <Col xl={4}>
                <Card className="card-height-100">
                    <Card.Header className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Sales by Zones</h4>
                    </Card.Header>

                    <Card.Body>
                        <div className="px-2 py-2 mt-1">
                            {salesByZones && salesByZones.length > 0 ? (
                                salesByZones.map((zone: any, index: number) => {
                                    const percentage = totalSales > 0 ? ((Number(zone.total) / totalSales) * 100).toFixed(2) : 0;
                                    return (
                                        <React.Fragment key={index}>
                                            <p className={index === 0 ? "mb-1" : "mt-3 mb-1"}>
                                                {zone.name} <span className="float-end text-muted">Rs. {Number(zone.total).toFixed(2)} ({percentage}%)</span>
                                            </p>
                                            <div className="progress mt-2" style={{ height: "6px" }}>
                                                <div className="progress-bar progress-bar-striped bg-primary" role="progressbar"
                                                    style={{ width: `${percentage}%` }} >
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <div className="text-center text-muted mt-4">
                                    <i className="ri-map-pin-line display-5"></i>
                                    <p className="mt-2">No sales data recorded for any zones.</p>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default SalesByZones;
