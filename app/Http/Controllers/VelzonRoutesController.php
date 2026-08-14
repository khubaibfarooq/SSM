<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Payment;
use App\Models\Followup;

class VelzonRoutesController extends Controller
{
    // dashboard

    private function getDashboardData(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return [];
        }

        $startDate = $request->input('start_date') ? \Carbon\Carbon::parse($request->input('start_date'))->startOfDay() : now()->startOfMonth();
        $endDate = $request->input('end_date') ? \Carbon\Carbon::parse($request->input('end_date'))->endOfDay() : now()->endOfMonth();

        $activities = collect();
        $isAdmin = $user->hasRole(['superadmin', 'admin']);
        $top_staff = [];
        $top_clients = [];

        if ($isAdmin) {
            $total_revenue = Payment::whereBetween('created_at', [$startDate, $endDate])->sum('amount');
            $total_clients = User::role('client')->whereBetween('created_at', [$startDate, $endDate])->count();
            $total_followups = Followup::whereBetween('created_at', [$startDate, $endDate])->count();
            $total_payments = Payment::whereBetween('created_at', [$startDate, $endDate])->count();

            $recent_clients = User::role('client')->whereBetween('created_at', [$startDate, $endDate])->latest()->take(10)->get();
            $recent_payments = Payment::with('fromUser')->whereBetween('created_at', [$startDate, $endDate])->latest()->take(10)->get();
            $recent_followups = Followup::with('client')->whereBetween('created_at', [$startDate, $endDate])->latest()->take(10)->get();
            
            $top_staff = Payment::whereBetween('created_at', [$startDate, $endDate])
                ->with('byUser')
                ->selectRaw('by_user_id, SUM(amount) as total_amount, COUNT(id) as transactions')
                ->groupBy('by_user_id')
                ->orderByDesc('total_amount')
                ->take(5)
                ->get()
                ->map(function ($payment) {
                    return [
                        'name' => $payment->byUser->name ?? 'Unknown',
                        'email' => $payment->byUser->email ?? '',
                        'total_amount' => $payment->total_amount,
                        'transactions' => $payment->transactions,
                    ];
                });

            $top_clients = Payment::whereBetween('created_at', [$startDate, $endDate])
                ->with('fromUser')
                ->selectRaw('from_user_id, SUM(amount) as total_amount, COUNT(id) as transactions')
                ->groupBy('from_user_id')
                ->orderByDesc('total_amount')
                ->take(5)
                ->get()
                ->map(function ($payment) {
                    return [
                        'name' => $payment->fromUser->name ?? 'Unknown',
                        'email' => $payment->fromUser->email ?? '',
                        'total_amount' => $payment->total_amount,
                        'transactions' => $payment->transactions,
                    ];
                });
        } else {
            $total_revenue = Payment::where('by_user_id', $user->id)->whereBetween('created_at', [$startDate, $endDate])->sum('amount');
            $total_followups = Followup::where('by_user_id', $user->id)->whereBetween('created_at', [$startDate, $endDate])->count();
            $total_payments = Payment::where('by_user_id', $user->id)->whereBetween('created_at', [$startDate, $endDate])->count();
            
            $clientIdsFromPayments = Payment::where('by_user_id', $user->id)->pluck('from_user_id')->toArray();
            $clientIdsFromFollowups = Followup::where('by_user_id', $user->id)->pluck('user_id')->toArray();
            $clientIds = array_unique(array_merge($clientIdsFromPayments, $clientIdsFromFollowups));
            
            $total_clients = User::whereIn('id', $clientIds)->whereBetween('created_at', [$startDate, $endDate])->count();

            $recent_clients = User::whereIn('id', $clientIds)->whereBetween('created_at', [$startDate, $endDate])->latest()->take(10)->get();
            $recent_payments = Payment::with('fromUser')->where('by_user_id', $user->id)->whereBetween('created_at', [$startDate, $endDate])->latest()->take(10)->get();
            $recent_followups = Followup::with('client')->where('by_user_id', $user->id)->whereBetween('created_at', [$startDate, $endDate])->latest()->take(10)->get();
        }

