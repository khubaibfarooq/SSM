import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const Navdata = () => {
    const [isDashboard, setIsDashboard] = useState<boolean>(false);
    const [isSaleManagement, setIsSaleManagement] = useState<boolean>(false);
    const [iscurrentState, setIscurrentState] = useState('Dashboard');

    const { auth } = usePage().props as any;
    const userRoles = auth?.roles || [];
    const userPermissions = auth?.permissions || [];

    // Helper to check access
    const can = (permission: string) => userRoles.includes('superadmin') || userPermissions.includes(permission);

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
                (can('manage reports') || userRoles.includes('superadmin') || userRoles.includes('admin')) && { id: "reports", label: "Reports", link: "/reports", parentId: "sale-management" },
                { id: "calendar-report", label: "Calendar Report", link: "/reports/calendar", parentId: "sale-management" },
                (userRoles.includes('Staff') || userRoles.includes('Manager') || userRoles.includes('superadmin') || userRoles.includes('admin')) && { id: "tasks", label: "Tasks", link: "/tasks", parentId: "sale-management" },
                (can('manage plans') || userRoles.includes('superadmin')) && { id: "products", label: "Products", link: "/products", parentId: "sale-management" },
                (can('manage plans') || userRoles.includes('superadmin')) && { id: "plans", label: "Plans", link: "/plans", parentId: "sale-management" },

                (can('manage payments') || userRoles.includes('superadmin')) && { id: "payments", label: "Payments", link: "/payments", parentId: "sale-management" },
                { id: "tickets", label: "Help Desk", link: "/tickets", parentId: "sale-management" },
                (can('manage users') || userRoles.includes('superadmin')) && { id: "users", label: "Users", link: "/users", parentId: "sale-management" },
                (can('manage clients') || userRoles.includes('superadmin')) && { id: "clients", label: "Clients", link: "/clients", parentId: "sale-management" },
                (userRoles.includes('admin') || userRoles.includes('superadmin')) && { id: "locations", label: "Locations", link: "/locations", parentId: "sale-management" },
                userRoles.includes('superadmin') && { id: "roles", label: "Roles", link: "/roles", parentId: "sale-management" },
                userRoles.includes('superadmin') && { id: "permissions", label: "Permissions", link: "/permissions", parentId: "sale-management" },
            ].filter(Boolean),
        },
    ];

    return <div>{menuItems}</div>;
};

export { Navdata };
export default Navdata;

