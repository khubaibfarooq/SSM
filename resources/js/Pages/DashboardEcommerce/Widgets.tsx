import React from 'react';
import CountUp from "@/Components/Common/CountUp";
import { Card, Col } from 'react-bootstrap';
import { Link } from '@inertiajs/react';
const Widgets = ({ totalRevenue, totalClients, totalVisits, totalPayments }: any) => {
    const ecomWidgets = [
        {
            id: 1,
            cardColor: "primary",
            label: "Total Revenue",
            badge: "ri-arrow-right-up-line",
            badgeClass: "success",
            percentage: "+0.00",
            counter: totalRevenue || 0,
            link: "View net earnings",
            bgcolor: "success",
            icon: "bx bx-dollar-circle",
            decimals: 2,
            prefix: "Rs. ",
            suffix: ""
        },
        {
            id: 2,
            cardColor: "info",
            label: "Total Payments",
            badge: "ri-arrow-right-down-line",
            badgeClass: "danger",
            percentage: "-0.00",
            counter: totalPayments || 0,
            link: "View all payments",
            bgcolor: "info",
            icon: "bx bx-wallet",
            decimals: 0,
            prefix: "",
            suffix: ""
        },
        {
            id: 3,
            cardColor: "warning",
            label: "Clients",
            badge: "ri-arrow-right-up-line",
            badgeClass: "success",
            percentage: "+0.00",
            counter: totalClients || 0,
            link: "See details",
            bgcolor: "warning",
            icon: "bx bx-user-circle",
            decimals: 0,
            prefix: "",
            suffix: ""
        },
        {
            id: 4,
            cardColor: "primary",
            label: "Visits",
            badge: "ri-arrow-right-up-line",
            badgeClass: "success",
            percentage: "+0.00",
            counter: totalVisits || 0,
            link: "View visits",
            bgcolor: "primary",
            icon: "bx bx-conversation",
            decimals: 0,
            prefix: "",
            suffix: ""
        }
    ];

    return (
        <React.Fragment>
            {ecomWidgets.map((item: any, key: number) => (
                <Col xl={3} md={6} key={key}>
                    <Card className="card-animate">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1 overflow-hidden">
                                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">{item.label}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <h5 className={"fs-14 mb-0 text-" + item.badgeClass}>
                                        {item.badge ? <i className={"fs-13 align-middle " + item.badge}></i> : null} {item.percentage} %
                                    </h5>
                                </div>
                            </div>
                            <div className="d-flex align-items-end justify-content-between mt-4">
                                <div>
                                    <h4 className="fs-20 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="559.25">
                                        <CountUp
                                            start={0}
                                            prefix={item.prefix}
                                            suffix={item.suffix}
                                            separator={item.separator}
                                            end={item.counter}
                                            decimals={item.decimals}
                                            duration={4}
                                        />
                                    </span></h4>
                                    <Link href="#" className="text-decoration-underline">{item.link}</Link>
                                </div>
                                <div className="avatar-sm flex-shrink-0">
                                    <span className={"avatar-title rounded fs-3 bg-" + item.bgcolor+"-subtle"}>
                                        <i className={`text-${item.bgcolor} ${item.icon}`}></i>
                                    </span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>))}
        </React.Fragment>
    );
};

export default Widgets;