        foreach($recent_clients as $c) {
            $activities->push([
                'type' => 'client',
                'title' => 'New Client Added',
                'description' => $c->name,
                'date' => $c->created_at->toIso8601String()
            ]);
        }
        foreach($recent_payments as $p) {
            $activities->push([
                'type' => 'payment',
                'title' => 'Payment Received',
                'description' => 'Rs. ' . number_format($p->amount, 2) . ' from ' . ($p->fromUser->name ?? 'Unknown'),
                'date' => $p->created_at->toIso8601String()
            ]);
        }
        foreach($recent_followups as $f) {
            $activities->push([
                'type' => 'followup',
                'title' => 'Followup Recorded',
                'description' => 'For ' . ($f->client->name ?? 'Unknown'),
                'date' => $f->created_at->toIso8601String()
            ]);
        }

        $recent_activities = $activities->sortByDesc('date')->take(10)->values()->all();

        // Chart Data (Filtered Dates)
        $chartCategories = [];
        $paymentData = [];
        $followupData = [];

        // Safety check to prevent generating a massive loop if someone passes a 10 year span
        // Limit graph generation to maximum of 90 days.
        $graphStartDate = $startDate->copy();
        if ($startDate->diffInDays($endDate) > 90) {
            $graphStartDate = $endDate->copy()->subDays(90);
        }

        $period = \Carbon\CarbonPeriod::create($graphStartDate, '1 day', $endDate);
        foreach ($period as $date) {
            $dateString = $date->format('Y-m-d');
            $chartCategories[] = $date->format('M d');

            $paymentQuery = Payment::whereDate('created_at', $dateString);
            $followupQuery = Followup::whereDate('created_at', $dateString);

            if (!$user->hasRole(['superadmin', 'admin'])) {
                $paymentQuery->where('by_user_id', $user->id);
                $followupQuery->where('by_user_id', $user->id);
            }

            $paymentData[] = $paymentQuery->sum('amount');
            $followupData[] = $followupQuery->count();
        }

        $chart_data = [
            'categories' => $chartCategories,
            'series' => [
                [
                    'name' => 'Payments (Rs)',
                    'type' => 'area',
                    'data' => $paymentData
                ],
                [
                    'name' => 'Followups',
                    'type' => 'line',
                    'data' => $followupData
                ]
            ]
        ];

        $sales_by_zones = [];
        if ($isAdmin) {
            $sales_by_zones = \App\Models\Payment::join('users', 'payments.from_user_id', '=', 'users.id')
                ->join('areas', 'users.area_id', '=', 'areas.id')
                ->join('zones', 'areas.zone_id', '=', 'zones.id')
                ->whereBetween('payments.created_at', [$startDate, $endDate])
                ->selectRaw('zones.name, sum(payments.amount) as total')
                ->groupBy('zones.name')
                ->orderByDesc('total')
                ->get();
        }

