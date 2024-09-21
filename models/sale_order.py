# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import datetime


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    @api.model
    def get_sale_order_data(self):
        return {
            'test': 'Test data from sale order'
        }