import React from "react";
import { Card } from "react-bootstrap";
import SimpleBar from "simplebar-react";

interface RecentActivityProps {
  rightColumn: boolean;
  hideRightColumn: () => void;
  recentActivities?: any[];
}

const RecentActivity = ({ rightColumn, hideRightColumn, recentActivities = [] }: RecentActivityProps) => {
  return (
    <React.Fragment>
       <div className={rightColumn ? "col-auto layout-rightside-col d-block" : "col-auto layout-rightside-col d-none"} id="layout-rightside-coll">
        <div className="overlay" onClick={hideRightColumn}></div>
        <div className="layout-rightside">
          <Card className="h-100 rounded-0">
            <Card.Body className="p-0">
              <div className="p-3">
                <h6 className="text-muted mb-0 text-uppercase fw-semibold">
                  Recent Activity
                </h6>
              </div>
              <SimpleBar style={{ maxHeight: "100vh" }} className="p-3 pt-0">
                <div className="acitivity-timeline acitivity-main">
                  {recentActivities.length > 0 ? recentActivities.map((activity: any, index: number) => (
                    <div className="acitivity-item d-flex" key={index}>
                      <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                        <div className={`avatar-title rounded-circle ${
                          activity.type === 'client' ? 'bg-success-subtle text-success' :
                          activity.type === 'payment' ? 'bg-primary-subtle text-primary' :
                          'bg-warning-subtle text-warning'
                        }`}>
                          <i className={`ri-${
                            activity.type === 'client' ? 'user-add-line' :
                            activity.type === 'payment' ? 'wallet-3-line' :
                            'calendar-event-line'
                          }`}></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1 lh-base">{activity.title}</h6>
                        <p className="text-muted mb-1">{activity.description}</p>
                        <small className="mb-0 text-muted">{new Date(activity.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No recent activities found.</p>
                    </div>
                  )}
                </div>
              </SimpleBar>
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default RecentActivity;