        return [
            'total_revenue' => $total_revenue,
            'total_clients' => $total_clients,
            'total_followups' => $total_followups,
            'total_payments' => $total_payments,
            'recent_activities' => $recent_activities,
            'chart_data' => $chart_data,
            'is_admin' => $isAdmin,
            'top_staff' => $top_staff,
            'top_clients' => $top_clients,
            'sales_by_zones' => $sales_by_zones,
            'zones' => \App\Models\Zone::with('areas')->get(),
            'filters' => [
                'start_date' => $startDate->format('d M, Y'),
                'end_date' => $endDate->format('d M, Y'),
            ]
        ];
    }

    public function index(Request $request)
    {
        return Inertia::render('DashboardEcommerce/index', $this->getDashboardData($request));
    }

    public function dashboard_analytics()
    {
        return Inertia::render('DashboardAnalytics/index');
    }

    public function dashboard_crm()
    {
        return Inertia::render('DashboardCrm/index');
    }

    public function dashboard(Request $request)
    {
        return Inertia::render('DashboardEcommerce/index', $this->getDashboardData($request));
    }

    public function dashboard_crypto()
    {
        return Inertia::render('DashboardCrypto/index');
    }

    public function dashboard_projects()
    {
        return Inertia::render('DashboardProject/index');
    }

    public function dashboard_nft()
    {
        return Inertia::render('DashboardNFT/index');
    }

    public function dashboard_job()
    {
        return Inertia::render('DashboardJob/index');
    }

    public function dashboard_blog()
    {
        return Inertia::render('DashboardBlog/index');
    }

    // apps

    public function apps_calendar()
    {
        return Inertia::render('Calendar/index');
    }

    public function apps_calendar_month_grid()
    {
        return Inertia::render('Calendar/monthGrid');
    }

    public function apps_ecommerce_products()
    {
        return Inertia::render('Ecommerce/EcommerceProducts/index');
    }

    public function apps_ecommerce_product_details()
    {
        return Inertia::render('Ecommerce/EcommerceProducts/EcommerceProductDetail');
    }

    public function apps_ecommerce_add_product()
    {
        return Inertia::render('Ecommerce/EcommerceProducts/EcommerceAddProduct');
    }

    public function apps_ecommerce_order_details()
    {
        return Inertia::render('Ecommerce/EcommerceOrders/EcommerceOrderDetail');
    }

    public function apps_ecommerce_customers()
    {
        return Inertia::render('Ecommerce/EcommerceCustomers/index');
    }

    public function apps_ecommerce_cart()
    {
        return Inertia::render('Ecommerce/EcommerceCart');
    }

    public function apps_ecommerce_checkout()
    {
        return Inertia::render('Ecommerce/EcommerceCheckout');
    }

    public function apps_ecommerce_sellers()
    {
        return Inertia::render('Ecommerce/EcommerceSellers/index');
    }

    public function apps_ecommerce_seller_details()
    {
        return Inertia::render('Ecommerce/EcommerceSellers/EcommerceSellerDetail');
    }

    public function apps_file_manager()
    {
        return Inertia::render('FileManager/index');
    }

    public function apps_todo()
    {
        return Inertia::render('ToDo/index');
    }

    public function apps_chat()
    {
        return Inertia::render('Chat/index');
    }

    public function apps_mailbox()
    {
        return Inertia::render('EmailInbox/index');
    }

    public function apps_email_basic()
    {
        return Inertia::render('Email/EmailTemplates/BasicAction/index');
    }

    public function apps_email_ecommerce()
    {
        return Inertia::render('Email/EmailTemplates/EcommerceAction/index');
    }

    public function apps_projects_list()
    {
        return Inertia::render('Projects/ProjectList/index');
    }

    public function apps_projects_overview()
    {
        return Inertia::render('Projects/ProjectOverview/index');
    }

    public function apps_projects_create()
    {
        return Inertia::render('Projects/CreateProject/index');
    }

    public function apps_tasks_list_view()
    {
        return Inertia::render('Tasks/TaskList/index');
    }

    public function apps_tasks_details()
    {
        return Inertia::render('Tasks/TaskDetails/index');
    }

    public function apps_tasks_kanban()
    {
        return Inertia::render('Tasks/KanbanBoard/index');
    }

    public function apps_api_key()
    {
        return Inertia::render('APIKey/index');
    }

    public function apps_crm_contacts()
    {
        return Inertia::render('Crm/CrmContacts');
    }

    public function apps_crm_companies()
    {
        return Inertia::render('Crm/CrmCompanies');
    }

    public function apps_crm_deals()
    {
        return Inertia::render('Crm/CrmDeals/index');
    }

    public function apps_crm_leads()
    {
        return Inertia::render('Crm/CrmLeads/index');
    }

    public function apps_invoices_list()
    {
        return Inertia::render('Invoices/InvoiceList');
    }

    public function apps_invoices_details()
    {
        return Inertia::render('Invoices/InvoiceDetails');
    }

    public function apps_invoices_create()
    {
        return Inertia::render('Invoices/InvoiceCreate');
    }

    public function apps_tickets_list()
    {
        return Inertia::render('SupportTickets/ListView/index');
    }

    public function apps_tickets_details()
    {
        return Inertia::render('SupportTickets/TicketsDetails/index');
    }

    public function apps_crypto_transactions()
    {
        return Inertia::render('Crypto/Transactions/index');
    }

    public function apps_crypto_buy_sell()
    {
        return Inertia::render('Crypto/BuySell/index');
    }

    public function apps_crypto_orders()
    {
        return Inertia::render('Crypto/CryptoOrder/index');
    }

    public function apps_crypto_wallet()
    {
        return Inertia::render('Crypto/MyWallet/index');
    }

    public function apps_crypto_ico()
    {
        return Inertia::render('Crypto/ICOList/index');
    }

    public function apps_crypto_kyc()
    {
        return Inertia::render('Crypto/KYCVerification/index');
    }

    public function apps_nft_marketplace()
    {
        return Inertia::render('NFTMarketplace/Marketplace/index');
    }

    public function apps_nft_collections()
    {
        return Inertia::render('NFTMarketplace/Collections/index');
    }

    public function apps_nft_create()
    {
        return Inertia::render('NFTMarketplace/CreateNFT/index');
    }

    public function apps_nft_creators()
    {
        return Inertia::render('NFTMarketplace/Creators/index');
    }

    public function apps_nft_explore()
    {
        return Inertia::render('NFTMarketplace/ExploreNow/index');
    }

    public function apps_nft_item_details()
    {
        return Inertia::render('NFTMarketplace/Itemdetails/index');
    }

    public function apps_nft_auction()
    {
        return Inertia::render('NFTMarketplace/LiveAuction/index');
    }

    public function apps_nft_ranking()
    {
        return Inertia::render('NFTMarketplace/Ranking/index');
    }

    public function apps_nft_wallet()
    {
        return Inertia::render('NFTMarketplace/WalletConnect/index');
    }

    public function apps_job_statistics()
    {
        return Inertia::render('Jobs/Statistics/index');
    }

    public function apps_job_lists()
    {
        return Inertia::render('Jobs/JobList/List/index');
    }

    public function apps_job_grid_lists()
    {
        return Inertia::render('Jobs/JobList/Grid/index');
    }

    public function apps_job_details()
    {
        return Inertia::render('Jobs/JobList/Overview/index');
    }

    public function apps_job_candidate_lists()
    {
        return Inertia::render('Jobs/CandidateList/ListView/index');
    }

    public function apps_job_candidate_grid()
    {
        return Inertia::render('Jobs/CandidateList/GridView/index');
    }

    public function apps_job_application()
    {
        return Inertia::render('Jobs/Application/index');
    }

    public function apps_job_new()
    {
        return Inertia::render('Jobs/NewJob/index');
    }

    public function apps_job_companies_lists()
    {
        return Inertia::render('Jobs/CompaniesList/index');
    }

    public function apps_job_categories()
    {
        return Inertia::render('Jobs/JobCategories/index');
    }

    // charts

    public function charts_apex_line()
    {
        return Inertia::render('Charts/ApexCharts/LineCharts/index');
    }

    public function charts_apex_area()
    {
        return Inertia::render('Charts/ApexCharts/AreaCharts/index');
    }

    public function charts_apex_column()
    {
        return Inertia::render('Charts/ApexCharts/ColumnCharts/index');
    }

    public function charts_apex_bar()
    {
        return Inertia::render('Charts/ApexCharts/BarCharts/index');
    }

    public function charts_apex_mixed()
    {
        return Inertia::render('Charts/ApexCharts/MixedCharts/index');
    }

    public function charts_apex_timeline()
    {
        return Inertia::render('Charts/ApexCharts/TimelineCharts/index');
    }

    public function charts_apex_range_area()
    {
        return Inertia::render('Charts/ApexCharts/RangeAreaCharts/Index');
    }

    public function charts_apex_funnel()
    {
        return Inertia::render('Charts/ApexCharts/FunnelCharts/Index');
    }

    public function charts_apex_candlestick()
    {
        return Inertia::render('Charts/ApexCharts/CandlestickChart/index');
    }

    public function charts_apex_boxplot()
    {
        return Inertia::render('Charts/ApexCharts/BoxplotCharts/index');
    }

    public function charts_apex_bubble()
    {
        return Inertia::render('Charts/ApexCharts/BubbleChart/index');
    }

    public function charts_apex_scatter()
    {
        return Inertia::render('Charts/ApexCharts/ScatterCharts/index');
    }

    public function charts_apex_heatmap()
    {
        return Inertia::render('Charts/ApexCharts/HeatmapCharts/index');
    }

    public function charts_apex_treemap()
    {
        return Inertia::render('Charts/ApexCharts/TreemapCharts/index');
    }

    public function charts_apex_pie()
    {
        return Inertia::render('Charts/ApexCharts/PieCharts/index');
    }

    public function charts_apex_radialbar()
    {
        return Inertia::render('Charts/ApexCharts/RadialbarCharts/index');
    }

    public function charts_apex_radar()
    {
        return Inertia::render('Charts/ApexCharts/RadarCharts/index');
    }

    public function charts_apex_polar()
    {
        return Inertia::render('Charts/ApexCharts/PolarCharts/index');
    }

    public function charts_apex_slope()
    {
        return Inertia::render('Charts/ApexCharts/SlopeCharts/index');
    }

    public function charts_chartjs()
    {
        return Inertia::render('Charts/ChartsJs/index');
    }

    public function charts_echarts()
    {
        return Inertia::render('Charts/ECharts/index');
    }

    // ui

    public function ui_alerts()
    {
        return Inertia::render('BaseUi/UiAlerts/UiAlerts');
    }

    public function ui_badges()
    {
        return Inertia::render('BaseUi/UiBadges/UiBadges');
    }

    public function ui_buttons()
    {
        return Inertia::render('BaseUi/UiButtons/UiButtons');
    }

    public function ui_colors()
    {
        return Inertia::render('BaseUi/UiColors/UiColors');
    }

    public function ui_cards()
    {
        return Inertia::render('BaseUi/UiCards/UiCards');
    }

    public function ui_carousel()
    {
        return Inertia::render('BaseUi/UiCarousel/UiCarousel');
    }

    public function ui_dropdowns()
    {
        return Inertia::render('BaseUi/UiDropdowns/UiDropdowns');
    }

    public function ui_grid()
    {
        return Inertia::render('BaseUi/UiGrid/UiGrid');
    }

    public function ui_images()
    {
        return Inertia::render('BaseUi/UiImages/UiImages');
    }

    public function ui_tabs()
    {
        return Inertia::render('BaseUi/UiTabs/UiTabs');
    }

    public function ui_accordions()
    {
        return Inertia::render('BaseUi/UiAccordion&Collapse/UiAccordion&Collapse');
    }

    public function ui_modals()
    {
        return Inertia::render('BaseUi/UiModals/UiModals');
    }

    public function ui_offcanvas()
    {
        return Inertia::render('BaseUi/UiOffcanvas/UiOffcanvas');
    }

    public function ui_placeholders()
    {
        return Inertia::render('BaseUi/UiPlaceholders/UiPlaceholders');
    }

    public function ui_progress()
    {
        return Inertia::render('BaseUi/UiProgress/UiProgress');
    }

    public function ui_notifications()
    {
        return Inertia::render('BaseUi/UiNotifications/UiNotifications');
    }

    public function ui_media()
    {
        return Inertia::render('BaseUi/UiMediaobject/UiMediaobject');
    }

    public function ui_embed_video()
    {
        return Inertia::render('BaseUi/UiEmbedVideo/UiEmbedVideo');
    }

    public function ui_typography()
    {
        return Inertia::render('BaseUi/UiTypography/UiTypography');
    }

    public function ui_lists()
    {
        return Inertia::render('BaseUi/UiLists/UiLists');
    }

    public function ui_links()
    {
        return Inertia::render('BaseUi/UiLinks/UiLinks');
    }

    public function ui_general()
    {
        return Inertia::render('BaseUi/UiGeneral/UiGeneral');
    }

    public function ui_ribbons()
    {
        return Inertia::render('BaseUi/UiRibbons/UiRibbons');
    }

    public function ui_utilities()
    {
        return Inertia::render('BaseUi/UiUtilities/UiUtilities');
    }

    // advanced-ui

    public function advance_ui_scrollbar()
    {
        return Inertia::render('AdvanceUi/UiScrollbar/UiScrollbar');
    }

    public function advance_ui_swiper()
    {
        return Inertia::render('AdvanceUi/UiSwiperSlider/UiSwiperSlider');
    }

    public function advance_ui_ratings()
    {
        return Inertia::render('AdvanceUi/UiRatings/UiRatings');
    }

    public function advance_ui_highlight()
    {
        return Inertia::render('AdvanceUi/UiHighlight/UiHighlight');
    }

    // widgets

    public function widgets()
    {
        return Inertia::render('Widgets/Index');
    }

    // forms

    public function forms_elements()
    {
        return Inertia::render('Forms/BasicElements/BasicElements');
    }

    public function forms_select()
    {
        return Inertia::render('Forms/FormSelect/FormSelect');
    }

    public function forms_checkboxes_radios()
    {
        return Inertia::render('Forms/CheckboxAndRadio/CheckBoxAndRadio');
    }

    public function forms_pickers()
    {
        return Inertia::render('Forms/FormPickers/FormPickers');
    }

    public function forms_masks()
    {
        return Inertia::render('Forms/Masks/Masks');
    }

    public function forms_advanced()
    {
        return Inertia::render('Forms/FormAdvanced/FormAdvanced');
    }

    public function forms_range_sliders()
    {
        return Inertia::render('Forms/FormRangeSlider/FormRangeSlider');
    }

    public function forms_validation()
    {
        return Inertia::render('Forms/FormValidation/FormValidation');
    }

    public function forms_wizard()
    {
        return Inertia::render('Forms/FormWizard/FormWizard');
    }

    public function forms_editors()
    {
        return Inertia::render('Forms/FormEditor/FormEditor');
    }

    public function forms_file_uploads()
    {
        return Inertia::render('Forms/FileUpload/FileUpload');
    }

    public function forms_layouts()
    {
        return Inertia::render('Forms/FormLayouts/Formlayouts');
    }

    public function forms_select2()
    {
        return Inertia::render('Forms/Select2/Select2');
    }

    // tables

    public function tables_basic()
    {
        return Inertia::render('Tables/BasicTables/BasicTables');
    }

    public function tables_react()
    {
        return Inertia::render('Tables/ReactTables/index');
    }


    // icons

    public function icons_remix()
    {
        return Inertia::render('Icons/RemixIcons/RemixIcons');
    }

    public function icons_boxicons()
    {
        return Inertia::render('Icons/BoxIcons/BoxIcons');
    }

    public function icons_materialdesign()
    {
        return Inertia::render('Icons/MaterialDesign/MaterialDesign');
    }

    public function icons_feather()
    {
        return Inertia::render('Icons/FeatherIcons/FeatherIcons');
    }

    public function icons_lineawesome()
    {
        return Inertia::render('Icons/LineAwesomeIcons/LineAwesomeIcons');
    }

    public function icons_crypto()
    {
        return Inertia::render('Icons/CryptoIcons/CryptoIcons');
    }

    // map

    public function maps_google()
    {
        return Inertia::render('Maps/GoogleMaps/GoogleMaps');
    }

    // pages

    public function pages_starter()
    {
        return Inertia::render('Pages/Starter/Starter');
    }

    public function pages_profile()
    {
        return Inertia::render('Pages/Profile/SimplePage/SimplePage');
    }

    public function pages_profile_settings()
    {
        return Inertia::render('Pages/Profile/Settings/Settings');
    }

    public function pages_team()
    {
        return Inertia::render('Pages/Team/Team');
    }

    public function pages_timeline()
    {
        return Inertia::render('Pages/Timeline/Timeline');
    }

    public function pages_faqs()
    {
        return Inertia::render('Pages/Faqs/Faqs');
    }

    public function pages_gallery()
    {
        return Inertia::render('Pages/Gallery/Gallery');
    }

    public function pages_pricing()
    {
        return Inertia::render('Pages/Pricing/Pricing');
    }

    public function pages_search_results()
    {
        return Inertia::render('Pages/SearchResults/SearchResults');
    }

    public function pages_sitemap()
    {
        return Inertia::render('Pages/SiteMap/SiteMap');
    }

    public function pages_privacy_policy()
    {
        return Inertia::render('Pages/PrivacyPolicy/index');
    }

    public function pages_terms_condition()
    {
        return Inertia::render('Pages/TermsCondition/index');
    }

    public function pages_blog_grid()
    {
        return Inertia::render('Pages/Blogs/GridView/index');
    }

    public function pages_blog_list()
    {
        return Inertia::render('Pages/Blogs/ListView/index');
    }

    public function pages_blog_overview()
    {
        return Inertia::render('Pages/Blogs/Overview/index');
    }

    public function pages_maintenance()
    {
        return Inertia::render('Pages/Maintenance/Maintenance');
    }

    public function pages_coming_soon()
    {
        return Inertia::render('Pages/ComingSoon/ComingSoon');
    }

    // auth inner

    public function auth_signin_basic()
    {
        return Inertia::render('AuthInner/Login/BasicSignIn');
    }

    public function auth_signin_cover()
    {
        return Inertia::render('AuthInner/Login/CoverSignIn');
    }

    public function auth_signup_basic()
    {
        return Inertia::render('AuthInner/Register/BasicSignUp');
    }

    public function auth_signup_cover()
    {
        return Inertia::render('AuthInner/Register/CoverSignUp');
    }

    public function auth_pass_reset_basic()
    {
        return Inertia::render('AuthInner/PasswordReset/BasicPasswReset');
    }

    public function auth_pass_reset_cover()
    {
        return Inertia::render('AuthInner/PasswordReset/CoverPasswReset');
    }

    public function auth_lockscreen_basic()
    {
        return Inertia::render('AuthInner/LockScreen/BasicLockScr');
    }

    public function auth_lockscreen_cover()
    {
        return Inertia::render('AuthInner/LockScreen/CoverLockScr');
    }

    public function auth_logout_basic()
    {
        return Inertia::render('AuthInner/Logout/BasicLogout');
    }

    public function auth_logout_cover()
    {
        return Inertia::render('AuthInner/Logout/CoverLogout');
    }

    public function auth_success_msg_basic()
    {
        return Inertia::render('AuthInner/SuccessMessage/BasicSuccessMsg');
    }

    public function auth_success_msg_cover()
    {
        return Inertia::render('AuthInner/SuccessMessage/CoverSuccessMsg');
    }

    public function auth_twostep_basic()
    {
        return Inertia::render('AuthInner/TwoStepVerification/BasicTwosVerify');
    }

    public function auth_twostep_cover()
    {
        return Inertia::render('AuthInner/TwoStepVerification/CoverTwosVerify');
    }

    public function auth_404_basic()
    {
        return Inertia::render('AuthInner/Error/Basic404');
    }

    public function auth_404_cover()
    {
        return Inertia::render('AuthInner/Error/Cover404');
    }

    public function auth_404_alt()
    {
        return Inertia::render('AuthInner/Error/Alt404');
    }

    public function auth_500()
    {
        return Inertia::render('AuthInner/Error/Error500');
    }

    public function auth_pass_change_basic()
    {
        return Inertia::render('AuthInner/PasswordCreate/BasicPasswCreate');
    }

    public function auth_pass_change_cover()
    {
        return Inertia::render('AuthInner/PasswordCreate/CoverPasswCreate');
    }

    public function auth_offline()
    {
        return Inertia::render('AuthInner/Error/Offlinepage');
    }

    // Landing

    public function landing()
    {
        return Inertia::render('Landing/OnePage/index');
    }

    public function nft_landing()
    {
        return Inertia::render('Landing/NFTLanding/index');
    }

    public function job_landing()
    {
        return Inertia::render('Landing/Job_Landing/index');
    }

    public function profile()
    {
        return Inertia::render('Auth/user-profile');
    }
}
