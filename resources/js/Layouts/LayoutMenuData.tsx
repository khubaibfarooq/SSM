import { Inertia } from "@inertiajs/inertia";
import React, { useEffect, useState } from "react";

const Navdata = () => {
    const [isDashboard, setIsDashboard] = useState<boolean>(false);
    const [isSaleManagement, setIsSaleManagement] = useState<boolean>(false);
    const [iscurrentState, setIscurrentState] = useState('Dashboard');

    function updateIconSidebar(e: any) {
        if (e && e.target && e.target.getAttribute("sub-items")) {
            const ul: any = document.getElementById("two-column-menu");
            const iconItems: any = ul.querySelectorAll(".nav-icon.active");
            let activeIconItems = [...iconItems];
            activeIconItems.forEach((item) => {
                item.classList.remove("active");
                var id = item.getAttribute("sub-items");
                const getID: any = document.getElementById(id) as HTMLElement;
                if (getID) getID?.parentElement.classList.remove("show");
            });
        }
    }

    useEffect(() => {
        document.body.classList.remove('twocolumn-panel');
        if (iscurrentState !== 'Dashboard') setIsDashboard(false);
        if (iscurrentState !== 'SaleManagement') setIsSaleManagement(false);
    }, [history, iscurrentState, isDashboard, isSaleManagement]);

    const menuItems: any = [
        { label: "Menu", isHeader: true },
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "ri-dashboard-2-line",
            link: "/dashboard",
            stateVariables: isDashboard,
            click: function (e: any) {
                e.preventDefault();
                setIsDashboard(!isDashboard);
                setIscurrentState('Dashboard');
                updateIconSidebar(e);
            },
        },
        { label: "Sale Management", isHeader: true },
        {
            id: "sale-management",
            label: "Sale Management",
            icon: "ri-shopping-cart-2-line",
            link: "/#",
            stateVariables: isSaleManagement,
            click: function (e: any) {
                e.preventDefault();
                setIsSaleManagement(!isSaleManagement);
                setIscurrentState('SaleManagement');
                updateIconSidebar(e);
            },
            subItems: [
                { id: "plans",     label: "Plans",     link: "/plans",     parentId: "sale-management" },
                { id: "followups", label: "Followups", link: "/followups", parentId: "sale-management" },
                { id: "payments",  label: "Payments",  link: "/payments",  parentId: "sale-management" },
                { id: "users",     label: "Users",     link: "/users",     parentId: "sale-management" },
            ],
        },
    ];

    return <div>{menuItems}</div>;
};

export { Navdata };
export default Navdata;

