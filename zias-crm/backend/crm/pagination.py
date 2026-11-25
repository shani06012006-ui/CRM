from django.db.models import Sum
from rest_framework.pagination import PageNumberPagination


class LeadPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 200

    def paginate_queryset(self, queryset, request, view=None):
        # Total value across the whole filtered set, not just this page
        self.total_value = queryset.aggregate(t=Sum('value'))['t'] or 0
        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        response.data['total_value'] = float(self.total_value)
        return response