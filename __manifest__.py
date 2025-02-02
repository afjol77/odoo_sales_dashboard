# -*- coding: utf-8 -*-
{
    'name' : 'Odoo Sales Dashboard',
    'author': 'Afjol Hussain (afjolhussain59@gmail.com)',
    'version' : '17.0.1.0',
    'summary': 'Odoo Sales Dashboard',
    'sequence': -100,
    'description': """ Custom dashboard module for Sales """,
    'category': 'dashboard',
    'website': 'https://www.odoo.com/',
    'depends' : ['base','web', 'sale_management', 'sale', 'stock','crm'],
    'data': [
        'views/dashboard_view.xml',
    ],
    'demo': [],
    'assets': {
        'web.assets_backend': [
            'odoo_sales_dashboard/static/src/js/sales_dashboard.js',
            'odoo_sales_dashboard/static/src/xml/sales_dashboard_view.xml',
            'odoo_sales_dashboard/static/src/css/sales_dashboard.css',
        ],
    },
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
