# -*- coding: utf-8 -*-
{
    'name' : 'Odoo Supply Chain Dashboard',
    'author': 'Afjol Hussain (afjolhussain59@gmail.com)',
    'version' : '17.0.1.0',
    'summary': 'Odoo Supply Chain Dashboard',
    'sequence': -100,
    'description': """ Custom dashboard module for supply chain management """,
    'category': 'dashboard',
    'website': 'https://www.odoo.com/',
    'depends' : ['base','web', 'sale_management', 'sale', 'stock','crm', 'account', 'purchase'],
    'data': [
        'views/dashboard_view.xml',
    ],
    'demo': [],
    'assets': {
        'web.assets_backend': [
            'odoo_supply_chain_dashboard/static/src/js/supply_chain_dashboard.js',
            'odoo_supply_chain_dashboard/static/src/xml/supply_chain_dashboard_view.xml',
        ],
        'web.assets_qweb': [
        ],
    },
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
