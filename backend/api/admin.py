from django.contrib import admin
from import_export.admin import  ImportExportModelAdmin
from .models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ['email']

admin.site.register(User, UserAdmin)

class BookingAdmin(admin.ModelAdmin):
    list_display = ['id','passenger_name','flightname']

admin.site.register(Booking, BookingAdmin)

class HotelBookingAdmin(admin.ModelAdmin):
    list_display = ['name','hotel_name','check_in_date', 'check_out_date']

admin.site.register(HotelBooking, HotelBookingAdmin)

class HotelAdmin(ImportExportModelAdmin):
    list_display = ['hotel_name', 'location_city', 'rating']  # Customize the fields displayed in the list view

admin.site.register(Hotel, HotelAdmin)
