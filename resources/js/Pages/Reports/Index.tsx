import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '../../Layouts';
import { Card, Col, Container, Row, Form, Button } from 'react-bootstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import TableContainer from '../../Components/Common/TableContainer';
import ReactApexChart from 'react-apexcharts';

const ReportsIndex = ({ followups, clients, staff, products, zones, filters }: any) => {
    const [filterData, setFilterData] = useState({
        staff_id: filters?.staff_id || '',
        client_id: filters?.client_id || '',
        product_id: filters?.product_id || '',
        zone_id: filters?.zone_id || '',
        area_id: filters?.area_id || '',
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
    });

    const handleFilterChange = (e: any) => {
        setFilterData({ ...filterData, [e.target.name]: e.target.value });
    };

    const handleFilterSubmit = (e: any) => {
        e.preventDefault();
        router.get(route('reports.index'), filterData, { preserveState: true });
    };

    const handleReset = () => {
        const emptyFilters = { staff_id: '', client_id: '', product_id: '', zone_id: '', area_id: '', start_date: '', end_date: '' };
        setFilterData(emptyFilters);
        router.get(route('reports.index'), emptyFilters, { preserveState: true });
    };

    // Chart Data Preparation
    const visitData: Record<string, number> = {};
    const staffData: Record<string, number> = {};

    followups.forEach((f: any) => {
        // Line Chart: Visits over time
        const d = new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        visitData[d] = (visitData[d] || 0) + 1;

        // Donut Chart: Visits by Staff
        const s = f.staff?.name || 'Unknown';
        staffData[s] = (staffData[s] || 0) + 1;
    });

    const lineSeries = [{ name: "Visits", data: Object.values(visitData) }];
    const lineOptions: any = {
        chart: { type: 'line', toolbar: { show: false } },
        xaxis: { categories: Object.keys(visitData) },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#405189'],
        markers: { size: 4 },
        title: { text: 'Visits Over Time', align: 'left' }
    };

    const donutSeries = Object.values(staffData);
    const donutOptions: any = {
        chart: { type: 'donut' },
        labels: Object.keys(staffData),
        title: { text: 'Visits by Staff', align: 'left' },
        legend: { position: 'bottom' }
    };

    const columns = useMemo(() => [
        { header: "Date", accessorKey: "date", enableColumnFilter: false, cell: (c: any) => new Date(c.getValue()).toLocaleDateString() },
        { header: "Client", accessorKey: "client.name", enableColumnFilter: false, cell: (c: any) => c.getValue() || "—" },
        { header: "Product", accessorKey: "client.product.name", enableColumnFilter: false, cell: (c: any) => c.getValue() || "—" },
        { header: "Staff", accessorKey: "staff.name", enableColumnFilter: false, cell: (c: any) => c.getValue() || "—" },
        { header: "Next Followup", accessorKey: "next_date", enableColumnFilter: false, cell: (c: any) => c.getValue() ? new Date(c.getValue()).toLocaleDateString() : "—" },
        { header: "Description", accessorKey: "description", enableColumnFilter: false, cell: (c: any) => c.getValue() || "—" },
    ], []);

    return (
        <React.Fragment>
            <Head title="Reports | SSM" />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Activity Reports" pageTitle="Management" />

                    <Card>
                        <Card.Header>
                            <h5 className="card-title mb-0">Filters</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleFilterSubmit}>
                                <Row className="g-3">
                                    <Col lg={2} sm={6}>
                                        <Form.Label>Staff Member</Form.Label>
                                        <Form.Select name="staff_id" value={filterData.staff_id} onChange={handleFilterChange}>
                                            <option value="">All Staff</option>
                                            {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col lg={2} sm={6}>
                                        <Form.Label>Client</Form.Label>
                                        <Form.Select name="client_id" value={filterData.client_id} onChange={handleFilterChange}>
                                            <option value="">All Clients</option>
                                            {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col lg={2} sm={6}>
                                        <Form.Label>Product</Form.Label>
                                        <Form.Select name="product_id" value={filterData.product_id} onChange={handleFilterChange}>
                                            <option value="">All Products</option>
                                            {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col lg={2} sm={6}>
                                        <Form.Label>Zone</Form.Label>
                                        <Form.Select name="zone_id" value={filterData.zone_id} onChange={(e) => setFilterData({ ...filterData, zone_id: e.target.value, area_id: '' })}>
                                            <option value="">All Zones</option>
                                            {zones?.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col lg={2} sm={6}>
                                        <Form.Label>Area</Form.Label>
                                        <Form.Select name="area_id" value={filterData.area_id} onChange={handleFilterChange} disabled={!filterData.zone_id}>
                                            <option value="">All Areas</option>
                                            {filterData.zone_id && zones?.find((z: any) => String(z.id) === String(filterData.zone_id))?.areas?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </Form.Select>
                                    </Col>
                                    <Col lg={2} sm={6}>
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control type="date" name="start_date" value={filterData.start_date} onChange={handleFilterChange} />
                                    </Col>
                                    <Col lg={2} sm={6}>
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control type="date" name="end_date" value={filterData.end_date} onChange={handleFilterChange} />
                                    </Col>
                                    <Col lg={2} sm={12} className="d-flex align-items-end">
                                        <Button variant="primary" type="submit" className="w-100 me-2">Apply</Button>
                                        <Button variant="light" type="button" className="w-100" onClick={handleReset}>Reset</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Row>
                        <Col xl={8}>
                            <Card>
                                <Card.Body>
                                    {Object.keys(visitData).length > 0 ? (
                                        <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={350} />
                                    ) : (
                                        <div className="text-center py-5">
                                            <h5 className="text-muted">No visit data available for this range.</h5>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xl={4}>
                            <Card>
                                <Card.Body>
                                    {Object.keys(staffData).length > 0 ? (
                                        <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={350} />
                                    ) : (
                                        <div className="text-center py-5">
                                            <h5 className="text-muted">No staff data available.</h5>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card>
                        <Card.Header>
                            <h5 className="card-title mb-0">Filtered Records</h5>
                        </Card.Header>
                        <Card.Body>
                            <TableContainer
                                columns={columns}
                                data={followups || []}
                                isGlobalFilter={false}
                                customPageSize={10}
                                divClass="table-responsive table-card mb-1"
                                tableClass="align-middle table-nowrap"
                                theadClass="table-light text-muted"
                            />
                        </Card.Body>
                    </Card>

                </Container>
            </div>
        </React.Fragment>
    );
};

ReportsIndex.layout = (page: any) => <Layout children={page} />;
export default ReportsIndex;
