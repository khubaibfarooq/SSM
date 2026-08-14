import React from "react";
import { Card } from "react-bootstrap";
import { RevenueCharts } from "./DashboardEcommerceCharts";

const Revenue = ({ chartData }: any) => {
  return (
    <React.Fragment>
      <Card>
        <Card.Header className="border-0 align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">Activity Overview</h4>
        </Card.Header>

        <Card.Body className="p-0 pb-2">
          <div className="w-100">
            <div dir="ltr">
              <RevenueCharts 
                series={chartData?.series || []} 
                categories={chartData?.categories || []} 
                dataColors='["--vz-success", "--vz-primary"]' 
              />
            </div>
          </div>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

export default Revenue;
