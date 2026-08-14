import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Col, Container, Row } from 'react-bootstrap';

import Layout from '../../Layouts';
import Widgets from './Widgets';
import Section from './Section';
import Revenue from './Revenue';
import SalesByZones from './SalesByZones';
import TopStaff from './TopStaff';
import TopClients from './TopClients';
import StoreVisits from './StoreVisits';
import RecentOrders from './RecentOrders';
import RecentActivity from './RecentActivity';

export default function Dashboard({ total_revenue, total_clients, total_followups, total_payments, recent_activities, chart_data, filters, is_admin, top_staff, top_clients, sales_by_zones, zones }: any) {

  const [rightColumn, setRightColumn] = useState<boolean>(false);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  return (
    <React.Fragment>
      <Head title='Dashboard | SSM - Software Sale Management' />
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <div className="h-100">
                <Section rightClickBtn={toggleRightColumn} filters={filters} zones={zones} />
                <Row>
                  <Widgets 
                    totalRevenue={total_revenue} 
                    totalClients={total_clients} 
                    totalFollowups={total_followups} 
                    totalPayments={total_payments} 
                  />
                </Row>
                <Row>
                  <Col xl={8}>
                    <Revenue chartData={chart_data} />
                  </Col>
                  {is_admin && <SalesByZones salesByZones={sales_by_zones} />}
                </Row>
                {is_admin && (
                  <Row>
                    <TopStaff topStaff={top_staff} />
                    <TopClients topClients={top_clients} />
                  </Row>
                )}
                <Row>
                  <StoreVisits />
                  <RecentOrders />
                </Row>
              </div>
            </Col>
            <RecentActivity rightColumn={rightColumn} hideRightColumn={toggleRightColumn} recentActivities={recent_activities} />
          </Row>
        </Container >
      </div >
    </React.Fragment >
  );
}
Dashboard.layout = (page: any) => <Layout children={page} />;